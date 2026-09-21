// Portado 1:1 de src/content/problems.py

export interface Problem {
  id: string;
  missionId: string;
  regionKey: string;
  x: number;
  y: number;
  title: string;
  descUnsolved: string;
  descSolved: string;
}

export const PROBLEMS: Problem[] = [
  {
    id: "terreno_saude",
    missionId: "saude_bairro",
    regionKey: "bairro_saude",
    x: 1560,
    y: 1040,
    title: "Terreno vazio",
    descUnsolved:
      "PLACA NO TERRENO: 'Area reservada para uma unidade de saude'. " +
      "Ha meses o terreno segue vazio e os moradores se deslocam para longe para se consultar.",
    descSolved:
      "OBRA EM ANDAMENTO: a prefeitura iniciou a construcao da unidade de saude, " +
      "com fiscalizacao da Camara. O bairro finalmente tera atendimento basico perto de casa.",
  },
  {
    id: "praca_abandonada",
    missionId: "orcamento_cidade",
    regionKey: "praca_central",
    x: 880,
    y: 1320,
    title: "Praca sem manutencao",
    descUnsolved:
      "Lampadas quebradas, bancos danificados e mato alto. Falta definir no orcamento " +
      "quanto sera destinado a manutencao dos espacos publicos.",
    descSolved:
      "A praca entrou no orcamento aprovado: iluminacao trocada e manutencao contratada, " +
      "com prioridades definidas em lei e prestacao de contas.",
  },
  {
    id: "hospital_lotado",
    missionId: "hospital_regional",
    regionKey: "assembleia",
    x: 2300,
    y: 1660,
    title: "Hospital regional lotado",
    descUnsolved:
      "PAINEL: pacientes de varias cidades vizinhas dependem deste hospital de referencia, " +
      "que opera acima da capacidade. Nenhum municipio sozinho da conta da demanda regional.",
    descSolved:
      "O governo do estado ampliou o hospital de referencia e coordenou o atendimento regional " +
      "entre os municipios vizinhos.",
  },
  {
    id: "rodovia_interditada",
    missionId: "rodovia_estadual",
    regionKey: "governo",
    x: 2400,
    y: 1320,
    title: "Rodovia interditada",
    descUnsolved:
      "CONES E BARREIRAS: um trecho da rodovia que liga cidades do estado esta esburacado " +
      "e parcialmente interditado, obrigando um longo desvio.",
    descSolved:
      "O governo do estado recuperou o trecho da rodovia estadual e liberou o trafego " +
      "entre as cidades da regiao.",
  },
  {
    id: "mural_assinaturas",
    missionId: "lei_federal",
    regionKey: "congresso",
    x: 2610,
    y: 540,
    title: "Mural de assinaturas",
    descUnsolved:
      "MURAL: cidadaos de todo o pais pedem uma nova lei federal sobre um tema nacional. " +
      "Uma lei assim precisa nascer e ser aprovada no lugar certo.",
    descSolved:
      "A proposta avancou no Congresso Nacional, passando pela Camara dos Deputados " +
      "e pelo Senado, como manda o processo legislativo federal.",
  },
  {
    id: "programa_nacional",
    missionId: "politica_nacional",
    regionKey: "planalto",
    x: 2990,
    y: 1050,
    title: "Programa nacional a executar",
    descUnsolved:
      "CARTAZ: um programa federal foi aprovado em lei e com orcamento, mas ainda precisa " +
      "ser colocado em pratica em todo o pais.",
    descSolved:
      "O Executivo federal colocou o programa nacional em pratica, respeitando a lei " +
      "e o orcamento aprovados pelo Congresso.",
  },
];

export const PROBLEMS_BY_MISSION: Record<string, Problem> = Object.fromEntries(
  PROBLEMS.map((p) => [p.missionId, p]),
);

export function problemEvidence(missionId: string): string {
  return `${missionId}:problema`;
}
