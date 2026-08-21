"""Montador de personagens a partir do pacote Kenney Modular Characters (CC0).

O pacote nao traz sprites prontos: cada personagem e montado empilhando partes
(cabeca, pescoco, tronco, bracos, maos, cintura, pernas, sapatos, rosto, cabelo).
Este modulo compoe uma pose frontal unica por personagem e memoriza o resultado
como PNG em ``assets/kenney/_generated`` para reuso rapido.
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MOD_ROOT = PROJECT_ROOT / "assets" / "kenney" / "modular-characters" / "PNG"
GEN_ROOT = PROJECT_ROOT / "assets" / "kenney" / "_generated"

# Opcoes para gerar personagens distintos (pastas reais do pacote).
SKIN_TINTS = ["Tint 1", "Tint 2", "Tint 3", "Tint 4", "Tint 5", "Tint 6", "Tint 7", "Tint 8"]
HAIR_COLORS = ["Black", "Blonde", "Brown 1", "Brown 2", "Grey", "Red", "Tan", "White"]
# Somente cores de camisa que possuem manga longa (Arm_long).
SHIRT_COLORS = ["Blue", "Green", "Grey", "Navy", "Pine", "Red"]
PANTS_COLORS = ["Blue 1", "Blue 2", "Brown", "Green", "Grey", "Navy", "Pine", "Red", "Tan"]
SHOE_COLORS = ["Black", "Blue", "Brown 1", "Brown 2", "Grey", "Red", "Tan"]
FACE_COUNT = 4

_TINT_NUM = {f"Tint {i}": i for i in range(1, 9)}

CANVAS_W, CANVAS_H = 360, 560
CX = CANVAS_W // 2


def _load(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def _first(folder: str, *patterns: str) -> Path:
    """Primeiro arquivo (ordenado) que casa com algum padrao, na ordem dada."""
    base = MOD_ROOT / folder
    for pattern in patterns:
        matches = sorted(base.glob(pattern))
        if matches:
            return matches[0]
    raise FileNotFoundError(f"Nenhum arquivo {patterns} em {base}")


def _belt(folder: str) -> Path:
    """Faixa da cintura: arquivo curto sem sufixo '_long/_short/_shorter'."""
    base = MOD_ROOT / folder
    belts = sorted(p for p in base.glob("*.png") if "_" not in p.stem)
    if not belts:
        raise FileNotFoundError(f"Nenhuma faixa de cintura em {base}")
    return belts[0]


def _paste_center(canvas: Image.Image, part: Image.Image, cx: int, cy: int, mirror: bool = False) -> None:
    if mirror:
        part = part.transpose(Image.FLIP_LEFT_RIGHT)
    canvas.alpha_composite(part, (int(cx - part.width / 2), int(cy - part.height / 2)))


def compose(skin: str, hair: str, shirt: str, pants: str, shoe: str, face: str) -> Image.Image:
    """Monta uma imagem frontal do personagem (pose parada)."""
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    n = _TINT_NUM[skin]

    head = _load(_first(f"Skin/{skin}", f"tint{n}_head.png"))
    neck = _load(_first(f"Skin/{skin}", f"tint{n}_neck.png"))
    hand = _load(_first(f"Skin/{skin}", f"tint{n}_hand.png"))
    shirt_body = _load(_first(f"Shirts/{shirt}", "*Shirt1.png", "*Shirt*.png"))
    shirt_arm = _load(_first(f"Shirts/{shirt}", "*Arm_long.png", "*Arm_short.png", "*Arm*.png"))
    pants_leg = _load(_first(f"Pants/{pants}", "*_long.png"))
    pants_belt = _load(_belt(f"Pants/{pants}"))
    shoe_img = _load(_first(f"Shoes/{shoe}", "*.png"))
    hair_img = _load(_first(f"Hair/{hair}", "*Man1.png", "*.png"))
    face_img = _load(_first("Face/Completes", f"{face}.png"))

    # Pernas (atras), da esquerda e direita do observador.
    _paste_center(canvas, pants_leg, CX - 46, 452)
    _paste_center(canvas, pants_leg, CX + 46, 452, mirror=True)
    # Sapatos nas pontas das pernas.
    _paste_center(canvas, shoe_img, CX - 48, 528)
    _paste_center(canvas, shoe_img, CX + 48, 528, mirror=True)
    # Bracos (atras do tronco), ombro junto ao topo do tronco.
    _paste_center(canvas, shirt_arm, CX + 78, 300)
    _paste_center(canvas, shirt_arm, CX - 78, 300, mirror=True)
    # Cintura (aparece sob a barra do tronco).
    _paste_center(canvas, pants_belt, CX, 368)
    # Tronco.
    _paste_center(canvas, shirt_body, CX, 285)
    # Maos nas pontas dos bracos.
    _paste_center(canvas, hand, CX + 120, 356)
    _paste_center(canvas, hand, CX - 120, 356, mirror=True)
    # Pescoco, cabeca, rosto e cabelo.
    _paste_center(canvas, neck, CX, 196)
    _paste_center(canvas, head, CX, 110)
    _paste_center(canvas, face_img, CX, 128)
    _paste_center(canvas, hair_img, CX, 74)
    return canvas


def spec_for(order: int) -> dict[str, str]:
    """Combinacao deterministica e distinta de partes para um indice."""
    return {
        "skin": SKIN_TINTS[order % len(SKIN_TINTS)],
        "hair": HAIR_COLORS[(order * 3) % len(HAIR_COLORS)],
        "shirt": SHIRT_COLORS[(order * 5) % len(SHIRT_COLORS)],
        "pants": PANTS_COLORS[(order * 7) % len(PANTS_COLORS)],
        "shoe": SHOE_COLORS[(order * 2) % len(SHOE_COLORS)],
        "face": f"face{1 + (order % FACE_COUNT)}",
    }


@lru_cache(maxsize=None)
def character_png(order: int) -> Path:
    """Compoe (com cache em disco) o PNG do personagem de indice ``order``."""
    out = GEN_ROOT / f"char_{order:02d}.png"
    if not out.exists():
        out.parent.mkdir(parents=True, exist_ok=True)
        compose(**spec_for(order)).save(out)
    return out


def available() -> bool:
    return MOD_ROOT.exists()


if __name__ == "__main__":
    img = compose(**spec_for(0))
    out = GEN_ROOT / "_preview.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)
    print(f"saved {out}")
