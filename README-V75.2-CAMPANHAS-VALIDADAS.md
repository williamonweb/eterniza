# Eterniza v7.5.2 — Campanhas integradas à landing

## Integração concluída

- Menu **Marketing** no painel administrativo.
- CRUD de campanhas com permissão administrativa `marketing`.
- Upload local da imagem promocional, compressão e conversão para WEBP no navegador.
- Campanha ativa substitui título, destaque, descrição, botão, cor e imagem do hero da landing `/`.
- Banner superior opcional.
- Período automático por data inicial/final.
- Prioridade para resolver campanhas simultâneas.
- Retorno automático ao hero padrão quando não houver campanha válida.
- Rotas marcadas como dinâmicas para impedir cache indevido na Vercel.
- Validação de intervalo de datas e slug.

## Banco

Execute em produção:

```bash
npx prisma migrate deploy
```

A migration está em:

`prisma/migrations/20260731163000_add_marketing_campaigns/migration.sql`

## Validação local

```bash
npm install
npx prisma generate
npm run build
```

O ambiente usado para montar este pacote não conseguiu instalar `xtend@4.0.2` por indisponibilidade do registry interno. Por isso, o build deve ser executado localmente antes do Git. As rotas JavaScript foram verificadas com `node --check`.
