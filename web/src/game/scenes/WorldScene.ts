import Phaser from "phaser";
import {
  ACCELERATION,
  FRICTION,
  HEX,
  MAP_HEIGHT,
  MAP_WIDTH,
  MAX_SPEED,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "../config";
import {
  buildCity,
  groundKind,
  TILE,
  type Building,
  type City,
  type NPC,
  type Prop,
} from "../world/city";
import { buildInteriors, type Interior, type InteriorItem, type InteriorNPC } from "../world/interiors";
import { MISSIONS_BY_ID, nextMission, STORY, type Mission } from "../content/missions";
import type { Problem } from "../content/problems";
import { SIDEQUESTS_BY_GIVER, type SideQuest } from "../content/sidequests";
import { gameBus, uiBus, type MissionPayload } from "../bus";
import { saveSlot, type GameState } from "../save";
import { audio } from "../audio";
import { avatarTextureKey, ensureAvatars, type AvatarSpec, type AvatarStyle } from "../sprites";
import * as logic from "../logic";

const ROOM = { x: 70, y: 120, w: 1140, h: 470 };
const MM_W = 250;
const MM_H = 188;
const MM_PAD = 16;
const GROUND_COLORS: Record<string, number> = {
  grass: 0x1c4a3f,
  road: 0x2b3440,
  sidewalk: HEX.petrol2,
  plaza: 0x27614f,
  crosswalk_h: 0x3a4655,
  crosswalk_v: 0x3a4655,
};

interface Actor {
  container: Phaser.GameObjects.Container;
  ref: NPC | InteriorNPC;
}

export interface WorldInit {
  slot: number;
  state: GameState;
  showTutorial: boolean;
}

export class WorldScene extends Phaser.Scene {
  private slot = 1;
  private state!: GameState;
  private showTutorial = false;

  private city!: City;
  private interiors!: Record<string, Interior>;

  private px = 600;
  private py = 1200;
  private vx = 0;
  private vy = 0;

  private location = "city";
  private interior: Interior | null = null;
  private cityReturn: [number, number] = [600, 1200];

  private mode: "explore" | "story" | "dialogue" | "mission" | "complete" = "explore";
  private activeMission: Mission | null = null;
  private shownStages = new Set<string>();

  private worldLayer!: Phaser.GameObjects.Container;
  private interiorLayer!: Phaser.GameObjects.Container;
  private player!: Phaser.GameObjects.Container;
  private cityActors: Actor[] = [];
  private interiorActors: Actor[] = [];
  private problemMarkers = new Map<string, Phaser.GameObjects.Container>();
  private beacon!: Phaser.GameObjects.Container;
  private minimap!: Phaser.GameObjects.Container;
  private minimapDot!: Phaser.GameObjects.Graphics;
  private minimapObjective!: Phaser.GameObjects.Graphics;

  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private lastPrompt = "";
  private unbind: Array<() => void> = [];

  constructor() {
    super("world");
  }

  init(data: WorldInit) {
    this.slot = data.slot;
    this.state = data.state;
    this.showTutorial = data.showTutorial;
    this.px = data.state.position?.x ?? 600;
    this.py = data.state.position?.y ?? 1200;
  }

  create() {
    this.city = buildCity();
    this.interiors = buildInteriors();

    this.worldLayer = this.add.container(0, 0);
    this.interiorLayer = this.add.container(0, 0).setScrollFactor(0).setVisible(false);

    this.drawGround();
    this.drawRegions();
    this.drawBuildings();
    this.drawProps();
    this.drawProblems();

    // Player provisorio (vetorial) para camera/movimento antes dos avatares carregarem.
    this.player = this.makePerson(0xf5c451, 0x2ec4a3, true);
    this.worldLayer.add(this.player);

    this.beacon = this.makeBeacon();
    this.worldLayer.add(this.beacon);
    this.buildMinimap();

    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.setBackgroundColor(HEX.ink);
    this.cameras.main.centerOn(this.px, this.py);

    // Sprites de personagens via DiceBear (biblioteca JS, CC0).
    void ensureAvatars(this, this.avatarSpecs()).then(() => {
      if (this.scene.isActive()) this.applyAvatars();
    });

    this.keys = this.input.keyboard!.addKeys(
      "W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ENTER,SPACE,ESC,J",
    ) as Record<string, Phaser.Input.Keyboard.Key>;

    this.input.keyboard!.on("keydown-E", () => this.onInteract());
    this.input.keyboard!.on("keydown-ENTER", () => this.onInteract());
    this.input.keyboard!.on("keydown-J", () => {
      if (this.mode === "explore") uiBus.emit("toggleJournal");
    });
    this.input.keyboard!.on("keydown-ESC", () => this.onEscape());

    // Comandos vindos da UI React.
    this.unbind.push(uiBus.on("advanceDialogue", () => this.advanceDialogue()));
    this.unbind.push(uiBus.on("closeDialogue", () => this.setMode("explore")));
    this.unbind.push(uiBus.on("answer", (letter) => this.answer(letter)));
    this.unbind.push(uiBus.on("closeMission", () => this.setMode("explore")));
    this.unbind.push(uiBus.on("advanceStory", () => this.advanceStory()));

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unbind.forEach((fn) => fn());
      this.unbind = [];
    });

    if (this.showTutorial) this.queueStory("abertura");
    this.maybeQueueStageStory();
    this.emitHud("");
  }

  // ---------------------------------------------------------------- rendering
  private drawGround() {
    const g = this.add.graphics();
    const cols = Math.floor(MAP_WIDTH / TILE) + 1;
    const rows = Math.floor(MAP_HEIGHT / TILE) + 1;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = col * TILE;
        const cy = row * TILE;
        const kind = groundKind(cx + TILE / 2, cy + TILE / 2, this.city);
        g.fillStyle(GROUND_COLORS[kind] ?? GROUND_COLORS.grass, 1);
        g.fillRect(cx, cy, TILE, TILE);
        if (kind === "crosswalk_h" || kind === "crosswalk_v") {
          g.fillStyle(HEX.cream, 0.5);
          if (kind === "crosswalk_h") g.fillRect(cx, cy + TILE / 2 - 3, TILE, 6);
          else g.fillRect(cx + TILE / 2 - 3, cy, 6, TILE);
        }
      }
    }
    g.setDepth(-10000);
    this.worldLayer.add(g);
  }

  private drawRegions() {
    for (const region of this.city.regions) {
      const label = this.add
        .text(region.x + region.width / 2, region.y + 12, region.label, {
          fontFamily: "Sora, sans-serif",
          fontSize: "16px",
          color: "#6f8792",
        })
        .setOrigin(0.5, 0)
        .setDepth(-9000);
      this.worldLayer.add(label);
    }
  }

  private drawBuildings() {
    this.city.buildings.forEach((b) => {
      const c = this.add.container(b.x + b.width / 2, b.y + b.height / 2);
      const g = this.add.graphics();
      g.fillStyle(rgb(b.sideColor), 1);
      g.fillRoundedRect(-b.width / 2, -b.height / 2, b.width, b.height, 10);
      g.fillStyle(rgb(b.frontColor), 1);
      g.fillRoundedRect(-b.width / 2, -b.height / 2 + 10, b.width, b.height - 18, 8);
      // porta ao sul
      g.fillStyle(HEX.ink, 1);
      g.fillRoundedRect(-24, b.height / 2 - 34, 48, 34, 6);
      c.add(g);
      const title = this.add
        .text(0, -6, b.title, {
          fontFamily: "Sora, sans-serif",
          fontSize: "15px",
          color: "#0a1f2b",
          fontStyle: "bold",
          align: "center",
          wordWrap: { width: b.width - 16 },
        })
        .setOrigin(0.5);
      c.add(title);
      c.setDepth(b.y + b.height);
      this.worldLayer.add(c);
    });
  }

  private drawProps() {
    this.city.props.forEach((p) => {
      const c = this.add.container(p.x, p.y);
      const g = this.add.graphics();
      this.paintProp(g, p);
      c.add(g);
      c.setDepth(p.y);
      this.worldLayer.add(c);
      // guarda refs de props empurraveis para atualizar posicao
      if (p.pushable) (c as unknown as { propRef: Prop }).propRef = p;
      p.pushable && this.pushableContainers.set(p, c);
    });
  }

  private pushableContainers = new Map<Prop, Phaser.GameObjects.Container>();

  private paintProp(g: Phaser.GameObjects.Graphics, p: Prop) {
    const w = p.width;
    const h = p.height;
    switch (p.kind) {
      case "tree":
        g.fillStyle(0x14846c, 1);
        g.fillCircle(0, -h / 2, w * 0.8);
        g.fillStyle(0x5a3d22, 1);
        g.fillRect(-4, -h / 2, 8, h);
        break;
      case "bush":
        g.fillStyle(0x1c8a5f, 1);
        g.fillCircle(0, 0, w * 0.7);
        break;
      case "fountain":
        g.fillStyle(HEX.petrol2, 1);
        g.fillEllipse(0, 0, w, h);
        g.fillStyle(HEX.emerald, 0.8);
        g.fillCircle(0, 0, w * 0.25);
        break;
      case "bench":
        g.fillStyle(0x8a6b45, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
        break;
      case "crate":
        g.fillStyle(HEX.goldDeep, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
        break;
      case "lamp":
      case "streetlamp":
      case "trafficlight":
        g.fillStyle(0x3a4655, 1);
        g.fillRect(-3, -h / 2, 6, h);
        g.fillStyle(HEX.gold, 0.9);
        g.fillCircle(0, -h / 2, 6);
        break;
      case "stall_green":
      case "stall_orange":
        g.fillStyle(p.kind.endsWith("green") ? 0x2ec4a3 : 0xe0a92e, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
        break;
      default:
        if (p.kind.startsWith("car_")) {
          g.fillStyle(this.carColor(p.kind), 1);
          g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
          g.fillStyle(HEX.ink, 0.6);
          g.fillRoundedRect(-w / 2 + 8, -h / 2 + 4, w - 16, h / 2 - 4, 4);
        } else {
          g.fillStyle(HEX.slate, 1);
          g.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
        }
    }
  }

  private carColor(kind: string): number {
    const map: Record<string, number> = {
      car_sedan: 0x4f8fd4,
      car_taxi: 0xf5c451,
      car_police: 0x2b3440,
      car_bus: 0xe0742e,
      car_van: 0xcdd6d3,
      car_truck: 0x6f8792,
      car_suv: 0x2ec4a3,
      car_sports: 0xd44f5a,
      car_amb: 0xf4efe3,
    };
    return map[kind] ?? HEX.slate;
  }

  private drawProblems() {
    this.city.problems.forEach((p) => {
      const c = this.add.container(p.x, p.y);
      const g = this.add.graphics();
      c.add(g);
      const label = this.add
        .text(0, -34, "!", {
          fontFamily: "Press Start 2P, monospace",
          fontSize: "18px",
          color: "#f5c451",
        })
        .setOrigin(0.5);
      c.add(label);
      c.setDepth(p.y);
      (c as unknown as { problemGfx: Phaser.GameObjects.Graphics }).problemGfx = g;
      this.problemMarkers.set(p.id, c);
      this.worldLayer.add(c);
    });
    this.refreshProblemMarkers();
  }

  private refreshProblemMarkers() {
    this.city.problems.forEach((p) => {
      const c = this.problemMarkers.get(p.id);
      if (!c) return;
      const g = (c as unknown as { problemGfx: Phaser.GameObjects.Graphics }).problemGfx;
      const solved = this.state.completed_missions.includes(p.missionId);
      g.clear();
      g.fillStyle(solved ? HEX.emerald : HEX.gold, 1);
      g.fillCircle(0, 0, 14);
      g.lineStyle(3, HEX.ink, 1);
      g.strokeCircle(0, 0, 14);
      const label = c.list[1] as Phaser.GameObjects.Text;
      label.setText(solved ? "✓" : "!");
    });
  }

  private drawCityActors() {
    this.cityActors.forEach((a) => a.container.destroy());
    this.cityActors = [];
    this.city.npcs.forEach((n) => {
      if (!this.npcVisible(n)) return;
      const c = this.makeActor(n, false);
      c.setPosition(n.x, n.y);
      c.setDepth(n.y);
      this.worldLayer.add(c);
      this.cityActors.push({ container: c, ref: n });
    });
  }

  // ---- avatares (DiceBear) ----
  private avatarStyleFor(ref: { name: string; kit?: string; mission?: string }): AvatarStyle {
    if (ref.kit?.includes("adventurer")) return "adventurer";
    if (ref.mission) return "adventurer";
    return "personas";
  }

  private avatarSpecs(): AvatarSpec[] {
    const specs: AvatarSpec[] = [{ style: "adventurer", seed: "Joana-Aurora" }];
    this.city.npcs.forEach((n) => specs.push({ style: this.avatarStyleFor(n), seed: n.name }));
    for (const it of Object.values(this.interiors)) {
      it.npcs.forEach((n) => specs.push({ style: this.avatarStyleFor(n), seed: n.name }));
    }
    return specs;
  }

  private applyAvatars() {
    // Troca o player vetorial pelo avatar.
    const pos: [number, number] = [this.player.x, this.player.y];
    const parent = this.player.parentContainer ?? this.worldLayer;
    this.player.destroy();
    this.player = this.makeActor({ name: "Joana-Aurora" }, true);
    this.player.setPosition(pos[0], pos[1]);
    parent.add(this.player);
    // Redesenha NPCs da cidade como avatares.
    this.drawCityActors();
  }

  private makeActor(
    ref: { name: string; role?: string; kit?: string; mission?: string; tint?: [number, number, number] },
    isPlayer: boolean,
  ): Phaser.GameObjects.Container {
    const style = isPlayer ? "adventurer" : this.avatarStyleFor(ref);
    const seed = isPlayer ? "Joana-Aurora" : ref.name;
    const key = avatarTextureKey(style, seed);
    const label = isPlayer ? undefined : ref.role ? `${ref.name} (${ref.role})` : ref.name;
    if (this.textures.exists(key)) return this.makeAvatarActor(key, isPlayer, label);
    return this.makePerson(rgb(ref.tint ?? [255, 255, 255]), 0x17475c, isPlayer, label);
  }

  private makeAvatarActor(
    key: string,
    isPlayer: boolean,
    name?: string,
  ): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0);
    const shadow = this.add.graphics();
    shadow.fillStyle(HEX.ink, 0.35);
    shadow.fillEllipse(0, 4, 34, 12);
    c.add(shadow);
    const img = this.add.image(0, 0, key).setOrigin(0.5, 0.9);
    img.setDisplaySize(56, 56);
    c.add(img);
    if (isPlayer) {
      const ring = this.add.graphics();
      ring.lineStyle(2, HEX.gold, 0.9);
      ring.strokeEllipse(0, 2, 40, 16);
      c.add(ring);
    }
    if (name) {
      const tag = this.add
        .text(0, -52, name, {
          fontFamily: "Inter, sans-serif",
          fontSize: "11px",
          color: "#f4efe3",
          backgroundColor: "#103343cc",
          padding: { x: 4, y: 1 },
        })
        .setOrigin(0.5)
        .setAlpha(0);
      c.add(tag);
      (c as unknown as { nameTag: Phaser.GameObjects.Text }).nameTag = tag;
    }
    return c;
  }

  private makePerson(
    bodyColor: number,
    accent: number,
    isPlayer: boolean,
    name?: string,
  ): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(accent, 1);
    g.fillEllipse(0, 6, 30, 12); // sombra
    g.fillStyle(bodyColor, 1);
    g.fillRoundedRect(-11, -30, 22, 30, 8); // corpo
    g.fillStyle(0xffe0c4, 1);
    g.fillCircle(0, -38, 11); // cabeca
    g.fillStyle(0x3a2b20, 1);
    g.fillRoundedRect(-11, -48, 22, 10, 5); // cabelo
    if (isPlayer) {
      g.lineStyle(2, HEX.gold, 1);
      g.strokeCircle(0, -38, 13);
    }
    c.add(g);
    if (name) {
      const tag = this.add
        .text(0, -66, name, {
          fontFamily: "Inter, sans-serif",
          fontSize: "11px",
          color: "#f4efe3",
          backgroundColor: "#103343cc",
          padding: { x: 4, y: 1 },
        })
        .setOrigin(0.5)
        .setAlpha(0);
      c.add(tag);
      (c as unknown as { nameTag: Phaser.GameObjects.Text }).nameTag = tag;
    }
    return c;
  }

  private makeBeacon(): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(HEX.gold, 0.9);
    g.fillTriangle(-12, -60, 12, -60, 0, -40);
    c.add(g);
    c.setDepth(99999);
    c.setVisible(false);
    return c;
  }

  // ---- minimapa (fixo, canto inferior direito) ----
  private buildMinimap() {
    const ox = SCREEN_WIDTH - MM_W - MM_PAD;
    const oy = SCREEN_HEIGHT - MM_H - MM_PAD;
    this.minimap = this.add.container(ox, oy).setScrollFactor(0).setDepth(100000);
    const bg = this.add.graphics();
    bg.fillStyle(HEX.ink, 0.72);
    bg.fillRoundedRect(0, 0, MM_W, MM_H, 8);
    bg.lineStyle(2, HEX.gold, 0.5);
    bg.strokeRoundedRect(0, 0, MM_W, MM_H, 8);
    this.minimap.add(bg);

    const sx = MM_W / MAP_WIDTH;
    const sy = MM_H / MAP_HEIGHT;
    const stat = this.add.graphics();
    // regioes (verde tenue)
    this.city.regions.forEach((r) => {
      stat.fillStyle(HEX.emeraldDeep, 0.25);
      stat.fillRect(r.x * sx, r.y * sy, r.width * sx, r.height * sy);
    });
    // predios
    this.city.buildings.forEach((b) => {
      stat.fillStyle(rgb(b.frontColor), 0.95);
      stat.fillRect(b.x * sx, b.y * sy, Math.max(3, b.width * sx), Math.max(3, b.height * sy));
    });
    this.minimap.add(stat);

    this.minimapObjective = this.add.graphics();
    this.minimap.add(this.minimapObjective);
    this.minimapDot = this.add.graphics();
    this.minimap.add(this.minimapDot);

    const label = this.add
      .text(8, 6, "MAPA", { fontFamily: "Press Start 2P, monospace", fontSize: "8px", color: "#f5c451" })
      .setOrigin(0, 0);
    this.minimap.add(label);
  }

  private updateMinimap() {
    if (!this.minimap) return;
    const inCity = this.location === "city";
    this.minimap.setVisible(inCity);
    if (!inCity) return;
    const sx = MM_W / MAP_WIDTH;
    const sy = MM_H / MAP_HEIGHT;
    this.minimapDot.clear();
    this.minimapDot.fillStyle(HEX.gold, 1);
    this.minimapDot.fillCircle(this.px * sx, this.py * sy, 4);
    this.minimapDot.lineStyle(1, HEX.ink, 1);
    this.minimapDot.strokeCircle(this.px * sx, this.py * sy, 4);
    // objetivo (predio da proxima missao)
    this.minimapObjective.clear();
    const b = this.targetBuilding();
    if (b) {
      const mx = (b.x + b.width / 2) * sx;
      const my = (b.y + b.height / 2) * sy;
      this.minimapObjective.lineStyle(2, HEX.emerald, 1);
      this.minimapObjective.strokeCircle(mx, my, 6);
    }
  }

  // ---------------------------------------------------------------- update
  update(_time: number, deltaMs: number) {
    const dt = deltaMs / 1000;
    if (this.mode === "explore") this.updateMovement(dt);
    this.updateDepth();
    this.updateActorTags();
    this.updateMinimap();
    if (this.location === "city") this.updateBeacon();
    if (this.mode === "explore") this.updatePrompt();
  }

  private updateMovement(dt: number) {
    const k = this.keys;
    const right = (k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown ? 1 : 0);
    // Phaser Y para baixo: cima diminui y.
    const down = (k.DOWN.isDown || k.S.isDown ? 1 : 0) - (k.UP.isDown || k.W.isDown ? 1 : 0);
    if (right || down) {
      const len = Math.hypot(right, down);
      this.vx += (right / len) * ACCELERATION * dt;
      this.vy += (down / len) * ACCELERATION * dt;
    } else {
      const damping = Math.pow(FRICTION, Math.max(1, dt * 60));
      this.vx *= damping;
      this.vy *= damping;
    }
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > MAX_SPEED) {
      const f = MAX_SPEED / speed;
      this.vx *= f;
      this.vy *= f;
    }
    if (this.location === "city") this.moveCity(this.vx * dt, this.vy * dt);
    else this.moveInterior(this.vx * dt, this.vy * dt);

    this.player.setPosition(this.px, this.py);
    if (this.location === "city") {
      const cam = this.cameras.main;
      const half = { w: SCREEN_WIDTH / 2, h: SCREEN_HEIGHT / 2 };
      const cx = Math.min(MAP_WIDTH - half.w, Math.max(half.w, this.px));
      const cy = Math.min(MAP_HEIGHT - half.h, Math.max(half.h, this.py));
      const curX = cam.midPoint.x;
      const curY = cam.midPoint.y;
      cam.centerOn(curX + (cx - curX) * 0.15, curY + (cy - curY) * 0.15);
    }
  }

  private moveCity(dx: number, dy: number) {
    const nx = Math.min(MAP_WIDTH - 30, Math.max(30, this.px + dx));
    if (!this.blocked(nx, this.py, dx, 0)) this.px = nx;
    else this.vx = 0;
    const ny = Math.min(MAP_HEIGHT - 30, Math.max(30, this.py + dy));
    if (!this.blocked(this.px, ny, 0, dy)) this.py = ny;
    else this.vy = 0;
  }

  private moveInterior(dx: number, dy: number) {
    this.px = Math.min(ROOM.x + ROOM.w - 40, Math.max(ROOM.x + 40, this.px + dx));
    this.py = Math.min(ROOM.y + ROOM.h - 150, Math.max(ROOM.y + 44, this.py + dy));
  }

  private blocked(x: number, y: number, dx: number, dy: number): boolean {
    for (const b of this.city.buildings) {
      if (b.x - 6 < x && x < b.x + b.width + 6 && b.y - 2 < y && y < b.y + b.height + 6) return true;
    }
    for (const p of this.city.props) {
      if (!p.solid) continue;
      if (Math.abs(p.x - x) < p.width / 2 + 20 && Math.abs(p.y - y) < p.height / 2 + 20) {
        if (p.pushable) {
          const nx = p.x + dx * 0.7;
          const ny = p.y + dy * 0.7;
          if (!this.propOverlaps(nx, ny, p)) {
            p.x = nx;
            p.y = ny;
            const c = this.pushableContainers.get(p);
            c?.setPosition(nx, ny).setDepth(ny);
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  private propOverlaps(x: number, y: number, moving: Prop): boolean {
    if (!(20 < x && x < MAP_WIDTH - 20 && 20 < y && y < MAP_HEIGHT - 20)) return true;
    for (const other of this.city.props) {
      if (other === moving) continue;
      if (
        Math.abs(other.x - x) < (other.width + moving.width) / 2 &&
        Math.abs(other.y - y) < (other.height + moving.height) / 2
      )
        return true;
    }
    return false;
  }

  private updateDepth() {
    this.player.setDepth(this.py + (this.location === "city" ? 0 : 1000));
    const actors = this.location === "city" ? this.cityActors : this.interiorActors;
    actors.forEach((a) => a.container.setDepth(a.ref.y));
  }

  private updateActorTags() {
    const actors = this.location === "city" ? this.cityActors : this.interiorActors;
    actors.forEach((a) => {
      const tag = (a.container as unknown as { nameTag?: Phaser.GameObjects.Text }).nameTag;
      if (!tag) return;
      const d = Math.hypot(this.px - a.ref.x, this.py - a.ref.y);
      tag.setAlpha(d < 150 ? 1 : 0);
    });
  }

  private updateBeacon() {
    const b = this.targetBuilding();
    if (!b) {
      this.beacon.setVisible(false);
      return;
    }
    this.beacon.setVisible(true).setPosition(b.x + b.width / 2, b.y - 10);
  }

  private updatePrompt() {
    const target = this.location === "city" ? this.cityTarget() : this.interiorTarget();
    const prompt = target ? target[2] : "";
    if (prompt !== this.lastPrompt) {
      this.lastPrompt = prompt;
      this.emitHud(prompt);
    }
  }

  // ---------------------------------------------------------------- helpers
  private dist(x: number, y: number): number {
    return Math.hypot(this.px - x, this.py - y);
  }

  private npcVisible(n: NPC): boolean {
    return !(n.protest && this.state.completed_missions.includes(n.protest));
  }

  private hasEv(id: string): boolean {
    return logic.hasEvidence(this.state, id);
  }

  private missionReady(m: Mission): boolean {
    return logic.missionReady(this.state, m);
  }

  private currentRegion(): string {
    for (const r of this.city.regions) {
      if (r.x <= this.px && this.px <= r.x + r.width && r.y <= this.py && this.py <= r.y + r.height)
        return r.label;
    }
    return "AURORA";
  }

  private targetBuilding(): Building | null {
    const m = nextMission(this.state.completed_missions);
    if (!m) return null;
    return this.city.buildings.find((b) => b.key === m.regionKey) ?? null;
  }

  private stars(): number {
    return logic.totalStars(this.state);
  }

  private emitHud(prompt: string) {
    const m = nextMission(this.state.completed_missions);
    gameBus.emit("hud", {
      region: this.location === "city" ? this.currentRegion() : this.interior?.title ?? "",
      stars: this.stars(),
      objective: m ? `Proximo: ${m.title}` : "Todas as missoes concluidas!",
      prompt,
    });
  }

  // ---------------------------------------------------------------- targets
  private cityTarget(): [number, number, string] | null {
    let best: [number, number, string] | null = null;
    let bestD = 1e9;
    for (const b of this.city.buildings) {
      if (!b.key) continue;
      const d = this.dist(b.x + b.width / 2, b.y - 6);
      if (d < 100 && d < bestD) {
        best = [b.x + b.width / 2, b.y, "E entrar"];
        bestD = d;
      }
    }
    for (const n of this.city.npcs) {
      if (!this.npcVisible(n)) continue;
      const d = this.dist(n.x, n.y);
      if (d < 120 && d < bestD) {
        best = [n.x, n.y, "E conversar"];
        bestD = d;
      }
    }
    for (const p of this.city.problems) {
      const d = this.dist(p.x, p.y);
      if (d < 90 && d < bestD) {
        best = [p.x, p.y, "E investigar"];
        bestD = d;
      }
    }
    return best;
  }

  private interiorTarget(): [number, number, string] | null {
    const it = this.interior;
    if (!it) return null;
    let best: [number, number, string] | null = null;
    let bestD = 1e9;
    for (const n of it.npcs) {
      const d = this.dist(n.x, n.y);
      if (d < 130 && d < bestD) {
        best = [n.x, n.y, "E conversar"];
        bestD = d;
      }
    }
    for (const item of it.items) {
      const d = this.dist(item.x, item.y);
      if (d < 90 && d < bestD) {
        best = [item.x, item.y, "E ler"];
        bestD = d;
      }
    }
    const exitD = this.dist(SCREEN_WIDTH / 2, ROOM.y);
    if (exitD < 80 && exitD < bestD) best = [SCREEN_WIDTH / 2, ROOM.y + 30, "E sair"];
    return best;
  }

  // ---------------------------------------------------------------- interact
  private onInteract() {
    if (this.mode === "dialogue") {
      this.advanceDialogue();
      return;
    }
    if (this.mode === "complete") {
      this.setMode("explore");
      this.maybeQueueStageStory();
      return;
    }
    if (this.mode !== "explore") return;
    if (this.location === "city") this.interactCity();
    else this.interactInterior();
  }

  private interactCity() {
    const opts: Array<[number, string, Building | NPC | Problem]> = [];
    for (const b of this.city.buildings) {
      if (b.key && this.dist(b.x + b.width / 2, b.y - 6) < 100)
        opts.push([this.dist(b.x + b.width / 2, b.y - 6), "door", b]);
    }
    for (const n of this.city.npcs) {
      if (this.npcVisible(n) && this.dist(n.x, n.y) < 120) opts.push([this.dist(n.x, n.y), "npc", n]);
    }
    for (const p of this.city.problems) {
      if (this.dist(p.x, p.y) < 90) opts.push([this.dist(p.x, p.y), "problem", p]);
    }
    if (!opts.length) return;
    opts.sort((a, b) => a[0] - b[0]);
    const [, kind, obj] = opts[0];
    if (kind === "door") this.enterInterior((obj as Building).key);
    else if (kind === "npc") this.talkTo(obj as NPC);
    else this.investigate(obj as Problem);
  }

  private interactInterior() {
    const it = this.interior;
    if (!it) return;
    if (this.dist(SCREEN_WIDTH / 2, ROOM.y) < 80) {
      this.exitInterior();
      return;
    }
    const npc = it.npcs
      .filter((n) => this.dist(n.x, n.y) < 130)
      .sort((a, b) => this.dist(a.x, a.y) - this.dist(b.x, b.y))[0];
    if (npc) {
      this.talkTo(npc);
      return;
    }
    const item = it.items
      .filter((i) => this.dist(i.x, i.y) < 90)
      .sort((a, b) => this.dist(a.x, a.y) - this.dist(b.x, b.y))[0];
    if (item) this.readItem(item);
  }

  private readItem(item: InteriorItem) {
    const lines = [item.text];
    if (logic.readLaw(this.state, item.grants)) {
      this.persist();
      lines.push("Prova registrada: documento lido.");
    }
    this.activeMission = null;
    this.beginDialogue(item.name, lines);
  }

  private enterInterior(key: string) {
    const it = this.interiors[key];
    if (!it) return;
    audio.playSfx("confirm");
    this.persist();
    this.cityReturn = [this.px, this.py];
    this.interior = it;
    this.location = key;
    this.vx = this.vy = 0;
    this.px = SCREEN_WIDTH / 2;
    this.py = ROOM.y + 70;
    this.renderInterior(it);
    this.worldLayer.setVisible(false);
    this.interiorLayer.setVisible(true);
    gameBus.emit("interior", it.title);
    this.emitHud("");
  }

  private exitInterior() {
    audio.playSfx("back");
    this.interiorLayer.removeAll(true);
    this.interiorActors = [];
    this.interior = null;
    this.location = "city";
    [this.px, this.py] = this.cityReturn;
    this.vx = this.vy = 0;
    this.worldLayer.setVisible(true);
    this.interiorLayer.setVisible(false);
    this.player.setPosition(this.px, this.py);
    this.cameras.main.centerOn(this.px, this.py);
    this.setMode("explore");
    gameBus.emit("interior", null);
    this.emitHud("");
  }

  private renderInterior(it: Interior) {
    this.interiorLayer.removeAll(true);
    this.interiorActors = [];
    const g = this.add.graphics();
    g.fillStyle(rgb(it.wall), 1);
    g.fillRoundedRect(ROOM.x - 12, ROOM.y - 12, ROOM.w + 24, ROOM.h + 24, 14);
    g.fillStyle(rgb(it.floor), 1);
    g.fillRoundedRect(ROOM.x, ROOM.y, ROOM.w, ROOM.h, 10);
    g.fillStyle(HEX.ink, 1);
    g.fillRoundedRect(SCREEN_WIDTH / 2 - 30, ROOM.y - 12, 60, 16, 6); // porta saida
    this.interiorLayer.add(g);
    const title = this.add
      .text(SCREEN_WIDTH / 2, ROOM.y + 16, it.title, {
        fontFamily: "Sora, sans-serif",
        fontSize: "20px",
        color: "#f5c451",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);
    this.interiorLayer.add(title);

    it.items.forEach((item) => {
      const c = this.add.container(item.x, item.y);
      const ig = this.add.graphics();
      ig.fillStyle(item.kind === "book" ? HEX.gold : HEX.emerald, 1);
      ig.fillRoundedRect(-18, -24, 36, 28, 4);
      c.add(ig);
      const lbl = this.add
        .text(0, 12, item.name, {
          fontFamily: "Inter, sans-serif",
          fontSize: "11px",
          color: "#f4efe3",
          align: "center",
          wordWrap: { width: 120 },
        })
        .setOrigin(0.5, 0);
      c.add(lbl);
      this.interiorLayer.add(c);
    });

    it.npcs.forEach((n) => {
      const c = this.makeActor(n, false);
      c.setPosition(n.x, n.y);
      this.interiorLayer.add(c);
      this.interiorActors.push({ container: c, ref: n });
    });

    // player dentro do interior (reaproveita o mesmo container, reparent)
    this.worldLayer.remove(this.player);
    this.interiorLayer.add(this.player);
    this.player.setPosition(this.px, this.py);
  }

  // ---------------------------------------------------------------- dialogue
  private dialogueLines: string[] = [];
  private dialogueIndex = 0;
  private dialogueSpeaker = "";

  private beginDialogue(speaker: string, lines: string[]) {
    this.dialogueSpeaker = speaker;
    this.dialogueLines = lines;
    this.dialogueIndex = 0;
    this.setMode("dialogue");
    this.emitDialogue();
  }

  private emitDialogue() {
    gameBus.emit("dialogue", {
      speaker: this.dialogueSpeaker,
      line: this.dialogueLines[this.dialogueIndex] ?? "",
      index: this.dialogueIndex,
      count: this.dialogueLines.length,
    });
  }

  private advanceDialogue() {
    if (this.mode !== "dialogue") return;
    this.dialogueIndex += 1;
    if (this.dialogueIndex >= this.dialogueLines.length) {
      gameBus.emit("dialogue", null);
      if (this.activeMission) this.openMission(this.activeMission);
      else this.setMode("explore");
    } else {
      this.emitDialogue();
    }
  }

  private talkTo(npc: NPC | InteriorNPC) {
    const speaker = `${npc.name}  (${npc.role})`;
    this.dialogueSpeaker = speaker;
    if (npc.mission) {
      this.talkMission(npc, speaker);
      return;
    }
    const sq = SIDEQUESTS_BY_GIVER[npc.name];
    if (sq) {
      this.talkSidequestGiver(npc, sq, speaker);
      return;
    }
    const targetSq = this.activeTargetQuest(npc.name);
    if (targetSq) {
      this.talkSidequestTarget(npc, targetSq, speaker);
      return;
    }
    const lines = [npc.greeting];
    if (npc.extraLine) lines.push(npc.extraLine);
    this.activeMission = null;
    this.beginDialogue(speaker, lines);
  }

  private talkMission(npc: NPC | InteriorNPC, speaker: string) {
    const completed = this.state.completed_missions;
    const mission = npc.mission ? MISSIONS_BY_ID[npc.mission] : undefined;
    const upcoming = nextMission(completed);
    if (!mission) {
      this.activeMission = null;
      this.beginDialogue(speaker, [npc.greeting]);
    } else if (completed.includes(mission.id)) {
      this.activeMission = null;
      this.beginDialogue(speaker, [npc.greeting, mission.lesson]);
    } else if (upcoming && mission.id === upcoming.id) {
      if (this.missionReady(mission)) {
        this.activeMission = mission;
        this.beginDialogue(speaker, [...mission.intro]);
      } else {
        this.activeMission = null;
        this.beginDialogue(speaker, [npc.greeting, ...this.evidenceChecklist(mission)]);
      }
    } else {
      this.activeMission = null;
      const hint = upcoming ? upcoming.giver : "o cargo anterior";
      this.beginDialogue(speaker, [npc.greeting, `Antes disso, conclua a missao anterior com ${hint}.`]);
    }
  }

  private evidenceChecklist(mission: Mission): string[] {
    const labels: Record<string, string> = {
      problema: "Investigar o problema no mapa",
      testemunho: "Ouvir os moradores (side quest)",
      lei: "Ler a lei relacionada (dentro do predio)",
    };
    const lines = ["Antes de decidir, reuna as provas do caso:"];
    for (const eid of mission.evidence) {
      const key = eid.split(":", 2)[1];
      const mark = this.hasEv(eid) ? "[X]" : "[  ]";
      lines.push(`${mark} ${labels[key] ?? key}`);
    }
    return lines;
  }

  private activeTargetQuest(name: string): SideQuest | null {
    return logic.activeTargetQuest(this.state, name);
  }

  private talkSidequestGiver(npc: NPC | InteriorNPC, sq: SideQuest, speaker: string) {
    this.activeMission = null;
    const r = logic.sidequestGiver(this.state, sq);
    this.persist();
    if (r.started) {
      this.beginDialogue(speaker, [npc.greeting, sq.intro, "Objetivo: " + sq.objective]);
    } else if (r.done) {
      this.beginDialogue(speaker, [sq.doneLine]);
    } else {
      this.beginDialogue(speaker, [
        sq.intro,
        "Ainda falta ouvir: " + (r.remaining.length ? r.remaining.join(", ") : "ninguem"),
      ]);
    }
  }

  private talkSidequestTarget(npc: NPC | InteriorNPC, sq: SideQuest, speaker: string) {
    this.activeMission = null;
    const r = logic.sidequestTalkTarget(this.state, sq, npc.name);
    if (r.starGained) audio.playSfx("success");
    this.persist();
    this.beginDialogue(speaker, r.lines);
  }

  private investigate(problem: Problem) {
    this.activeMission = null;
    const r = logic.investigate(this.state, problem);
    if (r.granted) this.persist();
    this.beginDialogue(problem.title, r.lines);
  }

  // ---------------------------------------------------------------- mission
  private openMission(mission: Mission) {
    this.setMode("mission");
    gameBus.emit("mission", this.missionPayload(mission));
  }

  private missionPayload(mission: Mission, feedback?: string): MissionPayload {
    const labels: Record<string, string> = {
      problema: "Problema investigado",
      testemunho: "Testemunho ouvido",
      lei: "Lei consultada",
    };
    return {
      missionId: mission.id,
      title: mission.title,
      question: mission.question,
      options: mission.options.map((o) => ({ letter: o.letter, text: o.text })),
      checklist: mission.evidence.map((eid) => ({
        label: labels[eid.split(":", 2)[1]] ?? eid,
        done: this.hasEv(eid),
      })),
      ready: this.missionReady(mission),
      feedback,
    };
  }

  private answer(letter: string) {
    const mission = this.activeMission;
    if (!mission) return;
    if (!mission.options.some((o) => o.letter === letter)) return;
    if (logic.answerCorrect(mission, letter)) {
      audio.playSfx("success");
      this.registerMission(mission);
      this.refreshProblemMarkers();
      this.refreshCityActors();
      gameBus.emit("mission", null);
      this.setMode("story");
      gameBus.emit("story", { title: mission.title, body: mission.success, isFinal: false });
    } else {
      audio.playSfx("error");
      gameBus.emit(
        "mission",
        this.missionPayload(mission, "Ainda nao. Pense no nivel de governo responsavel e tente novamente."),
      );
    }
  }

  private registerMission(mission: Mission) {
    logic.registerMission(this.state, mission);
    this.persist();
  }

  private refreshCityActors() {
    // remove manifestantes de missoes concluidas
    this.cityActors = this.cityActors.filter((a) => {
      const n = a.ref as NPC;
      if (n.protest && this.state.completed_missions.includes(n.protest)) {
        a.container.destroy();
        return false;
      }
      return true;
    });
  }

  // ---------------------------------------------------------------- story
  private storyIsFinal = false;
  private storyQueue: string[] = [];

  private queueStory(stage: string) {
    if (this.shownStages.has(stage)) return;
    const body = STORY_TEXT[stage] ?? "";
    if (!body) return;
    this.shownStages.add(stage);
    this.storyQueue.push(stage);
    if (this.mode !== "story") this.showNextStory();
  }

  private showNextStory() {
    const stage = this.storyQueue.shift();
    if (!stage) {
      if (this.storyIsFinal) {
        this.persist();
        gameBus.emit("victory", this.stars());
      } else {
        this.setMode("explore");
        this.maybeQueueStageStory();
      }
      return;
    }
    this.storyIsFinal = stage === "final";
    this.setMode("story");
    gameBus.emit("story", { title: stageTitle(stage), body: STORY_TEXT[stage] ?? "", isFinal: this.storyIsFinal });
  }

  private maybeQueueStageStory() {
    const m = nextMission(this.state.completed_missions);
    if (!m) {
      this.queueStory("final");
      return;
    }
    if (!this.shownStages.has(m.stage)) this.queueStory(m.stage);
  }

  private advanceStory() {
    gameBus.emit("story", null);
    this.showNextStory();
  }

  // ---------------------------------------------------------------- misc
  private onEscape() {
    if (["dialogue", "mission", "complete", "story"].includes(this.mode)) {
      gameBus.emit("dialogue", null);
      gameBus.emit("mission", null);
      gameBus.emit("story", null);
      this.setMode("explore");
    } else if (this.location !== "city") {
      this.exitInterior();
    } else {
      this.persist();
      uiBus.emit("requestPause");
    }
  }

  private setMode(mode: typeof this.mode) {
    this.mode = mode;
    gameBus.emit("mode", mode);
  }

  private persist() {
    if (this.location === "city") {
      this.state.position = { x: this.px, y: this.py };
      this.state.region = this.currentRegion().toLowerCase().replace(/ /g, "_");
    }
    saveSlot(this.slot, this.state);
  }
}

function rgb(c: [number, number, number]): number {
  return (c[0] << 16) | (c[1] << 8) | c[2];
}

const STORY_TEXT = STORY;
function stageTitle(stage: string): string {
  const map: Record<string, string> = {
    abertura: "Aurora do Brasil",
    municipio: "Etapa 1 · O Municipio",
    estado: "Etapa 2 · O Estado",
    uniao: "Etapa 3 · A Uniao",
    final: "Encerramento",
  };
  return map[stage] ?? "Aurora";
}
