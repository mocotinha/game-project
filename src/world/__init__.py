from __future__ import annotations

from dataclasses import dataclass, field

from src.content.problems import PROBLEMS, Problem

BUILDING_FOOT_H = 46  # altura da base solida do predio (o resto e apenas visual)

WHITE = (255, 255, 255)


@dataclass
class Building:
    x: float
    y: float
    width: float
    height: float
    front_color: tuple[int, int, int]
    side_color: tuple[int, int, int]
    title: str
    subtitle: str
    key: str = ""  # se preenchido, o predio pode ser visitado

    @property
    def door_x(self) -> float:
        return self.x + self.width / 2

    @property
    def door_y(self) -> float:
        return self.y - 6

    @property
    def foot_h(self) -> float:
        return BUILDING_FOOT_H


@dataclass
class NPC:
    name: str
    role: str
    x: float
    y: float
    kit: str
    greeting: str
    mission: str | None = None
    extra_line: str = ""
    tint: tuple[int, int, int] = WHITE
    protest: str = ""  # se preenchido, e manifestante da missao (some quando concluida)


@dataclass
class Prop:
    name: str
    x: float
    y: float
    width: float
    height: float
    kind: str
    solid: bool = True
    pushable: bool = False
    flip: bool = False


@dataclass
class Region:
    key: str
    label: str
    x: float
    y: float
    width: float
    height: float
    floor: tuple[int, int, int]


@dataclass
class Crosswalk:
    x: float
    y: float
    horizontal: bool


@dataclass
class City:
    buildings: list[Building] = field(default_factory=list)
    npcs: list[NPC] = field(default_factory=list)
    props: list[Prop] = field(default_factory=list)
    regions: list[Region] = field(default_factory=list)
    crosswalks: list[Crosswalk] = field(default_factory=list)
    problems: list[Problem] = field(default_factory=list)


def _crosswalks() -> list[Crosswalk]:
    walks: list[Crosswalk] = []
    for vx in (660, 1480, 2360):
        for hy in (900, 1560):
            walks.append(Crosswalk(vx + 40, hy - 40, horizontal=True))
            walks.append(Crosswalk(vx + 40, hy + 120, horizontal=True))
            walks.append(Crosswalk(vx - 40, hy + 40, horizontal=False))
            walks.append(Crosswalk(vx + 120, hy + 40, horizontal=False))
    return walks


def build_city() -> City:
    regions = [
        Region("praca_central", "PRACA CENTRAL", 360, 980, 620, 520, (58, 112, 96)),
        Region("praca_cidadania", "PRACA DA CIDADANIA", 1010, 980, 420, 360, (54, 118, 92)),
        Region("camara", "CAMARA MUNICIPAL", 200, 1560, 520, 460, (70, 104, 92)),
        Region("prefeitura", "PREFEITURA", 820, 1560, 540, 460, (96, 92, 74)),
        Region("bairro_saude", "BAIRRO DA SAUDE", 1520, 960, 520, 520, (74, 108, 104)),
        Region("assembleia", "ASSEMBLEIA ESTADUAL", 1820, 1600, 520, 460, (90, 84, 108)),
        Region("governo", "PALACIO DO GOVERNO", 2480, 1500, 560, 520, (86, 90, 112)),
        Region("congresso", "CONGRESSO NACIONAL", 2300, 460, 620, 520, (104, 96, 74)),
        Region("planalto", "PALACIO DO PLANALTO", 2820, 1000, 340, 420, (96, 100, 120)),
        Region("parque", "PARQUE MUNICIPAL", 1120, 320, 640, 520, (52, 126, 82)),
    ]

    buildings = [
        Building(300, 1720, 300, 150, (202, 174, 122), (140, 113, 78), "CAMARA MUNICIPAL", "leis locais e fiscalizacao", key="camara"),
        Building(950, 1720, 320, 150, (181, 132, 102), (122, 83, 73), "PREFEITURA", "servicos da cidade", key="prefeitura"),
        Building(1640, 1120, 300, 150, (150, 190, 170), (100, 132, 118), "UNIDADE DE SAUDE", "atendimento a populacao", key="saude"),
        Building(1940, 1760, 320, 150, (196, 160, 190), (134, 108, 132), "ASSEMBLEIA", "deputados estaduais", key="assembleia"),
        Building(2620, 1680, 340, 150, (162, 168, 205), (108, 114, 146), "PALACIO DO GOVERNO", "executivo estadual", key="governo"),
        Building(2420, 620, 360, 160, (206, 190, 130), (140, 128, 86), "CONGRESSO", "camara e senado", key="congresso"),
        Building(2880, 1120, 260, 150, (170, 178, 210), (114, 122, 150), "PLANALTO", "executivo federal", key="planalto"),
    ]

    npcs = [
        NPC("Dona Alzira", "Moradora", 720, 1180, "female_adventurer",
            "Participar e cobrar tambem e fazer politica, minha filha.",
            extra_line="Entre nos predios e converse com quem ocupa cada cargo.", tint=(255, 214, 196)),
        NPC("Guarda Souza", "Guarda Municipal", 470, 1685, "male_adventurer",
            "Fico de olho na Camara. A seguranca publica tambem e um servico.",
            extra_line="A guarda municipal apoia a ordem e protege bens publicos.", tint=(150, 180, 255)),
        NPC("Guarda Teles", "Seguranca", 2980, 1085, "male_adventurer",
            "Aqui e o Planalto. Mantemos o local seguro e organizado.",
            extra_line="Cada nivel de governo tem sua propria estrutura de seguranca.", tint=(120, 150, 230)),
        NPC("Gari Rita", "Gari", 700, 920, "female_person",
            "Mantenho as ruas limpas. Cidade limpa depende de todos.",
            extra_line="A limpeza urbana e um servico publico municipal.", tint=(255, 176, 90)),
        NPC("Gari Bento", "Gari", 1520, 940, "male_person",
            "Coleta e limpeza sao servicos essenciais do dia a dia.",
            extra_line="Servicos urbanos precisam de orcamento e planejamento.", tint=(255, 150, 70)),
        NPC("Professora Ines", "Professora", 560, 1320, "female_adventurer",
            "Educacao politica comeca cedo: entender quem decide o que.",
            extra_line="Escolas municipais sao responsabilidade da prefeitura.", tint=(150, 220, 210)),
        NPC("Feirante Nilo", "Feirante", 900, 1120, "male_person",
            "Toco minha banca na praca. Comercio move a cidade.",
            extra_line="A prefeitura organiza feiras e o uso dos espacos publicos.", tint=(180, 235, 150)),
        NPC("Vovo Alberto", "Aposentado", 1180, 1120, "male_adventurer",
            "Gosto de sentar na praca e ver a cidade funcionar.",
            extra_line="Espacos publicos sao de todos e precisam de cuidado.", tint=(210, 210, 210)),
        # Visitantes do parque
        NPC("Corredora Bia", "Visitante", 1300, 560, "female_person",
            "Corro no parque toda manha. Area verde tambem e politica publica.",
            extra_line="Parques exigem manutencao e planejamento urbano.", tint=(255, 200, 230)),
        NPC("Seu Jonas", "Jardineiro", 1560, 620, "male_adventurer",
            "Cuido das plantas do parque. Cada arvore precisa de cuidado.",
            extra_line="Servidores mantem os espacos publicos vivos.", tint=(160, 220, 150)),
        # --- Regiao estadual (Assembleia / Governo) ---
        NPC("Dona Vera", "Moradora", 1990, 1675, "female_person",
            "Aqui chega gente de muitas cidades vizinhas em busca de atendimento.",
            extra_line="Alguns problemas sao grandes demais para um municipio so.", tint=(255, 220, 210)),
        NPC("Seu Otavio", "Visitante", 2150, 1690, "male_adventurer",
            "Vim de uma cidade vizinha; por aqui a gente se encontra bastante.", tint=(210, 220, 240)),
        NPC("Jovem Rui", "Estudante", 2070, 1640, "male_person",
            "Estudo como o estado coordena servicos entre varias cidades.", tint=(200, 235, 220)),
        NPC("Caminhoneiro Zeca", "Caminhoneiro", 2400, 1240, "male_adventurer",
            "Rodo o estado inteiro por essas estradas. Uma interdicao atrapalha todo mundo.", tint=(235, 210, 180)),
        NPC("Motorista Cida", "Motorista", 2520, 1620, "female_adventurer",
            "Dirijo entre cidades todo dia; a estrada faz diferenca no meu trabalho.", tint=(255, 215, 235)),
        NPC("Feirante Tino", "Feirante", 2700, 1620, "male_person",
            "Levo mercadoria de uma cidade a outra. Estrada ruim e prejuizo.", tint=(200, 235, 160)),
        # --- Regiao federal (Congresso / Planalto) ---
        NPC("Estudante Bruno", "Estudante", 2500, 560, "male_person",
            "Estou aprendendo como nascem as leis que valem para o pais todo.", tint=(210, 225, 255)),
        NPC("Professor Nabuco", "Professor", 2680, 560, "male_adventurer",
            "Certos direitos precisam ser iguais em todo o territorio nacional.", tint=(225, 220, 200)),
        NPC("Ativista Rosa", "Ativista", 2500, 860, "female_adventurer",
            "Recolhemos assinaturas pelo pais por uma nova lei federal.", tint=(255, 205, 225)),
        NPC("Servidora Dinah", "Servidora", 2900, 1080, "female_person",
            "Acompanho programas federais que precisam chegar a toda a populacao.", tint=(220, 230, 255)),
        NPC("Analista Ivo", "Analista", 3060, 1080, "male_person",
            "Analiso se as politicas saem do papel respeitando a lei e o orcamento.", tint=(205, 215, 245)),
        NPC("Cidada Marli", "Cidada", 2960, 1340, "female_person",
            "Quero ver os programas nacionais funcionando na ponta.", tint=(255, 225, 210)),
    ]

    props = [
        # Praca Central
        Prop("Fonte da praca", 620, 1240, 90, 40, "fountain"),
        Prop("Banco", 470, 1160, 70, 24, "bench"),
        Prop("Banco", 780, 1160, 70, 24, "bench"),
        Prop("Caixa da feira", 560, 1060, 44, 40, "crate", pushable=True),
        Prop("Lampiao", 360, 1300, 18, 60, "lamp"),
        Prop("Lampiao", 900, 1300, 18, 60, "lamp"),
        Prop("Arvore", 430, 1420, 44, 70, "tree"),
        Prop("Arvore", 860, 1420, 44, 70, "tree"),
        Prop("Arbusto", 640, 1140, 30, 30, "bush", solid=False),
        # Praca da Cidadania
        Prop("Fonte", 1210, 1160, 80, 36, "fountain"),
        Prop("Banco", 1090, 1080, 70, 24, "bench"),
        Prop("Banco", 1330, 1080, 70, 24, "bench"),
        Prop("Lampiao", 1050, 1240, 18, 60, "lamp"),
        Prop("Lampiao", 1380, 1240, 18, 60, "lamp"),
        Prop("Arvore", 1120, 1280, 44, 70, "tree"),
        Prop("Arvore", 1320, 1280, 44, 70, "tree"),
        # Bairro da saude
        Prop("Arvore da saude", 1560, 980, 44, 70, "tree"),
        # Parque (sem predio): arvores e bancos
        Prop("Arvore", 1180, 420, 44, 70, "tree"),
        Prop("Arvore", 1620, 440, 44, 70, "tree"),
        Prop("Arvore", 1220, 720, 44, 70, "tree"),
        Prop("Arvore", 1640, 720, 44, 70, "tree"),
        Prop("Arvore", 1400, 560, 44, 70, "tree"),
        Prop("Banco", 1300, 640, 70, 24, "bench"),
        Prop("Banco", 1520, 640, 70, 24, "bench"),
        Prop("Lampiao", 1160, 640, 18, 60, "lamp"),
        # Congresso
        Prop("Arvore do congresso", 2360, 460, 44, 70, "tree"),
    ]

    props += _street_decor()
    npcs += _protesters(buildings)
    return City(buildings=buildings, npcs=npcs, props=props, regions=regions, crosswalks=_crosswalks(), problems=list(PROBLEMS))


# Manifestacoes: por chave do predio -> (missao, palavra de ordem, cor).
_PROTESTS = {
    "camara": ("saude_bairro", "Saude no bairro ja!", (255, 214, 180)),
    "prefeitura": ("orcamento_cidade", "Praca digna e orcamento claro!", (200, 230, 255)),
    "assembleia": ("hospital_regional", "Hospital regional para todos!", (255, 210, 230)),
    "governo": ("rodovia_estadual", "Estrada segura ja!", (210, 230, 200)),
    "congresso": ("lei_federal", "Lei justa para o pais!", (235, 225, 190)),
    "planalto": ("politica_nacional", "Programa nacional na pratica!", (215, 220, 255)),
}
_PROTEST_OFFSETS = [(-74, -44), (70, -50), (-28, -88), (44, -92), (8, -60)]


def _protesters(buildings: list[Building]) -> list[NPC]:
    by_key = {b.key: b for b in buildings}
    out: list[NPC] = []
    for key, (mission_id, chant, tint) in _PROTESTS.items():
        b = by_key.get(key)
        if b is None:
            continue
        for i, (ox, oy) in enumerate(_PROTEST_OFFSETS):
            out.append(NPC(
                f"Manifestante {key} {i + 1}", "Manifestante",
                b.door_x + ox, b.y + oy, "male_person", chant,
                extra_line="A populacao cobra quem tem o poder de decidir.",
                protest=mission_id, tint=tint,
            ))
    return out


def _street_decor() -> list[Prop]:
    """Decoracao urbana e veiculos ao longo das ruas (Roguelike Modern City)."""
    decor: list[Prop] = []

    def add(kind: str, x: float, y: float, *, w: float = 30, h: float = 40, solid: bool = False, flip: bool = False) -> None:
        decor.append(Prop(kind, x, y, w, h, kind, solid=solid, flip=flip))

    # Semaforos nos cruzamentos (via x via).
    for x in (660, 1480, 2360):
        for y in (900, 1560):
            add("trafficlight", x - 6, y + 96, w=20, h=54, solid=True)

    # Postes de luz nas bordas das calcadas.
    for x, y in [(628, 1120), (628, 1380), (1448, 1120), (1572, 1360),
                 (2328, 1120), (2452, 1360), (900, 1636), (1900, 876), (1500, 1636)]:
        add("streetlamp", x, y, w=16, h=54, solid=True)

    # Veiculos variados; nas vias horizontais alternam o sentido.
    cars = [
        ("car_sedan", 780, 936, False), ("car_taxi", 1120, 944, True),
        ("car_bus", 1740, 936, False), ("car_suv", 2200, 944, True),
        ("car_police", 560, 1596, True), ("car_van", 1050, 1604, False),
        ("car_sports", 1800, 1596, True), ("car_truck", 2360, 1604, False),
        ("car_amb", 520, 1010, False), ("car_suv", 1420, 1010, True),
    ]
    for kind, x, y, flip in cars:
        add(kind, x, y, w=70, h=32, solid=True, flip=flip)

    # Mobiliario urbano (nao solido, para nao travar o jogador).
    for x, y in [(742, 1000), (1560, 980), (2380, 1010)]:
        add("trashcan", x, y, w=18, h=24)
    add("mailbox", 980, 1120, w=18, h=30)
    add("mailbox", 1420, 1120, w=18, h=30)
    for x, y in [(560, 1060), (1600, 645)]:
        add("barrel", x, y, w=18, h=24)
    # Barracas de feira (toldos) nas pracas.
    for kind, x, y in [("stall_green", 500, 1120), ("stall_orange", 840, 1080),
                       ("stall_green", 1120, 1240), ("stall_orange", 1360, 1080)]:
        add(kind, x, y, w=44, h=40)

    return decor
