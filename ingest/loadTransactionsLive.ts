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
const kafkaBroker = process.env.KAFKA_BROKER || "localhost:9092";
console.log("*** Kafka broker:", kafkaBroker);

const kafka = new Kafka({
  clientId: "ch-crypto-transactions",
  brokers: [kafkaBroker],
});
const producer = kafka.producer();

// AVAX blockchain client
const avaxClient = createPublicClient({
  chain: avalanche,
  transport: http(),
});

type InputTransaction = {
  blockHash: string;
  blockNumber: bigint;
  from: string;
  gas: bigint;
  gasPrice: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  hash: string;
  input: string;
  nonce: number;
  to: string;
  transactionIndex: number;
  value: bigint;
  type: string;
  accessList: any[];
  chainId: number;
  v: bigint;
  r: string;
  s: string;
  yParity: number;
  typeHex: string;
};

type OutputTransaction = {
  timestamp: string;
  status: string;
  block_number: string;
  tx_index: string;
  from: string;
  to: string;
  value: string;
  gas_limit: string;
  gas_used: string;
  gas_price: string;
};

const mapAvaxTransactionToChSchema = (
  input: InputTransaction
): OutputTransaction => {
  return {
    timestamp: new Date().toISOString(), // Assuming the current timestamp
    status: "success", // Assuming a default status
    block_number: input.blockNumber.toString(),
    tx_index: input.transactionIndex.toString(),
    from: input.from,
    to: input.to,
    value: input.value.toString(),
    gas_limit: input.gas.toString(),
    gas_used: 0n.toString(), // Assuming gas used is not provided in the input
    gas_price: input.gasPrice.toString(),
  };
};

async function run() {
  // await for kafka client to connect
  try {
    await producer.connect();
    console.log("Producer connected to Kafka");
  } catch (error) {
    console.error("Failed to connect to Kafka:", error);
    process.exit(1); // Exit the process if unable to connect
  }

  // then watch for new blocks in AVAX blockchain:
  avaxClient.watchBlocks({
    onBlock: async (block) => {
      console.log("New block:", block.hash);

      // wrap in a try catch cause viem could gives RPC errors sometimes
      try {
        const blockDetails = await avaxClient.getBlock({
          blockHash: block.hash,
        });
        console.log("Block details: ", blockDetails);

        if (blockDetails.transactions.length > 0) {
          console.log(`Transactions in block ${blockDetails.number}:`);

          const transactions = blockDetails.transactions;
          console.log(
            `Found new transactions for block ${block}, count: ${transactions.length} `,
            transactions
          );

          // process the transactions: send to kafka topic to produce an ingestion to ClickHouse
          for (const transaction of transactions) {
            try {
              const tx = await avaxClient.getTransaction({ hash: transaction });
              console.log("Transaction data extracted: ", tx);

              // map the transaction to the schema used in ch
              const outputTransaction = mapAvaxTransactionToChSchema(
                tx as unknown as InputTransaction
              );
              console.log("CH mapped data: ", outputTransaction);

              await producer.send({
                topic: "ch-crypto-transactions",
                messages: [{ value: JSON.stringify(outputTransaction) }],
              });
            } catch (error) {
              console.error("Failed to get transaction data: ", error);
              continue;
            }
          }
        } else {
          console.log(`No transactions in block ${blockDetails.number}`);
        }
      } catch (error) {
        console.error("Viem error when fetching block details: ", error);
      }
    },
  });
}

run().catch(console.error);
