"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type MenuContext = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const MenuCtx = createContext<MenuContext | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <MenuCtx.Provider value={{ isOpen, open: () => setOpen(true), close: () => setOpen(false) }}>
      {children}
    </MenuCtx.Provider>
  );
}

export function useMenu(): MenuContext {
  const ctx = useContext(MenuCtx);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
}
