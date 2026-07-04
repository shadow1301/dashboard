"use client";

import { useTheme } from "@/components/layout/ThemeProvider";

const light = {
  grid: "#e2e8f0",
  line: "#2563eb",
  healthGood: "#16a34a",
  healthWarning: "#d97706",
  healthCritical: "#dc2626",
  primary: "#2563eb",
  fgFaint: "#94a3b8",
  surfaceInverse: "#0b1120",
  fgInverse: "#f1f5f9",
};

const dark = {
  grid: "#1e293b",
  line: "#3b82f6",
  healthGood: "#22c55e",
  healthWarning: "#f59e0b",
  healthCritical: "#ef4444",
  primary: "#3b82f6",
  fgFaint: "#64748b",
  surfaceInverse: "#f8fafc",
  fgInverse: "#0b1120",
};

export function useChartColors() {
  const { theme } = useTheme();
  return theme === "light" ? light : dark;
}
