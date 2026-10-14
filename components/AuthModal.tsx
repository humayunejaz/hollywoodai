
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";

type AuthMode = "login" | "register";

type AuthModalProps = {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  closeAuth: () => void;
};

export default function AuthModal({
  mode,
  setMode,
  closeAuth,
}: AuthModalProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (!modalRef.current) return;

      if (e.key === "Escape") {
        if (!loadingRef.current) closeAuth();
        return;
      }

      if (e.key !== "Tab") return;

      const elements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'
        )
      );

      if (!elements.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [closeAuth]);

  function changeMode(newMode: AuthMode) {
    setError("");
    setSuccess("");
    setPassword("");
    setResetMode(false);
    setMode(newMode);
  }

  function getErrorCode(err: unknown): string {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err
    ) {
      return String(err.code);
    }
    return "";
  }

  function showAuthError(err: unknown) {
    const code = getErrorCode(err);

    switch (code) {
      case "auth/email-already-in-use":
        setError("This email is already registered.");
        break;

      case "auth/invalid-email":
        setError("Please enter a valid email address.");
        break;

      case "auth/weak-password":
        setError("Please choose a stronger password.");
        break;

      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        setError("Invalid email or password.");
        break;

      case "auth/too-many-requests":
        setError("Too many attempts. Please try again later.");
        break;

      case "auth/network-request-failed":
        setError("Network error. Check your connection.");
        break;

      case "auth/operation-not-allowed":
        setError("This login method is not enabled in Firebase.");
        break;

      case "auth/unauthorized-domain":
        setError("This domain is not authorized in Firebase.");
        break;

      case "auth/popup-blocked":
        setError("Allow popups in your browser and try again.");
        break;

      case "auth/popup-closed-by-user":
        setError("Google sign-in was cancelled.");
        break;

      case "auth/account-exists-with-different-credential":
        setError("This email uses another sign-in method.");
        break;

      default:
        setError("Something went wrong. Please try again.");
    }
  }

  function redirectToDashboard() {
    closeAuth();
    router.push("/dashboard");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loadingRef.current) return;

    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (mode === "register" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      if (mode === "register") {
        await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          password
        );
      } else {
        await signInWithEmailAndPassword(
          auth,
          trimmedEmail,
          password
        );
      }

      redirectToDashboard();
    } catch (err: unknown) {
      showAuthError(err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (loadingRef.current) return;

    setError("");
    setSuccess("");
    loadingRef.current = true;
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      await signInWithPopup(auth, provider);

      redirectToDashboard();
    } catch (err: unknown) {
      showAuthError(err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  async function handleGuestLogin() {
    if (loadingRef.current) return;

    setError("");
    setSuccess("");
    loadingRef.current = true;
    setLoading(true);

    try {
      await signInAnonymously(auth);

      redirectToDashboard();
    } catch (err: unknown) {
      showAuthError(err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    if (loadingRef.current) return;

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());

      setSuccess(
        "If an account exists for this email, a password reset link will be sent."
      );
    } catch (err: unknown) {
      const code = getErrorCode(err);

      if (code === "auth/invalid-email") {
        setError("Please enter a valid email.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else {
        setError("Unable to process the request. Try again.");
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  return createPortal(
    <div
      className="auth-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) {
          closeAuth();
        }
      }}
    >
      <div
        ref={modalRef}
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          ref={closeRef}
          type="button"
          className="auth-close"
          onClick={closeAuth}
          disabled={loading}
          aria-label="Close authentication"
        >
          &times;
        </button>

        <h2 id="auth-title" className="auth-title">
          {resetMode
            ? "Reset Your Password"
            : mode === "login"
              ? "Log in to HollywoodAI"
              : "Sign up for HollywoodAI"}
        </h2>

        <p className="auth-subtitle">
          {resetMode
            ? "Enter your email to receive a reset link."
            : mode === "login"
              ? "Welcome back! Enter your details below."
              : "Create an account to start exploring."}
        </p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success" role="status">
            {success}
          </div>
        )}

        {resetMode ? (
          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              void handlePasswordReset();
            }}
          >
            <label htmlFor="auth-reset-email">
              Email address
            </label>

            <input
              id="auth-reset-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              className="auth-text-button"
              disabled={loading}
              onClick={() => {
                setResetMode(false);
                setError("");
                setSuccess("");
              }}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >
              <label htmlFor="auth-email">
                Email
              </label>

              <input
                id="auth-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <label htmlFor="auth-password">
                Password
              </label>

              <input
                id="auth-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "register" ? 6 : undefined}
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
              />

              {mode === "login" && (
                <button
                  type="button"
                  className="auth-text-button auth-forgot"
                  disabled={loading}
                  onClick={() => {
                    setResetMode(true);
                    setError("");
                    setSuccess("");
                  }}
                >
                  Forgot Password?
                </button>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Log In"
                    : "Register"}
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="auth-alternatives">
              <button
                type="button"
                className="auth-alternative-button"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                Continue with Google
              </button>

              <button
                type="button"
                className="auth-alternative-button"
                onClick={handleGuestLogin}
                disabled={loading}
              >
                Login as Guest
              </button>
            </div>

            <p className="auth-switch">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
              {" "}
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  changeMode(
                    mode === "login" ? "register" : "login"
                  )
                }
              >
                {mode === "login" ? "Register" : "Log In"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
