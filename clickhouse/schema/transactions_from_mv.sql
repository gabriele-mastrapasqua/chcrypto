CREATE MATERIALIZED VIEW IF NOT EXISTS transactions_from_mv

ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
PRIMARY KEY (`from`)
ORDER BY (`from`, `block_number`, `tx_index`, `value`)

AS SELECT
    timestamp,
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
