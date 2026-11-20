//! Editable content: content/site.toml, content/blog.toml, content/clients.toml.

use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Site {
    pub name: String,
    pub legal_name: String,
    pub site_url: String,
    /// Base for <link rel="canonical">; empty leaves the tag empty (set once the domain is live).
    #[serde(default)]
    pub canonical_url: String,
    pub phone_display: String,
    pub phone_intl: String,
    pub email: String,
    pub api_path: String,
    pub palette: String,
    pub address: Address,
    /// Social profile URLs. Empty ones are hidden in the footer and left out of structured data.
    #[serde(default)]
    pub social: Social,
    /// Tracking IDs. Empty ones are not loaded.
    #[serde(default)]
    pub analytics: Analytics,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(default)]
pub struct Social {
    pub facebook: String,
    pub linkedin: String,
    pub instagram: String,
    pub youtube: String,
}

impl Social {
    pub fn urls(&self) -> Vec<&str> {
        [&self.facebook, &self.linkedin, &self.instagram, &self.youtube].into_iter().map(|s| s.as_str()).filter(|s| !s.is_empty()).collect()
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(default)]
pub struct Analytics {
    /// Google Tag Manager container, e.g. "GTM-XXXXXXX". If set, add GA4 and Meta Pixel inside GTM instead of below.
    pub gtm_id: String,
    /// Google Analytics 4 measurement ID, e.g. "G-XXXXXXXXXX".
    pub ga4_id: String,
    /// Meta Pixel ID, digits only.
    pub meta_pixel_id: String,
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
    /// Thumbnail photo inside assets/images/, e.g. "blog/meta-lead-forms.webp".
    /// None (or a missing file) = the g1/g2 colour gradient is shown instead.
    #[serde(default)]
    pub image: Option<String>,
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
