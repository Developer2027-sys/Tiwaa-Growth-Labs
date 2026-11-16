# Tiwaa Growth Labs website

Home, services, eight service detail pages and the blog, built from the design artifact. Stack: **Rust** throughout, hosted on **Cloudflare Workers** with **Cloudflare D1** storing the leads.

## How it fits together

```
 templates/ + content/ ──tgl build (Rust)──▶ public/ (HTML + assets) ──▶ Cloudflare (static assets) ──▶ visitors
                                                  POST /api/leads ──▶ Rust Worker (wasm) ──▶ D1 (leads table)
```

- **Pages** are rendered ahead of time by a small Rust tool (`crates/site`, command `tgl`). Cloudflare serves the HTML as static files: fast, and no server code runs per page view.
- **The lead API** (`/api/leads`) is a Rust Worker (`worker/`) compiled to WebAssembly. It validates each enquiry and saves it to D1.
- **Validation** lives in one place (`crates/leads`) and is shared by the Worker and the local dev server, so local and production behave the same.

`npm run deploy` does everything: it renders `public/`, compiles the Worker and uploads both.

## Folder map

| Path | What it is |
|---|---|
| `content/site.toml` | **Phone, email, address, domain.** Edit here once and it updates everywhere |
| `content/blog.toml` | Blog posts (home "Insights" shows the first three, `/blog` shows all) |
| `content/clients.toml` | Client names and logo files (for example the "Trusted by" strip) |
| `templates/sections/home/`, `services/`, `blog/`, `shared/` | One file per page section (hero, ROI, FAQ, …) |
| `templates/sections/service/<page>/` | Sections of each service detail page (`/services/seo`, `/services/google-ads`, …) |
| `templates/layout/ld/` | Structured data (Service, FAQ, breadcrumb) for each service detail page |
| `templates/layout/` | Page shell, head, header/navbar, footer, lead popup, mobile contact bar |
| `crates/site/src/pages.rs` | **Pages:** routes, titles, meta tags, the order of sections, contact form settings |
| `crates/site/src/contact_form.rs` | Contact form fields (name, phone, budget, …) |
| `crates/site/src/brands.rs` | Client logo chips, blog cards, platform icons (Google, Meta, WhatsApp…) |
| `crates/site/src/serve.rs` | Local dev server |
| `crates/leads/` | Lead validation shared by the Worker and the dev server (with tests) |
| `worker/src/lib.rs` | **Cloudflare Worker:** `/api/leads` on D1, everything else from `public/` |
| `assets/` | CSS, JS, logos and images. Your logo files go in `assets/images/`. `css/service-page.css` and `js/service/<page>.js` are used by the service detail pages |
| `templates/sections/contact/` | The /contact page (form, office + map, clients, FAQ). Styles in `css/contact.css`, script in `js/contact.js` (the form posts to the same lead API, `form: "contact"`). Structured data in `templates/layout/contact-ld.html` |
| `templates/sections/industry/real-estate/` | The /industries/real-estate page (dashboard hero, how it works, lead-to-visit flow, services hub, project types, case study, FAQ; wrapped in `<div class="rp">`, opened in 01-hero and closed in 07-faq). Styles in `css/real-estate.css` (loaded after main.css only), script in `js/service/real-estate.js`, structured data in `templates/layout/ld/real-estate.html`. Its contact form pre-selects "Real Estate Marketing" |
| `templates/sections/shared/not-found.html` | The 404 page, shown for any unknown URL (dev server, and Cloudflare via `not_found_handling: "404-page"`). It shows the typed address, a "Did you mean" link to the closest page and a page search (`js/404.js`, `css/404.css`). When you add a page, add it to the `pages` list at the top of this template so the 404 can suggest it |
| `migrations/` | D1 table schema |
| `public/` | Generated output. Don't edit it by hand; it is rebuilt on every build |

Templates use [Jinja-style syntax](https://docs.rs/minijinja) (`{{ site.phone_display }}`, `{% for p in blog_posts %}`). Values are HTML-escaped automatically. The helpers (`url`, `asset`, `home`, `svc`, `client_logo`, `blog_card`) are listed at the top of `crates/site/src/render.rs`.

## One-time setup (Windows)

1. **Rust:** installed with rustup (GNU toolchain, plus the `wasm32-unknown-unknown` target). Add `%USERPROFILE%\.cargo\bin` to your PATH so `cargo` works in any terminal.
2. **worker-build** (Cloudflare's packaging tool): `cargo install worker-build`. It needs a C compiler once; a portable GCC is in `%USERPROFILE%\.local\winlibs\mingw64\bin`. Put that folder on the PATH for that one command.
3. **Node packages:** `npm install` (Wrangler).

`%USERPROFILE%\.cargo\config.toml` points Rust at LLVM's `dlltool` (`.cargo\tools\llvm-dlltool.exe`), because the GNU one needs an assembler that isn't installed. Keep it.

On macOS or Linux, steps 1–3 are simply: install rustup, run `rustup target add wasm32-unknown-unknown`, run `cargo install worker-build`, and run `npm install`.

## Run locally

```
npm run dev
```

Open http://localhost:8000. Pages are re-rendered on every refresh, so edits to `templates/`, `content/` and `assets/` show up immediately; restart after changing Rust code. Forms work too: leads are saved to `storage/leads.jsonl`. Open http://localhost:8000/api/leads to see them (only from your own computer).

The real Worker with a local D1 runs with `npm run dev:worker`. On this Windows 10 PC, Wrangler's local runtime crashes (a workerd access violation) before running any code. Use `npm run dev` here; deploying is not affected.

Tests: `npm test`.

## Deploy to Cloudflare (first time)

```
npm install
npx wrangler login
npx wrangler d1 create tiwaa-leads          # copy the database_id it prints
#   paste it into wrangler.jsonc  ->  "database_id": "..."
npm run db:migrate                          # creates the leads table in D1
npm run deploy                              # builds public/ + the Rust Worker, then uploads
```

After that, run `npm run deploy` for every update.

**Deploying from GitHub (Cloudflare Workers Builds):** the D1 database `tiwaa-leads` is already created and migrated, and its id is in `wrangler.jsonc`. Every push to `master` builds and deploys. Cloudflare's build machine has no Rust, so `scripts/build.sh` (used by both `npm run build` and the wrangler build step) installs a minimal Rust toolchain and worker-build on the first run. That makes the first build take several minutes. Build settings in the dashboard: build command `npm run build`, deploy command `npx wrangler deploy`.

**Custom domain:** in the Cloudflare dashboard go to Workers → tiwaa-growth-labs → Settings → Domains & Routes, or uncomment `routes` in `wrangler.jsonc`.

## Viewing leads

- Quick look: `npm run db:leads`
- As JSON over HTTP: set a secret once with `npx wrangler secret put ADMIN_TOKEN`, then:
  `curl -H "Authorization: Bearer <token>" https://your-domain/api/leads`
- Or in the Cloudflare dashboard: D1 → tiwaa-leads → Console.

Each lead stores the form (`hero`, `popup` or `contact`), name, phone, email, service, website, message, any extra fields, the button that opened it, page, country and time. Spam protection: a hidden honeypot field, same-origin check, a size limit and de-duplication of the same phone within 2 minutes.

## Common edits

- **Logo:** replace `assets/images/logo.png` (light theme) and `logo-white.png` (dark theme and footer). Adding `favicon.png` is optional.
- **Contact details:** `content/site.toml`.
- **Text in a section:** the matching file in `templates/sections/…`.
- **Blog posts:** `content/blog.toml`. Until an article page exists, a card opens the lead popup offering that guide; add `url = "/blog/..."` to a post to link to its article instead.
- **Add a page:** add it to `routes()` and `page()` in `crates/site/src/pages.rs`, and put its sections in `templates/sections/<page>/`.
- **Service detail pages:** eight pages under `/services/...` (SEO, Google Ads, Meta Ads, Social Media Marketing, WhatsApp Automation, Website Design, Content & Video, Analytics & CRM). Edit a section in `templates/sections/service/<page>/`. Titles, descriptions and keywords are in the `service_page(...)` entries in `pages.rs`. Each page's contact form pre-selects its service.
- **Redirects:** `redirects()` in `pages.rs` (for example `/seo-services.html` → `/services/seo`). They are written to `public/_redirects` for Cloudflare and followed by the dev server.
- **Contact form before the footer:** shown on every page automatically. Change its heading, text, button or fields for one page with `contact_form: Some(CfConfig { .. })` in `pages.rs` (the blog page is an example), or hide it with `contact_form: None` (as on the 404 page). Extra fields like budget or city are saved as JSON in the `extra` column.
- **Database changes:** add a new numbered file in `migrations/` and run `npm run db:migrate` (it applies only the new ones).
- **Validation rules:** `crates/leads/src/lib.rs`. They are used by both the Worker and the dev server; run `npm test` after changing them.

Placeholders still in the design: testimonials, the client logo names and case-study numbers are marked as samples in the artifact. Replace them before launch.
