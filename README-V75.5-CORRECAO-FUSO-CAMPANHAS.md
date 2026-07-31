# Eterniza v7.5.5 — Correção de fuso das campanhas

## Problema corrigido
O campo `datetime-local` enviava data e hora sem fuso. Na Vercel, o valor era interpretado em UTC, podendo deixar a campanha fora do período ativo por três horas e fazer `/api/marketing/campaign` retornar `campaign: null`.

## Correção
- Datas digitadas no painel são interpretadas como horário de Brasília (`-03:00`).
- Ao editar uma campanha, as datas são exibidas em `America/Sao_Paulo`.
- A API pública informa também o horário do servidor para facilitar diagnóstico.

## Após atualizar
Abra a campanha existente, confirme que ela está habilitada e clique em **Salvar campanha** novamente. Isso grava as datas antigas com o fuso correto.

Para ativação imediata, também é possível deixar os campos Início e Fim vazios.
