from __future__ import annotations

from src import ui
from src.audio import audio


class Menu:
    """Lista vertical de opcoes navegavel por teclado."""

    def __init__(self, options: list[str], start_y: float, spacing: float = 58.0, width: float = 380.0, font_size: float = 19.0) -> None:
        self.options = options
        self.index = 0
        self.start_y = start_y
        self.spacing = spacing
        self.width = width
        self.font_size = font_size

    def move(self, delta: int) -> None:
        self.index = (self.index + delta) % len(self.options)
        audio.play_sfx("select")

    def selected(self) -> str:
        return self.options[self.index]

    def draw(self, center_x: float) -> None:
        for i, option in enumerate(self.options):
            y = self.start_y - i * self.spacing
            active = i == self.index
            ui.button(center_x - self.width / 2, y - 16, self.width, 46, option, state="selected" if active else "normal", font_size=self.font_size)
