import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { createGame } from "../../game/game";
import { gameBus, uiBus } from "../../game/bus";
import { useAppStore } from "../../game/store";
import { saveSlot } from "../../game/save";
import Hud from "./Hud";
import DialogueBox from "./DialogueBox";
import MissionPanel from "./MissionPanel";
import StoryPanel from "./StoryPanel";
import Journal from "./Journal";
import Pause from "./Pause";

export default function GameScreen() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  const slot = useAppStore((s) => s.activeSlot);
  const state = useAppStore((s) => s.gameState);
  const showTutorial = useAppStore((s) => s.showTutorial);
  const go = useAppStore((s) => s.go);

  const [interiorTitle, setInteriorTitle] = useState<string | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!hostRef.current || slot === null || !state) return;
    const game = createGame(hostRef.current, { slot, state, showTutorial });
    gameRef.current = game;
    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const offs = [
      gameBus.on("interior", setInteriorTitle),
      gameBus.on("toast", (m) => {
        setToast(m);
        setTimeout(() => setToast(null), 2200);
      }),
      gameBus.on("victory", () => go("credits")),
      uiBus.on("toggleJournal", () => setJournalOpen((v) => !v)),
      uiBus.on("requestPause", () => setPauseOpen(true)),
    ];
    return () => offs.forEach((off) => off());
  }, [go]);

  // Pausa a cena Phaser enquanto um overlay bloqueante estiver aberto.
  const blocking = journalOpen || pauseOpen;
  useEffect(() => {
    const scene = gameRef.current?.scene.getScene("world");
    if (!scene) return;
    if (blocking) gameRef.current?.scene.pause("world");
    else gameRef.current?.scene.resume("world");
  }, [blocking]);

  // Teclas globais para overlays (a cena esta pausada e nao recebe input).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "j" || e.key === "J") {
        if (pauseOpen) return;
        setJournalOpen((v) => !v);
      } else if (e.key === "Escape") {
        if (journalOpen) setJournalOpen(false);
        else if (pauseOpen) setPauseOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [journalOpen, pauseOpen]);

  function saveNow() {
    if (slot !== null && state) {
      saveSlot(slot, state);
      setToast("Jogo salvo.");
      setTimeout(() => setToast(null), 1800);
    }
  }

  return (
    <div className="relative h-full w-full bg-ink">
      <div ref={hostRef} className="absolute inset-0" />

      {!blocking && <Hud interiorTitle={interiorTitle} />}
      <DialogueBox />
      <MissionPanel />
      <StoryPanel />

      {journalOpen && state && (
        <Journal state={state} onClose={() => setJournalOpen(false)} />
      )}

      {pauseOpen && (
        <Pause
          onContinue={() => setPauseOpen(false)}
          onJournal={() => {
            setPauseOpen(false);
            setJournalOpen(true);
          }}
          onSave={saveNow}
          onConfig={() => go("config")}
          onMenu={() => go("menu")}
        />
      )}

      {toast && (
        <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-lg bg-emerald px-4 py-2 font-display text-ink shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
