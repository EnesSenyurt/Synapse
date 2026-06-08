import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { PrismaClient } from '@prisma/client';
import { flowsRoutes } from './routes/flows.js';

export interface BuildAppOptions {
  prisma: PrismaClient;
  webOrigin?: string;
}

export async function buildApp(opts: BuildAppOptions) {
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' } });

  await app.register(cors, {
    origin: opts.webOrigin ?? true,
  });

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register((scope) => flowsRoutes(scope, { prisma: opts.prisma }));

  return app;
}
