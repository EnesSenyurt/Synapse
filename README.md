# Synapse

Synapse, otomasyon senaryoları oluşturmak için tasarlanmış görsel bir DAG (Yönlendirilmiş Döngüsüz Graf) editörüdür. Tetikleyici ve eylem düğümlerini sürükle-bırak yöntemiyle tuvale ekleyip birbirine bağlayarak akışlar tasarlama imkanı sunar.

## Özellikler

- **Görsel düzenleyici** — Düğümleri sürükle-bırak ile tuval üzerine yerleştirin
- **DAG doğrulama** — Döngü oluşturan bağlantılar otomatik olarak engellenir
- **Düğüm düzenleme** — Her düğüm yan panelden düzenlenebilir
- **Kaydet / Yükle** — Senaryo tarayıcıya otomatik kaydedilir
- **JSON dışa aktarma** — Senaryoyu `.json` dosyası olarak indirme
- **Mini harita** — Büyük akışlarda kolay gezinti sağlar

## Kullanılan Teknolojiler

React Flow, TypeScript, Vite

## Proje Yapısı

src/
├── components/     # Sidebar, Toolbar, ConfigPanel
├── nodes/          # Özel düğüm tipleri ve tanımları
├── utils/          # DAG doğrulama algoritmaları
└── data/           # Düğüm şablonları

## Kullanım

1. Sol panelden bir **tetikleyici** veya **eylem** düğümü seçin ve tuvale sürükleyin.
2. Düğümler arasında bağlantı kurmak için kaynak düğümden hedef düğüme sürükleyin.
3. Düzenlemek istediğiniz düğüme tıklayarak sağ panelden yapılandırın.
4. **Doğrula** ile DAG geçerliliğini kontrol edin, **Kaydet** ile senaryoyu saklayın.
