#!/bin/bash

# Wait for Grafana to be ready
until curl -s http://localhost:3000/api/health | grep -q '\"database\":\"ok\"'; do
  echo "Waiting for Grafana to be ready..."
  sleep 1
done

# Provision the data source
curl -X POST -H "Content-Type: application/json" -d @./grafana/datasource.yaml http://admin:admin@localhost:3000/api/datasources