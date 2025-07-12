// Constraints
CREATE CONSTRAINT book_name_unique FOR (b:Book) REQUIRE b.name IS UNIQUE;
CREATE CONSTRAINT verse_reference_unique FOR (v:Verse) REQUIRE v.reference IS UNIQUE;
CREATE CONSTRAINT translation_code_unique FOR (t:Translation) REQUIRE t.code IS UNIQUE;
CREATE CONSTRAINT user_email_unique FOR (u:User) REQUIRE u.email IS UNIQUE;

// Indexes
CREATE INDEX book_name_idx FOR (b:Book) ON (b.name);
CREATE INDEX chapter_number_idx FOR (c:Chapter) ON (c.number, c.bookId);
CREATE INDEX verse_reference_idx FOR (v:Verse) ON (v.reference);
CREATE FULLTEXT INDEX verse_text_fulltext FOR (v:Verse) ON EACH [v.texts[*]];
CREATE INDEX translation_code_idx FOR (t:Translation) ON (t.code);
CREATE INDEX user_email_idx FOR (u:User) ON (u.email);
CREATE INDEX savedview_user_idx FOR (sv:SavedView) ON (sv.userId);
CREATE INDEX resource_title_idx FOR (r:Resource) ON (r.title);
CREATE FULLTEXT INDEX resource_description_fulltext FOR (r:Resource) ON EACH [r.description];
CREATE INDEX auditlog_timestamp_idx FOR (al:AuditLog) ON (al.timestamp);
CREATE INDEX auditlog_user_idx FOR (al:AuditLog) ON (al.userId);
CREATE INDEX references_type_idx ON ()-[r:REFERENCES]-() ON (r.type);

// Sample Translation Node (ESV primary)
CREATE (t:Translation {id: apoc.uuid.generate(), code: 'esv', name: 'English Standard Version', licenseInfo: 'Copyright Crossway; fair use ≤500 verses', default: true});