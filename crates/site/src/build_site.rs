//! `tgl build`: render every page to public/ for Cloudflare Workers static assets.
//!
//!   public/index.html, services.html, services/seo.html, ..., blog.html, 404.html
//!   public/assets/...            (copied from assets/)
//!   public/_headers, _redirects, robots.txt, sitemap.xml
//!
//! Cloudflare serves public/ directly; the Rust Worker (worker/) only handles /api/*.

use crate::pages::{redirects, routes};
use crate::render::Site;
use crate::util::today;
use std::fs;
use std::path::Path;

pub fn build(root: &Path) -> Result<(), String> {
    let site = Site::load(root)?;
    let out = root.join("public");
    println!("Building public/ ...");

    if out.exists() {
        fs::remove_dir_all(&out).map_err(|e| format!("could not clear public/: {e}"))?;
    }
    fs::create_dir_all(&out).map_err(|e| e.to_string())?;

    let n = copy_dir(&root.join("assets"), &out.join("assets"))?;
    println!("  {:<28} {n} files", "assets/");

    // Pages: '/' -> index.html, '/services' -> services.html (served at /services)
    for (path, id) in routes() {
        let file = if *path == "/" { "index.html".to_string() } else { format!("{}.html", path.trim_start_matches('/')) };
        put(&out, &file, &site.render(id)?)?;
    }
    put(&out, "404.html", &site.render("404")?)?;

    // Response headers for Cloudflare static assets
    put(
        &out,
        "_headers",
        "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n",
    )?;

    // 301 redirects (pages.rs redirects())
    let rules: String = redirects().iter().map(|(from, to)| format!("{from} {to} 301
")).collect();
    put(&out, "_redirects", &rules)?;

    let base = site.content.site.site_url.trim_end_matches('/').to_string();
    put(&out, "robots.txt", &format!("User-agent: *\nAllow: /\n\nSitemap: {base}/sitemap.xml\n"))?;

    let day = today();
    let urls: String = routes()
        .iter()
        .map(|(path, _)| format!("  <url><loc>{base}{path}</loc><lastmod>{day}</lastmod></url>\n"))
        .collect();
    put(
        &out,
        "sitemap.xml",
        &format!("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n{urls}</urlset>\n"),
    )?;

    println!("Done. Preview: npm run dev   |   Deploy: npm run deploy");
    Ok(())
}

fn put(out: &Path, name: &str, content: &str) -> Result<(), String> {
    let file = out.join(name);
    if let Some(dir) = file.parent() {
        fs::create_dir_all(dir).map_err(|e| format!("{}: {e}", dir.display()))?;
    }
    fs::write(&file, content).map_err(|e| format!("{}: {e}", file.display()))?;
    println!("  public/{:<21} {:7.1} KB", name, content.len() as f64 / 1024.0);
    Ok(())
}

fn copy_dir(from: &Path, to: &Path) -> Result<usize, String> {
    let mut n = 0;
    fs::create_dir_all(to).map_err(|e| e.to_string())?;
    for entry in fs::read_dir(from).map_err(|e| format!("{}: {e}", from.display()))? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let name = entry.file_name();
        if name == "README.md" || name == ".gitkeep" {
            continue;
        }
        if path.is_dir() {
            n += copy_dir(&path, &to.join(&name))?;
        } else {
            fs::copy(&path, to.join(&name)).map_err(|e| format!("{}: {e}", path.display()))?;
            n += 1;
        }
    }
    Ok(n)
}
