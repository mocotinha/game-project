from __future__ import annotations

import arcade

from src import config, ui
from src.content.missions import MISSIONS


class CreditsView(arcade.View):
    def __init__(self, previous: arcade.View | None = None) -> None:
        super().__init__()
        self.previous = previous

    def on_draw(self) -> None:
        self.clear(config.COLOR_BG)
        cx = config.SCREEN_WIDTH / 2
        arcade.draw_lbwh_rectangle_filled(0, config.SCREEN_HEIGHT - 150, config.SCREEN_WIDTH, 150, (23, 40, 40))
        ui.label("AURORA: QUEM DECIDE?", cx, config.SCREEN_HEIGHT - 80, config.COLOR_ACCENT, 40, anchor_x="center", bold=True)
        ui.label("Parabens! Voce concluiu a jornada da cidadania.", cx, config.SCREEN_HEIGHT - 120, config.COLOR_TEXT_SOFT, 16, anchor_x="center")

        # Estrelas de cidadania (todas conquistadas).
        total = len(MISSIONS)
        star_w = 42
        start_x = cx - (total - 1) * star_w / 2
        for i in range(total):
            _draw_star(start_x + i * star_w, config.SCREEN_HEIGHT - 190, 14, True)

        y = config.SCREEN_HEIGHT - 260
        lines = [
            ("Criado por", config.CREATOR_NAME),
            ("Instituicao", config.CREATOR_ORG),
            ("Ano", config.CREATOR_YEAR),
            ("Motor", "Python Arcade"),
            ("Arte dos personagens", "Kenney - Roguelike Characters (CC0)"),
            ("Tiles e recursos", "Kenney (CC0)"),
            ("Tema", "Educacao politica e cidadania (ODS 4)"),
        ]
        for label, value in lines:
            ui.label(label, cx - 260, y, config.COLOR_TEXT_SOFT, 15, anchor_x="right")
            ui.label(value, cx - 230, y, config.COLOR_TEXT, 15)
            y -= 40

        ui.label("Obrigado por jogar. Enter para voltar ao menu.", cx, 60, config.COLOR_HIGHLIGHT, 15, anchor_x="center", bold=True)
        ui.label(config.DISCLAIMER, cx, 30, config.COLOR_TEXT_SOFT, 11, anchor_x="center")

    def on_key_press(self, key: int, modifiers: int) -> None:
        if key in (arcade.key.ENTER, arcade.key.SPACE, arcade.key.ESCAPE):
            from src.views.main_menu import MainMenuView

            self.window.show_view(MainMenuView())


def _draw_star(x: float, y: float, radius: float, filled: bool) -> None:
    import math

    points = []
    for i in range(10):
        r = radius if i % 2 == 0 else radius * 0.45
        ang = -math.pi / 2 + i * math.pi / 5
        points.append((x + r * math.cos(ang), y + r * math.sin(ang)))
    color = (250, 205, 90) if filled else (70, 78, 84)
    arcade.draw_polygon_filled(points, color)
    arcade.draw_polygon_outline(points, (180, 140, 60) if filled else (90, 98, 104), 1)
