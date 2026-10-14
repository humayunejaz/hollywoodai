
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { searchMovies } from "../../lib/movies";
import { useSubscription } from "../../hooks/useSubscription";
import MovieCard from "../../components/MovieCard";
import { MovieCardSkeleton } from "../../components/Skeleton";

import type { Movie } from "../../types/movie";

import "./search.css";

function SearchContent() {
  const searchParams = useSearchParams();
const urlQuery = searchParams.get("q") || "";

const [query, setQuery] = useState(urlQuery);
const [debouncedQuery, setDebouncedQuery] = useState("");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    isSubscribed,
    loading: subscriptionLoading,
  } = useSubscription();
// Update the input when the URL search term changes.
useEffect(() => {
  setQuery(urlQuery);
}, [urlQuery]);
  // Wait 300ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery) {
      setMovies([]);
      setError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    async function fetchResults() {
      setLoading(true);
      setError("");
      setMovies([]);

      try {
        const results = await searchMovies(
          debouncedQuery,
          controller.signal
        );

        if (active) {
          setMovies(results);
        }
      } catch (err) {
        if (!active || controller.signal.aborted) {
          return;
        }

        console.error("Search error:", err);

        setError(
          "Unable to search movies. Please try again."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchResults();

    return () => {
      active = false;
      controller.abort();
    };
  }, [debouncedQuery]);

  // Show skeletons while typing, fetching, or checking subscription
  const searchPending = query.trim() !== debouncedQuery;

  const isLoading =
    loading ||
    searchPending ||
    subscriptionLoading;

  return (
    <main className="search-page">
      <div className="search-container">

        {/* Page Header */}
        <header className="search-header">
          <h1>Search Movies</h1>

          <p>
            Find movie summaries by title or director.
          </p>
        </header>

        {/* Search Input */}
        <div className="search-input-wrapper">
          <i
            className="fa-solid fa-magnifying-glass"
            aria-hidden="true"
          />

          <input
            type="search"
            className="search-input"
            placeholder="Search by title or director..."
            aria-label="Search movies"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => setQuery("")}
            >
              ×
            </button>
          )}
        </div>

        {/* Search Results */}
        <section
          className="search-results"
          aria-label="Movie search results"
          aria-busy={isLoading}
        >

          {/* Initial Empty State */}
          {!query.trim() ? (
            <div className="search-empty">
              <i
                className="fa-solid fa-film"
                aria-hidden="true"
              />

              <h2>Find your next movie</h2>

              <p>
                Start typing to discover movie summaries.
              </p>
            </div>
          ) : isLoading ? (

            /* Skeleton Loading */
            <div
              className="search-grid"
              role="status"
              aria-label="Searching movies"
            >
              <MovieCardSkeleton count={8} />
            </div>

          ) : error ? (

            /* API Error */
            <p className="search-error" role="alert">
              {error}
            </p>

          ) : movies.length === 0 ? (

            /* No Results */
            <div className="search-empty">
              <h2>No movies found</h2>

              <p>
                Try a different movie title or director.
              </p>
            </div>

          ) : (

            /* Movie Results */
            <>
              <h2 className="search-results-title">
                {movies.length}{" "}
                {movies.length === 1
                  ? "result"
                  : "results"}{" "}
                for &quot;{debouncedQuery}&quot;
              </h2>

              <div className="search-grid">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isSubscribed={isSubscribed}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="search-page">
          <div className="search-container">
            <div
              className="search-grid"
              role="status"
              aria-label="Loading search page"
            >
              <MovieCardSkeleton count={8} />
            </div>
          </div>
        </main>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
