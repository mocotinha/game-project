import { useState } from "react";
import { KeyboardMenu, Panel, Title, type MenuItem } from "../../ui/components";

export default function Pause({
  onContinue,
  onJournal,
  onSave,
  onConfig,
  onMenu,
}: {
  onContinue: () => void;
  onJournal: () => void;
  onSave: () => void;
  onConfig: () => void;
  onMenu: () => void;
}) {
  const [index, setIndex] = useState(0);
  const items: MenuItem[] = [
    { label: "CONTINUAR", onSelect: onContinue },
    { label: "DIARIO", onSelect: onJournal },
    { label: "SALVAR", onSelect: onSave },
    { label: "CONFIGURACOES", onSelect: onConfig },
    { label: "MENU PRINCIPAL", onSelect: onMenu },
  ];

  return (
    <div className="absolute inset-0 grid place-items-center bg-ink/85 p-8">
      <div className="flex flex-col items-center gap-6">
        <Title>Pausa</Title>
        <Panel className="w-80 p-6">
          <KeyboardMenu items={items} index={index} setIndex={setIndex} />
        </Panel>
      </div>
    </div>
  );
}
