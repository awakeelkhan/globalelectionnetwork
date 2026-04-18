#!/bin/bash
set -e

echo "=== Starting local DB setup ==="

# Start pg16
sudo systemctl start postgresql@16-main
sudo systemctl enable postgresql@16-main
sleep 2

# Create user and database
sudo -u postgres psql <<'SQL'
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pakload') THEN
    CREATE USER pakload WITH PASSWORD 'Khan123@#';
  END IF;
END $$;
SQL

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='elections'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE elections OWNER pakload;"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE elections TO pakload;"
sudo -u postgres psql -d elections -c "GRANT ALL ON SCHEMA public TO pakload;"

echo "=== Restoring dump ==="
PGPASSWORD='Khan123@#' /usr/lib/postgresql/16/bin/pg_restore \
  -h localhost -U pakload -d elections \
  --no-owner --role=pakload \
  /tmp/elections_backup.dump

echo "=== Verifying tables ==="
PGPASSWORD='Khan123@#' /usr/lib/postgresql/16/bin/psql \
  -h localhost -U pakload -d elections \
  -c "\dt"

echo "=== MIGRATION COMPLETE ==="
