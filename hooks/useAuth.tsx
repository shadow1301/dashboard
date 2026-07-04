"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getSession, logout as authLogout, type Session } from "@/lib/auth";

type AuthContext = {
  session: Session | null;
  isAuthenticated: boolean;
  logout: () => void;
  refresh: () => void;
};

const AuthCtx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refresh = () => {
    const s = getSession();
    setSession(s);
    setIsAuthenticated(s !== null);
  };

  useEffect(() => { refresh(); }, []);

  const logout = () => {
    authLogout();
    setSession(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthCtx.Provider value={{ session, isAuthenticated, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthContext {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
