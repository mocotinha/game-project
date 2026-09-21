// Persistencia em localStorage, espelhando src/save_manager.py (mesmos campos JSON).

export interface Position {
  x: number;
  y: number;
}

export interface SideQuestState {
  talked: string[];
  done: boolean;
}

export interface GameState {
  player_name: string;
  region: string;
  position: Position;
  completed_missions: string[];
  learned_roles: string[];
  evidence: string[];
  sidequests: Record<string, SideQuestState>;
  extra_stars: number;
  updated_at: string;
}

export interface Settings {
  music_volume: number;
  sound_volume: number;
  fullscreen: boolean;
  subtitles: boolean;
  text_size: "small" | "normal" | "large";
  high_contrast: boolean;
}

export const SLOT_COUNT = 3;

const SLOT_KEY = (slot: number) => `aurora:save_${slot}`;
const SETTINGS_KEY = "aurora:settings";

export const DEFAULT_SETTINGS: Settings = {
  music_volume: 0.6,
  sound_volume: 0.8,
  fullscreen: false,
  subtitles: true,
  text_size: "normal",
  high_contrast: false,
};

function nowIso(): string {
  return new Date().toISOString().slice(0, 19);
}

export function loadSettings(): Settings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    saveSettings(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS };
  }
  try {
    const data = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...data };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function newGameState(playerName = "Joana"): GameState {
  return {
    player_name: playerName,
    region: "praca_central",
    position: { x: 600, y: 1200 },
    completed_missions: [],
    learned_roles: [],
    evidence: [],
    sidequests: {},
    extra_stars: 0,
    updated_at: nowIso(),
  };
}

export function slotExists(slot: number): boolean {
  return localStorage.getItem(SLOT_KEY(slot)) !== null;
}

export function loadSlot(slot: number): GameState | null {
  const raw = localStorage.getItem(SLOT_KEY(slot));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function saveSlot(slot: number, state: GameState): void {
  const payload = { ...state, updated_at: nowIso() };
  localStorage.setItem(SLOT_KEY(slot), JSON.stringify(payload));
}

export function deleteSlot(slot: number): void {
  localStorage.removeItem(SLOT_KEY(slot));
}

export function slotSummary(slot: number): string {
  const state = loadSlot(slot);
  if (!state) return "VAZIO";
  const name = state.player_name ?? "Joana";
  const region = String(state.region ?? "praca_central")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const missions = (state.completed_missions ?? []).length;
  const updated = String(state.updated_at ?? "").slice(0, 16).replace("T", " ");
  return `${name}  |  ${region}  |  missoes: ${missions}  |  ${updated}`;
}
