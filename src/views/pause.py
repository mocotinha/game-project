from __future__ import annotations

import arcade

from src import config, save_manager, ui
from src.audio import audio
from src.views import Menu
from src.views.confirm import ConfirmView


class PauseView(arcade.View):
    def __init__(self, world_view: arcade.View) -> None:
        super().__init__()
        self.world_view = world_view
        self.menu = Menu(
            ["CONTINUAR", "DIARIO", "SALVAR", "CONFIGURATION", "MENU PRINCIPAL"],
            start_y=config.SCREEN_HEIGHT / 2 + 30,
        )
        self.message = ""

    def on_draw(self) -> None:
        self.clear(config.COLOR_BG)
        cx = config.SCREEN_WIDTH / 2
        ui.label("PAUSA", cx, config.SCREEN_HEIGHT - 120, config.COLOR_ACCENT, 40, anchor_x="center", bold=True)
        self.menu.draw(cx)
        if self.message:
            ui.label(self.message, cx, 70, config.COLOR_OK, 14, anchor_x="center")

    def on_key_press(self, key: int, modifiers: int) -> None:
        if key in (arcade.key.UP, arcade.key.W):
            self.menu.move(-1)
        elif key in (arcade.key.DOWN, arcade.key.S):
            self.menu.move(1)
        elif key == arcade.key.ESCAPE:
            self.window.show_view(self.world_view)
        elif key in (arcade.key.ENTER, arcade.key.SPACE):
            self._activate()

    def _activate(self) -> None:
        choice = self.menu.selected()
        audio.play_sfx("confirm")
        if choice == "CONTINUAR":
            self.window.show_view(self.world_view)
        elif choice == "DIARIO":
            from src.views.journal import JournalView

            self.window.show_view(JournalView(self.world_view))
        elif choice == "SALVAR":
            save_manager.save_slot(self.world_view.slot, self.world_view.state)
            self.message = "Progresso salvo."
        elif choice == "CONFIGURATION":
            from src.views.configuration import ConfigurationView

            self.window.show_view(ConfigurationView(self))
        elif choice == "MENU PRINCIPAL":
            def go_menu() -> None:
                save_manager.save_slot(self.world_view.slot, self.world_view.state)
                from src.views.main_menu import MainMenuView

                self.window.show_view(MainMenuView())

            self.window.show_view(
                ConfirmView("Voltar ao menu principal? O progresso sera salvo.", go_menu, self)
            )
