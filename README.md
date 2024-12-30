# Cryptocurrency analytics for transactional data in Clickhouse
This application is a demo on of how to ingest crypto transactional data in Clickhouse, one of the fastest OLAP db, to handle high load of inserts and make queries in near-real time. 

Sample dataset for AVAX: `43114_txs.csv.tar.gz`


## architecture
We will use kafka as a producer for ingestion, clickhouse as a consumer and as a store to save the data and the main data warehouse for this solution. Grafana will be used to monitor the kafka and clikchouse systems and to be used as an administration tool to show some useful charts of the dataset imported.

Use cases:

- Kafka: ingest transactional data then clikchouse streams the data in a table as a first endpoint. Kafka is a supported data source for clikchouse. This enable us to stream the data from kafka to clickhouse seamlessly without writing any custom code.

- Clickhouse: 
we use those features to improve reading performance for those type of data: 

- a Kafka engine table to connect and stream kafka dataset into a table in clikchouse automatically
- a materialized view to load final transactions and improve performance for reading based on our use cases, in this example we need to index efficiently for `from` and `to` adresses for all on-chain transactions.


- Grafana:
Used to monitor (and optionally create alarms on some metrics) kafka and clikchouse nodes. We can also use this tool as an administration frontend to create custom queries for clikchouse, charts and data tables based on the real dataset from the db, without writing a custom frontend.


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