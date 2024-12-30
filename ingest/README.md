# Ingest crypto dataset
This little script ingest into a kafka topic called `transactions` all the data from .csv files under the folder `./data`. 

Kafka will be connected to a clickhouse kafka engine table, so it will stream the data in real time to the database from the topic.


## prerequisites
Run docker compose and have a running kafka available before running this script.

## run 
To start ingesting data from the sample file in the folder `./data` run:

```sh
docker run --rm -v $(pwd)/ingest:/usr/src/app -w /usr/src/app node:23.5.0 npm run ingestFile
```