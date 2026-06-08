import { describe, it, expect } from 'vitest';
import { wouldCreateCycle, isValidConnection, validateDAG, topologicalSort } from './dag.js';
import type { GraphConnection, GraphEdge } from './types.js';

const n = (id: string) => ({ id });
const e = (source: string, target: string): GraphEdge => ({ id: `${source}-${target}`, source, target });
const conn = (source: string, target: string): GraphConnection => ({ source, target });

// ─── wouldCreateCycle ────────────────────────────────────────────────────────

describe('wouldCreateCycle', () => {
  it('self-loop daima döngüdür', () => {
    expect(wouldCreateCycle([n('a')], [], { source: 'a', target: 'a' })).toBe(true);
  });

  it('doğrudan döngü tespit eder (a→b, b→a denemesi)', () => {
    expect(
      wouldCreateCycle([n('a'), n('b')], [e('a', 'b')], { source: 'b', target: 'a' })
    ).toBe(true);
  });

  it('dolaylı döngü tespit eder (a→b→c, c→a denemesi)', () => {
    const nodes = [n('a'), n('b'), n('c')];
    const edges = [e('a', 'b'), e('b', 'c')];
    expect(wouldCreateCycle(nodes, edges, { source: 'c', target: 'a' })).toBe(true);
  });

  it('döngüsüz doğrusal uzatma geçer', () => {
    const nodes = [n('a'), n('b'), n('c')];
    const edges = [e('a', 'b')];
    expect(wouldCreateCycle(nodes, edges, { source: 'b', target: 'c' })).toBe(false);
  });

  it('bağlantısız düğümler arası bağlantı geçer', () => {
    expect(wouldCreateCycle([n('a'), n('b')], [], { source: 'a', target: 'b' })).toBe(false);
  });

  it('dal yolları döngü oluşturmaz (a→b, a→c, b→d denemesi)', () => {
    const nodes = [n('a'), n('b'), n('c'), n('d')];
    const edges = [e('a', 'b'), e('a', 'c')];
    expect(wouldCreateCycle(nodes, edges, { source: 'b', target: 'd' })).toBe(false);
  });
});

// ─── isValidConnection ───────────────────────────────────────────────────────

describe('isValidConnection', () => {
  it('boş source geçersiz', () => {
    expect(isValidConnection(conn('', 'b'), [n('a'), n('b')], [])).toBe(false);
  });

  it('boş target geçersiz', () => {
    expect(isValidConnection(conn('a', ''), [n('a'), n('b')], [])).toBe(false);
  });

  it('aynı düğüme bağlantı geçersiz', () => {
    expect(isValidConnection(conn('a', 'a'), [n('a')], [])).toBe(false);
  });

  it('yinelenen kenar geçersiz', () => {
    const nodes = [n('a'), n('b')];
    const edges = [e('a', 'b')];
    expect(isValidConnection(conn('a', 'b'), nodes, edges)).toBe(false);
  });

  it('döngü oluşturacak bağlantı geçersiz', () => {
    const nodes = [n('a'), n('b')];
    const edges = [e('a', 'b')];
    expect(isValidConnection(conn('b', 'a'), nodes, edges)).toBe(false);
  });

  it('geçerli yeni bağlantı kabul edilir', () => {
    const nodes = [n('a'), n('b'), n('c')];
    const edges = [e('a', 'b')];
    expect(isValidConnection(conn('b', 'c'), nodes, edges)).toBe(true);
  });

  it('ilk bağlantı her zaman geçerlidir', () => {
    expect(isValidConnection(conn('x', 'y'), [n('x'), n('y')], [])).toBe(true);
  });
});

// ─── topologicalSort ─────────────────────────────────────────────────────────

describe('topologicalSort', () => {
  it('boş graf boş dizi döner', () => {
    expect(topologicalSort([], [])).toEqual([]);
  });

  it('tek izole düğüm', () => {
    expect(topologicalSort([n('a')], [])).toEqual(['a']);
  });

  it('doğrusal zincir: a→b→c', () => {
    const nodes = [n('a'), n('b'), n('c')];
    const edges = [e('a', 'b'), e('b', 'c')];
    expect(topologicalSort(nodes, edges)).toEqual(['a', 'b', 'c']);
  });

  it('elmas: a→b, a→c, b→d, c→d — a ilk d son', () => {
    const nodes = [n('a'), n('b'), n('c'), n('d')];
    const edges = [e('a', 'b'), e('a', 'c'), e('b', 'd'), e('c', 'd')];
    const result = topologicalSort(nodes, edges);
    expect(result).not.toBeNull();
    expect(result![0]).toBe('a');
    expect(result![3]).toBe('d');
  });

  it('döngü varsa null döner', () => {
    const nodes = [n('a'), n('b')];
    const edges = [e('a', 'b'), e('b', 'a')];
    expect(topologicalSort(nodes, edges)).toBeNull();
  });

  it('3 düğümlü döngü null döner', () => {
    const nodes = [n('a'), n('b'), n('c')];
    const edges = [e('a', 'b'), e('b', 'c'), e('c', 'a')];
    expect(topologicalSort(nodes, edges)).toBeNull();
  });

  it('bağlantısız düğümler dahil tüm düğümleri döner', () => {
    const nodes = [n('a'), n('b'), n('c')]; // c bağlantısız
    const edges = [e('a', 'b')];
    const result = topologicalSort(nodes, edges);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(3);
    expect(result).toContain('c');
  });
});

// ─── validateDAG ─────────────────────────────────────────────────────────────

describe('validateDAG', () => {
  it('düğüm yoksa geçersiz', () => {
    const result = validateDAG([], []);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('düğüm');
  });

  it('döngü varsa geçersiz ve mesaj döngüden bahseder', () => {
    const nodes = [n('a'), n('b')];
    const edges = [e('a', 'b'), e('b', 'a')];
    const result = validateDAG(nodes, edges);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('döngü');
  });

  it('geçerli DAG — topolojik sıralama döner', () => {
    const nodes = [n('a'), n('b'), n('c')];
    const edges = [e('a', 'b'), e('b', 'c')];
    const result = validateDAG(nodes, edges);
    expect(result.valid).toBe(true);
    expect(result.order).toEqual(['a', 'b', 'c']);
  });

  it('bağlantısız düğüm varken yine de geçerlidir', () => {
    const nodes = [n('a'), n('b'), n('c')]; // c bağlantısız
    const edges = [e('a', 'b')];
    const result = validateDAG(nodes, edges);
    expect(result.valid).toBe(true);
    expect(result.message).toContain('bağlantısız');
  });

  it('tek düğüm — geçerli ama bağlantısız uyarısı yok', () => {
    const result = validateDAG([n('a')], []);
    // Tek düğüm disconnected.length === nodes.length olduğu için uyarı vermez
    expect(result.valid).toBe(true);
  });
});
