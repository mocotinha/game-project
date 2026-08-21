from __future__ import annotations

import arcade

from src import save_manager

SFX_PATHS = {
    "select": ":resources:sounds/hit1.wav",
    "confirm": ":resources:sounds/coin1.wav",
    "success": ":resources:sounds/upgrade1.wav",
    "error": ":resources:sounds/error1.wav",
    "back": ":resources:sounds/hurt1.wav",
}

MUSIC_PATHS = {
    "menu": ":resources:music/1918.mp3",
    "world": ":resources:music/funkyrobot.mp3",
}


class _Audio:
    def __init__(self) -> None:
        self._sfx: dict[str, object] = {}
        self._music: dict[str, object] = {}
        self._music_player = None
        self._current_track: str | None = None
        self.settings = save_manager.load_settings()

    def reload_settings(self) -> None:
        self.settings = save_manager.load_settings()
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
        if track == self._current_track and self._music_player is not None:
            return
        self.stop_music()
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
