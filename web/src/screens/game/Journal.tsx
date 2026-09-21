import type { GameState } from "../../game/save";
import { LEVEL_SUMMARY, ROLE_INFO, ROLE_ORDER } from "../../game/content/roles";
import { MISSIONS } from "../../game/content/missions";
import { AuroraButton } from "../../ui/components";

export default function Journal({
  state,
  onClose,
}: {
  state: GameState;
  onClose: () => void;
}) {
  const learned = new Set(state.learned_roles);
  const stars = state.completed_missions.length + state.extra_stars;

  return (
    <div className="absolute inset-0 grid place-items-center bg-ink/85 p-8">
      <div className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-petrol/95 shadow-2xl slide-in">
        <div className="flex items-center justify-between border-b border-line p-6">
          <h2 className="font-display text-2xl font-bold text-gold">Diario de Cidadania</h2>
          <span className="hud-label text-emerald">Estrelas: {stars} / {MISSIONS.length * 2}</span>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="grid gap-3 md:grid-cols-3">
            {LEVEL_SUMMARY.map(([level, desc]) => (
              <div key={level} className="rounded-xl border border-line bg-petrol-2 p-4">
                <div className="font-display font-semibold text-emerald">{level}</div>
                <p className="mt-1 text-sm text-cream-dim">{desc}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-6 font-display text-lg text-cream">Cargos e responsabilidades</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {ROLE_ORDER.map((key) => {
              const role = ROLE_INFO[key];
              const known = learned.has(key);
              return (
                <div
                  key={key}
                  className={
                    "rounded-xl border p-4 " +
                    (known ? "border-gold/40 bg-petrol-2" : "border-line bg-ink/40 opacity-70")
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-gold">
                      {known ? role.title : "???"}
                    </span>
                    <span className="hud-label text-slate">{role.level}</span>
                  </div>
                  {known ? (
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-emerald">Faz: <span className="text-cream-dim">{role.does}</span></p>
                      <p className="text-red-300">Nao faz: <span className="text-cream-dim">{role.not}</span></p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate">Descubra conversando com quem ocupa este cargo.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-line p-4 text-right">
          <AuroraButton onClick={onClose}>Fechar (J)</AuroraButton>
        </div>
      </div>
    </div>
  );
}
