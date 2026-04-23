import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import useAuth from "../../hooks/useAuth";
import { sendOtp, verifyOtp } from "../../services/authService";
import { validateOtp } from "../../utils/validators";
import styles from "./AuthPages.module.css";

const OTP_LENGTH = 6;
const PENDING_REG_EMAIL_KEY = "medisync_pending_registration_email";

const OtpVerification = () => {
  const [otpDigits, setOtpDigits] = useState(() => Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const location = useLocation();
  const navigate = useNavigate();
  const { completeAuthSession } = useAuth();
  const inputRefs = useRef([]);
  const email = location.state?.email || localStorage.getItem(PENDING_REG_EMAIL_KEY) || "";
  const otp = otpDigits.join("");

  useEffect(() => {
    if (resendCountdown <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  const handleOtpInputChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    const nextDigits = [...otpDigits];
    nextDigits[index] = cleaned.slice(-1);
    setOtpDigits(nextDigits);
    setError("");

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) {
      return;
    }

    const nextDigits = Array(OTP_LENGTH)
      .fill("")
      .map((_, index) => pasted[index] || "");

    setOtpDigits(nextDigits);
    setError("");

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    const otpError = validateOtp(otp);

    if (otpError) {
      setError(otpError);
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const authData = await verifyOtp({ otp, email, purpose: "registration" });
      const authenticatedUser = completeAuthSession(authData, { email, role: "patient" });
      localStorage.removeItem(PENDING_REG_EMAIL_KEY);

      setAlert({
        type: "success",
        message: "OTP verified successfully. Completing your onboarding...",
      });

      const nextPath = authenticatedUser?.role === "patient" ? "/onboarding-survey" : "/home";
      navigate(nextPath, { replace: true });
    } catch (requestError) {
      setAlert({
        type: "error",
        message:
          requestError?.response?.data?.message ||
          requestError?.message ||
          "OTP verification failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) {
      return;
    }

    if (!email) {
      setAlert({
        type: "error",
        message: "Email is missing. Please register again to request OTP.",
      });
      return;
    }

    setLoading(true);

    try {
      await sendOtp({ email, purpose: "registration" });

      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setResendCountdown(30);

      setAlert({
        type: "success",
        message: "A new OTP has been sent to your email.",
      });
    } catch (requestError) {
      setAlert({
        type: "error",
        message:
          requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to resend OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <aside className={styles.infoPanel}>
          <p className={styles.brand}>MediSync Digital Health</p>
          <h1 className={styles.infoTitle}>OTP verification for secure access.</h1>
          <p className={styles.infoText}>
            Enter your 6-digit code to verify account ownership before accessing healthcare data.
          </p>
          <div className={styles.infoBadge}>One-time passcodes help protect sensitive patient data.</div>
        </aside>

        <section className={styles.formPanel}>
          <h2 className={styles.heading}>Verify OTP</h2>
          <p className={styles.subHeading}>
            Enter the 6-digit code sent to your email{email ? ` (${email})` : ""}.
          </p>

          {alert ? (
            <div
              className={`${styles.alert} ${
                alert.type === "success" ? styles.successAlert : styles.errorAlert
              }`}
              role="alert"
            >
              {alert.message}
            </div>
          ) : null}

          <form className={styles.form} onSubmit={handleVerify} noValidate>
            <div className={styles.otpWrap}>
              <label className={styles.selectLabel} htmlFor="otp-input-0">
                OTP<span className={styles.required}>*</span>
              </label>

              <div className={styles.otpRow} onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={`otp-${index}`}
                    id={`otp-input-${index}`}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    value={digit}
                    maxLength={1}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className={`${styles.otpInput} ${digit ? styles.otpInputFilled : ""}`}
                    onChange={(event) => handleOtpInputChange(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>

              {error ? <p className={styles.errorText}>{error}</p> : null}
            </div>

            <Button type="submit" loading={loading}>
              Verify
            </Button>

            <button
              type="button"
              className={styles.textButton}
              onClick={handleResendOtp}
              disabled={resendCountdown > 0}
            >
              {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : "Resend OTP"}
            </button>
          </form>

          <p className={styles.footerText}>
            Need to change email? <Link to="/register">Go to Register</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default OtpVerification;