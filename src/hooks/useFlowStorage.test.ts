import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Node, Edge } from '@xyflow/react';
import { loadFromStorage, useFlowStorage } from './useFlowStorage';

const STORAGE_KEY = 'synapse-flow-data';

const baseNodes: Node[] = [{ id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Test' } }];
const baseEdges: Edge[] = [];

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── loadFromStorage ─────────────────────────────────────────────────────────

describe('loadFromStorage', () => {
  it('storage boşken null döner', () => {
    expect(loadFromStorage()).toBeNull();
  });

  it('geçerli veriyi geri yükler', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes: baseNodes, edges: baseEdges }));
    const result = loadFromStorage();
    expect(result).not.toBeNull();
    expect(result!.nodes).toHaveLength(1);
    expect(result!.edges).toHaveLength(0);
  });

  it('bozuk JSON\'da null döner', () => {
    localStorage.setItem(STORAGE_KEY, '{bozuk json');
    expect(loadFromStorage()).toBeNull();
  });

  it('nodes dizisi eksikse null döner', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ edges: [] }));
    expect(loadFromStorage()).toBeNull();
  });

  it('edges dizisi eksikse null döner', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes: [] }));
    expect(loadFromStorage()).toBeNull();
  });

  it('nodes dizi değilse null döner', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes: 'yanlış', edges: [] }));
    expect(loadFromStorage()).toBeNull();
  });
});

// ─── useFlowStorage ──────────────────────────────────────────────────────────

describe('useFlowStorage', () => {
  it('ilk render\'da otomatik kayıt yapmaz', () => {
    vi.useFakeTimers();
    renderHook(() => useFlowStorage(baseNodes, baseEdges));
    act(() => { vi.runAllTimers(); });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('props değişince 1 sn sonra otomatik kaydeder', () => {
    vi.useFakeTimers();
    const newNodes: Node[] = [
      ...baseNodes,
      { id: 'n2', position: { x: 100, y: 0 }, data: {} },
    ];

    const { rerender } = renderHook(
      ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) =>
        useFlowStorage(nodes, edges),
      { initialProps: { nodes: baseNodes, edges: baseEdges } }
    );

    rerender({ nodes: newNodes, edges: baseEdges });

    // Debounce süresi dolmadan kayıt yok
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    // 1 saniye ilerlet
    act(() => { vi.advanceTimersByTime(1000); });

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.nodes).toHaveLength(2);
  });

  it('debounce süresinden önce ikinci değişiklik zamanlayıcıyı sıfırlar', () => {
    vi.useFakeTimers();
    const extraNode: Node = { id: 'n3', position: { x: 200, y: 0 }, data: {} };

    const { rerender } = renderHook(
      ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) =>
        useFlowStorage(nodes, edges),
      { initialProps: { nodes: baseNodes, edges: baseEdges } }
    );

    // İlk değişiklik
    rerender({ nodes: [...baseNodes, { id: 'n2', position: { x: 100, y: 0 }, data: {} }], edges: baseEdges });
    act(() => { vi.advanceTimersByTime(500); });

    // 500ms sonra ikinci değişiklik — zamanlayıcı sıfırlanmalı
    rerender({ nodes: [...baseNodes, extraNode], edges: baseEdges });
    act(() => { vi.advanceTimersByTime(500); });

    // Toplam 1000ms geçti ama zamanlayıcı sıfırlandığından henüz kayıt yok
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    // 500ms daha — toplam 1000ms son değişiklikten itibaren
    act(() => { vi.advanceTimersByTime(500); });

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    // Kayıt son rerender'daki değerleri içermeli
    expect(saved.nodes.some((node: Node) => node.id === 'n3')).toBe(true);
  });

  it('save() debounce beklemeden anında kaydeder', () => {
    const { result } = renderHook(() => useFlowStorage(baseNodes, baseEdges));
    act(() => { result.current.save(); });
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.nodes).toHaveLength(1);
    expect(saved.edges).toHaveLength(0);
  });

  it('save() doğru nodes ve edges kaydeder', () => {
    const testEdges: Edge[] = [{ id: 'e1', source: 'n1', target: 'n2' }];
    const twoNodes: Node[] = [
      ...baseNodes,
      { id: 'n2', position: { x: 50, y: 50 }, data: {} },
    ];
    const { result } = renderHook(() => useFlowStorage(twoNodes, testEdges));
    act(() => { result.current.save(); });
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.nodes).toHaveLength(2);
    expect(saved.edges).toHaveLength(1);
    expect(saved.edges[0].id).toBe('e1');
  });

  it('clear() localStorage\'ı temizler', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes: baseNodes, edges: baseEdges }));
    const { result } = renderHook(() => useFlowStorage(baseNodes, baseEdges));
    act(() => { result.current.clear(); });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
