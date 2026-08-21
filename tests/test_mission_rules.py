from src.rules import answer_municipal_health_mission


def test_municipal_mission_accepts_city_level_responsibility():
    result = answer_municipal_health_mission("A")

    assert result.correct is True
    assert "Correto" in result.feedback


def test_municipal_mission_rejects_federal_shortcut():
    result = answer_municipal_health_mission("B")

    assert result.correct is False
    assert "tente novamente" in result.feedback.lower()
