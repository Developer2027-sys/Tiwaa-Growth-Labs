//! Turns a page definition (pages.rs) + content/ + templates/ into one HTML document.
//!
//! Template helpers available in every template:
//!   {{ url('/services') }}        site-relative link
//!   {{ asset('css/main.css') }}   /assets/... with a ?v= fingerprint
//!   {{ home('#work') }}           '#work' on the home page, '/#work' elsewhere
//!   {{ svc('#seo') }}             '#seo' on /services, '/services#seo' elsewhere
//!   {{ abs_url('/x') }}           https://www.../x (canonical, Open Graph)
//!   {{ client_logo('Emaar') }}    logo chip (content/clients.toml)
//!   {{ blog_card(post, i) }}      article card (content/blog.toml)
//!   site.*  page.*  is_home  is_services  in_services  year  blog_posts  blog_tags
//! Values are HTML-escaped automatically; `| safe` prints trusted HTML as-is.

use crate::brands;
use crate::content::{Content, Post};
use crate::pages::{self, HeadExtra, Page};
use crate::util::{self, escape, Assets};
use minijinja::value::ViaDeserialize;
use minijinja::{context, path_loader, Environment, Error, State, Value};
use serde_json::json;
use std::path::Path;
use std::sync::Arc;

pub struct Site {
    pub content: Arc<Content>,
    pub assets: Arc<Assets>,
    env: Environment<'static>,
}

impl Site {
    /// Load content/ and set up templates/ from the project root.
    pub fn load(root: &Path) -> Result<Self, String> {
        let content = Arc::new(Content::load(&root.join("content"))?);
        let assets = Arc::new(Assets::new(root.join("assets")));

        let mut env = Environment::new();
        env.set_loader(path_loader(root.join("templates")));
        env.set_trim_blocks(true); // like PHP's "?>": drop the newline after a {% tag %}
        env.set_keep_trailing_newline(true);
        env.set_formatter(|out, _state, value| {
            if value.is_undefined() || value.is_none() {
                return Ok(());
            }
            let text = value.as_str().map(str::to_owned).unwrap_or_else(|| value.to_string());
            let text = if value.is_safe() { text } else { escape(&text) };
            out.write_str(&text).map_err(Error::from)
        });

        env.add_function("url", |path: String| path);
        let a = assets.clone();
        env.add_function("asset", move |path: String| a.url(&path));
        env.add_function("home", |state: &State, hash: String| link(state, "home", "/", &hash));
        env.add_function("svc", |state: &State, hash: String| link(state, "services", "/services", &hash));
        let site_url = content.site.site_url.trim_end_matches('/').to_string();
        env.add_function("abs_url", move |path: String| format!("{site_url}{path}"));
        let (c, a) = (content.clone(), assets.clone());
        env.add_function("client_logo", move |name: String| {
            Value::from_safe_string(brands::client_logo(&c.clients, &a, &name))
        });
        let a = assets.clone();
        env.add_function("blog_card", move |p: ViaDeserialize<Post>, i: usize, excerpt: Option<bool>| {
            Value::from_safe_string(brands::blog_card(&p, &a, i, excerpt.unwrap_or(false)))
        });

        Ok(Self { content, assets, env })
    }

    /// Render a page by id ("home", "services", "blog", "404").
    pub fn render(&self, id: &str) -> Result<String, String> {
        let page = pages::page(id).ok_or_else(|| format!("unknown page '{id}'"))?;
        self.render_page(&page).map_err(|e| format!("page '{id}': {e:#}"))
    }

    fn render_page(&self, page: &Page) -> Result<String, Error> {
        let base = self.base_context(page)?;

        // Sections, each followed by a newline.
        let mut main = String::new();
        for s in &page.sections {
            let tpl = self.env.get_template(&format!("sections/{}.html", s.name))?;
            let ctx = if s.vars.is_null() { base.clone() } else { context! { ..Value::from_serialize(&s.vars), ..base.clone() } };
            main.push_str(&tpl.render(ctx)?);
            main.push('\n');
        }
        if page.platform_icons {
            main = brands::platform_icons(&main, &self.assets);
        }

        let cf = page.contact_form.as_ref().map(|c| c.view());
        let ctx = context! { main_html => Value::from_safe_string(main), cf => cf, ..base };
        self.env.get_template("layout/base.html")?.render(ctx)
    }

    fn base_context(&self, page: &Page) -> Result<Value, Error> {
        let site = &self.content.site;
        let abs = |p: &str| format!("{}{}", site.site_url.trim_end_matches('/'), p);
        let head_extra = match &page.head_extra {
            HeadExtra::None => String::new(),
            // Rendered as a template, so structured data can use {{ abs_url() }} and {{ site.* }}.
            HeadExtra::File(f) => self.env.get_template(f)?.render(context! { site => Value::from_serialize(site) })?,
        };
        let a = &site.address;
        let intl = &site.phone_intl;
        let mut org = json!({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "@id": abs("/#organization"),
            "name": site.name,
            "legalName": site.legal_name,
            "url": abs("/"),
            "logo": abs("/assets/images/logo.png"),
            "image": abs("/assets/images/og-image.png"),
            "telephone": format!("+{}-{}", &intl[..2.min(intl.len())], &intl[2.min(intl.len())..]),
            "email": site.email,
            "description": "Real estate digital marketing agency in Gurugram for developers, builders and channel partners: lead generation, Meta and Google ads, landing pages, WhatsApp automation and CRM.",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": a.street,
                "addressLocality": a.city,
                "addressRegion": a.region,
                "postalCode": a.postcode,
                "addressCountry": a.country,
            },
            "areaServed": [
                { "@type": "City", "name": "Gurugram" },
                { "@type": "AdministrativeArea", "name": "Delhi NCR" },
                { "@type": "Country", "name": "India" },
            ],
            "openingHoursSpecification": [{
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "opens": "10:00",
                "closes": "19:00",
            }],
            "contactPoint": [{
                "@type": "ContactPoint",
                "telephone": format!("+{intl}"),
                "email": site.email,
                "contactType": "sales",
                "areaServed": "IN",
            }],
            "knowsAbout": ["Real Estate Marketing", "Real Estate Lead Generation", "Search Engine Optimization", "Google Ads", "Meta Ads", "Social Media Marketing", "WhatsApp Marketing", "Content Marketing", "Website Development", "CRM"],
        });
        let same_as = site.social.urls();
        if !same_as.is_empty() {
            org["sameAs"] = json!(same_as);
        }
        let tgl = json!({ "api": site.api_path, "phone": site.phone_display, "wa": site.phone_intl, "brands": "/assets/images/brands/" });
        let favicon = self.assets.exists("images/favicon.png").then(|| self.assets.url("images/favicon.png"));

        Ok(context! {
            site => Value::from_serialize(site),
            page => context! {
                id => page.id,
                title => page.title,
                og_title => page.og_title,
                description => page.description,
                keywords => page.keywords,
                path => page.path,
                css => page.css,
                js => page.js,
                head_extra => head_extra,
                robots => page.robots,
            },
            page_id => page.id,
            is_home => page.id == "home",
            is_services => page.id == "services",
            // /services and every /services/... page: highlights "Services" in the nav
            in_services => page.path.starts_with("/services"),
            year => util::now_utc().0,
            // Empty until the final domain is live (content/site.toml: canonical_url).
            canonical => (!site.canonical_url.is_empty()).then(|| format!("{}{}", site.canonical_url.trim_end_matches('/'), page.path)).unwrap_or_default(),
            og_url => abs(page.path),
            favicon => favicon,
            tgl_json => tgl.to_string(),
            org_json => pretty_json(&org),
            blog_posts => Value::from_serialize(&self.content.posts),
            blog_tags => self.content.blog_tags(),
        })
    }
}

/// '#hash' when already on that page, otherwise a link to the page plus the hash.
fn link(state: &State, page_id: &str, path: &str, hash: &str) -> String {
    let here = state.lookup("page_id").and_then(|v| v.as_str().map(|s| s == page_id)).unwrap_or(false);
    if here {
        hash.to_string()
    } else if path == "/" {
        format!("/{hash}")
    } else {
        format!("{path}{hash}")
    }
}

/// JSON with 4-space indentation (structured data in <head>).
fn pretty_json(v: &serde_json::Value) -> String {
    use serde::Serialize;
    let mut buf = Vec::new();
    let fmt = serde_json::ser::PrettyFormatter::with_indent(b"    ");
    let mut ser = serde_json::Serializer::with_formatter(&mut buf, fmt);
    v.serialize(&mut ser).expect("json");
    String::from_utf8(buf).expect("utf8")
}
