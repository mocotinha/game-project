// Geometria da cidade, portada de src/world/__init__.py build_city().
// Coordenadas mantidas 1:1 (mundo 3200x2400, Y para baixo como no Phaser).

import { PROBLEMS, type Problem } from "../content/problems";

export const WHITE: [number, number, number] = [255, 255, 255];
export const BUILDING_FOOT_H = 46;

export interface Building {
  x: number;
  y: number;
  width: number;
  height: number;
  frontColor: [number, number, number];
  sideColor: [number, number, number];
  title: string;
  subtitle: string;
  key: string;
}

export interface NPC {
  name: string;
  role: string;
  x: number;
  y: number;
  kit: string;
  greeting: string;
  mission?: string;
  extraLine: string;
  tint: [number, number, number];
  protest: string;
}

export interface Prop {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: string;
  solid: boolean;
  pushable: boolean;
  flip: boolean;
}

export interface Region {
  key: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  floor: [number, number, number];
}

export interface Crosswalk {
  x: number;
  y: number;
  horizontal: boolean;
}

export interface City {
  buildings: Building[];
  npcs: NPC[];
  props: Prop[];
  regions: Region[];
  crosswalks: Crosswalk[];
  problems: Problem[];
}

function npc(
  name: string,
  role: string,
  x: number,
  y: number,
  kit: string,
  greeting: string,
  opts: Partial<Pick<NPC, "mission" | "extraLine" | "tint" | "protest">> = {},
): NPC {
  return {
    name,
    role,
    x,
    y,
    kit,
    greeting,
    mission: opts.mission,
    extraLine: opts.extraLine ?? "",
    tint: opts.tint ?? WHITE,
    protest: opts.protest ?? "",
  };
}

function prop(
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  kind: string,
  opts: Partial<Pick<Prop, "solid" | "pushable" | "flip">> = {},
): Prop {
  return {
    name,
    x,
    y,
    width,
    height,
    kind,
    solid: opts.solid ?? true,
    pushable: opts.pushable ?? false,
    flip: opts.flip ?? false,
  };
}

function crosswalks(): Crosswalk[] {
  const walks: Crosswalk[] = [];
  for (const vx of [660, 1480, 2360]) {
    for (const hy of [900, 1560]) {
      walks.push({ x: vx + 40, y: hy - 40, horizontal: true });
      walks.push({ x: vx + 40, y: hy + 120, horizontal: true });
      walks.push({ x: vx - 40, y: hy + 40, horizontal: false });
      walks.push({ x: vx + 120, y: hy + 40, horizontal: false });
    }
  }
  return walks;
}

// Manifestacoes: chave do predio -> [missao, palavra de ordem, cor].
const PROTESTS: Record<string, [string, string, [number, number, number]]> = {
  camara: ["saude_bairro", "Saude no bairro ja!", [255, 214, 180]],
  prefeitura: ["orcamento_cidade", "Praca digna e orcamento claro!", [200, 230, 255]],
  assembleia: ["hospital_regional", "Hospital regional para todos!", [255, 210, 230]],
  governo: ["rodovia_estadual", "Estrada segura ja!", [210, 230, 200]],
  congresso: ["lei_federal", "Lei justa para o pais!", [235, 225, 190]],
  planalto: ["politica_nacional", "Programa nacional na pratica!", [215, 220, 255]],
};
const PROTEST_OFFSETS: [number, number][] = [
  [-74, -44],
  [70, -50],
  [-28, -88],
  [44, -92],
  [8, -60],
];

function protesters(buildings: Building[]): NPC[] {
  const byKey = new Map(buildings.map((b) => [b.key, b]));
  const out: NPC[] = [];
  for (const [key, [missionId, chant, tint]] of Object.entries(PROTESTS)) {
    const b = byKey.get(key);
    if (!b) continue;
    const doorX = b.x + b.width / 2;
    PROTEST_OFFSETS.forEach(([ox, oy], i) => {
      out.push(
        npc(`Manifestante ${key} ${i + 1}`, "Manifestante", doorX + ox, b.y + oy, "male_person", chant, {
          extraLine: "A populacao cobra quem tem o poder de decidir.",
          protest: missionId,
          tint,
        }),
      );
    });
  }
  return out;
}

function streetDecor(): Prop[] {
  const decor: Prop[] = [];
  const add = (
    kind: string,
    x: number,
    y: number,
    w = 30,
    h = 40,
    solid = false,
    flip = false,
  ) => decor.push(prop(kind, x, y, w, h, kind, { solid, flip }));

  for (const x of [660, 1480, 2360]) {
    for (const y of [900, 1560]) add("trafficlight", x - 6, y + 96, 20, 54, true);
  }

  const lamps: [number, number][] = [
    [628, 1120], [628, 1380], [1448, 1120], [1572, 1360],
    [2328, 1120], [2452, 1360], [900, 1636], [1900, 876], [1500, 1636],
  ];
  for (const [x, y] of lamps) add("streetlamp", x, y, 16, 54, true);

  const cars: [string, number, number, boolean][] = [
    ["car_sedan", 780, 936, false], ["car_taxi", 1120, 944, true],
    ["car_bus", 1740, 936, false], ["car_suv", 2200, 944, true],
    ["car_police", 560, 1596, true], ["car_van", 1050, 1604, false],
    ["car_sports", 1800, 1596, true], ["car_truck", 2360, 1604, false],
    ["car_amb", 520, 1010, false], ["car_suv", 1420, 1010, true],
  ];
  for (const [kind, x, y, flip] of cars) add(kind, x, y, 70, 32, true, flip);

  for (const [x, y] of [[742, 1000], [1560, 980], [2380, 1010]] as [number, number][])
    add("trashcan", x, y, 18, 24);
  add("mailbox", 980, 1120, 18, 30);
  add("mailbox", 1420, 1120, 18, 30);
  for (const [x, y] of [[560, 1060], [1600, 645]] as [number, number][])
    add("barrel", x, y, 18, 24);
  const stalls: [string, number, number][] = [
    ["stall_green", 500, 1120], ["stall_orange", 840, 1080],
    ["stall_green", 1120, 1240], ["stall_orange", 1360, 1080],
  ];
  for (const [kind, x, y] of stalls) add(kind, x, y, 44, 40);

  return decor;
}

export function buildCity(): City {
  const regions: Region[] = [
    { key: "praca_central", label: "PRACA CENTRAL", x: 360, y: 980, width: 620, height: 520, floor: [58, 112, 96] },
    { key: "praca_cidadania", label: "PRACA DA CIDADANIA", x: 1010, y: 980, width: 420, height: 360, floor: [54, 118, 92] },
    { key: "camara", label: "CAMARA MUNICIPAL", x: 200, y: 1560, width: 520, height: 460, floor: [70, 104, 92] },
    { key: "prefeitura", label: "PREFEITURA", x: 820, y: 1560, width: 540, height: 460, floor: [96, 92, 74] },
    { key: "bairro_saude", label: "BAIRRO DA SAUDE", x: 1520, y: 960, width: 520, height: 520, floor: [74, 108, 104] },
    { key: "assembleia", label: "ASSEMBLEIA ESTADUAL", x: 1820, y: 1600, width: 520, height: 460, floor: [90, 84, 108] },
    { key: "governo", label: "PALACIO DO GOVERNO", x: 2480, y: 1500, width: 560, height: 520, floor: [86, 90, 112] },
    { key: "congresso", label: "CONGRESSO NACIONAL", x: 2300, y: 460, width: 620, height: 520, floor: [104, 96, 74] },
    { key: "planalto", label: "PALACIO DO PLANALTO", x: 2820, y: 1000, width: 340, height: 420, floor: [96, 100, 120] },
    { key: "parque", label: "PARQUE MUNICIPAL", x: 1120, y: 320, width: 640, height: 520, floor: [52, 126, 82] },
  ];

  const buildings: Building[] = [
    { x: 300, y: 1720, width: 300, height: 150, frontColor: [202, 174, 122], sideColor: [140, 113, 78], title: "CAMARA MUNICIPAL", subtitle: "leis locais e fiscalizacao", key: "camara" },
    { x: 950, y: 1720, width: 320, height: 150, frontColor: [181, 132, 102], sideColor: [122, 83, 73], title: "PREFEITURA", subtitle: "servicos da cidade", key: "prefeitura" },
    { x: 1640, y: 1120, width: 300, height: 150, frontColor: [150, 190, 170], sideColor: [100, 132, 118], title: "UNIDADE DE SAUDE", subtitle: "atendimento a populacao", key: "saude" },
    { x: 1940, y: 1760, width: 320, height: 150, frontColor: [196, 160, 190], sideColor: [134, 108, 132], title: "ASSEMBLEIA", subtitle: "deputados estaduais", key: "assembleia" },
    { x: 2620, y: 1680, width: 340, height: 150, frontColor: [162, 168, 205], sideColor: [108, 114, 146], title: "PALACIO DO GOVERNO", subtitle: "executivo estadual", key: "governo" },
    { x: 2420, y: 620, width: 360, height: 160, frontColor: [206, 190, 130], sideColor: [140, 128, 86], title: "CONGRESSO", subtitle: "camara e senado", key: "congresso" },
    { x: 2880, y: 1120, width: 260, height: 150, frontColor: [170, 178, 210], sideColor: [114, 122, 150], title: "PLANALTO", subtitle: "executivo federal", key: "planalto" },
  ];

  const npcs: NPC[] = [
    npc("Dona Alzira", "Moradora", 720, 1180, "female_adventurer", "Participar e cobrar tambem e fazer politica, minha filha.", { extraLine: "Entre nos predios e converse com quem ocupa cada cargo.", tint: [255, 214, 196] }),
    npc("Guarda Souza", "Guarda Municipal", 470, 1685, "male_adventurer", "Fico de olho na Camara. A seguranca publica tambem e um servico.", { extraLine: "A guarda municipal apoia a ordem e protege bens publicos.", tint: [150, 180, 255] }),
    npc("Guarda Teles", "Seguranca", 2980, 1085, "male_adventurer", "Aqui e o Planalto. Mantemos o local seguro e organizado.", { extraLine: "Cada nivel de governo tem sua propria estrutura de seguranca.", tint: [120, 150, 230] }),
    npc("Gari Rita", "Gari", 700, 920, "female_person", "Mantenho as ruas limpas. Cidade limpa depende de todos.", { extraLine: "A limpeza urbana e um servico publico municipal.", tint: [255, 176, 90] }),
    npc("Gari Bento", "Gari", 1520, 940, "male_person", "Coleta e limpeza sao servicos essenciais do dia a dia.", { extraLine: "Servicos urbanos precisam de orcamento e planejamento.", tint: [255, 150, 70] }),
    npc("Professora Ines", "Professora", 560, 1320, "female_adventurer", "Educacao politica comeca cedo: entender quem decide o que.", { extraLine: "Escolas municipais sao responsabilidade da prefeitura.", tint: [150, 220, 210] }),
    npc("Feirante Nilo", "Feirante", 900, 1120, "male_person", "Toco minha banca na praca. Comercio move a cidade.", { extraLine: "A prefeitura organiza feiras e o uso dos espacos publicos.", tint: [180, 235, 150] }),
    npc("Vovo Alberto", "Aposentado", 1180, 1120, "male_adventurer", "Gosto de sentar na praca e ver a cidade funcionar.", { extraLine: "Espacos publicos sao de todos e precisam de cuidado.", tint: [210, 210, 210] }),
    npc("Corredora Bia", "Visitante", 1300, 560, "female_person", "Corro no parque toda manha. Area verde tambem e politica publica.", { extraLine: "Parques exigem manutencao e planejamento urbano.", tint: [255, 200, 230] }),
    npc("Seu Jonas", "Jardineiro", 1560, 620, "male_adventurer", "Cuido das plantas do parque. Cada arvore precisa de cuidado.", { extraLine: "Servidores mantem os espacos publicos vivos.", tint: [160, 220, 150] }),
    npc("Dona Vera", "Moradora", 1990, 1675, "female_person", "Aqui chega gente de muitas cidades vizinhas em busca de atendimento.", { extraLine: "Alguns problemas sao grandes demais para um municipio so.", tint: [255, 220, 210] }),
    npc("Seu Otavio", "Visitante", 2150, 1690, "male_adventurer", "Vim de uma cidade vizinha; por aqui a gente se encontra bastante.", { tint: [210, 220, 240] }),
    npc("Jovem Rui", "Estudante", 2070, 1640, "male_person", "Estudo como o estado coordena servicos entre varias cidades.", { tint: [200, 235, 220] }),
    npc("Caminhoneiro Zeca", "Caminhoneiro", 2400, 1240, "male_adventurer", "Rodo o estado inteiro por essas estradas. Uma interdicao atrapalha todo mundo.", { tint: [235, 210, 180] }),
    npc("Motorista Cida", "Motorista", 2520, 1620, "female_adventurer", "Dirijo entre cidades todo dia; a estrada faz diferenca no meu trabalho.", { tint: [255, 215, 235] }),
    npc("Feirante Tino", "Feirante", 2700, 1620, "male_person", "Levo mercadoria de uma cidade a outra. Estrada ruim e prejuizo.", { tint: [200, 235, 160] }),
    npc("Estudante Bruno", "Estudante", 2500, 560, "male_person", "Estou aprendendo como nascem as leis que valem para o pais todo.", { tint: [210, 225, 255] }),
    npc("Professor Nabuco", "Professor", 2680, 560, "male_adventurer", "Certos direitos precisam ser iguais em todo o territorio nacional.", { tint: [225, 220, 200] }),
    npc("Ativista Rosa", "Ativista", 2500, 860, "female_adventurer", "Recolhemos assinaturas pelo pais por uma nova lei federal.", { tint: [255, 205, 225] }),
    npc("Servidora Dinah", "Servidora", 2900, 1080, "female_person", "Acompanho programas federais que precisam chegar a toda a populacao.", { tint: [220, 230, 255] }),
    npc("Analista Ivo", "Analista", 3060, 1080, "male_person", "Analiso se as politicas saem do papel respeitando a lei e o orcamento.", { tint: [205, 215, 245] }),
    npc("Cidada Marli", "Cidada", 2960, 1340, "female_person", "Quero ver os programas nacionais funcionando na ponta.", { tint: [255, 225, 210] }),
  ];

  const props: Prop[] = [
    prop("Fonte da praca", 620, 1240, 90, 40, "fountain"),
    prop("Banco", 470, 1160, 70, 24, "bench"),
    prop("Banco", 780, 1160, 70, 24, "bench"),
    prop("Caixa da feira", 560, 1060, 44, 40, "crate", { pushable: true }),
    prop("Lampiao", 360, 1300, 18, 60, "lamp"),
    prop("Lampiao", 900, 1300, 18, 60, "lamp"),
    prop("Arvore", 430, 1420, 44, 70, "tree"),
    prop("Arvore", 860, 1420, 44, 70, "tree"),
    prop("Arbusto", 640, 1140, 30, 30, "bush", { solid: false }),
    prop("Fonte", 1210, 1160, 80, 36, "fountain"),
    prop("Banco", 1090, 1080, 70, 24, "bench"),
    prop("Banco", 1330, 1080, 70, 24, "bench"),
    prop("Lampiao", 1050, 1240, 18, 60, "lamp"),
    prop("Lampiao", 1380, 1240, 18, 60, "lamp"),
    prop("Arvore", 1120, 1280, 44, 70, "tree"),
    prop("Arvore", 1320, 1280, 44, 70, "tree"),
    prop("Arvore da saude", 1560, 980, 44, 70, "tree"),
    prop("Arvore", 1180, 420, 44, 70, "tree"),
    prop("Arvore", 1620, 440, 44, 70, "tree"),
    prop("Arvore", 1220, 720, 44, 70, "tree"),
    prop("Arvore", 1640, 720, 44, 70, "tree"),
    prop("Arvore", 1400, 560, 44, 70, "tree"),
    prop("Banco", 1300, 640, 70, 24, "bench"),
    prop("Banco", 1520, 640, 70, 24, "bench"),
    prop("Lampiao", 1160, 640, 18, 60, "lamp"),
    prop("Arvore do congresso", 2360, 460, 44, 70, "tree"),
  ];

  const allProps = props.concat(streetDecor());
  const allNpcs = npcs.concat(protesters(buildings));
  return {
    buildings,
    npcs: allNpcs,
    props: allProps,
    regions,
    crosswalks: crosswalks(),
    problems: [...PROBLEMS],
  };
}

// Vias (portado de world.py: ROAD_X, ROAD_Y, ROAD_W, TILE).
export const ROAD_X = [660, 1480, 2360];
export const ROAD_Y = [900, 1560];
export const ROAD_W = 80;
export const TILE = 48;

export type GroundKind =
  | "grass"
  | "road"
  | "plaza"
  | "sidewalk"
  | "crosswalk_h"
  | "crosswalk_v";

// Portado de world.py _ground_kind(cx, cy).
export function groundKind(cx: number, cy: number, city: City): GroundKind {
  const onV = ROAD_X.some((vx) => vx <= cx && cx <= vx + ROAD_W);
  const onH = ROAD_Y.some((hy) => hy <= cy && cy <= hy + ROAD_W);
  if (onV) {
    for (const hy of ROAD_Y) {
      if ((hy + ROAD_W < cy && cy <= hy + ROAD_W + TILE) || (hy - TILE <= cy && cy < hy))
        return "crosswalk_h";
    }
  }
  if (onH) {
    for (const vx of ROAD_X) {
      if ((vx + ROAD_W < cx && cx <= vx + ROAD_W + TILE) || (vx - TILE <= cx && cx < vx))
        return "crosswalk_v";
    }
  }
  if (onV || onH) return "road";
  const margin = 40;
  if (
    ROAD_X.some((vx) => vx - margin <= cx && cx <= vx + ROAD_W + margin) ||
    ROAD_Y.some((hy) => hy - margin <= cy && cy <= hy + ROAD_W + margin)
  )
    return "sidewalk";
  for (const b of city.buildings) {
    if (b.x - 32 <= cx && cx <= b.x + b.width + 32 && b.y - 32 <= cy && cy <= b.y + b.height + 32)
      return "sidewalk";
  }
  for (const region of city.regions) {
    if (
      region.key.startsWith("praca") &&
      region.x <= cx &&
      cx <= region.x + region.width &&
      region.y <= cy &&
      cy <= region.y + region.height
    )
      return "plaza";
  }
  return "grass";
}
