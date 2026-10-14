
import type { Movie } from "../types/movie";

const API_BASE =
  "https://advanced-internship-api-production.up.railway.app";

async function fetchMovies(endpoint: string): Promise<Movie[]> {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch movies: ${response.status}`
    );
  }

  const result: unknown = await response.json();

  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result) ||
    !Array.isArray(result.data)
  ) {
    throw new Error(
      `Invalid movie data returned from ${endpoint}`
    );
  }

  return result.data as Movie[];
}

export function getSelectedMovies(): Promise<Movie[]> {
  return fetchMovies("selectedMovies");
}

export function getTopMovies(): Promise<Movie[]> {
  return fetchMovies("topMovies");
}


export async function getMovieById(id: string): Promise<Movie> {
  const response = await fetch(
    `${API_BASE}/movies/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch movie: ${response.status}`
    );
  }

  const result: unknown = await response.json();

  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result)
  ) {
    throw new Error("Invalid movie response.");
  }

  const movie = result.data;

  if (
    typeof movie !== "object" ||
    movie === null ||
    Array.isArray(movie) ||
    !("id" in movie) ||
    !("title" in movie)
  ) {
    throw new Error("Invalid movie details.");
  }

  return movie as Movie;
}


export async function searchMovies(
  query: string,
  signal?: AbortSignal
): Promise<Movie[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const response = await fetch(
    `${API_BASE}/movies?search=${encodeURIComponent(trimmedQuery)}`,
    {
      cache: "no-store",
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Movie search failed with status ${response.status}`
    );
  }

  const result: unknown = await response.json();

  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result) ||
    !Array.isArray(result.data)
  ) {
    throw new Error("Unexpected movie search response.");
  }

  return result.data as Movie[];
}

