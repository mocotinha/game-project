from __future__ import annotations

import arcade

from src import config, save_manager, ui
from src.audio import audio


class ConfigurationView(arcade.View):
    def __init__(self, previous: arcade.View) -> None:
        super().__init__()
        self.previous = previous
        self.settings = save_manager.load_settings()
        self.index = 0
        self.rows = [
            ("Music", "music_enabled"),
            ("Sound Effects", "sfx_enabled"),
            ("Music Volume", "music_volume"),
            ("Sound Volume", "sound_volume"),
            ("Fullscreen", "fullscreen"),
            ("Subtitles", "subtitles"),
            ("Text Size", "text_size"),
            ("High Contrast", "high_contrast"),
            ("Reset Progress", "_reset"),
            ("Back", "_back"),
        ]
        self.text_sizes = ["small", "normal", "large"]
        self.message = ""

    def on_draw(self) -> None:
        ui.begin_frame(self)
        cx = config.SCREEN_WIDTH / 2
        ui.label("CONFIGURATION", cx, config.SCREEN_HEIGHT - 80, config.COLOR_ACCENT, 34, anchor_x="center", bold=True)
        top = config.SCREEN_HEIGHT - 150
        for i, (label, key) in enumerate(self.rows):
            y = top - i * 50
            active = i == self.index
            if active:
                arcade.draw_lbwh_rectangle_filled(cx - 320, y - 12, 640, 42, (28, 44, 60))
                arcade.draw_lbwh_rectangle_outline(cx - 320, y - 12, 640, 42, config.COLOR_ACCENT, 2)
            color = config.COLOR_HIGHLIGHT if active else config.COLOR_TEXT_SOFT
            ui.label(label, cx - 300, y, color, 18, bold=active)
            ui.label(self._value_text(key), cx + 300, y, color, 18, anchor_x="right")
        ui.label("Use setas: navegar e ajustar.  Enter: confirmar.  Esc: voltar.", cx, 70, config.COLOR_TEXT_SOFT, 13, anchor_x="center")
        if self.message:
            ui.label(self.message, cx, 40, config.COLOR_OK, 13, anchor_x="center")

    def _value_text(self, key: str) -> str:
        if key in ("_reset", "_back"):
            return ""
        value = self.settings.get(key)
        if key in ("music_volume", "sound_volume"):
            filled = int(round(value * 10))
            return "[" + "#" * filled + "-" * (10 - filled) + f"] {int(value * 100)}%"
        if isinstance(value, bool):
            return "ON" if value else "OFF"
        return str(value).title()

    def on_key_press(self, key: int, modifiers: int) -> None:
        if key in (arcade.key.UP, arcade.key.W):
            self.index = (self.index - 1) % len(self.rows)
        elif key in (arcade.key.DOWN, arcade.key.S):
            self.index = (self.index + 1) % len(self.rows)
        elif key in (arcade.key.LEFT, arcade.key.A):
            self._adjust(-1)
        elif key in (arcade.key.RIGHT, arcade.key.D):
            self._adjust(1)
        elif key == arcade.key.ESCAPE:
            self._back()
        elif key in (arcade.key.ENTER, arcade.key.SPACE):
            self._activate()

    def _adjust(self, direction: int) -> None:
        _, key = self.rows[self.index]
        if key in ("music_volume", "sound_volume"):
            value = round(self.settings[key] + direction * 0.1, 1)
            self.settings[key] = min(1.0, max(0.0, value))
        elif key == "text_size":
            i = (self.text_sizes.index(self.settings[key]) + direction) % len(self.text_sizes)
            self.settings[key] = self.text_sizes[i]
        elif key in ("fullscreen", "subtitles", "high_contrast", "music_enabled", "sfx_enabled"):
            self.settings[key] = not self.settings[key]
        save_manager.save_settings(self.settings)
        audio.reload_settings()
        if key == "fullscreen":
            self.window.set_fullscreen(self.settings["fullscreen"])

    def _activate(self) -> None:
        _, key = self.rows[self.index]
        if key == "_back":
            self._back()
        elif key == "_reset":
            for slot in range(1, save_manager.SLOT_COUNT + 1):
                save_manager.delete_slot(slot)
            self.message = "Progresso reiniciado."
        elif key in ("fullscreen", "subtitles", "high_contrast", "music_enabled", "sfx_enabled"):
            self._adjust(1)

    def _back(self) -> None:
        save_manager.save_settings(self.settings)
        self.window.show_view(self.previous)
