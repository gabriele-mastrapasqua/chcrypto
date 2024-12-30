#!/bin/bash

# Start ClickHouse server in the background
/entrypoint.sh clickhouse-server &

# Wait for ClickHouse server to be ready
until clickhouse-client -q "SELECT 1" &>/dev/null; do
  echo "Waiting for ClickHouse to be ready..."
  sleep 1
done

# Run your initialization commands here
clickhouse-client -q "CREATE DATABASE IF NOT EXISTS default"
#clickhouse-client -q "CREATE TABLE IF NOT EXISTS default.my_table (id UInt32, name String) ENGINE = MergeTree() ORDER BY id"

# Execute all SQL files in the ./clickhouse/schema directory
#for sql_file in ./clickhouse/schema/*.sql; do
for sql_file in /docker-entrypoint-initdb.d/*.sql; do
  echo "Executing $sql_file..."
  #clickhouse-client -q "$(cat $sql_file)"
  clickhouse-client -n < "$sql_file"
done

echo "ClickHouse initialization completed."
wait