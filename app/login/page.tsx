
"use client";

import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      router.push("/dashboard");
    } catch (err: unknown) {
      const code =
        typeof err === "object" &&
        err !== null &&
        "code" in err
          ? String(err.code)
          : "";

      switch (code) {
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Invalid email or password.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Check your connection.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h1>Welcome Back!</h1>
        <p>Log in to HollywoodAI</p>

        {error && (
          <p
            role="alert"
            style={{
              color: "#b91c1c",
              backgroundColor: "#fee2e2",
              padding: "12px",
              borderRadius: "6px",
            }}
          >
            {error}
          </p>
        )}

        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "12px",
            border: "1px solid #aaa",
            borderRadius: "6px",
          }}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "12px",
            border: "1px solid #aaa",
            borderRadius: "6px",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            backgroundColor: "#6042D9",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p>
          Don't have an account?{" "}
          <Link href="/register">Register here</Link>
        </p>
      </form>
    </main>
  );
}
