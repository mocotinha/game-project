import { useEffect, useState } from "react";
import { gameBus, type HudPayload } from "../../game/bus";
import { StarRow } from "../../ui/components";
import { MISSIONS } from "../../game/content/missions";

export default function Hud({ interiorTitle }: { interiorTitle: string | null }) {
  const [hud, setHud] = useState<HudPayload>({
    region: "AURORA",
    stars: 0,
    objective: "",
    prompt: "",
  });

  useEffect(() => gameBus.on("hud", setHud), []);

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <div className="rounded-xl border border-line bg-petrol/80 px-4 py-2 backdrop-blur">
          <div className="hud-label text-emerald">{interiorTitle ?? hud.region}</div>
          <div className="mt-1 text-sm text-cream">{hud.objective}</div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-petrol/80 px-4 py-2 backdrop-blur">
          <span className="hud-label text-cream-dim">Cidadania</span>
          <StarRow count={hud.stars} total={MISSIONS.length * 2} />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
        <div className="hud-label text-slate">WASD mover · E interagir · J diario · Esc pausar</div>
        {hud.prompt && (
          <div className="animate-pulse rounded-lg border border-gold bg-ink/80 px-4 py-2 font-display text-gold">
            {hud.prompt}
          </div>
        )}
      </div>
    </>
  );
}
