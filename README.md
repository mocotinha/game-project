# Aurora: Quem Decide?

Vertical slice de um game 2D de educação política, desenvolvido com Python Arcade.

O protótipo apresenta uma praça de Aurora do Brasil, movimentação top-down, personagens fictícios, diálogos e uma missão sobre a responsabilidade municipal por uma unidade de saúde.

## Executar

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m src.main
```

Controles:

- Setas ou `WASD`: mover
- `E` ou `Enter`: conversar/interagir
- `Esc`: sair
- `M`: ligar/desligar áudio

O jogo funciona sem assets externos. Sons e músicas licenciados do Envato devem ser adicionados somente após o registro em `docs/asset-registry.md`.

## Apresentações

O projeto web em [presentation](./presentation) reúne quatro apresentações na
mesma interface: protótipo, game design, narrativa e personagens, e visão
conceitual e agentes. A quarta apresentação conecta a perspectiva geral do jogo
a agentes racionais, estratégicos, sociais (agência coletiva multiobjetivo) e
orientados por valores parcialmente ordenados, conforme a aula de Flavio Soares
Correa da Silva de 02/10/2024. Integra também narratologia, estrutura em três
atos e narrativas no jogo/sobre o jogo, do material de Ricardo Nakamura (2026).
Os slides indicam as fontes e distinguem os conceitos das aulas, suas aplicações
a Aurora e as propostas de evolução ainda não implementadas.
A quarta apresentação tem 14 slides, incluindo a perspectiva do projetista do
jogo: definição de ambiente e regras, percepções e ações, objetivos individuais
e coletivos, valores e consequências. O slide distingue quem constrói o modelo
de quem age dentro dele e identifica as propostas de evolução.
Relaciona também cada escolha de projeto aos impactos esperados no jogador e
às contribuições potenciais à sociedade, explicitamente tratados como hipóteses
a validar, com cuidados de acessibilidade, fidelidade e prevenção de vieses.

Para abrir, execute `npm run dev` na pasta `presentation` e acesse
`http://localhost:8443`. Selecione a apresentação na capa; navegue pelos botões,
pelos indicadores de slide ou pelas setas do teclado (espaço também avança).

## Verificar conexão com o Envato

O projeto lê `ENVATO_URL` do `.env` e testa somente a conectividade pública, sem enviar usuário ou senha:

```powershell
.\.venv\Scripts\python.exe tools\check_envato.py
```

Para catálogo ou download automatizado, use uma API oficial do Envato com token próprio. Não use `ENVATO_USER` e `ENVATO_PASSWORD` para scraping ou login automático.
