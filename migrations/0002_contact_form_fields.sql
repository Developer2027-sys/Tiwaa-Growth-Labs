-- Fields for the shared "contact form" shown before the footer on every page.
-- extra = JSON object with any page-specific fields (budget, city, ...).
ALTER TABLE leads ADD COLUMN email   TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN message TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN extra   TEXT NOT NULL DEFAULT '';
