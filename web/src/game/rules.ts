// Portado de src/rules.py

export interface MissionResult {
  correct: boolean;
  feedback: string;
}

export function answerMunicipalHealthMission(answer: string): MissionResult {
  if (answer === "A") {
    return {
      correct: true,
      feedback:
        "Correto. O prefeito administra servicos municipais; a Camara cria leis locais e fiscaliza.",
    };
  }
  return {
    correct: false,
    feedback:
      "Ainda nao. Pense no nivel de governo responsavel por servicos da cidade. Tente novamente.",
  };
}
