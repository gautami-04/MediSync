import { createContext, useCallback, useMemo, useState } from "react";
import { loginUser } from "../services/authService";

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

	const login = useCallback(
		async (credentials) => {
			setAuthLoading(true);
			try {
				const data = await loginUser(credentials);
				const nextToken =
					data?.token || data?.accessToken || data?.data?.token || data?.data?.accessToken;
				const nextUser =
					data?.user || data?.data?.user || { email: credentials.email, role: "patient" };

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
