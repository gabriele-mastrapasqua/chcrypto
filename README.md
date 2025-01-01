# AVAX Cryptocurrency analytics for transactional data in Clickhouse
This application is a demo on of how to ingest crypto transactional data in Clickhouse, one of the fastest OLAP db, to handle high load of inserts and make queries in near-real time. 

This project can ingest from a sample file with 1 mil rows from AVAX chain, or with another process that will stream live data from the AVAX mainnet in our db.

Sample dataset used for AVAX: `43114_txs.csv.tar.gz`


## Architecture
We will use kafka as a producer for ingestion, clickhouse as a consumer and as a store to save the data and the main data warehouse for this solution. Grafana will be used to monitor the kafka and clikchouse systems and to be used as an administration tool to show some useful charts of the dataset imported.

![Architecture](./screenshots/kafka%20to%20clickhouse.png?raw=true)


#### Kafka
ingest transactional data then clikchouse streams the data in a table as a first endpoint. Kafka is a supported data source for clikchouse. This enable us to stream the data from kafka to clickhouse seamlessly without writing any custom code.

See integrating kafka in Clickhouse for more info: https://clickhouse.com/docs/en/integrations/kafka/kafka-table-engine


We use also kafka UI, it's useful to see messages streamed through kafka and for debug:
![Kafka](./screenshots/kafka%20ui.png)


#### Clickhouse
we use those features to improve reading performance for those type of data: 
    - a Kafka engine table to connect and stream kafka dataset into a table in clikchouse automatically
    - a materialized view to load final transactions and improve performance for reading based on our use cases, in this example we need to index efficiently for `from` and `to` adresses for all on-chain transactions.

![ClickHouse](./screenshots/ch%20webui.png)


#### Grafana
Used to monitor (and optionally create alarms on some metrics) kafka and clikchouse nodes. We can also use this tool as an administration frontend to create custom queries for clikchouse, charts and data tables based on the real dataset from the db, without writing a custom frontend.

Here are some grafana ch plugin dashboards:
![Grafana CH cluster analysis](./screenshots/ch%20cluster%20analysis.png)
![Grafana CH data analysis](./screenshots/ch%20data%20analysis.png)
![Grafana CH query analysis](./screenshots/ch%20query%20analysis.png)
![Grafana CH detailed performance analysis](./screenshots/ch%20monitoring%20dashboard.png)


## Start the project
For this project I used docker compose to easly spin our services.

### Step 1: setup the system and dependencies
Run docker compose to setup the system and bootstrap the ch db:

- start:
```sh
make rebuild
```
- stop and remove all unused images:
```sh
make down
```


Or run with docker directly:

- To start docker run (add `-d` to run as a deamon):
```sh
docker-compose up
```

- To stop this setup run:
```sh
docker-compose down
```

This command should run clickhouse, kafka, grafana and an nodejs api service plus an ingestion script that loads live data from the chain.

If all is working correctly, you can try to access clickhouse web interface: http://localhost:8123/play 



### Step 2a: ingest manually the sample file to test ch
To start ingesting data from the sample file in the folder `./data` run:

ensure docker compose is running.
In another terminal run one time to load some sample data:
```sh
make ingestFile
```

> NOTE: This command is a one time commands, useful for debug / test the solution loading 1 mil rows in the db.
> NOTE: set your docker desktop at least with 4gb or ram allocated for all docker services.

### Step 2b: Check Grafana web UI and try some queries
Grafana is installed in this solution, and can be used as an admin tool to check the ch status and query performances with the default dashboards offered by the plugin, but also to make custom queries and charts using this connector as custom dashboard.

Try to make some queries and check if the dataset is working fine.

> NOTE: The docker for ingestion has a process that will fetch and insert new live data from the AVAX blockchain into clickhouse. So check also the ingest logs for errors, and ch to see if new block data are updated in the tables.

For more info read the [ingest/README](./ingest/README.md)

### Step 3: API queries
Try the public api under http://localhost:3000 and follow the swagger docs under http://localhost:3000/documentation .

For more info read the [api/README](./api/README.md)

![API docs](./screenshots/swagger%20api.png)


## TODO - improvements
- [ ] shared lib for zod and ts types commonly used for ingestion, api, ...
- [ ] e2e run test for api endpoints with perf check, and write in docker init scrips so it's automatically run after each restart
- [ ] track ingested files (checksum) so you can skip previous imported files / clean up data from the csv files used for test
