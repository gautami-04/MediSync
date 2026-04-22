import { createContext, useCallback, useMemo, useState, useEffect } from "react";
import { loginUser } from "../services/authService";
import { getMe } from "../services/user.service";

const TOKEN_KEY = "medisync_token";
const USER_KEY = "medisync_user";

const safeGetItem = (key) => {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
};

const safeSetItem = (key, value) => {
	try {
		localStorage.setItem(key, value);
	} catch {
		// Ignore storage write failures to keep UI functional.
	}
};

const safeRemoveItem = (key) => {
	try {
		localStorage.removeItem(key);
	} catch {
		// Ignore storage deletion failures to keep UI functional.
	}
};

const readStoredToken = () => {
	const rawToken = safeGetItem(TOKEN_KEY);

	if (!rawToken || rawToken === "undefined" || rawToken === "null") {
		return "";
	}

	return String(rawToken);
};

const readStoredUser = () => {
	try {
		const rawUser = safeGetItem(USER_KEY);
		return rawUser ? JSON.parse(rawUser) : null;
	} catch {
		return null;
	}
};

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(() => readStoredToken());
	const [user, setUser] = useState(() => readStoredUser());
	const [authLoading, setAuthLoading] = useState(false);

	const persistSession = useCallback((nextToken, nextUser) => {
		const normalizedToken = String(nextToken || "");
		setToken(normalizedToken);
		setUser(nextUser);
		safeSetItem(TOKEN_KEY, normalizedToken);
		safeSetItem(USER_KEY, JSON.stringify(nextUser));
	}, []);

	const clearSession = useCallback(() => {
		setToken("");
		setUser(null);
		safeRemoveItem(TOKEN_KEY);
		safeRemoveItem(USER_KEY);
	}, []);

	useEffect(() => {
		let mounted = true;

		const restoreProfile = async () => {
			if (!token) return;
			if (user) return; // already have a user

			try {
				const profile = await getMe();
				if (!mounted) return;
				setUser(profile);
				safeSetItem(USER_KEY, JSON.stringify(profile));
			} catch (err) {
				// Token may be invalid or expired; clear stored session to force re-login
				if (mounted) clearSession();
			}
		};

		restoreProfile();

		return () => {
			mounted = false;
		};
	}, [token]);

	const login = useCallback(
		async (credentials) => {
			setAuthLoading(true);
			try {
				const data = await loginUser(credentials);
				const nextToken =
					data?.token || data?.accessToken || data?.data?.token || data?.data?.accessToken;

				// Normalize user object from backend response
				let nextUser = data?.user || data?.data?.user || null;
				if (!nextUser && data) {
					nextUser = {
						_id: data._id || data.id || null,
						name: data.name || data.fullName || credentials.fullName || credentials.name || "",
						email: data.email || credentials.email || "",
						role: data.role || "patient",
					};
				}

				if (!nextToken) {
					throw new Error("Login succeeded but token was not returned.");
				}

				persistSession(nextToken, nextUser);
				return { success: true, data };
			} catch (error) {
				const message =
					error?.response?.data?.message ||
					error?.message ||
					"Unable to sign in. Please check your credentials.";

				return { success: false, message };
			} finally {
				setAuthLoading(false);
			}
		},
		[persistSession]
	);

	const logout = useCallback(() => {
		clearSession();
	}, [clearSession]);

	const contextValue = useMemo(
		() => ({
			token,
			user,
			isAuthenticated: Boolean(token),
			authLoading,
			login,
			logout,
		}),
		[token, user, authLoading, login, logout]
	);

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
