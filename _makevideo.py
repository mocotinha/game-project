"""Plays Aurora from start to finish and streams frames to ffmpeg -> MP4.

Doubles as the end-to-end journey check: it walks (real physics) to every
target, enters each rodoviaria/building, completes all six missions and travels
by bus between the three environments.
"""
from __future__ import annotations

import heapq
import math
import subprocess
from collections import deque

import arcade

from src import config
from src.content.problems import PROBLEMS_BY_MISSION
from src.content.sidequests import SIDEQUESTS_BY_MISSION
from src.save_manager import new_game_state
from src.views.world import PLAYER_TOP_PAD, Mode, WorldView

OUT = "Aurora-Jornada.mp4"
W, H, FPS = config.SCREEN_WIDTH, config.SCREEN_HEIGHT, 30

win = arcade.Window(W, H, "Aurora - Jornada", visible=True)
view = WorldView(1, new_game_state(), show_tutorial=True)
win.show_view(view)

# Quadro de sondagem: com DPI scaling do Windows o framebuffer real pode ser maior
# que WxH; o ffmpeg precisa receber o tamanho verdadeiro e reescalar para 720p.
win.switch_to()
win.dispatch_events()
view.on_draw()
FB_W, FB_H = arcade.get_image().convert("RGB").size
win.flip()

ff = subprocess.Popen(
    ["ffmpeg", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{FB_W}x{FB_H}", "-r", str(FPS),
     "-i", "-", "-an", "-vf", f"scale={W}:{H}", "-vcodec", "libx264", "-pix_fmt", "yuv420p", "-crf", "22", OUT],
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
    if img.size != (FB_W, FB_H):  # protege contra mudanca de tamanho da janela
        img = img.resize((FB_W, FB_H))
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


# ---- Navegacao: A* sobre a colisao real do jogo (o personagem nunca fica preso) ----
NAV_GRID = 24.0
_nav_cache: dict = {"key": None}


def _free(x: float, y: float) -> bool:
    return not view._blocked(x, y, 0, 0)


def _clear(x: float, y: float) -> bool:
    """Celula livre com folga: tolera o corte de quina do seguidor de caminho."""
    for prop in view.cur_props:
        # Caixas empurraveis sao tratadas como obstaculo: empurra-las sem querer
        # pode encunha-las em outro objeto e prender o personagem.
        if prop.solid and prop.pushable and \
                abs(prop.x - x) < prop.width / 2 + 30 and abs(prop.y - y) < prop.height / 2 + 30:
            return False
    return all(_free(x + ox, y + oy) for ox, oy in ((0, 0), (10, 0), (-10, 0), (0, 10), (0, -10)))


def _nav() -> dict:
    """Grade de celulas livres do ambiente atual (recalculada ao trocar de area)."""
    key = view.area
    if _nav_cache.get("key") == key:
        return _nav_cache
    gx0 = view.map_x0 + 34
    gy0 = view.map_y0 + 34
    cols = max(2, int((view.map_x1 - 34 - gx0) / NAV_GRID) + 1)
    rows = max(2, int((view.map_y1 - PLAYER_TOP_PAD - gy0) / NAV_GRID) + 1)
    free = [[_clear(gx0 + c * NAV_GRID, gy0 + r * NAV_GRID) for c in range(cols)] for r in range(rows)]
    _nav_cache.update(key=key, gx0=gx0, gy0=gy0, cols=cols, rows=rows, free=free)
    return _nav_cache


def _nearest_free(nav: dict, r: int, c: int) -> tuple[int, int]:
    rows, cols, free = nav["rows"], nav["cols"], nav["free"]
    seen = {(r, c)}
    q = deque([(r, c)])
    while q:
        cr, cc = q.popleft()
        if 0 <= cr < rows and 0 <= cc < cols and free[cr][cc]:
            return cr, cc
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                nxt = (cr + dr, cc + dc)
                if nxt not in seen and -1 <= nxt[0] <= rows and -1 <= nxt[1] <= cols:
                    seen.add(nxt)
                    q.append(nxt)
    return r, c


def _plan(tx: float, ty: float) -> list[tuple[float, float]]:
    """Caminho ate (tx, ty): A* 8-direcoes + simplificacao por linha de visada."""
    if view.location != "city":
        return [(tx, ty)]  # interiores nao tem obstaculos
    nav = _nav()
    gx0, gy0, rows, cols, free = nav["gx0"], nav["gy0"], nav["rows"], nav["cols"], nav["free"]

    def to_cell(x: float, y: float) -> tuple[int, int]:
        return (min(rows - 1, max(0, round((y - gy0) / NAV_GRID))),
                min(cols - 1, max(0, round((x - gx0) / NAV_GRID))))

    start = _nearest_free(nav, *to_cell(view.player_x, view.player_y))
    goal = _nearest_free(nav, *to_cell(tx, ty))

    def search(tight: bool) -> dict[tuple[int, int], tuple[int, int] | None]:
        openq: list[tuple[float, tuple[int, int]]] = [(0.0, start)]
        came: dict[tuple[int, int], tuple[int, int] | None] = {start: None}
        g = {start: 0.0}
        while openq:
            _, cur = heapq.heappop(openq)
            if cur == goal:
                break
            cr, cc = cur
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    if dr == 0 and dc == 0:
                        continue
                    nr, nc = cr + dr, cc + dc
                    if not (0 <= nr < rows and 0 <= nc < cols) or not free[nr][nc]:
                        continue
                    if tight and dr and dc and not (free[cr][nc] or free[nr][cc]):
                        continue  # nao corta quinas de obstaculos
                    ng = g[cur] + (1.4142 if dr and dc else 1.0)
                    if ng < g.get((nr, nc), 1e18):
                        g[(nr, nc)] = ng
                        came[(nr, nc)] = cur
                        h = max(abs(nr - goal[0]), abs(nc - goal[1]))
                        heapq.heappush(openq, (ng + h, (nr, nc)))
        return came

    came = search(tight=True)
    if goal not in came:  # passagem apenas diagonal: tenta sem a restricao de quina
        came = search(tight=False)
    if goal not in came:
        _log.append(f"[plan] FAIL ({tx:.0f},{ty:.0f})")
        print(_log[-1])
        return [(tx, ty)]
    cells: list[tuple[int, int]] = []
    node: tuple[int, int] | None = goal
    while node is not None:
        cells.append(node)
        node = came[node]
    cells.reverse()
    # Funde celulas colineares: cada segmento vira uma reta 8-direcoes exata,
    # que as teclas de movimento reproduzem sem derivar para obstaculos.
    pts = [(gx0 + c * NAV_GRID, gy0 + r * NAV_GRID) for r, c in cells]
    out: list[tuple[float, float]] = [pts[0]]
    for k in range(1, len(pts) - 1):
        d0 = (pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1])
        d1 = (pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1])
        if d0 != d1:
            out.append(pts[k])
    if len(pts) > 1:
        out.append(pts[-1])
    out.append((tx, ty))
    return out[1:] if len(out) > 1 else out


def walk_to(tx: float, ty: float, tol: float, budget: int = 1400) -> float:
    """Caminha ate o alvo seguindo um caminho A* (contorna obstaculos sem travar)."""
    path = _plan(tx, ty)
    wp = 0
    best_wp = 1e18
    no_gain = 0
    for _ in range(budget):
        if view.mode != Mode.EXPLORE or view._traveling is not None:
            break
        px, py = view.player_x, view.player_y
        if math.hypot(px - tx, py - ty) <= tol:
            break
        while wp < len(path) - 1 and math.hypot(path[wp][0] - px, path[wp][1] - py) < 14:
            wp += 1
            best_wp = 1e18
        wx, wy = path[wp]
        dw = math.hypot(wx - px, wy - py)
        if wp == len(path) - 1 and dw < 12:
            break
        keys = set()
        if wx - px > 5:
            keys.add(arcade.key.RIGHT)
        elif px - wx > 5:
            keys.add(arcade.key.LEFT)
        if wy - py > 5:
            keys.add(arcade.key.UP)
        elif py - wy > 5:
            keys.add(arcade.key.DOWN)
        # Sem progresso em direcao ao waypoint (raspando/oscilando) -> replaneja.
        if dw < best_wp - 1.0:
            best_wp = dw
            no_gain = 0
        else:
            no_gain += 1
        if no_gain > 24:
            _nav_cache["key"] = None  # mundo pode ter mudado (ex.: caixa empurrada)
            path = _plan(tx, ty)
            wp = 0
            best_wp = 1e18
            no_gain = 0
        view.held_keys = keys
        cap()
    view.held_keys = set()
    return math.hypot(view.player_x - tx, view.player_y - ty)


def reach(tx, ty, label, tol=90):
    d = walk_to(tx, ty, tol)
    _log.append(f"[walk] {'OK ' if d <= tol + 8 else 'WARN'} {label}: {d:.0f}")
    print(_log[-1])


def snap(x, y):
    """Ajuste final de posicao; nunca teleporta para dentro de colisao (congelaria o jogador)."""
    if view.location == "city" and view._blocked(x, y, 0, 0):
        for radius in (12, 20, 28, 36, 44, 52, 60):
            cand = None
            for ang in range(0, 360, 30):
                nx = x + radius * math.cos(math.radians(ang))
                ny = y + radius * math.sin(math.radians(ang))
                if not view._blocked(nx, ny, 0, 0):
                    cand = (nx, ny)
                    break
            if cand is not None:
                x, y = cand
                break
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
    reach(hx, hy, label, 60)
    cx, cy = npc_xy(name)
    snap(cx, cy - 2)
    press(arcade.key.E)
    clear_popups(10)


def has_ev(eid: str) -> bool:
    return eid in view.state.get("evidence", [])


def investigate(mid, label):
    p = PROBLEMS_BY_MISSION[mid]
    reach(p.x, p.y, label, 50)
    for _ in range(5):  # um NPC perambulando pode "roubar" o E; insiste ate investigar
        snap(p.x, p.y + 4)
        press(arcade.key.E)
        clear_popups(10)
        if has_ev(mid + ":problema"):
            return
        hold(16)
    _log.append(f"[ev] FAIL {mid}:problema")
    print(_log[-1])


BUILDING_DOOR = {
    "camara": (450, 1714), "prefeitura": (1110, 1714), "assembleia": (2100, 1754),
    "governo": (2790, 1674), "congresso": (2600, 614), "planalto": (3010, 1114),
}


def enter(bkey, label):
    dx, dy = BUILDING_DOOR[bkey]
    reach(dx, dy, label, 50)
    snap(dx, dy)
    press(arcade.key.E)
    hold(4)
    _log.append(f"[enter] {'OK ' if view.location == bkey else 'FAIL'} {bkey}")
    print(_log[-1])


def read_law():
    it = next(i for i in view.interior.items if i.grants)
    reach(it.x, it.y, "lei", 85)
    for _ in range(3):
        snap(it.x, it.y + 4)
        press(arcade.key.E)
        clear_popups(10)
        if has_ev(it.grants):
            return
        hold(8)
    _log.append(f"[ev] FAIL {it.grants}")
    print(_log[-1])


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
    if not has_ev(mid + ":testemunho"):  # alguma conversa falhou: repete os alvos
        for t in sq.targets:
            talk_npc(t, mid + " retry " + t)
    enter(bkey, mid + " porta")
    hold(10)
    read_law()
    hold(10)
    talk_giver()
    if view.mode != Mode.MISSION:  # a pergunta nao abriu: tenta falar de novo
        _log.append(f"[retry] pergunta {mid}")
        print(_log[-1])
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


def travel(dest):
    t = view._travel_toward(dest)  # ponto de onibus real do ambiente atual
    print("-- travel " + dest + " --")
    reach(t.x, t.y - 60, "rodoviaria " + dest, 60)
    snap(t.x, t.y - 40)
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
    travel("estado")
    do_mission("hospital_regional", "assembleia", "B")
    do_mission("rodovia_estadual", "governo", "A")
    travel("uniao")
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
