
import { NextRequest, NextResponse } from "next/server";

import { getAdminAuth, getAdminDb } from "../../../../lib/firebase-admin";
import { getMovieById } from "../../../../lib/movies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function json(
  body: object,
  status: number
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Vary: "Authorization",
    },
  });
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  // 1. Require a Firebase ID token.
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return json(
      { error: "Authentication required." },
      401
    );
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return json(
      { error: "Authentication required." },
      401
    );
  }

  let uid: string;

  try {
    const decoded = await getAdminAuth().verifyIdToken(
      token,
      true
    );

    uid = decoded.uid;
  } catch {
    return json(
      { error: "Invalid or expired authentication token." },
      401
    );
  }

  // 2. Validate movie ID and load its details.
  const { id } = await context.params;

  if (!id || id.length > 128) {
    return json(
      { error: "Invalid movie ID." },
      400
    );
  }

  let movie;

  try {
    movie = await getMovieById(id);
  } catch (error) {
    console.error("Server movie fetch failed:", error);

    return json(
      { error: "Unable to load movie." },
      502
    );
  }

  if (!movie) {
    return json(
      { error: "Movie not found." },
      404
    );
  }

  // 3. Only premium movies require a subscription.
  if (movie.subscriptionRequired) {
    try {
      const subscriptionRef = getAdminDb()
        .collection("users")
        .doc(uid)
        .collection("subscription")
        .doc("current");

      const snapshot = await subscriptionRef.get();
      const subscription = snapshot.data();

      const validPlan =
        subscription?.plan === "premium" ||
        subscription?.plan === "vip";

      const periodEnd = Number(
        subscription?.currentPeriodEnd
      );

      const hasAccess =
        validPlan &&
        subscription?.status === "active" &&
        subscription?.hasAccess === true &&
        Number.isFinite(periodEnd) &&
        periodEnd > Date.now() / 1000;

      if (!hasAccess) {
        return json(
          {
            error:
              "An active Premium or VIP+ subscription is required.",
          },
          403
        );
      }
    } catch (error) {
      console.error(
        "Server subscription verification failed:",
        error
      );

      return json(
        { error: "Unable to verify subscription." },
        503
      );
    }
  }

  // 4. Return the movie only after authorization.
  return json(movie, 200);
}
