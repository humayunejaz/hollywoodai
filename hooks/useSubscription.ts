
"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  doc,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";

import { auth } from "../lib/firebase";

type SubscriptionPlan = "basic" | "premium" | "vip";

export function useSubscription() {
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan>("basic");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribeSubscription: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (currentUser) => {
        unsubscribeSubscription?.();
        unsubscribeSubscription = undefined;

        setUser(currentUser);
        setPlan("basic");
        setIsSubscribed(false);
        setError("");

        if (!currentUser) {
          setLoading(false);
          return;
        }

        setLoading(true);

        const db = getFirestore();

        const subscriptionRef = doc(
          db,
          "users",
          currentUser.uid,
          "subscription",
          "current"
        );

        unsubscribeSubscription = onSnapshot(
          subscriptionRef,
          (snapshot) => {
            const data = snapshot.data();

            if (!data) {
              setPlan("basic");
              setIsSubscribed(false);
              setLoading(false);
              return;
            }

            const validPlan =
              data.plan === "premium" || data.plan === "vip";

            const periodEnd = Number(data.currentPeriodEnd);

            const active =
              validPlan &&
              data.status === "active" &&
              data.hasAccess === true &&
              Number.isFinite(periodEnd) &&
              periodEnd > Date.now() / 1000;

            setIsSubscribed(active);
            setPlan(active ? data.plan : "basic");
            setLoading(false);
          },
          (err) => {
            console.error("Subscription read failed:", err);

            setError("Unable to verify subscription.");
            setIsSubscribed(false);
            setPlan("basic");
            setLoading(false);
          }
        );
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeSubscription?.();
    };
  }, []);

  return {
    user,
    plan,
    isSubscribed,
    loading,
    error,
  };
}
