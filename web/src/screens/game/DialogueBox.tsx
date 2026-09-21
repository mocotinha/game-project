import { useEffect, useState } from "react";
import { gameBus, uiBus, type DialoguePayload } from "../../game/bus";

export default function DialogueBox() {
  const [payload, setPayload] = useState<DialoguePayload | null>(null);

  useEffect(() => gameBus.on("dialogue", setPayload), []);

  if (!payload) return null;

  const advance = () => uiBus.emit("advanceDialogue");
  const last = payload.index >= payload.count - 1;

  return (
    <div
      className="absolute inset-x-0 bottom-0 flex justify-center p-6"
      onClick={advance}
    >
      <div className="w-full max-w-3xl rounded-2xl border border-line bg-petrol/95 p-6 shadow-2xl backdrop-blur slide-in">
        <div className="hud-label mb-2 text-gold">{payload.speaker}</div>
        <p className="whitespace-pre-line font-body text-lg leading-relaxed text-cream">
          {payload.line}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate">
            {payload.index + 1} / {payload.count}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              advance();
            }}
            className="font-display text-sm text-emerald hover:text-gold"
          >
            {last ? "Fechar ▸" : "Continuar ▸"}
          </button>
        </div>
      </div>
    </div>
  );
}
