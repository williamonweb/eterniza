# Eterniza V55 — Autenticação real

## O que mudou

- Login e cadastro agora usam Prisma + bcrypt.
- Sessão real via cookie HttpOnly `eterniza_session`.
- Middleware protege `/admin`, `/dashboard` e `/criar`.
- APIs principais de autenticação e tributos foram migradas para usuário logado real.
- O painel admin não depende mais de `localStorage` para autorizar acesso.

## Antes de rodar

Crie/atualize seu `.env` local com:

```env
DATABASE_URL="sua-url-do-neon"
AUTH_SECRET="uma-chave-grande-e-aleatoria-com-mais-de-32-caracteres"
```

> Importante: como a URL do banco já foi exposta na conversa, gere uma nova senha/connection string no Neon quando possível.

## Comandos

```powershell
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

## Login admin

```text
E-mail: jeslie@eterniza.com
Senha: eterniza123
```

## Fluxo para testar

1. Acessar `/cadastro` e criar uma conta cliente.
2. Confirmar redirecionamento para `/criar`.
3. Criar uma homenagem e confirmar autosave.
4. Fazer logout.
5. Entrar com `jeslie@eterniza.com`.
6. Confirmar acesso ao `/admin`.
7. Tentar acessar `/admin` com usuário cliente e verificar redirecionamento para `/dashboard`.
