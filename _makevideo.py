"""Plays Aurora from start to finish and streams frames to ffmpeg -> MP4.

Doubles as the end-to-end journey check: it walks (real physics) to every
target, enters each rodoviaria/building, completes all six missions and travels
by bus between the three environments.
"""
from __future__ import annotations

import subprocess

import arcade

from src import config
from src.content.problems import PROBLEMS_BY_MISSION
from src.content.sidequests import SIDEQUESTS_BY_MISSION
from src.save_manager import new_game_state
from src.views.world import Mode, WorldView

OUT = "Aurora-Jornada.mp4"
W, H, FPS = config.SCREEN_WIDTH, config.SCREEN_HEIGHT, 30

win = arcade.Window(W, H, "Aurora - Jornada", visible=True)
view = WorldView(1, new_game_state(), show_tutorial=True)
win.show_view(view)

ff = subprocess.Popen(
    ["ffmpeg", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
     "-i", "-", "-an", "-vcodec", "libx264", "-pix_fmt", "yuv420p", "-crf", "22", OUT],
    stdin=subprocess.PIPE,
)

_log: list[str] = []


def cap() -> None:
    # advance ~1/FPS of game time, render, and pipe one frame
    view.on_update(1 / 60)
    view.on_update(1 / 60)
    win.switch_to()
    win.dispatch_events()
    view.on_draw()
    img = arcade.get_image().convert("RGB")
    try:
        ff.stdin.write(img.tobytes())
    except BrokenPipeError:
        pass
    win.flip()


def hold(n: int) -> None:
    view.held_keys = set()
    for _ in range(n):
        cap()


def press(k: int) -> None:
    view.on_key_press(k, 0)
    view.on_key_release(k, 0)
    cap()


def clear_popups(linger: int = 12) -> None:
    for _ in range(8):
        if view.mode in (Mode.STORY, Mode.DIALOGUE, Mode.COMPLETE):
            if view.mode == Mode.STORY and view.story_is_final:
                hold(linger)
                return
            hold(linger)
            press(arcade.key.ENTER)
        else:
            return


def walk_to(tx: float, ty: float, tol: float, budget: int = 900) -> float:
    last = None
    stuck = 0
    phase = 0
    detour = 0
    detour_keys: set[int] = set()
    for _ in range(budget):
        if view.mode != Mode.EXPLORE or view._traveling is not None:
            break
        px, py = view.player_x, view.player_y
        d = ((px - tx) ** 2 + (py - ty) ** 2) ** 0.5
        if d <= tol:
            break
        if detour > 0:
            keys = set(detour_keys)
            detour -= 1
        else:
            keys = set()
            if tx - px > 8:
                keys.add(arcade.key.RIGHT)
            elif px - tx > 8:
                keys.add(arcade.key.LEFT)
            if ty - py > 8:
                keys.add(arcade.key.UP)
            elif py - ty > 8:
                keys.add(arcade.key.DOWN)
            stuck = stuck + 1 if (last is not None and abs(d - last) < 0.8) else 0
            if stuck > 10:
                phase += 1
                detour_keys = {arcade.key.RIGHT if tx > px else arcade.key.LEFT} if phase % 2 \
                    else {arcade.key.UP if ty > py else arcade.key.DOWN}
                detour = 22
                stuck = 0
        last = d
        view.held_keys = keys
        cap()
    view.held_keys = set()
    return ((view.player_x - tx) ** 2 + (view.player_y - ty) ** 2) ** 0.5


def reach(tx, ty, label, tol=90):
    d = walk_to(tx, ty, tol)
    _log.append(f"[walk] {'OK ' if d <= tol + 8 else 'WARN'} {label}: {d:.0f}")
    print(_log[-1])


def snap(x, y):
    view.player_x, view.player_y = float(x), float(y)
    view.velocity_x = view.velocity_y = 0.0
    view.world_camera.position = view._camera_target()


def npc_xy(name):
    for n in view.city.npcs:
        if n.name == name:
            return (n.x, n.y)
    raise KeyError(name)


def talk_npc(name, label):
    hx, hy = npc_xy(name)
    reach(hx, hy, label, 100)
    cx, cy = npc_xy(name)
    snap(cx, cy - 2)
    press(arcade.key.E)
    clear_popups(10)


def investigate(mid, label):
    p = PROBLEMS_BY_MISSION[mid]
    reach(p.x, p.y, label, 70)
    snap(p.x, p.y + 4)
    press(arcade.key.E)
    clear_popups(10)


BUILDING_DOOR = {
    "camara": (450, 1714), "prefeitura": (1110, 1714), "assembleia": (2100, 1754),
    "governo": (2790, 1674), "congresso": (2600, 614), "planalto": (3010, 1114),
}


def enter(bkey, label):
    dx, dy = BUILDING_DOOR[bkey]
    reach(dx, dy, label, 90)
    snap(dx, dy)
    press(arcade.key.E)
    hold(4)
    _log.append(f"[enter] {'OK ' if view.location == bkey else 'FAIL'} {bkey}")
    print(_log[-1])


def read_law():
    it = next(i for i in view.interior.items if i.grants)
    reach(it.x, it.y, "lei", 85)
    snap(it.x, it.y + 4)
    press(arcade.key.E)
    clear_popups(10)


def talk_giver():
    g = next(n for n in view.interior.npcs if n.mission)
    reach(g.x, g.y, "cargo", 95)
    snap(g.x, g.y - 2)
    press(arcade.key.E)
    clear_popups(12)


def do_mission(mid, bkey, answer):
    print(f"== {mid} ==")
    investigate(mid, mid + " problema")
    hold(14)
    sq = SIDEQUESTS_BY_MISSION[mid]
    talk_npc(sq.giver, mid + " giver")
    for t in sq.targets:
        talk_npc(t, mid + " " + t)
    enter(bkey, mid + " porta")
    hold(10)
    read_law()
    hold(10)
    talk_giver()
    hold(26)  # mostra a pergunta
    press({"A": arcade.key.A, "B": arcade.key.B, "C": arcade.key.C}[answer])
    hold(40)  # mostra conclusao + dica da rodoviaria
    _log.append(f"[result] {'OK ' if mid in view.state.get('completed_missions', []) else 'FAIL'} {mid}")
    print(_log[-1])
    clear_popups(14)
    if view.location != "city":
        press(arcade.key.ESCAPE)
    clear_popups(12)
    hold(6)


def travel(bx, by, dest):
    print("-- travel " + dest + " --")
    reach(bx, by, "rodoviaria " + dest, 90)
    snap(bx, by)
    hold(10)  # mostra a rodoviaria/onibus
    view.on_key_press(arcade.key.E, 0)
    view.on_key_release(arcade.key.E, 0)
    for i in range(70):  # fade de viagem + chegada
        cap()
        if view._traveling is None and i > 36:
            break
    _log.append(f"[travel] {'OK ' if view.area == dest else 'FAIL'} -> {view.area}")
    print(_log[-1])
    clear_popups(20)
    hold(8)


try:
    clear_popups(24)      # abertura
    hold(18)
    do_mission("saude_bairro", "camara", "A")
    do_mission("orcamento_cidade", "prefeitura", "B")
    travel(2110, 1600, "estado")
    do_mission("hospital_regional", "assembleia", "B")
    do_mission("rodovia_estadual", "governo", "A")
    travel(2400, 1430, "uniao")
    do_mission("lei_federal", "congresso", "B")
    do_mission("politica_nacional", "planalto", "B")
    hold(30)
    clear_popups(60)      # historia final (linger)
    hold(30)
    print("completed:", view.state.get("completed_missions"))
finally:
    try:
        ff.stdin.close()
    except Exception:
        pass
    ff.wait()
    win.close()
print("done ->", OUT)
