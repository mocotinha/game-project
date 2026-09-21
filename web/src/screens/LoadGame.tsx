import { useState } from "react";
import { useAppStore } from "../game/store";
import { SLOT_COUNT, deleteSlot, loadSlot, slotSummary } from "../game/save";
import { AuroraButton, Panel, Subtitle, Title } from "../ui/components";

export default function LoadGame() {
  const back = useAppStore((s) => s.back);
  const startGame = useAppStore((s) => s.startGame);
  const [index, setIndex] = useState(0);
  const [version, setVersion] = useState(0);

  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => {
    const slot = i + 1;
    return { slot, summary: slotSummary(slot), exists: loadSlot(slot) !== null };
  });
  void version;

  function load(slot: number) {
    const state = loadSlot(slot);
    if (state) startGame(slot, state, false);
  }

  function remove(slot: number) {
    deleteSlot(slot);
    setVersion((v) => v + 1);
  }

  return (
    <div className="flex h-full w-full items-center justify-center map-grid">
      <div className="flex w-full max-w-2xl flex-col gap-6 px-8">
        <Title>Carregar Jogo</Title>
        <Subtitle>Enter para carregar · Delete para apagar o slot.</Subtitle>

        <Panel className="flex flex-col gap-3 p-6">
          {slots.map(({ slot, summary, exists }, i) => (
            <div key={slot} className="flex items-center gap-3">
              <AuroraButton
                selected={index === i}
                disabled={!exists}
                onMouseEnter={() => setIndex(i)}
                onClick={() => load(slot)}
                className="flex flex-1 items-center justify-between text-left"
              >
                <span>SLOT {slot}</span>
                <span className="font-body text-xs text-cream-dim">{summary}</span>
              </AuroraButton>
              {exists && (
                <AuroraButton variant="ghost" onClick={() => remove(slot)}>
                  APAGAR
                </AuroraButton>
              )}
            </div>
          ))}
        </Panel>

        <div>
          <AuroraButton variant="ghost" onClick={back}>
            VOLTAR
          </AuroraButton>
        </div>
      </div>
    </div>
  );
}
