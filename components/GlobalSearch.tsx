
"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function GlobalSearch() {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");

  // Clear the search box when navigating
  // to a new page, except when visiting Search.
  useEffect(() => {
    if (pathname !== "/search") {
      setQuery("");
    }
  }, [pathname]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();

    if (!trimmed) {
      router.push("/search");
      return;
    }

    router.push(
      `/search?q=${encodeURIComponent(trimmed)}`
    );
  }

  return (
    <form
      className="global-search"
      role="search"
      onSubmit={handleSearch}
    >
      <i
        className="fa-solid fa-magnifying-glass"
        aria-hidden="true"
      />

      <input
        type="search"
        placeholder="Search movies..."
        aria-label="Search movies"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <button
        type="submit"
        aria-label="Submit movie search"
      >
        <i
          className="fa-solid fa-arrow-right"
          aria-hidden="true"
        />
      </button>
    </form>
  );
}
