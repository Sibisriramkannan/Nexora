#!/bin/bash

# Nexora Backup Script
# Usage: ./backup.sh

set -e

echo "📦 Nexora Backup Script"
echo "======================="

# Create backup directory
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup Database
echo "🗄️ Backing up database..."
docker-compose exec -T postgres pg_dump -U postgres nexora > $BACKUP_DIR/nexora_db_$TIMESTAMP.sql

# Backup Configurations
echo "⚙️ Backing up configurations..."
cp .env $BACKUP_DIR/nexora_env_$TIMESTAMP
cp config.yaml $BACKUP_DIR/nexora_config_$TIMESTAMP 2>/dev/null || true

# Compress backups
echo "🗜️ Compressing backups..."
gzip $BACKUP_DIR/nexora_db_$TIMESTAMP.sql
gzip $BACKUP_DIR/nexora_env_$TIMESTAMP 2>/dev/null || true

# Clean old backups (keep last 7 days)
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "✅ Backup completed!"
echo "📁 Backup location: $BACKUP_DIR"
echo "📄 Backup files:"
ls -la $BACKUP_DIR | grep $TIMESTAMP