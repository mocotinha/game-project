// Ponte de eventos React <-> Phaser. Emitter tipado e simples.

export type GameMode = "explore" | "story" | "dialogue" | "mission" | "complete";

export interface DialoguePayload {
  speaker: string;
  line: string;
  index: number;
  count: number;
}

export interface MissionOptionView {
  letter: string;
  text: string;
}

export interface MissionPayload {
  missionId: string;
  title: string;
  question: string;
  options: MissionOptionView[];
  /** provas coletadas exibidas no checklist. */
  checklist: { label: string; done: boolean }[];
  ready: boolean;
  feedback?: string;
}

export interface StoryPayload {
  title: string;
  body: string;
  isFinal: boolean;
}

export interface HudPayload {
  region: string;
  stars: number;
  objective: string;
  prompt: string;
}

// Eventos emitidos PELO jogo (Phaser) e consumidos pela UI (React).
export type GameToUi = {
  mode: (mode: GameMode) => void;
  dialogue: (payload: DialoguePayload | null) => void;
  mission: (payload: MissionPayload | null) => void;
  story: (payload: StoryPayload | null) => void;
  hud: (payload: HudPayload) => void;
  toast: (message: string) => void;
  interior: (title: string | null) => void;
  victory: (stars: number) => void;
};

// Comandos enviados PELA UI (React) e consumidos pelo jogo (Phaser).
export type UiToGame = {
  advanceDialogue: () => void;
  closeDialogue: () => void;
  answer: (letter: string) => void;
  closeMission: () => void;
  advanceStory: () => void;
  requestPause: () => void;
  toggleJournal: () => void;
};

type AnyHandler = (...args: any[]) => void;

class Emitter<Events extends Record<string, AnyHandler>> {
  private handlers = new Map<keyof Events, Set<AnyHandler>>();

  on<K extends keyof Events>(event: K, handler: Events[K]): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof Events>(event: K, handler: Events[K]): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    this.handlers.get(event)?.forEach((h) => h(...args));
  }
}

// Duas trilhas distintas para evitar loops de eventos.
export const gameBus = new Emitter<GameToUi>();
export const uiBus = new Emitter<UiToGame>();
