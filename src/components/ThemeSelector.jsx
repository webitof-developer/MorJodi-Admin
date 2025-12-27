import { useState, useContext, useEffect } from "react";
import { ThemeProviderContext } from "../contexts/theme-context";
import { Sun, Moon, Settings, Check } from "lucide-react";

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

  // Persist (optional; provider already persists; harmless duplicate)
  useEffect(() => {
    localStorage.setItem("themes", theme);
    localStorage.setItem("colors", color);
  }, [theme, color]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 p-5 bg-primary text-white rounded-full shadow-lg"
      >
        <Settings size={25} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
      )}

      <div
        id="sidebar"
        className={`fixed top-0 right-0 w-72 h-full shadow-lg z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: theme === "dark" ? "#0f1729" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#000000",
        }}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Settings</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 text-2xl font-bold">
            &times;
          </button>
        </div>

        <div className="p-4">
          <h4 className="font-semibold mb-2">Theme Option</h4>
          <div className="flex p-3 gap-4">
            <button
              className={`flex items-center gap-2 px-4 py-2 border rounded-md ${theme === "light" ? "bg-gray-200" : ""}`}
              onClick={() => setTheme("light")}
            >
              <Sun size={18} /> Light
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 border rounded-md ${theme === "dark" ? "bg-gray-200" : ""}`}
              onClick={() => setTheme("dark")}
            >
              <Moon size={18} /> Dark
            </button>
          </div>

          <h4 className="font-semibold mt-4 mb-2">Theme Color</h4>
          <div className="grid grid-cols-6 gap-3 p-3">
            {primaryPalette.map((c) => (
              <button
                key={c.value}
                className="w-8 h-8 rounded-full relative flex items-center justify-center ring-1 ring-black/10"
                style={{ backgroundColor: c.value }}
                onClick={() => setColor(c.value)}
                aria-label={c.label}
                title={c.label}
              >
                {color === c.value && <Check size={16} className="text-white absolute" />}
              </button>
            ))}
          </div>

          
        </div>
      </div>
    </>
  );
}
