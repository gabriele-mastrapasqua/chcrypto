CREATE TABLE kafka_transactions (
    timestamp DateTime,
    status Bool,
    block_number UInt64,
    tx_index UInt32,
    `from` LowCardinality(String),
    `to` LowCardinality(String),
    value UInt256,
    gas_limit UInt256,
    gas_used UInt256,
    gas_price UInt256
) ENGINE = Kafka
SETTINGS kafka_broker_list = 'localhost:9092',
         kafka_topic_list = 'transactions',
         kafka_group_name = 'clickhouse_group',
         kafka_format = 'JSONEachRow',
         kafka_num_consumers = 1;