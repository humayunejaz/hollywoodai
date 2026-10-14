
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import Link from "next/link";

import { auth } from "../../lib/firebase";
import { useAuthModal } from "../../components/AuthModalProvider";

import "./plans.css";

type PlanId = "premium" | "vip";

const plans = [
  {
    id: "premium" as PlanId,
    name: "Premium",
    price: "$9.99",
    period: "/month",
    description: "Flexible monthly billing.",
    features: [
      "Unlimited movie summaries",
      "Read or listen to summaries",
      "Access to premium movies",
      "Cancel anytime",
    ],
  },
  {
    id: "vip" as PlanId,
    name: "VIP+",
    price: "$89.99",
    period: "/year",
    description: "Save with annual billing.",
    features: [
      "Unlimited movie summaries",
      "Read or listen to summaries",
      "Access to premium movies",
      "Annual billing discount",
    ],
  },
];

const faqs = [
  {
    question: "What is HollywoodAI Premium?",
    answer:
      "Premium provides access to movie summaries and audio content, including movies marked as premium.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes. Cancellation management will be available after Stripe integration is completed.",
  },
  {
    question: "What is the difference between Premium and VIP+?",
    answer:
      "Both offer the same movie access. Premium is billed monthly, while VIP+ is billed annually at a lower effective monthly price.",
  },
  {
    question: "Can I use HollywoodAI for free?",
    answer:
      "Yes. Free movie summaries are available without a paid subscription, subject to the app's login requirements.",
  },
];

export default function PlansPage() {
  const { openAuth } = useAuthModal();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedPlan, setSelectedPlan] =
    useState<PlanId>("vip");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [message, setMessage] = useState("");
  const [checkoutLoading, setCheckoutLoading] =
  useState<PlanId | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
  }, []);

  
async function handleSubscribe(planId: PlanId) {
  if (checkoutLoading || checkingAuth) return;

  setSelectedPlan(planId);
  setMessage("");

  if (!user) {
    openAuth("login");
    return;
  }

  if (user.isAnonymous) {
    setMessage(
      "Guest accounts cannot purchase subscriptions. " +
      "Please log out and register a permanent account."
    );
    return;
  }

  setCheckoutLoading(planId);

  try {
    // Retrieve the current user's Firebase ID token
    const token = await user.getIdToken();

    // Request a Checkout session from our backend
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ planId }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Unable to start checkout."
      );
    }

    // Stripe returns a hosted Checkout URL
    if (
      typeof result.url !== "string" ||
      !result.url.startsWith("https://checkout.stripe.com/")
    ) {
      throw new Error("Invalid Stripe Checkout URL.");
    }

    // Redirect the user to Stripe
    window.location.assign(result.url);
  } catch (error) {
    console.error("Checkout error:", error);

    setMessage(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again."
    );
  } finally {
    setCheckoutLoading(null);
  }
}


  return (
    <main className="plans-page">
      <div className="plans-container">

        <Link href="/dashboard" className="plans-back">
          ← Back to Dashboard
        </Link>

        <header className="plans-header">
          <span className="plans-eyebrow">
            HOLLYWOODAI PREMIUM
          </span>

          <h1>Choose your plan</h1>

          <p>
            Unlock unlimited access to premium movie
            summaries and audio content.
          </p>
        </header>

        <section
          className="plans-grid"
          aria-label="Subscription plans"
        >
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`plan-card ${
                selectedPlan === plan.id
                  ? "plan-card--selected"
                  : ""
              }`}
            >
              {plan.id === "vip" && (
                <span className="plan-popular">
                  Best Value
                </span>
              )}

              <h2>{plan.name}</h2>

              <p className="plan-description">
                {plan.description}
              </p>

              <div className="plan-price">
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              
<button
  type="button"
  className="plan-button"
  disabled={checkingAuth || checkoutLoading !== null}
  onClick={() => void handleSubscribe(plan.id)}
>
  {checkingAuth
    ? "Checking account..."
    : checkoutLoading === plan.id
      ? "Redirecting to Stripe..."
      : `Choose ${plan.name}`}
</button>

            </article>
          ))}
        </section>

        {message && (
          <p className="plans-message" role="status">
            {message}
          </p>
        )}

        <p className="plans-payment-note">
          Payments are not enabled yet. This is a
          subscription page preview.
        </p>

        <section className="plans-faq">
          <h2>Frequently Asked Questions</h2>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={faq.question} className="faq-item">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() =>
                    setOpenFaq(
                      openFaq === index ? null : index
                    )
                  }
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span>{faq.question}</span>

                  <span aria-hidden="true">
                    {openFaq === index ? "−" : "+"}
                  </span>
                </button>

                {openFaq === index && (
                  <p
                    id={`faq-answer-${index}`}
                    className="faq-answer"
                  >
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
