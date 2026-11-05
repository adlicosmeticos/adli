import app from "./app";
import { logger } from "./lib/logger";
import { seedInitialCatalog } from "./lib/seedCatalog";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function startServer() {
  await seedInitialCatalog();
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

startServer().catch((err: unknown) => {
  logger.error({ err }, "Error preparing the catalog");
  process.exit(1);
});
