"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/layout/ThemeProvider";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Truck,
  BarChart3,
  Upload,
  Bell,
  Settings,
  LogOut,
  Sun,
  Moon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Truck,
  BarChart3,
  Upload,
  Bell,
  Settings,
};

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-60 bg-surface border-r border-border flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link href="/dashboard" className="font-bold text-lg text-foreground">
            {siteConfig.name}
          </Link>
          <button onClick={onClose} className="md:hidden text-foreground-muted hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {siteConfig.nav.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-raised",
                )}
              >
                {Icon && <Icon size={18} />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 space-y-2">
          <div className="px-3 py-2 text-xs text-foreground-faint truncate">
            {session?.name || "User"}
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-foreground-muted hover:text-foreground hover:bg-surface-raised transition-colors"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-foreground-muted hover:text-foreground hover:bg-surface-raised transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
