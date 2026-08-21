from __future__ import annotations

import arcade

from src import config, ui
from src.content.missions import MISSIONS
from src.content.roles import LEVEL_SUMMARY, ROLE_INFO, ROLE_ORDER


class JournalView(arcade.View):
    def __init__(self, world_view: arcade.View) -> None:
        super().__init__()
        self.world_view = world_view
        self.learned = list(world_view.state.get("learned_roles", []))
        self.completed = list(world_view.state.get("completed_missions", []))
        self.extra_stars = world_view.state.get("extra_stars", 0)
        self.sidequests = world_view.state.get("sidequests", {})

    def on_draw(self) -> None:
        self.clear(config.COLOR_BG)
        cx = config.SCREEN_WIDTH / 2
        ui.label("DIARIO DE CIDADANIA", cx, config.SCREEN_HEIGHT - 60, config.COLOR_ACCENT, 30, anchor_x="center", bold=True)

        # Comparacao entre niveis de governo.
        ui.label("Quem cuida de que", 70, config.SCREEN_HEIGHT - 110, config.COLOR_TEXT, 16, bold=True)
        for i, (level, text) in enumerate(LEVEL_SUMMARY):
            y = config.SCREEN_HEIGHT - 140 - i * 34
            ui.label(level, 80, y, config.COLOR_HIGHLIGHT, 14, bold=True)
            ui.label(text, 250, y, config.COLOR_TEXT_SOFT, 13, width=780, multiline=True)

        # Cargos aprendidos.
        top = config.SCREEN_HEIGHT - 270
        ui.label("Cargos conhecidos", 70, top + 20, config.COLOR_TEXT, 16, bold=True)
        for i, key in enumerate(ROLE_ORDER):
            info = ROLE_INFO[key]
            column = i % 2
            row = i // 2
            x = 70 + column * 520
            y = top - row * 76
            unlocked = key in self.learned
            title_color = config.COLOR_OK if unlocked else (110, 120, 118)
            name = info["title"] if unlocked else "??? (bloqueado)"
            ui.label(f"{name}  -  {info['level']}", x, y, title_color, 14, bold=True)
            if unlocked:
                ui.label("Faz: " + info["does"], x, y - 20, config.COLOR_TEXT, 12, width=480, multiline=True)
                ui.label("Nao faz: " + info["not"], x, y - 40, config.COLOR_TEXT_SOFT, 12, width=480, multiline=True)
            else:
                ui.label("Conclua as missoes para revelar este cargo.", x, y - 20, (110, 120, 118), 12, width=480, multiline=True)

        sq_done = sum(1 for st in self.sidequests.values() if st.get("done"))
        stars = len(self.completed) + self.extra_stars
        ui.label(f"Progresso: {len(self.learned)}/{len(ROLE_ORDER)} cargos  |  Side quests: {sq_done}/{len(MISSIONS)}", cx, 46, config.COLOR_TEXT_SOFT, 13, anchor_x="center")
        ui.label(f"Cidadania: {stars} estrelas  ({len(self.completed)} missoes + {self.extra_stars} moradores)", cx, 66, config.COLOR_ACCENT, 13, anchor_x="center", bold=True)
        ui.label("Esc ou J para voltar", cx, 24, config.COLOR_TEXT_SOFT, 12, anchor_x="center")

    def on_key_press(self, key: int, modifiers: int) -> None:
        if key in (arcade.key.ESCAPE, arcade.key.J, arcade.key.ENTER):
            self.window.show_view(self.world_view)
