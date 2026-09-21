import { describe, expect, it } from "vitest";
import { MISSIONS, evidenceIds, nextMission } from "../missions";
import { PROBLEMS_BY_MISSION } from "../problems";
import { SIDEQUESTS_BY_MISSION } from "../sidequests";
import { answerMunicipalHealthMission } from "../../rules";

describe("regras da missao municipal", () => {
  it("aceita a responsabilidade de nivel municipal (A)", () => {
    const result = answerMunicipalHealthMission("A");
    expect(result.correct).toBe(true);
    expect(result.feedback).toContain("Correto");
  });

  it("rejeita o atalho federal (B)", () => {
    const result = answerMunicipalHealthMission("B");
    expect(result.correct).toBe(false);
    expect(result.feedback.toLowerCase()).toContain("tente novamente");
  });
});

describe("integridade do conteudo das missoes", () => {
  it("cada missao tem problema, sidequest, evidencia e dicas coerentes", () => {
    for (const mission of MISSIONS) {
      expect(mission.problemId).toBe(PROBLEMS_BY_MISSION[mission.id].id);
      expect(mission.evidence).toEqual(evidenceIds(mission.id));
      expect(SIDEQUESTS_BY_MISSION[mission.id]).toBeDefined();
      expect(new Set(mission.hints.map(([eid]) => eid))).toEqual(new Set(mission.evidence));
    }
  });

  it("cada opcao tem exatamente uma resposta correta", () => {
    for (const mission of MISSIONS) {
      const correct = mission.options.filter((o) => o.correct);
      expect(correct).toHaveLength(1);
    }
  });

  it("sidequest concede o testemunho e testemunhos batem com os alvos", () => {
    for (const mission of MISSIONS) {
      const sq = SIDEQUESTS_BY_MISSION[mission.id];
      expect(sq.grants).toBe(`${mission.id}:testemunho`);
      expect(new Set(Object.keys(sq.testimonies))).toEqual(new Set(sq.targets));
    }
  });
});

describe("progressao de missoes", () => {
  it("desbloqueia missoes na ordem correta", () => {
    expect(nextMission([])?.order).toBe(1);
    expect(nextMission(["saude_bairro"])?.order).toBe(2);
    expect(nextMission(MISSIONS.map((m) => m.id))).toBeNull();
  });
});
