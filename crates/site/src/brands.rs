//! Brand and platform logos (files live in assets/images/brands/).
//!
//!  - `client_logo()`    : logo chip for a client name (initials tile if no logo yet)
//!  - `platform_icons()` : adds small platform icons before names like "Google Ads",
//!                         "Meta", "WhatsApp" in a chunk of HTML (text only, never
//!                         inside tags/attributes, scripts or styles)

use crate::content::{Client, Post};
use crate::util::{escape, Assets};
use regex::{Captures, Regex};
use std::collections::HashSet;
use std::sync::OnceLock;

/// Logos that already have their own square background (shown edge to edge).
const FULL_BLEED_LOGOS: &[&str] =
    &["emaar.png", "sobha.png", "instagram.png", "hubspot.png", "linkedin.png", "leadsquared.png"];

/// Platform names to mark with an icon, longest first. Matched case-sensitively on whole words.
const PLATFORM_PATTERNS: &[(&str, &str)] = &[
    ("Google Business Profile", "google.png"),
    ("Google Analytics", "google-analytics.svg"),
    ("Google Ads", "google-ads.svg"),
    ("Tag Manager", "google-tag-manager.svg"),
    ("GA4", "google-analytics.svg"),
    ("Google", "google.png"),
    ("Meta", "meta.svg"),
    ("Instagram", "instagram.png"),
    ("Facebook", "facebook.png"),
    ("WhatsApp", "whatsapp-business.png"),
    ("YouTube", "youtube.png"),
    ("LinkedIn", "linkedin.png"),
    ("WordPress", "wordpress.png"),
    ("Shopify", "shopify.png"),
];

/// `<span class="bl ...">` logo chip, or an initials tile when the client has no logo yet.
pub fn client_logo(clients: &[Client], assets: &Assets, name: &str) -> String {
    match clients.iter().find(|c| c.name == name) {
        Some(Client { logo: Some(logo), .. }) => {
            let full = if FULL_BLEED_LOGOS.contains(&logo.as_str()) { " bl-full" } else { "" };
            format!(
                r#"<span class="bl bl-img{full}"><img src="{}" alt="" width="24" height="24" loading="lazy" decoding="async"></span>"#,
                escape(&assets.url(&format!("images/brands/{logo}")))
            )
        }
        Some(c) => format!(r#"<span class="bl" style="--c:{}">{}</span>"#, escape(&c.color), escape(&c.initials)),
        None => {
            let ini: String = name.chars().take(2).collect::<String>().to_uppercase();
            format!(r##"<span class="bl" style="--c:#8E8E93">{}</span>"##, escape(&ini))
        }
    }
}

/// One article card (home Insights and /blog). `i` staggers the reveal animation.
pub fn blog_card(p: &Post, assets: &Assets, i: usize, excerpt: bool) -> String {
    let arrow = r#"<svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>"#;
    let (href, cta, label) = match &p.url {
        Some(u) => (escape(u), String::new(), "Read article"),
        None => ("#contact".to_string(), format!(r#" data-cta="{}""#, escape(&p.cta)), "Get the guide"),
    };
    let d = if i % 3 != 0 { format!(r#" style="--d:{}""#, i % 3) } else { String::new() };
    // Thumbnail photo (content/blog.toml "image"), else the colour gradient.
    let img = match p.image.as_deref().map(|s| s.trim_start_matches('/')).filter(|s| !s.is_empty()) {
        Some(path) if assets.exists(&format!("images/{path}")) => format!(
            r#"<img src="{}" alt="" width="400" height="300" loading="lazy" decoding="async">"#,
            escape(&assets.url(&format!("images/{path}")))
        ),
        Some(path) => {
            eprintln!("warning: blog image assets/images/{path} not found, using the colour thumbnail for \"{}\"", p.title);
            String::new()
        }
        None => String::new(),
    };
    let art_class = if img.is_empty() { "ins-art" } else { "ins-art has-img" };
    let ex = if excerpt { format!(r#"<p class="ins-x">{}</p>"#, escape(&p.excerpt)) } else { String::new() };
    format!(
        concat!(
            r#"<a class="ins rv" href="{href}"{cta}{d} data-tag="{tag}">"#,
            r#"<div class="{art_class}" style="--g1:{g1};--g2:{g2}">{img}<span>{tag}</span></div>"#,
            r#"<div class="ins-b"><small>{cat} · {mins} min read</small><h3>{title}</h3>{ex}"#,
            r#"<span class="y-link">{label} {arrow}</span></div></a>"#
        ),
        href = href,
        cta = cta,
        d = d,
        art_class = art_class,
        img = img,
        tag = escape(&p.tag),
        g1 = escape(&p.g1),
        g2 = escape(&p.g2),
        cat = escape(&p.cat),
        mins = p.mins,
        title = escape(&p.title),
        ex = ex,
        label = label,
        arrow = arrow,
    )
}

struct Res {
    split: Regex,
    words: Regex,
    close: Regex,
    open: Regex,
    skip_class: Regex,
    service_heading: Regex,
}

fn res() -> &'static Res {
    static R: OnceLock<Res> = OnceLock::new();
    R.get_or_init(|| {
        let alt = PLATFORM_PATTERNS.iter().map(|(p, _)| regex::escape(p)).collect::<Vec<_>>().join("|");
        Res {
            split: Regex::new(r"(?s)<!--.*?-->|<[^>]+>").unwrap(),
            words: Regex::new(&format!(r"(?-u:\b)({alt})(?-u:\b)")).unwrap(),
            close: Regex::new(r"^</\s*([a-zA-Z0-9-]+)").unwrap(),
            open: Regex::new(r"^<\s*([a-zA-Z0-9-]+)").unwrap(),
            skip_class: Regex::new(r#"class="[^"]*(?-u:\b)(sh-t|mq-i|svd-eb|bl|plf-i|btn|crumb|sx-eb|sx-menu|pill|lf2|jn|att-rows|kb|wf|sw-grid|ana-list|mh2|phone)(?-u:\b)"#).unwrap(),
            service_heading: Regex::new(
                r"^(Google Ads \(PPC\)|Meta (&amp;|&) Instagram Ads|WhatsApp (Marketing (&amp;|&) )?Automation)$",
            )
            .unwrap(),
        }
    })
}

/// PHP-style trim (space, tab, newlines, NUL, vertical tab).
fn php_trim(s: &str) -> &str {
    s.trim_matches(|c| matches!(c, ' ' | '\t' | '\n' | '\r' | '\0' | '\x0B'))
}

/// Insert a small icon before the first mention of each platform in every text run.
/// Skips <script>, <style>, <svg>, <textarea>, <select>, <button>, <h1>, decorative mockups
/// (aria-hidden="true"), breadcrumbs and eyebrows, any element marked with data-no-picons,
/// plus headings that already sit next to a brand logo.
pub fn platform_icons(html: &str, assets: &Assets) -> String {
    const SKIP_TAGS: &[&str] = &["script", "style", "svg", "textarea", "select", "option", "button", "title", "h1", "h2"];
    const VOID: &[&str] =
        &["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"];
    let r = res();

    // Split into text runs and tags, keeping both.
    let mut parts: Vec<&str> = Vec::new();
    let mut last = 0;
    for m in r.split.find_iter(html) {
        if m.start() > last {
            parts.push(&html[last..m.start()]);
        }
        parts.push(m.as_str());
        last = m.end();
    }
    if last < html.len() {
        parts.push(&html[last..]);
    }

    let mut stack: Vec<(String, bool)> = Vec::new(); // (tag name, skipped?)
    let mut skip = 0usize;
    let mut out = String::with_capacity(html.len() + html.len() / 8);

    for part in parts {
        if part.starts_with('<') {
            out.push_str(part);
            if part.starts_with("<!") {
                continue;
            }
            if let Some(c) = r.close.captures(part) {
                let tag = c[1].to_ascii_lowercase();
                while let Some((t, s)) = stack.pop() {
                    if s {
                        skip -= 1;
                    }
                    if t == tag {
                        break;
                    }
                }
                continue;
            }
            if let Some(c) = r.open.captures(part) {
                let tag = c[1].to_ascii_lowercase();
                let self_closing = part.trim_end_matches([' ', '\t', '\n', '>']).ends_with('/');
                if VOID.contains(&tag.as_str()) || self_closing {
                    continue;
                }
                let s = SKIP_TAGS.contains(&tag.as_str())
                    || part.contains("data-no-picons")
                    || part.contains(r#"aria-hidden="true""#)
                    || r.skip_class.is_match(part);
                if s {
                    skip += 1;
                }
                stack.push((tag, s));
            }
            continue;
        }
        // Text run
        let parent = stack.last().map(|(t, _)| t.as_str()).unwrap_or("");
        if skip > 0
            || php_trim(part).is_empty()
            || !r.words.is_match(part)
            || (matches!(parent, "h1" | "h2" | "h3") && r.service_heading.is_match(php_trim(part)))
        {
            out.push_str(part);
            continue;
        }
        let mut seen: HashSet<&str> = HashSet::new();
        let replaced = r.words.replace_all(part, |m: &Captures| {
            let word = &m[1];
            let file = PLATFORM_PATTERNS.iter().find(|(p, _)| *p == word).map(|(_, f)| *f).unwrap_or("");
            if !seen.insert(file) {
                return word.to_string();
            }
            format!(
                r#"<span class="plf"><img class="plf-i" src="{}" alt="" width="16" height="16" decoding="async">{word}</span>"#,
                escape(&assets.url(&format!("images/brands/{file}")))
            )
        });
        // Wrapped in one span so flex/grid parents keep the sentence as a single item.
        out.push_str(r#"<span class="plf-t">"#);
        out.push_str(&replaced);
        out.push_str("</span>");
    }
    out
}
