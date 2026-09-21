import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { audio } from "../game/audio";

// ---------------------------------------------------------------------------
// Design system "Aurora" — componentes de UI reutilizaveis (identidade nova).
// ---------------------------------------------------------------------------

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-2xl border border-line bg-petrol/80 backdrop-blur-sm shadow-2xl " +
        className
      }
    >
      {children}
    </div>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-display text-5xl font-extrabold tracking-tight text-gold drop-shadow">
      {children}
    </h1>
  );
}

export function Subtitle({ children }: { children: ReactNode }) {
  return <p className="font-body text-cream-dim">{children}</p>;
}

interface AuroraButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  variant?: "primary" | "ghost";
}

export function AuroraButton({
  selected = false,
  variant = "primary",
  className = "",
  children,
  ...rest
}: AuroraButtonProps) {
  const base =
    "font-display font-semibold rounded-xl px-6 py-3 transition-all duration-150 outline-none border";
  const look =
    variant === "primary"
      ? selected
        ? "bg-gold text-ink border-gold-deep scale-[1.03] shadow-lg"
        : "bg-petrol-2 text-cream border-line hover:bg-petrol-2/70"
      : selected
        ? "bg-emerald text-ink border-emerald-deep"
        : "bg-transparent text-cream-dim border-line hover:text-cream";
  return (
    <button className={`${base} ${look} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export interface MenuItem {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
}

/** Menu navegavel por teclado (setas + Enter) e mouse, estilo Aurora. */
export function KeyboardMenu({
  items,
  index,
  setIndex,
}: {
  items: MenuItem[];
  index: number;
  setIndex: (i: number) => void;
}) {
  const itemsRef = useRef(items);
  const indexRef = useRef(index);
  itemsRef.current = items;
  indexRef.current = index;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const list = itemsRef.current;
      const cur = indexRef.current;
      if (e.key === "ArrowDown" || e.key === "s") {
        e.preventDefault();
        audio.playSfx("select");
        setIndex((cur + 1) % list.length);
      } else if (e.key === "ArrowUp" || e.key === "w") {
        e.preventDefault();
        audio.playSfx("select");
        setIndex((cur - 1 + list.length) % list.length);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const item = list[cur];
        if (item && !item.disabled) {
          audio.playSfx("confirm");
          item.onSelect();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setIndex]);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <AuroraButton
          key={item.label}
          selected={i === index}
          disabled={item.disabled}
          onMouseEnter={() => setIndex(i)}
          onClick={() => {
            if (!item.disabled) {
              audio.playSfx("confirm");
              item.onSelect();
            }
          }}
          className={item.disabled ? "opacity-40 cursor-not-allowed" : ""}
        >
          {item.label}
        </AuroraButton>
      ))}
    </div>
  );
}

/** Barra de volume de 10 celulas, estilo HUD. */
export function VolumeBar({ value }: { value: number }) {
  const cells = Math.round(value * 10);
  return (
    <span className="font-pixel text-xs tracking-widest text-emerald">
      {"[" + "#".repeat(cells) + "-".repeat(10 - cells) + "]"}
    </span>
  );
}

export function StarRow({ count, total }: { count: number; total: number }) {
  return (
    <div className="flex gap-1 text-2xl">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < count ? "text-gold" : "text-slate/40"}>
          {i < count ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}
