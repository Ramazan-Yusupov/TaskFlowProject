import { Moon, Sun } from "lucide-react";
import { IconButton } from "@/shared/ui";
import type { Theme } from "../model/useTheme";

type ThemeToggleProps = {
  theme: Theme;
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDarkTheme = theme === "dark";
  const label = isDarkTheme ? "Включить светлую тему" : "Включить тёмную тему";

  return (
    <IconButton
      label={label}
      title={label}
      className="theme-toggle"
      aria-pressed={isDarkTheme}
      onClick={onToggle}
    >
      {isDarkTheme ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
    </IconButton>
  );
}
