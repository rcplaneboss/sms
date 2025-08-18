"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

export function DarkModeToggle() {
  const [dark, setDark] = React.useState(false);

  // Load saved theme on mount
  React.useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Update when toggled
  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <div className="flex items-center gap-2 absolute -bottom-8 right-8">
      <Sun className="h-4 w-4 text-yellow-500" />
      <Switch checked={dark} onCheckedChange={setDark} />
      <Moon className="h-4 w-4 text-blue-500" />
    </div>
  );
}
