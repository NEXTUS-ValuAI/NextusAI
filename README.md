# ValuAI Backend

ValuAI projesinin FastAPI tabanlı backend servisidir.

Bu backend sistemi;

- canlı finansal veri çekme,
- comparable valuation hesaplama,
- teorik değer üretme,
- ValuAI skor sistemi,
- risk analizi,
- açıklanabilir finansal sinyaller,
- yapay zekâ destekli finansal yorum,
- finansal chatbot

özelliklerini sağlamaktadır.

---

# Özellikler

## Canlı Piyasa Verisi

Yahoo Finance üzerinden gerçek zamanlı finansal veriler çekilir.

Örnek veriler:
- Güncel fiyat
- F/K
- PD/DD
- EPS
- ROE
- Kâr marjı
- Gelir büyümesi
- Beta
- Piyasa değeri
- 52 haftalık fiyat verileri

---

# Comparable Valuation Engine

Şirketler benzer şirket gruplarıyla karşılaştırılır.

Örnek comparable gruplar:
- BIST Savunma
- BIST Teknoloji
- Global Technology
- Global Defense
- Global Financials

Sistem:
- medyan F/K
- medyan PD/DD
hesaplayarak teorik değer üretir.

---

# ValuAI Score Sistemi

0-100 arasında açıklanabilir finansal skor üretir.

Alt skorlar:
- Değerleme skoru
- Kârlılık skoru
- Büyüme skoru
- Borçluluk skoru
- Risk skoru

---

# Yapay Zekâ Finansal Analizi

Groq ve Gemini modelleri kullanılarak:
- profesyonel finansal yorum,
- risk değerlendirmesi,
- açıklanabilir analiz

üretilir.

---

# Finansal Chatbot

Kullanıcı mevcut hisse analizi üzerinden soru sorabilir.

Örnek:
```json
{
  "symbol": "ASELS",
  "question": "Bu şirketin en büyük riski ne?"
}
```

---

# API Endpointleri

## GET /analyze

Hisse analizi döndürür.

Örnek:

```text
/analyze?symbol=ASELS
```

---

## POST /chat

Finansal chatbot endpointidir.

---

# Kullanılan Teknolojiler

- FastAPI
- Python
- yFinance
- Groq API
- Gemini API
- Pandas

---

# Dosya Yapısı

```text
main.py
market_data.py
comparables.py
valuation.py
scoring.py
ai_engine.py
chatbot.py
requirements.txt
```

---

# Not

Bu branch, ValuAI projesinin Streamlit MVP sürümünden FastAPI backend mimarisine geçiş sürecini içermektedir.
