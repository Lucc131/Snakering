# Snakering

Jogo da cobrinha classico em **HTML, CSS e JavaScript**, com tema adaptado para cobranca: no lugar de frutas, a cobra coleta **notas de dinheiro**.

## Demo

- Repositorio: https://github.com/Lucc131/Snakering
- GitHub Pages (quando habilitado): https://lucc131.github.io/Snakering/

## Features

- Gameplay estilo Snake classico.
- Item de coleta em formato de dinheiro (`$`).
- Pontuacao em valor monetario (`R$ 100` por coleta).
- Aumento progressivo de velocidade.
- Recorde salvo no navegador com `localStorage`.
- Interface moderna com:
  - Tailwind CSS (CDN)
  - GSAP para animacoes fluidas

## Estrutura

```text
Snaker files/
├── index.html          # redireciona para o jogo
├── html/
│   └── index.html      # pagina principal do jogo
├── css/
│   └── style.css       # estilo visual
└── js/
    └── game.js         # logica do jogo
```

## Como rodar localmente

1. Abra a pasta `Snaker files`.
2. Execute o arquivo `index.html` (raiz) no navegador.
3. Ou abra direto `html/index.html`.

## Controles

- `Setas` ou `WASD`: mover
- `Espaco`: reiniciar quando perder

## Publicacao no GitHub Pages

1. No GitHub, abra `Settings` do repositorio.
2. Em `Pages`, selecione:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
3. Salve e aguarde a URL de publicacao.

## Licenca

Uso livre para estudo e customizacao.
