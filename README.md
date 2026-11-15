# Eclipse — Site da lista candidata à AE do Externato de Penafirme

Website multipágina, estático e sem _build step_, para a lista **Eclipse** às eleições da
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
├─ index.html              # Início: herói com o dia de votação, vídeos, manifesto, assistente do programa, equipa, notícias
├─ sobre.html              # História, princípios, como trabalhamos
├─ programa.html           # 12 propostas em 3 áreas (comunicação; desporto, eventos e convívio; aprendizagem e bem-estar)
├─ equipa.html             # Candidatos e organização
├─ membros.html            # Dirigentes por órgão (nome e função)
├─ noticias.html           # Notícias, agenda de eventos, newsletter
├─ galeria.html            # Vídeos de apoio + fotografias (campanha, bastidores, membros) com lightbox
├─ contactos.html           # Formulário de contacto + contactos + transparência
├─ patrocinadores.html      # Patrocinadores e apoios da lista
├─ patrocinador-01..08.html # Página de cada patrocinador (negócio, contactos, links, apoio)
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
   ├─ js/config.js          # Dia de votação (texto, abertura e fecho das urnas)
   ├─ js/site.js            # Interações, animações + consentimento de cookies
   └─ img/
      ├─ eclipse-logo.png   # Logótipo (recortado, fundo transparente)
      ├─ eclipse-logo.svg · eclipse-logo-ink.svg · eclipse-mark.svg   # Logótipo e símbolo vetoriais
      ├─ pattern-dark.svg · pattern-light.svg · pattern-sun.svg     # Padrão de estrelas da marca
      ├─ fotos/             # Fotografias com licença aberta (ver «Imagens e ícones»)
      ├─ eclipse-square.png # Versão quadrada (ícones e medalhão)
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
| Domínio (`https://eclipsepenafirme.pt/`) | `canonical`/`og:url` em todos os `.html`, `sitemap.xml`, `robots.txt`, JSON-LD |
| E-mail da lista (`eclipse.extp@gmail.com`) | footer de todas as páginas, `contactos.html`, `privacidade.html` |
| Destino dos formulários | `action` de todos os `<form>` (FormSubmit) + `privacidade.html` |
| Instagram (`@eclipse.penafirme`) | footer, `contactos.html`, JSON-LD |
| Patrocinadores e páginas de cada um | `patrocinadores.html` + `patrocinador-01..08.html` |
| Nomes/dados da equipa | `equipa.html` |
| Membros (nome, ano, curso, função, frase, email) | `membros.html` |
| Fotos dos membros | `assets/img/membros/01..24.svg` |
| Propostas do programa | `programa.html` |
| Notícias e eventos | `noticias.html`, `assets/img/noticia-*.svg`, `evento-*.svg` |
| Datas da campanha e da votação (texto, agenda e contagem decrescente) | `assets/js/config.js` (e os textos de reserva nos `.html`) |
| Cookies/finalidades (RGPD) | `privacidade.html` |

Para alterar menus/footer em todas as páginas de uma vez, edite o bloco comum em cada
ficheiro (não há sistema de templates — é HTML estático).

---

## Design system

Definido como variáveis CSS no topo de `assets/css/styles.css`.

**Cores** — saem do logótipo e do eclipse: noite, céu e sol.

| Variável | Valor | Uso |
|---|---|---|
| `--ink` / `--ink-2` / `--ink-3` | `#060a1f` / `#0c1330` / `#18234f` | Noite: texto e secções escuras |
| `--paper` / `--paper-2` / `--white` | `#f3f7fb` / `#e3ecf6` / `#fcfdff` | Fundos claros |
| `--sky` / `--sky-2` | `#b8e4f8` / `#93d2f3` | O azul do logótipo |
| `--blue` / `--blue-deep` | `#1d4fd7` / `#1339a9` | Destaque sobre fundo claro |
| `--sun` / `--sun-2` | `#ffc533` / `#ffd666` | O sol: botões e chamadas |

**Tipografia** (alojada no próprio site, em `assets/fonts/`, licença SIL OFL 1.1; com fallback para _system fonts_)

- **Archivo** (largura e peso variáveis) — títulos largos em itálico e texto corrido

---

## Funcionalidades

- **Header** fixo transparente sobre o hero; fica sólido ao rolar e esconde-se ao descer.
- **Navegação mobile** (<1100px) em ecrã inteiro, fecha com `Esc`; barra de ação fixa no telemóvel.
- **Dia de votação** centralizado em `assets/js/config.js`, com contagem decrescente no herói
  (desaparece sozinha depois do fecho das urnas).
- **Assistente do programa** na página inicial: escolhe-se um tema e aparece a área com as propostas.
- **Vidro e luz**: painéis translúcidos (`backdrop-filter`, com alternativa sólida) sobre a fotografia
  do eclipse e discos de luz; cabeçalho que passa a barra de vidro flutuante ao descer.
- **Campanha**: botão para partilhar o site com a turma e para pôr o dia de votação no calendário (`.ics`).
- **Animações**: títulos linha a linha, entradas em cascata, números que contam, manifesto que
  acende com o scroll, fases do eclipse nos passos, transição entre páginas. Tudo abranda ou
  desliga com `prefers-reduced-motion`, e o conteúdo fica visível com JS desligado.
- **Galeria de fotografias** com filtro (Todas · Campanha · Bastidores · Membros) e lightbox (fecha com
  `Esc` e clique no fundo). Fotografias em `assets/fotosgaleria/`; o modelo de cada bloco está num
  comentário em `galeria.html`.
- **Vídeos de apoio** na galeria (`galeria.html#videos`), em formato vertical. Para pôr um vídeo:
  copiar o MP4 (e uma capa `.jpg` com o mesmo nome) para `assets/videossuporte/`, de preferência
  com menos de 50 MB, tirar do comentário a linha `<video …>` de um cartão vazio e trocar
  «Vídeo de apoio» / «Em breve.» pelo nome e por quem é. Só toca um vídeo de cada vez.
- **FAQ** com `<details>` nativos (abre uma pergunta de cada vez).
- **Consentimento de cookies** real (categorias: essenciais, medição, preferências),
  guardado em `localStorage` na chave `eclipse.consent.v1`. Reabertura via links `[data-open-cookie]`.
- **Formulários** (contacto + newsletter em todas as páginas) enviados por `fetch` para o
  **FormSubmit** (`action="https://formsubmit.co/ajax/b27be4651bf7003b8eaa9fe9e6ee7276"`), que
  encaminha cada mensagem para `eclipse.extp@gmail.com`. Usa-se o **alias** (string aleatória) em
  vez do email exposto, por privacidade/anti-spam. Validação client-side + estados de envio/erro.
  ⚠️ Requer **ativação** (uma só vez): no primeiro envio a FormSubmit mostra uma página/email com
  «Activate Form» — clicar nesse link. O alias pertence a `eclipse.extp@gmail.com`; para mudar o
  destino, faça um novo envio de teste e substitua o alias/email no `action` de todos os `<form>`.

---

## Imagens e ícones

Os SVGs são arte original da marca. As fotografias em `assets/img/fotos/` vêm do Wikimedia Commons
e estão creditadas junto de cada imagem:

- `eclipse-anel-de-diamante*.jpg` — eclipse total de 21/08/2017, NASA/Aubrey Gemignani (domínio público)
- `externato-de-penafirme.jpg` — Vitor Oliveira, CC BY-SA 2.0
- `seminario-de-penafirme.jpg` — Peter Gpetr, CC BY 3.0

Para trocar imagens, substitua os ficheiros mantendo as proporções:

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

### Publicar alterações

```powershell
git add -A
git commit -m "Descrição curta da alteração"
git push origin main
```

---

## Verificação

Testado localmente: todas as páginas e recursos respondem `200`, sem ligações quebradas,
sem `id`s duplicados, sem erros de consola JavaScript.
