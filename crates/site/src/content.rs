//! Editable content: content/site.toml, content/blog.toml, content/clients.toml.

use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Site {
    pub name: String,
    pub legal_name: String,
    pub site_url: String,
    pub phone_display: String,
    pub phone_intl: String,
    pub email: String,
    pub api_path: String,
    pub palette: String,
    pub address: Address,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Address {
    pub street: String,
    pub city: String,
    pub region: String,
    pub postcode: String,
    pub country: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Post {
    pub tag: String,
    pub cat: String,
    pub mins: u32,
    pub g1: String,
    pub g2: String,
    pub title: String,
    pub excerpt: String,
    pub cta: String,
    /// Article page, e.g. "/blog/meta-lead-forms". None = card opens the lead popup.
    #[serde(default)]
    pub url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Client {
    pub name: String,
    #[serde(default)]
    pub logo: Option<String>,
    pub initials: String,
    pub color: String,
}

#[derive(Debug, Clone)]
pub struct Content {
    pub site: Site,
    pub posts: Vec<Post>,
    pub clients: Vec<Client>,
}

#[derive(Deserialize)]
struct BlogFile {
    posts: Vec<Post>,
}

#[derive(Deserialize)]
struct ClientsFile {
    clients: Vec<Client>,
}

fn read_toml<T: serde::de::DeserializeOwned>(path: &Path) -> Result<T, String> {
    let text = std::fs::read_to_string(path).map_err(|e| format!("{}: {e}", path.display()))?;
    toml::from_str(&text).map_err(|e| format!("{}: {e}", path.display()))
}

impl Content {
    pub fn load(dir: &Path) -> Result<Self, String> {
        Ok(Self {
            site: read_toml(&dir.join("site.toml"))?,
            posts: read_toml::<BlogFile>(&dir.join("blog.toml"))?.posts,
            clients: read_toml::<ClientsFile>(&dir.join("clients.toml"))?.clients,
        })
    }

    /// Unique post tags in first-seen order (filter chips on /blog).
    pub fn blog_tags(&self) -> Vec<String> {
        let mut tags: Vec<String> = Vec::new();
        for p in &self.posts {
            if !tags.contains(&p.tag) {
                tags.push(p.tag.clone());
            }
        }
        tags
    }
}
