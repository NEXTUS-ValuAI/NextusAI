import os
from dotenv import load_dotenv
from groq import Groq
import google.generativeai as genai

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def build_ai_prompt(data):
    return f"""
Aşağıdaki finansal verilere göre profesyonel, net ve veri odaklı analiz üret.

Kesin kurallar:
- Türkçe yaz.
- Yatırım tavsiyesi verme.
- "Al", "sat", "tut", "kesin alınır" gibi emir kipleri kullanma.
- Elindeki veriye göre yorum yap.
- Veri yoksa uydurma.
- Genel geçer cümleler kurma.
- Finansal oranlara doğrudan referans ver.
- Comparable değerleme motorunu özellikle açıkla.
- Maksimum 500 kelime.
- Net, teknik ve profesyonel dashboard dili kullan.

Veriler:
Şirket: {data.get("company_name")}
Sembol: {data.get("symbol")}
Sektör: {data.get("sector")}
Endüstri: {data.get("industry")}
Para birimi: {data.get("currency")}

Mevcut fiyat: {data.get("current_price")}
Önceki kapanış: {data.get("previous_close")}
52 hafta dip: {data.get("week_52_low")}
52 hafta zirve: {data.get("week_52_high")}
52 hafta fiyat konumu: %{data.get("price_position_52w")}

Comparable grup: {data.get("comparable_group_name")}
Benzer şirketler: {data.get("comparable_symbols")}
Comparable medyan F/K: {data.get("comparable_sector_pe")}
Comparable medyan PD/DD: {data.get("comparable_sector_pb")}

F/K: {data.get("pe_ratio")}
Forward F/K: {data.get("forward_pe")}
PD/DD: {data.get("pb_ratio")}
EPS: {data.get("eps")}
Defter değeri: {data.get("book_value")}

F/K bazlı teorik değer: {data.get("pe_fair_value")}
PD/DD bazlı teorik değer: {data.get("pb_fair_value")}
Baz teorik değer: {data.get("base_fair_value")}
Final NextusAI teorik değer: {data.get("final_fair_value")}
Potansiyel: %{data.get("potential")}

NextusAI Puanı: {data.get("valuai_score")}/100
Değerleme skoru: {data.get("valuation_score")}/100
Kârlılık skoru: {data.get("profitability_score")}/100
Büyüme skoru: {data.get("growth_score")}/100
Borçluluk skoru: {data.get("debt_score")}/100
Risk skoru: {data.get("risk_score")}/100

Panel sonucu: {data.get("valuation_result")}
Risk etiketi: {data.get("risk_label")}
Market Mood: {data.get("market_mood")}

Güçlü sinyaller:
{data.get("positive_signals")}

Zayıf sinyaller:
{data.get("negative_signals")}

ROE: {data.get("roe")}
Kâr marjı: {data.get("profit_margin")}
Gelir büyümesi: {data.get("revenue_growth")}
Borç/Özkaynak: {data.get("debt_to_equity")}
Cari oran: {data.get("current_ratio")}
Beta: {data.get("beta")}
Piyasa değeri: {data.get("market_cap")}
Firma değeri: {data.get("enterprise_value")}

Cevabı şu formatta ver:

**1. Değerleme Özeti**

**2. Kalite ve Risk**

**3. Panel Sonucu**
"""


def get_groq_response(prompt):
    client = Groq(api_key=GROQ_API_KEY)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": """
Sen profesyonel bir finansal analiz motorusun.
Yatırım tavsiyesi vermeden, verilen finansal oranlara göre net, teknik ve veri odaklı analiz üret.
Veri yoksa uydurma.
Türkçe cevap ver.
"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.20,
        max_tokens=1200
    )

    return response.choices[0].message.content


def get_gemini_response(prompt):
    genai.configure(api_key=GEMINI_API_KEY)

    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)

    return response.text


def get_demo_response(data):
    return f"""
**1. Değerleme Özeti**

{data.get("company_name")} için NextusAI Puanı **{data.get("valuai_score")}/100** seviyesindedir. 
Karşılaştırmalı model sonucunda final teorik değer **{data.get("final_fair_value")} {data.get("currency")}**, mevcut fiyat ise **{data.get("current_price")} {data.get("currency")}** seviyesindedir. 
Modelin hesapladığı potansiyel **%{data.get("potential")}** düzeyindedir.

**2. Kalite ve Risk**

Bu skor; değerleme, kârlılık, büyüme, borçluluk ve risk bileşenlerinin ağırlıklı birleşiminden oluşmaktadır. 
Risk etiketi **{data.get("risk_label")}**, piyasa eğilimi ise **{data.get("market_mood")}** olarak hesaplanmıştır.

**3. Panel Sonucu**

Panel sonucu: **{data.get("valuation_result")}**. 
Bu çıktı yatırım tavsiyesi değildir; eğitim ve karar destek amacıyla üretilmiştir.
"""


def generate_ai_report(data):
    prompt = build_ai_prompt(data)

    if GROQ_API_KEY:
        try:
            return {
                "ai_provider": "Groq",
                "ai_report": get_groq_response(prompt)
            }
        except Exception as e:
            print(f"Groq error: {e}")

    if GEMINI_API_KEY:
        try:
            return {
                "ai_provider": "Gemini",
                "ai_report": get_gemini_response(prompt)
            }
        except Exception as e:
            print(f"Gemini error: {e}")

    return {
        "ai_provider": "Demo Mode",
        "ai_report": get_demo_response(data)
    }
