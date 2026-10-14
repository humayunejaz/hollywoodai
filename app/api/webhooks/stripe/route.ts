
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "../../../../lib/stripe";
import { syncSubscription } from "../../../../lib/subscriptions";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing webhook configuration." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Stripe requires the ORIGINAL, unmodified request body.
    const rawBody = await request.text();

    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    );
  }

  try {
    let subscriptionId: string | null = null;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (typeof session.subscription === "string") {
          subscriptionId = session.subscription;
        } else if (session.subscription) {
          subscriptionId = session.subscription.id;
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        subscriptionId = subscription.id;
        break;
      }

      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        const parentSubscription =
          invoice.parent?.subscription_details?.subscription;

        if (typeof parentSubscription === "string") {
          subscriptionId = parentSubscription;
        } else if (parentSubscription) {
          subscriptionId = parentSubscription.id;
        }

        break;
      }

      default:
        console.log("Ignoring event:", event.type);
    }

    if (subscriptionId) {
      await syncSubscription(subscriptionId);
    } else {
      console.log(
        `No subscription to synchronize for ${event.type}`
      );
    }

    console.log(
      `Webhook handled: ${event.type} (${event.id})`
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);

    // A 500 response allows Stripe to retry delivery.
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
