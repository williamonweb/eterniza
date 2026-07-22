ETERNIZA v64.1 - FINANCEIRO E RECIBOS DO ETERNIZA PETS

IMPLEMENTADO
- Nova aba "Financeiro Pets" no painel administrativo.
- Mensalidade vinculada à clínica, não à quantidade de homenagens.
- Valor personalizado por clínica.
- Competência mensal, vencimento e observações.
- Status Pendente, Pago, Atrasado e Cancelado.
- Confirmação manual de pagamento por PIX.
- Número único de recibo.
- Recibo profissional para impressão ou salvamento em PDF.
- Histórico e indicadores financeiros.

ANTES DE ABRIR O PROJETO
Execute no terminal, dentro da pasta do projeto:

npx prisma migrate deploy
npx prisma generate
npm run dev

Em desenvolvimento local, também pode usar:

npx prisma migrate dev

COMO USAR
1. Entre no painel /admin.
2. Abra "Financeiro Pets".
3. Clique em "+ Nova mensalidade".
4. Escolha a clínica, competência, valor e vencimento.
5. Clique em "Marcar pago" quando o pagamento for recebido.
6. Clique em "Recibo" para abrir o documento.
7. Use "Imprimir / Salvar PDF" no navegador.

IMPORTANTE
O recibo só é liberado para mensalidades com status PAGO.
