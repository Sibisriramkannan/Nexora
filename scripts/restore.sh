#!/bin/bash

# Nexora Restore Script
# Usage: ./restore.sh <backup-file>

set -e

echo "🔄 Nexora Restore Script"
echo "========================"

# Check backup file
if [ -z "$1" ]; then
    echo "❌ Please provide backup file path"
    echo "Usage: ./restore.sh <backup-file>"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Stop services
echo "🛑 Stopping services..."
docker-compose down

# Extract backup
echo "📂 Extracting backup..."
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE > backup_temp.sql
    BACKUP_FILE="backup_temp.sql"
fi

# Restore database
echo "🗄️ Restoring database..."
docker-compose up -d postgres
sleep 5
cat $BACKUP_FILE | docker-compose exec -T postgres psql -U postgres nexora

# Clean up
rm -f backup_temp.sql

# Start services
echo "🚀 Starting services..."
docker-compose up -d

echo "✅ Restore completed successfully!"