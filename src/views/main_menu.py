from __future__ import annotations

import arcade

from src import config, save_manager, ui
from src.audio import audio
from src.views import Menu
from src.views.confirm import ConfirmView


class MainMenuView(arcade.View):
    def __init__(self) -> None:
        super().__init__()
        self.menu = Menu(
            ["NEW GAME", "LOAD GAME", "CONFIGURATION", "EXIT"],
            start_y=config.SCREEN_HEIGHT / 2 - 10,
        )
        self.settings = save_manager.load_settings()

    def on_show_view(self) -> None:
        self.settings = save_manager.load_settings()
        audio.reload_settings()
        audio.play_music("menu")

    def on_draw(self) -> None:
        ui.begin_frame(self)
        cx = config.SCREEN_WIDTH / 2
        # Cabecalho estilizado
        arcade.draw_lbwh_rectangle_filled(0, config.SCREEN_HEIGHT - 220, config.SCREEN_WIDTH, 220, (23, 40, 40))
        ui.label("AURORA: QUEM DECIDE?", cx, config.SCREEN_HEIGHT - 120, config.COLOR_ACCENT, 44, anchor_x="center", bold=True)
        ui.label("Um jogo sobre quem decide o que na cidade, no estado e no pais.", cx, config.SCREEN_HEIGHT - 165, config.COLOR_TEXT_SOFT, 16, anchor_x="center")
        self.menu.draw(cx)
        ui.label(config.DISCLAIMER, cx, 40, config.COLOR_TEXT_SOFT, 12, anchor_x="center")

    def on_key_press(self, key: int, modifiers: int) -> None:
        if key in (arcade.key.UP, arcade.key.W):
            self.menu.move(-1)
        elif key in (arcade.key.DOWN, arcade.key.S):
            self.menu.move(1)
        elif key in (arcade.key.ENTER, arcade.key.SPACE):
            self._activate()

    def _activate(self) -> None:
        choice = self.menu.selected()
        audio.play_sfx("confirm")
        if choice == "NEW GAME":
            from src.views.new_game import NewGameView

            self.window.show_view(NewGameView())
        elif choice == "LOAD GAME":
            from src.views.load_game import LoadGameView

            self.window.show_view(LoadGameView())
        elif choice == "CONFIGURATION":
            from src.views.configuration import ConfigurationView

            self.window.show_view(ConfigurationView(self))
        elif choice == "EXIT":
            self.window.show_view(
                ConfirmView("Deseja realmente sair do jogo?", arcade.exit, self)
            )
