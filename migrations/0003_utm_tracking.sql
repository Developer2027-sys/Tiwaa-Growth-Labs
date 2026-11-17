-- Marketing attribution for every lead (sent by assets/js/leads.js).
-- utm_* / click IDs = the last campaign touch within 90 days (a plain direct visit never overwrites it).
-- first_touch       = JSON of the very first touch: {"source","medium","campaign","term","content","landing_page","referrer","date"}.
-- Apply with:  npm run db:migrate
ALTER TABLE leads ADD COLUMN utm_source       TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN utm_medium       TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN utm_campaign     TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN utm_term         TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN utm_content      TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN gclid            TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN fbclid           TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN msclkid          TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN landing_page     TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN landing_referrer TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN first_touch      TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_leads_utm ON leads (utm_source, utm_medium, utm_campaign);
