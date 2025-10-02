#!/bin/bash

# Add SSL parameters to DATABASE_URL if not already present
if [[ "$DATABASE_URL" != *"sslmode"* ]]; then
  if [[ "$DATABASE_URL" == *"?"* ]]; then
    export DATABASE_URL="${DATABASE_URL}&sslmode=require"
  else
    export DATABASE_URL="${DATABASE_URL}?sslmode=require"
  fi
fi

echo "Starting with DATABASE_URL: ${DATABASE_URL}"

# Start the application
exec npm start