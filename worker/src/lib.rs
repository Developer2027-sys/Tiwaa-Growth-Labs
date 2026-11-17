//! Tiwaa Growth Labs: Cloudflare Worker (Rust, compiled to WebAssembly)
//!
//!  - Static pages + assets: served from public/ (built by `npm run build`)
//!  - POST /api/leads : save an enquiry to D1 (binding: DB)
//!  - GET  /api/leads : list recent leads (needs header  Authorization: Bearer <ADMIN_TOKEN>)
//!
//! Validation lives in crates/leads, shared with the local dev server (`tgl serve`).

use serde_json::{json, Value};
use tgl_leads::{is_spam, list_limit, validate, Lead, MAX_BODY};
use worker::*;

fn json_response(data: Value, status: u16, extra: &[(&str, &str)]) -> Result<Response> {
    let headers = Headers::new();
    headers.set("Content-Type", "application/json; charset=utf-8")?;
    headers.set("Cache-Control", "no-store")?;
    headers.set("X-Content-Type-Options", "nosniff")?;
    for (k, v) in extra {
        headers.set(k, v)?;
    }
    Ok(Response::ok(data.to_string())?.with_status(status).with_headers(headers))
}

fn fail(error: &str, status: u16) -> Result<Response> {
    json_response(json!({ "ok": false, "error": error }), status, &[])
}

#[event(fetch)]
pub async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    let path = req.url()?.path().to_string();

    if path == "/api/leads" {
        return match req.method() {
            Method::Post => create_lead(req, &env).await,
            Method::Get => list_leads(&req, &env).await,
            _ => json_response(json!({ "ok": false, "error": "Method not allowed" }), 405, &[("Allow", "GET, POST")]),
        };
    }
    if path.starts_with("/api/") {
        return fail("Not found", 404);
    }

    // Everything else: static site from public/
    env.assets("ASSETS")?.fetch_request(req).await
}

async fn create_lead(mut req: Request, env: &Env) -> Result<Response> {
    let url = req.url()?;

    // Only accept posts from our own pages.
    if let Some(origin) = req.headers().get("Origin")? {
        let same = Url::parse(&origin).ok().map(|o| o.host_str() == url.host_str() && o.port() == url.port());
        if same != Some(true) {
            return fail("Forbidden", 403);
        }
    }
    if !req.headers().get("Content-Type")?.unwrap_or_default().contains("application/json") {
        return fail("Invalid request.", 415);
    }
    let body = req.text().await?;
    if body.len() > MAX_BODY {
        return fail("Request too large.", 413);
    }
    let input: Value = match serde_json::from_str(&body) {
        Ok(v @ Value::Object(_)) => v,
        _ => return fail("Invalid request.", 400),
    };

    // Honeypot filled in => bot. Pretend success, store nothing.
    if is_spam(&input) {
        return json_response(json!({ "ok": true }), 200, &[]);
    }
    let lead = match validate(&input) {
        Ok(lead) => lead,
        Err(msg) => return fail(&msg, 422),
    };

    let ip = req.headers().get("CF-Connecting-IP")?.unwrap_or_default();
    let country = req.cf().and_then(|cf| cf.country()).unwrap_or_default();
    let ua: String = req.headers().get("User-Agent")?.unwrap_or_default().chars().take(300).collect();

    match save(env, &lead, &ip, &country, &ua).await {
        Ok((id, true)) => json_response(json!({ "ok": true, "id": id, "duplicate": true }), 200, &[]),
        Ok((id, false)) => json_response(json!({ "ok": true, "id": id }), 201, &[]),
        Err(e) => {
            console_error!("lead insert failed: {e}");
            fail("Could not save your details. Please call us instead.", 500)
        }
    }
}

/// Insert a lead; returns (id, duplicate?). Same phone + form within 2 minutes = duplicate.
async fn save(env: &Env, d: &Lead, ip: &str, country: &str, ua: &str) -> Result<(i64, bool)> {
    let db = env.d1("DB")?;

    let dup: Option<Value> = db
        .prepare("SELECT id FROM leads WHERE phone = ?1 AND form = ?2 AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ','now','-2 minutes') LIMIT 1")
        .bind(&[d.phone.as_str().into(), d.form.as_str().into()])?
        .first(None)
        .await?;
    if let Some(row) = dup {
        return Ok((row["id"].as_i64().unwrap_or(0), true));
    }

    let args: Vec<wasm_bindgen::JsValue> = [
        &d.form, &d.name, &d.phone, &d.service, &d.website, &d.cta, &d.slot, &d.page, &d.referrer,
    ]
    .iter()
    .map(|s| s.as_str().into())
    .chain([ip.into(), country.into(), ua.into()])
    .chain(
        [
            &d.email, &d.message, &d.extra, &d.utm_source, &d.utm_medium, &d.utm_campaign, &d.utm_term, &d.utm_content,
            &d.gclid, &d.fbclid, &d.msclkid, &d.landing_page, &d.landing_referrer, &d.first_touch,
        ]
        .iter()
        .map(|s| s.as_str().into()),
    )
    .collect();

    let res = db
        .prepare(
            "INSERT INTO leads (form, name, phone, service, website, cta, slot, page, referrer, ip, country, user_agent, email, message, extra,
               utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, msclkid, landing_page, landing_referrer, first_touch)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26)",
        )
        .bind(&args)?
        .run()
        .await?;
    let id = res.meta()?.and_then(|m| m.last_row_id).unwrap_or(0);
    Ok((id, false))
}

async fn list_leads(req: &Request, env: &Env) -> Result<Response> {
    let token = env.var("ADMIN_TOKEN").map(|v| v.to_string()).unwrap_or_default();
    let auth = req.headers().get("Authorization")?.unwrap_or_default();
    if token.is_empty() || !constant_time_eq(auth.as_bytes(), format!("Bearer {token}").as_bytes()) {
        return fail("Not found", 404);
    }
    let url = req.url()?;
    let raw = url.query_pairs().find(|(k, _)| k == "limit").map(|(_, v)| v.into_owned());
    let limit = list_limit(raw.as_deref());

    let rows: Vec<Value> = env
        .d1("DB")?
        .prepare("SELECT * FROM leads ORDER BY id DESC LIMIT ?1")
        .bind(&[limit.into()])?
        .all()
        .await?
        .results()?;
    json_response(json!({ "ok": true, "leads": rows }), 200, &[])
}

/// Compare without leaking how many leading bytes matched.
fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.iter().zip(b).fold(0u8, |acc, (x, y)| acc | (x ^ y)) == 0
}
