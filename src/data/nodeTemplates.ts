export interface NodeTemplate {
    type: 'trigger' | 'action';
    label: string;
    description: string;
    icon: string;
    defaultConfig?: Record<string, string>;
}

export const triggerTemplates: NodeTemplate[] = [
    {
        type: 'trigger',
        label: 'Webhook',
        description: 'HTTP webhook ile tetikleme',
        icon: '🌐',
        defaultConfig: { URL: '/api/webhook' },
    },
    {
        type: 'trigger',
        label: 'Zamanlayıcı',
        description: 'Belirli aralıklarla çalıştır',
        icon: '⏰',
        defaultConfig: { Cron: '*/5 * * * *' },
    },
    {
        type: 'trigger',
        label: 'E-posta Alındı',
        description: 'Yeni e-posta geldiğinde tetikle',
        icon: '📧',
        defaultConfig: { Filtre: 'inbox' },
    },
    {
        type: 'trigger',
        label: 'Dosya İzleme',
        description: 'Dosya değişikliğinde tetikle',
        icon: '📁',
        defaultConfig: { Yol: '/data' },
    },
    {
        type: 'trigger',
        label: 'Veritabanı Değişikliği',
        description: 'DB kaydı değiştiğinde tetikle',
        icon: '🗄️',
        defaultConfig: { Tablo: 'users' },
    },
    {
        type: 'trigger',
        label: 'API Yoklama',
        description: 'Belirli aralıklarla API kontrol et',
        icon: '🔄',
        defaultConfig: { Aralık: '30s' },
    },
];

export const actionTemplates: NodeTemplate[] = [
    {
        type: 'action',
        label: 'HTTP İstek',
        description: 'REST API çağrısı yap',
        icon: '🚀',
        defaultConfig: { Metod: 'POST', URL: '' },
    },
    {
        type: 'action',
        label: 'Veritabanı Sorgusu',
        description: 'SQL veya NoSQL sorgusu çalıştır',
        icon: '💾',
        defaultConfig: { Tip: 'SELECT' },
    },
    {
        type: 'action',
        label: 'E-posta Gönder',
        description: 'E-posta bildirim gönder',
        icon: '✉️',
        defaultConfig: { Alıcı: '' },
    },
    {
        type: 'action',
        label: 'Bildirim',
        description: 'Push veya SMS bildirim gönder',
        icon: '🔔',
        defaultConfig: { Kanal: 'push' },
    },
    {
        type: 'action',
        label: 'Veri Dönüşümü',
        description: 'Veriyi filtrele veya dönüştür',
        icon: '🔀',
        defaultConfig: { Format: 'JSON' },
    },
    {
        type: 'action',
        label: 'Koşul Kontrolü',
        description: 'If/else mantık dallanması',
        icon: '🔀',
        defaultConfig: { Koşul: '' },
    },
    {
        type: 'action',
        label: 'Dosya İşlemi',
        description: 'Dosya oluştur, oku veya güncelle',
        icon: '📝',
        defaultConfig: { İşlem: 'write' },
    },
    {
        type: 'action',
        label: 'Gecikme',
        description: 'Belirli süre bekle',
        icon: '⏳',
        defaultConfig: { Süre: '5s' },
    },
];
