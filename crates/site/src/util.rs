//! Small helpers: HTML escaping, asset fingerprints and dates.

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

/// Escape text for HTML (text and attribute values): & < > " '
pub fn escape(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 8);
    for c in s.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&#039;"),
            _ => out.push(c),
        }
    }
    out
}

/// Builds `/assets/...?v=<hash>` URLs. The hash comes from the file contents, so
/// browsers fetch a fresh copy whenever a file changes (assets are cached for a year).
pub struct Assets {
    dir: PathBuf,
    cache: Mutex<HashMap<String, Option<String>>>,
}

impl Assets {
    pub fn new(dir: PathBuf) -> Self {
        Self { dir, cache: Mutex::new(HashMap::new()) }
    }

    /// `asset("css/main.css")` -> `/assets/css/main.css?v=1a2b3c4d`
    pub fn url(&self, path: &str) -> String {
        let path = path.trim_start_matches('/');
        let mut cache = self.cache.lock().unwrap();
        let v = cache
            .entry(path.to_string())
            .or_insert_with(|| std::fs::read(self.dir.join(path)).ok().map(|b| short_hash(&b)))
            .clone();
        match v {
            Some(v) => format!("/assets/{path}?v={v}"),
            None => format!("/assets/{path}"),
        }
    }

    pub fn exists(&self, path: &str) -> bool {
        self.dir.join(path).is_file()
    }
}

/// First 8 hex chars of a 64-bit FNV-1a hash.
pub fn short_hash(bytes: &[u8]) -> String {
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;
    for b in bytes {
        h ^= u64::from(*b);
        h = h.wrapping_mul(0x0100_0000_01b3);
    }
    format!("{h:016x}")[..8].to_string()
}

/// Current UTC time as (year, month, day, hour, minute, second, millis).
pub fn now_utc() -> (i64, u32, u32, u32, u32, u32, u32) {
    let d = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default();
    let secs = d.as_secs() as i64;
    let (y, m, day) = civil_from_days(secs.div_euclid(86_400));
    let rem = secs.rem_euclid(86_400) as u32;
    (y, m, day, rem / 3600, rem % 3600 / 60, rem % 60, d.subsec_millis())
}

/// `2026-11-13`
pub fn today() -> String {
    let (y, m, d, ..) = now_utc();
    format!("{y:04}-{m:02}-{d:02}")
}

/// `2026-11-13T06:59:05.145Z`, same format D1 stores in `created_at`.
pub fn iso_now() -> String {
    let (y, m, d, h, mi, s, ms) = now_utc();
    format!("{y:04}-{m:02}-{d:02}T{h:02}:{mi:02}:{s:02}.{ms:03}Z")
}

/// Days since 1970-01-01 -> (year, month, day). Howard Hinnant's algorithm.
fn civil_from_days(z: i64) -> (i64, u32, u32) {
    let z = z + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z.rem_euclid(146_097);
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = (doy - (153 * mp + 2) / 5 + 1) as u32;
    let m = if mp < 10 { mp + 3 } else { mp - 9 } as u32;
    let y = yoe + era * 400 + i64::from(m <= 2);
    (y, m, d)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn escapes_like_htmlspecialchars() {
        assert_eq!(escape(r#"A & B <i> "q" 'a' /"#), "A &amp; B &lt;i&gt; &quot;q&quot; &#039;a&#039; /");
    }

    #[test]
    fn dates() {
        assert_eq!(civil_from_days(0), (1970, 1, 1));
        assert_eq!(civil_from_days(20_405), (2025, 11, 13));
        assert_eq!(civil_from_days(11_016), (2000, 2, 29));
    }
}
