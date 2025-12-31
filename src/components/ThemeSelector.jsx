import { useContext, useEffect, useState } from "react";
import { Check, Moon, Settings, Sun, X } from "lucide-react";

import { ThemeProviderContext } from "../contexts/theme-context";

export default function ThemeSelectorSidebar() {
  const { theme, setTheme, color, setColor } = useContext(ThemeProviderContext);
  const [isOpen, setIsOpen] = useState(false);

  const primaryPalette = [
    { value: "#ffcc29", label: "yellow" },
    { value: "#b5072a", label: "red" },
    { value: "#2563eb", label: "blue" },
    { value: "#10b981", label: "green" },
  ];

  // Load saved (optional; provider already does it but harmless)
  useEffect(() => {
    const savedTheme = localStorage.getItem("themes");
    const savedColor = localStorage.getItem("colors");
    if (savedTheme) setTheme(savedTheme);
    if (savedColor) setColor(savedColor);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-ghost size-10 rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:bg-slate-900 dark:text-gray-300"
        title="Settings"
        aria-label="Open settings"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        id="sidebar"
        className={`fixed top-0 right-0 z-50 h-full w-80 transform shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${theme === "dark" ? "bg-slate-950 text-white" : "bg-white text-gray-900"}`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold">Settings</h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="btn-ghost size-9 rounded-full hover:text-primary"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex h-[calc(100%-64px)] flex-col gap-6 overflow-y-auto p-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Theme Option</p>
            <div className="flex gap-3">
              <button
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  theme === "light"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                }`}
                onClick={() => setTheme("light")}
              >
                <Sun size={18} /> Light
              </button>
              <button
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  theme === "dark"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                }`}
                onClick={() => setTheme("dark")}
              >
                <Moon size={18} /> Dark
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Theme Color</p>
            <div className="grid grid-cols-6 gap-3">
              {primaryPalette.map((c) => (
                <button
                  key={c.value}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-transparent transition hover:ring-primary/60"
                  style={{ backgroundColor: c.value }}
                  onClick={() => setColor(c.value)}
                  aria-label={c.label}
                  title={c.label}
                >
                  {color === c.value && <Check size={16} className="text-white drop-shadow-sm" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
