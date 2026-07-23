ETERNIZA V69 — WHATSAPP PERSONALIZADO + FATURAS DA CLÍNICA

1. Links públicos do Eterniza Pets agora usam metadados personalizados:
   - Título: “🐾 Uma homenagem para [nome do pet]”
   - Descrição: “Clique para abrir esta homenagem especial preparada com muito carinho. ❤️”
   - Imagem Open Graph dinâmica 1200x630 com foto do pet, nome e identidade da clínica.

2. Painel da clínica ganhou a aba “Faturas”:
   - Faturas em aberto, vencidas, pagas e canceladas
   - Valores, competência, vencimento, data e forma de pagamento
   - Indicadores financeiros
   - Recibo disponível apenas nas faturas pagas

3. Nova API protegida:
   /api/pets/invoices

4. Nova rota de recibo da clínica:
   /pets/faturas/[id]/recibo

Não há alteração no schema Prisma nesta atualização, pois ClinicInvoice já existia.

Após publicar, o WhatsApp pode manter a prévia antiga em cache durante algum tempo. Links novos ou slugs novos normalmente exibem a nova prévia imediatamente.
