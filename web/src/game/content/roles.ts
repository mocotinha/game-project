// Portado 1:1 de src/content/roles.py

export interface RoleInfo {
  title: string;
  level: string;
  does: string;
  not: string;
}

export const ROLE_INFO: Record<string, RoleInfo> = {
  vereador: {
    title: "Vereador",
    level: "Municipio",
    does: "Cria leis municipais e fiscaliza a prefeitura.",
    not: "Nao executa obras nem administra servicos sozinho.",
  },
  prefeito: {
    title: "Prefeito",
    level: "Municipio",
    does: "Administra e executa os servicos da cidade e o orcamento municipal.",
    not: "Nao cria leis sozinho nem responde por assuntos de outros municipios.",
  },
  deputado_estadual: {
    title: "Deputado Estadual",
    level: "Estado",
    does: "Cria leis estaduais e fiscaliza o governo do estado.",
    not: "Nao executa politicas nem administra o estado.",
  },
  governador: {
    title: "Governador",
    level: "Estado",
    does: "Chefia o Executivo estadual e executa politicas do estado.",
    not: "Nao legisla sozinho nem administra cidades diretamente.",
  },
  deputado_federal: {
    title: "Deputado Federal",
    level: "Uniao",
    does: "Representa o povo na Camara e ajuda a criar leis federais.",
    not: "Nao executa politicas do Executivo federal.",
  },
  senador: {
    title: "Senador",
    level: "Uniao",
    does: "Representa os estados no Senado e ajuda a criar leis federais.",
    not: "Nao administra o pais nem substitui o presidente.",
  },
  presidente: {
    title: "Presidente",
    level: "Uniao",
    does: "Chefia o Executivo federal e executa politicas nacionais.",
    not: "Nao cria leis sozinho nem administra cada cidade.",
  },
};

export const ROLE_ORDER = [
  "vereador",
  "prefeito",
  "deputado_estadual",
  "governador",
  "deputado_federal",
  "senador",
  "presidente",
];

export const LEVEL_SUMMARY: [string, string][] = [
  ["Municipio", "Servicos locais do dia a dia: saude basica, escolas municipais, transporte urbano."],
  ["Estado", "Acoes regionais: hospitais de referencia, rodovias estaduais, seguranca publica."],
  ["Uniao", "Assuntos nacionais: leis federais, politicas do pais, relacoes entre os estados."],
];
