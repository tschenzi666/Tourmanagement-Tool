#!/bin/bash
# SessionStart hook: Ensure PostgreSQL is running

if pg_isready -h localhost -p 5432 -q 2>/dev/null; then
  echo "PostgreSQL is already running."
else
  echo "Starting PostgreSQL 16..."
  pg_ctlcluster 16 main start 2>/dev/null
  if pg_isready -h localhost -p 5432 -q 2>/dev/null; then
    echo "PostgreSQL started successfully."
  else
    echo "WARNING: Failed to start PostgreSQL."
  fi
fi
