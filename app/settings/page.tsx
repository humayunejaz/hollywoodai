
"use client";

import Link from "next/link";
import { useSubscription } from "../../hooks/useSubscription";
import { useAuthModal } from "../../components/AuthModalProvider";

import "./settings.css";

export default function SettingsPage() {
  const { openAuth } = useAuthModal();

  const {
    user,
    plan,
    isSubscribed,
    loading,
    error,
  } = useSubscription();

  if (loading) {
    return (
      <main className="settings-page">
        <div className="settings-container">
          <div className="settings-skeleton" />
          <div className="settings-skeleton" />
        </div>
      </main>
    );
  }

  // User is not logged in
  if (!user) {
    return (
      <main className="settings-page">
        <div className="settings-container">
          <Link
            href="/dashboard"
            className="settings-back"
          >
            ← Back to Dashboard
          </Link>

          <div className="settings-logged-out">
            <div className="settings-login-icon">
              🔒
            </div>

            <h1>Sign in to see your account settings</h1>

            <p>
              Log in to view your account details
              and subscription plan.
            </p>

            <button
              type="button"
              className="settings-button"
              onClick={() => openAuth("login")}
            >
              Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  const planName = error
  ? "Unable to verify"
  : plan === "vip"
    ? "VIP+"
    : plan === "premium"
      ? "Premium"
      : "Basic";

  return (
    <main className="settings-page">
      <div className="settings-container">

        <Link
          href="/dashboard"
          className="settings-back"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="settings-title">
          Account Settings
        </h1>

        {error && (
          <p role="alert" className="settings-error">
            {error}
          </p>
        )}

        {/* Subscription Details */}
        <section className="settings-card">
          <h2>Your Subscription Plan</h2>

          <div className="settings-plan">
            <span className="settings-plan-name">
              {planName}
            </span>

            <span
              className={`settings-status ${
                isSubscribed
                  ? "settings-status--active"
                  : ""
              }`}
            >
              {error
  ? "Unavailable"
  : isSubscribed
    ? "Active"
    : "Basic"}
            </span>
          </div>

          <p className="settings-description">
            {isSubscribed
              ? "You have access to premium movie summaries and audio."
              : "Upgrade your account to unlock premium movie summaries."}
          </p>

          {!isSubscribed && (
            <Link
              href="/plans"
              className="settings-button"
            >
              Upgrade ⚡
            </Link>
          )}
        </section>

        {/* Account Information */}
        <section className="settings-card">
          <h2>Account Information</h2>

          <div className="settings-detail">
            <span>Email Address</span>

            <strong>
              {user.isAnonymous
                ? "Guest Account"
                : user.email || "No email available"}
            </strong>
          </div>

          <div className="settings-detail">
            <span>Account Type</span>

            <strong>
              {user.isAnonymous
                ? "Guest"
                : "Registered"}
            </strong>
          </div>
        </section>

      </div>
    </main>
  );
}
