"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const isDark = (theme ?? resolvedTheme) === "dark";

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label="Alternar tema"
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {isDark ? <MoonIcon /> : <SunIcon />}
        </Button>
    );
}
