
import { loadEnvConfig } from "@next/env";
import Stripe from "stripe";
import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import {
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";

// Load local environment variables
loadEnvConfig(process.cwd());

async function main() {
  const subscriptionId = process.argv[2];

  if (!subscriptionId?.startsWith("sub_")) {
    throw new Error(
      "Provide a Stripe Subscription ID starting with sub_."
    );
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (
    !stripeKey?.startsWith("sk_test_") ||
    !projectId ||
    !clientEmail ||
    !privateKey
  ) {
    throw new Error("Missing Stripe or Firebase configuration.");
  }

  // 1. Retrieve the existing subscription directly from Stripe
  const stripe = new Stripe(stripeKey);
  const subscription =
    await stripe.subscriptions.retrieve(subscriptionId);

  console.log("Subscription status:", subscription.status);

  // 2. Identify the Firebase user
  const uid = subscription.metadata.firebaseUid;

  if (!uid) {
    throw new Error(
      "No Firebase UID found in subscription metadata. " +
      "Do not assign this subscription manually."
    );
  }

  // 3. Verify the selected plan
  const item = subscription.items.data[0];

  if (!item) {
    throw new Error("Subscription has no price item.");
  }

  let plan: "premium" | "vip";

  if (item.price.id === process.env.STRIPE_PREMIUM_PRICE_ID) {
    plan = "premium";
  } else if (
    item.price.id === process.env.STRIPE_VIP_PRICE_ID
  ) {
    plan = "vip";
  } else {
    throw new Error("Unknown Stripe subscription price.");
  }

  // 4. Confirm this subscription is currently eligible
  const periodEnd = item.current_period_end;
  const now = Math.floor(Date.now() / 1000);

  if (
    subscription.status !== "active" ||
    periodEnd <= now
  ) {
    throw new Error(
      "Subscription is not currently eligible for access."
    );
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  // 5. Connect to Firebase Admin
  const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });

  const db = getFirestore(app);

  // Verify that the Firebase user exists
  const { getAuth } = await import("firebase-admin/auth");
  await getAuth(app).getUser(uid);

  // 6. Write verified subscription data
  const ref = db
    .collection("users")
    .doc(uid)
    .collection("subscription")
    .doc("current");

  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    const previous = existing.data();

    if (
      previous?.stripeSubscriptionId &&
      previous.stripeSubscriptionId !== subscription.id
    ) {
      throw new Error(
        "Another subscription record already exists. " +
        "Review it before replacing anything."
      );
    }

    transaction.set(
      ref,
      {
        plan,
        status: subscription.status,
        hasAccess: true,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  console.log("Subscription successfully synchronized!");
  console.log("Plan:", plan);
  console.log("Status:", subscription.status);
  console.log("Access:", true);
  console.log("Firestore path:", ref.path);
}

main().catch((error) => {
  console.error("Sync failed:", error.message);
  process.exitCode = 1;
});
