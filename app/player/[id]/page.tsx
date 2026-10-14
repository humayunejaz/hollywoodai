
"use client";
import { useSubscription } from "../../../hooks/useSubscription";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MoviePlayerSkeleton } from "../../../components/Skeleton";

import { getMovieById } from "../../../lib/movies";
import { auth } from "../../../lib/firebase";
import type { Movie } from "../../../types/movie";
import { useAuthModal } from "../../../components/AuthModalProvider";

import "./player.css";

const API_BASE =
  "https://advanced-internship-api-production.up.railway.app";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

export default function MoviePlayerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { openAuth } = useAuthModal();

  const audioRef = useRef<HTMLAudioElement>(null);

  const [movie, setMovie] = useState<Movie | null>(null);
  const {
  user,
  isSubscribed,
  loading: authLoading,
} = useSubscription();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState("");

 

  // Fetch the selected movie
  
// Fetch movie through the protected Next.js API
useEffect(() => {
  if (authLoading || !user || !params.id) {
    return;
  }

  const controller = new AbortController();
  let active = true;

  async function loadMovie() {
    setLoading(true);
    setError("");
    setMovie(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAudioError("");

    // Stop any audio from a previously loaded movie
    audioRef.current?.pause();

    try {
      // Retrieve the currently signed-in user's ID token
      const token = await user!.getIdToken();

      const response = await fetch(
        `/api/movies/${encodeURIComponent(params.id)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal: controller.signal,
        }
      );

      if (response.status === 401) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      if (response.status === 403) {
        throw new Error(
          "An active Premium subscription is required to access this movie."
        );
      }

      if (!response.ok) {
        throw new Error("Unable to load movie details.");
      }

      const data: Movie = await response.json();

      if (active) {
        setMovie(data);
      }
    } catch (err) {
      if (!active || controller.signal.aborted) {
        return;
      }

      console.error("Protected movie request failed:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load movie details.");
      }
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
}, [authLoading, user, params.id]);


  // Redirect unsigned-in users
  useEffect(() => {
    if (!authLoading && !user) {
      openAuth("login");
      router.replace(`/movie/${params.id}`);
    }
  }, [authLoading, user, openAuth, router, params.id]);

  // Audio duration and position
  function handleTimeUpdate() {
    const audio = audioRef.current;

    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  }

  function handleMetadataLoaded() {
    const audio = audioRef.current;

    if (audio && Number.isFinite(audio.duration)) {
      setDuration(audio.duration);
    }
  }

  // Play and pause
  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioError("");

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (err) {
      console.error("Playback failed:", err);
      setAudioError("Unable to play this audio file.");
    }
  }

  // Skip backward or forward
  function skipAudio(seconds: number) {
    const audio = audioRef.current;
    if (!audio) return;

    const maximum = Number.isFinite(audio.duration)
      ? audio.duration
      : 0;

    audio.currentTime = Math.max(
      0,
      Math.min(audio.currentTime + seconds, maximum)
    );

    setCurrentTime(audio.currentTime);
  }

  // Seek to any position in the audio
  function handleSeek(value: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;

    audio.currentTime = value;
    setCurrentTime(value);
  }

  
if (authLoading || (user && loading)) {
  return (
    <main className="player-page">
      <div className="player-container">
        <MoviePlayerSkeleton />
      </div>
    </main>
  );
}


  if (!user) {
    return (
      <main className="player-page">
        <p>Sign in to listen to movie summaries.</p>
        <Link href={`/movie/${params.id}`}>
          Back to Movie
        </Link>
      </main>
    );
  }

  
if (error || !movie) {
  const needsSubscription =
    error.includes("Premium subscription");

  return (
    <main className="player-page">
      <div className="player-container">
        <p role="alert">
          {error || "Movie not found."}
        </p>

        <Link
          href={needsSubscription ? "/plans" : "/dashboard"}
          className="player-back"
        >
          {needsSubscription
            ? "View Subscription Plans"
            : "Back to Dashboard"}
        </Link>
      </div>
    </main>
  );
}


 
  
if (movie.subscriptionRequired && !isSubscribed) {
  return (
    <main className="player-page">
      <h1>Premium Movie</h1>
      <p>
        An active subscription is required to
        access this movie summary.
      </p>
      <Link href="/plans">
        View Subscription Plans
      </Link>
    </main>
  );
}


  // The PDF says audioLink is relative to the API base URL.
  const audioSrc = movie.audioLink
    ? `${API_BASE}/${movie.audioLink.replace(/^\/+/, "")}`
    : "";

  return (
    <main className="player-page">
      <div className="player-container">
        <Link
          href={`/movie/${movie.id}`}
          className="player-back"
        >
          ← Back to Movie
        </Link>

        <header className="player-header">
          <img
            src={movie.imageLink}
            alt={`${movie.title} poster`}
            className="player-poster"
          />

          <div>
            <h1>{movie.title}</h1>
            <p>{movie.director}</p>
            <span>Movie Summary</span>
          </div>
        </header>

        <section className="player-summary">
          <h2>Summary</h2>
          <p>{movie.summary}</p>
        </section>

        <div className="player-audio">
          <audio
            ref={audioRef}
            src={audioSrc || undefined}
            preload="metadata"
            onLoadedMetadata={handleMetadataLoaded}
            onDurationChange={handleMetadataLoaded}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            onError={() =>
              setAudioError("Audio could not be loaded.")
            }
          />

          <div className="player-audio-info">
            <img
              src={movie.imageLink}
              alt=""
            />

            <div>
              <strong>{movie.title}</strong>
              <span>{movie.director}</span>
            </div>
          </div>

          <div className="player-controls">
            <button
              type="button"
              onClick={() => skipAudio(-10)}
              aria-label="Skip backward 10 seconds"
            >
              ↶ 10
            </button>

            <button
              type="button"
              className="player-play"
              onClick={togglePlay}
              disabled={!audioSrc}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>

            <button
              type="button"
              onClick={() => skipAudio(10)}
              aria-label="Skip forward 10 seconds"
            >
              10 ↷
            </button>
          </div>

          <div className="player-progress">
            <span>{formatTime(currentTime)}</span>

            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(e) =>
                handleSeek(Number(e.target.value))
              }
              disabled={duration <= 0}
              aria-label="Audio progress"
            />

            <span>{formatTime(duration)}</span>
          </div>

          {audioError && (
            <p className="player-error" role="alert">
              {audioError}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
