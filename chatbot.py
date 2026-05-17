import os
from dotenv import load_dotenv
from groq import Groq
import google.generativeai as genai

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def build_chat_context(data):
    return f"""
Şirket: {data.get("company_name")}
Sembol: {data.get("symbol")}
Sektör: {data.get("sector")}
Endüstri: {data.get("industry")}
Para birimi: {data.get("currency")}

Mevcut fiyat: {data.get("current_price")}
52 hafta dip: {data.get("week_52_low")}
52 hafta zirve: {data.get("week_52_high")}
52 hafta fiyat konumu: {data.get("price_position_52w")}

Comparable grup: {data.get("comparable_group_name")}
Comparable medyan F/K: {data.get("comparable_sector_pe")}
Comparable medyan PD/DD: {data.get("comparable_sector_pb")}

F/K: {data.get("pe_ratio")}
Forward F/K: {data.get("forward_pe")}
PD/DD: {data.get("pb_ratio")}
EPS: {data.get("eps")}
Defter değeri: {data.get("book_value")}

Final teorik değer: {data.get("final_fair_value")}
Potansiyel: {data.get("potential")}
Panel sonucu: {data.get("valuation_result")}

ValuAI Score: {data.get("valuai_score")}/100
Değerleme skoru: {data.get("valuation_score")}/100
Kârlılık skoru: {data.get("profitability_score")}/100
Büyüme skoru: {data.get("growth_score")}/100
Borçluluk skoru: {data.get("debt_score")}/100
Risk skoru: {data.get("risk_score")}/100

Risk etiketi: {data.get("risk_label")}
Market Mood: {data.get("market_mood")}

Güçlü sinyaller:
{data.get("positive_signals")}

İzlenmesi gerekenler:
{data.get("negative_signals")}

ROE: {data.get("roe")}
Kâr marjı: {data.get("profit_margin")}
Gelir büyümesi: {data.get("revenue_growth")}
Borç/Özkaynak: {data.get("debt_to_equity")}
Cari oran: {data.get("current_ratio")}
Beta: {data.get("beta")}
Piyasa değeri: {data.get("market_cap")}
Firma değeri: {data.get("enterprise_value")}
"""


def get_groq_chat_response(data, question):
    client = Groq(api_key=GROQ_API_KEY)

    context = build_chat_context(data)

    messages = [
        {
            "role": "system",
            "content": f"""
Sen ValuAI platformunun finansal chatbot asistanısın.

Kesin kurallar:
- Türkçe cevap ver.
- Yatırım tavsiyesi verme.
- "Al", "sat", "tut", "kesin alınır" gibi emir cümleleri kurma.
- Kullanıcı finans dışı soru sorarsa nazikçe ValuAI kapsamına yönlendir.
- Elindeki analiz verilerine dayan.
- Veri yoksa uydurma.
- Kısa, net ve anlaşılır cevap ver.
- Gerektiğinde F/K, PD/DD, ROE, beta, borç/özkaynak gibi kavramları basitçe açıkla.
- Cevabın sonunda uygun olduğunda "Bu yorum yatırım tavsiyesi değildir." ifadesini kullan.

Mevcut analiz verileri:
{context}
"""
        },
        {
            "role": "user",
            "content": question
        }
    ]

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.25,
        max_tokens=900
    )

    return response.choices[0].message.content


def get_gemini_chat_response(data, question):
    context = build_chat_context(data)

    prompt = f"""
Sen ValuAI platformunun finansal chatbot asistanısın.

Kurallar:
- Türkçe cevap ver.
- Yatırım tavsiyesi verme.
- Al/sat/tut gibi emir cümleleri kurma.
- Elindeki analiz verilerine dayan.
- Veri yoksa uydurma.
- Kısa ve anlaşılır cevap ver.

Mevcut analiz verileri:
{context}

Kullanıcı sorusu:
{question}
"""

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)

    return response.text


def get_demo_chat_response(data, question):
    return f"""
Bu soruyu mevcut ValuAI analiz verilerine göre cevaplayabilirim.

{data.get("company_name")} için ValuAI Score **{data.get("valuai_score")}/100**, risk etiketi **{data.get("risk_label")}**, market mood ise **{data.get("market_mood")}** olarak hesaplanmıştır.

Öne çıkan güçlü sinyaller:
{data.get("positive_signals")}

İzlenmesi gereken noktalar:
{data.get("negative_signals")}

Bu yorum yatırım tavsiyesi değildir.
"""


def generate_chat_response(data, question):
    if GROQ_API_KEY:
        try:
            return {
                "chat_provider": "Groq",
                "answer": get_groq_chat_response(data, question)
            }
        except Exception as e:
            print(f"Groq chat error: {e}")

    if GEMINI_API_KEY:
        try:
            return {
                "chat_provider": "Gemini",
                "answer": get_gemini_chat_response(data, question)
            }
        except Exception as e:
            print(f"Gemini chat error: {e}")

    return {
        "chat_provider": "Demo Mode",
        "answer": get_demo_chat_response(data, question)
    }
