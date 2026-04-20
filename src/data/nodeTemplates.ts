export interface ConfigField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea';
    options?: { label: string; value: string }[];
    placeholder?: string;
}

export interface NodeTemplate {
    type: 'trigger' | 'action';
    label: string;
    description: string;
    icon: string;
    defaultConfig?: Record<string, string>;
    configFields?: ConfigField[];
}

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
];
