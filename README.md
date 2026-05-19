# NextusAI
NextusAI, canlı piyasa verisi, comparable valuation, açıklanabilir skor sistemi, AI raporlama ve finansal chatbot içeren tam yığın bir finans analizi uygulamasıdır.

## Öne Çıkanlar

- Gerçek zamanlı piyasa verisi çekme
- Comparable valuation ile emsal şirket analizi
- 5 bileşenli açıklanabilir skor sistemi
- Groq ve Gemini ile yapay zekâ raporu
- Hisse bazlı finansal chatbot
- React tabanlı modern arayüz
- Docker ile tek komut kurulum desteği
- Türkçe hata ve açıklama mesajları
- Görme engelli bireyler için özelleştirilmiş arayüz
- Sesli sohbet
- Okuma modu
## Kullanılan Teknolojiler

### Backend Python bağımlılıkları

- FastAPI
- Uvicorn
- yfinance
- python-dotenv
- groq
- google-generativeai
- pandas
- pydantic
- pydantic-settings
- aiofiles
- slowapi
- edge-tts

### Frontend bağımlılıkları

`frontend/package.json` içinde yönetilir:

- react
- react-dom
- axios
- framer-motion
- lucide-react
- recharts
- tailwindcss
- @tailwindcss/vite

### Geliştirme bağımlılıkları

- @vitejs/plugin-react
- eslint
- eslint-plugin-react-hooks
- eslint-plugin-react-refresh
- @eslint/js
- globals
- vite
- @types/react
- @types/react-dom

## Proje Yapısı

```text
ValuAI/
├── backend/
│   ├── main.py
│   ├── market_data.py
│   ├── comparables.py
│   ├── valuation.py
│   ├── scoring.py
│   ├── ai_engine.py
│   ├── chatbot.py
│   ├── cache.py
│   ├── schemas.py
│   ├── exceptions.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
├── docker-compose.yml
├── kurulum.py
└── requirements.txt

```

## Kurulum

### 1. Hızlı kurulum

Bu proje için önerilen yol kurulum scriptidir. Script hem örnek ortam dosyalarını hazırlar hem de istenirse bağımlılıkları kurar.

```bash
python kurulum.py --kur
```

Bu komut şunları yapar:

- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env`
- `.venv` yoksa oluşturur
- Python bağımlılıklarını kurar
- Frontend için `npm install` çalıştırır

Yalnızca dosya yapısını ve `.env` dosyalarını hazırlamak istersen:

```bash
python kurulum.py
```

Mevcut `.env` dosyalarının üzerine yazmak istersen:

```bash
python kurulum.py --kur --zorla-env
```

### 2. Manuel kurulum

#### Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp backend/.env.example backend/.env
cd backend
uvicorn main:app --reload
```

Backend adresi:

```text
http://localhost:8000
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend adresi:

```text
http://localhost:5173
```

### 3. Docker ile kurulum

Docker ve Docker Compose kuruluysa en kısa yol budur.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker-compose up --build
```

Arayüz:

```text
http://localhost:3000
```

## Ortam Değişkenleri

### Backend

`backend/.env.example` içinde örnekleri bulunur.

- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `ALLOWED_ORIGINS`
- `LOG_LEVEL`

### Frontend

`frontend/.env.example` içinde örnekleri bulunur.

- `VITE_API_URL`
- `VITE_ANALYTICS_ID`
- `VITE_ENVIRONMENT`

## API Uç Noktaları

### GET /analyze

Bir hisse için detaylı analiz döndürür.

```bash
curl "http://localhost:8000/analyze?symbol=ASELS"
```

### POST /chat

Analiz edilmiş hisse için yapay zekâ sohbeti başlatır.

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"symbol":"ASELS","question":"Bu şirketin en büyük riski ne?"}'
```

## Hakemler İçin Kısa Akış

1. Repo’yu klonla.
2. `python kurulum.py --kur` çalıştır.
3. Gerekirse `backend/.env` içine API anahtarlarını ekle.
4. Backend ve frontend’i ayrı terminallerde başlat.

### Backend başlatma

```bash
source .venv/bin/activate
cd backend
uvicorn main:app --reload
```

### Frontend başlatma

```bash
cd frontend
npm run dev
```

## Test

Backend testleri varsa:

```bash
cd backend
pytest
```

Frontend lint kontrolü:

```bash
cd frontend
npm run lint
```

- Bu proje yatırım tavsiyesi vermez; eğitim ve analiz amacıyla tasarlanmıştır.
