
"use client";

import { useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(
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
        case "auth/email-already-in-use":
          setError("An account with this email already exists.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Please choose a stronger password.");
          break;
        case "auth/operation-not-allowed":
          setError("Email/password registration is not enabled.");
          break;
        default:
          setError("Registration failed. Please try again.");
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
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <form
        onSubmit={handleRegister}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h1>Create your HollywoodAI account</h1>

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
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
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
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </main>
  );
}
