CREATE MATERIALIZED VIEW IF NOT EXISTS transactions_to_mv

ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
PRIMARY KEY (`to`)
ORDER BY (`to`, `block_number`, `tx_index`, `value`)

AS SELECT
    parseDateTimeBestEffort(timestamp) as timestamp,
    status,
    block_number,
    tx_index,
    `from`,
    `to`,
    value,
    gas_limit,
    gas_used,
    gas_price
FROM kafka_transactions;
