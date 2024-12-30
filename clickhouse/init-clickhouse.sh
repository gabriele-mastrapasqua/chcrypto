#!/bin/bash

echo 'Waiting for ClickHouse to be ready...';
sleep 5;

# Run your initialization commands here
clickhouse-client --host clickhouse -q "CREATE DATABASE IF NOT EXISTS default"

# Execute all SQL files in the ./clickhouse/schema directory
#for sql_file in ./clickhouse/schema/*.sql; do
for sql_file in /docker-entrypoint-initdb.d/schema/*.sql; do
  echo "Executing $sql_file..."
  #clickhouse-client -q "$(cat $sql_file)"
  clickhouse-client --host clickhouse -n < "$sql_file"
done

echo "ClickHouse initialization completed."
wait