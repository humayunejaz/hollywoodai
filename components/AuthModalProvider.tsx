
"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import AuthModal from "./AuthModal";

type AuthMode = "login" | "register";

type AuthModalContextType = {
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
};

const AuthModalContext =
  createContext<AuthModalContextType | null>(null);

export function AuthModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  function openAuth(selectedMode: AuthMode = "login") {
    setMode(selectedMode);
    setIsOpen(true);
  }

  function closeAuth() {
    setIsOpen(false);
  }

  return (
    <AuthModalContext.Provider
      value={{ openAuth, closeAuth }}
    >
      {children}

      {isOpen && (
        <AuthModal
          mode={mode}
          setMode={setMode}
          closeAuth={closeAuth}
        />
      )}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);

  if (!context) {
    throw new Error(
      "useAuthModal must be used inside AuthModalProvider"
    );
  }

  return context;
}
