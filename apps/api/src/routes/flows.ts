import type { FastifyInstance } from 'fastify';
import type { Flow as DbFlow, PrismaClient } from '@prisma/client';
import type { Flow, FlowSummary, GraphEdge, GraphNode } from '@synapse/shared';

interface FlowsRouteDeps {
  prisma: PrismaClient;
}

function toSummary(row: DbFlow): FlowSummary {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toFlow(row: DbFlow): Flow {
  return {
    ...toSummary(row),
    nodes: JSON.parse(row.nodes) as GraphNode[],
    edges: JSON.parse(row.edges) as GraphEdge[],
  };
}

interface CreateFlowBody {
  name?: string;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
}

interface UpdateFlowBody {
  name?: string;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
}

export async function flowsRoutes(app: FastifyInstance, deps: FlowsRouteDeps) {
  const { prisma } = deps;

  app.get('/flows', async () => {
    const rows = await prisma.flow.findMany({ orderBy: { updatedAt: 'desc' } });
    return rows.map(toSummary);
  });

  app.get<{ Params: { id: string } }>('/flows/:id', async (req, reply) => {
    const row = await prisma.flow.findUnique({ where: { id: req.params.id } });
    if (!row) return reply.code(404).send({ error: 'Flow not found' });
    return toFlow(row);
  });

  app.post<{ Body: CreateFlowBody }>('/flows', async (req, reply) => {
    const { name, nodes = [], edges = [] } = req.body ?? {};
    const row = await prisma.flow.create({
      data: {
        name: name?.trim() || 'Untitled Flow',
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
      },
    });
    return reply.code(201).send(toFlow(row));
  });

  app.put<{ Params: { id: string }; Body: UpdateFlowBody }>(
    '/flows/:id',
    async (req, reply) => {
      const existing = await prisma.flow.findUnique({ where: { id: req.params.id } });
      if (!existing) return reply.code(404).send({ error: 'Flow not found' });

      const { name, nodes, edges } = req.body ?? {};
      const row = await prisma.flow.update({
        where: { id: req.params.id },
        data: {
          ...(name !== undefined ? { name: name.trim() || 'Untitled Flow' } : {}),
          ...(nodes !== undefined ? { nodes: JSON.stringify(nodes) } : {}),
          ...(edges !== undefined ? { edges: JSON.stringify(edges) } : {}),
        },
      });
      return toFlow(row);
    }
  );

  app.delete<{ Params: { id: string } }>('/flows/:id', async (req, reply) => {
    const existing = await prisma.flow.findUnique({ where: { id: req.params.id } });
    if (!existing) return reply.code(404).send({ error: 'Flow not found' });
    await prisma.flow.delete({ where: { id: req.params.id } });
    return reply.code(204).send();
  });
}
