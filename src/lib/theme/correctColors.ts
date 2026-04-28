export type CorrectColor = "green" | "purple" | "pink" | "orange" | "blue";

interface Palette {
  base: string;
  light: string;
  dark: string;
  border: string;
}

export const CORRECT_PALETTES: Record<CorrectColor, Palette> = {
  green:  { base: "#538d4e", light: "#7ab970", dark: "#355e30", border: "#2c4f28" },
  purple: { base: "#5B40DE", light: "#7d68ec", dark: "#3a2796", border: "#2c1d72" },
  pink:   { base: "#FF047D", light: "#ff4fa3", dark: "#b00355", border: "#7e0240" },
  orange: { base: "#DA5B1D", light: "#ee8651", dark: "#9b3f0e", border: "#722e09" },
  blue:   { base: "#0067E0", light: "#3a8cf0", dark: "#00489a", border: "#003770" },
};

const STORAGE_KEY = "wh_tile_color";

export function loadStoredCorrectColor(): CorrectColor {
  if (typeof window === "undefined") return "green";
  const v = localStorage.getItem(STORAGE_KEY);
  if (v && v in CORRECT_PALETTES) return v as CorrectColor;
  return "green";
}

export function applyCorrectColor(c: CorrectColor) {
  if (typeof document === "undefined") return;
  const p = CORRECT_PALETTES[c];
  const root = document.documentElement;
  root.style.setProperty("--color-correct", p.base);
  root.style.setProperty("--color-correct-light", p.light);
  root.style.setProperty("--color-correct-dark", p.dark);
  root.style.setProperty("--color-correct-border", p.border);
}

export function persistCorrectColor(c: CorrectColor) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, c);
}
