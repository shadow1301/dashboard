"use client";

import { useTheme } from "@/components/layout/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { Sun, Moon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeaderProps = {
  title: string;
  onMenuToggle: () => void;
};

export function Header({ title, onMenuToggle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { session } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="md:hidden text-foreground-muted hover:text-foreground">
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <div className="text-sm text-foreground-muted hidden sm:block">
          {session?.name || "User"}
        </div>
      </div>
    </header>
  );
}
