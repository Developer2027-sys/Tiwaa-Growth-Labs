//! `tgl`: the Tiwaa Growth Labs site tool.
//!
//!   cargo run -p tgl-site -- build          render the site into public/ (for Cloudflare)
//!   cargo run -p tgl-site -- serve [port]   local preview at http://localhost:8000 with a
//!                                           local /api/leads (saves to storage/leads.jsonl)
//!
//! npm scripts wrap these: `npm run build`, `npm run dev`, `npm run deploy`.

mod brands;
mod build_site;
mod contact_form;
mod content;
mod pages;
mod render;
mod serve;
mod util;

use std::path::PathBuf;
use std::process::ExitCode;

/// Project root: the current folder if it has templates/, else the workspace this tool was built from.
fn project_root() -> PathBuf {
    let cwd = std::env::current_dir().unwrap_or_default();
    if cwd.join("templates").is_dir() && cwd.join("content").is_dir() {
        return cwd;
    }
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..")
}

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let root = project_root();
    let result = match args.first().map(String::as_str) {
        Some("build") => build_site::build(&root),
        Some("serve") => {
            let port = args.get(1).and_then(|p| p.parse().ok()).unwrap_or(8000);
            serve::serve(&root, port)
        }
        _ => {
            eprintln!("Usage: tgl build | tgl serve [port]");
            return ExitCode::from(2);
        }
    };
    match result {
        Ok(()) => ExitCode::SUCCESS,
        Err(e) => {
            eprintln!("error: {e}");
            ExitCode::FAILURE
        }
    }
}
