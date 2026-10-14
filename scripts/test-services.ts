
import { loadEnvConfig } from "@next/env";
import Stripe from "stripe";

import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Load .env.local
loadEnvConfig(process.cwd());

async function main() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;

  if (
    !stripeKey?.startsWith("sk_test_") ||
    !projectId ||
    !clientEmail ||
    !privateKey ||
    !priceId
  ) {
    throw new Error("Missing or invalid configuration.");
  }

  // Verify Stripe credentials and monthly price
  const stripe = new Stripe(stripeKey);
  const price = await stripe.prices.retrieve(priceId);

  if (
    price.type !== "recurring" ||
    price.recurring?.interval !== "month"
  ) {
    throw new Error("Premium Price ID is not monthly.");
  }

  console.log("Stripe test connection: OK");
  console.log("Premium monthly price: OK");

  // Verify Firebase Admin and Firestore access
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
  await db.listCollections();

  console.log("Firebase Admin connection: OK");
  console.log("Firestore connection: OK");
}

main().catch((error) => {
  console.error("Service test failed:", error.message);
  process.exitCode = 1;
});
