import { useAppStore } from "../game/store";
import type { Settings } from "../game/save";
import { AuroraButton, Panel, Title, VolumeBar } from "../ui/components";

const TEXT_SIZES: Settings["text_size"][] = ["small", "normal", "large"];

export default function Configuration() {
  const back = useAppStore((s) => s.back);
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);

  function step(value: number, dir: number): number {
    return Math.max(0, Math.min(1, Math.round((value + dir * 0.1) * 10) / 10));
  }

  function cycleText(dir: number): Settings["text_size"] {
    const i = TEXT_SIZES.indexOf(settings.text_size);
    return TEXT_SIZES[(i + dir + TEXT_SIZES.length) % TEXT_SIZES.length];
  }

  const Row = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between gap-6 border-b border-line py-3">
      <span className="font-display text-cream">{label}</span>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );

  const Adjust = ({ onLeft, onRight, children }: { onLeft: () => void; onRight: () => void; children: React.ReactNode }) => (
    <>
      <button className="px-2 text-gold hover:text-gold-deep" onClick={onLeft}>◀</button>
      <div className="min-w-28 text-center">{children}</div>
      <button className="px-2 text-gold hover:text-gold-deep" onClick={onRight}>▶</button>
    </>
  );

  return (
    <div className="flex h-full w-full items-center justify-center map-grid">
      <div className="flex w-full max-w-2xl flex-col gap-6 px-8">
        <Title>Configuracoes</Title>

        <Panel className="flex flex-col p-6">
          <Row label="Volume da musica">
            <Adjust
              onLeft={() => setSettings({ music_volume: step(settings.music_volume, -1) })}
              onRight={() => setSettings({ music_volume: step(settings.music_volume, 1) })}
            >
              <VolumeBar value={settings.music_volume} />
            </Adjust>
          </Row>
          <Row label="Volume dos efeitos">
            <Adjust
              onLeft={() => setSettings({ sound_volume: step(settings.sound_volume, -1) })}
              onRight={() => setSettings({ sound_volume: step(settings.sound_volume, 1) })}
            >
              <VolumeBar value={settings.sound_volume} />
            </Adjust>
          </Row>
          <Row label="Legendas">
            <AuroraButton
              variant="ghost"
              onClick={() => setSettings({ subtitles: !settings.subtitles })}
            >
              {settings.subtitles ? "LIGADAS" : "DESLIGADAS"}
            </AuroraButton>
          </Row>
          <Row label="Tamanho do texto">
            <Adjust
              onLeft={() => setSettings({ text_size: cycleText(-1) })}
              onRight={() => setSettings({ text_size: cycleText(1) })}
            >
              <span className="font-display uppercase text-emerald">{settings.text_size}</span>
            </Adjust>
          </Row>
          <Row label="Alto contraste">
            <AuroraButton
              variant="ghost"
              onClick={() => setSettings({ high_contrast: !settings.high_contrast })}
            >
              {settings.high_contrast ? "LIGADO" : "DESLIGADO"}
            </AuroraButton>
          </Row>
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
