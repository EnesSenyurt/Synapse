import { describe, it, expect } from 'vitest';
import { triggerTemplates, actionTemplates, type ConfigField } from './nodeTemplates';

// ─── triggerTemplates ─────────────────────────────────────────────────────────

describe('triggerTemplates', () => {
  it('en az 1 trigger template tanımlı', () => {
    expect(triggerTemplates.length).toBeGreaterThan(0);
  });

  it("tüm templateların type'ı 'trigger'", () => {
    for (const t of triggerTemplates) {
      expect(t.type).toBe('trigger');
    }
  });

  it('her template zorunlu string alanlarını içerir', () => {
    for (const t of triggerTemplates) {
      expect(typeof t.label).toBe('string');
      expect(t.label.length).toBeGreaterThan(0);
      expect(typeof t.description).toBe('string');
      expect(t.description.length).toBeGreaterThan(0);
      expect(typeof t.icon).toBe('string');
      expect(t.icon.length).toBeGreaterThan(0);
    }
  });

  it('configFields key\'leri defaultConfig içinde mevcut', () => {
    for (const t of triggerTemplates) {
      if (!t.configFields || !t.defaultConfig) continue;
      const configKeys = Object.keys(t.defaultConfig);
      for (const field of t.configFields) {
        expect(configKeys, `"${t.label}" template: "${field.key}" key eksik`).toContain(field.key);
      }
    }
  });

  it('her template en az 1 configField içerir', () => {
    for (const t of triggerTemplates) {
      expect(t.configFields?.length, `"${t.label}" template configFields eksik`).toBeGreaterThan(0);
    }
  });
});

// ─── actionTemplates ──────────────────────────────────────────────────────────

describe('actionTemplates', () => {
  it('en az 1 action template tanımlı', () => {
    expect(actionTemplates.length).toBeGreaterThan(0);
  });

  it("tüm templateların type'ı 'action'", () => {
    for (const t of actionTemplates) {
      expect(t.type).toBe('action');
    }
  });

  it('her template zorunlu string alanlarını içerir', () => {
    for (const t of actionTemplates) {
      expect(typeof t.label).toBe('string');
      expect(t.label.length).toBeGreaterThan(0);
      expect(typeof t.description).toBe('string');
      expect(t.description.length).toBeGreaterThan(0);
      expect(typeof t.icon).toBe('string');
      expect(t.icon.length).toBeGreaterThan(0);
    }
  });

  it("'select' tipi fieldların en az 1 seçeneği var", () => {
    for (const t of actionTemplates) {
      for (const field of t.configFields ?? []) {
        if (field.type === 'select') {
          expect(
            field.options?.length,
            `"${t.label}" → "${field.key}" select field options eksik`
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it("'select' seçeneklerinin label ve value'su dolu", () => {
    for (const t of actionTemplates) {
      for (const field of t.configFields ?? []) {
        for (const opt of field.options ?? []) {
          expect(opt.label.length, `"${t.label}" select option label boş`).toBeGreaterThan(0);
          expect(opt.value.length, `"${t.label}" select option value boş`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('configFields key\'leri defaultConfig içinde mevcut', () => {
    for (const t of actionTemplates) {
      if (!t.configFields || !t.defaultConfig) continue;
      const configKeys = Object.keys(t.defaultConfig);
      for (const field of t.configFields) {
        expect(configKeys, `"${t.label}" template: "${field.key}" key eksik`).toContain(field.key);
      }
    }
  });
});

// ─── Birleşik kontroller ──────────────────────────────────────────────────────

describe('tüm templatelar', () => {
  const all = [...triggerTemplates, ...actionTemplates];

  it('label değerleri benzersiz', () => {
    const labels = all.map((t) => t.label);
    const unique = new Set(labels);
    expect(unique.size).toBe(labels.length);
  });

  it("configField type değerleri geçerli enum üyesi", () => {
    const validTypes: ConfigField['type'][] = ['text', 'number', 'select', 'textarea'];
    for (const t of all) {
      for (const field of t.configFields ?? []) {
        expect(validTypes, `"${t.label}" → "${field.key}" geçersiz type`).toContain(field.type);
      }
    }
  });
});
