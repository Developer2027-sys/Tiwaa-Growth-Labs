//! The contact form shown before the footer on every page
//! (templates/sections/shared/contact-form.html).
//!
//! Each page can change the heading, text, button, pre-selected service and the
//! fields (see `CfConfig` in pages.rs). Built-in field keys:
//!   name, phone, email, website, company, city, service, budget, message
//! or a fully custom field with `Field::Custom(FieldView { .. })`.
//!
//! name, phone, email, website, service, message are stored in their own D1 columns;
//! every other field goes into the JSON `extra` column (migrations/0002).

use serde::Serialize;

/// Fields that have their own column in the `leads` table.
const CORE: &[&str] = &["name", "phone", "email", "website", "service", "message"];

const SERVICES: &[&str] = &[
    "Free growth audit",
    "Search Engine Optimization",
    "Google Ads (PPC)",
    "Meta & Instagram Ads",
    "Social Media Management",
    "WhatsApp Marketing & Automation",
    "Real Estate Marketing",
    "Website Design & Development",
    "Content Marketing",
    "Analytics, CRM & Reporting",
    "Not sure yet",
];

const BUDGETS: &[&str] = &[
    "Under ₹25,000",
    "₹25,000 to ₹50,000",
    "₹50,000 to ₹1 lakh",
    "₹1 lakh to ₹3 lakh",
    "Above ₹3 lakh",
    "Not decided yet",
];

/// Per-page settings. Anything left as None uses the default.
#[derive(Debug, Clone, Default)]
pub struct CfConfig {
    /// Heading, HTML allowed (e.g. <span class="gt">...</span>).
    pub title: Option<&'static str>,
    pub lead: Option<&'static str>,
    pub cta: Option<&'static str>,
    /// Service pre-selected in the dropdown.
    pub service: Option<&'static str>,
    pub fields: Option<Vec<Field>>,
}

#[derive(Debug, Clone)]
#[allow(dead_code)] // used when a page sets its own `fields`
pub enum Field {
    /// A built-in field: "name", "phone", "budget", ...
    Key(&'static str),
    Custom(FieldView),
}

/// What the template receives for each field.
#[derive(Debug, Clone, Serialize)]
pub struct FieldView {
    pub key: String,
    pub label: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub required: bool,
    pub placeholder: String,
    pub auto: String,
    pub options: Vec<String>,
    pub wide: bool,
}

/// What the template receives as `cf`.
#[derive(Debug, Clone, Serialize)]
pub struct CfView {
    pub title: String,
    pub lead: String,
    pub cta: String,
    pub service: String,
    pub fields: Vec<FieldView>,
    pub core: Vec<&'static str>,
}

fn field(key: &str, label: &str, kind: &str, required: bool, placeholder: &str, auto: &str) -> FieldView {
    FieldView {
        key: key.into(),
        label: label.into(),
        kind: kind.into(),
        required,
        placeholder: placeholder.into(),
        auto: auto.into(),
        options: vec![],
        wide: false,
    }
}

fn select(key: &str, label: &str, options: &[&str]) -> FieldView {
    FieldView { options: options.iter().map(|s| s.to_string()).collect(), ..field(key, label, "select", false, "", "off") }
}

/// Built-in field definitions.
fn builtin(key: &str) -> FieldView {
    match key {
        "name" => field("name", "Your name", "text", true, "Rahul Sharma", "name"),
        "phone" => field("phone", "Phone / WhatsApp", "tel", true, "+91 98765 43210", "tel"),
        "email" => field("email", "Email", "email", false, "you@company.com", "email"),
        "website" => field("website", "Website", "url", false, "www.yourbrand.com", "url"),
        "company" => field("company", "Company", "text", false, "Your business name", "organization"),
        "city" => field("city", "City", "text", false, "Gurugram", "address-level2"),
        "service" => select("service", "What do you need help with?", SERVICES),
        "budget" => select("budget", "Monthly marketing budget", BUDGETS),
        "message" => FieldView {
            wide: true,
            ..field("message", "Tell us a little more", "textarea", false, "Your goals, current challenges, or anything we should know", "off")
        },
        other => {
            let mut label = other.to_string();
            if let Some(f) = label.get_mut(0..1) {
                f.make_ascii_uppercase();
            }
            field(other, &label, "text", false, "", "off")
        }
    }
}

impl CfConfig {
    pub fn view(&self) -> CfView {
        let fields = match &self.fields {
            Some(list) => list
                .iter()
                .map(|f| match f {
                    Field::Key(k) => builtin(k),
                    Field::Custom(v) => v.clone(),
                })
                .collect(),
            None => ["name", "phone", "email", "service", "message"].iter().map(|k| builtin(k)).collect(),
        };
        CfView {
            title: self.title.unwrap_or(r#"Tell us about your business. <span class="gt">We'll take it from there.</span>"#).into(),
            lead: self
                .lead
                .unwrap_or("Share a few details and a growth strategist will get back to you within one working day with ideas that fit your goals and budget.")
                .into(),
            cta: self.cta.unwrap_or("Send my enquiry").into(),
            service: self.service.unwrap_or("").into(),
            fields,
            core: CORE.to_vec(),
        }
    }
}
