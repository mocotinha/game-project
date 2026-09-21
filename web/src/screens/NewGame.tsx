import { useMemo, useState } from "react";
import { useAppStore } from "../game/store";
import {
  SLOT_COUNT,
  loadSlot,
  newGameState,
  saveSlot,
  slotExists,
  slotSummary,
} from "../game/save";
import { AuroraButton, Panel, Title } from "../ui/components";

export default function NewGame() {
  const back = useAppStore((s) => s.back);
  const startGame = useAppStore((s) => s.startGame);
  const [index, setIndex] = useState(0);
  const [name, setName] = useState("Joana");
  const [confirming, setConfirming] = useState<number | null>(null);

  const summaries = useMemo(
    () => Array.from({ length: SLOT_COUNT }, (_, i) => slotSummary(i + 1)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [confirming],
  );

  function create(slot: number) {
    const state = newGameState(name.trim() || "Joana");
    saveSlot(slot, state);
    startGame(slot, loadSlot(slot) ?? state, true);
  }

  function pick(slot: number) {
    if (slotExists(slot)) setConfirming(slot);
    else create(slot);
  }

  return (
    <div className="flex h-full w-full items-center justify-center map-grid">
      <div className="flex w-full max-w-2xl flex-col gap-6 px-8">
        <Title>Novo Jogo</Title>

        <label className="flex flex-col gap-2">
          <span className="hud-label text-emerald">Nome da protagonista</span>
          <input
            value={name}
            maxLength={16}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-line bg-petrol-2 px-4 py-3 font-display text-cream outline-none focus:border-gold"
          />
        </label>

        <Panel className="flex flex-col gap-3 p-6">
          {summaries.map((summary, i) => {
            const slot = i + 1;
            return (
              <AuroraButton
                key={slot}
                selected={index === i}
                onMouseEnter={() => setIndex(i)}
                onClick={() => pick(slot)}
                className="flex items-center justify-between text-left"
              >
                <span>SLOT {slot}</span>
                <span className="font-body text-xs text-cream-dim">{summary}</span>
              </AuroraButton>
            );
          })}
        </Panel>

        <div className="flex gap-3">
          <AuroraButton variant="ghost" onClick={back}>
            VOLTAR
          </AuroraButton>
        </div>
      </div>

      {confirming !== null && (
        <div className="fixed inset-0 grid place-items-center bg-ink/70">
          <Panel className="flex flex-col gap-4 p-8 text-center">
            <p className="font-display text-lg text-cream">
              Sobrescrever o SLOT {confirming}?
            </p>
            <div className="flex justify-center gap-3">
              <AuroraButton
                onClick={() => {
                  const slot = confirming;
                  setConfirming(null);
                  create(slot);
                }}
              >
                SIM
              </AuroraButton>
              <AuroraButton variant="ghost" onClick={() => setConfirming(null)}>
                NAO
              </AuroraButton>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
