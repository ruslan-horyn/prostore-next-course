"use client";

import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useIsMountedState } from "@/hooks";
import { MoonIcon, SunIcon } from "lucide-react";

export const ModeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMountedState();

  const isDark = theme === "dark";
  const Icon = isDark ? MoonIcon : SunIcon;
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };
  if (!isMounted) return null;

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Icon className="h-4 w-4" />
    </Button>
  );
};
