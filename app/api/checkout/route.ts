
import { NextRequest, NextResponse } from "next/server";

import { getStripe } from "../../../lib/stripe";
import { getAdminAuth } from "../../../lib/firebase-admin";

export const runtime = "nodejs";

type PlanId = "premium" | "vip";

export async function POST(request: NextRequest) {
  try {
    // 1. Get the Firebase ID token from the request
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const token = authorization.slice(7);

    // 2. Verify the token on the server
    const decodedToken = await getAdminAuth().verifyIdToken(token);

    if (decodedToken.firebase.sign_in_provider === "anonymous") {
  return NextResponse.json(
    { error: "Create a permanent account before subscribing." },
    { status: 403 }
  );
}

    if (!decodedToken.uid) {
      return NextResponse.json(
        { error: "Invalid user session." },
        { status: 401 }
      );
    }

    // 3. Validate the selected plan
    let body: { planId?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const planId = body.planId;

    if (planId !== "premium" && planId !== "vip") {
      return NextResponse.json(
        { error: "Invalid subscription plan." },
        { status: 400 }
      );
    }

    // 4. Choose the Stripe price on the server
    const priceIds: Record<PlanId, string | undefined> = {
      premium: process.env.STRIPE_PREMIUM_PRICE_ID,
      vip: process.env.STRIPE_VIP_PRICE_ID,
    };

    const priceId = priceIds[planId];

    if (!priceId) {
      throw new Error(`Stripe price is missing for ${planId}`);
    }

    const stripe = getStripe();

    // 5. Create the Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      client_reference_id: decodedToken.uid,

      customer_email: decodedToken.email || undefined,

      metadata: {
        firebaseUid: decodedToken.uid,
        planId,
      },

      subscription_data: {
        metadata: {
          firebaseUid: decodedToken.uid,
          planId,
        },
      },

      success_url:
        `${request.nextUrl.origin}/checkout/success` +
        `?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${request.nextUrl.origin}/plans`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL.");
    }

    return NextResponse.json({
      url: session.url,
    });
  
} catch (error: unknown) {
  console.error("CHECKOUT ERROR DETAILS:", error);

  if (error instanceof Error) {
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
  }

  return NextResponse.json(
    { error: "Checkout failed. Check your VS Code terminal." },
    { status: 500 }
  );
}

}
