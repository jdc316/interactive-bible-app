#!/bin/bash
set -euo pipefail

echo "[neo4j-restore] Starting..."

# Default paths
BACKUPS_DIR="/backups"
DUMP_PATH="$BACKUPS_DIR/neo4j.dump"
DATA_DB_DIR="/data/databases/neo4j"

# If database is missing or empty, try to restore
if [ ! -d "$DATA_DB_DIR" ] || [ -z "$(ls -A /data/databases 2>/dev/null || true)" ]; then
  echo "[neo4j-restore] No existing database detected. Attempting restore..."

  if [ -n "${NEO4J_DUMP_URL:-}" ]; then
    echo "[neo4j-restore] Downloading dump from NEO4J_DUMP_URL=$NEO4J_DUMP_URL"
    mkdir -p "$BACKUPS_DIR"
    curl -fsSL "$NEO4J_DUMP_URL" -o "$DUMP_PATH"
  fi

  if [ -f "$DUMP_PATH" ]; then
    echo "[neo4j-restore] Loading dump into database..."
    neo4j-admin database load --from="$DUMP_PATH" --database=neo4j --overwrite-destination=true
  else
    echo "[neo4j-restore] No dump found (NEO4J_DUMP_URL unset and $DUMP_PATH missing). Skipping restore."
  fi
else
  echo "[neo4j-restore] Existing database detected. Skipping restore."
fi

echo "[neo4j-restore] Handing off to Neo4j entrypoint..."
exec /startup/docker-entrypoint.sh neo4j



