#!/bin/bash
set -e

# =============================================================================
# Backup Script for API Nest
# =============================================================================
# Usage: ./scripts/backup.sh
# =============================================================================

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="api_nest_backup_$TIMESTAMP"

echo "============================================"
echo "  Creating Backup - $BACKUP_NAME"
echo "============================================"

mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL database
echo "Backing up PostgreSQL database..."
docker compose exec -T db pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-api_nest}" > "$BACKUP_DIR/${BACKUP_NAME}.sql"

# Backup Redis data (optional, if needed)
echo "Backing up Redis data..."
docker compose exec -T redis redis-cli SAVE

# Create tarball
echo "Creating backup archive..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" -C "$BACKUP_DIR" "${BACKUP_NAME}.sql"

# Remove temporary SQL file
rm "$BACKUP_DIR/${BACKUP_NAME}.sql"

# List backups
echo ""
echo "============================================"
echo "  Backup Complete!"
echo "============================================"
ls -lah "$BACKUP_DIR"

echo ""
echo "To restore:"
echo "  docker compose exec -T db psql -U ${POSTGRES_USER:-postgres} ${POSTGRES_DB:-api_nest} < backups/[backup_file].sql"
