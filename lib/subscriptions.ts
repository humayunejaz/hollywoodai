
import "server-only";

import type Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "./firebase-admin";
import { getStripe } from "./stripe";

export async function syncSubscription(
  subscriptionId: string
) {
  const stripe = getStripe();

  // Retrieve current state from Stripe.
  // This avoids trusting potentially old webhook payloads.
  const subscription =
    await stripe.subscriptions.retrieve(subscriptionId);

  const uid = subscription.metadata.firebaseUid;

  if (!uid) {
    throw new Error(
      `Subscription ${subscriptionId} has no Firebase UID`
    );
  }

  const firstItem = subscription.items.data[0];

  if (!firstItem) {
    throw new Error("Subscription has no items.");
  }

  const priceId = firstItem.price.id;

  let plan: "premium" | "vip";

  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
    plan = "premium";
  } else if (priceId === process.env.STRIPE_VIP_PRICE_ID) {
    plan = "vip";
  } else {
    throw new Error(
      `Unrecognized Stripe price on subscription ${subscriptionId}`
    );
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const periodEnd = firstItem.current_period_end;

  const status = subscription.status;

  // This demo grants access only to active subscriptions.
  // Trialing users are excluded because no trial is configured.
  const hasAccess =
    status === "active" &&
    periodEnd > Math.floor(Date.now() / 1000);

  const ref = getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("subscription")
    .doc("current");

  // Prevent an older subscription from replacing a
  // different active subscription on the same account.
  await getAdminDb().runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);

    const existingData = existing.data();

    if (
      existingData?.stripeSubscriptionId &&
      existingData.stripeSubscriptionId !== subscriptionId &&
      existingData.status === "active" &&
      existingData.currentPeriodEnd > Date.now() / 1000
    ) {
      throw new Error(
        "User already has a different active subscription."
      );
    }

    transaction.set(
      ref,
      {
        plan,
        status,
        hasAccess,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  console.log(
    `Subscription synchronized: ${subscription.id}, ` +
    `user=${uid}, status=${status}, plan=${plan}`
  );
}
