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
| `content/blog.toml` | Blog cards on the home "Insights" section (first three) |
| `templates/sections/blog/` | The /blog page (search, topic filters, featured article, upcoming articles) and, in `blog/posts/`, each article. Styles in `css/blog.css`; scripts `js/blog.js` (listing) and `js/blog-post.js` (articles: contents, calculator, checklist, FAQ). Structured data in `templates/layout/ld/blog*.html` |
| `content/clients.toml` | Client names and logo files (for example the "Trusted by" strip) |
| `templates/sections/home/`, `services/`, `blog/`, `shared/` | One file per page section (hero, ROI, FAQ, …) |
| `templates/sections/service/<page>/` | Sections of each service detail page (`/services/seo`, `/services/google-ads`, …, `/services/conversions-api`) |
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
| `templates/sections/work/` | The /our-work page (featured case study, filterable case study cards with a pop-up, client logos, reviews). The page wrapper `<div class="wk">` opens in 01-hero and closes in 04-case-dialog, which also holds the case study data (JSON) read by `js/work.js`. Styles in `css/work.css` |
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
- **Blog:** the /blog page is `templates/sections/blog/`; home "Insights" cards come from `content/blog.toml`. To publish a new article: add its file in `templates/sections/blog/posts/`, a route and page entry in `pages.rs` (copy `blog-meta-lead-forms`), link it from `blog/02-list.html`, and add `url = "/blog/..."` to its post in `blog.toml`.
- **Add a page:** add it to `routes()` and `page()` in `crates/site/src/pages.rs`, and put its sections in `templates/sections/<page>/`.
- **Service detail pages:** eight pages under `/services/...` (SEO, Google Ads, Meta Ads, Social Media Marketing, WhatsApp Automation, Website Design, Content & Video, Analytics & CRM). Edit a section in `templates/sections/service/<page>/`. Titles, descriptions and keywords are in the `service_page(...)` entries in `pages.rs`. Each page's contact form pre-selects its service.
- **Redirects:** `redirects()` in `pages.rs` (for example `/seo-services.html` → `/services/seo`). They are written to `public/_redirects` for Cloudflare and followed by the dev server.
- **Contact form before the footer:** shown on every page automatically. Change its heading, text, button or fields for one page with `contact_form: Some(CfConfig { .. })` in `pages.rs` (the blog page is an example), or hide it with `contact_form: None` (as on the 404 page). Extra fields like budget or city are saved as JSON in the `extra` column.
- **Database changes:** add a new numbered file in `migrations/` and run `npm run db:migrate` (it applies only the new ones).
- **Validation rules:** `crates/leads/src/lib.rs`. They are used by both the Worker and the dev server; run `npm test` after changing them.

Placeholders still in the design: testimonials, the client logo names and case-study numbers are marked as samples in the artifact. Replace them before launch.

## Homepage SEO

| What | Where |
| --- | --- |
| Title (< 60 chars: "Real Estate Marketing Agency in Gurgaon | Tiwaa Growth Labs"), description (< 160), keywords | `crates/site/src/pages.rs`, `"home"` |
| Canonical tag | `content/site.toml` → `canonical_url` (empty for now: set it to the live domain and rebuild) |
| WebSite / Service catalogue / FAQPage structured data | `templates/layout/ld/home.html` |
| FAQ questions (page and structured data share them) | `templates/sections/home/_faqs.html` |

Keyword plan (real estate marketing, Gurugram / Delhi NCR):

- **Primary:** real estate marketing agency in Gurugram (Gurgaon); real estate digital marketing agency
- **Secondary:** real estate lead generation; property marketing agency Delhi NCR; digital marketing for builders / real estate developers; channel partner leads
- **Supporting:** pre-launch / EOI campaigns; NRI buyers; cost per site visit; real estate Google Ads; real estate Facebook / Meta lead ads; real estate SEO; real estate landing pages; WhatsApp marketing for real estate; real estate CRM; site visits; cost per lead
- **Local:** Gurugram / Gurgaon, Delhi NCR, Golf Course Road & Extension, Dwarka Expressway, New Gurugram, Southern Peripheral Road, Sohna Road, Noida & Yamuna Expressway (micro-market list in `templates/sections/home/05-industries.html`)

Competitor check (Nov 2026): the strongest Gurugram page (AAJneeti) uses "Gurugram (Gurgaon)" in title and description, names sectors and corridors, answers about 10 FAQs and has ProfessionalService + Service + FAQPage schema. Our homepage now covers all of these; its remaining edge is local market data (launch lists, price trends), which belongs in blog posts or a /gurugram landing page.

Use each phrase where it reads naturally (headings, intro copy, FAQ). Do not repeat keywords for their own sake.

## About page SEO

| What | Where |
| --- | --- |
| Title ("About Tiwaa Growth Labs \| Real Estate Marketing Company"), description, keywords | `crates/site/src/pages.rs`, `"about"` |
| AboutPage + breadcrumb + FAQPage structured data | `templates/layout/ld/about.html` |
| FAQ questions (page and structured data share them) | `templates/sections/about/_faqs.html` |
| Mission, vision and values | `templates/sections/about/02b-mission.html` |
| Client logo row (homepage and about page) | `templates/sections/shared/client-logos.html` |

Keywords: the brand ("Tiwaa Growth Labs", "Tiwaa Growth Lab Private Limited") plus "real estate marketing company in Gurugram / Gurgaon". The homepage owns "real estate marketing agency", so the two pages don't compete for the same search.

## Contact page SEO

| What | Where |
| --- | --- |
| Title ("Contact Tiwaa Growth Labs \| Real Estate Marketing Gurugram"), description, keywords | `crates/site/src/pages.rs`, `"contact"` |
| ContactPage + contact points + map + breadcrumb + FAQPage structured data | `templates/layout/contact-ld.html` |
| FAQ questions by topic (page and structured data share them) | `templates/sections/contact/_faqs.html` |

Structured data templates use `{{ value | tojson }}` for any text that may contain quotes.

## Services page SEO

| What | Where |
| --- | --- |
| Title ("Real Estate Digital Marketing Services \| Tiwaa Growth Labs"), description, keywords | `crates/site/src/pages.rs`, `"services"` |
| CollectionPage + ItemList of 9 Services + breadcrumb + FAQPage structured data | `templates/layout/services-ld.html` |
| FAQ questions (page and structured data share them) | `templates/sections/services/_faqs.html` |
| Real estate segments grid (only used on /services) | `templates/sections/shared/industries.html` |

The "Sample result" figures in `templates/sections/services/06-service-details.html` are placeholders. Replace them with real project results before launch.

## Launch settings (content/site.toml)

| Setting | What it does |
| --- | --- |
| `canonical_url` | Base for `<link rel="canonical">`. Set to the live domain at launch. |
| `[social]` facebook / linkedin / instagram / youtube | Footer icons appear only for URLs that are set; set URLs are also added to the organisation schema as `sameAs`. |
| `[analytics]` gtm_id / ga4_id / meta_pixel_id | Tracking tags in `templates/layout/analytics.html`; empty IDs load nothing. With GTM, add GA4 and the Pixel inside GTM instead. |

Legal pages: `/privacy-policy` and `/terms` (`templates/sections/legal/`). They are drafts based on what the site collects; have them reviewed before launch.

Lead popup: auto-opens once per visit on desktop only (`tgl-auto` in sessionStorage), and that also uses up the exit-intent popup for the visit.
