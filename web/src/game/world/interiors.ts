// Portado 1:1 de src/world/interiors.py

export interface InteriorItem {
  name: string;
  x: number;
  y: number;
  kind: string;
  text: string;
  grants: string;
}

export interface InteriorNPC {
  name: string;
  role: string;
  x: number;
  y: number;
  greeting: string;
  mission?: string;
  extraLine: string;
  tint: [number, number, number];
}

export interface Interior {
  key: string;
  title: string;
  theme: string;
  npcs: InteriorNPC[];
  items: InteriorItem[];
  floor: [number, number, number];
  wall: [number, number, number];
}

function inpc(
  name: string,
  role: string,
  x: number,
  y: number,
  greeting: string,
  opts: Partial<Pick<InteriorNPC, "mission" | "extraLine" | "tint">> = {},
): InteriorNPC {
  return {
    name,
    role,
    x,
    y,
    greeting,
    mission: opts.mission,
    extraLine: opts.extraLine ?? "",
    tint: opts.tint ?? [255, 255, 255],
  };
}

function reception(name: string, giverRole: string, tint: [number, number, number]): InteriorNPC {
  return inpc(name, "Recepcionista", 980, 350, `Bem-vinda! O(a) ${giverRole} atende ali no salao.`, {
    extraLine: "Use a mesa da recepcao como referencia e sinta-se a vontade.",
    tint,
  });
}

export function buildInteriors(): Record<string, Interior> {
  return {
    camara: {
      key: "camara",
      title: "CAMARA MUNICIPAL",
      theme: "chamber",
      npcs: [
        inpc("Caio Bairro", "Vereador", 560, 420, "Bem-vinda a Camara! Aqui debatemos e fiscalizamos.", { mission: "saude_bairro", tint: [255, 235, 200] }),
        inpc("Assessor Paulo", "Assessor", 360, 440, "Ajudo o vereador a preparar projetos de lei.", { extraLine: "Cada projeto e estudado antes de virar lei.", tint: [200, 210, 255] }),
        inpc("Servidora Ana", "Servidora", 760, 440, "Organizo os documentos das sessoes.", { extraLine: "A transparencia depende de bons registros.", tint: [210, 255, 220] }),
        reception("Recepcao Bia", "vereador", [255, 210, 230]),
      ],
      items: [
        { name: "Livro de Leis Municipais", x: 220, y: 300, kind: "book", text: "LEI ORGANICA (resumo): a saude basica e servico do municipio. O vereador propoe leis e fiscaliza; o prefeito executa as obras e servicos.", grants: "saude_bairro:lei" },
        { name: "Mural de Propostas", x: 430, y: 300, kind: "board", text: "Propostas de lei ficam expostas para a populacao acompanhar e opinar.", grants: "" },
      ],
      floor: [74, 64, 52],
      wall: [48, 42, 36],
    },
    prefeitura: {
      key: "prefeitura",
      title: "PREFEITURA",
      theme: "office",
      npcs: [
        inpc("Marina Prado", "Prefeita", 560, 420, "Bem-vinda a Prefeitura! Aqui executamos os servicos da cidade.", { mission: "orcamento_cidade", tint: [255, 245, 210] }),
        inpc("Secretario Rui", "Secretario", 360, 440, "Cuido da secretaria de servicos urbanos.", { extraLine: "Cada secretaria executa uma area do municipio.", tint: [200, 220, 255] }),
        inpc("Servidor Leo", "Servidor", 760, 440, "Atendo pedidos da populacao no protocolo.", { extraLine: "O cidadao pode acompanhar seus pedidos.", tint: [220, 235, 200] }),
        reception("Recepcao Ivo", "prefeito", [255, 215, 180]),
      ],
      items: [
        { name: "Orcamento Municipal", x: 220, y: 300, kind: "book", text: "LEI ORCAMENTARIA (resumo): o gasto publico segue um orcamento aprovado por lei, com prioridades, metas e prestacao de contas a populacao.", grants: "orcamento_cidade:lei" },
        { name: "Painel de Servicos", x: 430, y: 300, kind: "board", text: "Saude, educacao e transporte municipais sao coordenados a partir daqui.", grants: "" },
      ],
      floor: [70, 66, 54],
      wall: [46, 42, 34],
    },
    saude: {
      key: "saude",
      title: "UNIDADE DE SAUDE",
      theme: "clinic",
      npcs: [
        inpc("Dra. Marta", "Medica", 560, 420, "Bem-vinda a unidade! Aqui a populacao recebe atendimento.", { extraLine: "A saude basica e responsabilidade principal do municipio.", tint: [240, 250, 255] }),
        inpc("Enf. Davi", "Enfermeiro", 760, 440, "Faco triagem e cuidados de enfermagem.", { extraLine: "A equipe de saude trabalha em conjunto.", tint: [210, 245, 255] }),
        inpc("Atendente Lu", "Atendente", 360, 440, "Organizo as fichas e o agendamento.", { extraLine: "O atendimento comeca na recepcao.", tint: [255, 220, 220] }),
        reception("Recepcao Sara", "medico", [200, 235, 240]),
      ],
      items: [
        { name: "Cartaz do SUS", x: 220, y: 300, kind: "board", text: "O SUS organiza a saude publica; o municipio cuida da atencao basica.", grants: "" },
        { name: "Prontuario", x: 430, y: 300, kind: "book", text: "Prontuarios registram o cuidado do paciente com sigilo.", grants: "" },
      ],
      floor: [70, 82, 84],
      wall: [48, 58, 60],
    },
    assembleia: {
      key: "assembleia",
      title: "ASSEMBLEIA ESTADUAL",
      theme: "chamber",
      npcs: [
        inpc("Lia Campos", "Deputada Estadual", 560, 420, "Bem-vinda a Assembleia! Aqui legislamos para todo o estado.", { mission: "hospital_regional", tint: [255, 235, 245] }),
        inpc("Assessora Val", "Assessora", 360, 440, "Preparo estudos sobre os projetos estaduais.", { extraLine: "Leis estaduais respeitam a Constituicao Federal.", tint: [220, 210, 255] }),
        inpc("Servidor Ciro", "Servidor", 760, 440, "Registro as votacoes das sessoes.", { extraLine: "Cada voto fica registrado publicamente.", tint: [210, 220, 240] }),
        reception("Recepcao Sol", "deputado estadual", [235, 210, 255]),
      ],
      items: [
        { name: "Constituicao Estadual", x: 220, y: 300, kind: "book", text: "CONSTITUICAO ESTADUAL (resumo): o estado responde por servicos regionais, como hospitais de referencia que atendem varios municipios, respeitando a Constituicao Federal.", grants: "hospital_regional:lei" },
        { name: "Mapa Regional", x: 430, y: 300, kind: "board", text: "Hospitais de referencia atendem varios municipios e sao responsabilidade estadual.", grants: "" },
      ],
      floor: [66, 60, 74],
      wall: [42, 38, 48],
    },
    governo: {
      key: "governo",
      title: "PALACIO DO GOVERNO",
      theme: "office",
      npcs: [
        inpc("Raul Nogueira", "Governador", 560, 420, "Bem-vinda! Daqui comando o Executivo do estado.", { mission: "rodovia_estadual", tint: [220, 225, 255] }),
        inpc("Secretaria Bel", "Secretaria", 360, 440, "Coordeno a secretaria de infraestrutura.", { extraLine: "Rodovias estaduais sao responsabilidade do estado.", tint: [210, 230, 255] }),
        inpc("Assessor Gil", "Assessor", 760, 440, "Acompanho as agendas do governador.", { extraLine: "O Executivo estadual executa politicas do estado.", tint: [200, 215, 245] }),
        reception("Recepcao Nara", "governador", [225, 235, 255]),
      ],
      items: [
        { name: "Mapa de Rodovias", x: 220, y: 300, kind: "book", text: "CLASSIFICACAO DAS RODOVIAS: rodovias estaduais (que ligam cidades do estado) sao do governo estadual; rodovias federais sao da Uniao.", grants: "rodovia_estadual:lei" },
        { name: "Plano de Governo", x: 430, y: 300, kind: "board", text: "O governador executa politicas estaduais dentro do orcamento aprovado.", grants: "" },
      ],
      floor: [64, 66, 78],
      wall: [40, 42, 52],
    },
    congresso: {
      key: "congresso",
      title: "CONGRESSO NACIONAL",
      theme: "chamber",
      npcs: [
        inpc("Helena Norte", "Senadora", 560, 420, "Bem-vinda ao Congresso! Camara e Senado criam as leis do pais.", { mission: "lei_federal", tint: [255, 240, 205] }),
        inpc("Deputado Alan", "Deputado Federal", 360, 440, "Represento o povo na Camara dos Deputados.", { extraLine: "A Camara representa o povo; o Senado, os estados.", tint: [220, 230, 255] }),
        inpc("Consultor Ed", "Consultor", 760, 440, "Dou apoio tecnico as votacoes.", { extraLine: "Uma lei federal passa por Camara e Senado.", tint: [230, 220, 200] }),
        reception("Recepcao Theo", "senador", [240, 225, 200]),
      ],
      items: [
        { name: "Regimento do Congresso", x: 220, y: 300, kind: "book", text: "PROCESSO LEGISLATIVO (resumo): uma lei federal precisa ser aprovada pelas duas casas do Congresso Nacional: a Camara dos Deputados e o Senado.", grants: "lei_federal:lei" },
        { name: "Painel de Votacoes", x: 430, y: 300, kind: "board", text: "A Camara representa o povo; o Senado representa os estados.", grants: "" },
      ],
      floor: [76, 70, 54],
      wall: [48, 44, 34],
    },
    planalto: {
      key: "planalto",
      title: "PALACIO DO PLANALTO",
      theme: "office",
      npcs: [
        inpc("Lucio Silva", "Presidente", 560, 420, "Bem-vinda ao Planalto! Aqui fica o Executivo federal.", { mission: "politica_nacional", tint: [225, 230, 255] }),
        inpc("Ministra Rosa", "Ministra", 360, 440, "Coordeno uma pasta do governo federal.", { extraLine: "Ministerios executam politicas nacionais por area.", tint: [230, 215, 255] }),
        inpc("Assessor Nei", "Assessor", 760, 440, "Organizo a agenda presidencial.", { extraLine: "O presidente age dentro da lei e do orcamento.", tint: [210, 220, 250] }),
        reception("Recepcao Cora", "presidente", [220, 230, 255]),
      ],
      items: [
        { name: "Constituicao Federal", x: 220, y: 300, kind: "book", text: "CONSTITUICAO FEDERAL (resumo): e a lei maior do pais. O presidente executa politicas nacionais dentro das leis e do orcamento aprovados pelo Congresso.", grants: "politica_nacional:lei" },
        { name: "Agenda Nacional", x: 430, y: 300, kind: "board", text: "O presidente executa politicas nacionais, sempre dentro da lei e do orcamento.", grants: "" },
      ],
      floor: [66, 68, 80],
      wall: [42, 44, 54],
    },
  };
}

export function giverOf(interior: Interior): InteriorNPC {
  for (const npc of interior.npcs) {
    if (npc.mission) return npc;
  }
  return interior.npcs[0];
}
