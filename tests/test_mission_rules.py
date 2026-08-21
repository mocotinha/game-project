from src.rules import answer_municipal_health_mission
from src.content.missions import MISSIONS, evidence_ids
from src.content.problems import PROBLEMS_BY_MISSION
from src.content.sidequests import SIDEQUESTS_BY_MISSION


def test_municipal_mission_accepts_city_level_responsibility():
    result = answer_municipal_health_mission("A")

    assert result.correct is True
    assert "Correto" in result.feedback


def test_municipal_mission_rejects_federal_shortcut():
    result = answer_municipal_health_mission("B")

    assert result.correct is False
    assert "tente novamente" in result.feedback.lower()


def test_each_mission_has_problem_sidequest_and_evidence():
    for mission in MISSIONS:
        assert mission.problem_id == PROBLEMS_BY_MISSION[mission.id].id
        assert mission.evidence == evidence_ids(mission.id)
        assert mission.id in SIDEQUESTS_BY_MISSION
        assert {eid for eid, _ in mission.hints} == set(mission.evidence)


def test_sidequest_grants_and_testimonies_match_targets():
    for mission in MISSIONS:
        sq = SIDEQUESTS_BY_MISSION[mission.id]
        assert sq.grants == f"{mission.id}:testemunho"
        assert set(sq.testimonies) == set(sq.targets)
