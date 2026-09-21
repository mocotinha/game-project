// Portado 1:1 de src/content/sidequests.py

export interface SideQuest {
  id: string;
  missionId: string;
  giver: string;
  intro: string;
  objective: string;
  targets: string[];
  testimonies: Record<string, string>;
  doneLine: string;
  grants: string;
  star: boolean;
}

export const SIDEQUESTS: SideQuest[] = [
  {
    id: "sq_saude",
    missionId: "saude_bairro",
    giver: "Dona Alzira",
    intro:
      "Dona Alzira: minha filha, antes de cobrar alguem, escute quem sente o problema na pele. Fale com o Nilo da feira e com a Rita.",
    objective: "Ouca o Feirante Nilo e a Gari Rita sobre a falta de posto de saude.",
    targets: ["Feirante Nilo", "Gari Rita"],
    testimonies: {
      "Feirante Nilo":
        "Feirante Nilo: quando passo mal, gasto meio dia de onibus ate outro bairro. Um posto aqui mudava tudo.",
      "Gari Rita":
        "Gari Rita: vejo idosos andando longe para uma simples consulta. Saude perto de casa e dignidade.",
    },
    doneLine: "Dona Alzira: viu so? Agora voce tem a voz do povo. Leve isso a quem decide.",
    grants: "saude_bairro:testemunho",
    star: true,
  },
  {
    id: "sq_orcamento",
    missionId: "orcamento_cidade",
    giver: "Professora Ines",
    intro:
      "Professora Ines: orcamento e escolha. Junte os pedidos da comunidade: fale com o Vovo Alberto e com o Gari Bento.",
    objective: "Colete os pedidos do Vovo Alberto e do Gari Bento para a praca.",
    targets: ["Vovo Alberto", "Gari Bento"],
    testimonies: {
      "Vovo Alberto":
        "Vovo Alberto: gosto de sentar na praca, mas os bancos estao quebrados e a luz nao acende a noite.",
      "Gari Bento":
        "Gari Bento: sem verba de manutencao, a limpeza e a poda ficam sempre para depois.",
    },
    doneLine: "Professora Ines: otimo. Prioridade se decide com dados e transparencia, nunca no grito.",
    grants: "orcamento_cidade:testemunho",
    star: true,
  },
  {
    id: "sq_hospital",
    missionId: "hospital_regional",
    giver: "Dona Vera",
    intro:
      "Dona Vera: aqui chega gente de muitas cidades. Converse com o Seu Otavio e com o Jovem Rui para entender.",
    objective: "Ouca o Seu Otavio e o Jovem Rui sobre o hospital regional.",
    targets: ["Seu Otavio", "Jovem Rui"],
    testimonies: {
      "Seu Otavio":
        "Seu Otavio: venho de uma cidade vizinha; nossa unidade nao faz cirurgia, entao todos vem para ca.",
      "Jovem Rui":
        "Jovem Rui: um hospital que atende varias cidades nao pode depender de um municipio so.",
    },
    doneLine: "Dona Vera: agora voce entendeu: problema de varios municipios pede uma solucao maior.",
    grants: "hospital_regional:testemunho",
    star: true,
  },
  {
    id: "sq_rodovia",
    missionId: "rodovia_estadual",
    giver: "Caminhoneiro Zeca",
    intro:
      "Caminhoneiro Zeca: essa estrada liga cidades do estado inteiro. Fale com a Motorista Cida e com o Feirante Tino sobre o desvio.",
    objective: "Ouca a Motorista Cida e o Feirante Tino sobre a rodovia interditada.",
    targets: ["Motorista Cida", "Feirante Tino"],
    testimonies: {
      "Motorista Cida":
        "Motorista Cida: o desvio me faz rodar duas horas a mais por dia. Isso encarece tudo.",
      "Feirante Tino":
        "Feirante Tino: minha mercadoria chega estragada por causa da estrada esburacada.",
    },
    doneLine: "Caminhoneiro Zeca: viu o tamanho do estrago? Estrada entre cidades e caso para o estado.",
    grants: "rodovia_estadual:testemunho",
    star: true,
  },
  {
    id: "sq_lei",
    missionId: "lei_federal",
    giver: "Estudante Bruno",
    intro:
      "Estudante Bruno: por que uma lei precisa valer para o pais todo? Pergunte ao Professor Nabuco e a Ativista Rosa.",
    objective: "Ouca o Professor Nabuco e a Ativista Rosa sobre leis nacionais.",
    targets: ["Professor Nabuco", "Ativista Rosa"],
    testimonies: {
      "Professor Nabuco":
        "Professor Nabuco: certos direitos precisam ser iguais em todo o territorio; por isso viram lei federal.",
      "Ativista Rosa":
        "Ativista Rosa: recolhemos assinaturas do pais inteiro. Agora a proposta precisa do caminho certo.",
    },
    doneLine: "Estudante Bruno: entao ficou claro onde uma lei nacional nasce e e aprovada.",
    grants: "lei_federal:testemunho",
    star: true,
  },
  {
    id: "sq_politica",
    missionId: "politica_nacional",
    giver: "Servidora Dinah",
    intro:
      "Servidora Dinah: um programa nacional so vale se sair do papel. Converse com o Analista Ivo e com a Cidada Marli.",
    objective: "Ouca o Analista Ivo e a Cidada Marli sobre o programa nacional.",
    targets: ["Analista Ivo", "Cidada Marli"],
    testimonies: {
      "Analista Ivo":
        "Analista Ivo: a lei existe e ha orcamento; falta executar o programa em todo o pais.",
      "Cidada Marli":
        "Cidada Marli: quero ver o programa chegando na ponta, com respeito as regras.",
    },
    doneLine: "Servidora Dinah: isso. Executar dentro da lei e do orcamento e o papel do Executivo federal.",
    grants: "politica_nacional:testemunho",
    star: true,
  },
];

export const SIDEQUESTS_BY_ID: Record<string, SideQuest> = Object.fromEntries(
  SIDEQUESTS.map((sq) => [sq.id, sq]),
);

export const SIDEQUESTS_BY_GIVER: Record<string, SideQuest> = Object.fromEntries(
  SIDEQUESTS.map((sq) => [sq.giver, sq]),
);

export const SIDEQUESTS_BY_MISSION: Record<string, SideQuest> = Object.fromEntries(
  SIDEQUESTS.map((sq) => [sq.missionId, sq]),
);

export function sidequestForTarget(name: string): SideQuest[] {
  return SIDEQUESTS.filter((sq) => sq.targets.includes(name));
}
