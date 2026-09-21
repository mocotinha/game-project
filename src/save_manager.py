from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SAVES_DIR = PROJECT_ROOT / "saves"
SETTINGS_FILE = SAVES_DIR / "settings.json"
SLOT_COUNT = 3

DEFAULT_SETTINGS: dict[str, Any] = {
    "music_volume": 0.6,
    "sound_volume": 0.8,
    "music_enabled": True,
    "sfx_enabled": True,
    "fullscreen": False,
    "subtitles": True,
    "text_size": "normal",
    "high_contrast": False,
}


def _ensure_dir() -> None:
    SAVES_DIR.mkdir(parents=True, exist_ok=True)


def load_settings() -> dict[str, Any]:
    _ensure_dir()
    if not SETTINGS_FILE.exists():
        save_settings(DEFAULT_SETTINGS)
        return dict(DEFAULT_SETTINGS)
    try:
        data = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return dict(DEFAULT_SETTINGS)
    merged = dict(DEFAULT_SETTINGS)
    merged.update({key: data[key] for key in DEFAULT_SETTINGS if key in data})
    return merged


def save_settings(settings: dict[str, Any]) -> None:
    _ensure_dir()
    SETTINGS_FILE.write_text(json.dumps(settings, indent=2, ensure_ascii=False), encoding="utf-8")


def _slot_path(slot: int) -> Path:
    return SAVES_DIR / f"save_{slot}.json"


def slot_exists(slot: int) -> bool:
    return _slot_path(slot).exists()


def new_game_state(player_name: str = "Joana") -> dict[str, Any]:
    return {
        "player_name": player_name,
        "region": "praca_central",
        "position": {"x": 600.0, "y": 1200.0},
        "completed_missions": [],
        "learned_roles": [],
        "evidence": [],
        "sidequests": {},
        "extra_stars": 0,
        "updated_at": datetime.now().isoformat(timespec="seconds"),
    }


def load_slot(slot: int) -> dict[str, Any] | None:
    path = _slot_path(slot)
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def save_slot(slot: int, state: dict[str, Any]) -> None:
    _ensure_dir()
    state = dict(state)
    state["updated_at"] = datetime.now().isoformat(timespec="seconds")
    _slot_path(slot).write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")


def delete_slot(slot: int) -> None:
    path = _slot_path(slot)
    if path.exists():
        path.unlink()


def slot_summary(slot: int) -> str:
    state = load_slot(slot)
    if state is None:
        return "VAZIO"
    name = state.get("player_name", "Joana")
    region = str(state.get("region", "praca_central")).replace("_", " ").title()
    missions = len(state.get("completed_missions", []))
    updated = str(state.get("updated_at", ""))[:16].replace("T", " ")
    return f"{name}  |  {region}  |  missoes: {missions}  |  {updated}"
