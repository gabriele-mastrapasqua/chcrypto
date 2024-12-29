# crypto transactional data ingestion in Clickhouse
This app is a demo on of how to ingest crypto transactional data in Clickhouse, one of the fastest OLAP db, to handle high load of inserts in near-real time and make fast queries. 

## architecture
We will use kafka to ingestion, clikchouse to store and retrive the data and grafana to monitor and show some useful charts of the dataset.

Use cases:
- kafka: ingest transactional data then clikchouse streams the data in a table, then we will use a materialized view to improve the read performance. Kafka is supported as a data source for clikchouse. This enable us to stream the data from kafka to clickhouse seamlessly.

- clikchouse: 

we use those features to improve reading performance for those type of data: 

- a kafka engine table to connect and stream kafka dataset into a table in clikchouse automatically
- a materialized view to load final transactions and improve performance for reading


- grafana:
Used to check kafka and clikchouse loads in the node/s, and we could create custom dashboards with charts to query the dataset.


## start the project

- Step 1:
Run docker compose to setup the system:

To start docker run (add `-d` to run as a deamon):
```sh
docker-compose up
```

To stop this setup run:
```sh
docker-compose down
```

- Step 2:

Run:
```sh
npm run --prefix ./ingest ingest
```

For more info read the [ingest/README](./ingest/README.md)

- Step 3:

~~~~~ TODO ~~~~~~~~
~~~~~ TODO ~~~~~~~~

Run ****test****  to run api query endpoints

~~~~~ TODO ~~~~~~~~
~~~~~ TODO ~~~~~~~~

For more info read the [api/README](./api/README.md)