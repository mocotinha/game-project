from __future__ import annotations

from dataclasses import dataclass, field

from src.world import NPC


@dataclass
class InteriorItem:
    name: str
    x: float
    y: float
    kind: str
    text: str
    grants: str = ""  # prova concedida ao ler (ex.: "saude_bairro:lei")


@dataclass
class Interior:
    key: str
    title: str
    theme: str
    npcs: list[NPC]
    items: list[InteriorItem] = field(default_factory=list)
    floor: tuple[int, int, int] = (58, 52, 46)
    wall: tuple[int, int, int] = (40, 36, 34)
    desk: tuple[float, float] = (980, 330)


def _reception(name: str, giver_role: str, tint: tuple[int, int, int]) -> NPC:
    return NPC(
        name, "Recepcionista", 980, 350, "female_person",
        f"Bem-vinda! O(a) {giver_role} atende ali no salao.",
        extra_line="Use a mesa da recepcao como referencia e sinta-se a vontade.", tint=tint,
    )


def build_interiors() -> dict[str, Interior]:
    interiors = {
        "camara": Interior(
            "camara", "CAMARA MUNICIPAL", theme="chamber",
            npcs=[
                NPC("Caio Bairro", "Vereador", 560, 420, "male_person",
                    "Bem-vinda a Camara! Aqui debatemos e fiscalizamos.", mission="saude_bairro", tint=(255, 235, 200)),
                NPC("Assessor Paulo", "Assessor", 360, 440, "male_adventurer",
                    "Ajudo o vereador a preparar projetos de lei.",
                    extra_line="Cada projeto e estudado antes de virar lei.", tint=(200, 210, 255)),
                NPC("Servidora Ana", "Servidora", 760, 440, "female_adventurer",
                    "Organizo os documentos das sessoes.",
                    extra_line="A transparencia depende de bons registros.", tint=(210, 255, 220)),
                _reception("Recepcao Bia", "vereador", (255, 210, 230)),
            ],
            items=[
                InteriorItem("Livro de Leis Municipais", 220, 300, "book",
                             "LEI ORGANICA (resumo): a saude basica e servico do municipio. O vereador propoe leis e fiscaliza; o prefeito executa as obras e servicos.",
                             grants="saude_bairro:lei"),
                InteriorItem("Mural de Propostas", 430, 300, "board",
                             "Propostas de lei ficam expostas para a populacao acompanhar e opinar."),
            ],
            floor=(74, 64, 52), wall=(48, 42, 36),
        ),
        "prefeitura": Interior(
            "prefeitura", "PREFEITURA", theme="office",
            npcs=[
                NPC("Marina Prado", "Prefeita", 560, 420, "female_person",
                    "Bem-vinda a Prefeitura! Aqui executamos os servicos da cidade.", mission="orcamento_cidade", tint=(255, 245, 210)),
                NPC("Secretario Rui", "Secretario", 360, 440, "male_adventurer",
                    "Cuido da secretaria de servicos urbanos.",
                    extra_line="Cada secretaria executa uma area do municipio.", tint=(200, 220, 255)),
                NPC("Servidor Leo", "Servidor", 760, 440, "male_person",
                    "Atendo pedidos da populacao no protocolo.",
                    extra_line="O cidadao pode acompanhar seus pedidos.", tint=(220, 235, 200)),
                _reception("Recepcao Ivo", "prefeito", (255, 215, 180)),
            ],
            items=[
                InteriorItem("Orcamento Municipal", 220, 300, "book",
                             "LEI ORCAMENTARIA (resumo): o gasto publico segue um orcamento aprovado por lei, com prioridades, metas e prestacao de contas a populacao.",
                             grants="orcamento_cidade:lei"),
                InteriorItem("Painel de Servicos", 430, 300, "board",
                             "Saude, educacao e transporte municipais sao coordenados a partir daqui."),
            ],
            floor=(70, 66, 54), wall=(46, 42, 34),
        ),
        "saude": Interior(
            "saude", "UNIDADE DE SAUDE", theme="clinic",
            npcs=[
                NPC("Dra. Marta", "Medica", 560, 420, "female_adventurer",
                    "Bem-vinda a unidade! Aqui a populacao recebe atendimento.",
                    extra_line="A saude basica e responsabilidade principal do municipio.", tint=(240, 250, 255)),
                NPC("Enf. Davi", "Enfermeiro", 760, 440, "male_person",
                    "Faco triagem e cuidados de enfermagem.",
                    extra_line="A equipe de saude trabalha em conjunto.", tint=(210, 245, 255)),
                NPC("Atendente Lu", "Atendente", 360, 440, "female_person",
                    "Organizo as fichas e o agendamento.",
                    extra_line="O atendimento comeca na recepcao.", tint=(255, 220, 220)),
                _reception("Recepcao Sara", "medico", (200, 235, 240)),
            ],
            items=[
                InteriorItem("Cartaz do SUS", 220, 300, "board",
                             "O SUS organiza a saude publica; o municipio cuida da atencao basica."),
                InteriorItem("Prontuario", 430, 300, "book",
                             "Prontuarios registram o cuidado do paciente com sigilo."),
            ],
            floor=(70, 82, 84), wall=(48, 58, 60),
        ),
        "assembleia": Interior(
            "assembleia", "ASSEMBLEIA ESTADUAL", theme="chamber",
            npcs=[
                NPC("Lia Campos", "Deputada Estadual", 560, 420, "female_adventurer",
                    "Bem-vinda a Assembleia! Aqui legislamos para todo o estado.", mission="hospital_regional", tint=(255, 235, 245)),
                NPC("Assessora Val", "Assessora", 360, 440, "female_person",
                    "Preparo estudos sobre os projetos estaduais.",
                    extra_line="Leis estaduais respeitam a Constituicao Federal.", tint=(220, 210, 255)),
                NPC("Servidor Ciro", "Servidor", 760, 440, "male_adventurer",
                    "Registro as votacoes das sessoes.",
                    extra_line="Cada voto fica registrado publicamente.", tint=(210, 220, 240)),
                _reception("Recepcao Sol", "deputado estadual", (235, 210, 255)),
            ],
            items=[
                InteriorItem("Constituicao Estadual", 220, 300, "book",
                             "CONSTITUICAO ESTADUAL (resumo): o estado responde por servicos regionais, como hospitais de referencia que atendem varios municipios, respeitando a Constituicao Federal.",
                             grants="hospital_regional:lei"),
                InteriorItem("Mapa Regional", 430, 300, "board",
                             "Hospitais de referencia atendem varios municipios e sao responsabilidade estadual."),
            ],
            floor=(66, 60, 74), wall=(42, 38, 48),
        ),
        "governo": Interior(
            "governo", "PALACIO DO GOVERNO", theme="office",
            npcs=[
                NPC("Raul Nogueira", "Governador", 560, 420, "male_adventurer",
                    "Bem-vinda! Daqui comando o Executivo do estado.", mission="rodovia_estadual", tint=(220, 225, 255)),
                NPC("Secretaria Bel", "Secretaria", 360, 440, "female_adventurer",
                    "Coordeno a secretaria de infraestrutura.",
                    extra_line="Rodovias estaduais sao responsabilidade do estado.", tint=(210, 230, 255)),
                NPC("Assessor Gil", "Assessor", 760, 440, "male_person",
                    "Acompanho as agendas do governador.",
                    extra_line="O Executivo estadual executa politicas do estado.", tint=(200, 215, 245)),
                _reception("Recepcao Nara", "governador", (225, 235, 255)),
            ],
            items=[
                InteriorItem("Mapa de Rodovias", 220, 300, "book",
                             "CLASSIFICACAO DAS RODOVIAS: rodovias estaduais (que ligam cidades do estado) sao do governo estadual; rodovias federais sao da Uniao.",
                             grants="rodovia_estadual:lei"),
                InteriorItem("Plano de Governo", 430, 300, "board",
                             "O governador executa politicas estaduais dentro do orcamento aprovado."),
            ],
            floor=(64, 66, 78), wall=(40, 42, 52),
        ),
        "congresso": Interior(
            "congresso", "CONGRESSO NACIONAL", theme="chamber",
            npcs=[
                NPC("Helena Norte", "Senadora", 560, 420, "female_person",
                    "Bem-vinda ao Congresso! Camara e Senado criam as leis do pais.", mission="lei_federal", tint=(255, 240, 205)),
                NPC("Deputado Alan", "Deputado Federal", 360, 440, "male_adventurer",
                    "Represento o povo na Camara dos Deputados.",
                    extra_line="A Camara representa o povo; o Senado, os estados.", tint=(220, 230, 255)),
                NPC("Consultor Ed", "Consultor", 760, 440, "male_person",
                    "Dou apoio tecnico as votacoes.",
                    extra_line="Uma lei federal passa por Camara e Senado.", tint=(230, 220, 200)),
                _reception("Recepcao Theo", "senador", (240, 225, 200)),
            ],
            items=[
                InteriorItem("Regimento do Congresso", 220, 300, "book",
                             "PROCESSO LEGISLATIVO (resumo): uma lei federal precisa ser aprovada pelas duas casas do Congresso Nacional: a Camara dos Deputados e o Senado.",
                             grants="lei_federal:lei"),
                InteriorItem("Painel de Votacoes", 430, 300, "board",
                             "A Camara representa o povo; o Senado representa os estados."),
            ],
            floor=(76, 70, 54), wall=(48, 44, 34),
        ),
        "planalto": Interior(
            "planalto", "PALACIO DO PLANALTO", theme="office",
            npcs=[
                NPC("Lucio Silva", "Presidente", 560, 420, "male_adventurer",
                    "Bem-vinda ao Planalto! Aqui fica o Executivo federal.", mission="politica_nacional", tint=(225, 230, 255)),
                NPC("Ministra Rosa", "Ministra", 360, 440, "female_adventurer",
                    "Coordeno uma pasta do governo federal.",
                    extra_line="Ministerios executam politicas nacionais por area.", tint=(230, 215, 255)),
                NPC("Assessor Nei", "Assessor", 760, 440, "male_person",
                    "Organizo a agenda presidencial.",
                    extra_line="O presidente age dentro da lei e do orcamento.", tint=(210, 220, 250)),
                _reception("Recepcao Cora", "presidente", (220, 230, 255)),
            ],
            items=[
                InteriorItem("Constituicao Federal", 220, 300, "book",
                             "CONSTITUICAO FEDERAL (resumo): e a lei maior do pais. O presidente executa politicas nacionais dentro das leis e do orcamento aprovados pelo Congresso.",
                             grants="politica_nacional:lei"),
                InteriorItem("Agenda Nacional", 430, 300, "board",
                             "O presidente executa politicas nacionais, sempre dentro da lei e do orcamento."),
            ],
            floor=(66, 68, 80), wall=(42, 44, 54),
        ),
    }
    return interiors


def giver_of(interior: Interior) -> NPC:
    for npc in interior.npcs:
        if npc.mission:
            return npc
    return interior.npcs[0]
