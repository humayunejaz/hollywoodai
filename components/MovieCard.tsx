
import Link from "next/link";
import type { Movie } from "../types/movie";

type MovieCardProps = {
  movie: Movie;
  isSubscribed: boolean;
};

export default function MovieCard({
  movie,
  isSubscribed,
}: MovieCardProps) {  return (
    <Link
      href={`/movie/${movie.id}`}
      className="movie-card"
    >
      <div className="movie-card__poster">
        {movie.subscriptionRequired && !isSubscribed && (
  <span className="movie-card__premium">
    Premium
  </span>
)}

        <img
          src={movie.imageLink}
          alt={`${movie.title} poster`}
          className="movie-card__image"
        />
      </div>

      <h3 className="movie-card__title">
        {movie.title}
      </h3>

      <p className="movie-card__details">
        {movie.releaseYear} · {movie.type}
      </p>
    </Link>
  );
}
