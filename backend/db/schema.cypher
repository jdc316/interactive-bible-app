// Constraints
CREATE CONSTRAINT book_name_unique IF NOT EXISTS FOR (b:Book) REQUIRE b.name IS UNIQUE;
CREATE CONSTRAINT verse_reference_unique IF NOT EXISTS FOR (v:Verse) REQUIRE v.reference IS UNIQUE;
CREATE CONSTRAINT translation_code_unique IF NOT EXISTS FOR (t:Translation) REQUIRE t.code IS UNIQUE;
CREATE CONSTRAINT user_email_unique IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE;

// Indexes
CREATE INDEX book_name_idx IF NOT EXISTS FOR (b:Book) ON (b.name);
CREATE INDEX chapter_number_idx IF NOT EXISTS FOR (c:Chapter) ON (c.number);
CREATE INDEX verse_reference_idx IF NOT EXISTS FOR (v:Verse) ON (v.reference);
// Note: fulltext on map keys is not portable; skip verse_text_fulltext for now
CREATE INDEX translation_code_idx IF NOT EXISTS FOR (t:Translation) ON (t.code);
CREATE INDEX user_email_idx IF NOT EXISTS FOR (u:User) ON (u.email);
CREATE INDEX savedview_user_idx IF NOT EXISTS FOR (sv:SavedView) ON (sv.userId);
CREATE INDEX resource_title_idx IF NOT EXISTS FOR (r:Resource) ON (r.title);
CREATE FULLTEXT INDEX resource_description_fulltext IF NOT EXISTS FOR (r:Resource) ON EACH [r.description];
CREATE INDEX auditlog_timestamp_idx IF NOT EXISTS FOR (al:AuditLog) ON (al.timestamp);
CREATE INDEX auditlog_user_idx IF NOT EXISTS FOR (al:AuditLog) ON (al.userId);
CREATE INDEX references_type_idx IF NOT EXISTS FOR ()-[r:REFERENCES]-() ON (r.type);

// Sample Translation Node (ESV primary)
MERGE (t:Translation {code: 'esv'})
SET t.id = coalesce(t.id, randomUUID())
SET t.name = 'English Standard Version'
SET t.licenseInfo = 'Copyright Crossway; fair use <= 500 verses'
SET t.default = true;