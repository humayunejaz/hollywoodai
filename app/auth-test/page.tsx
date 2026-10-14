
"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";

export default function AuthTest() {
  const [status, setStatus] = useState("Checking Firebase...");

  useEffect(() => {
    if (auth.app.options.projectId) {
      setStatus(
        `Firebase initialized: ${auth.app.options.projectId}`
      );
    } else {
      setStatus("Firebase configuration is missing.");
    }
  }, []);

  return (
    <main style={{ padding: "40px" }}>
      <h1>Firebase Connection Test</h1>
      <p>{status}</p>
    </main>
  );
}
