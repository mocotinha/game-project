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

## Verificar conexão com o Envato

O projeto lê `ENVATO_URL` do `.env` e testa somente a conectividade pública, sem enviar usuário ou senha:

```powershell
.\.venv\Scripts\python.exe tools\check_envato.py
```

Para catálogo ou download automatizado, use uma API oficial do Envato com token próprio. Não use `ENVATO_USER` e `ENVATO_PASSWORD` para scraping ou login automático.
