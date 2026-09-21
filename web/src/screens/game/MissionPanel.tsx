import { useEffect, useState } from "react";
import { gameBus, uiBus, type MissionPayload } from "../../game/bus";

export default function MissionPanel() {
  const [m, setM] = useState<MissionPayload | null>(null);

  useEffect(() => {
    const off = gameBus.on("mission", setM);
    const onKey = (e: KeyboardEvent) => {
      const letter = e.key.toUpperCase();
      if (["A", "B", "C"].includes(letter)) uiBus.emit("answer", letter);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      off();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!m) return null;

  return (
    <div className="absolute inset-0 grid place-items-center bg-ink/70 p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-line bg-petrol/95 p-8 shadow-2xl slide-in">
        <div className="hud-label text-emerald">Decisao · {m.title}</div>
        <h2 className="mt-2 font-display text-2xl font-bold text-gold">{m.question}</h2>

        <div className="mt-4 flex flex-wrap gap-3">
          {m.checklist.map((c) => (
            <span
              key={c.label}
              className={
                "rounded-full px-3 py-1 text-xs " +
                (c.done ? "bg-emerald/20 text-emerald" : "bg-slate/20 text-slate")
              }
            >
              {c.done ? "✓" : "○"} {c.label}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {m.options.map((o) => (
            <button
              key={o.letter}
              onClick={() => uiBus.emit("answer", o.letter)}
              className="flex items-start gap-3 rounded-xl border border-line bg-petrol-2 px-5 py-4 text-left transition hover:border-gold hover:bg-petrol-2/70"
            >
              <span className="font-pixel text-gold">{o.letter}</span>
              <span className="font-body text-cream">{o.text}</span>
            </button>
          ))}
        </div>

        {m.feedback && (
          <p className="mt-4 rounded-lg bg-ink/60 px-4 py-3 font-body text-red-300">
            {m.feedback}
          </p>
        )}

        <div className="mt-4 text-right">
          <button
            onClick={() => uiBus.emit("closeMission")}
            className="font-display text-sm text-slate hover:text-cream"
          >
            Voltar (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
