-- Leads captured from the website forms (hero "Talk to Us", popup, booking slots).
-- Applied to Cloudflare D1 with:  npx wrangler d1 migrations apply tiwaa-leads --remote
CREATE TABLE IF NOT EXISTS leads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  form        TEXT    NOT NULL,                 -- 'hero' | 'popup'
  name        TEXT    NOT NULL,
  phone       TEXT    NOT NULL,
  service     TEXT,                             -- service / goal picked in the form
  website     TEXT,                             -- optional site URL (popup)
  cta         TEXT,                             -- which button opened the popup
  slot        TEXT,                             -- booked call slot, e.g. 'Mon 16 Nov, 10:00 AM'
  page        TEXT,                             -- page path the lead came from
  referrer    TEXT,
  ip          TEXT,
  country     TEXT,
  user_agent  TEXT,
  status      TEXT    NOT NULL DEFAULT 'new'    -- for your team: new / contacted / won / lost
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at);
CREATE INDEX IF NOT EXISTS idx_leads_phone      ON leads (phone);
