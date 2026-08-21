from __future__ import annotations

import arcade

from src import config, save_manager
from src.views.main_menu import MainMenuView


def main() -> None:
    settings = save_manager.load_settings()
    window = arcade.Window(config.SCREEN_WIDTH, config.SCREEN_HEIGHT, config.SCREEN_TITLE)
    if settings.get("fullscreen"):
        window.set_fullscreen(True)
    window.show_view(MainMenuView())
    arcade.run()


if __name__ == "__main__":
    main()
