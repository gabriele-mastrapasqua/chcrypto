import { z } from "zod";
import { Kafka } from "kafkajs";
import { createPublicClient, http } from "viem";
import { avalanche } from "viem/chains";

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
const kafkaBroker = process.env.KAFKA_BROKER || 'kafka:9092';
console.log("*** Kafka broker:", kafkaBroker);

const kafka = new Kafka({
  clientId: "ch-crypto-transactions",
  brokers: [kafkaBroker],
});
const producer = kafka.producer();

const avaxClient = createPublicClient({
  chain: avalanche,
  transport: http(),
});

async function run() {
  await producer.connect();

  avaxClient.watchBlocks({
    onBlock: async (block) => {
      console.log("New block:", block.hash);
      const transactions = await avaxClient.getBlockTransactions({
        blockHash: block.hash,
      });
      console.log("Transactions in block:", transactions.length);

      for (const transaction of transactions) {
        await producer.send({
          topic: "transactions",
          messages: [{ value: JSON.stringify(transaction) }],
        });
      }
    },
  });
}

run().catch(console.error);
