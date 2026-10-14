
import { NextResponse } from "next/server";

import { getMovieById } from "../../../../../lib/movies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params;

  if (!id || id.length > 128) {
    return NextResponse.json(
      { error: "Invalid movie ID." },
      { status: 400 }
    );
  }

  try {
    const movie = await getMovieById(id);

    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found." },
        { status: 404 }
      );
    }

    // Explicitly allow only public movie information.
    // Never include summary or audioLink here.
    const preview = {
      id: movie.id,
      title: movie.title,
      director: movie.director,
      imageLink: movie.imageLink,
      rating: movie.rating,
      releaseYear: movie.releaseYear,
      type: movie.type,
      tags: movie.tags,
      movieDescription: movie.movieDescription,
      subscriptionRequired: movie.subscriptionRequired,
    };

    return NextResponse.json(preview, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Movie preview failed:", error);

    return NextResponse.json(
      { error: "Unable to load movie preview." },
      { status: 502 }
    );
  }
}
