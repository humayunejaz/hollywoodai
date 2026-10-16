import type { Metadata } from "next";
import AppShell from "../components/AppShell";
import "../components/sidebar.css";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./landing.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { AuthModalProvider } from "../components/AuthModalProvider";
import "../components/auth-modal.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hollywood AI",
  description:
    "Discover movies, explore summaries, and listen to audio recaps with Hollywood AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
  <AuthModalProvider>
    <AppShell>
      {children}
    </AppShell>
  </AuthModalProvider>
</body>
    </html>
  );
}
