# Forge Labs 2.0 — versão sem banco

Site institucional da Forge Labs pronto para GitHub e Vercel, sem CMS, banco de dados ou variáveis de ambiente.

## O que está incluído

- Home, Serviços, Projetos, Sobre, Contato, FAQ, Termos e Privacidade.
- Página individual automática para cada projeto em `/projetos/[slug]`.
- Cards e imagens dos projetos publicados abrem os domínios oficiais em uma nova aba. O botão “Ver projeto” abre o case dentro da Forge Labs.
- Imagens locais para as capturas dos projetos.
- Conteúdo dos projetos em um único arquivo: `lib/site-data.ts`.

## Rodar no computador

Use Node.js 20 ou mais recente. Na pasta do projeto, execute:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Não é necessário criar `.env`, configurar Neon ou executar comandos de banco.

## Adicionar um projeto

1. Abra `lib/site-data.ts`.
2. Dentro de `projects`, copie um dos blocos existentes.
3. Preencha `slug`, nome, textos, módulos, cor, imagem e link.
4. Coloque a captura em `public/projects` e informe o caminho, por exemplo `/projects/meu-projeto.jpg`.
5. Use `featured: true` para mostrar o projeto na Home ou `featured: false` para deixá-lo apenas na página de projetos.

Exemplo:

```ts
{
  slug: "meu-projeto",
  index: "06",
  name: "Meu Projeto",
  category: "Site institucional",
  phrase: "Uma frase curta para o projeto.",
  summary: "Resumo usado nos cards e na página do projeto.",
  challenge: "O desafio que precisava ser resolvido.",
  solution: "Como a Forge construiu a solução.",
  modules: ["Site", "Contato", "SEO"],
  color: "#c9622d",
  image: "/projects/meu-projeto.jpg",
  website: "https://www.meuprojeto.com.br/",
  websiteLabel: "meuprojeto.com.br",
  featured: false,
},
```

Ao salvar, o projeto aparece automaticamente em `/projetos` e ganha a página `/projetos/meu-projeto`.

## Publicar na Vercel

1. Envie todos os arquivos para o seu repositório no GitHub.
2. Importe o repositório na Vercel.
3. Não adicione variáveis de ambiente.
4. Faça o deploy.

## Atualizar o site

Edite os arquivos, teste localmente e envie a alteração:

```bash
npm run build
git add .
git commit -m "Atualiza projetos"
git push
```

A Vercel publica a nova versão automaticamente quando o repositório está conectado.
