from __future__ import annotations

import arcade

from src import config, save_manager, ui
from src.views import Menu
from src.views.confirm import ConfirmView


class NewGameView(arcade.View):
    def __init__(self) -> None:
        super().__init__()
        options = [f"SLOT {i}: {save_manager.slot_summary(i)}" for i in range(1, save_manager.SLOT_COUNT + 1)]
        options.append("VOLTAR")
        self.menu = Menu(options, start_y=config.SCREEN_HEIGHT / 2 + 20, spacing=54, width=940, font_size=14)

    def on_draw(self) -> None:
        ui.begin_frame(self)
        cx = config.SCREEN_WIDTH / 2
        ui.label("NEW GAME", cx, config.SCREEN_HEIGHT - 90, config.COLOR_ACCENT, 34, anchor_x="center", bold=True)
        ui.label("Escolha um espaco para iniciar uma nova campanha com Joana.", cx, config.SCREEN_HEIGHT - 135, config.COLOR_TEXT_SOFT, 15, anchor_x="center")
        self.menu.draw(cx)
        ui.label(config.DISCLAIMER, cx, 40, config.COLOR_TEXT_SOFT, 12, anchor_x="center")

    def on_key_press(self, key: int, modifiers: int) -> None:
        if key in (arcade.key.UP, arcade.key.W):
            self.menu.move(-1)
        elif key in (arcade.key.DOWN, arcade.key.S):
            self.menu.move(1)
        elif key == arcade.key.ESCAPE:
            self._back()
        elif key in (arcade.key.ENTER, arcade.key.SPACE):
            self._activate()

    def _back(self) -> None:
        from src.views.main_menu import MainMenuView

        self.window.show_view(MainMenuView())

    def _activate(self) -> None:
        if self.menu.index == save_manager.SLOT_COUNT:
            self._back()
            return
        slot = self.menu.index + 1

        def start() -> None:
            state = save_manager.new_game_state()
            save_manager.save_slot(slot, state)
            from src.views.world import WorldView

            self.window.show_view(WorldView(slot, state, show_tutorial=True))

        question = (
            "Iniciar nova campanha neste espaco?\n"
            "Um novo save sera criado. Personagens sao ficticios e o conteudo e educativo."
        )
        self.window.show_view(ConfirmView(question, start, self))
