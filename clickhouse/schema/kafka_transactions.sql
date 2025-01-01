
-- drop first the mat views if they exist
DROP TABLE IF EXISTS transactions_from_mv;
DROP TABLE IF EXISTS transactions_to_mv;
-- then drop the kafka table
DROP TABLE IF EXISTS kafka_transactions;

CREATE TABLE IF NOT EXISTS kafka_transactions (
    timestamp String,
    status LowCardinality(String),
    block_number UInt64,
    tx_index UInt32,
    `from` LowCardinality(String),
    `to` LowCardinality(String),
    value UInt256,
    gas_limit UInt256,
    gas_used UInt256,
    gas_price UInt256
) ENGINE = Kafka
SETTINGS kafka_broker_list = 'kafka:9092',
         kafka_topic_list = 'ch-crypto-transactions',
         kafka_group_name = 'clickhouse_group',
         kafka_format = 'JSONEachRow',
         kafka_num_consumers = 1;