import { useAppStore } from "../game/store";
import { CREATOR_NAME, CREATOR_ORG, CREATOR_YEAR } from "../game/config";
import { MISSIONS } from "../game/content/missions";
import { AuroraButton, Panel, StarRow, Subtitle, Title } from "../ui/components";

export default function Credits() {
  const back = useAppStore((s) => s.back);
  const gameState = useAppStore((s) => s.gameState);
  const stars =
    (gameState?.completed_missions.length ?? 0) + (gameState?.extra_stars ?? 0);
  const totalStars = MISSIONS.length * 2;

  return (
    <div className="flex h-full w-full items-center justify-center map-grid">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 px-8 text-center">
        <Title>Creditos</Title>
        <Subtitle>Obrigada por aprender sobre cidadania com a Joana!</Subtitle>

        <StarRow count={stars} total={totalStars} />

        <Panel className="flex flex-col gap-2 p-8">
          <p className="font-display text-lg text-gold">{CREATOR_NAME}</p>
          <p className="text-sm text-cream-dim">{CREATOR_ORG}</p>
          <p className="text-sm text-slate">{CREATOR_YEAR}</p>
          <hr className="my-3 border-line" />
          <p className="text-xs text-slate">
            Personagens: DiceBear (avatares CC0). Interface e cenario: arte vetorial propria.
            Tema alinhado aos ODS 4 e 16 da ONU.
          </p>
        </Panel>

        <AuroraButton onClick={back}>VOLTAR</AuroraButton>
      </div>
    </div>
  );
}
