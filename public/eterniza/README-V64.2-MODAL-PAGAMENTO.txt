ETERNIZA v64.2 - MODAL DE RECEBIMENTO

Alterações:
- O botão "Marcar pago" foi substituído por "Receber".
- Ao clicar, abre modal personalizado para confirmar o pagamento.
- Formas disponíveis: PIX, cartão de crédito, cartão de débito, dinheiro,
  transferência bancária, boleto e outro.
- Campo de data do pagamento.
- Campo opcional de observações.
- A forma escolhida aparece na listagem e no recibo.
- A API valida forma e data antes de liberar o recibo.

Banco de dados:
- Não houve alteração no schema.prisma.
- Não é necessária uma nova migration para esta atualização.
