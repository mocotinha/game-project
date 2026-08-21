from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class MissionResult:
    correct: bool
    feedback: str


def answer_municipal_health_mission(answer: str) -> MissionResult:
    if answer == "A":
        return MissionResult(
            True,
            "Correto. O prefeito administra servicos municipais; a Camara cria leis locais e fiscaliza.",
        )
    return MissionResult(
        False,
        "Ainda nao. Pense no nivel de governo responsavel por servicos da cidade. Tente novamente.",
    )
