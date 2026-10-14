
import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY in environment variables."
    );
  }

  if (!secretKey.startsWith("sk_test_")) {
    throw new Error(
      "HollywoodAI must use a Stripe test secret key."
    );
  }

  stripeClient = new Stripe(secretKey);

  return stripeClient;
}
