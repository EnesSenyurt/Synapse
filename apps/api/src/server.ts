import { buildApp } from './app.js';
import { prisma } from './db/client.js';

const port = Number(process.env.PORT ?? 3001);
const webOrigin = process.env.WEB_ORIGIN;

const app = await buildApp({ prisma, webOrigin });

try {
  await app.listen({ port, host: '0.0.0.0' });
  app.log.info(`API listening on http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  await prisma.$disconnect();
  process.exit(1);
}
