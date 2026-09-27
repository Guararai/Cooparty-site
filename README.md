# Cooparty-site

Página de espera do Cooparty: o wordmark "cooparty" com os dois "o" preenchendo de verde conforme o scroll.

## Comandos

```bash
npm install        # primeira vez
npm run dev        # servidor local com hot reload
npm run build      # gera a versão de produção em dist/
npm run preview    # serve dist/ localmente para conferir o build
```

Para publicar, envie o conteúdo de `dist/` para a hospedagem.

## Onde mexer

- **Cores e tamanho do wordmark:** variáveis em `:root` no início de `src/style.css`. O verde é o lime do FitMatch (`#C7F705`).
- **Quanto a página rola:** altura de `.scroll-space` em `src/style.css`.
- **Reação ao scroll:** `renderProgress` em `src/main.js` converte o `progress` da Lenis em ângulo (`--p`) para o gradiente cônico recortado em cada "o". O ponto de partida de cada "o" é o `--from` de `.o--first` e `.o--second` no CSS; `centreSweep` mede o glifo para centralizar a varredura na letra.
