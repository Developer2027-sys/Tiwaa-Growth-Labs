//! Lead form validation, shared by the Cloudflare Worker (`worker/`) and the local
//! dev server (`tgl serve`). One implementation, so production and local behave the same.
//!
//! Forms: `hero` (home hero), `popup` (lead popup) and `contact` (form before the footer).

use serde::Serialize;
use serde_json::{Map, Value};

/// Forms the API accepts.
pub const FORMS: &[&str] = &["hero", "popup", "contact"];

/// Largest request body we read (bytes).
pub const MAX_BODY: usize = 10 * 1024;

/// A cleaned, validated lead, ready to insert into the `leads` table.
#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Lead {
    pub form: String,
    pub name: String,
    pub phone: String,
    pub service: String,
    pub website: String,
    pub cta: String,
    pub slot: String,
    pub page: String,
    pub referrer: String,
    pub email: String,
    pub message: String,
    /// JSON object with page-specific fields (budget, city, ...), or "".
    pub extra: String,
}

/// Single-line text: strings and numbers only, whitespace runs collapsed, trimmed, cut to `max` chars.
pub fn clean(v: Option<&Value>, max: usize) -> String {
    let s = match v {
        Some(Value::String(s)) => s.clone(),
        Some(Value::Number(n)) => n.to_string(),
        _ => return String::new(),
    };
    let collapsed = s.split_whitespace().collect::<Vec<_>>().join(" ");
    collapsed.chars().take(max).collect()
}

/// Multi-line text: keeps line breaks (max one blank line), trims other runs of spaces.
pub fn clean_text(v: Option<&Value>, max: usize) -> String {
    let Some(Value::String(s)) = v else { return String::new() };
    let s = s.replace("\r\n", "\n").replace('\r', "\n");
    let mut out = String::with_capacity(s.len());
    let mut in_space = false;
    let mut newlines = 0;
    for c in s.chars() {
        if c == '\n' {
            in_space = false;
            newlines += 1;
            if newlines <= 2 {
                out.push('\n');
            }
        } else if c.is_whitespace() {
            newlines = 0;
            if !in_space {
                out.push(' ');
                in_space = true;
            }
        } else {
            newlines = 0;
            in_space = false;
            out.push(c);
        }
    }
    out.trim().chars().take(max).collect()
}

/// Page-specific fields: `{ key: value }`, max 10 pairs, keys like `budget` or `site_visit`.
/// Returned as a JSON string ("" when empty).
pub fn clean_extra(v: Option<&Value>) -> String {
    let Some(Value::Object(obj)) = v else { return String::new() };
    let mut out = Map::new();
    for (k, val) in obj.iter().take(10) {
        if !valid_extra_key(k) {
            continue;
        }
        let c = clean(Some(val), 200);
        if !c.is_empty() {
            out.insert(k.clone(), Value::String(c));
        }
    }
    if out.is_empty() {
        String::new()
    } else {
        Value::Object(out).to_string()
    }
}

/// `^[a-z][a-z0-9_]{0,29}$`
fn valid_extra_key(k: &str) -> bool {
    let b = k.as_bytes();
    !b.is_empty()
        && b.len() <= 30
        && b[0].is_ascii_lowercase()
        && b.iter().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || *c == b'_')
}

/// `^[+\d][\d\s-]{7,}$` and 8 to 15 digits in total.
pub fn valid_phone(phone: &str) -> bool {
    let mut chars = phone.chars();
    let Some(first) = chars.next() else { return false };
    if !(first == '+' || first.is_ascii_digit()) {
        return false;
    }
    let rest: Vec<char> = chars.collect();
    if rest.len() < 7 || !rest.iter().all(|c| c.is_ascii_digit() || c.is_whitespace() || *c == '-') {
        return false;
    }
    let digits = phone.chars().filter(|c| c.is_ascii_digit()).count();
    (8..=15).contains(&digits)
}

/// `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`
pub fn valid_email(email: &str) -> bool {
    if email.chars().any(char::is_whitespace) {
        return false;
    }
    let mut parts = email.split('@');
    let (Some(local), Some(domain), None) = (parts.next(), parts.next(), parts.next()) else {
        return false;
    };
    if local.is_empty() {
        return false;
    }
    // Some dot with at least 1 char before it and 2 after it.
    let chars: Vec<char> = domain.chars().collect();
    chars.iter().enumerate().any(|(i, c)| *c == '.' && i >= 1 && chars.len() - i - 1 >= 2)
}

/// True when the hidden honeypot field was filled in (a bot). Pretend success, store nothing.
pub fn is_spam(input: &Value) -> bool {
    !clean(input.get("hp"), 200).is_empty()
}

/// Clean and validate a posted lead. `Err` holds a message safe to show the visitor.
pub fn validate(input: &Value) -> Result<Lead, String> {
    let get = |k: &str| input.get(k);
    let mut d = Lead {
        form: clean(get("form"), 20),
        name: clean(get("name"), 80),
        phone: clean(get("phone"), 24),
        service: clean(get("service"), 120),
        website: clean(get("website"), 200),
        cta: clean(get("cta"), 200),
        page: clean(get("page"), 300),
        referrer: clean(get("referrer"), 300),
        email: clean(get("email"), 120).to_lowercase(),
        message: clean_text(get("message"), 1500),
        extra: clean_extra(get("extra")),
        slot: String::new(),
    };
    if !FORMS.contains(&d.form.as_str()) {
        return Err("Unknown form.".into());
    }
    if d.name.chars().count() < 2 {
        return Err("Please enter your name.".into());
    }
    if !valid_phone(&d.phone) {
        return Err("Please enter a valid phone number, for example +91 98765 43210.".into());
    }
    if !d.email.is_empty() && !valid_email(&d.email) {
        return Err("Please enter a valid email address.".into());
    }
    // Booking CTAs look like "Confirm Mon 17 Nov, 11:30 AM".
    d.slot = d.cta.strip_prefix("Confirm ").unwrap_or("").to_string();
    Ok(d)
}

/// `?limit=` for the admin list: 1 to 500, default 100 (also for 0 or junk).
pub fn list_limit(raw: Option<&str>) -> u32 {
    let n: i64 = raw
        .map(|s| {
            let s = s.trim();
            let (sign, digits) = match s.strip_prefix('-') {
                Some(r) => (-1, r),
                None => (1, s.strip_prefix('+').unwrap_or(s)),
            };
            let d: String = digits.chars().take_while(|c| c.is_ascii_digit()).take(9).collect();
            d.parse::<i64>().map(|v| v * sign).unwrap_or(0)
        })
        .unwrap_or(0);
    let n = if n == 0 { 100 } else { n };
    n.clamp(1, 500) as u32
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn ok(v: Value) -> Lead {
        validate(&v).expect("valid")
    }

    #[test]
    fn accepts_a_contact_lead_and_cleans_fields() {
        let d = ok(json!({
            "form": "contact", "name": "  Test   User ", "phone": "+91 98765 43210",
            "email": "Test@Example.com", "message": "Line one\r\n\r\n\r\n\r\nLine   two  ",
            "extra": {"budget": "Under 25k", "Bad Key": "x", "city": "  "}, "cta": "Send my enquiry"
        }));
        assert_eq!(d.name, "Test User");
        assert_eq!(d.email, "test@example.com");
        assert_eq!(d.message, "Line one\n\nLine two");
        assert_eq!(d.extra, r#"{"budget":"Under 25k"}"#);
        assert_eq!(d.slot, "");
    }

    #[test]
    fn rejects_bad_input_with_the_same_messages_as_before() {
        let base = json!({"form": "popup", "name": "Asha", "phone": "9876543210"});
        assert!(validate(&base).is_ok());
        let with = |k: &str, v: Value| { let mut b = base.clone(); b[k] = v; validate(&b).unwrap_err() };
        assert_eq!(with("form", json!("other")), "Unknown form.");
        assert_eq!(with("name", json!("A")), "Please enter your name.");
        assert!(with("phone", json!("12")).starts_with("Please enter a valid phone"));
        assert!(with("phone", json!("+1 2345 67890 12345 67")).starts_with("Please enter a valid phone"));
        assert_eq!(with("email", json!("bad@x")), "Please enter a valid email address.");
        assert_eq!(with("email", json!("a@b@c.com")), "Please enter a valid email address.");
    }

    #[test]
    fn phone_and_email_rules() {
        assert!(valid_phone("+91 98765-43210"));
        assert!(valid_phone("98765432"));
        assert!(!valid_phone("9876543"));
        assert!(!valid_phone("(98) 765 43210"));
        assert!(valid_email("a@b.co"));
        assert!(valid_email("a@mail.b.co"));
        assert!(!valid_email("a@.co"));
        assert!(!valid_email("a@b.c"));
        assert!(!valid_email("@b.com"));
    }

    #[test]
    fn slot_honeypot_and_limit() {
        let d = ok(json!({"form": "popup", "name": "Asha", "phone": "9876543210", "cta": "Confirm Mon 17 Nov, 11:30 AM"}));
        assert_eq!(d.slot, "Mon 17 Nov, 11:30 AM");
        assert!(is_spam(&json!({"hp": "x"})));
        assert!(!is_spam(&json!({"hp": "  "})));
        assert_eq!(list_limit(None), 100);
        assert_eq!(list_limit(Some("0")), 100);
        assert_eq!(list_limit(Some("abc")), 100);
        assert_eq!(list_limit(Some("20x")), 20);
        assert_eq!(list_limit(Some("9999")), 500);
        assert_eq!(list_limit(Some("-5")), 1);
    }
}
