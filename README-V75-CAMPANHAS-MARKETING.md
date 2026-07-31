# Eterniza v7.5 — Campanhas e Datas Especiais

## O que foi adicionado

- Novo menu **Marketing** no painel administrativo.
- CRUD de campanhas: criar, editar, duplicar, ativar/desativar e excluir.
- Tipos prontos: Dia dos Pais, Dia das Mães, Dia dos Namorados, Natal, Ano Novo, Black Friday, promoção e personalizada.
- Agendamento por data e hora de início/fim.
- Prioridade quando mais de uma campanha estiver válida.
- Hero dinâmico com badge, título, destaque, descrição, botão, imagem e cor.
- Banner superior opcional com texto, botão e link.
- Retorno automático à landing padrão quando não existir campanha válida.
- API pública `/api/marketing/campaign`.
- API administrativa `/api/admin/marketing/campaigns`.

## Banco de dados

Foi criada a migration:

`prisma/migrations/20260731163000_add_marketing_campaigns/migration.sql`

Antes do primeiro deploy, execute:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

Na Vercel, a migration precisa ser aplicada ao mesmo `DATABASE_URL` do projeto. Ela pode ser executada localmente com as variáveis de produção carregadas ou incluída temporariamente no Build Command:

```bash
npx prisma migrate deploy && npm run build
```

Depois que a migration estiver aplicada, o Build Command pode voltar para `npm run build`.

## Uso

1. Entre em `/admin` com um SUPER_ADMIN.
2. Abra **Marketing**.
3. Clique em **Nova campanha**.
4. Configure período, prioridade e conteúdo.
5. Marque **Campanha habilitada**.
6. Salve.

A landing seleciona a campanha habilitada, dentro do período e com maior prioridade.

## Imagens

O campo de imagem aceita caminho público do próprio projeto, por exemplo:

`/eterniza/assets/campanhas/dia-dos-pais.jpg`

Também aceita uma URL HTTPS externa. O módulo não adiciona um novo serviço de upload para evitar interferir no fluxo de uploads já existente.


## Atualização: upload de imagem promocional

O editor de campanhas agora possui upload direto da imagem do hero:

- clique para selecionar ou arraste a imagem;
- aceita JPG, PNG e WEBP de até 12 MB;
- redimensiona para no máximo 1800 x 1200;
- converte e comprime automaticamente em WEBP;
- mostra prévia;
- permite trocar ou remover antes de salvar.

A imagem otimizada é armazenada no próprio registro da campanha, sem exigir Cloudinary, Supabase Storage ou Vercel Blob.
