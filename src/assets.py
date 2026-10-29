from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import arcade

from src import modular

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ROGUELIKE_SHEET = str(PROJECT_ROOT / "assets" / "kenney" / "roguelike-characters" / "Spritesheet" / "roguelikeChar_transparent.png")
RMC_SHEET = str(PROJECT_ROOT / "assets" / "kenney" / "roguelike-modern-city" / "Tilemap" / "tilemap_packed.png")
VEHICLE_DIR = PROJECT_ROOT / "assets" / "kenney" / "pixel-vehicle-pack" / "PNG"
PERSON_GENDERS = ("man", "woman")

CHARACTER_KITS = {
    "female_person": "femalePerson",
    "male_person": "malePerson",
    "female_adventurer": "femaleAdventurer",
    "male_adventurer": "maleAdventurer",
    "zombie": "zombie",
    "robot": "robot",
}

PLAYER_KIT = "female_person"

PROP_TEXTURES = {
    "tree": ":resources:images/topdown_tanks/treeGreen_large.png",
    "tree_small": ":resources:images/topdown_tanks/treeGreen_small.png",
    "tree_brown": ":resources:images/topdown_tanks/treeBrown_large.png",
    "bush": ":resources:images/tiles/bush.png",
    "crate": ":resources:images/tiles/boxCrate.png",
    "crate_double": ":resources:images/tiles/boxCrate_double.png",
    "sign": ":resources:images/tiles/signRight.png",
    "rock": ":resources:images/tiles/rock.png",
}


def _kit_path(kit: str, frame: str) -> str:
    stem = CHARACTER_KITS[kit]
    return f":resources:images/animated_characters/{kit}/{stem}_{frame}.png"


@lru_cache(maxsize=None)
def character_frames(kit: str) -> dict[str, object]:
    """Idle + walk frames viradas para a direita e a esquerda."""
    idle_right = arcade.load_texture(_kit_path(kit, "idle"))
    walk_right = [arcade.load_texture(_kit_path(kit, f"walk{i}")) for i in range(8)]
    return {
        "idle_right": idle_right,
        "idle_left": idle_right.flip_left_right(),
        "walk_right": walk_right,
        "walk_left": [tex.flip_left_right() for tex in walk_right],
    }


@lru_cache(maxsize=None)
def prop_texture(kind: str):
    path = PROP_TEXTURES.get(kind)
    if path is None:
        return None
    try:
        return arcade.load_texture(path)
    except FileNotFoundError:
        return None


# ---- Kenney Roguelike Characters (CC0): sprites unicos por NPC ----
_ROGUE_COLS = 54
_ROGUE_ROWS = 12
_ROGUE_STRIDE = 17


@lru_cache(maxsize=None)
def _roguelike_grid():
    sheet = arcade.load_spritesheet(ROGUELIKE_SHEET)
    return sheet.get_texture_grid(size=(16, 16), columns=_ROGUE_COLS, count=_ROGUE_COLS * _ROGUE_ROWS, margin=(1, 1, 1, 1))


@lru_cache(maxsize=None)
def _roguelike_characters() -> tuple[int, ...]:
    """Personagens completos: as duas primeiras colunas de cada linha do spritesheet."""
    from PIL import Image

    image = Image.open(ROGUELIKE_SHEET).convert("RGBA")
    chars: list[int] = []
    for row in range(_ROGUE_ROWS):
        for col in (0, 1):
            x, y = col * _ROGUE_STRIDE, row * _ROGUE_STRIDE
            alpha = image.crop((x, y, x + 16, y + 16)).getchannel("A")
            if sum(alpha.getdata()) > 16 * 40:
                chars.append(row * _ROGUE_COLS + col)
    return tuple(chars)


def roguelike_available() -> bool:
    return Path(ROGUELIKE_SHEET).exists()


def roguelike_count() -> int:
    return len(_roguelike_characters())


@lru_cache(maxsize=None)
def roguelike_pair(order: int) -> dict[str, object]:
    """Texturas direita/esquerda de um personagem completo distinto."""
    grid = _roguelike_grid()
    chars = _roguelike_characters()
    texture = grid[chars[order % len(chars)]]
    return {"right": texture, "left": texture.flip_left_right()}


# ---- Kenney Modular Characters (CC0): personagens frontais montados por partes ----
def modular_available() -> bool:
    return modular.available()


@lru_cache(maxsize=None)
def modular_pair(order: int) -> dict[str, object]:
    """Texturas direita/esquerda de um personagem frontal montado e distinto."""
    texture = arcade.load_texture(str(modular.character_png(order)))
    return {"right": texture, "left": texture.flip_left_right()}


# ---- Kenney Roguelike Modern City (CC0): tileset top-down 16x16 ----
@lru_cache(maxsize=None)
def _rmc_grid():
    sheet = arcade.load_spritesheet(RMC_SHEET)
    return sheet.get_texture_grid(size=(16, 16), columns=37, count=1036, margin=(0, 0, 0, 0))


@lru_cache(maxsize=None)
def city_tile(index: int):
    """Tile 16x16 do pacote Roguelike Modern City pelo indice (0..1035)."""
    return _rmc_grid()[index]


@lru_cache(maxsize=None)
def city_tile_crown(index: int):
    """Somente a copa (sem caule) de uma arvore do tileset.

    Usada nas cercas de borda: copas sobrepostas formam uma folhagem continua,
    sem caules aparecendo entre as arvores.
    """
    from PIL import Image

    out = PROJECT_ROOT / "assets" / "kenney" / "_generated" / f"rmc_crown_{index}.png"
    if not out.exists():
        sheet = Image.open(RMC_SHEET).convert("RGBA")
        col, row = index % 37, index // 37
        tile = sheet.crop((col * 16, row * 16, col * 16 + 16, row * 16 + 16))
        alpha = tile.getchannel("A")
        bottom = 16
        while bottom > 1:  # remove, de baixo para cima, as linhas estreitas do caule
            width = sum(1 for x in range(16) if alpha.getpixel((x, bottom - 1)) > 40)
            if width > 6:
                break
            bottom -= 1
        out.parent.mkdir(parents=True, exist_ok=True)
        tile.crop((0, 0, 16, bottom)).save(out)
    return arcade.load_texture(str(out))


# ---- Kenney Pixel Vehicle Pack (CC0): pessoas, veiculos e mobiliario ----
@lru_cache(maxsize=None)
def person_frames(gender: str) -> dict[str, object]:
    """Quadros frontais (parado + 2 de caminhada) de uma pessoa, virados p/ os dois lados."""
    base = VEHICLE_DIR / "Characters"
    idle = arcade.load_texture(str(base / f"{gender}.png"))
    walk1 = arcade.load_texture(str(base / f"{gender}_walk1.png"))
    walk2 = arcade.load_texture(str(base / f"{gender}_walk2.png"))
    cycle = [walk1, idle, walk2, idle]
    return {
        "idle_right": idle,
        "idle_left": idle.flip_left_right(),
        "walk_right": cycle,
        "walk_left": [tex.flip_left_right() for tex in cycle],
    }


@lru_cache(maxsize=None)
def vehicle_texture(name: str):
    """Veiculo lateral do Pixel Vehicle Pack (ex.: 'sedan')."""
    return arcade.load_texture(str(VEHICLE_DIR / "Cars" / f"{name}.png"))


@lru_cache(maxsize=None)
def vehicle_prop_texture(name: str):
    """Mobiliario do Pixel Vehicle Pack (ex.: 'light_double')."""
    return arcade.load_texture(str(VEHICLE_DIR / "Props" / f"{name}.png"))






