
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const appRoutes = [
    "/dashboard",
    "/movie",
    "/player",
    "/plans",
    "/settings",
    "/favourites",
    "/search",
  ];

  const showSidebar = appRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <button
        type="button"
        className="sidebar-mobile-toggle"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <i
          className={
            menuOpen
              ? "fa-solid fa-xmark"
              : "fa-solid fa-bars"
          }
        />
      </button>

      {menuOpen && (
        <button
          type="button"
          className="sidebar-mobile-overlay"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div
        className={`sidebar-wrapper ${
          menuOpen ? "sidebar-wrapper--open" : ""
        }`}
      >
        <Sidebar
          closeMobileMenu={() => setMenuOpen(false)}
        />
      </div>

      <div className="app-shell-content">
  <AppHeader />
  {children}
</div>
    </div>
  );
}
