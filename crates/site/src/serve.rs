//! `tgl serve`: local preview server (replaces `php -S` / XAMPP).
//!
//!  - Pages are rendered fresh on every request, so edits to templates/ and content/
//!    show up on refresh (no build step). Changes to Rust code need a restart.
//!  - /assets/* is served straight from assets/.
//!  - /api/leads uses the same validation as the Worker and saves leads to
//!    storage/leads.jsonl (one JSON object per line). Open /api/leads in the browser
//!    to see them (only from this computer).
//!
//! Production uses the Worker + D1 instead; `npx wrangler dev` runs that locally.

use crate::pages::{redirects, routes};
use crate::render::Site;
use crate::util::iso_now;
use serde_json::{json, Value};
use std::fs::{self, OpenOptions};
use std::io::{Read, Write};
use std::path::{Component, Path, PathBuf};
use tiny_http::{Header, Method, Request, Response, Server};

pub fn serve(root: &Path, port: u16) -> Result<(), String> {
    // Fail early if templates or content are broken.
    Site::load(root)?.render("home")?;
    let server = Server::http(("127.0.0.1", port)).map_err(|e| format!("could not listen on port {port}: {e}"))?;
    println!("Tiwaa Growth Labs dev server: http://localhost:{port}   (Ctrl+C to stop)");
    for req in server.incoming_requests() {
        let method = req.method().clone();
        let url = req.url().to_string();
        let status = handle(root, req);
        println!("{method:<5} {status} {url}");
    }
    Ok(())
}

fn header(name: &str, value: &str) -> Header {
    Header::from_bytes(name.as_bytes(), value.as_bytes()).expect("valid header")
}

fn respond(req: Request, status: u16, content_type: &str, body: Vec<u8>, extra: &[(&str, &str)]) -> u16 {
    let mut res = Response::from_data(body).with_status_code(status).with_header(header("Content-Type", content_type));
    for (k, v) in extra {
        res.add_header(header(k, v));
    }
    let _ = req.respond(res);
    status
}

fn json_res(req: Request, status: u16, v: Value, extra: &[(&str, &str)]) -> u16 {
    let mut headers = vec![("Cache-Control", "no-store"), ("X-Content-Type-Options", "nosniff")];
    headers.extend_from_slice(extra);
    respond(req, status, "application/json; charset=utf-8", v.to_string().into_bytes(), &headers)
}

fn handle(root: &Path, req: Request) -> u16 {
    let path = req.url().split(['?', '#']).next().unwrap_or("/").to_string();

    if path == "/api/leads" {
        return api(root, req);
    }
    if path.starts_with("/api/") {
        return json_res(req, 404, json!({ "ok": false, "error": "Not found" }), &[]);
    }
    if let Some(rel) = path.strip_prefix("/assets/") {
        return asset(root, req, rel);
    }

    // Pages: /services, /services/, /services.html and /index.html all work.
    let mut p = path.trim_end_matches('/').trim_end_matches(".html").to_string();
    if p.is_empty() || p == "/index" {
        p = "/".into();
    }
    if let Some((_, to)) = redirects().iter().find(|(from, _)| *from == path || *from == p) {
        return respond(req, 301, "text/plain; charset=utf-8", Vec::new(), &[("Location", to)]);
    }
    let (status, id) = match routes().iter().find(|(r, _)| *r == p) {
        Some((_, id)) => (200, *id),
        None => (404, "404"),
    };
    match Site::load(root).and_then(|s| s.render(id)) {
        Ok(html) => respond(req, status, "text/html; charset=utf-8", html.into_bytes(), &[("Cache-Control", "no-store")]),
        Err(e) => {
            eprintln!("render error: {e}");
            let body = format!("<!doctype html><title>Template error</title><pre style=\"white-space:pre-wrap;font:14px monospace;padding:24px\">{}</pre>", crate::util::escape(&e));
            respond(req, 500, "text/html; charset=utf-8", body.into_bytes(), &[])
        }
    }
}

fn asset(root: &Path, req: Request, rel: &str) -> u16 {
    let rel = PathBuf::from(rel);
    if rel.components().any(|c| !matches!(c, Component::Normal(_))) {
        return respond(req, 404, "text/plain", b"Not found".to_vec(), &[]);
    }
    let file = root.join("assets").join(&rel);
    match fs::read(&file) {
        Ok(bytes) => respond(req, 200, mime(&file), bytes, &[("Cache-Control", "no-cache")]),
        Err(_) => respond(req, 404, "text/plain", b"Not found".to_vec(), &[]),
    }
}

fn mime(file: &Path) -> &'static str {
    match file.extension().and_then(|e| e.to_str()).unwrap_or("").to_ascii_lowercase().as_str() {
        "css" => "text/css; charset=utf-8",
        "js" | "mjs" => "text/javascript; charset=utf-8",
        "json" => "application/json",
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "gif" => "image/gif",
        "ico" => "image/x-icon",
        "avif" => "image/avif",
        "woff2" => "font/woff2",
        "woff" => "font/woff",
        "txt" => "text/plain; charset=utf-8",
        "pdf" => "application/pdf",
        "mp4" => "video/mp4",
        _ => "application/octet-stream",
    }
}

fn is_local(req: &Request) -> bool {
    req.remote_addr().map(|a| a.ip().is_loopback()).unwrap_or(false)
}

fn header_value(req: &Request, name: &'static str) -> String {
    req.headers()
        .iter()
        .find(|h| h.field.equiv(name))
        .map(|h| h.value.as_str().to_string())
        .unwrap_or_default()
}

/// Local version of the Worker's /api/leads (same rules, JSON-lines file instead of D1).
fn api(root: &Path, mut req: Request) -> u16 {
    let file = root.join("storage").join("leads.jsonl");
    match req.method() {
        Method::Get => {
            if !is_local(&req) {
                return json_res(req, 404, json!({ "ok": false, "error": "Not found" }), &[]);
            }
            let mut leads: Vec<Value> = fs::read_to_string(&file)
                .unwrap_or_default()
                .lines()
                .filter_map(|l| serde_json::from_str(l).ok())
                .collect();
            leads.reverse();
            leads.truncate(100);
            json_res(req, 200, json!({ "ok": true, "leads": leads }), &[])
        }
        Method::Post => {
            // Only accept posts from our own pages.
            let origin = header_value(&req, "Origin");
            let host = header_value(&req, "Host");
            if !origin.is_empty() && origin.split("://").nth(1).map(|h| h.trim_end_matches('/')) != Some(host.as_str()) {
                return json_res(req, 403, json!({ "ok": false, "error": "Forbidden" }), &[]);
            }
            if !header_value(&req, "Content-Type").contains("application/json") {
                return json_res(req, 415, json!({ "ok": false, "error": "Invalid request." }), &[]);
            }
            let mut body = Vec::new();
            let _ = req.as_reader().take(tgl_leads::MAX_BODY as u64 + 1).read_to_end(&mut body);
            if body.len() > tgl_leads::MAX_BODY {
                return json_res(req, 413, json!({ "ok": false, "error": "Request too large." }), &[]);
            }
            let input: Value = match serde_json::from_slice(&body) {
                Ok(v @ Value::Object(_)) => v,
                _ => return json_res(req, 400, json!({ "ok": false, "error": "Invalid request." }), &[]),
            };
            // Honeypot filled in => bot. Pretend success, store nothing.
            if tgl_leads::is_spam(&input) {
                return json_res(req, 200, json!({ "ok": true }), &[]);
            }
            let lead = match tgl_leads::validate(&input) {
                Ok(l) => l,
                Err(msg) => return json_res(req, 422, json!({ "ok": false, "error": msg }), &[]),
            };
            match save_local(&file, &lead, &req) {
                Ok((id, dup)) if dup => json_res(req, 200, json!({ "ok": true, "id": id, "duplicate": true }), &[]),
                Ok((id, _)) => json_res(req, 201, json!({ "ok": true, "id": id }), &[]),
                Err(e) => {
                    eprintln!("[leads] {e}");
                    json_res(req, 500, json!({ "ok": false, "error": "Could not save your details. Please call us instead." }), &[])
                }
            }
        }
        _ => json_res(req, 405, json!({ "ok": false, "error": "Method not allowed" }), &[("Allow", "GET, POST")]),
    }
}

/// Append a lead; returns (id, duplicate?). Same phone + form within 2 minutes = duplicate.
fn save_local(file: &Path, lead: &tgl_leads::Lead, req: &Request) -> Result<(u64, bool), String> {
    let existing: Vec<Value> = fs::read_to_string(file)
        .unwrap_or_default()
        .lines()
        .filter_map(|l| serde_json::from_str(l).ok())
        .collect();
    let now = iso_now();
    let two_min_ago = minus_two_minutes(&now);
    if let Some(d) = existing.iter().rev().find(|r| {
        r["phone"] == lead.phone.as_str() && r["form"] == lead.form.as_str() && r["created_at"].as_str().unwrap_or("") > two_min_ago.as_str()
    }) {
        return Ok((d["id"].as_u64().unwrap_or(0), true));
    }
    let id = existing.iter().filter_map(|r| r["id"].as_u64()).max().unwrap_or(0) + 1;
    let mut row = serde_json::to_value(lead).map_err(|e| e.to_string())?;
    let obj = row.as_object_mut().expect("object");
    let mut full = serde_json::Map::new();
    full.insert("id".into(), json!(id));
    full.insert("created_at".into(), json!(now));
    full.append(obj);
    full.insert("ip".into(), json!(req.remote_addr().map(|a| a.ip().to_string()).unwrap_or_default()));
    full.insert("country".into(), json!(""));
    full.insert("user_agent".into(), json!(header_value(req, "User-Agent").chars().take(300).collect::<String>()));
    full.insert("status".into(), json!("new"));

    fs::create_dir_all(file.parent().expect("parent")).map_err(|e| e.to_string())?;
    let mut f = OpenOptions::new().create(true).append(true).open(file).map_err(|e| e.to_string())?;
    writeln!(f, "{}", Value::Object(full)).map_err(|e| e.to_string())?;
    Ok((id, false))
}

/// ISO timestamp two minutes earlier (string comparison works for this format).
fn minus_two_minutes(iso: &str) -> String {
    let (date, time) = iso.split_once('T').unwrap_or((iso, "00:00:00.000Z"));
    let h: i64 = time[0..2].parse().unwrap_or(0);
    let m: i64 = time[3..5].parse().unwrap_or(0);
    let total = h * 60 + m - 2;
    if total < 0 {
        return format!("{date}T00:00:00.000Z"); // just after midnight: compare within today only
    }
    format!("{date}T{:02}:{:02}{}", total / 60, total % 60, &time[5..])
}
