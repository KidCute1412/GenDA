"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, ICON_WEIGHT } from "../ui/icons";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("genda-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("genda-theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div 
        style={{ width: "36px", height: "36px", border: "2px solid var(--machinery-border)", borderRadius: "2px" }} 
        aria-hidden="true" 
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label={`Chuyển sang chế độ ${theme === "light" ? "Tối (Dark Mode)" : "Sáng (Light Mode)"}`}
      title={`Chuyển sang chế độ ${theme === "light" ? "Tối" : "Sáng"}`}
    >
      {theme === "light" ? (
        <Moon weight={ICON_WEIGHT} aria-hidden="true" />
      ) : (
        <Sun weight={ICON_WEIGHT} aria-hidden="true" />
      )}
    </button>
  );
}
