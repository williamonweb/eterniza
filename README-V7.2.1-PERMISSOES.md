# Eterniza v7.2.1 — Permissões por módulo

## Implementado
- Permissões individuais por usuário administrativo.
- Perfis Super Admin, Administrador e Atendente com padrões seguros.
- Modal personalizado com checkboxes por módulo.
- Menu do painel mostra somente áreas autorizadas.
- APIs administrativas validam permissões no servidor.
- Usuários antigos continuam funcionando por meio dos padrões de perfil.
- Nenhuma migration nova: utiliza o campo JSON `User.permissions` já existente.

## Módulos controlados
Dashboard, Homenagens, Clientes, Pagamentos, Planos, Analytics, Cupons,
Eterniza Pets, Atendimentos, Usuários do painel, Financeiro Pets e Configurações.

## Antes do Git
```powershell
npx prisma generate
npm run build
```

## Commit sugerido
```powershell
git add .
git commit -m "v7.2.1 permissoes por modulo"
git push origin main
```
