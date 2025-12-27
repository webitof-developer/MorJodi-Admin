import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

const initialState = {
  theme: "system",
  color: "#b5072a",
  setTheme: () => null,
  setColor: () => null,
};

export const ThemeProviderContext = createContext(initialState);

// ---------- Utils ----------
const clamp = (n, min = 0, max = 255) => Math.min(max, Math.max(min, n));
const hexToRgb = (hex) => {
  const h = (hex || "#000000").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const v = parseInt(full, 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
};
const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;

const lighten = (hex, amt = 60) => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({ r: r + amt, g: g + amt, b: b + amt });
};

// rgb <-> hsl for better secondary derivation
const rgbToHsl = ({ r, g, b }) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h, s, l };
};
const hslToRgb = ({ h, s, l }) => {
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

// Secondary ko primary se banane ka rule:
// - desaturate karke neutral feel
// - thoda darken for contrast
const deriveSecondaryFromPrimary = (primaryHex) => {
  const hsl = rgbToHsl(hexToRgb(primaryHex));
  const desat = { h: hsl.h, s: Math.max(0, hsl.s * 0.25), l: Math.max(0, Math.min(1, hsl.l * 0.60)) };
  const rgb = hslToRgb(desat);
  const hex = rgbToHex(rgb);
  // darker variant for "secondary-dark"
  const darker = (() => {
    const { r, g, b } = rgb;
    return rgbToHex({ r: r - 60, g: g - 60, b: b - 60 });
  })();
  return { secondary: hex, secondaryDark: darker };
};

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "vite-ui-theme" }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("themes") || defaultTheme);
  const [color, setColor] = useState(() => localStorage.getItem("colors") || "#b5072a");

  // apply theme class & react to OS if "system"
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    const applySystem = () => {
      const sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(sys);
    };

    if (theme === "system") {
      applySystem();
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => applySystem();
      mql.addEventListener?.("change", onChange) || mql.addListener(onChange);
      return () => mql.removeEventListener?.("change", onChange) || mql.removeListener(onChange);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // push CSS variables — all derived from single "color"
  useEffect(() => {
    const root = document.documentElement;

    const primary = color;
    const primaryLight = lighten(color, 60);
    const { secondary, secondaryDark } = deriveSecondaryFromPrimary(color);

    root.style.setProperty("--primary-color", primary);
    root.style.setProperty("--primary-light", primaryLight);
    root.style.setProperty("--secondary-color", secondary);
    root.style.setProperty("--secondary-dark", secondaryDark);

    // store only these two
    localStorage.setItem("themes", theme);
    localStorage.setItem("colors", color);
  }, [color, theme]);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, color, setColor }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
  defaultTheme: PropTypes.string,
  storageKey: PropTypes.string,
};
