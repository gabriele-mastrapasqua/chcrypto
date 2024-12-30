# Api for crypto analytics
This project expose data for AVAX blockhain transactions from our clikchouse db. 
It uses fastify, so we need to use node version 20+ to run it correctly.

## prerequisites
- run docker compose first, so clickhouse database will be online
- nvm or other node version manager to install and run with node v20+

## API endpoints
We use 3 simple endpoints to fetch some data for transactions using `from` or `to` parameters, one of the two are mandatory for each api call. 

- GET `/transactions`: list all transactions using `from` or `to` address ordered by block number and transaction index. paginated using parameters `page` and `limit` to limit the size of the json response. `page` >= 1 and `limit` should be from 10 to 100 max. optional `order` param to choose ordering as `ASC` or `DESC`.
- GET `/transactions/count`: fetch the count for transactions of a `from` or `to` address. 
- GET `/transactions/value`: list all transactions using `from` or `to` address ordered by value (AVAX value transferred). paginated using parameters `page` and `limit` to limit the size of the json response. `page` >= 1 and `limit` should be from 10 to 100 max. optional `order` param to choose ordering as `ASC` or `DESC`.

You can access the Swagger documentation for those endpoints at http://localhost:3000/documentation.

## TODO - nice to have
- [ ] a date filter to fetch on all apis a range of time
- [ ] more validation and handling of exceptions
- [ ] e2e test integrations from api and ch
- [ ] types for req / responses
