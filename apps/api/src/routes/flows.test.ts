import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildApp } from '../app.js';
import type { Flow, FlowSummary, GraphEdge, GraphNode } from '@synapse/shared';

const prisma = new PrismaClient();
const app = await buildApp({ prisma });

beforeEach(async () => {
  await prisma.flow.deleteMany();
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

const sampleNode = (id: string): GraphNode => ({
  id,
  type: 'trigger',
  position: { x: 0, y: 0 },
  data: {
    label: 'Webhook',
    description: 'test',
    icon: 'W',
    config: {},
    configFields: [],
  },
});

const sampleEdge = (s: string, t: string): GraphEdge => ({
  id: `${s}-${t}`,
  source: s,
  target: t,
});

describe('GET /flows', () => {
  it('boş listede [] döner', async () => {
    const res = await app.inject({ method: 'GET', url: '/flows' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it('updatedAt desc sıralı liste döner', async () => {
    await prisma.flow.create({
      data: { name: 'eski', nodes: '[]', edges: '[]' },
    });
    await new Promise((r) => setTimeout(r, 10));
    await prisma.flow.create({
      data: { name: 'yeni', nodes: '[]', edges: '[]' },
    });

    const res = await app.inject({ method: 'GET', url: '/flows' });
    const body = res.json() as FlowSummary[];
    expect(body).toHaveLength(2);
    expect(body[0].name).toBe('yeni');
    expect(body[1].name).toBe('eski');
  });
});

describe('POST /flows', () => {
  it('yeni flow oluşturur ve 201 döner', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/flows',
      payload: { name: 'My Flow', nodes: [sampleNode('a')], edges: [] },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json() as Flow;
    expect(body.name).toBe('My Flow');
    expect(body.nodes).toHaveLength(1);
    expect(body.nodes[0].id).toBe('a');
    expect(body.id).toBeTypeOf('string');
  });

  it('isim verilmediğinde "Untitled Flow" kullanır', async () => {
    const res = await app.inject({ method: 'POST', url: '/flows', payload: {} });
    expect(res.statusCode).toBe(201);
    expect((res.json() as Flow).name).toBe('Untitled Flow');
  });
});

describe('GET /flows/:id', () => {
  it('var olan flow için 200 ve parsed nodes/edges döner', async () => {
    const created = await prisma.flow.create({
      data: {
        name: 'X',
        nodes: JSON.stringify([sampleNode('a'), sampleNode('b')]),
        edges: JSON.stringify([sampleEdge('a', 'b')]),
      },
    });

    const res = await app.inject({ method: 'GET', url: `/flows/${created.id}` });
    expect(res.statusCode).toBe(200);
    const body = res.json() as Flow;
    expect(body.nodes).toHaveLength(2);
    expect(body.edges).toHaveLength(1);
    expect(body.edges[0].source).toBe('a');
  });

  it('olmayan flow için 404 döner', async () => {
    const res = await app.inject({ method: 'GET', url: '/flows/nope' });
    expect(res.statusCode).toBe(404);
  });
});

describe('PUT /flows/:id', () => {
  it('flow günceller', async () => {
    const created = await prisma.flow.create({
      data: { name: 'old', nodes: '[]', edges: '[]' },
    });
    const res = await app.inject({
      method: 'PUT',
      url: `/flows/${created.id}`,
      payload: { name: 'new', nodes: [sampleNode('a')] },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as Flow;
    expect(body.name).toBe('new');
    expect(body.nodes).toHaveLength(1);
  });

  it('olmayan flow için 404 döner', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/flows/nope',
      payload: { name: 'x' },
    });
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /flows/:id', () => {
  it('flow siler ve 204 döner', async () => {
    const created = await prisma.flow.create({
      data: { name: 'X', nodes: '[]', edges: '[]' },
    });
    const res = await app.inject({ method: 'DELETE', url: `/flows/${created.id}` });
    expect(res.statusCode).toBe(204);

    const check = await prisma.flow.findUnique({ where: { id: created.id } });
    expect(check).toBeNull();
  });

  it('olmayan flow için 404 döner', async () => {
    const res = await app.inject({ method: 'DELETE', url: '/flows/nope' });
    expect(res.statusCode).toBe(404);
  });
});

describe('GET /health', () => {
  it('200 + status: ok döner', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });
});
