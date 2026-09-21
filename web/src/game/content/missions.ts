// Portado 1:1 de src/content/missions.py

export interface Option {
  letter: string;
  text: string;
  correct: boolean;
}

export interface Mission {
  id: string;
  order: number;
  stage: string;
  title: string;
  giver: string;
  regionKey: string;
  intro: string[];
  question: string;
  options: Option[];
  success: string;
  roles: string[];
  lesson: string;
  problemId: string;
  evidence: string[];
  hints: [string, string][];
}

/** Provas padrao de uma missao: problema, testemunho e lei. */
export function evidenceIds(missionId: string): [string, string, string] {
  return [
    `${missionId}:problema`,
    `${missionId}:testemunho`,
    `${missionId}:lei`,
  ];
}

// Enredo geral do jogo, apresentado por etapa.
export const STORY: Record<string, string> = {
  abertura:
    "Joana acaba de se mudar para Aurora do Brasil. Ela percebe que muita gente reclama " +
    "de problemas na cidade, mas quase ninguem sabe QUEM tem o poder de resolver cada um deles.\n" +
    "Decidida a entender a politica de verdade, ela comeca a conversar com quem ocupa cada cargo.",
  municipio:
    "ETAPA 1 - O MUNICIPIO\n" +
    "Tudo comeca perto de casa. Na praca, na Camara e na Prefeitura, Joana descobre o que um " +
    "vereador e um prefeito podem e nao podem fazer.",
  estado:
    "ETAPA 2 - O ESTADO\n" +
    "Alguns problemas sao grandes demais para um municipio sozinho. Joana viaja ate o centro " +
    "estadual para entender deputados estaduais e o governador.",
  uniao:
    "ETAPA 3 - A UNIAO\n" +
    "As leis que valem para todo o pais nascem no Congresso. Joana chega a capital para conhecer " +
    "senadores, deputados federais e o presidente.",
  final:
    "ENCERRAMENTO\n" +
    "Depois de percorrer os tres niveis de governo, Joana entende que decisoes publicas dependem " +
    "de competencia, orcamento, leis e participacao. Agora ela sabe a quem cobrar cada assunto.",
};

export const MISSIONS: Mission[] = [
  {
    id: "saude_bairro",
    order: 1,
    stage: "municipio",
    title: "Saude no Bairro",
    giver: "Caio Bairro",
    regionKey: "camara",
    intro: [
      "Caio Bairro: Joana, moradores pedem uma unidade de saude aqui no bairro ha meses.",
      "Como vereador, eu proponho leis e fiscalizo, mas nao executo a obra sozinho.",
      "Me diga: quem deve liderar a execucao dessa unidade de saude?",
    ],
    question: "Quem deve liderar a execucao da nova unidade de saude?",
    options: [
      { letter: "A", text: "A prefeitura, com fiscalizacao da Camara Municipal.", correct: true },
      { letter: "B", text: "O Senado, porque todo problema publico e federal.", correct: false },
      { letter: "C", text: "O governador sozinho, sem consultar o municipio.", correct: false },
    ],
    success:
      "Isso! O prefeito administra e executa servicos municipais; a Camara legisla e fiscaliza.",
    roles: ["vereador", "prefeito"],
    lesson: "Servicos locais de saude basica sao responsabilidade principal do municipio.",
    problemId: "terreno_saude",
    evidence: ["saude_bairro:problema", "saude_bairro:testemunho", "saude_bairro:lei"],
    hints: [
      ["saude_bairro:problema", "O terreno vazio mostra uma demanda LOCAL de saude basica."],
      ["saude_bairro:testemunho", "Moradores relatam dificuldade de se consultar perto de casa."],
      ["saude_bairro:lei", "Leis municipais: o vereador propoe e fiscaliza; o prefeito executa."],
    ],
  },
  {
    id: "orcamento_cidade",
    order: 2,
    stage: "municipio",
    title: "Orcamento da Cidade",
    giver: "Marina Prado",
    regionKey: "prefeitura",
    intro: [
      "Marina Prado: Ser prefeita e escolher prioridades com um orcamento limitado.",
      "Neste ano preciso decidir como equilibrar saude, educacao e transporte.",
      "Qual e a forma mais correta de definir esse gasto?",
    ],
    question: "Como o gasto publico municipal deve ser definido?",
    options: [
      { letter: "A", text: "Gastar tudo em uma so area para agradar mais gente.", correct: false },
      { letter: "B", text: "Seguir um orcamento aprovado por lei, com prioridades e transparencia.", correct: true },
      { letter: "C", text: "Decidir sozinha, sem prestar contas a ninguem.", correct: false },
    ],
    success:
      "Exato! O orcamento e definido em lei, com prioridades, metas e prestacao de contas.",
    roles: ["prefeito"],
    lesson: "O prefeito executa o orcamento aprovado pela Camara e presta contas a populacao.",
    problemId: "praca_abandonada",
    evidence: ["orcamento_cidade:problema", "orcamento_cidade:testemunho", "orcamento_cidade:lei"],
    hints: [
      ["orcamento_cidade:problema", "A praca abandonada revela falta de prioridade no orcamento."],
      ["orcamento_cidade:testemunho", "A comunidade pede manutencao e iluminacao."],
      ["orcamento_cidade:lei", "O orcamento e aprovado por lei, com prioridades e prestacao de contas."],
    ],
  },
  {
    id: "hospital_regional",
    order: 3,
    stage: "estado",
    title: "Hospital Regional",
    giver: "Lia Campos",
    regionKey: "assembleia",
    intro: [
      "Lia Campos: Varios municipios vizinhos dependem de um mesmo hospital.",
      "Como deputada estadual, eu crio leis estaduais e fiscalizo o governo do estado.",
      "Quem costuma responder por um hospital que atende toda uma regiao?",
    ],
    question: "Quem responde por um hospital que atende varios municipios?",
    options: [
      { letter: "A", text: "Apenas um municipio, mesmo atendendo os vizinhos.", correct: false },
      { letter: "B", text: "O governo estadual, que coordena politicas regionais.", correct: true },
      { letter: "C", text: "Uma empresa privada, sem qualquer papel do Estado.", correct: false },
    ],
    success:
      "Certo! Servicos de media e alta complexidade regional costumam ser do governo estadual.",
    roles: ["deputado_estadual"],
    lesson: "O estado atua onde a acao ultrapassa as fronteiras de um unico municipio.",
    problemId: "hospital_lotado",
    evidence: ["hospital_regional:problema", "hospital_regional:testemunho", "hospital_regional:lei"],
    hints: [
      ["hospital_regional:problema", "O hospital atende varias cidades: e um problema REGIONAL."],
      ["hospital_regional:testemunho", "Pacientes vem de municipios vizinhos."],
      ["hospital_regional:lei", "Servicos regionais de media/alta complexidade sao do estado."],
    ],
  },
  {
    id: "rodovia_estadual",
    order: 4,
    stage: "estado",
    title: "Rodovia Estadual",
    giver: "Raul Nogueira",
    regionKey: "governo",
    intro: [
      "Raul Nogueira: Uma rodovia liga cidades do estado e precisa de manutencao.",
      "Como governador, eu comando o Executivo estadual e executo politicas estaduais.",
      "De quem e a responsabilidade principal por uma rodovia estadual?",
    ],
    question: "Quem responde por uma rodovia que liga cidades do estado?",
    options: [
      { letter: "A", text: "O governo do estado, responsavel pelas rodovias estaduais.", correct: true },
      { letter: "B", text: "Cada motorista, individualmente.", correct: false },
      { letter: "C", text: "A Camara Municipal de uma unica cidade.", correct: false },
    ],
    success: "Isso! Rodovias estaduais sao do governo estadual; as federais, da Uniao.",
    roles: ["governador"],
    lesson: "O governador executa politicas estaduais, inclusive infraestrutura do estado.",
    problemId: "rodovia_interditada",
    evidence: ["rodovia_estadual:problema", "rodovia_estadual:testemunho", "rodovia_estadual:lei"],
    hints: [
      ["rodovia_estadual:problema", "A rodovia liga cidades do estado: alcance estadual."],
      ["rodovia_estadual:testemunho", "O desvio prejudica transporte e comercio regional."],
      ["rodovia_estadual:lei", "Rodovias estaduais sao do estado; as federais, da Uniao."],
    ],
  },
  {
    id: "lei_federal",
    order: 5,
    stage: "uniao",
    title: "Uma Lei para o Pais",
    giver: "Helena Norte",
    regionKey: "congresso",
    intro: [
      "Helena Norte: No Congresso, uma lei federal passa por duas casas.",
      "A Camara dos Deputados representa o povo; o Senado representa os estados.",
      "Onde nascem e sao aprovadas as leis que valem para todo o pais?",
    ],
    question: "Onde sao criadas e aprovadas as leis federais?",
    options: [
      { letter: "A", text: "Somente pelo presidente, por decisao pessoal.", correct: false },
      { letter: "B", text: "No Congresso Nacional: Camara dos Deputados e Senado.", correct: true },
      { letter: "C", text: "Em cada Camara Municipal separadamente.", correct: false },
    ],
    success: "Perfeito! O Congresso, formado por Camara e Senado, cria as leis federais.",
    roles: ["deputado_federal", "senador"],
    lesson: "Leis federais exigem aprovacao das duas casas do Congresso Nacional.",
    problemId: "mural_assinaturas",
    evidence: ["lei_federal:problema", "lei_federal:testemunho", "lei_federal:lei"],
    hints: [
      ["lei_federal:problema", "O pedido vale para o pais todo: e assunto NACIONAL."],
      ["lei_federal:testemunho", "Direitos iguais em todo o territorio viram lei federal."],
      ["lei_federal:lei", "Uma lei federal passa pela Camara dos Deputados e pelo Senado."],
    ],
  },
  {
    id: "politica_nacional",
    order: 6,
    stage: "uniao",
    title: "Politica Nacional",
    giver: "Lucio Silva",
    regionKey: "planalto",
    intro: [
      "Lucio Silva: Como presidente, eu chefio o Executivo federal.",
      "Eu executo politicas nacionais, mas dentro das leis e do orcamento aprovados.",
      "O que descreve melhor o papel do presidente?",
    ],
    question: "Qual e o papel do presidente da Republica?",
    options: [
      { letter: "A", text: "Criar sozinho todas as leis do pais.", correct: false },
      { letter: "B", text: "Executar politicas federais respeitando leis e orcamento aprovados.", correct: true },
      { letter: "C", text: "Administrar diretamente cada cidade do pais.", correct: false },
    ],
    success: "Isso! O presidente executa a politica nacional dentro da lei e do orcamento.",
    roles: ["presidente"],
    lesson: "O Executivo federal executa; ele nao substitui o Congresso nem os municipios.",
    problemId: "programa_nacional",
    evidence: ["politica_nacional:problema", "politica_nacional:testemunho", "politica_nacional:lei"],
    hints: [
      ["politica_nacional:problema", "O programa ja tem lei e orcamento; falta executar."],
      ["politica_nacional:testemunho", "A populacao quer o programa na ponta, dentro das regras."],
      ["politica_nacional:lei", "O presidente executa politicas nacionais dentro da lei e do orcamento."],
    ],
  },
];

export const MISSIONS_BY_ID: Record<string, Mission> = Object.fromEntries(
  MISSIONS.map((m) => [m.id, m]),
);

export const MISSION_BY_GIVER: Record<string, Mission> = Object.fromEntries(
  MISSIONS.map((m) => [m.giver, m]),
);

export function nextMission(completed: string[]): Mission | null {
  for (const mission of [...MISSIONS].sort((a, b) => a.order - b.order)) {
    if (!completed.includes(mission.id)) return mission;
  }
  return null;
}
