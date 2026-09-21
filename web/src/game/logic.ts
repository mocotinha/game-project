// Logica central do jogo (regras portadas de world.py), operando sobre GameState.
// Compartilhada pela WorldScene (Phaser) e pelos testes de playthrough.

import type { GameState } from "./save";
import type { Mission } from "./content/missions";
import type { Problem } from "./content/problems";
import type { SideQuest } from "./content/sidequests";
import { SIDEQUESTS } from "./content/sidequests";

export function hasEvidence(state: GameState, id: string): boolean {
  return state.evidence.includes(id);
}

/** Concede uma prova; retorna true se foi adicionada agora. */
export function grantEvidence(state: GameState, id: string): boolean {
  if (!state.evidence.includes(id)) {
    state.evidence.push(id);
    return true;
  }
  return false;
}

export function missionReady(state: GameState, mission: Mission): boolean {
  return mission.evidence.every((e) => hasEvidence(state, e));
}

export function problemSolved(state: GameState, problem: Problem): boolean {
  return state.completed_missions.includes(problem.missionId);
}

/** Investiga um problema; concede "{mission}:problema". */
export function investigate(
  state: GameState,
  problem: Problem,
): { lines: string[]; granted: boolean } {
  if (problemSolved(state, problem)) {
    return { lines: [problem.descSolved], granted: false };
  }
  const lines = [problem.descUnsolved];
  const granted = grantEvidence(state, `${problem.missionId}:problema`);
  if (granted) lines.push("Prova registrada: voce investigou o problema.");
  return { lines, granted };
}

/** Le um documento (lei); concede a prova associada, se houver. */
export function readLaw(state: GameState, grants: string): boolean {
  return grants ? grantEvidence(state, grants) : false;
}

export function activeTargetQuest(state: GameState, name: string): SideQuest | null {
  for (const sq of SIDEQUESTS) {
    if (sq.targets.includes(name)) {
      const st = state.sidequests[sq.id];
      if (st && !st.done) return sq;
    }
  }
  return null;
}

/** Inicia/consulta uma side quest com o morador que a oferece. */
export function sidequestGiver(
  state: GameState,
  sq: SideQuest,
): { started: boolean; done: boolean; remaining: string[] } {
  const st = state.sidequests[sq.id];
  if (!st) {
    state.sidequests[sq.id] = { talked: [], done: false };
    return { started: true, done: false, remaining: [...sq.targets] };
  }
  if (st.done) return { started: false, done: true, remaining: [] };
  return { started: false, done: false, remaining: sq.targets.filter((t) => !st.talked.includes(t)) };
}

/** Ouve um alvo da side quest; ao ouvir todos concede testemunho + estrela. */
export function sidequestTalkTarget(
  state: GameState,
  sq: SideQuest,
  name: string,
): { lines: string[]; starGained: boolean } {
  const st = state.sidequests[sq.id];
  if (!st.talked.includes(name)) st.talked.push(name);
  const lines = [sq.testimonies[name] ?? ""];
  let starGained = false;
  if (sq.targets.every((t) => st.talked.includes(t)) && !st.done) {
    st.done = true;
    grantEvidence(state, sq.grants);
    state.extra_stars += 1;
    starGained = true;
    lines.push("Voce reuniu o testemunho dos moradores. (+1 estrela de cidadania)");
  }
  return { lines, starGained };
}

export function answerCorrect(mission: Mission, letter: string): boolean {
  return mission.options.some((o) => o.letter === letter && o.correct);
}

/** Registra a missao concluida e desbloqueia os cargos aprendidos. */
export function registerMission(state: GameState, mission: Mission): void {
  if (!state.completed_missions.includes(mission.id)) state.completed_missions.push(mission.id);
  for (const role of mission.roles) {
    if (!state.learned_roles.includes(role)) state.learned_roles.push(role);
  }
}

export function totalStars(state: GameState): number {
  return state.completed_missions.length + state.extra_stars;
}
