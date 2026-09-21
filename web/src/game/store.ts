import { create } from "zustand";
import { audio } from "./audio";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type GameState,
  type Settings,
} from "./save";

export type Screen =
  | "menu"
  | "config"
  | "load"
  | "new"
  | "credits"
  | "game";

interface AppState {
  screen: Screen;
  previous: Screen;
  activeSlot: number | null;
  gameState: GameState | null;
  showTutorial: boolean;
  settings: Settings;
  go: (screen: Screen) => void;
  back: () => void;
  startGame: (slot: number, state: GameState, showTutorial: boolean) => void;
  setSettings: (patch: Partial<Settings>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  screen: "menu",
  previous: "menu",
  activeSlot: null,
  gameState: null,
  showTutorial: false,
  settings: typeof window !== "undefined" ? loadSettings() : { ...DEFAULT_SETTINGS },
  go: (screen) => set({ previous: get().screen, screen }),
  back: () => set({ screen: get().previous }),
  startGame: (slot, state, showTutorial) =>
    set({ activeSlot: slot, gameState: state, showTutorial, screen: "game" }),
  setSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    saveSettings(next);
    audio.setVolumes(next.music_volume, next.sound_volume);
    set({ settings: next });
  },
}));
