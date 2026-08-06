# Eterniza v7.5.0 — Relatórios

## Painel administrativo Eterniza
- Nova aba Relatórios.
- Filtro: hoje, 7 dias, 30 dias e período personalizado.
- Receita, ticket médio, clientes, homenagens, visualizações e atendimento.
- Gráfico de receita por dia.
- Ranking de vendas por plano.
- Tabela de pagamentos.
- Exportação CSV e impressão/Gerar PDF.

## Painel Eterniza Pets
- Aba Relatórios deixa de exibir “Em breve”.
- Dados isolados por clínica logada.
- Experiências, publicadas, rascunhos, visualizações, equipe e faturas.
- Gráfico por dia, ranking por tipo e por integrante.
- Tabela detalhada de experiências.
- Exportação CSV e impressão/Gerar PDF.

## Banco
Nenhuma migration nova.

## Teste local
1. Copie/confira o `.env`.
2. `npm install`
3. `npx prisma generate`
4. `npm run dev`
5. Teste `/admin` > Relatórios.
6. Teste `/pets/painel` > Relatórios.
7. Teste filtros, PDF e CSV.
8. Execute `npm run build` antes do Git.
