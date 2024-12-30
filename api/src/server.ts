import express from "express";
import { ClickHouse } from "clickhouse";
import { z } from "zod";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
const port = 3000;

const clickhouse = new ClickHouse({
  url: "http://localhost",
  port: 8123,
  debug: false,
  basicAuth: null,
  isUseGzip: false,
  format: "json",
  raw: false,
  config: {
    session_id: "session_id if neeed",
    session_timeout: 60,
    output_format_json_quote_64bit_integers: 0,
    enable_http_compression: 0,
    database: "default",
  },
});

// Register Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
    },
  },
  apis: ["./src/server.ts"], // files containing annotations as above
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// simple validation for adresses in AVAX network for from and to parameters
const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: List transactions
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 10
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   timestamp:
 *                     type: string
 *                   status:
 *                     type: boolean
 *                   block_number:
 *                     type: integer
 *                   tx_index:
 *                     type: integer
 *                   from:
 *                     type: string
 *                   to:
 *                     type: string
 *                   value:
 *                     type: integer
 *                   gas_limit:
 *                     type: integer
 *                   gas_used:
 *                     type: integer
 *                   gas_price:
 *                     type: integer
 */
app.get("/transactions", async (req, res) => {
  const querySchema = z.object({
    from: addressSchema.optional(),
    to: addressSchema.optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    order: z.enum(["DESC", "ASC"]).optional().default("ASC"),
  });

  const query = querySchema.safeParse(req.query);

  if (!query.success) {
    return res.status(400).send({ error: "Invalid query parameters" });
  }

  const { from, to, page, limit, order } = query.data;

  if (!from && !to) {
    return res
      .status(400)
      .send({ error: 'Either "from" or "to" parameter is required' });
  }

  const offset = (page - 1) * limit;
  const view = from ? "transactions_from_mv" : "transactions_to_mv";
  const address = from || to;
  const orderBy = order ? order : "ASC";

  const sql = `
    SELECT * FROM ${view}
    WHERE ${from ? "`from`" : "`to`"} = '${address}'
    ORDER BY block_number ${orderBy}, tx_index ${orderBy}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const result = await clickhouse.query(sql).toPromise();

  if (result.length === 0) {
    return res.status(404).send({ error: "No transactions found" });
  }
  return res.json(result);
});

/**
 * @swagger
 * /transactions/count:
 *   get:
 *     summary: Count transactions
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *     responses:
 *       200:
 *         description: The count of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
app.get("/transactions/count", async (req, res) => {
  const querySchema = z.object({
    from: addressSchema.optional(),
    to: addressSchema.optional(),
  });

  const query = querySchema.safeParse(req.query);

  if (!query.success) {
    return res.status(400).send({ error: "Invalid query parameters" });
  }

  const { from, to } = query.data;

  if (!from && !to) {
    return res
      .status(400)
      .send({ error: 'Either "from" or "to" parameter is required' });
  }

  const view = from ? "transactions_from_mv" : "transactions_to_mv";
  const address = from || to;

  const sql = `
    SELECT count(*) as count FROM ${view}
    WHERE ${from ? "`from`" : "`to`"} = '${address}'
  `;

  const result = await clickhouse.query(sql).toPromise();

  return res.json(result[0]);
});

/**
 * @swagger
 * /transactions/value:
 *   get:
 *     summary: List transactions ordered by value
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 10
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *     responses:
 *       200:
 *         description: A list of transactions ordered by value
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   timestamp:
 *                     type: string
 *                   status:
 *                     type: boolean
 *                   block_number:
 *                     type: integer
 *                   tx_index:
 *                     type: integer
 *                   from:
 *                     type: string
 *                   to:
 *                     type: string
 *                   value:
 *                     type: integer
 *                   gas_limit:
 *                     type: integer
 *                   gas_used:
 *                     type: integer
 *                   gas_price:
 *                     type: integer
 */
app.get("/transactions/value", async (req, res) => {
  const querySchema = z.object({
    from: addressSchema.optional(),
    to: addressSchema.optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    order: z.enum(["DESC", "ASC"]).optional().default("ASC"),
  });

  const query = querySchema.safeParse(req.query);

  if (!query.success) {
    return res.status(400).send({ error: "Invalid query parameters" });
  }

  const { from, to, page, limit, order } = query.data;

  if (!from && !to) {
    return res
      .status(400)
      .send({ error: 'Either "from" or "to" parameter is required' });
  }

  const offset = (page - 1) * limit;
  const view = from ? "transactions_from_mv" : "transactions_to_mv";
  const address = from || to;
  const orderBy = order ? order : "ASC";

  const sql = `
    SELECT * FROM ${view}
    WHERE ${from ? "`from`" : "`to`"} = '${address}'
    ORDER BY value ${orderBy}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const result = await clickhouse.query(sql).toPromise();

  if (result.length === 0) {
    return res.status(404).send({ error: "No transactions found" });
  }

  return res.json(result);
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
