from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import arcade
from arcade.gui import NinePatchTexture
from arcade.types import LBWH

_cache: dict[tuple, arcade.Text] = {}

UI_ROOT = Path(__file__).resolve().parents[1] / "assets" / "kenney" / "ui-pack" / "PNG"
GEN_ROOT = Path(__file__).resolve().parents[1] / "assets" / "kenney" / "_generated"

# Tema Kenney por estado de botao.
_BUTTON_THEME = {"normal": "Blue", "selected": "Yellow", "ok": "Green", "danger": "Red", "neutral": "Grey"}


def label(
    text: str,
    x: float,
    y: float,
    color=(240, 240, 232),
    font_size: float = 12,
    *,
    anchor_x: str = "left",
    bold: bool = False,
    width: int | None = None,
    multiline: bool = False,
    align: str = "left",
) -> None:
    """Desenha texto reutilizando objetos arcade.Text (evita o custo de draw_text)."""
    key = (text, round(x), round(y), font_size, anchor_x, bold, width, multiline, align, tuple(color))
    obj = _cache.get(key)
    if obj is None:
        if len(_cache) > 3000:
            _cache.clear()
        obj = arcade.Text(
            text,
            x,
            y,
            color,
            font_size,
            width=width,
            align=align,
            bold=bold,
            anchor_x=anchor_x,
            multiline=multiline,
        )
        _cache[key] = obj
    obj.draw()


# ---- Kenney UI Pack (CC0): paineis e botoes 9-slice ----
@lru_cache(maxsize=None)
def _ui_texture(rel: str):
    return arcade.load_texture(str(UI_ROOT / rel))


@lru_cache(maxsize=None)
def _dark_panel_texture():
    """Versao escura do painel Kenney para casar com o tema do jogo (texto claro)."""
    out = GEN_ROOT / "ui_panel_dark.png"
    if not out.exists():
        from PIL import Image

        src = Image.open(UI_ROOT / "Grey" / "Default" / "button_rectangle_border.png").convert("RGBA")
        r, g, b, a = src.split()
        lum = Image.merge("RGB", (r, g, b)).convert("L")
        w, h = src.size
        dark = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        dp, lp, ap = dark.load(), lum.load(), a.load()
        for y in range(h):
            for x in range(w):
                v = lp[x, y]
                dp[x, y] = (int(v * 0.11), int(v * 0.15), int(v * 0.22), ap[x, y])
        out.parent.mkdir(parents=True, exist_ok=True)
        dark.save(out)
    return arcade.load_texture(str(out))


@lru_cache(maxsize=None)
def _nine(kind: str) -> NinePatchTexture:
    if kind == "panel":
        texture, inset = _dark_panel_texture(), 24
    elif kind == "input":
        texture, inset = _ui_texture("Extra/Default/input_rectangle.png"), 20
    else:
        theme = _BUTTON_THEME.get(kind, "Blue")
        texture, inset = _ui_texture(f"{theme}/Default/button_rectangle_flat.png"), 20
    return NinePatchTexture(left=inset, right=inset, bottom=inset, top=inset, texture=texture)


def panel(left: float, bottom: float, width: float, height: float, kind: str = "panel") -> None:
    """Desenha um painel/caixa 9-slice do UI Pack."""
    _nine(kind).draw_rect(rect=LBWH(left, bottom, width, height))


def name_tag(text: str, x: float, y: float, color, font_size: float = 11) -> None:
    """Rotulo flutuante com sombra escura para legibilidade sobre qualquer fundo."""
    label(text, x + 1, y - 1, (12, 16, 16), font_size, anchor_x="center", bold=True)
    label(text, x, y, color, font_size, anchor_x="center", bold=True)


def button(
    left: float,
    bottom: float,
    width: float,
    height: float,
    text: str,
    *,
    state: str = "normal",
    font_size: float = 18,
) -> None:
    """Desenha um botao 9-slice do UI Pack com rotulo centralizado."""
    _nine(state).draw_rect(rect=LBWH(left, bottom, width, height))
    text_color = (60, 52, 20) if state == "selected" else (255, 255, 255)
    label(text, left + width / 2, bottom + height / 2 - font_size * 0.62, text_color, font_size, anchor_x="center", bold=True)
