
import Link from "next/link";

export default function FavouritesPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px 30px",
        background: "#101018",
        color: "white",
      }}
    >
      <h1>My Favourites</h1>

      <p style={{ marginTop: "20px", color: "#aaa" }}>
        Saved movies will appear here once we
        implement the Favourites feature.
      </p>

      <Link
        href="/dashboard"
        style={{
          display: "inline-block",
          marginTop: "30px",
          color: "#a78bfa",
        }}
      >
        Explore Movies
      </Link>
    </main>
  );
}
