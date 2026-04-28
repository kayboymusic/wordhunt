"use client";

import { useEffect, useRef, useState } from "react";
import {
  CORRECT_PALETTES,
  CorrectColor,
  applyCorrectColor,
  loadStoredCorrectColor,
  persistCorrectColor,
} from "@/lib/theme/correctColors";

const SWATCHES: Array<{ id: CorrectColor; label: string }> = [
  { id: "green",  label: "Green"  },
  { id: "purple", label: "Purple" },
  { id: "pink",   label: "Pink"   },
  { id: "orange", label: "Orange" },
  { id: "blue",   label: "Blue"   },
];

export function ColorPicker() {
  const [color, setColor] = useState<CorrectColor>("green");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = loadStoredCorrectColor();
    setColor(stored);
    applyCorrectColor(stored);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(c: CorrectColor) {
    setColor(c);
    applyCorrectColor(c);
    persistCorrectColor(c);
    setOpen(false);
  }

  const current = CORRECT_PALETTES[color];

  return (
    <div className="color-picker" ref={ref}>
      <button
        className="color-picker-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change correct-tile color"
        aria-expanded={open}
        title="Tile color"
      >
        <span className="color-picker-dot" style={{ background: current.base }} />
      </button>
      {open && (
        <div className="color-picker-pop" role="menu">
          {SWATCHES.map((s) => (
            <button
              key={s.id}
              className={`color-picker-swatch${s.id === color ? " is-active" : ""}`}
              onClick={() => pick(s.id)}
              aria-label={s.label}
              title={s.label}
              style={{ background: CORRECT_PALETTES[s.id].base }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
