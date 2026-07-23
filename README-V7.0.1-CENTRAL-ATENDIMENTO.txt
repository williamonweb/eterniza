ETERNIZA V7.0.1 — CENTRAL DE ATENDIMENTO

IMPLEMENTADO
- Botão flutuante "Precisa de ajuda?" em todo o site público.
- Abertura de chamado com nome, telefone, e-mail, assunto e mensagem.
- Código sequencial automático: AT-000001, AT-000002...
- Token privado armazenado no navegador para o cliente acompanhar o chamado.
- Conversa cliente/admin com atualização automática a cada 5 segundos.
- Nova aba "Atendimentos" no painel administrativo.
- Filtros: todos, novos, em atendimento, aguardando cliente e encerrados.
- Contadores por status e quantidade de mensagens não lidas.
- Resposta pelo painel da Jeslie.
- Status do chamado e opção de reabrir.
- Modal de confirmação antes de encerrar.
- Mensagem automática: "Chamado AT-XXXXXX encerrado".
- Chamado encerrado fica somente para leitura no cliente.
- Registro da página do site onde o chamado foi aberto.

ATUALIZAÇÃO DO BANCO
Após substituir/publicar o projeto, execute uma das opções:

Produção com migrations:
  npx prisma migrate deploy

Desenvolvimento/local:
  npx prisma generate
  npx prisma migrate dev

Em projeto que ainda não usa migrations:
  npx prisma db push
  npx prisma generate

ARQUIVOS PRINCIPAIS
- components/support/SupportWidget.js
- components/support/SupportAdmin.js
- app/api/support/tickets/*
- app/api/admin/support/tickets/*
- lib/support.js
- prisma/schema.prisma
- prisma/migrations/20260723190000_support_center_v701/migration.sql

OBSERVAÇÃO
A atualização das conversas usa polling seguro de 5/6 segundos, compatível com Vercel e sem servidor WebSocket adicional.
