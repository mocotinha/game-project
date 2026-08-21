"""Composicao de telhados de predios a partir do pacote Kenney Roguelike Modern City (CC0).

Cada telhado e montado como um nine-slice (cantos/bordas/preenchimento) usando o
conjunto de tiles de uma cor e memorizado como PNG em ``assets/kenney/_generated``.
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[1]
TILES_DIR = PROJECT_ROOT / "assets" / "kenney" / "roguelike-modern-city" / "Tiles"
GEN_ROOT = PROJECT_ROOT / "assets" / "kenney" / "_generated"
COLS = 37

# Indice inicial (canto superior-esquerdo) do conjunto de telhado por cor.
ROOF_GROUPS = {"brick": 0, "grey": 8, "white": 16, "tan": 24, "green": 32}
# Componentes de fachada (parede frontal, na base do predio).
WINDOW_TILE = 601
DOOR_TILE = 621
AWNINGS = {"brick": 508, "grey": 504, "white": 504, "tan": 508, "green": 504}


@lru_cache(maxsize=None)
def _tile(index: int) -> Image.Image:
    return Image.open(TILES_DIR / f"tile_{index:04d}.png").convert("RGBA")


def _nine_index(group: int, col_type: int, row_type: int) -> int:
    return group + row_type * COLS + col_type


def _compose_building(color: str, cols_t: int, rows_t: int) -> Image.Image:
    group = ROOF_GROUPS[color]
    canvas = Image.new("RGBA", (cols_t * 16, rows_t * 16), (0, 0, 0, 0))
    for j in range(rows_t):
        row_type = 0 if j == 0 else (2 if j == rows_t - 1 else 1)
        for i in range(cols_t):
            col_type = 0 if i == 0 else (2 if i == cols_t - 1 else 1)
            canvas.alpha_composite(_tile(_nine_index(group, col_type, row_type)), (i * 16, j * 16))
    # Parede frontal (linha de baixo = sul): janelas, porta ao centro e toldo sobre ela.
    front = rows_t - 1
    mid = cols_t // 2
    awning = _tile(AWNINGS[color])
    for i in range(1, cols_t - 1):
        canvas.alpha_composite(_tile(DOOR_TILE) if i == mid else _tile(WINDOW_TILE), (i * 16, front * 16))
    if rows_t >= 3:
        canvas.alpha_composite(awning, (mid * 16, (front - 1) * 16))
    return canvas


def building_roof_png(color: str, cols_t: int, rows_t: int) -> Path:
    """Compoe (com cache em disco) um predio (telhado + fachada com portas/janelas)."""
    cols_t, rows_t = max(3, cols_t), max(3, rows_t)
    out = GEN_ROOT / f"building_{color}_{cols_t}x{rows_t}.png"
    if not out.exists():
        out.parent.mkdir(parents=True, exist_ok=True)
        _compose_building(color, cols_t, rows_t).save(out)
    return out


def available() -> bool:
    return TILES_DIR.exists()
