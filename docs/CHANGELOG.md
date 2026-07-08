# Changelog

## V55 — Autenticação real

### Alterado
- Login e cadastro migrados para Prisma.
- Senhas padronizadas com bcrypt.
- Sessão real com cookie HttpOnly.
- Middleware protegendo `/admin`, `/dashboard` e `/criar`.
- APIs de tributos migradas para sessão real em vez de autenticação por e-mail enviado no body.

### Removido da autenticação
- Dependência de `localStorage` para controlar perfil de usuário.
- Uso de SQL manual (`lib/db.js`) nas rotas de autenticação.
- Controle de admin por chave editável no navegador.

### Preparado
- Base para autosave, upload, pagamentos e analytics usando usuário logado real.
