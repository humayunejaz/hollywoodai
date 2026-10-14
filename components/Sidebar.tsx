
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";

import { auth } from "../lib/firebase";
import { useSubscription } from "../hooks/useSubscription";
import { useAuthModal } from "./AuthModalProvider";

type SidebarProps = {
  closeMobileMenu: () => void;
};

export default function Sidebar({
  closeMobileMenu,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { openAuth } = useAuthModal();
  const { user, loading } = useSubscription();

  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleAuthClick() {
    setError("");

    if (!user) {
      closeMobileMenu();
      openAuth("login");
      return;
    }

    setLoggingOut(true);

    try {
      await signOut(auth);
      closeMobileMenu();
      router.push("/");
    } catch {
      setError("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  function isActive(path: string) {
    if (path === "/dashboard") {
      return pathname === path;
    }

    return pathname === path ||
      pathname.startsWith(`${path}/`);
  }

  return (
    <aside className="app-sidebar">
      <Link
        href="/dashboard"
        className="sidebar-logo"
        onClick={closeMobileMenu}
      >
        <span className="sidebar-logo-icon">✦</span>
        <span>hollywoodai</span>
      </Link>

      <nav
        className="sidebar-navigation"
        aria-label="Main navigation"
      >
        <Link
          href="/dashboard"
          onClick={closeMobileMenu}
          className={`sidebar-item ${
            isActive("/dashboard") ? "sidebar-active" : ""
          }`}
          aria-current={
            isActive("/dashboard") ? "page" : undefined
          }
        >
          <i className="fa-solid fa-house" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/favourites"
          onClick={closeMobileMenu}
          className={`sidebar-item ${
            isActive("/favourites") ? "sidebar-active" : ""
          }`}
          aria-current={
            isActive("/favourites") ? "page" : undefined
          }
        >
          <i className="fa-regular fa-heart" />
          <span>Favourites</span>
        </Link>

        
<Link
  href="/search"
  onClick={closeMobileMenu}
  className={`sidebar-item ${
    isActive("/search") ? "sidebar-active" : ""
  }`}
  aria-current={
    isActive("/search") ? "page" : undefined
  }
>
  <i className="fa-solid fa-magnifying-glass" />
  <span>Search</span>
</Link>


        <button
          type="button"
          className="sidebar-item sidebar-disabled"
          disabled
        >
          <i className="fa-solid fa-arrow-trend-up" />
          <span>Trending</span>
        </button>

        <Link
          href="/settings"
          onClick={closeMobileMenu}
          className={`sidebar-item ${
            isActive("/settings") ? "sidebar-active" : ""
          }`}
          aria-current={
            isActive("/settings") ? "page" : undefined
          }
        >
          <i className="fa-solid fa-gear" />
          <span>Settings</span>
        </Link>

        <button
          type="button"
          className="sidebar-item sidebar-disabled"
          disabled
        >
          <i className="fa-regular fa-circle-question" />
          <span>Help & Support</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        {error && (
          <p className="sidebar-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          className="sidebar-item sidebar-auth"
          disabled={loading || loggingOut}
          onClick={handleAuthClick}
        >
          <i
            className={
              user
                ? "fa-solid fa-right-from-bracket"
                : "fa-solid fa-right-to-bracket"
            }
          />

          <span>
            {loggingOut
              ? "Logging out..."
              : user
                ? "Logout"
                : "Login"}
          </span>
        </button>
      </div>
    </aside>
  );
}
