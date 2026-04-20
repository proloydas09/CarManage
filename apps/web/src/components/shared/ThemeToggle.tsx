"use client";

import { Sun, Moon } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    if (theme === "light") {
      html.classList.add("light");
    } else {
      html.classList.remove("light");
    }
  }, [theme, mounted]);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-xl bg-bg-elevated animate-pulse" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="btn-ghost btn-icon group relative overflow-hidden"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <div className="relative w-4 h-4 transition-transform duration-500 ease-spring">
        {theme === "dark" ? (
          <Moon className="w-4 h-4 text-brand-400 group-hover:text-brand-300 transition-colors" />
        ) : (
          <Sun className="w-4 h-4 text-warning group-hover:text-warning/80 transition-colors" />
        )}
      </div>
      
      {/* Subtle hover ring */}
      <div className="absolute inset-0 rounded-xl border border-brand-500/0 group-hover:border-brand-500/20 transition-all duration-300" />
    </button>
  );
}
