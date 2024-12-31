import fs from 'fs';
import csv from 'csv-parser';
import { z } from 'zod';
import { Kafka } from 'kafkajs';

// Define the schema using zod
const transactionSchema = z.object({
  timestamp: z.string(),
  status: z.string(),
  block_number: z.string(),
  tx_index: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string(),
  gas_limit: z.string(),
  gas_used: z.string(),
  gas_price: z.string(),
});

type Transaction = z.infer<typeof transactionSchema>;

// Initialize Kafka
const kafka = new Kafka({
  clientId: 'ch-crypto-transactions',
  brokers: ['kafka:9092'],
});

const producer = kafka.producer();

async function run() {
  await producer.connect();

  const results: Transaction[] = [];

  fs.createReadStream('data/43114_txs.csv')
    .pipe(csv())
    .on('data', (data) => {
      try {
        const transaction = transactionSchema.parse(data);
        results.push(transaction);
      } catch (e) {
        console.error('Invalid data:', e.errors);
      }
    })
    .on('end', async () => {
      for (const transaction of results) {
        await producer.send({
          topic: 'transactions',
          messages: [
            { value: JSON.stringify(transaction) },
          ],
        });
      }
      await producer.disconnect();
      console.log('All transactions have been sent to Kafka.');
    });
}

run().catch(console.error);