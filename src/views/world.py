from __future__ import annotations

import math
import random
from enum import Enum, auto

import arcade

from src import assets, citytiles, config, save_manager, ui
from src.audio import audio
from src.content.missions import MISSIONS, MISSIONS_BY_ID, STORY, Mission, next_mission
from src.content.problems import PROBLEMS_BY_MISSION, Problem
from src.content.sidequests import SIDEQUESTS, SIDEQUESTS_BY_GIVER, SIDEQUESTS_BY_MISSION
from src.world import NPC, Building, Prop, build_city
from src.world.interiors import Interior, InteriorItem, build_interiors

CHAR_SCALE = 0.5
ROGUE_SCALE = 3.0        # pessoas do Pixel Vehicle Pack (15px -> 45px)
VEHICLE_SCALE = 2.2      # veiculos laterais
PACK_PROP_SCALE = 2.4    # semaforos/placas/barreiras
PROP_SCALE = {"tree": 0.55, "bush": 0.5, "crate": 0.5}

# ---- Kenney Roguelike Modern City: cidade top-down em tiles 16x16 ----
TILE = 48.0  # tamanho do tile na tela (unidades de mundo)
GROUND_TILES = {"grass": 888, "road": 787, "plaza": 740, "sidewalk": 740, "crosswalk_h": 823, "crosswalk_v": 826}
# Cor do telhado por predio, na ordem das construcoes da cidade.
BUILDING_ROOFS = ["tan", "brick", "white", "grey", "tan", "grey", "white"]
# Props renderizados com tiles do Roguelike Modern City (billboards top-down).
CITY_PROP_TILES = {
    "tree": 438, "bush": 441, "bench": 504, "citybench": 504,
    "trashcan": 499, "mailbox": 482, "barrel": 498,
    "stall_green": 504, "stall_orange": 508,
}
# Veiculos do Pixel Vehicle Pack (billboards laterais).
VEHICLES = {
    "car_sedan": "sedan", "car_taxi": "taxi", "car_police": "police",
    "car_bus": "bus", "car_van": "van", "car_truck": "truckdelivery",
    "car_suv": "suv", "car_sports": "sports_red", "car_amb": "ambulance",
}
# Mobiliario do Pixel Vehicle Pack.
PACK_PROPS = {"trafficlight": "light_double", "streetlamp": "light", "lamp": "light", "roadsign": "sign_street", "barrier": "barrier"}
FEMALE_NPCS = {"Dona Alzira", "Professora Ines", "Gari Rita", "Corredora Bia",
               "Dona Vera", "Motorista Cida", "Ativista Rosa", "Servidora Dinah", "Cidada Marli"}
# Perambulacao dos NPCs: area de ~9 m2 ao redor do ponto de origem.
NPC_WANDER_RADIUS = 46.0
NPC_SPEED = 42.0
ROAD_X = (660, 1480, 2360)
ROAD_Y = (900, 1560)
ROAD_W = 80
MM_W, MM_H = 250, 188
RX, RY, RW, RH = 70, 120, 1140, 470


class Mode(Enum):
    EXPLORE = auto()
    STORY = auto()
    DIALOGUE = auto()
    MISSION = auto()
    COMPLETE = auto()


class WorldView(arcade.View):
    def __init__(self, slot: int, state: dict, show_tutorial: bool = False) -> None:
        super().__init__()
        self.slot = slot
        self.state = state
        self.settings = save_manager.load_settings()
        self.city = build_city()
        self.interiors = build_interiors()

        position = state.get("position", {"x": 600.0, "y": 1200.0})
        self.player_x = float(position["x"])
        self.player_y = float(position["y"])
        self.velocity_x = 0.0
        self.velocity_y = 0.0
        self.facing_left = False
        self.anim_time = 0.0
        self.walk_time = 0.0
        self.player_gender = "woman"
        self.clock = 0.0
        self.held_keys: set[int] = set()

        self.world_camera = arcade.camera.Camera2D()
        self.gui_camera = arcade.camera.Camera2D()

        self.location = "city"
        self.interior: Interior | None = None
        self.city_return = (self.player_x, self.player_y)

        self.sprite_order = self._assign_sprite_orders()
        self.player_order = len(self.sprite_order)
        self._setup_sprites()

        self.mode = Mode.EXPLORE
        self.dialogue_lines: list[str] = []
        self.dialogue_index = 0
        self.dialogue_speaker = ""
        self.active_mission: Mission | None = None
        self.mission_answer: str | None = None
        self.feedback = ""
        self.region_name = ""
        self.story_text = ""
        self.story_is_final = False
        self.shown_stages: set[str] = set()

        if show_tutorial:
            self._queue_story("abertura")
        self._maybe_queue_stage_story()

    def on_show_view(self) -> None:
        self.settings = save_manager.load_settings()
        audio.reload_settings()
        audio.play_music("world")

    # ---------- setup ----------
    def _assign_sprite_orders(self) -> dict[str, int]:
        order: dict[str, int] = {}
        names = [npc.name for npc in self.city.npcs]
        for interior in self.interiors.values():
            names.extend(npc.name for npc in interior.npcs)
        for name in names:
            if name not in order:
                order[name] = len(order)
        return order

    def _setup_sprites(self) -> None:
        self.vector_props: list[Prop] = []
        self.npc_sprites: list[tuple[arcade.Sprite, NPC]] = []
        self.prop_sprites: list[tuple[arcade.Sprite, Prop]] = []
        self.building_sprites: dict[int, arcade.Sprite] = {}

        self._build_ground()

        for index, building in enumerate(self.city.buildings):
            self.building_sprites[id(building)] = self._make_building_sprite(building, index)

        for npc in self.city.npcs:
            sprite = self._make_actor(npc.name)
            sprite.color = npc.tint
            self.npc_sprites.append((sprite, npc))

        self.npc_state = {
            id(npc): {"home": (npc.x, npc.y), "tx": npc.x, "ty": npc.y,
                      "timer": random.uniform(0.4, 2.6), "moving": False, "phase": 0.0}
            for _, npc in self.npc_sprites
        }

        for prop in self.city.props:
            if prop.kind in VEHICLES:
                texture = assets.vehicle_texture(VEHICLES[prop.kind])
                if prop.flip:
                    texture = texture.flip_left_right()
                sprite = arcade.Sprite(texture, scale=VEHICLE_SCALE)
                sprite.center_x = prop.x
                sprite.center_y = prop.y + sprite.height / 2
                self.prop_sprites.append((sprite, prop))
                continue
            if prop.kind in PACK_PROPS:
                texture = assets.vehicle_prop_texture(PACK_PROPS[prop.kind])
                if prop.flip:
                    texture = texture.flip_left_right()
                sprite = arcade.Sprite(texture, scale=PACK_PROP_SCALE)
                sprite.center_x = prop.x
                sprite.center_y = prop.y + sprite.height / 2
                self.prop_sprites.append((sprite, prop))
                continue
            if prop.kind in CITY_PROP_TILES:
                texture = assets.city_tile(CITY_PROP_TILES[prop.kind])
                if prop.flip:
                    texture = texture.flip_left_right()
                sprite = arcade.Sprite(texture, scale=TILE / 16)
                sprite.center_x = prop.x
                sprite.center_y = prop.y + sprite.height / 2
                self.prop_sprites.append((sprite, prop))
                continue
            texture = assets.prop_texture(prop.kind)
            if texture is None:
                self.vector_props.append(prop)
                continue
            sprite = arcade.Sprite(texture, scale=PROP_SCALE.get(prop.kind, 0.5))
            sprite.center_x = prop.x
            sprite.center_y = prop.y + sprite.height / 2
            self.prop_sprites.append((sprite, prop))

        self.player_sprite = self._make_actor(None)
        self.int_npc_sprites: list[tuple[arcade.Sprite, NPC]] = []
        self.world_camera.position = (self.player_x, self.player_y)

        self.problem_sprites: dict[str, arcade.Sprite] = {}
        for problem in self.city.problems:
            sprite = arcade.Sprite(assets.vehicle_prop_texture("sign_red"), scale=PACK_PROP_SCALE)
            sprite.center_x = problem.x
            sprite.center_y = problem.y + sprite.height / 2
            self.problem_sprites[problem.id] = sprite

    # ---------- investigacao: provas, side quests ----------
    def _evidence(self) -> list:
        return self.state.setdefault("evidence", [])

    def _has_ev(self, eid: str) -> bool:
        return eid in self._evidence()

    def _grant_ev(self, eid: str) -> bool:
        ev = self._evidence()
        if eid not in ev:
            ev.append(eid)
            self._persist()
            audio.play_sfx("earn_item")
            return True
        return False

    def _sidequests(self) -> dict:
        return self.state.setdefault("sidequests", {})

    def _mission_ready(self, mission: Mission) -> bool:
        return all(self._has_ev(eid) for eid in mission.evidence)

    def _problem_solved(self, problem: Problem) -> bool:
        return problem.mission_id in self.state.get("completed_missions", [])

    # ---------- chao em tiles (top-down) ----------
    def _ground_kind(self, cx: float, cy: float) -> str:
        on_v = any(vx <= cx <= vx + ROAD_W for vx in ROAD_X)
        on_h = any(hy <= cy <= hy + ROAD_W for hy in ROAD_Y)
        # Faixas de pedestre nas aproximacoes dos cruzamentos.
        if on_v:
            for hy in ROAD_Y:
                if hy + ROAD_W < cy <= hy + ROAD_W + TILE or hy - TILE <= cy < hy:
                    return "crosswalk_h"
        if on_h:
            for vx in ROAD_X:
                if vx + ROAD_W < cx <= vx + ROAD_W + TILE or vx - TILE <= cx < vx:
                    return "crosswalk_v"
        if on_v or on_h:
            return "road"
        # Calcada margeando as vias.
        margin = 40
        if any(vx - margin <= cx <= vx + ROAD_W + margin for vx in ROAD_X) or any(hy - margin <= cy <= hy + ROAD_W + margin for hy in ROAD_Y):
            return "sidewalk"
        # Calcada ao redor dos predios.
        for b in self.city.buildings:
            if b.x - 32 <= cx <= b.x + b.width + 32 and b.y - 32 <= cy <= b.y + b.height + 32:
                return "sidewalk"
        for region in self.city.regions:
            if region.key.startswith("praca") and region.x <= cx <= region.x + region.width and region.y <= cy <= region.y + region.height:
                return "plaza"
        return "grass"

    def _build_ground(self) -> None:
        self.ground = arcade.SpriteList()
        scale = TILE / 16
        cols = int(config.MAP_WIDTH // TILE) + 1
        rows = int(config.MAP_HEIGHT // TILE) + 1
        for row in range(rows):
            for col in range(cols):
                cx = col * TILE + TILE / 2
                cy = row * TILE + TILE / 2
                sprite = arcade.Sprite(assets.city_tile(GROUND_TILES[self._ground_kind(cx, cy)]), scale=scale)
                sprite.center_x = cx
                sprite.center_y = cy
                self.ground.append(sprite)

    def _actor_order(self, name: str | None) -> int:
        if name is None:
            return self.player_order
        return self.sprite_order.get(name, self.player_order)

    def _gender_for(self, name: str | None) -> str:
        if name is None:
            return self.player_gender
        if name.startswith("Manifestante"):
            return "woman" if int(name.split()[-1]) % 2 == 0 else "man"
        return "woman" if name in FEMALE_NPCS else "man"

    def _npc_visible(self, npc: NPC) -> bool:
        """Manifestantes somem quando a missao correspondente e concluida."""
        return not (npc.protest and npc.protest in self.state.get("completed_missions", []))

    def _make_actor(self, name: str | None) -> arcade.Sprite:
        frames = assets.person_frames(self._gender_for(name))
        return arcade.Sprite(frames["idle_right"], scale=ROGUE_SCALE)

    def _make_building_sprite(self, building: Building, index: int) -> arcade.Sprite:
        color = BUILDING_ROOFS[index % len(BUILDING_ROOFS)]
        cols_t = max(3, round(building.width / TILE))
        rows_t = max(3, round(building.height / TILE))
        texture = arcade.load_texture(str(citytiles.building_roof_png(color, cols_t, rows_t)))
        sprite = arcade.Sprite(texture)
        sprite.width = building.width
        sprite.height = building.height
        sprite.center_x = building.x + building.width / 2
        sprite.center_y = building.y + building.height / 2
        return sprite

    # ---------- story ----------
    def _queue_story(self, stage: str) -> None:
        if stage in self.shown_stages:
            return
        self.shown_stages.add(stage)
        self.story_text = STORY.get(stage, "")
        self.story_is_final = stage == "final"
        self.mode = Mode.STORY

    def _maybe_queue_stage_story(self) -> None:
        mission = next_mission(self.state.get("completed_missions", []))
        if mission is None:
            self._queue_story("final")
        elif self.mode != Mode.STORY:
            self._queue_story(mission.stage)

    # ---------- draw ----------
    def on_draw(self) -> None:
        self.window.default_camera.use()
        self.clear(config.COLOR_BG)
        ui.fit_world_camera(self.world_camera, self.window)
        ui.fit_gui_camera(self.gui_camera, self.window)
        if self.location == "city":
            self.world_camera.use()
            self._draw_city()
            self.gui_camera.use()
            self._draw_hud()
            self._draw_minimap()
        else:
            self.gui_camera.use()
            self._draw_interior()
            self._draw_hud()
        if self.mode == Mode.STORY:
            self._draw_story()
        elif self.mode == Mode.DIALOGUE:
            self._draw_dialogue()
        elif self.mode == Mode.MISSION:
            self._draw_mission()
        elif self.mode == Mode.COMPLETE:
            self._draw_complete()

    def _draw_city(self) -> None:
        self.ground.draw(pixelated=True)
        building_regions = {b.key for b in self.city.buildings if b.key}
        for region in self.city.regions:
            if region.key in building_regions:
                continue  # o nome do predio ja identifica a regiao
            ui.name_tag(region.label, region.x + region.width / 2, region.y + region.height - 26, (247, 238, 200), 15)

        self._sync_city_actors()
        drawables: list[tuple[float, int, object]] = []
        for b in self.city.buildings:
            drawables.append((b.y + b.height, 0, b))
        for sprite, npc in self.npc_sprites:
            if self._npc_visible(npc):
                drawables.append((npc.y, 1, sprite))
        for sprite, prop in self.prop_sprites:
            drawables.append((prop.y, 1, sprite))
        for prop in self.vector_props:
            drawables.append((prop.y, 2, prop))
        for problem in self.city.problems:
            sprite = self.problem_sprites[problem.id]
            sprite.texture = assets.vehicle_prop_texture("sign_blue" if self._problem_solved(problem) else "sign_red")
            drawables.append((problem.y, 1, sprite))
        drawables.append((self.player_y, 1, self.player_sprite))
        drawables.sort(key=lambda d: d[0], reverse=True)
        for _, kind, obj in drawables:
            if kind == 0:
                self._draw_building(obj)
            elif kind == 1:
                arcade.draw_sprite(obj)
            else:
                self._draw_vector_prop(obj)

        near = min((npc for _, npc in self.npc_sprites if self._dist(npc.x, npc.y) < 150 and self._npc_visible(npc)),
                   key=lambda n: self._dist(n.x, n.y), default=None)
        if near is not None:
            ui.name_tag(near.name, near.x, near.y + 72, (255, 234, 150), 12)
            ui.name_tag(near.role, near.x, near.y + 58, (208, 226, 222), 10)
        ui.name_tag(self.state.get("player_name", "Joana").upper(), self.player_x, self.player_y + 72, config.COLOR_HIGHLIGHT, 12)

        for problem in self.city.problems:
            solved = self._problem_solved(problem)
            color = (150, 230, 160) if solved else (255, 176, 96)
            bob = math.sin(self.clock * 4) * 4
            ui.name_tag(problem.title, problem.x, problem.y + 66, color, 11)
            ui.label("OK" if solved else "!", problem.x, problem.y + 82 + bob, color, 16, anchor_x="center", bold=True)

        self._draw_objective_beacon()

        target = self._city_interact_target()
        if target is not None and self.mode == Mode.EXPLORE:
            ui.label(target[2], target[0], target[1] + 74, config.COLOR_ACCENT, 12, anchor_x="center", bold=True)

    def _objective_target(self) -> tuple[float, float, str] | None:
        mission = next_mission(self.state.get("completed_missions", []))
        if mission is None:
            return None
        prob = PROBLEMS_BY_MISSION.get(mission.id)
        if prob is not None and not self._has_ev(f"{mission.id}:problema"):
            return (prob.x, prob.y, "Investigue: " + prob.title)
        sq = SIDEQUESTS_BY_MISSION.get(mission.id)
        if sq is not None and not self._has_ev(f"{mission.id}:testemunho"):
            giver = next((n for n in self.city.npcs if n.name == sq.giver), None)
            if giver is not None:
                return (giver.x, giver.y, "Fale com " + sq.giver)
        building = self._target_building()
        if building is not None and not self._has_ev(f"{mission.id}:lei"):
            return (building.door_x, building.door_y, "Leia a lei em " + building.title)
        if building is not None:
            return (building.door_x, building.door_y, "Procure " + mission.giver)
        return None

    def _draw_objective_beacon(self) -> None:
        target = self._objective_target()
        if target is None:
            return
        tx, ty, _ = target
        bob = math.sin(self.clock * 4) * 6
        top = ty + 92 + bob
        arcade.draw_triangle_filled(tx - 15, top + 20, tx + 15, top + 20, tx, top, (255, 140, 90))
        arcade.draw_triangle_outline(tx - 15, top + 20, tx + 15, top + 20, tx, top, (255, 200, 150), 2)

    def _draw_crosswalks(self) -> None:
        for cw in self.city.crosswalks:
            if cw.horizontal:
                for i in range(-3, 4):
                    arcade.draw_lbwh_rectangle_filled(cw.x + i * 11 - 4, cw.y - 16, 8, 32, (228, 228, 222))
            else:
                for i in range(-3, 4):
                    arcade.draw_lbwh_rectangle_filled(cw.x - 16, cw.y + i * 11 - 4, 32, 8, (228, 228, 222))

    def _draw_building(self, b: Building) -> None:
        sprite = self.building_sprites[id(b)]
        arcade.draw_sprite(sprite, pixelated=True)
        ui.name_tag(b.title, b.x + b.width / 2, b.y + b.height + 10, (252, 246, 214), 12)
        if b.key:
            arcade.draw_circle_filled(b.door_x, b.y + 8, 5, config.COLOR_ACCENT)

    def _draw_vector_prop(self, prop: Prop) -> None:
        x, y = prop.x, prop.y
        arcade.draw_ellipse_filled(x, y - 6, prop.width + 18, 13, (25, 49, 48))
        if prop.kind == "fountain":
            arcade.draw_ellipse_filled(x, y + 10, prop.width, prop.height, (113, 126, 132))
            arcade.draw_ellipse_filled(x, y + 15, prop.width - 18, prop.height - 10, (77, 166, 188))
            arcade.draw_line(x, y + 30, x, y + 58, (137, 218, 228), 3)
        elif prop.kind == "bench":
            arcade.draw_lbwh_rectangle_filled(x - prop.width / 2, y + 10, prop.width, 9, (137, 82, 48))
            arcade.draw_lbwh_rectangle_filled(x - prop.width / 2, y + 24, prop.width, 9, (161, 97, 52))
        elif prop.kind == "lamp":
            arcade.draw_lbwh_rectangle_filled(x - 3, y, 6, 50, (55, 57, 62))
            arcade.draw_circle_filled(x, y + 58, 9, (244, 197, 91))
        elif prop.kind == "lake":
            arcade.draw_ellipse_filled(x, y + prop.height / 2, prop.width, prop.height, (52, 108, 140))
            arcade.draw_ellipse_filled(x, y + prop.height / 2, prop.width - 26, prop.height - 22, (74, 150, 184))
            arcade.draw_ellipse_outline(x, y + prop.height / 2, prop.width, prop.height, (36, 78, 104), 3)

    def _sync_city_actors(self) -> None:
        for sprite, npc in self.npc_sprites:
            frames = assets.person_frames(self._gender_for(npc.name))
            state = self.npc_state[id(npc)]
            if state["moving"]:
                cycle = frames["walk_right"]
                sprite.texture = cycle[int(state["phase"]) % len(cycle)]
            else:
                sprite.texture = frames["idle_right"]
            sprite.center_x = npc.x
            sprite.center_y = npc.y + sprite.height / 2
        self.player_sprite.center_x = self.player_x
        self.player_sprite.center_y = self.player_y + self.player_sprite.height / 2

    def _draw_interior(self) -> None:
        interior = self.interior
        if interior is None:
            return
        arcade.draw_lbwh_rectangle_filled(0, 0, config.SCREEN_WIDTH, config.SCREEN_HEIGHT, (18, 22, 26))
        arcade.draw_lbwh_rectangle_filled(RX, RY, RW, RH, interior.wall)
        arcade.draw_lbwh_rectangle_filled(RX + 16, RY + 16, RW - 32, RH - 130, interior.floor)
        arcade.draw_lbwh_rectangle_filled(RX + RW / 2 - 26, RY, 52, 20, (120, 92, 60))
        self._draw_theme(interior)
        self._draw_desk(interior.desk)
        ui.label(interior.title, config.SCREEN_WIDTH / 2, RY + RH - 40, config.COLOR_ACCENT, 22, anchor_x="center", bold=True)
        ui.label("Porta (embaixo) ou ESC para sair", config.SCREEN_WIDTH / 2, RY + 26, config.COLOR_TEXT_SOFT, 12, anchor_x="center")

        for item in interior.items:
            self._draw_item(item)

        self._sync_interior_actors()
        drawables: list[tuple[float, object]] = [(self.player_y, self.player_sprite)]
        for sprite, npc in self.int_npc_sprites:
            drawables.append((npc.y, sprite))
        drawables.sort(key=lambda d: d[0], reverse=True)
        for _, sprite in drawables:
            arcade.draw_sprite(sprite)

        for _, npc in self.int_npc_sprites:
            ui.label(npc.name, npc.x, npc.y + 96, config.COLOR_TEXT, 12, anchor_x="center", bold=True)
            ui.label(npc.role, npc.x, npc.y + 82, config.COLOR_TEXT_SOFT, 10, anchor_x="center")

        target = self._interior_target()
        if target is not None and self.mode == Mode.EXPLORE:
            ui.label(target[2], target[0], target[1] + 70, config.COLOR_ACCENT, 12, anchor_x="center", bold=True)

    def _draw_theme(self, interior: Interior) -> None:
        cx = config.SCREEN_WIDTH / 2
        if interior.theme == "chamber":
            for row in range(2):
                sy = RY + 250 + row * 34
                for i in range(6):
                    sx = cx - 190 + i * 66
                    arcade.draw_lbwh_rectangle_filled(sx, sy, 48, 14, (92, 78, 60))
            arcade.draw_lbwh_rectangle_filled(cx - 40, RY + 340, 80, 26, (120, 96, 66))
            ui.label("TRIBUNA", cx, RY + 368, config.COLOR_TEXT_SOFT, 9, anchor_x="center")
        elif interior.theme == "office":
            arcade.draw_lbwh_rectangle_filled(cx - 90, RY + 330, 180, 40, (92, 72, 50))
            arcade.draw_lbwh_rectangle_filled(RX + 60, RY + 300, 14, 90, (150, 150, 160))
            arcade.draw_lbwh_rectangle_filled(RX + 60, RY + 372, 46, 26, (120, 180, 120))
            arcade.draw_lbwh_rectangle_filled(RX + RW - 120, RY + 60, 90, 120, (70, 60, 48))
        elif interior.theme == "clinic":
            arcade.draw_lbwh_rectangle_filled(cx - 70, RY + 320, 140, 46, (220, 226, 230))
            arcade.draw_lbwh_rectangle_filled(cx - 70, RY + 360, 140, 10, (150, 200, 210))
            arcade.draw_lbwh_rectangle_filled(cx - 6, RY + 400, 12, 40, (210, 60, 60))
            arcade.draw_lbwh_rectangle_filled(cx - 20, RY + 414, 40, 12, (210, 60, 60))
            arcade.draw_lbwh_rectangle_filled(RX + RW - 130, RY + 60, 90, 120, (210, 220, 226))

    def _draw_desk(self, desk: tuple[float, float]) -> None:
        dx, dy = desk
        arcade.draw_lbwh_rectangle_filled(dx - 60, dy - 30, 120, 46, (96, 74, 52))
        arcade.draw_lbwh_rectangle_filled(dx - 60, dy + 10, 120, 8, (128, 100, 70))
        ui.label("RECEPCAO", dx, dy + 22, config.COLOR_TEXT_SOFT, 10, anchor_x="center", bold=True)

    def _draw_item(self, item: InteriorItem) -> None:
        x, y = item.x, item.y
        if item.kind == "book":
            arcade.draw_lbwh_rectangle_filled(x - 22, y, 44, 30, (150, 70, 60))
            arcade.draw_lbwh_rectangle_filled(x - 22, y + 6, 44, 4, (232, 210, 150))
            arcade.draw_line(x, y, x, y + 30, (60, 30, 26), 2)
        else:
            arcade.draw_lbwh_rectangle_filled(x - 30, y, 60, 44, (86, 96, 104))
            arcade.draw_lbwh_rectangle_outline(x - 30, y, 60, 44, (206, 214, 220), 2)
            arcade.draw_line(x - 22, y + 30, x + 22, y + 30, (206, 214, 220), 2)
            arcade.draw_line(x - 22, y + 18, x + 10, y + 18, (206, 214, 220), 2)
        ui.label(item.name, x, y + 54, config.COLOR_TEXT_SOFT, 10, anchor_x="center")

    def _sync_interior_actors(self) -> None:
        for sprite, npc in self.int_npc_sprites:
            frames = assets.person_frames(self._gender_for(npc.name))
            sprite.texture = frames["idle_right"]
            sprite.center_x = npc.x
            sprite.center_y = npc.y + sprite.height / 2
        self.player_sprite.center_x = self.player_x
        self.player_sprite.center_y = self.player_y + self.player_sprite.height / 2

    # ---------- HUD / minimap ----------
    def _draw_hud(self) -> None:
        arcade.draw_lbwh_rectangle_filled(0, config.SCREEN_HEIGHT - 54, config.SCREEN_WIDTH, 54, (12, 21, 32))
        title = self.interior.title if self.location != "city" and self.interior else self.region_name
        ui.label(f"AURORA  |  {title}", 20, config.SCREEN_HEIGHT - 38, config.COLOR_ACCENT, 16, bold=True)
        target = self._objective_target()
        objective = "Objetivo: " + target[2] if target is not None else "Todas as missoes concluidas!"
        ui.label(objective, config.SCREEN_WIDTH / 2, 16, config.COLOR_TEXT, 13, anchor_x="center")
        ui.label("J: diario", 20, 16, config.COLOR_TEXT_SOFT, 12)
        self._draw_mission_indicator()

    def _region_label(self, key: str) -> str:
        for region in self.city.regions:
            if region.key == key:
                return region.label
        return key.upper()

    def _draw_star(self, x: float, y: float, radius: float, filled: bool) -> None:
        points = []
        for i in range(10):
            r = radius if i % 2 == 0 else radius * 0.45
            ang = -math.pi / 2 + i * math.pi / 5
            points.append((x + r * math.cos(ang), y + r * math.sin(ang)))
        color = (250, 205, 90) if filled else (66, 74, 80)
        arcade.draw_polygon_filled(points, color)

    def _draw_mission_indicator(self) -> None:
        completed = self.state.get("completed_missions", [])
        mission = next_mission(completed)
        x = config.SCREEN_WIDTH - 344
        y = config.SCREEN_HEIGHT - 190
        ui.panel(x, y, 328, 122)
        ui.label("PROXIMO PASSO", x + 14, y + 96, config.COLOR_ACCENT, 13, bold=True)
        if mission is None:
            ui.label("Todas as missoes concluidas!", x + 14, y + 66, config.COLOR_OK, 14, width=300, multiline=True)
        else:
            ui.label(mission.title, x + 14, y + 76, config.COLOR_TEXT, 14, bold=True, width=300, multiline=True)
            target = self._objective_target()
            if target is not None:
                ui.label(target[2], x + 14, y + 54, config.COLOR_ACCENT, 12, width=300, multiline=True)
            got = sum(1 for e in mission.evidence if self._has_ev(e))
            ui.label(f"Provas: {got}/{len(mission.evidence)}   Local: {self._region_label(mission.region_key)}", x + 14, y + 34, config.COLOR_TEXT_SOFT, 12, width=300, multiline=True)
        # Estrelas de cidadania: uma por missao concluida.
        total = len(MISSIONS)
        for i in range(total):
            self._draw_star(x + 24 + i * 30, y + 14, 10, i < len(completed))
        extra = self.state.get("extra_stars", 0)
        if extra:
            ui.label(f"+{extra}", x + 24 + total * 30, y + 8, config.COLOR_ACCENT, 13, bold=True)

    def _draw_minimap(self) -> None:
        mx = config.SCREEN_WIDTH - MM_W - 16
        my = 78
        sx = MM_W / config.MAP_WIDTH
        sy = MM_H / config.MAP_HEIGHT
        arcade.draw_lbwh_rectangle_filled(mx - 6, my - 6, MM_W + 12, MM_H + 26, (10, 18, 27))
        arcade.draw_lbwh_rectangle_outline(mx - 6, my - 6, MM_W + 12, MM_H + 26, config.COLOR_ACCENT, 1)
        ui.label("problema", mx + 2, my + MM_H + 5, (255, 176, 96), 9, bold=True)
        ui.label("morador", mx + 90, my + MM_H + 5, (120, 220, 255), 9, bold=True)
        ui.label("cargo", mx + 176, my + MM_H + 5, (255, 132, 110), 9, bold=True)
        arcade.draw_lbwh_rectangle_filled(mx, my, MM_W, MM_H, (34, 66, 58))
        for region in self.city.regions:
            arcade.draw_lbwh_rectangle_filled(mx + region.x * sx, my + region.y * sy, region.width * sx, region.height * sy, region.floor)
        for b in self.city.buildings:
            color = config.COLOR_OK if b.key else (210, 200, 170)
            arcade.draw_lbwh_rectangle_filled(mx + b.x * sx, my + b.y * sy, max(3, b.width * sx), max(3, b.height * sy), color)
        px, py = self.world_camera.position
        arcade.draw_lbwh_rectangle_outline(mx + (px - config.SCREEN_WIDTH / 2) * sx, my + (py - config.SCREEN_HEIGHT / 2) * sy, config.SCREEN_WIDTH * sx, config.SCREEN_HEIGHT * sy, (255, 255, 255), 1)
        arcade.draw_circle_filled(mx + self.player_x * sx, my + self.player_y * sy, 4, config.COLOR_HIGHLIGHT)
        mission = next_mission(self.state.get("completed_missions", []))
        if mission is not None:
            prob = PROBLEMS_BY_MISSION.get(mission.id)
            if prob is not None and not self._has_ev(f"{mission.id}:problema"):
                self._minimap_marker(mx + prob.x * sx, my + prob.y * sy, (255, 176, 96))
            sq = SIDEQUESTS_BY_MISSION.get(mission.id)
            if sq is not None and not self._has_ev(f"{mission.id}:testemunho"):
                giver = next((n for n in self.city.npcs if n.name == sq.giver), None)
                if giver is not None:
                    self._minimap_marker(mx + giver.x * sx, my + giver.y * sy, (120, 220, 255))
            target = self._target_building()
            if target is not None:
                self._minimap_marker(mx + (target.x + target.width / 2) * sx, my + (target.y + target.height / 2) * sy, (255, 132, 110))

    def _minimap_marker(self, x: float, y: float, color: tuple[int, int, int]) -> None:
        pulse = 3 + 2 * (math.sin(self.clock * 5) + 1)
        arcade.draw_circle_outline(x, y, pulse, color, 2)
        arcade.draw_circle_filled(x, y, 2.5, color)

    def _panel(self, height: float) -> None:
        ui.panel(60, 90, config.SCREEN_WIDTH - 120, height)

    def _draw_story(self) -> None:
        self._panel(300)
        ui.label("AURORA: QUEM DECIDE?", 95, 348, config.COLOR_ACCENT, 20, bold=True)
        arcade.draw_line(95, 336, config.SCREEN_WIDTH - 95, 336, (60, 74, 84), 1)
        ui.label(self.story_text, 95, 300, config.COLOR_TEXT, 15, width=config.SCREEN_WIDTH - 200, multiline=True)
        ui.label("Enter para continuar", 95, 110, config.COLOR_TEXT_SOFT, 12)

    def _draw_dialogue(self) -> None:
        self._panel(200)
        ui.label(self.dialogue_speaker, 95, 235, config.COLOR_ACCENT, 20, bold=True)
        ui.label(self.dialogue_lines[self.dialogue_index], 95, 170, config.COLOR_TEXT, 17, width=900, multiline=True)
        ui.label("E/Enter para continuar", 95, 108, config.COLOR_TEXT_SOFT, 12)

    def _draw_mission(self) -> None:
        mission = self.active_mission
        if mission is None:
            return
        self._panel(430)
        ui.label(f"MISSAO  |  {mission.title}", 95, 480, config.COLOR_ACCENT, 20, bold=True)
        ui.label(mission.question, 95, 448, config.COLOR_TEXT, 15, width=900, multiline=True)
        ui.label("Provas reunidas:", 95, 410, config.COLOR_OK, 13, bold=True)
        for i, (_, hint) in enumerate(mission.hints):
            ui.label("- " + hint, 112, 390 - i * 20, config.COLOR_TEXT_SOFT, 12, width=880, multiline=True)
        for i, option in enumerate(mission.options):
            by = 300 - i * 50
            state = "selected" if self.mission_answer == option.letter else "normal"
            ui.panel(95, by, config.SCREEN_WIDTH - 190, 44, kind=state)
            tcolor = (60, 52, 20) if state == "selected" else (255, 255, 255)
            ui.label(f"[{option.letter}]  {option.text}", 118, by + 26, tcolor, 14, width=config.SCREEN_WIDTH - 250, multiline=True)
        ui.label("Pressione A, B ou C", 95, 108, config.COLOR_TEXT_SOFT, 12)
        if self.feedback:
            ui.label(self.feedback, 95, 145, config.COLOR_OK, 13, width=880, multiline=True)

    def _draw_complete(self) -> None:
        mission = self.active_mission
        self._panel(210)
        ui.label("MISSAO CONCLUIDA", 95, 250, config.COLOR_ACCENT, 22, bold=True)
        if mission is not None:
            ui.label(mission.success, 95, 200, config.COLOR_TEXT, 16, width=900, multiline=True)
            ui.label(mission.lesson, 95, 150, config.COLOR_TEXT_SOFT, 13, width=900, multiline=True)
        ui.label("Enter para continuar", 95, 108, config.COLOR_TEXT_SOFT, 12)

    # ---------- update ----------
    def on_update(self, delta_time: float) -> None:
        self.clock += delta_time
        if self.mode == Mode.EXPLORE:
            self._update_movement(delta_time)
            if self.location == "city":
                self._update_npcs(delta_time)
        if self.location == "city":
            self._update_camera()
            self.region_name = self._current_region()

    def _update_npcs(self, dt: float) -> None:
        """NPCs perambulam aleatoriamente em ~9 m2; congelam fora do modo EXPLORE."""
        for _, npc in self.npc_sprites:
            state = self.npc_state[id(npc)]
            if state["moving"]:
                dx, dy = state["tx"] - npc.x, state["ty"] - npc.y
                dist = (dx * dx + dy * dy) ** 0.5
                if dist < 3:
                    state["moving"] = False
                    state["timer"] = random.uniform(1.2, 3.6)
                else:
                    step = min(NPC_SPEED * dt, dist)
                    npc.x += dx / dist * step
                    npc.y += dy / dist * step
                    state["phase"] += dt * 8.0
            else:
                state["timer"] -= dt
                if state["timer"] <= 0:
                    hx, hy = state["home"]
                    state["tx"] = hx + random.uniform(-NPC_WANDER_RADIUS, NPC_WANDER_RADIUS)
                    state["ty"] = hy + random.uniform(-NPC_WANDER_RADIUS, NPC_WANDER_RADIUS)
                    state["moving"] = True

    def _update_movement(self, dt: float) -> None:
        dx = (arcade.key.RIGHT in self.held_keys or arcade.key.D in self.held_keys) - (arcade.key.LEFT in self.held_keys or arcade.key.A in self.held_keys)
        dy = (arcade.key.UP in self.held_keys or arcade.key.W in self.held_keys) - (arcade.key.DOWN in self.held_keys or arcade.key.S in self.held_keys)
        if dx or dy:
            length = (dx * dx + dy * dy) ** 0.5
            self.velocity_x += dx / length * config.ACCELERATION * dt
            self.velocity_y += dy / length * config.ACCELERATION * dt
            if dx < 0:
                self.facing_left = True
            elif dx > 0:
                self.facing_left = False
        else:
            damping = config.FRICTION ** max(1.0, dt * 60)
            self.velocity_x *= damping
            self.velocity_y *= damping
        speed = (self.velocity_x ** 2 + self.velocity_y ** 2) ** 0.5
        if speed > config.MAX_SPEED:
            factor = config.MAX_SPEED / speed
            self.velocity_x *= factor
            self.velocity_y *= factor
        if self.location == "city":
            self._move_city(self.velocity_x * dt, self.velocity_y * dt)
        else:
            self._move_interior(self.velocity_x * dt, self.velocity_y * dt)
        self._animate(dt, speed)

    def _animate(self, dt: float, speed: float) -> None:
        frames = assets.person_frames(self.player_gender)
        side = "left" if self.facing_left else "right"
        if speed > 20:
            self.walk_time += dt * 8.0
            cycle = frames["walk_" + side]
            self.player_sprite.texture = cycle[int(self.walk_time) % len(cycle)]
        else:
            self.walk_time = 0.0
            self.player_sprite.texture = frames["idle_" + side]

    def _move_city(self, dx: float, dy: float) -> None:
        nx = min(config.MAP_WIDTH - 30, max(30, self.player_x + dx))
        if not self._blocked(nx, self.player_y, dx, 0):
            self.player_x = nx
        else:
            self.velocity_x = 0
        ny = min(config.MAP_HEIGHT - 30, max(30, self.player_y + dy))
        if not self._blocked(self.player_x, ny, 0, dy):
            self.player_y = ny
        else:
            self.velocity_y = 0

    def _move_interior(self, dx: float, dy: float) -> None:
        self.player_x = min(RX + RW - 40, max(RX + 40, self.player_x + dx))
        self.player_y = min(RY + RH - 150, max(RY + 44, self.player_y + dy))

    def _blocked(self, x: float, y: float, dx: float, dy: float) -> bool:
        # Colisao com todo o footprint do predio (visao top-down); a porta fica ao sul (livre).
        for b in self.city.buildings:
            if b.x - 6 < x < b.x + b.width + 6 and b.y - 2 < y < b.y + b.height + 6:
                return True
        for prop in self.city.props:
            if not prop.solid:
                continue
            if abs(prop.x - x) < prop.width / 2 + 20 and abs(prop.y - y) < prop.height / 2 + 20:
                if prop.pushable:
                    px, py = prop.x + dx * 0.7, prop.y + dy * 0.7
                    if not self._prop_overlaps(px, py, prop):
                        prop.x, prop.y = px, py
                        return False
                return True
        return False

    def _prop_overlaps(self, x: float, y: float, moving: Prop) -> bool:
        if not (20 < x < config.MAP_WIDTH - 20 and 20 < y < config.MAP_HEIGHT - 20):
            return True
        for other in self.city.props:
            if other is moving:
                continue
            if abs(other.x - x) < (other.width + moving.width) / 2 and abs(other.y - y) < (other.height + moving.height) / 2:
                return True
        return False

    def _update_camera(self) -> None:
        half_w = config.SCREEN_WIDTH / 2
        half_h = config.SCREEN_HEIGHT / 2
        cx = min(config.MAP_WIDTH - half_w, max(half_w, self.player_x))
        cy = min(config.MAP_HEIGHT - half_h, max(half_h, self.player_y))
        px, py = self.world_camera.position
        self.world_camera.position = (px + (cx - px) * 0.15, py + (cy - py) * 0.15)

    def _current_region(self) -> str:
        for region in self.city.regions:
            if region.x <= self.player_x <= region.x + region.width and region.y <= self.player_y <= region.y + region.height:
                return region.label
        return "AURORA"

    def _target_building(self) -> Building | None:
        mission = next_mission(self.state.get("completed_missions", []))
        if mission is None:
            return None
        for b in self.city.buildings:
            if b.key == mission.region_key:
                return b
        return None

    # ---------- input ----------
    def on_key_press(self, key: int, modifiers: int) -> None:
        if key == arcade.key.ESCAPE:
            if self.mode in (Mode.DIALOGUE, Mode.MISSION, Mode.COMPLETE, Mode.STORY):
                self.mode = Mode.EXPLORE
            elif self.location != "city":
                self._exit_interior()
            else:
                self._open_pause()
            return
        if key == arcade.key.J and self.mode == Mode.EXPLORE:
            self._open_journal()
            return
        if self.mode == Mode.STORY:
            if key in (arcade.key.ENTER, arcade.key.SPACE):
                if self.story_is_final:
                    self._open_credits()
                    return
                self.mode = Mode.EXPLORE
            return
        if self.mode == Mode.EXPLORE:
            self.held_keys.add(key)
            if key in (arcade.key.E, arcade.key.ENTER):
                self._interact()
        elif self.mode == Mode.DIALOGUE and key in (arcade.key.E, arcade.key.ENTER, arcade.key.SPACE):
            self.dialogue_index += 1
            if self.dialogue_index >= len(self.dialogue_lines):
                self._finish_dialogue()
        elif self.mode == Mode.MISSION:
            letter = {arcade.key.A: "A", arcade.key.B: "B", arcade.key.C: "C"}.get(key)
            if letter:
                self._answer(letter)
        elif self.mode == Mode.COMPLETE and key in (arcade.key.E, arcade.key.ENTER):
            self.mode = Mode.EXPLORE
            self._maybe_queue_stage_story()

    def on_key_release(self, key: int, modifiers: int) -> None:
        self.held_keys.discard(key)

    def _dist(self, x: float, y: float) -> float:
        return ((self.player_x - x) ** 2 + (self.player_y - y) ** 2) ** 0.5

    # ---------- city interaction ----------
    def _city_interact_target(self) -> tuple[float, float, str] | None:
        best = None
        best_d = 1e9
        for b in self.city.buildings:
            if not b.key:
                continue
            d = self._dist(b.door_x, b.door_y)
            if d < 100 and d < best_d:
                best, best_d = (b.door_x, b.door_y + 20, "E entrar"), d
        for n in self.city.npcs:
            if not self._npc_visible(n):
                continue
            d = self._dist(n.x, n.y)
            if d < 120 and d < best_d:
                best, best_d = (n.x, n.y, "E conversar"), d
        for p in self.city.problems:
            d = self._dist(p.x, p.y)
            if d < 90 and d < best_d:
                best, best_d = (p.x, p.y, "E investigar"), d
        return best

    def _interior_target(self) -> tuple[float, float, str] | None:
        interior = self.interior
        if interior is None:
            return None
        best = None
        best_d = 1e9
        for npc in interior.npcs:
            d = self._dist(npc.x, npc.y)
            if d < 130 and d < best_d:
                best, best_d = (npc.x, npc.y, "E conversar"), d
        for item in interior.items:
            d = self._dist(item.x, item.y)
            if d < 90 and d < best_d:
                best, best_d = (item.x, item.y, "E ler"), d
        exit_d = self._dist(config.SCREEN_WIDTH / 2, RY)
        if exit_d < 80 and exit_d < best_d:
            best = (config.SCREEN_WIDTH / 2, RY + 30, "E sair")
        return best

    def _interact(self) -> None:
        if self.location == "city":
            self._interact_city()
        else:
            self._interact_interior()

    def _interact_city(self) -> None:
        opts: list[tuple[float, str, object]] = []
        for b in self.city.buildings:
            if b.key and self._dist(b.door_x, b.door_y) < 100:
                opts.append((self._dist(b.door_x, b.door_y), "door", b))
        for n in self.city.npcs:
            if self._npc_visible(n) and self._dist(n.x, n.y) < 120:
                opts.append((self._dist(n.x, n.y), "npc", n))
        for p in self.city.problems:
            if self._dist(p.x, p.y) < 90:
                opts.append((self._dist(p.x, p.y), "problem", p))
        if not opts:
            return
        opts.sort(key=lambda t: t[0])
        _, kind, obj = opts[0]
        if kind == "door":
            self._enter_interior(obj.key)
        elif kind == "npc":
            self._talk_to(obj)
        else:
            self._investigate(obj)

    def _interact_interior(self) -> None:
        interior = self.interior
        if interior is None:
            return
        if self._dist(config.SCREEN_WIDTH / 2, RY) < 80:
            self._exit_interior()
            return
        npc = min((n for n in interior.npcs if self._dist(n.x, n.y) < 130), key=lambda n: self._dist(n.x, n.y), default=None)
        if npc is not None:
            self._talk_to(npc)
            return
        item = min((it for it in interior.items if self._dist(it.x, it.y) < 90), key=lambda it: self._dist(it.x, it.y), default=None)
        if item is not None:
            audio.play_sfx("confirm")
            self.dialogue_speaker = item.name
            lines = [item.text]
            if item.grants and self._grant_ev(item.grants):
                lines.append("Prova registrada: documento lido.")
            self.active_mission = None
            self._begin_dialogue(lines)

    def _enter_interior(self, key: str) -> None:
        interior = self.interiors.get(key)
        if interior is None:
            return
        audio.play_sfx("confirm")
        self._persist()
        self.city_return = (self.player_x, self.player_y)
        self.interior = interior
        self.location = key
        self.int_npc_sprites = [(self._make_actor(npc.name), npc) for npc in interior.npcs]
        self.player_x, self.player_y = config.SCREEN_WIDTH / 2, RY + 70
        self.velocity_x = self.velocity_y = 0.0

    def _exit_interior(self) -> None:
        audio.play_sfx("back")
        self.int_npc_sprites = []
        self.interior = None
        self.location = "city"
        self.player_x, self.player_y = self.city_return
        self.velocity_x = self.velocity_y = 0.0
        self.mode = Mode.EXPLORE

    def _talk_to(self, npc: NPC) -> None:
        self.dialogue_speaker = f"{npc.name}  ({npc.role})"
        if npc.mission:
            self._talk_mission(npc)
            return
        sq = SIDEQUESTS_BY_GIVER.get(npc.name)
        if sq is not None:
            self._talk_sidequest_giver(npc, sq)
            return
        target_sq = self._active_target_quest(npc.name)
        if target_sq is not None:
            self._talk_sidequest_target(npc, target_sq)
            return
        lines = [npc.greeting]
        if npc.extra_line:
            lines.append(npc.extra_line)
        self.active_mission = None
        self._begin_dialogue(lines)

    def _begin_dialogue(self, lines: list[str]) -> None:
        self.dialogue_lines = lines
        self.dialogue_index = 0
        self.mode = Mode.DIALOGUE

    def _talk_mission(self, npc: NPC) -> None:
        completed = self.state.get("completed_missions", [])
        mission = MISSIONS_BY_ID.get(npc.mission)
        upcoming = next_mission(completed)
        if mission is None:
            self.active_mission = None
            self._begin_dialogue([npc.greeting])
        elif mission.id in completed:
            self.active_mission = None
            self._begin_dialogue([npc.greeting, mission.lesson])
        elif upcoming is not None and mission.id == upcoming.id:
            if self._mission_ready(mission):
                self.active_mission = mission
                self._begin_dialogue(list(mission.intro))
            else:
                self.active_mission = None
                self._begin_dialogue([npc.greeting] + self._evidence_checklist(mission))
        else:
            self.active_mission = None
            hint = upcoming.giver if upcoming else "o cargo anterior"
            self._begin_dialogue([npc.greeting, f"Antes disso, conclua a missao anterior com {hint}."])

    def _evidence_checklist(self, mission: Mission) -> list[str]:
        labels = {"problema": "Investigar o problema no mapa",
                  "testemunho": "Ouvir os moradores (side quest)",
                  "lei": "Ler a lei relacionada (dentro do predio)"}
        lines = ["Antes de decidir, reuna as provas do caso:"]
        for eid in mission.evidence:
            key = eid.split(":", 1)[1]
            mark = "[X]" if self._has_ev(eid) else "[  ]"
            lines.append(f"{mark} {labels.get(key, key)}")
        return lines

    def _active_target_quest(self, name: str):
        for sq in SIDEQUESTS:
            if name in sq.targets:
                st = self._sidequests().get(sq.id)
                if st is not None and not st.get("done"):
                    return sq
        return None

    def _talk_sidequest_giver(self, npc: NPC, sq) -> None:
        sqs = self._sidequests()
        st = sqs.get(sq.id)
        self.active_mission = None
        if st is None:
            sqs[sq.id] = {"talked": [], "done": False}
            self._persist()
            self._begin_dialogue([npc.greeting, sq.intro, "Objetivo: " + sq.objective])
        elif st.get("done"):
            self._begin_dialogue([sq.done_line])
        else:
            remaining = [t for t in sq.targets if t not in st.get("talked", [])]
            self._begin_dialogue([sq.intro, "Ainda falta ouvir: " + (", ".join(remaining) if remaining else "ninguem")])

    def _talk_sidequest_target(self, npc: NPC, sq) -> None:
        st = self._sidequests()[sq.id]
        self.active_mission = None
        talked = st.setdefault("talked", [])
        if npc.name not in talked:
            talked.append(npc.name)
        lines = [sq.testimonies.get(npc.name, npc.greeting)]
        if all(t in talked for t in sq.targets) and not st.get("done"):
            st["done"] = True
            self._grant_ev(sq.grants)
            self.state["extra_stars"] = self.state.get("extra_stars", 0) + 1
            lines.append("Voce reuniu o testemunho dos moradores. (+1 estrela de cidadania)")
        self._persist()
        self._begin_dialogue(lines)

    def _investigate(self, problem: Problem) -> None:
        self.active_mission = None
        self.dialogue_speaker = problem.title
        if self._problem_solved(problem):
            self._begin_dialogue([problem.desc_solved])
            return
        lines = [problem.desc_unsolved]
        if self._grant_ev(f"{problem.mission_id}:problema"):
            lines.append("Prova registrada: voce investigou o problema.")
        self._begin_dialogue(lines)

    def _finish_dialogue(self) -> None:
        if self.active_mission is not None:
            self.mission_answer = None
            self.feedback = ""
            self.mode = Mode.MISSION
        else:
            self.mode = Mode.EXPLORE

    def _answer(self, letter: str) -> None:
        mission = self.active_mission
        if mission is None:
            return
        self.mission_answer = letter
        option = next((o for o in mission.options if o.letter == letter), None)
        if option is None:
            return
        if option.correct:
            audio.play_sfx("success")
            self.feedback = mission.success
            self._register_mission(mission)
            self.mode = Mode.COMPLETE
        else:
            audio.play_sfx("error")
            self.feedback = "Ainda nao. Pense no nivel de governo responsavel e tente novamente."

    def _register_mission(self, mission: Mission) -> None:
        completed = self.state.setdefault("completed_missions", [])
        if mission.id not in completed:
            completed.append(mission.id)
        roles = self.state.setdefault("learned_roles", [])
        for role in mission.roles:
            if role not in roles:
                roles.append(role)
        self._persist()

    def _persist(self) -> None:
        if self.location == "city":
            self.state["position"] = {"x": self.player_x, "y": self.player_y}
            self.state["region"] = self._current_region().lower().replace(" ", "_")
        save_manager.save_slot(self.slot, self.state)

    def _open_pause(self) -> None:
        self._persist()
        from src.views.pause import PauseView

        self.window.show_view(PauseView(self))

    def _open_journal(self) -> None:
        from src.views.journal import JournalView

        self.window.show_view(JournalView(self))

    def _open_credits(self) -> None:
        self._persist()
        from src.views.credits import CreditsView

        self.window.show_view(CreditsView(self))
