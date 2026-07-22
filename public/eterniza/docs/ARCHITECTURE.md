# Arquitetura da Eterniza

## Stack
- Next.js 14
- React 18
- Prisma 6.10.1
- PostgreSQL Neon
- bcrypt
- Vercel

## Autenticação V55

Fluxo:

```text
Login/Cadastro
  ↓
API Auth
  ↓
Prisma User
  ↓
bcrypt
  ↓
Cookie HttpOnly eterniza_session
  ↓
Middleware
  ↓
Rotas protegidas
```

## Rotas protegidas
- `/admin`
- `/dashboard`
- `/criar`

## Permissões
- `ADMIN`: acesso ao painel administrativo.
- `CLIENT`: acesso ao painel cliente e criação de homenagens.

## Banco
O Prisma passa a ser a camada oficial de acesso ao banco para autenticação e tributos.
