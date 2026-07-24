ETERNIZA — CORREÇÃO CENTRAL DE ATENDIMENTO V7.0.1

CORREÇÃO APLICADA
- SupportAdmin.js e SupportWidget.js agora verificam se scrollIntoView existe antes de chamá-lo.
- O erro ocorria após uma nova mensagem alterar a conversa. O efeito de rolagem automática era executado nos dois lados e podia gerar TypeError: n is not a function em navegadores onde o método não estivesse disponível.
- Mantidas as proteções para senderType, senderName, text e createdAt.

BANCO NEON
As tabelas de suporte ainda precisam ser criadas no banco de produção. A migration já está em:
prisma/migrations/20260723190000_support_center_v701/migration.sql

Antes de publicar ou no ambiente conectado ao Neon, execute uma vez:
npm run prisma:deploy

Depois faça o deploy normal:
git add .
git commit -m "Corrige chat e aplica central de atendimento"
git push origin main

Tabelas esperadas no Neon:
- SupportSequence
- SupportTicket
- SupportMessage
