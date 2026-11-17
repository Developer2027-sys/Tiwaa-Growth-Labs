//! Pages: route, meta tags and the ordered list of sections (templates/sections/...).
//!
//! To add a page:
//!   1. add an entry to `routes()` below, e.g. ("/about", "about")
//!   2. add a `Page` for it in `page()`
//!   3. create its sections in templates/sections/about/...
//! Then run `npm run build` (or `npm run dev` to preview).

use crate::contact_form::CfConfig;
use serde_json::{json, Value};

/// Request path -> page id. Built to public/index.html, public/services.html, ...
pub fn routes() -> &'static [(&'static str, &'static str)] {
    &[
        ("/", "home"),
        ("/services", "services"),
        ("/services/seo", "seo"),
        ("/services/google-ads", "google-ads"),
        ("/services/meta-ads", "meta-ads"),
        ("/services/social-media-marketing", "social-media"),
        ("/services/whatsapp-automation", "whatsapp-automation"),
        ("/services/website-design", "website-design"),
        ("/services/content-video", "content-video"),
        ("/services/analytics-crm", "analytics-crm"),
        ("/services/conversions-api", "conversions-api"),
        ("/blog", "blog"),
        ("/blog/cut-cost-per-site-visit-meta-lead-forms", "blog-meta-lead-forms"),
        ("/blog/build-eoi-list-before-project-launch", "blog-eoi-list"),
        ("/blog/whatsapp-auto-replies-property-enquiries", "blog-whatsapp-auto-replies"),
        ("/about", "about"),
        ("/our-work", "work"),
        ("/contact", "contact"),
        ("/industries/real-estate", "real-estate"),
    ]
}

/// Permanent (301) redirects: old or alternative URLs -> the real page.
/// Written to public/_redirects for Cloudflare; the dev server follows them too.
pub fn redirects() -> &'static [(&'static str, &'static str)] {
    &[
        ("/home", "/"),
        ("/blogs", "/blog"),
        ("/blog.html", "/blog"),
        ("/blog-cut-cost-per-site-visit-meta-lead-forms.html", "/blog/cut-cost-per-site-visit-meta-lead-forms"),
        ("/blog-build-eoi-list-before-project-launch.html", "/blog/build-eoi-list-before-project-launch"),
        ("/blog/eoi-list", "/blog/build-eoi-list-before-project-launch"),
        ("/blog-whatsapp-auto-replies-property-enquiries.html", "/blog/whatsapp-auto-replies-property-enquiries"),
        ("/blog/whatsapp-auto-replies", "/blog/whatsapp-auto-replies-property-enquiries"),
        ("/about-us", "/about"),
        ("/our-work.html", "/our-work"),
        ("/work", "/our-work"),
        ("/portfolio", "/our-work"),
        ("/case-studies", "/our-work"),
        ("/about.html", "/about"),
        ("/about-us.html", "/about"),
        ("/contact-us", "/contact"),
        ("/real-estate.html", "/industries/real-estate"),
        ("/real-estate", "/industries/real-estate"),
        ("/real-estate-marketing", "/industries/real-estate"),
        ("/contact.html", "/contact"),
        ("/contact-us.html", "/contact"),
        // file names used in the design artifact
        ("/seo-services.html", "/services/seo"),
        ("/seo-services", "/services/seo"),
        ("/seo", "/services/seo"),
        ("/google-ads.html", "/services/google-ads"),
        ("/google-ads", "/services/google-ads"),
        ("/ppc", "/services/google-ads"),
        ("/meta-ads.html", "/services/meta-ads"),
        ("/meta-ads", "/services/meta-ads"),
        ("/social-media.html", "/services/social-media-marketing"),
        ("/social-media", "/services/social-media-marketing"),
        ("/services/social-media", "/services/social-media-marketing"),
        ("/whatsapp-automation.html", "/services/whatsapp-automation"),
        ("/whatsapp-automation", "/services/whatsapp-automation"),
        ("/services/whatsapp", "/services/whatsapp-automation"),
        ("/website-design.html", "/services/website-design"),
        ("/website-design", "/services/website-design"),
        ("/services/website", "/services/website-design"),
        ("/content-video.html", "/services/content-video"),
        ("/content-video", "/services/content-video"),
        ("/services/content", "/services/content-video"),
        ("/analytics-crm.html", "/services/analytics-crm"),
        ("/analytics-crm", "/services/analytics-crm"),
        ("/services/analytics", "/services/analytics-crm"),
        ("/services.html", "/services"),
        ("/service", "/services"),
        ("/our-services", "/services"),
        // Conversions API (CAPI) page: artifact file name, short and common alternative URLs
        ("/conversions-api.html", "/services/conversions-api"),
        ("/conversions-api", "/services/conversions-api"),
        ("/conversion-api", "/services/conversions-api"),
        ("/capi", "/services/conversions-api"),
        ("/meta-capi", "/services/conversions-api"),
        ("/meta-conversions-api", "/services/conversions-api"),
        ("/services/capi", "/services/conversions-api"),
        ("/services/conversion-api", "/services/conversions-api"),
        ("/services/meta-conversions-api", "/services/conversions-api"),
    ]
}

/// One section: template name plus extra template variables.
pub struct Section {
    pub name: &'static str,
    pub vars: Value,
}

fn s(name: &'static str) -> Section {
    Section { name, vars: Value::Null }
}

fn sv(name: &'static str, vars: Value) -> Section {
    Section { name, vars }
}

pub struct Page {
    pub id: &'static str,
    pub title: &'static str,
    pub og_title: Option<&'static str>,
    pub description: &'static str,
    /// <meta name="keywords">.
    pub keywords: &'static str,
    pub path: &'static str,
    pub css: Vec<&'static str>,
    pub js: Vec<String>,
    /// Raw HTML added at the end of <head> (structured data).
    pub head_extra: HeadExtra,
    pub robots: &'static str,
    /// Small platform logos next to Google, Meta, Instagram, WhatsApp... mentions (brands.rs).
    pub platform_icons: bool,
    /// Contact form before the footer: None hides it (404 page).
    pub contact_form: Option<CfConfig>,
    pub sections: Vec<Section>,
}

pub enum HeadExtra {
    None,
    Html(&'static str),
    /// A file in templates/ whose contents are added as-is.
    File(String),
}

const KEYWORDS: &str = "digital marketing agency gurugram, seo company gurugram, social media marketing, ppc agency, website development company gurugram, whatsapp marketing, tiwaa growth labs";

/// One service detail page (/services/seo, ...). Sections live in templates/sections/service/<id>/,
/// structured data (Service, FAQ, breadcrumb) in templates/layout/ld/<id>.html.
struct ServicePage {
    id: &'static str,
    title: &'static str,
    description: &'static str,
    keywords: &'static str,
    path: &'static str,
    /// Option pre-selected in the contact form's "What do you need help with?" list.
    service: &'static str,
    sections: Vec<Section>,
}

fn service_page(p: ServicePage) -> Page {
    Page {
        id: p.id,
        title: p.title,
        description: p.description,
        keywords: p.keywords,
        path: p.path,
        css: vec!["css/services.css", "css/service-page.css"],
        js: vec![format!("js/service/{}.js", p.id)],
        head_extra: HeadExtra::File(format!("layout/ld/{}.html", p.id)),
        platform_icons: false,
        contact_form: Some(CfConfig { service: Some(p.service), ..CfConfig::default() }),
        sections: p.sections,
        ..Page::default()
    }
}

impl Default for Page {
    fn default() -> Self {
        Page {
            id: "",
            title: "Tiwaa Growth Labs",
            og_title: None,
            description: "",
            keywords: KEYWORDS,
            path: "/",
            css: vec![],
            js: vec![],
            head_extra: HeadExtra::None,
            robots: "index, follow",
            platform_icons: false,
            contact_form: Some(CfConfig::default()),
            sections: vec![],
        }
    }
}

pub fn page(id: &str) -> Option<Page> {
    let p = match id {
        "home" => Page {
            id: "home",
            title: "Tiwaa Growth Labs",
            og_title: Some("Tiwaa Growth Labs | Digital Marketing & Web Development Agency in Gurugram"),
            description: "Tiwaa Growth Labs is a real estate marketing agency in Gurugram for developers, builders, channel partners and brokers: launch campaigns, walkthrough films, Meta and Google lead ads, landing pages, WhatsApp follow-up and LeadsPulse CRM.",
            keywords: "real estate marketing agency gurugram, real estate digital marketing, property marketing agency delhi ncr, real estate lead generation, builder marketing, channel partner marketing, site visit campaigns, leadspulse crm, tiwaa growth labs",
            path: "/",
            // FAQ structured data is filled in by assets/js/main.js from the FAQ list.
            head_extra: HeadExtra::Html(r#"<script type="application/ld+json" id="faq-ld"></script>"#),
            sections: vec![
                s("home/01-hero"),       // headline + "Talk to Us" form
                s("home/02-logo-band"),  // scrolling client + platform logos
                s("home/03-about"),      // "Built for impact" stats
                s("home/04-services"),   // funnel diagram + Attract / Engage / Convert
                s("home/05-industries"), // real estate segments
                s("home/06-process"),    // 5-step timeline
                s("home/07-work"),       // case studies + before/after slider
                sv("shared/reviews", json!({ "reviews_lead": "Developers, builders and channel partners across India trust us with their launches." })),
                s("home/09-roi"),        // ROI calculator
                s("home/10-why"),        // "Why Tiwaa" dark carousel
                s("home/11-clients"),    // brand grid + tech stack
                s("home/12-insights"),   // first 3 posts from content/blog.toml
                s("home/13-faq"),
            ],
            contact_form: Some(CfConfig {
                title: Some(r#"Tell us about your project. <span class="gt">We'll take it from there.</span>"#),
                ..CfConfig::default()
            }),
            ..Page::default()
        },
        "services" => Page {
            id: "services",
            title: "Digital Marketing Services | Tiwaa Growth Labs",
            description: "SEO, Google Ads, Meta and Instagram ads, social media, WhatsApp automation, websites, content, analytics and Conversions API from Tiwaa Growth Labs, a digital marketing agency in Gurugram. Get a free growth audit.",
            path: "/services",
            // Hub page only; css/services.css belongs to the service detail pages.
            css: vec!["css/services-hub.css"],
            js: vec!["js/services.js".into()],
            platform_icons: false,
            // Service list + breadcrumb + FAQ structured data.
            head_extra: HeadExtra::File("layout/services-ld.html".into()),
            sections: vec![
                s("services/01-sv-hero"),
                s("services/02-marquee"),
                s("services/03-sv-logos"),
                s("services/04-offer"),            // filterable service cards
                s("services/05-quiz"),             // 3-question recommender
                s("services/06-service-details"),  // 9 pinned service panels
                s("services/07-bundles"),          // popular service combinations
                s("services/08-why-choose"),
                s("services/09-different"),
                s("services/10-compare"),
                sv("shared/process", json!({ "process_title": r#"How we deliver <span class="gt">every service</span>"# })),
                s("shared/industries"),
                s("shared/reviews"),
                s("services/14-faq"),
            ],
            ..Page::default()
        },
        "blog" => Page {
            id: "blog",
            title: "Real Estate Marketing Blog: Lead Generation & Launch Playbooks | Tiwaa",
            description: "Practical real estate marketing guides for developers and channel partners: Meta and Google lead ads, launch campaigns, WhatsApp follow-up and cost per site visit.",
            keywords: "real estate marketing blog, real estate lead generation tips, property marketing guides, meta ads for real estate, real estate launch marketing",
            path: "/blog",
            css: vec!["css/blog.css"],
            js: vec!["js/blog.js".into()],
            // Blog + breadcrumb structured data
            head_extra: HeadExtra::File("layout/ld/blog.html".into()),
            sections: vec![s("blog/01-hero"), s("blog/02-list")],
            ..Page::default()
        },
        // Blog articles. To add another: copy one of these entries and its blog/posts/*.html,
        // add the route above, the post (with url) to content/blog.toml and a row in blog/posts/related.html.
        "blog-meta-lead-forms" => Page {
            id: "blog-meta-lead-forms",
            title: "How to Cut Cost per Site Visit with Meta Lead Forms | Tiwaa",
            description: "Real estate guide to Meta lead forms that bring site visits, not cheap leads: Higher intent forms, 3 qualifying questions, 5-minute follow-up and a free calculator.",
            keywords: "cost per site visit, meta lead forms real estate, facebook lead ads for real estate, real estate lead generation gurugram, property leads to site visits, real estate marketing agency",
            path: "/blog/cut-cost-per-site-visit-meta-lead-forms",
            css: vec!["css/blog.css"],
            js: vec!["js/blog-post.js".into()],
            // BlogPosting, breadcrumb and FAQ structured data
            head_extra: HeadExtra::File("layout/ld/blog-meta-lead-forms.html".into()),
            sections: vec![s("blog/posts/meta-lead-forms"), s("blog/posts/related")],
            ..Page::default()
        },
        "blog-eoi-list" => Page {
            id: "blog-eoi-list",
            title: "How to Build an EOI List Before Your Project Launch | Tiwaa",
            description: "Pre-launch guide for real estate developers: when to start, the EOI offer, teaser content, EOI landing pages, lead ads and how to turn EOIs into bookings.",
            keywords: "eoi real estate, pre launch marketing real estate, expression of interest property launch, real estate launch campaign, new project launch marketing gurugram",
            path: "/blog/build-eoi-list-before-project-launch",
            css: vec!["css/blog.css"],
            js: vec!["js/blog-post.js".into()],
            head_extra: HeadExtra::File("layout/ld/blog-eoi-list.html".into()),
            sections: vec![s("blog/posts/eoi-list"), s("blog/posts/related")],
            ..Page::default()
        },
        "blog-whatsapp-auto-replies" => Page {
            id: "blog-whatsapp-auto-replies",
            title: "WhatsApp Auto-Replies for Property Enquiries | Tiwaa",
            description: "Set up WhatsApp auto-replies for real estate: send the brochure in seconds, qualify buyers, book site visits and hand serious leads to sales.",
            keywords: "whatsapp auto reply real estate, whatsapp business api real estate, property enquiry follow up, whatsapp automation for builders, real estate lead follow up",
            path: "/blog/whatsapp-auto-replies-property-enquiries",
            css: vec!["css/blog.css"],
            js: vec!["js/blog-post.js".into()],
            head_extra: HeadExtra::File("layout/ld/blog-whatsapp-auto-replies.html".into()),
            sections: vec![s("blog/posts/whatsapp-auto-replies"), s("blog/posts/related")],
            ..Page::default()
        },
        "about" => Page {
            id: "about",
            title: "About Us | Tiwaa Growth Labs, Full-Service Digital Marketing Agency in Gurugram",
            og_title: Some("About Tiwaa Growth Labs"),
            description: "Tiwaa Growth Labs is a Gurugram-based digital marketing and growth team: strategy, performance ads, content, WhatsApp automation, websites and CRM under one roof, measured in customers.",
            keywords: "about tiwaa growth labs, digital marketing agency gurugram, growth marketing team india, tiwaa.io, leadspulse",
            path: "/about",
            css: vec!["css/about.css"],
            js: vec!["js/about.js".into()],
            // AboutPage, breadcrumb and FAQ structured data
            head_extra: HeadExtra::File("layout/ld/about.html".into()),
            // the office section has its own message form (sections/about/08-office.html)
            contact_form: None,
            sections: vec![
                s("about/01-hero"),      // story hero + growth curve, logo band (#lbRow1, main.js), numbers
                s("about/02-journey"),   // "What we built for real estate" timeline
                s("about/03-offer"),     // service list + live preview, pinned on desktop
                s("about/04-software"),  // dark LeadsPulse app demo + capture/assign/alert/report flow
                s("about/05-process"),   // 5-step timeline
                s("about/06-why-us"),    // sideways-scrolling reasons
                s("shared/reviews"),
                s("about/07-faq"),
                s("about/08-office"),    // map + message form
            ],
            ..Page::default()
        },
        "work" => Page {
            id: "work",
            title: "Our Work | Real Estate Marketing Case Studies | Tiwaa Growth Labs",
            og_title: Some("Our Work | Tiwaa Growth Labs"),
            description: "Real estate marketing case studies from Tiwaa Growth Labs: launch campaigns, walkthrough films, lead ads, landing pages and LeadsPulse CRM for developers and channel partners across Delhi NCR.",
            keywords: "real estate marketing case studies, real estate campaign results, property launch campaign, tiwaa growth labs portfolio, real estate lead generation results",
            path: "/our-work",
            css: vec!["css/work.css"],
            js: vec!["js/work.js".into()],
            sections: vec![
                s("work/01-hero"),        // featured case study + counters (opens .wk)
                s("work/02-cases"),       // filterable case study cards
                s("work/03-brands"),      // client logos grid
                sv("shared/reviews", json!({ "reviews_lead": "Developers, builders and channel partners on working with us." })),
                s("work/04-case-dialog"), // case study dialog + data (closes .wk)
            ],
            ..Page::default()
        },
        "contact" => Page {
            id: "contact",
            title: "Contact Tiwaa Growth Labs | Digital Marketing Agency in Gurugram",
            og_title: Some("Contact Tiwaa Growth Labs"),
            description: "Contact Tiwaa Growth Labs, a digital marketing agency in Gurugram. Call or WhatsApp +91 90501 26213, email info@tiwaagrowthlab.com or visit Spaze I Tech Park, Sector 49.",
            keywords: "contact tiwaa growth labs, digital marketing agency gurugram contact, marketing agency sohna road, free marketing audit, seo company gurugram contact",
            path: "/contact",
            css: vec!["css/contact.css"],
            js: vec!["js/contact.js".into()],
            // ContactPage, LocalBusiness and FAQ structured data
            head_extra: HeadExtra::File("layout/contact-ld.html".into()),
            // the page has its own enquiry form (sections/contact/01-hero.html)
            contact_form: None,
            sections: vec![
                s("contact/01-hero"),    // intro, contact cards and the enquiry form
                s("contact/02-office"),  // address, hours and Google Map
                s("contact/03-clients"), // client logos and testimonials
                s("contact/04-explore"), // services, work, Tiwaa.io, LeadsPulse
                s("contact/05-faq"),     // FAQ with topic tabs
                s("contact/06-cta"),
            ],
            ..Page::default()
        },
        // Industry page. Like the artifact it loads only its own stylesheet (no services.css /
        // service-page.css); sections are wrapped in .rp, opened in 01-hero and closed in 07-faq.
        "real-estate" => Page {
            id: "real-estate",
            title: "Real Estate Digital Marketing Agency in Gurugram | Tiwaa Growth Labs",
            description: "Real estate marketing in Gurugram for developers, channel partners and brokers: pre-launch campaigns, qualified buyer leads, WhatsApp follow-up, site visits and CRM by Tiwaa Growth Labs.",
            keywords: "real estate digital marketing agency gurugram, real estate lead generation, property marketing agency, real estate marketing delhi ncr, site visit campaigns, real estate whatsapp marketing",
            path: "/industries/real-estate",
            css: vec!["css/real-estate.css"],
            js: vec!["js/service/real-estate.js".into()],
            // Service, FAQ and breadcrumb structured data
            head_extra: HeadExtra::File("layout/ld/real-estate.html".into()),
            // no inline platform logos: the artifact page has none (and their .plf styles live in services.css)
            // Heading, text and fields as in the artifact's enquiry form; "Real Estate Marketing" pre-selected.
            contact_form: Some(CfConfig { service: Some("Real Estate Marketing"), ..CfConfig::default() }),
            sections: vec![
                s("industry/real-estate/01-hero"),          // dashboard hero + logo band (opens .rp)
                s("industry/real-estate/02-how"),           // "how it works" tabs
                s("industry/real-estate/03-lead-to-visit"), // timeline + WhatsApp chat
                s("industry/real-estate/04-services"),      // services hub + list
                s("industry/real-estate/05-projects"),      // property types
                s("industry/real-estate/06-case-study"),    // before/after toggle + charts
                s("shared/reviews"),
                s("industry/real-estate/07-faq"),           // closes .rp
            ],
            ..Page::default()
        },
        // Conversions API (CAPI) service page. Sections in templates/sections/service/conversions-api/.
        "conversions-api" => Page {
            id: "conversions-api",
            title: "Conversions API (CAPI) Setup for Meta & Google Ads | Tiwaa Growth Labs",
            description: "Meta Conversions API (CAPI) and Google enhanced conversions setup in Gurugram: server-side tracking that sends leads, site visits and bookings from your CRM back to your ads.",
            keywords: "conversions api setup, meta capi setup india, facebook conversions api agency, server side tracking gurugram, google enhanced conversions, capi for real estate, offline conversions meta",
            path: "/services/conversions-api",
            css: vec!["css/services.css", "css/service-page.css", "css/conversions-api.css"],
            js: vec!["js/service/conversions-api.js".into()],
            head_extra: HeadExtra::File("layout/ld/conversions-api.html".into()),
            contact_form: Some(CfConfig { service: Some("Conversions API (CAPI) setup"), ..CfConfig::default() }),
            sections: vec![
                s("service/conversions-api/01-hero"),
                s("service/conversions-api/02-stats"),
                s("service/conversions-api/03-what-is-capi"),
                s("service/conversions-api/04-problem"),
                s("service/conversions-api/05-pixel-vs-capi"),
                s("service/conversions-api/06-tools"),            // works with your tools (sources -> CAPI server -> ads)
                s("service/conversions-api/07-sub-services"),
                s("service/conversions-api/08-events"),
                s("service/conversions-api/09-process"),
                s("service/conversions-api/10-monthly"),
                s("shared/reviews"),
                s("service/conversions-api/11-faq"),
                s("service/conversions-api/12-related"),
            ],
            ..Page::default()
        },
        "seo" => service_page(ServicePage {
            id: "seo",
            title: "SEO Services in Gurugram | SEO Company | Tiwaa Growth Labs",
            description: "SEO services in Gurugram and Delhi NCR from Tiwaa Growth Labs: technical, local, content and AI search optimisation that brings leads, not just traffic. Get a free SEO audit.",
            keywords: "seo services gurugram, seo company gurugram, seo agency delhi ncr, local seo, technical seo, ai search optimisation, geo seo",
            path: "/services/seo",
            service: "Search Engine Optimization",
            sections: vec![
                s("service/seo/01-hero"),
                s("service/seo/02-stats"),
                s("service/seo/03-problem"),
                s("service/seo/04-sub-services"),
                s("service/seo/06-ai-search"),
                s("service/seo/07-process"),
                s("service/seo/08-featured-case-study"),
                s("service/seo/09-seo-vs-ads"),
                s("service/seo/10-results"),
                s("service/seo/11-monthly-deliverables"),
                s("service/seo/12-industries-tools"),
                s("shared/reviews"),
                s("service/seo/13-glossary"),
                s("service/seo/14-faq"),
                s("service/seo/15-related"),
            ],
        }),
        "google-ads" => service_page(ServicePage {
            id: "google-ads",
            title: "Google Ads Agency in Gurugram | PPC Management | Tiwaa Growth Labs",
            description: "Google Ads (PPC) management in Gurugram: Search, Maps, YouTube, Shopping and Performance Max campaigns with full conversion tracking and weekly optimisation by Tiwaa Growth Labs.",
            keywords: "google ads agency gurugram, ppc management, google ads management india, performance max agency, ppc company delhi ncr",
            path: "/services/google-ads",
            service: "Google Ads (PPC)",
            sections: vec![
                s("service/google-ads/01-hero"),
                s("service/google-ads/02-stats"),
                s("service/google-ads/03-problem"),
                s("service/google-ads/04-sub-services"),
                s("service/google-ads/05-ad-types"),
                s("service/google-ads/06-search-terms-cleanup"),
                s("service/google-ads/07-tracking-flow"),
                s("service/google-ads/08-google-meta"),
                s("service/google-ads/09-process"),
                s("service/google-ads/10-case-study"),
                s("service/google-ads/11-monthly"),
                s("service/google-ads/12-industries"),
                s("shared/reviews"),
                s("service/google-ads/13-faq"),
                s("service/google-ads/14-related"),
            ],
        }),
        "meta-ads" => service_page(ServicePage {
            id: "meta-ads",
            title: "Meta & Instagram Ads Agency in Gurugram | Tiwaa Growth Labs",
            description: "Facebook and Instagram ads that bring real enquiries: lead forms, Reels, click-to-WhatsApp and retargeting, with in-house creatives and instant follow-up. Meta ads agency in Gurugram.",
            keywords: "meta ads agency gurugram, facebook ads agency, instagram ads agency, instagram marketing gurugram, lead generation ads, click to whatsapp ads",
            path: "/services/meta-ads",
            service: "Meta & Instagram Ads",
            sections: vec![
                s("service/meta-ads/01-hero"),
                s("service/meta-ads/02-stats"),
                s("service/meta-ads/03-problem"),
                s("service/meta-ads/04-sub-services"),
                s("service/meta-ads/05-formats"),
                s("service/meta-ads/06-lead-flow"),
                s("service/meta-ads/07-process"),
                s("service/meta-ads/08-case-study"),
                s("service/meta-ads/09-monthly"),
                s("service/meta-ads/10-industries"),
                s("shared/reviews"),
                s("service/meta-ads/11-faq"),
                s("service/meta-ads/12-related"),
            ],
        }),
        "social-media" => service_page(ServicePage {
            id: "social-media",
            title: "Social Media Marketing Agency in Gurugram | Tiwaa Growth Labs",
            description: "Social media marketing in Gurugram: strategy, monthly content calendars, Reels, design, community management and reporting for Instagram, LinkedIn, YouTube and Facebook by Tiwaa Growth Labs.",
            keywords: "social media marketing agency gurugram, social media management, instagram marketing agency, linkedin marketing, smm company delhi ncr",
            path: "/services/social-media-marketing",
            service: "Social Media Management",
            sections: vec![
                s("service/social-media/01-hero"),
                s("service/social-media/02-stats"),
                s("service/social-media/03-problem"),
                s("service/social-media/04-sub-services"),
                s("service/social-media/05-platforms"),
                s("service/social-media/06-calendar"),
                s("service/social-media/07-community-flow"),
                s("service/social-media/08-process"),
                s("service/social-media/09-case-study"),
                s("service/social-media/10-monthly"),
                s("service/social-media/11-industries"),
                s("shared/reviews"),
                s("service/social-media/12-faq"),
                s("service/social-media/13-related"),
            ],
        }),
        "whatsapp-automation" => service_page(ServicePage {
            id: "whatsapp-automation",
            title: "WhatsApp Automation & Business API Agency in Gurugram | Tiwaa Growth Labs",
            description: "WhatsApp Business API, chatbots, broadcasts and lead automation powered by Tiwaa.io. Reply to every lead in seconds, qualify automatically and sync to your CRM. Live in 7 days.",
            keywords: "whatsapp business api, whatsapp automation agency, whatsapp chatbot india, whatsapp marketing gurugram, whatsapp broadcast, tiwaa.io",
            path: "/services/whatsapp-automation",
            service: "WhatsApp Marketing & Automation",
            sections: vec![
                s("service/whatsapp-automation/01-hero"),
                s("service/whatsapp-automation/02-stats"),
                s("service/whatsapp-automation/03-problem"),
                s("service/whatsapp-automation/04-sub-services"),
                s("service/whatsapp-automation/05-use-cases"),
                s("service/whatsapp-automation/06-flow"),
                s("service/whatsapp-automation/07-tiwaa-io"),
                s("service/whatsapp-automation/08-process"),
                s("service/whatsapp-automation/09-case-study"),
                s("service/whatsapp-automation/10-monthly"),
                s("service/whatsapp-automation/11-industries"),
                s("shared/reviews"),
                s("service/whatsapp-automation/12-faq"),
                s("service/whatsapp-automation/13-related"),
            ],
        }),
        "website-design" => service_page(ServicePage {
            id: "website-design",
            title: "Website Design Company in Gurugram | Tiwaa Growth Labs",
            description: "Website design and development in Gurugram: fast, mobile-first business websites, landing pages and online stores built for leads and SEO by Tiwaa Growth Labs.",
            keywords: "website design company gurugram, web development gurugram, landing page design, ecommerce website development, wordpress website design delhi ncr",
            path: "/services/website-design",
            service: "Website Design & Development",
            sections: vec![
                s("service/website-design/01-hero"),
                s("service/website-design/02-stats"),
                s("service/website-design/03-problem"),
                s("service/website-design/04-sub-services"),
                s("service/website-design/05-devices"),
                s("service/website-design/06-anatomy"),
                s("service/website-design/07-speed"),
                s("service/website-design/08-process"),
                s("service/website-design/09-case-study"),
                s("service/website-design/10-included"),
                s("service/website-design/11-industries"),
                s("shared/reviews"),
                s("service/website-design/12-faq"),
                s("service/website-design/13-related"),
            ],
        }),
        "content-video" => service_page(ServicePage {
            id: "content-video",
            title: "Content & Video Production Agency in Gurugram | Tiwaa Growth Labs",
            description: "Reels, brand films, product and property shoots, ad creatives and copy from Tiwaa Growth Labs, an in-house content and video studio in Gurugram with 48-hour turnaround.",
            keywords: "video production gurugram, content marketing agency, reels agency, brand film production, product photography gurugram, ad creatives",
            path: "/services/content-video",
            service: "Content Marketing",
            sections: vec![
                s("service/content-video/01-hero"),
                s("service/content-video/02-stats"),
                s("service/content-video/03-problem"),
                s("service/content-video/04-sub-services"),
                s("service/content-video/05-formats"),
                s("service/content-video/06-work-reel"),
                s("service/content-video/07-48-hour-flow"),
                s("service/content-video/08-process"),
                s("service/content-video/09-case-study"),
                s("service/content-video/10-monthly"),
                s("service/content-video/11-industries"),
                s("shared/reviews"),
                s("service/content-video/12-faq"),
                s("service/content-video/13-related"),
            ],
        }),
        "analytics-crm" => service_page(ServicePage {
            id: "analytics-crm",
            title: "Analytics & CRM Setup for Marketing in Gurugram | Tiwaa Growth Labs",
            description: "Marketing analytics and CRM setup in Gurugram: GA4, Tag Manager, call tracking, live dashboards, lead scoring and CRM pipelines that link every lead to its source by Tiwaa Growth Labs.",
            keywords: "crm setup gurugram, ga4 setup agency, marketing analytics india, lead tracking, conversion tracking, looker studio dashboard, crm for real estate",
            path: "/services/analytics-crm",
            service: "Analytics, CRM & Reporting",
            sections: vec![
                s("service/analytics-crm/01-hero"),
                s("service/analytics-crm/02-stats"),
                s("service/analytics-crm/03-problem"),
                s("service/analytics-crm/04-sub-services"),
                s("service/analytics-crm/05-attribution"),
                s("service/analytics-crm/06-pipeline"),
                s("service/analytics-crm/07-lead-routing-flow"),
                s("service/analytics-crm/08-process"),
                s("service/analytics-crm/09-case-study"),
                s("service/analytics-crm/10-monthly"),
                s("service/analytics-crm/11-industries"),
                s("shared/reviews"),
                s("service/analytics-crm/12-faq"),
                s("service/analytics-crm/13-related"),
            ],
        }),
        "404" => Page {
            id: "404",
            title: "Page not found | Tiwaa Growth Labs",
            description: "The page you were looking for could not be found.",
            path: "/404",
            robots: "noindex, follow",
            css: vec!["css/404.css"],
            // shows the typed address, "did you mean", page search
            js: vec!["js/404.js".into()],
            contact_form: None,
            sections: vec![s("shared/not-found")],
            ..Page::default()
        },
        _ => return None,
    };
    // Example of a page with its own form fields (kept here as a reference):
    // contact_form: Some(CfConfig { fields: Some(vec![contact_form::Field::Key("name"), Field::Key("phone"),
    //     Field::Key("budget"), Field::Key("city"), Field::Key("message")]), ..CfConfig::default() }),
    Some(p)
}
