import React from "react";
import { Check, Moon, Sun } from "lucide-react";

import { ThemeProviderContext } from "../../contexts/theme-context";

const ThemeSettings = () => {
  const { theme, setTheme, color, setColor } = React.useContext(ThemeProviderContext);

  const primaryPalette = [
    { value: "#ffcc29", label: "Sunrise Yellow" },
    { value: "#b5072a", label: "MorJodi Red" },
    { value: "#2563eb", label: "Ocean Blue" },
    { value: "#10b981", label: "Emerald" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Appearance</p>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Theme Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Customize the admin theme and accent color.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-[#f8f9fa] shadow-sm p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Theme option</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark modes.</p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                theme === "light"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 text-gray-700 hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:text-gray-200"
              }`}
              onClick={() => setTheme("light")}
            >
              <Sun size={18} /> Light
            </button>
            <button
              type="button"
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                theme === "dark"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 text-gray-700 hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:text-gray-200"
              }`}
              onClick={() => setTheme("dark")}
            >
              <Moon size={18} /> Dark
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-[#f8f9fa] shadow-sm p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Accent color</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Choose your primary brand tint.</p>
          <div className="mt-4 grid grid-cols-6 gap-3">
            {primaryPalette.map((c) => (
              <button
                type="button"
                key={c.value}
                className="relative flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-transparent transition hover:ring-primary/70"
                style={{ backgroundColor: c.value }}
                onClick={() => setColor(c.value)}
                aria-label={c.label}
                title={c.label}
              >
                {color === c.value && <Check size={18} className="text-white drop-shadow-sm" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;


