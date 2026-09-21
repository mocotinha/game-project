import { describe, expect, it } from "vitest";
import { newGameState } from "../../save";
import { MISSIONS, nextMission } from "../missions";
import { PROBLEMS_BY_MISSION } from "../problems";
import { SIDEQUESTS_BY_MISSION } from "../sidequests";
import { buildInteriors } from "../../world/interiors";
import * as logic from "../../logic";

function lawEvidenceId(missionId: string): string {
  return `${missionId}:lei`;
}

function correctLetter(missionId: string): string {
  const m = MISSIONS.find((x) => x.id === missionId)!;
  return m.options.find((o) => o.correct)!.letter;
}

describe("playthrough completo (inicio ao fim)", () => {
  it("conclui as 6 missoes na ordem, reunindo provas ate a vitoria", () => {
    const state = newGameState("Joana");
    const interiors = buildInteriors();

    // A cada passo a proxima missao deve ser a de menor ordem ainda pendente.
    for (let i = 0; i < MISSIONS.length; i++) {
      const mission = nextMission(state.completed_missions)!;
      expect(mission).toBeDefined();
      expect(mission.order).toBe(i + 1);

      // Sem provas, a missao ainda nao esta pronta.
      expect(logic.missionReady(state, mission)).toBe(false);

      // 1) Investigar o problema no mapa -> {id}:problema
      const problem = PROBLEMS_BY_MISSION[mission.id];
      logic.investigate(state, problem);
      expect(logic.hasEvidence(state, `${mission.id}:problema`)).toBe(true);

      // 2) Side quest: ouvir todos os moradores -> {id}:testemunho (+1 estrela)
      const sq = SIDEQUESTS_BY_MISSION[mission.id];
      logic.sidequestGiver(state, sq);
      let starGained = false;
      for (const target of sq.targets) {
        const r = logic.sidequestTalkTarget(state, sq, target);
        starGained = starGained || r.starGained;
      }
      expect(starGained).toBe(true);
      expect(logic.hasEvidence(state, `${mission.id}:testemunho`)).toBe(true);

      // 3) Ler a lei no interior correspondente -> {id}:lei
      const lawId = lawEvidenceId(mission.id);
      const grantsLaw = Object.values(interiors)
        .flatMap((it) => it.items)
        .some((item) => item.grants === lawId);
      expect(grantsLaw).toBe(true);
      logic.readLaw(state, lawId);
      expect(logic.hasEvidence(state, lawId)).toBe(true);

      // Agora a missao esta pronta; responder corretamente conclui.
      expect(logic.missionReady(state, mission)).toBe(true);
      const letter = correctLetter(mission.id);
      expect(logic.answerCorrect(mission, letter)).toBe(true);
      logic.registerMission(state, mission);

      expect(state.completed_missions).toContain(mission.id);
      for (const role of mission.roles) {
        expect(state.learned_roles).toContain(role);
      }
    }

    // Estado final: tudo concluido.
    expect(state.completed_missions).toHaveLength(6);
    expect(nextMission(state.completed_missions)).toBeNull();
    // 6 estrelas de missao + 6 de side quests.
    expect(logic.totalStars(state)).toBe(12);
    // Todos os 7 cargos aprendidos.
    expect(new Set(state.learned_roles).size).toBe(7);
  });

  it("respostas erradas nao concluem a missao", () => {
    const mission = MISSIONS[0];
    const wrong = mission.options.find((o) => !o.correct)!.letter;
    expect(logic.answerCorrect(mission, wrong)).toBe(false);
  });
});
