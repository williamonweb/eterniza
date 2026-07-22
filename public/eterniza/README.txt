ETERNIZA V53 - NEON + AUTOSAVE

1) Copie .env.example e crie um arquivo chamado .env.local
2) Cole sua DATABASE_URL do Neon no .env.local
3) Rode:
   npm.cmd install --registry=https://registry.npmjs.org/
   npm.cmd run dev
4) Abra http://localhost:3000

Nesta versão:
- Login e cadastro usam o banco Neon.
- Usuário admin padrão:
  email: jeslie@eterniza.com
  senha: eterniza123
- Cliente comum entra em /criar.
- Ao montar a homenagem, o rascunho salva automaticamente no Neon.
- O painel admin começa a puxar homenagens reais do banco.

IMPORTANTE:
A DATABASE_URL não foi colocada no ZIP por segurança. Crie o arquivo .env.local localmente.
Antes de publicar, gere uma nova senha no Neon porque a string foi compartilhada no chat.
