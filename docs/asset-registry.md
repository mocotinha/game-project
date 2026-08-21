# Registro de assets

## Kenney — Pixel Vehicle Pack (CC0)

- Autor: Kenney (www.kenney.nl)
- Licenca: Creative Commons Zero (CC0 1.0)
- URL: https://kenney.nl/assets/pixel-vehicle-pack
- Download: https://kenney.nl/media/pages/assets/pixel-vehicle-pack/570a4c9051-1677578609/kenney_pixel-vehicle-pack.zip
- Data de aquisicao: 2026-08-20
- Uso no jogo: pessoas (homem/mulher com quadros de caminhada) para o jogador e NPCs; veiculos laterais nas ruas; e mobiliario (semaforos, placas, barreiras).
- Local: `assets/kenney/pixel-vehicle-pack/`
- Modificacoes: nenhuma; NPCs recebem leve tingimento (`sprite.color`) para variedade.

## Kenney — Roguelike Characters (CC0)

- Autor: Kenney (www.kenney.nl)
- Licenca: Creative Commons Zero (CC0 1.0)
- URL: https://kenney.nl/assets/roguelike-characters
- Download: https://kenney.nl/media/pages/assets/roguelike-characters/53ffff4133-1729196490/kenney_roguelike-characters.zip
- Data de aquisicao: 2026-08-20
- Uso no jogo: nao utilizado atualmente — pessoas passaram a vir do Pixel Vehicle Pack. Codigo mantido em `src/assets.py` (`roguelike_pair`).
- Local: `assets/kenney/roguelike-characters/`
- Modificacoes: nenhuma no arquivo; fatiado em tempo de execucao.

## Kenney — Tiny Town (CC0)

- Autor: Kenney (www.kenney.nl)
- Licenca: Creative Commons Zero (CC0 1.0)
- URL: https://kenney.nl/assets/tiny-town
- Download: https://kenney.nl/media/pages/assets/tiny-town/a415fbeb49-1735736916/kenney_tiny-town.zip
- Data de aquisicao: 2026-08-20
- Uso no jogo: reservado para tiles de cidade top-down (integracao futura).
- Local: `assets/kenney/tiny-town/`
- Modificacoes: nenhuma.

## Kenney — Modular Characters (CC0)

- Autor: Kenney (www.kenney.nl)
- Licenca: Creative Commons Zero (CC0 1.0)
- URL: https://kenney.nl/assets/modular-characters
- Download: https://kenney.nl/media/pages/assets/modular-characters/d84577feef-1677670340/kenney_modular-characters.zip
- Data de aquisicao: 2026-08-20
- Uso no jogo: nao utilizado atualmente — substituido pelos Roguelike Characters (pixel), que combinam com a cidade. Codigo mantido em `src/modular.py`.
- Local: `assets/kenney/modular-characters/`
- Modificacoes: nenhuma nos arquivos originais; personagens compostos em tempo de execucao.

## Kenney — Roguelike Modern City (CC0)

- Autor: Kenney (www.kenney.nl)
- Licenca: Creative Commons Zero (CC0 1.0)
- URL: https://kenney.nl/assets/roguelike-modern-city
- Download: https://kenney.nl/media/pages/assets/roguelike-modern-city/0ff3dfff2b-1677694743/kenney_roguelike-modern-city.zip
- Data de aquisicao: 2026-08-20
- Uso no jogo: cidade top-down em tiles 16x16 — chao (grama/rua/calcada), telhados dos predios (nine-slice em `src/citytiles.py`), arvores, decoracao urbana e veiculos. O tileset e lido de `Tilemap/tilemap_packed.png`.
- Local: `assets/kenney/roguelike-modern-city/`
- Modificacoes: nenhuma nos originais; telhados compostos e memorizados em `assets/kenney/_generated/`.

## Kenney — UI Pack (CC0)

- Autor: Kenney (www.kenney.nl)
- Licenca: Creative Commons Zero (CC0 1.0)
- URL: https://kenney.nl/assets/ui-pack
- Download: https://kenney.nl/media/pages/assets/ui-pack/f651646eab-1718203990/kenney_ui-pack.zip
- Data de aquisicao: 2026-08-20
- Uso no jogo: paineis e botoes 9-slice em menus, caixas de texto e missoes (`src/ui.py`).
- Local: `assets/kenney/ui-pack/`
- Modificacoes: nenhuma nos originais; um painel escuro (`_generated/ui_panel_dark.png`) e gerado recolorindo `Grey/Default/button_rectangle_border.png` para casar com o tema.

## Recursos internos do Arcade

- Texturas de vegetacao, caixas e placas via `:resources:` (tambem de origem Kenney, CC0).
- Sons e musica via `:resources:sounds` e `:resources:music`.

## Observacoes

- CC0 permite uso pessoal, educacional e comercial; creditar o Kenney e recomendado, nao obrigatorio.
- Os arquivos `.zip` originais ficam em `assets/kenney/_zips/` e sao ignorados pelo Git.
- Antes de adicionar assets do Envato (ou outros), registrar autor, URL, data, licenca, comprovante e modificacoes.
