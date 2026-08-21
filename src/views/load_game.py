from __future__ import annotations

import arcade

from src import config, save_manager, ui
from src.views import Menu


class LoadGameView(arcade.View):
    def __init__(self) -> None:
        super().__init__()
        options = [f"SLOT {i}: {save_manager.slot_summary(i)}" for i in range(1, save_manager.SLOT_COUNT + 1)]
        options.append("VOLTAR")
        self.menu = Menu(options, start_y=config.SCREEN_HEIGHT / 2 + 20, spacing=54)
        self.message = ""

    def on_draw(self) -> None:
        self.clear(config.COLOR_BG)
        cx = config.SCREEN_WIDTH / 2
        ui.label("LOAD GAME", cx, config.SCREEN_HEIGHT - 90, config.COLOR_ACCENT, 34, anchor_x="center", bold=True)
        ui.label("Selecione um save para continuar. DEL apaga o espaco selecionado.", cx, config.SCREEN_HEIGHT - 135, config.COLOR_TEXT_SOFT, 15, anchor_x="center")
        self.menu.draw(cx)
        if self.message:
            ui.label(self.message, cx, 70, config.COLOR_OK, 14, anchor_x="center")
        ui.label(config.DISCLAIMER, cx, 40, config.COLOR_TEXT_SOFT, 12, anchor_x="center")

    def on_key_press(self, key: int, modifiers: int) -> None:
        if key in (arcade.key.UP, arcade.key.W):
            self.menu.move(-1)
        elif key in (arcade.key.DOWN, arcade.key.S):
            self.menu.move(1)
        elif key == arcade.key.ESCAPE:
            self._back()
        elif key == arcade.key.DELETE:
            self._delete()
        elif key in (arcade.key.ENTER, arcade.key.SPACE):
            self._activate()

    def _back(self) -> None:
        from src.views.main_menu import MainMenuView

        self.window.show_view(MainMenuView())

    def _refresh(self) -> None:
        for i in range(1, save_manager.SLOT_COUNT + 1):
            self.menu.options[i - 1] = f"SLOT {i}: {save_manager.slot_summary(i)}"

    def _delete(self) -> None:
        if self.menu.index < save_manager.SLOT_COUNT:
            slot = self.menu.index + 1
            save_manager.delete_slot(slot)
            self._refresh()
            self.message = f"Slot {slot} apagado."

    def _activate(self) -> None:
        if self.menu.index == save_manager.SLOT_COUNT:
            self._back()
            return
        slot = self.menu.index + 1
        state = save_manager.load_slot(slot)
        if state is None:
            self.message = "Este espaco esta vazio."
            return
        from src.views.world import WorldView

        self.window.show_view(WorldView(slot, state, show_tutorial=False))
