"use client";

import { useSession, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    session: session?.user ?? null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    logout: () => signOut({ callbackUrl: "/login" }),
  };
}
