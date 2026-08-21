"""Problemas visiveis no mapa, um por missao.

Cada problema aparece como um marcador interativo na cidade. Investiga-lo concede a
prova ``f"{mission_id}:problema"``. Ao concluir a missao, o marcador vira "resolvido".
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Problem:
    id: str
    mission_id: str
    region_key: str
    x: float
    y: float
    title: str
    desc_unsolved: str
    desc_solved: str


PROBLEMS: tuple[Problem, ...] = (
    Problem(
        id="terreno_saude",
        mission_id="saude_bairro",
        region_key="bairro_saude",
        x=1560, y=1040,
        title="Terreno vazio",
        desc_unsolved=(
            "PLACA NO TERRENO: 'Area reservada para uma unidade de saude'. "
            "Ha meses o terreno segue vazio e os moradores se deslocam para longe para se consultar."
        ),
        desc_solved=(
            "OBRA EM ANDAMENTO: a prefeitura iniciou a construcao da unidade de saude, "
            "com fiscalizacao da Camara. O bairro finalmente tera atendimento basico perto de casa."
        ),
    ),
    Problem(
        id="praca_abandonada",
        mission_id="orcamento_cidade",
        region_key="praca_central",
        x=880, y=1320,
        title="Praca sem manutencao",
        desc_unsolved=(
            "Lampadas quebradas, bancos danificados e mato alto. Falta definir no orcamento "
            "quanto sera destinado a manutencao dos espacos publicos."
        ),
        desc_solved=(
            "A praca entrou no orcamento aprovado: iluminacao trocada e manutencao contratada, "
            "com prioridades definidas em lei e prestacao de contas."
        ),
    ),
    Problem(
        id="hospital_lotado",
        mission_id="hospital_regional",
        region_key="assembleia",
        x=2300, y=1660,
        title="Hospital regional lotado",
        desc_unsolved=(
            "PAINEL: pacientes de varias cidades vizinhas dependem deste hospital de referencia, "
            "que opera acima da capacidade. Nenhum municipio sozinho da conta da demanda regional."
        ),
        desc_solved=(
            "O governo do estado ampliou o hospital de referencia e coordenou o atendimento regional "
            "entre os municipios vizinhos."
        ),
    ),
    Problem(
        id="rodovia_interditada",
        mission_id="rodovia_estadual",
        region_key="governo",
        x=2400, y=1320,
        title="Rodovia interditada",
        desc_unsolved=(
            "CONES E BARREIRAS: um trecho da rodovia que liga cidades do estado esta esburacado "
            "e parcialmente interditado, obrigando um longo desvio."
        ),
        desc_solved=(
            "O governo do estado recuperou o trecho da rodovia estadual e liberou o trafego "
            "entre as cidades da regiao."
        ),
    ),
    Problem(
        id="mural_assinaturas",
        mission_id="lei_federal",
        region_key="congresso",
        x=2610, y=540,
        title="Mural de assinaturas",
        desc_unsolved=(
            "MURAL: cidadaos de todo o pais pedem uma nova lei federal sobre um tema nacional. "
            "Uma lei assim precisa nascer e ser aprovada no lugar certo."
        ),
        desc_solved=(
            "A proposta avancou no Congresso Nacional, passando pela Camara dos Deputados "
            "e pelo Senado, como manda o processo legislativo federal."
        ),
    ),
    Problem(
        id="programa_nacional",
        mission_id="politica_nacional",
        region_key="planalto",
        x=2990, y=1050,
        title="Programa nacional a executar",
        desc_unsolved=(
            "CARTAZ: um programa federal foi aprovado em lei e com orcamento, mas ainda precisa "
            "ser colocado em pratica em todo o pais."
        ),
        desc_solved=(
            "O Executivo federal colocou o programa nacional em pratica, respeitando a lei "
            "e o orcamento aprovados pelo Congresso."
        ),
    ),
)

PROBLEMS_BY_MISSION = {p.mission_id: p for p in PROBLEMS}


def problem_evidence(mission_id: str) -> str:
    return f"{mission_id}:problema"
