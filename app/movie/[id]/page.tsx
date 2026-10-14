
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { useSubscription } from "../../../hooks/useSubscription";
import { useAuthModal } from "../../../components/AuthModalProvider";
import { MovieDetailsSkeleton } from "../../../components/Skeleton";

import type { Movie } from "../../../types/movie";

import "./movie.css";

// The details page only needs public movie fields.
type MoviePreview = Pick<
  Movie,
  | "id"
  | "title"
  | "director"
  | "imageLink"
  | "rating"
  | "releaseYear"
  | "type"
  | "tags"
  | "movieDescription"
  | "subscriptionRequired"
>;

export default function MovieDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { openAuth } = useAuthModal();

  const {
    user,
    isSubscribed,
    loading: authLoading,
  } = useSubscription();

  const [movie, setMovie] = useState<MoviePreview | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch only public movie details from our API.
  useEffect(() => {
    if (!params.id) return;

    const controller = new AbortController();
    let active = true;

    async function loadMovie() {
      setLoading(true);
      setError("");
      setMovie(null);

      try {
        const response = await fetch(
          `/api/movies/${encodeURIComponent(params.id)}/preview`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Movie not found."
              : "Unable to load movie details."
          );
        }

        const data: MoviePreview = await response.json();

        if (active) {
          setMovie(data);
        }
      } catch (err) {
        if (!active || controller.signal.aborted) {
          return;
        }

        console.error("Error loading movie:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load movie details."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadMovie();

    return () => {
      active = false;
      controller.abort();
    };
  }, [params.id]);

  function handleSummarise() {
    if (!movie || authLoading) return;

    // Login required to open the player.
    if (!user) {
      openAuth("login");
      return;
    }

    // Redirect Basic users to pricing for Premium movies.
    if (movie.subscriptionRequired && !isSubscribed) {
      router.push("/plans");
      return;
    }

    // The player performs server-side authorization again.
    router.push(`/player/${movie.id}`);
  }

  if (loading || authLoading) {
    return (
      <main className="movie-page">
        <div className="movie-container">
          <MovieDetailsSkeleton />
        </div>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="movie-page">
        <div className="movie-container">
          <p role="alert">
            {error || "Movie not found."}
          </p>

          <Link href="/dashboard" className="movie-back">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="movie-page">
      <div className="movie-container">
        <Link href="/dashboard" className="movie-back">
          ← Back to Dashboard
        </Link>

        <div className="movie-content">

          {/* Movie Information */}
          <div className="movie-info">
            <h1 className="movie-title">
              {movie.title}
            </h1>

            <p className="movie-director">
              {movie.director}
            </p>

            <div className="movie-meta">
              <span>⭐ {movie.rating}/10</span>
              <span>{movie.releaseYear}</span>
              <span>{movie.type}</span>
            </div>

            <div className="movie-tags">
              {movie.tags?.map((tag) => (
                <span key={tag} className="movie-tag">
                  {tag}
                </span>
              ))}
            </div>

            {movie.subscriptionRequired && (
              <span className="movie-premium">
                Premium
              </span>
            )}

            <button
              type="button"
              className="movie-summarise"
              onClick={handleSummarise}
              disabled={authLoading}
            >
              Summarise →
            </button>

            <section className="movie-description">
              <h2>What's it about?</h2>
              <p>{movie.movieDescription}</p>
            </section>
          </div>

          {/* Movie Poster */}
          <div className="movie-poster">
            <img
              src={movie.imageLink}
              alt={`${movie.title} poster`}
            />
          </div>

        </div>
      </div>
    </main>
  );
}
