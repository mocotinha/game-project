import { useState } from "react";
import { useAppStore } from "../game/store";
import { CREATOR_ORG, DISCLAIMER } from "../game/config";
import { KeyboardMenu, Panel, Subtitle, Title, type MenuItem } from "../ui/components";

export default function MainMenu() {
  const go = useAppStore((s) => s.go);
  const [index, setIndex] = useState(0);

  const items: MenuItem[] = [
    { label: "NOVO JOGO", onSelect: () => go("new") },
    { label: "CARREGAR JOGO", onSelect: () => go("load") },
    { label: "CONFIGURACOES", onSelect: () => go("config") },
    { label: "CREDITOS", onSelect: () => go("credits") },
  ];

  return (
    <div className="flex h-full w-full items-center justify-center map-grid">
      <div className="flex w-full max-w-4xl flex-col items-center gap-10 px-8">
        <div className="flex flex-col items-center gap-3 text-center slide-in">
          <span className="hud-label text-emerald">Educacao Civica · Aurora do Brasil</span>
          <Title>Aurora: Quem Decide?</Title>
          <Subtitle>Descubra quem tem o poder de resolver cada problema da cidade.</Subtitle>
        </div>

        <Panel className="w-full max-w-md p-8">
          <KeyboardMenu items={items} index={index} setIndex={setIndex} />
        </Panel>

        <div className="max-w-2xl text-center">
          <p className="text-xs text-slate">{DISCLAIMER}</p>
          <p className="mt-1 text-xs text-slate/70">{CREATOR_ORG}</p>
        </div>
      </div>
    </div>
  );
}
