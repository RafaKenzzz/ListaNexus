# Nexus — Site da lista candidata à AE do Externato de Penafirme

Website multipágina, estático e sem _build step_, para a lista **Nexus** às eleições da
Associação de Estudantes do Externato de Penafirme.

> **Nota:** este é um site de campanha estudantil e **não** é o site oficial do Externato
> de Penafirme. Alguns dados (equipa, datas, métricas) são de demonstração.

---

## Como correr localmente

Não precisa de instalar nada. Duas opções:

**1. Abrir diretamente**

Dê duplo clique em `index.html`. Funciona, mas alguns navegadores bloqueiam `fetch`/módulos
em `file://` — para ter a experiência completa use um servidor.

**2. Servidor local (recomendado)**

```powershell
# Python 3
python -m http.server 8080

# ou Node (npx)
npx serve .
```

Depois abra <http://localhost:8080>.

---

## Estrutura

```
listaae/
├─ index.html              # Início: hero, manifesto, eixos, números, notícias, CTA
├─ sobre.html              # História, princípios, como trabalhamos
├─ programa.html           # 8 eixos × 5 propostas, com prazos
├─ equipa.html             # Candidatos e organização
├─ membros.html            # Roster completo dos 24 membros (foto, ano, curso, função, email)
├─ noticias.html           # Notícias, agenda de eventos, newsletter
├─ galeria.html            # Grelha de 12 itens + lightbox
├─ contactos.html          # Formulário (demo) + contactos + transparência
├─ faq.html                # Perguntas frequentes (accordions) + JSON-LD FAQPage
├─ privacidade.html        # Política de privacidade / RGPD (Lei 58/2019)
├─ termos.html             # Termos de utilização
├─ 404.html                # Página de erro
├─ favicon.ico
├─ site.webmanifest        # Nome, ícones e cores da app
├─ robots.txt
├─ sitemap.xml
└─ assets/
   ├─ css/styles.css        # Design system completo (variáveis, componentes)
   ├─ js/site.js            # Interações + consentimento de cookies
   └─ img/
      ├─ nexuslogo.png      # Logótipo original
      ├─ nexus-mark.png     # Marca com fundo transparente (usada no site)
      ├─ nexus-mark-dark.png
      ├─ og-image.png       # Imagem de partilha (1200×630)
      ├─ favicon-16.png · favicon-32.png · apple-touch-icon.png · icon-192.png · icon-512.png
      ├─ noticia-01..06.svg · evento-01..02.svg
      ├─ galeria/01..12.svg
      └─ membros/01..24.svg   # Retratos-placeholder (substituir por fotos reais)
```

---

## Onde editar conteúdo

Os números de telefone/e-mail, morada e nomes são **placeholders**. Procure e substitua:

| O quê | Onde |
|---|---|
| Domínio (`https://nexuspenafirme.pt/`) | `canonical`/`og:url` em todos os `.html`, `sitemap.xml`, `robots.txt`, JSON-LD |
| E-mails (`contacto@`, `imprensa@`, `privacidade@`) | `contactos.html`, `privacidade.html`, footer de todas as páginas |
| Instagram (`@nexus.penafirme`) | footer, `contactos.html`, JSON-LD |
| Nomes/dados da equipa | `equipa.html` |
| Membros (nome, ano, curso, função, frase, email) | `membros.html` |
| Fotos dos membros | `assets/img/membros/01..24.svg` |
| Propostas do programa | `programa.html` |
| Notícias e eventos | `noticias.html`, `assets/img/noticia-*.svg`, `evento-*.svg` |
| Data das eleições e métricas | `index.html`, `sobre.html`, `faq.html` |
| Cookies/finalidades (RGPD) | `privacidade.html` |

Para alterar menus/footer em todas as páginas de uma vez, edite o bloco comum em cada
ficheiro (não há sistema de templates — é HTML estático).

---

## Design system

Definido como variáveis CSS no topo de `assets/css/styles.css`.

**Cores**

| Variável | Valor | Uso |
|---|---|---|
| `--ink` | `#070c22` | Fundo escuro principal |
| `--ink-2` / `--ink-3` | `#0b1430` / `#122048` | Superfícies escuras |
| `--sky` / `--sky-2` | `#7ec1e8` / `#a9d8f0` | Azul de destaque |
| `--blue` / `--blue-deep` | `#2c6ba6` / `#1a4a79` | Azuis de apoio |
| `--ochre` / `--ochre-2` | `#e0a53e` / `#f0c466` | Realce (acento quente) |
| `--clay` | `#b9542f` | Acento terroso |
| `--paper` / `--paper-2` / `--paper-3` | `#f4f0e7` / `#ece5d7` / `#ded5c2` | Fundos claros |

**Tipografia** (Google Fonts, com fallback para _system fonts_)

- **Outfit** — títulos
- **Manrope** — texto
- **Space Mono** — etiquetas / números

---

## Funcionalidades

- **Header** fixo transparente sobre o hero; fica sólido ao rolar.
- **Navegação mobile** (<1024px) com botão toggle, fecha com `Esc`.
- **Revelação ao scroll** via `IntersectionObserver` (desativa com JS desligado).
- **Galeria** com lightbox (fecha com `Esc` e clique no fundo).
- **FAQ** com accordions acessíveis (`aria-expanded`/`aria-controls`).
- **Consentimento de cookies** real (categorias: essenciais, medição, preferências),
  guardado em `localStorage` na chave `nexus.consent.v1`. Reabertura via links `[data-open-cookie]`.
- **Formulários** de demonstração: marque `data-demo` no `<form>`; o JS valida e mostra
  mensagem, sem enviar (ligue ao seu backend quando existir).

---

## Imagens e ícones

Todos os SVGs são arte original da marca (sem _stock_). Para trocar por fotografias reais,
substitua os ficheiros mantendo as proporções:

- `assets/img/galeria/*.svg` — 800×800
- `assets/img/noticia-*.svg`, `evento-*.svg` — 1200×675
- `og-image.png` — 1200×630 (partilha em redes sociais)
- `favicon.ico` + PNGs de ícone — para regenerar, extraia quadrados do logótipo.

---

## SEO, acessibilidade e deploy

- **SEO:** metas `description` + Open Graph por página, `canonical`, `sitemap.xml`,
  `robots.txt`, dados estruturados JSON-LD (`Organization` e `FAQPage`).
- **Acessibilidade:** ligação "saltar para conteúdo", `aria-current` na página ativa,
  foco visível, textos alternativos, suporte a `prefers-reduced-motion`.
- **Deploy:** sendo estático, publique a pasta em qualquer serviço —
  Netlify, Vercel, GitHub Pages, Cloudflare Pages. Não requer configuração especial.
- **Site publicado:** https://rafakenzzz.github.io/ListaNexus/ (GitHub Pages, branch `main`).
  Qualquer `git push` para `main` atualiza o site automaticamente em ~1 minuto.

---

## Verificação

Testado localmente: todas as páginas e recursos respondem `200`, sem ligações quebradas,
sem `id`s duplicados, sem erros de consola JavaScript.
