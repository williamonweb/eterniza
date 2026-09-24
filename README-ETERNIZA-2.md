# Eterniza 2.0 — integração na base existente

Este projeto usa o Next.js, Prisma, PostgreSQL e Asaas do ZIP original. Os arquivos do módulo Eterniza Pets para clínicas, suas APIs e a imagem promocional permanecem intactos. O banner Pets da página inicial foi movido sem alterar seu conteúdo nem suas regras CSS. O editor clássico e as páginas antigas continuam disponíveis.

## Novo fluxo

Home → criar → tipo → história → datas → fotos → música → prévia → planos → PIX → publicação → compartilhamento. O cadastro é opcional. A criação salva um rascunho na tabela `Tribute` existente, com `content.builderVersion = '2.0'`. Não exige migração do banco.

Acesso rápido após login: `/minhas-paginas`. O rascunho é vinculado ao usuário autenticado, carregado no servidor por ID com verificação de propriedade e atualizado automaticamente. O link público novo é `/p/[slug]`; links antigos em `/presente/[slug]` continuam aceitos, inclusive para páginas 2.0.

O pagamento usa as rotas Asaas já existentes e seus dados de ambiente. O PIX depende de `DATABASE_URL` e da configuração Asaas do domínio real; não há pagamento simulado. A página só aparece publicamente depois do status `PUBLISHED` confirmado pelo webhook ou pela consulta de status.

## Rodar

1. Configure as variáveis em `.env.example` conforme o ambiente do domínio (sem adicionar segredos ao ZIP).
2. Execute `npm ci` e `npm run build`.
3. Para desenvolvimento, execute `npm run dev` com acesso ao PostgreSQL configurado.
4. Aplique os arquivos no repositório Git que alimenta o domínio e faça o deploy pelo fluxo atual.

As fotos do novo editor são comprimidas no navegador e guardadas no JSON `Tribute.content`, seguindo a persistência já usada pelo editor clássico. Imagens em grande quantidade ainda dependem dos limites de requisição e armazenamento do seu ambiente; uma futura migração para storage de objetos é recomendável antes de uso em alto volume.

## Identidade visual atualizada

O Eterniza normal usa o logo claro enviado e oito fotografias criadas especificamente para os oito tipos de página, todas no formato 3:2 dos cards. A Home tem fotografias próprias para desktop e celular. Os cards mostram a imagem completa, sem recortar fotografias de outras categorias. O logo escuro enviado fica disponível como `public/normal/logo-escuro.png` para usos futuros em fundo escuro; o módulo Eterniza Pets permanece com os mesmos arquivos da base original.

## CMS e exemplo na Home

Em `/admin`, Configurações → Landing → Home Eterniza 2.0 controla selo, título, descrição, botão e visibilidade de categorias e passos. O banner do Eterniza Pets continua presente. A seção “Hero da página clássica” conserva os campos antigos, que não editam a nova Home. A lista de páginas no painel mostra a categoria 2.0 e só oferece link público para páginas publicadas; os planos e pagamentos continuam gerenciados pelo painel existente.

Para exibir uma página real como exemplo, publique uma página criada no fluxo 2.0, informe seu slug em “Link da página publicada (slug)”, ative “Mostrar página real de exemplo” e salve. A Home valida a publicação antes de exibi-la. Por padrão, essa seção fica desligada. Os três cards dos passos usam imagens do próprio projeto e representam visualmente a escolha do tipo, o preenchimento da história e o compartilhamento.

## Criação sem cadastro, QR e material impresso

O fluxo novo pode começar sem conta: tipo → história → data → fotos → música → prévia → plano → PIX. O rascunho é salvo no banco após a escolha do tipo e o navegador recebe um cookie seguro de acesso por 30 dias. Dados ainda não enviados ao banco ficam neste navegador. Para pagar sem conta, a pessoa informa nome, e-mail e CPF; não é criada uma senha. Uma conta técnica interna vincula o rascunho e o pagamento às tabelas atuais sem mexer no módulo Pets. Se trocar de navegador ou limpar os dados antes da publicação, não há recuperação automática desse rascunho; acesso por e-mail exige uma etapa futura de verificação de identidade e envio de mensagens.

O QR mostrado na tela do PIX serve somente para pagar. Após a confirmação pelo Asaas, a página pública apresenta o link, o QR Code da própria página, envio manual pelo WhatsApp e um botão para baixar uma folha A4 em PDF com imagem, QR, endereço da página e convite do Eterniza. Um PIX pendente pode ser retomado no mesmo navegador. A operação real depende das variáveis `DATABASE_URL`, `AUTH_SECRET` e da integração Asaas configuradas no ambiente. Não há envio automático de e-mail nesta versão.
