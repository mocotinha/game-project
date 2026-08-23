# Aurora: Quem Decide? — Resumo do Projeto

> Jogo 2D educativo sobre educação política e cidadania, desenvolvido em Python com a biblioteca Arcade.
> Personagens e acontecimentos são fictícios. Conteúdo educativo e não partidário.

---

## 1. Resumo do jogo

**Aurora: Quem Decide?** é um jogo 2D *top-down* de educação política. O jogador acompanha
Joana, uma personagem que acabou de se mudar para a cidade fictícia de **Aurora do Brasil** e
percebe que muita gente reclama de problemas locais, mas quase ninguém sabe **quem** tem o poder
de resolver cada um deles.

Explorando a cidade, Joana conversa com quem ocupa cada cargo público, recebe missões e aprende,
na prática, as atribuições e os limites de vereador, prefeito, deputado estadual, governador,
deputado federal, senador e presidente.

O jogo está estruturado em três etapas que acompanham os níveis de governo:

| Etapa | Nível | Foco |
|-------|-------|------|
| 1 — O Município | Municipal | Serviços locais do dia a dia: saúde básica, escolas municipais, transporte urbano |
| 2 — O Estado | Estadual | Ações regionais: hospitais de referência, rodovias estaduais, segurança pública |
| 3 — A União | Federal | Assuntos nacionais: leis federais, políticas do país, relações entre os estados |

### Mecânicas principais

- **Movimentação e exploração** *top-down* pela cidade (setas ou `WASD`).
- **Diálogos e missões** com NPCs que representam cargos públicos; cada missão apresenta um
  problema e pergunta de múltipla escolha sobre **qual nível de governo é responsável**.
- **Side quests** com moradores: ouvir testemunhos da comunidade concede provas e estrelas,
  reforçando a participação social como parte da decisão pública.
- **Diário de Cidadania**: registro consultável com a descrição do que cada cargo *faz* e o que
  *não faz*, além de um resumo por nível de governo.
- **Sistema de provas** (problema, testemunho e lei) que embasa a resposta correta de cada missão.
- Sistema de **salvamento** (múltiplos slots) e **configurações** (áudio, tela cheia).

### Enredo em síntese

Ao percorrer os três níveis de governo, Joana entende que decisões públicas dependem de
**competência, orçamento, leis e participação** — e passa a saber a quem cobrar cada assunto.

---

## 2. Objetivos

### Objetivo pedagógico

Ensinar, de forma interativa, as **atribuições e os limites** dos cargos eletivos brasileiros
(vereador, prefeito, deputado estadual, governador, deputado federal, senador e presidente),
apresentando também orçamento público, fiscalização, participação social e cooperação entre os
níveis de governo.

### Objetivos de aprendizagem

Ao final de cada capítulo, o jogador deve ser capaz de:

1. **Relacionar** corretamente um problema ao nível de governo responsável (município, estado ou União).
2. **Explicar** ao menos uma atribuição do cargo envolvido.
3. **Distinguir** os papéis do Legislativo (criar leis e fiscalizar) e do Executivo (administrar e executar).
4. Reconhecer que **políticas públicas envolvem escolhas, limites e consequências**, dentro da lei e do orçamento.

### Princípios editoriais

- Personagens, nomes, vozes e falas são **fictícios**.
- Não há partido, pedido de voto ou reprodução de evento político real.
- Toda missão informa o **nível de governo** relacionado ao problema.
- O conteúdo deve ser revisado com fontes oficiais e exibir a data de atualização.

---

## 3. Ligação e justificativa frente aos ODS

O jogo dialoga diretamente com a **Agenda 2030** da ONU e seus **Objetivos de Desenvolvimento
Sustentável (ODS)**. A educação política e cidadã é uma alavanca transversal: cidadãos que
entendem "quem decide o quê" fiscalizam melhor, participam mais e cobram políticas públicas
eficazes — condição para o avanço de praticamente todos os ODS.

### ODS diretamente contemplados

- **ODS 16 — Paz, Justiça e Instituições Eficazes** *(central)*
  Meta **16.6** (instituições eficazes, responsáveis e transparentes) e **16.7** (tomada de decisão
  responsiva, inclusiva e participativa). O jogo ensina como as instituições funcionam, o papel da
  fiscalização e da prestação de contas, e como a participação social influencia a decisão pública.

- **ODS 4 — Educação de Qualidade** *(central)*
  Meta **4.7**, que trata de assegurar que os estudantes adquiram conhecimentos para promover a
  **cidadania global e o desenvolvimento sustentável**. O jogo é, em si, uma ferramenta de educação
  cidadã interativa.

- **ODS 11 — Cidades e Comunidades Sustentáveis**
  Meta **11.3** (urbanização inclusiva e participativa e gestão participativa). As missões giram em
  torno de problemas urbanos concretos (saúde no bairro, praça, transporte, orçamento municipal) e de
  como a comunidade participa das decisões da cidade.

- **ODS 17 — Parcerias e Meios de Implementação**
  A narrativa reforça a **cooperação entre níveis de governo** (município, estado e União) para
  resolver problemas que ultrapassam uma única fronteira administrativa.

### ODS contemplados de forma temática (pano de fundo das missões)

- **ODS 3 — Saúde e Bem-Estar**: missões sobre unidade de saúde no bairro e hospital regional.
- **ODS 10 — Redução das Desigualdades**: testemunhos da comunidade destacam acesso a serviços
  públicos como questão de dignidade e igualdade.
- **ODS 9 — Indústria, Inovação e Infraestrutura**: missões sobre rodovias e infraestrutura estadual.

### Justificativa

A baixa compreensão sobre a divisão de competências entre os poderes e os níveis de governo
enfraquece o controle social e a qualidade da democracia. Ao transformar esse conteúdo em uma
experiência lúdica, acessível e não partidária, o projeto contribui para **formar cidadãos capazes
de identificar responsabilidades, cobrar de forma correta e participar** — exatamente o tipo de
capital cívico que sustenta instituições eficazes (ODS 16) e o alcance dos demais objetivos da
Agenda 2030.

---

## 4. Tecnologias utilizadas

### Linguagem e bibliotecas

- **Python 3** — linguagem principal do projeto.
- **[Arcade](https://api.arcade.academy/) `>=3.0,<4.0`** — biblioteca de jogos 2D (janela, renderização,
  sprites, entrada de teclado, áudio e sistema de *views*).
- **[pytest](https://docs.pytest.org/) `>=8.0,<9.0`** — testes automatizados (ex.: `tests/test_mission_rules.py`).

### Organização do código (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `main.py` | Ponto de entrada; cria a janela e carrega o menu principal |
| `config.py` | Constantes de tela, mapa, física e paleta de cores |
| `assets.py` / `modular.py` / `citytiles.py` | Carregamento e composição de sprites e tiles |
| `audio.py` | Gerenciamento de som e música |
| `rules.py` | Regras/validação das missões |
| `save_manager.py` | Salvamento em JSON e configurações |
| `ui.py` | Componentes de interface |
| `content/` | Conteúdo educativo: `missions.py`, `roles.py`, `problems.py`, `sidequests.py` |
| `views/` | Telas do jogo: menu, novo jogo, mundo, diário, pausa, créditos, etc. |
| `world/` | Ambientes internos (`interiors.py`) |

### Assets

- **[Kenney](https://kenney.nl/)** — pacotes gráficos sob licença **Creative Commons Zero (CC0 1.0)**:
  Pixel Vehicle Pack, Roguelike Modern City, Roguelike Characters, Modular Characters, Tiny Town e UI Pack.
  Todos registrados em [docs/asset-registry.md](asset-registry.md).
- O jogo **funciona sem assets externos de áudio**; sons/músicas licenciados (Envato) só devem ser
  adicionados após o registro em [docs/asset-registry.md](asset-registry.md).

### Ferramentas e armazenamento

- **`saves/`** — progresso e configurações persistidos em **JSON**.
- **`tools/check_envato.py`** — verifica apenas a conectividade pública com o Envato (sem login/scraping).
- **`.venv`** — ambiente virtual Python isolado.

### Como executar

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m src.main
```

Controles: setas ou `WASD` (mover), `E`/`Enter` (interagir), `M` (áudio), `Esc` (sair).

---

## 5. Referências

### Documentação técnica

- Python Arcade — Documentação oficial: <https://api.arcade.academy/>
- pytest — Documentação oficial: <https://docs.pytest.org/>
- Python — Documentação oficial: <https://docs.python.org/3/>

### Assets

- Kenney — Biblioteca de assets CC0: <https://kenney.nl/>
- Creative Commons Zero (CC0 1.0): <https://creativecommons.org/publicdomain/zero/1.0/>

### Objetivos de Desenvolvimento Sustentável (ODS)

- ONU — Agenda 2030 e os 17 ODS: <https://brasil.un.org/pt-br/sdgs>
- ODS 4 (Educação de Qualidade): <https://brasil.un.org/pt-br/sdgs/4>
- ODS 11 (Cidades e Comunidades Sustentáveis): <https://brasil.un.org/pt-br/sdgs/11>
- ODS 16 (Paz, Justiça e Instituições Eficazes): <https://brasil.un.org/pt-br/sdgs/16>
- ODS 17 (Parcerias e Meios de Implementação): <https://brasil.un.org/pt-br/sdgs/17>

### Conteúdo cívico (fontes oficiais sugeridas para revisão)

- Constituição da República Federativa do Brasil de 1988: <https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm>
- Câmara dos Deputados — Portal: <https://www.camara.leg.br/>
- Senado Federal — Portal: <https://www12.senado.leg.br/>

### Documentos internos do projeto

- [docs/game-design.md](game-design.md) — Design e objetivo pedagógico
- [docs/asset-registry.md](asset-registry.md) — Registro e licenças dos assets
- [README.md](../README.md) — Instruções de execução

---

*Documento gerado como resumo do projeto acadêmico (USP). Conteúdo educativo, fictício e não partidário.*
