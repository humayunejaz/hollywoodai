
"use client";

import "./dashboard.css";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";

import { auth } from "../../lib/firebase";

import {
  getSelectedMovies,
  getTopMovies,
} from "../../lib/movies";

import { useSubscription } from "../../hooks/useSubscription";

import MovieCard from "../../components/MovieCard";
import { MovieCardSkeleton } from "../../components/Skeleton";

import type { Movie } from "../../types/movie";

export default function DashboardPage() {
  const router = useRouter();

  const {
    isSubscribed,
    loading: subscriptionLoading,
  } = useSubscription();

  const [user, setUser] = useState<User | null>(null);

  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [topMovies, setTopMovies] = useState<Movie[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Listen for Firebase authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch movies from the API
  useEffect(() => {
    let active = true;

    async function loadMovies() {
      try {
        const [selected, top] = await Promise.all([
          getSelectedMovies(),
          getTopMovies(),
        ]);

        if (!active) return;

        setSelectedMovies(selected);
        setTopMovies(top);
      } catch (err) {
        if (!active) return;

        console.error("Failed to load movies:", err);

        setError(
          "Unable to load movies. Please try again."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadMovies();

    return () => {
      active = false;
    };
  }, []);

  // Log out of Firebase
  async function handleLogout() {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Unable to log out. Please try again.");
    }
  }

  const isLoading = loading || subscriptionLoading;

  return (
    <main className="dashboard">

      {/* Dashboard Header */}
      <header className="dashboard__header">
        <h1>HollywoodAI</h1>

        {user ? (
          <div className="dashboard__user">
  <span>
    {user.isAnonymous ? "Guest" : user.email}
  </span>
</div>
        ) : (
          <span>Browsing as a visitor</span>
        )}
      </header>

      {/* Skeleton Loading */}
      {isLoading ? (
        <div
          role="status"
          aria-label="Loading movies"
        >
          <section className="dashboard__section">
            <h2>Selected Movies</h2>

            <div className="movie-carousel">
              <MovieCardSkeleton count={6} />
            </div>
          </section>

          <section className="dashboard__section">
            <h2>Top Movies</h2>

            <div className="movie-carousel">
              <MovieCardSkeleton count={6} />
            </div>
          </section>
        </div>
      ) : error ? (

        /* API Error */
        <p role="alert" className="dashboard__error">
          {error}
        </p>

      ) : (

        /* Loaded Movie Sections */
        <>
          {/* Selected Movies */}
          <section className="dashboard__section">
            <h2>Selected Movies</h2>

            <div className="movie-carousel">
              {selectedMovies.length > 0 ? (
                selectedMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isSubscribed={isSubscribed}
                  />
                ))
              ) : (
                <p>No selected movies available.</p>
              )}
            </div>
          </section>

          {/* Top Movies */}
          <section className="dashboard__section">
            <h2>Top Movies</h2>

            <div className="movie-carousel">
              {topMovies.length > 0 ? (
                topMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isSubscribed={isSubscribed}
                  />
                ))
              ) : (
                <p>No top movies available.</p>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
