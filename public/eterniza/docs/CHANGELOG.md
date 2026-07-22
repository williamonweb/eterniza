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

## v63.0.1 - Módulo Equipe estabilizado

- Implementado gerenciamento de integrantes da clínica com perfis, permissões, ativação e redefinição de senha.
- Corrigida hidratação do CSS inline do painel Pets usando `dangerouslySetInnerHTML` estável entre servidor e cliente.
- Bloqueado acesso de usuários desativados nas rotas do painel, experiências e identificação da clínica.
- Protegida a administração de outros gestores para que somente gestores possam alterá-los.
- Ajustado o indicador da equipe para contabilizar somente integrantes ativos.

## v63.1.0 - Configurações da clínica

- Nova área de Configurações integrada ao painel Eterniza Pets.
- Edição de dados institucionais, contatos, endereço e responsável.
- Identidade visual com logotipo, cor principal, assinatura e prévia.
- Preferências de marca Eterniza e chamada final das experiências.
- Consulta do pacote contratado em modo somente leitura.
- Alteração segura da própria senha com validação da senha atual.
- Controle de visualização e edição pelas permissões `settings.view` e `settings.manage`.
