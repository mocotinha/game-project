# 01 — MDA: A Formal Approach to Game Design and Game Research

**Autores:** Robin Hunicke, Marc LeBlanc, Robert Zubek
**Origem:** Game Developers Conference, San Jose (2001–2004)

## Ideia central

MDA decompõe qualquer jogo em três camadas causalmente ligadas:

- **Mechanics (Mecânicas):** os componentes do jogo no nível de dados, regras e
  algoritmos — as ações e controles oferecidos ao jogador.
- **Dynamics (Dinâmicas):** o comportamento em tempo de execução das mecânicas
  reagindo às entradas do jogador ao longo do tempo.
- **Aesthetics (Estéticas):** as respostas emocionais desejáveis evocadas no
  jogador ao interagir com o sistema.

> O designer projeta de baixo para cima (mecânica → dinâmica → estética); o
> jogador experimenta de cima para baixo (estética → dinâmica → mecânica).

## Vocabulário de estética (o que é "diversão")

Sensação, Fantasia, Narrativa, Desafio, Camaradagem (*Fellowship*),
Descoberta, Expressão e Submissão (passatempo). O objetivo é substituir a palavra
vaga "diversão" por metas emocionais concretas.

## Por que usamos

Pensar a experiência **antes** das features (design orientado à experiência) e
prever como um ajuste em uma camada se propaga para as outras. Exemplo do artigo:
o "sistema de feedback" de Monopoly mostra como uma mecânica gera uma dinâmica
(o líder pune cada vez melhor) que destrói uma estética (tensão dramática).

## Aplicação em *Aurora: Quem Decide?*

| Camada | Em nosso jogo |
|--------|---------------|
| Mecânica | Movimentação top-down, diálogo com NPCs, missão de múltipla escolha por nível de governo, coleta de provas (problema/testemunho/lei), estrelas, diário |
| Dinâmica | Investigar antes de responder; relacionar problema → nível de governo; revisitar o diário para decidir |
| Estética | **Descoberta** ("quem decide?"), **Desafio** (acertar o nível responsável), **Narrativa** (a jornada de Joana), **Expressão** cívica |

Estética-alvo primária: **Descoberta**. Mecânica-âncora: a **missão de
responsabilidade** validada em [`src/rules.py`](../../src/rules.py).
