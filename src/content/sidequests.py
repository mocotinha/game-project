"""Side quests com moradores: ouvir testemunhos concede a prova e uma estrela.

Um morador (``giver``) pede que o jogador ouca outros moradores (``targets``).
Ao ouvir todos, o jogador ganha a prova ``f"{mission_id}:testemunho"`` e uma estrela.
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class SideQuest:
    id: str
    mission_id: str
    giver: str
    intro: str
    objective: str
    targets: tuple[str, ...]
    testimonies: dict[str, str]
    done_line: str
    grants: str = ""
    star: bool = True

    def __post_init__(self) -> None:
        if not self.grants:
            self.grants = f"{self.mission_id}:testemunho"


SIDEQUESTS: tuple[SideQuest, ...] = (
    SideQuest(
        id="sq_saude",
        mission_id="saude_bairro",
        giver="Dona Alzira",
        intro="Dona Alzira: minha filha, antes de cobrar alguem, escute quem sente o problema na pele. Fale com o Nilo da feira e com a Rita.",
        objective="Ouca o Feirante Nilo e a Gari Rita sobre a falta de posto de saude.",
        targets=("Feirante Nilo", "Gari Rita"),
        testimonies={
            "Feirante Nilo": "Feirante Nilo: quando passo mal, gasto meio dia de onibus ate outro bairro. Um posto aqui mudava tudo.",
            "Gari Rita": "Gari Rita: vejo idosos andando longe para uma simples consulta. Saude perto de casa e dignidade.",
        },
        done_line="Dona Alzira: viu so? Agora voce tem a voz do povo. Leve isso a quem decide.",
    ),
    SideQuest(
        id="sq_orcamento",
        mission_id="orcamento_cidade",
        giver="Professora Ines",
        intro="Professora Ines: orcamento e escolha. Junte os pedidos da comunidade: fale com o Vovo Alberto e com o Gari Bento.",
        objective="Colete os pedidos do Vovo Alberto e do Gari Bento para a praca.",
        targets=("Vovo Alberto", "Gari Bento"),
        testimonies={
            "Vovo Alberto": "Vovo Alberto: gosto de sentar na praca, mas os bancos estao quebrados e a luz nao acende a noite.",
            "Gari Bento": "Gari Bento: sem verba de manutencao, a limpeza e a poda ficam sempre para depois.",
        },
        done_line="Professora Ines: otimo. Prioridade se decide com dados e transparencia, nunca no grito.",
    ),
    SideQuest(
        id="sq_hospital",
        mission_id="hospital_regional",
        giver="Dona Vera",
        intro="Dona Vera: aqui chega gente de muitas cidades. Converse com o Seu Otavio e com o Jovem Rui para entender.",
        objective="Ouca o Seu Otavio e o Jovem Rui sobre o hospital regional.",
        targets=("Seu Otavio", "Jovem Rui"),
        testimonies={
            "Seu Otavio": "Seu Otavio: venho de uma cidade vizinha; nossa unidade nao faz cirurgia, entao todos vem para ca.",
            "Jovem Rui": "Jovem Rui: um hospital que atende varias cidades nao pode depender de um municipio so.",
        },
        done_line="Dona Vera: agora voce entendeu: problema de varios municipios pede uma solucao maior.",
    ),
    SideQuest(
        id="sq_rodovia",
        mission_id="rodovia_estadual",
        giver="Caminhoneiro Zeca",
        intro="Caminhoneiro Zeca: essa estrada liga cidades do estado inteiro. Fale com a Motorista Cida e com o Feirante Tino sobre o desvio.",
        objective="Ouca a Motorista Cida e o Feirante Tino sobre a rodovia interditada.",
        targets=("Motorista Cida", "Feirante Tino"),
        testimonies={
            "Motorista Cida": "Motorista Cida: o desvio me faz rodar duas horas a mais por dia. Isso encarece tudo.",
            "Feirante Tino": "Feirante Tino: minha mercadoria chega estragada por causa da estrada esburacada.",
        },
        done_line="Caminhoneiro Zeca: viu o tamanho do estrago? Estrada entre cidades e caso para o estado.",
    ),
    SideQuest(
        id="sq_lei",
        mission_id="lei_federal",
        giver="Estudante Bruno",
        intro="Estudante Bruno: por que uma lei precisa valer para o pais todo? Pergunte ao Professor Nabuco e a Ativista Rosa.",
        objective="Ouca o Professor Nabuco e a Ativista Rosa sobre leis nacionais.",
        targets=("Professor Nabuco", "Ativista Rosa"),
        testimonies={
            "Professor Nabuco": "Professor Nabuco: certos direitos precisam ser iguais em todo o territorio; por isso viram lei federal.",
            "Ativista Rosa": "Ativista Rosa: recolhemos assinaturas do pais inteiro. Agora a proposta precisa do caminho certo.",
        },
        done_line="Estudante Bruno: entao ficou claro onde uma lei nacional nasce e e aprovada.",
    ),
    SideQuest(
        id="sq_politica",
        mission_id="politica_nacional",
        giver="Servidora Dinah",
        intro="Servidora Dinah: um programa nacional so vale se sair do papel. Converse com o Analista Ivo e com a Cidada Marli.",
        objective="Ouca o Analista Ivo e a Cidada Marli sobre o programa nacional.",
        targets=("Analista Ivo", "Cidada Marli"),
        testimonies={
            "Analista Ivo": "Analista Ivo: a lei existe e ha orcamento; falta executar o programa em todo o pais.",
            "Cidada Marli": "Cidada Marli: quero ver o programa chegando na ponta, com respeito as regras.",
        },
        done_line="Servidora Dinah: isso. Executar dentro da lei e do orcamento e o papel do Executivo federal.",
    ),
)

SIDEQUESTS_BY_ID = {sq.id: sq for sq in SIDEQUESTS}
SIDEQUESTS_BY_GIVER = {sq.giver: sq for sq in SIDEQUESTS}
SIDEQUESTS_BY_MISSION = {sq.mission_id: sq for sq in SIDEQUESTS}


def sidequest_for_target(name: str) -> list[SideQuest]:
    return [sq for sq in SIDEQUESTS if name in sq.targets]
