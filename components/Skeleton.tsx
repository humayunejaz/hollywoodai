
import "./skeleton.css";

type MovieCardSkeletonProps = {
  count?: number;
};

export function MovieCardSkeleton({
  count = 6,
}: MovieCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          className="skeleton-movie-card"
          key={index}
          aria-hidden="true"
        >
          <div className="skeleton-poster skeleton-shimmer" />
          <div className="skeleton-line skeleton-title-line skeleton-shimmer" />
          <div className="skeleton-line skeleton-small-line skeleton-shimmer" />
        </div>
      ))}
    </>
  );
}

export function MovieDetailsSkeleton() {
  return (
    <div
      className="skeleton-movie-details"
      role="status"
      aria-label="Loading movie details"
    >
      <div className="skeleton-details-text">
        <div className="skeleton-line skeleton-heading skeleton-shimmer" />
        <div className="skeleton-line skeleton-medium-line skeleton-shimmer" />
        <div className="skeleton-line skeleton-short-line skeleton-shimmer" />

        <div className="skeleton-tags">
          <div className="skeleton-tag skeleton-shimmer" />
          <div className="skeleton-tag skeleton-shimmer" />
          <div className="skeleton-tag skeleton-shimmer" />
        </div>

        <div className="skeleton-button skeleton-shimmer" />

        <div className="skeleton-paragraph">
          <div className="skeleton-line skeleton-shimmer" />
          <div className="skeleton-line skeleton-shimmer" />
          <div className="skeleton-line skeleton-medium-line skeleton-shimmer" />
        </div>
      </div>

      <div className="skeleton-details-poster skeleton-shimmer" />
    </div>
  );
}

export function MoviePlayerSkeleton() {
  return (
    <div
      className="skeleton-player"
      role="status"
      aria-label="Loading movie summary"
    >
      <div className="skeleton-player-header">
        <div className="skeleton-player-poster skeleton-shimmer" />

        <div className="skeleton-player-heading">
          <div className="skeleton-line skeleton-heading skeleton-shimmer" />
          <div className="skeleton-line skeleton-medium-line skeleton-shimmer" />
        </div>
      </div>

      <div className="skeleton-paragraph">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className={`skeleton-line skeleton-shimmer ${
              index === 7 ? "skeleton-medium-line" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
