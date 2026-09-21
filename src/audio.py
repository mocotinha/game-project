from __future__ import annotations

from pathlib import Path

import arcade

from src import save_manager

AUDIO_DIR = Path(__file__).resolve().parents[1] / "assets" / "audios"


def _audio(filename: str) -> str:
    return str(AUDIO_DIR / filename)


SFX_PATHS = {
    "select": _audio("RPG Menu Prompt.wav"),
    "confirm": _audio("RPG Coin 1.mp3"),
    "success": _audio("RPG Reward 1.mp3"),
    "error": _audio("Mobile Game Error 1.mp3"),
    "back": _audio("RPG Button 2.mp3"),
    "earn_item": _audio("RPG Earn Item 1.mp3"),
    "map_indication": _audio("RPG Map Indication 1.mp3"),
}

MUSIC_PATHS = {
    "menu": _audio("Lofi Hip-Hop - Full.mp3"),
    "world": _audio("Urban Tech.mp3"),
}


class _Audio:
    def __init__(self) -> None:
        self._sfx: dict[str, object] = {}
        self._music: dict[str, object] = {}
        self._music_player = None
        self._current_track: str | None = None
        self._desired_track: str | None = None
        self.settings = save_manager.load_settings()

    def reload_settings(self) -> None:
        self.settings = save_manager.load_settings()
        if not self.settings.get("music_enabled", True):
            self.stop_music()
            return
        if self._music_player is None and self._desired_track is not None:
            self.play_music(self._desired_track)
            return
        if self._music_player is not None:
            try:
                self._music_player.volume = float(self.settings.get("music_volume", 0.6))
            except Exception:
                pass

    def _get_sfx(self, name: str):
        if name not in self._sfx:
            try:
                self._sfx[name] = arcade.load_sound(SFX_PATHS[name])
            except Exception:
                self._sfx[name] = None
        return self._sfx[name]

    def play_sfx(self, name: str) -> None:
        if not self.settings.get("sfx_enabled", True):
            return
        volume = float(self.settings.get("sound_volume", 0.8))
        if volume <= 0:
            return
        sound = self._get_sfx(name)
        if sound is None:
            return
        try:
            arcade.play_sound(sound, volume=volume)
        except Exception:
            pass

    def play_music(self, track: str) -> None:
        self._desired_track = track
        if track == self._current_track and self._music_player is not None:
            return
        self.stop_music()
        if not self.settings.get("music_enabled", True):
            self._current_track = track
            return
        volume = float(self.settings.get("music_volume", 0.6))
        if volume <= 0:
            self._current_track = track
            return
        if track not in self._music:
            try:
                self._music[track] = arcade.load_sound(MUSIC_PATHS[track])
            except Exception:
                self._music[track] = None
        sound = self._music.get(track)
        if sound is None:
            return
        try:
            self._music_player = arcade.play_sound(sound, volume=volume, loop=True)
            self._current_track = track
        except Exception:
            self._music_player = None

    def stop_music(self) -> None:
        if self._music_player is not None:
            try:
                self._music_player.pause()
            except Exception:
                pass
        self._music_player = None
        self._current_track = None


audio = _Audio()
