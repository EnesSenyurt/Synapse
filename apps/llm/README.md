# @synapse/llm — Task Parser Service

FastAPI mikroservis. Doğal dille yazılmış bir hedefi Gemini 2.5 Flash ile alt görevlere böler, DAG olarak doğrular ve React Flow uyumlu `nodes` / `edges` döndürür.

## Kurulum

```bash
cd apps/llm
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

## API Anahtarı

Gemini API anahtarını buradan alın: https://aistudio.google.com/apikey

`.env.example` dosyasını `.env` olarak kopyalayıp anahtarı doldurun:

```bash
cp .env.example .env
# GEMINI_API_KEY=... değerini düzenleyin
```

`.env` dosyası **asla** commit edilmemelidir.

## Çalıştırma

```bash
uvicorn main:app --reload --port 8000
```

Servis `http://localhost:8000` üzerinde ayağa kalkar. Otomatik OpenAPI dokümanı: `http://localhost:8000/docs`.

## Uçlar

### `GET /health`
Basit liveness probe.

```json
{ "status": "ok" }
```

### `POST /parse-task`

**Request:**
```json
{ "description": "e-ticaret sitesi kur" }
```

**Response (200):**
```json
{
  "nodes": [
    { "id": "setup_db",   "data": { "label": "Veritabanını kur" },      "position": { "x": 0,   "y": 0   } },
    { "id": "build_api",  "data": { "label": "Ürün API'sini yaz" },      "position": { "x": 0,   "y": 130 } },
    { "id": "build_ui",   "data": { "label": "Storefront UI'ı yap" },    "position": { "x": 240, "y": 130 } }
  ],
  "edges": [
    { "id": "setup_db->build_api", "source": "setup_db", "target": "build_api" },
    { "id": "setup_db->build_ui",  "source": "setup_db", "target": "build_ui"  }
  ]
}
```

**Hata kodları:**

| Durum | Anlamı |
|-------|--------|
| 400   | `description` boş |
| 422   | LLM boş liste veya döngü içeren graf üretti (mesajda döngüdeki node id'leri belirtilir) |
| 500   | `GEMINI_API_KEY` eksik veya Gemini çağrısı/parse'ı başarısız |

## Mimari Notlar

- **Structured output**: `google-genai` SDK'sının `response_schema` özelliğiyle Pydantic `ParseResponse` şeması modele geçiliyor. Model doğrudan geçerli JSON döndüğü için markdown-fence sıyırma veya `json.loads` sarmalama yok.
- **Cycle guard**: Kahn algoritması ile topolojik sıralama; işlenmeyen düğümler döngüdedir ve 422 ile geri verilir.
- **Layout**: Bağımlılık derinliğine göre y ekseni (kökler yukarıda), aynı derinlikteki düğümler yatayda yayılır. Frontend isterse üzerine yeniden layout uygulayabilir.
