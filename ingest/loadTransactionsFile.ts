import fs from "fs";
import csv from "csv-parser";
import { z } from "zod";
import { Kafka } from "kafkajs";

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
const kafkaBroker = process.env.KAFKA_BROKER || "localhost:9092";
console.log("*** Kafka broker:", kafkaBroker);

const kafka = new Kafka({
  clientId: "ch-crypto-transactions",
  brokers: [kafkaBroker],
});
const producer = kafka.producer();

async function run() {
  // await for kafka client to connect
  try {
    await producer.connect();
    console.log("Producer connected to Kafka");
  } catch (error) {
    console.error("Failed to connect to Kafka:", error);
    process.exit(1); // Exit the process if unable to connect
  }

  const results: Transaction[] = [];

  fs.createReadStream("data/43114_txs.csv")
    .pipe(csv())
    .on("data", (data) => {
      try {
        const transaction = transactionSchema.parse(data);
        results.push(transaction);
      } catch (e) {
        console.error("Invalid data:", e.errors);
      }
    })
    .on("end", async () => {
      // send all rows from file in Kafka
      console.log("Start sending batch transactions to Kafka. len: ", results.length);

      await producer.sendBatch({
        topicMessages: [
          {
            topic: "ch-crypto-transactions",
            messages: results,
          },
        ],
      });

      /*for (const transaction of results) {
        console.log("sending transaction to kafka: ", transaction);

        await producer.send({
          topic: "ch-crypto-transactions",
          messages: [{ value: JSON.stringify(transaction) }],
        });
      }*/

      console.log("All transactions have been sent to Kafka.");

      await producer.disconnect();
      console.log("Kafka client disconnected");
    });
}

run().catch(console.error);
