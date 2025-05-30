"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="relative">
      <button
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${theme === "dark" ? "hidden" : "block"}`} />
        <Moon className={`h-[1.2rem] w-[1.2rem] transition-all ${theme === "light" ? "hidden" : "block"}`} />
        <span className="sr-only">Changer le thème</span>
      </button>
    </div>
  )
}
