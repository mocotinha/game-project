from __future__ import annotations

import arcade

from src import config, ui
from src.views import Menu


class ConfirmView(arcade.View):
    """Tela generica de confirmacao com YES/NO."""

    def __init__(self, question: str, on_yes, previous: arcade.View) -> None:
        super().__init__()
        self.question = question
        self.on_yes = on_yes
        self.previous = previous
        self.menu = Menu(["SIM", "NAO"], start_y=config.SCREEN_HEIGHT / 2 - 40)

    def on_draw(self) -> None:
        self.clear(config.COLOR_BG)
        cx = config.SCREEN_WIDTH / 2
        arcade.draw_lbwh_rectangle_filled(cx - 380, config.SCREEN_HEIGHT / 2 - 120, 760, 260, config.COLOR_PANEL)
        arcade.draw_lbwh_rectangle_outline(cx - 380, config.SCREEN_HEIGHT / 2 - 120, 760, 260, config.COLOR_ACCENT, 2)
        ui.label(self.question, cx, config.SCREEN_HEIGHT / 2 + 70, config.COLOR_TEXT, 20, anchor_x="center", width=680, align="center", multiline=True)
        self.menu.draw(cx)

    def on_key_press(self, key: int, modifiers: int) -> None:
        if key in (arcade.key.UP, arcade.key.W, arcade.key.DOWN, arcade.key.S):
            self.menu.move(1)
        elif key == arcade.key.ESCAPE:
            self.window.show_view(self.previous)
        elif key in (arcade.key.ENTER, arcade.key.SPACE):
            if self.menu.selected() == "SIM":
                self.on_yes()
            else:
                self.window.show_view(self.previous)
