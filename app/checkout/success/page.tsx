
import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#101018",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        gap: "20px",
      }}
    >
      <h1>Checkout completed!</h1>

      <p style={{ maxWidth: "480px", lineHeight: 1.7 }}>
        You've returned from Stripe Checkout.
        Your subscription is awaiting server-side
        confirmation.
      </p>

      <p style={{ color: "#aaa", maxWidth: "480px" }}>
        Premium access is not enabled until the
        payment is verified and your subscription
        status is updated.
      </p>

      <Link
        href="/dashboard"
        style={{
          background: "#6042d9",
          color: "white",
          padding: "14px 24px",
          borderRadius: "8px",
          textDecoration: "none",
        }}
      >
        Return to Dashboard
      </Link>
    </main>
  );
}
