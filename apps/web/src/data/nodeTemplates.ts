import type { ConfigField, NodeTemplate } from '@synapse/shared';

export type { ConfigField, NodeTemplate };

export const triggerTemplates: NodeTemplate[] = [
    {
        type: 'trigger',
        label: 'Webhook',
        description: 'HTTP webhook ile tetikleme',
        icon: '🌐',
        defaultConfig: { URL: '/api/webhook' },
        configFields: [
            { key: 'URL', label: 'Webhook URL', type: 'text', placeholder: '/api/webhook' }
        ]
    },
    {
        type: 'trigger',
        label: 'Zamanlayıcı',
        description: 'Belirli aralıklarla çalıştır',
        icon: '⏰',
        defaultConfig: { Cron: '*/5 * * * *' },
        configFields: [
            { key: 'Cron', label: 'Cron İfadesi', type: 'text', placeholder: '*/5 * * * *' }
        ]
    },
    {
        type: 'trigger',
        label: 'E-posta Alındı',
        description: 'Yeni e-posta geldiğinde tetikle',
        icon: '📧',
        defaultConfig: { Filtre: 'inbox' },
        configFields: [
            { key: 'Filtre', label: 'Filtre', type: 'text', placeholder: 'inbox, spam vb.' }
        ]
    },
    {
        type: 'trigger',
        label: 'Dosya İzleme',
        description: 'Dosya değişikliğinde tetikle',
        icon: '📁',
        defaultConfig: { Yol: '/data' },
        configFields: [
            { key: 'Yol', label: 'Dizin Yolu', type: 'text', placeholder: '/data' }
        ]
    },
    {
        type: 'trigger',
        label: 'Veritabanı Değişikliği',
        description: 'DB kaydı değiştiğinde tetikle',
        icon: '🗄️',
        defaultConfig: { Tablo: 'users' },
        configFields: [
            { key: 'Tablo', label: 'Tablo Adı', type: 'text', placeholder: 'users' }
        ]
    },
    {
        type: 'trigger',
        label: 'API Yoklama',
        description: 'Belirli aralıklarla API kontrol et',
        icon: '🔄',
        defaultConfig: { Aralık: '30s' },
        configFields: [
            { key: 'Aralık', label: 'Yoklama Aralığı', type: 'text', placeholder: '30s, 1m, vs.' }
        ]
    },
    {
        type: 'trigger',
        label: 'Takvim Etkinliği',
        description: 'Takvim etkinliği başlayınca tetikle',
        icon: '📅',
        defaultConfig: { Sağlayıcı: 'google', Dakika: '5' },
        configFields: [
            {
                key: 'Sağlayıcı',
                label: 'Takvim Sağlayıcı',
                type: 'select',
                options: [
                    { label: 'Google Calendar', value: 'google' },
                    { label: 'Outlook', value: 'outlook' },
                    { label: 'iCloud', value: 'icloud' }
                ]
            },
            { key: 'Dakika', label: 'Önceden Tetikleme (dk)', type: 'number', placeholder: '5' }
        ]
    },
    {
        type: 'trigger',
        label: 'GitHub Bildirimi',
        description: 'PR, push veya issue olayında tetikle',
        icon: '🐙',
        defaultConfig: { Repo: 'owner/repo', Olay: 'pull_request' },
        configFields: [
            { key: 'Repo', label: 'Repository', type: 'text', placeholder: 'owner/repo' },
            {
                key: 'Olay',
                label: 'Olay Türü',
                type: 'select',
                options: [
                    { label: 'Pull Request', value: 'pull_request' },
                    { label: 'Push', value: 'push' },
                    { label: 'Issue', value: 'issues' },
                    { label: 'Release', value: 'release' }
                ]
            }
        ]
    },
    {
        type: 'trigger',
        label: 'Slack Mesajı',
        description: 'Slack kanalında anahtar kelime yakala',
        icon: '💬',
        defaultConfig: { Kanal: '#genel', AnahtarKelime: '' },
        configFields: [
            { key: 'Kanal', label: 'Kanal', type: 'text', placeholder: '#genel' },
            { key: 'AnahtarKelime', label: 'Anahtar Kelime', type: 'text', placeholder: 'alarm, hata' }
        ]
    },
    {
        type: 'trigger',
        label: 'Fiyat Eşiği',
        description: 'Sembol fiyatı eşiği geçince tetikle',
        icon: '📈',
        defaultConfig: { Sembol: 'BTCUSDT', Eşik: '50000', Yön: 'above' },
        configFields: [
            { key: 'Sembol', label: 'Sembol', type: 'text', placeholder: 'BTCUSDT, AAPL' },
            { key: 'Eşik', label: 'Eşik Değer', type: 'number', placeholder: '50000' },
            {
                key: 'Yön',
                label: 'Yön',
                type: 'select',
                options: [
                    { label: 'Üzerine çıkınca', value: 'above' },
                    { label: 'Altına inince', value: 'below' }
                ]
            }
        ]
    },
    {
        type: 'trigger',
        label: 'Form Gönderimi',
        description: 'Form yanıtı geldiğinde tetikle',
        icon: '📋',
        defaultConfig: { Sağlayıcı: 'typeform', FormID: '' },
        configFields: [
            {
                key: 'Sağlayıcı',
                label: 'Form Sağlayıcı',
                type: 'select',
                options: [
                    { label: 'Typeform', value: 'typeform' },
                    { label: 'Google Forms', value: 'google_forms' },
                    { label: 'Jotform', value: 'jotform' }
                ]
            },
            { key: 'FormID', label: 'Form ID', type: 'text', placeholder: 'abc123' }
        ]
    },
];

export const actionTemplates: NodeTemplate[] = [
    {
        type: 'action',
        label: 'HTTP İstek',
        description: 'REST API çağrısı yap',
        icon: '🚀',
        defaultConfig: { Metod: 'POST', URL: '' },
        configFields: [
            { 
                key: 'Metod', 
                label: 'İstek Metodu', 
                type: 'select', 
                options: [
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' },
                    { label: 'PUT', value: 'PUT' },
                    { label: 'DELETE', value: 'DELETE' }
                ] 
            },
            { key: 'URL', label: 'Hedef URL', type: 'text', placeholder: 'https://api.example.com/' }
        ]
    },
    {
        type: 'action',
        label: 'Veritabanı Sorgusu',
        description: 'SQL veya NoSQL sorgusu çalıştır',
        icon: '💾',
        defaultConfig: { Tip: 'SELECT', Sorgu: '' },
        configFields: [
            { 
                key: 'Tip', 
                label: 'Sorgu Tipi', 
                type: 'select', 
                options: [
                    { label: 'SELECT', value: 'SELECT' },
                    { label: 'INSERT', value: 'INSERT' },
                    { label: 'UPDATE', value: 'UPDATE' },
                    { label: 'DELETE', value: 'DELETE' }
                ] 
            },
            { key: 'Sorgu', label: 'Sorgu Metni', type: 'textarea', placeholder: 'SELECT * FROM tablename' }
        ]
    },
    {
        type: 'action',
        label: 'E-posta Gönder',
        description: 'E-posta bildirim gönder',
        icon: '✉️',
        defaultConfig: { Alıcı: '', Mesaj: '' },
        configFields: [
            { key: 'Alıcı', label: 'Alıcı Adresi', type: 'text', placeholder: 'ornek@domain.com' },
            { key: 'Mesaj', label: 'E-posta Mesajı', type: 'textarea', placeholder: 'Mesaj içeriği...' }
        ]
    },
    {
        type: 'action',
        label: 'Bildirim',
        description: 'Push veya SMS bildirim gönder',
        icon: '🔔',
        defaultConfig: { Kanal: 'push', İçerik: '' },
        configFields: [
            { 
                key: 'Kanal', 
                label: 'İletişim Kanalı', 
                type: 'select', 
                options: [
                    { label: 'Push', value: 'push' },
                    { label: 'SMS', value: 'sms' },
                    { label: 'Slack', value: 'slack' }
                ] 
            },
            { key: 'İçerik', label: 'Bildirim İçeriği', type: 'textarea', placeholder: 'Bildirim metni...' }
        ]
    },
    {
        type: 'action',
        label: 'Veri Dönüşümü',
        description: 'Veriyi filtrele veya dönüştür',
        icon: '🔀',
        defaultConfig: { Format: 'JSON' },
        configFields: [
            { 
                key: 'Format', 
                label: 'Hedef Format', 
                type: 'select', 
                options: [
                    { label: 'JSON', value: 'JSON' },
                    { label: 'XML', value: 'XML' },
                    { label: 'CSV', value: 'CSV' }
                ] 
            }
        ]
    },
    {
        type: 'action',
        label: 'Koşul Kontrolü',
        description: 'If/else mantık dallanması',
        icon: '🔀',
        defaultConfig: { Koşul: '' },
        configFields: [
            { key: 'Koşul', label: 'Mantıksal Koşul', type: 'textarea', placeholder: 'value > 100' }
        ]
    },
    {
        type: 'action',
        label: 'Dosya İşlemi',
        description: 'Dosya oluştur, oku veya güncelle',
        icon: '📝',
        defaultConfig: { İşlem: 'write', Dosya: '' },
        configFields: [
            { 
                key: 'İşlem', 
                label: 'Dosya İşlemi', 
                type: 'select', 
                options: [
                    { label: 'Oku', value: 'read' },
                    { label: 'Yaz', value: 'write' },
                    { label: 'Ekle', value: 'append' }
                ] 
            },
            { key: 'Dosya', label: 'Dosya Yolu', type: 'text', placeholder: '/tmp/test.txt' }
        ]
    },
    {
        type: 'action',
        label: 'Gecikme',
        description: 'Belirli süre bekle',
        icon: '⏳',
        defaultConfig: { Süre: '5' },
        configFields: [
            { key: 'Süre', label: 'Bekleme Süresi (sn)', type: 'number', placeholder: '5' }
        ]
    },
    {
        type: 'action',
        label: 'Slack Mesaj Gönder',
        description: 'Slack kanalına mesaj gönder',
        icon: '📨',
        defaultConfig: { Kanal: '#genel', Mesaj: '' },
        configFields: [
            { key: 'Kanal', label: 'Kanal', type: 'text', placeholder: '#genel veya @kullanici' },
            { key: 'Mesaj', label: 'Mesaj İçeriği', type: 'textarea', placeholder: 'Mesaj metni...' }
        ]
    },
    {
        type: 'action',
        label: 'Sheets Satır Ekle',
        description: 'Google Sheets\'e satır ekle',
        icon: '📊',
        defaultConfig: { SheetID: '', Sayfa: 'Sayfa1' },
        configFields: [
            { key: 'SheetID', label: 'Spreadsheet ID', type: 'text', placeholder: '1A2B3C...' },
            { key: 'Sayfa', label: 'Sayfa Adı', type: 'text', placeholder: 'Sayfa1' }
        ]
    },
    {
        type: 'action',
        label: 'LLM Çağrısı',
        description: 'OpenAI veya Claude ile metin üret',
        icon: '🤖',
        defaultConfig: { Model: 'gpt-4', Prompt: '' },
        configFields: [
            {
                key: 'Model',
                label: 'Model',
                type: 'select',
                options: [
                    { label: 'GPT-4', value: 'gpt-4' },
                    { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
                    { label: 'Claude Sonnet 4.6', value: 'claude-sonnet-4-6' },
                    { label: 'Claude Opus 4.7', value: 'claude-opus-4-7' }
                ]
            },
            { key: 'Prompt', label: 'Prompt', type: 'textarea', placeholder: 'Bir özet yaz...' }
        ]
    },
    {
        type: 'action',
        label: 'PDF Oluştur',
        description: 'Şablon ile PDF dosyası oluştur',
        icon: '📄',
        defaultConfig: { Şablon: 'invoice', DosyaAdı: 'rapor.pdf' },
        configFields: [
            { key: 'Şablon', label: 'Şablon Adı', type: 'text', placeholder: 'invoice, report' },
            { key: 'DosyaAdı', label: 'Çıktı Dosya Adı', type: 'text', placeholder: 'rapor.pdf' }
        ]
    },
    {
        type: 'action',
        label: 'Yeniden Dene',
        description: 'Başarısız adımı belirli kez tekrarla',
        icon: '🔁',
        defaultConfig: { MaxDeneme: '3', Bekleme: '10' },
        configFields: [
            { key: 'MaxDeneme', label: 'Maks. Deneme Sayısı', type: 'number', placeholder: '3' },
            { key: 'Bekleme', label: 'Denemeler Arası Bekleme (sn)', type: 'number', placeholder: '10' }
        ]
    },
    {
        type: 'action',
        label: 'Paralel Dal',
        description: 'Akışı eşzamanlı kollara böl',
        icon: '🔱',
        defaultConfig: { Strateji: 'all' },
        configFields: [
            {
                key: 'Strateji',
                label: 'Birleştirme Stratejisi',
                type: 'select',
                options: [
                    { label: 'Tümünü bekle', value: 'all' },
                    { label: 'İlk biteni al', value: 'race' },
                    { label: 'Bekleme yapma', value: 'fire_and_forget' }
                ]
            }
        ]
    },
];
