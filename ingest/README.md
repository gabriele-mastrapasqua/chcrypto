# Ingest crypto dataset
This little script ingest into a kafka topic called `transactions` all the data from .csv files under the folder `./data`. 

Kafka will be connected to a clickhouse kafka engine table, so it will stream the data in real time to the database from the topic.


## prerequisites
Run docker compose and have a running kafka available before running this script.

## load a file manually for test 
To start ingesting data from the sample file in the folder `./data` run from the root of this project:

```sh
make ingestFile
```

## live data
The docker file for ingest project will have as an entrypoint a script that will start and fetch live C-Chain data from AVAX. it will then parse and convert them and store in ch through kafka.

![ingest live data from AVAX](../screenshots/ingest%20live.png)
