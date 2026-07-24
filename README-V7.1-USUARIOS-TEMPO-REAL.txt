ETERNIZA v7.1 - USUÁRIOS DO PAINEL + ATENDIMENTO EM TEMPO REAL

O que foi incluído:

1. Nova área "Usuários do painel"
- Criação de usuários administrativos pelo próprio painel.
- Perfis: Super Admin, Administrador e Atendente.
- Bloqueio e reativação de acessos.
- Redefinição de senha.
- Registro do último acesso.
- Usuário bloqueado perde o acesso mesmo com sessão antiga.

2. Atendimento em tempo real
- Cliente recebe respostas sem aguardar o polling de 5 segundos.
- Painel recebe chamados e mensagens em fluxo contínuo via SSE.
- Reconexão automática pelo navegador.
- Indicador visual "ao vivo" no painel e no chat.

3. Banco de dados
- Nenhuma migration nova é necessária.
- O recurso usa os campos permissions, isActive e lastLoginAt que já existem no model User.

PASSOS PARA PUBLICAR

1. Substitua os arquivos do projeto pelos desta versão.
2. Execute:
   npm install
   npx prisma generate
   npm run build
3. Se o build concluir:
   git add .
   git commit -m "v7.1 usuarios do painel e atendimento em tempo real"
   git push origin main

COMO CRIAR O USUÁRIO DO WILLIAM

1. Entre no painel com a conta administrativa atual.
2. Abra "Usuários do painel".
3. Clique em "+ Novo usuário".
4. Informe nome, e-mail, senha e selecione "Super Admin".
5. Saia e teste o novo acesso.

OBSERVAÇÃO SOBRE PERFIS ANTIGOS

Usuários ADMIN que ainda não possuem adminLevel salvo em permissions são tratados como Super Admin para não bloquear o painel existente. Depois, os perfis podem ser ajustados na nova tela.
