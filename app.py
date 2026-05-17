import os
import math
import base64
import streamlit as st
import yfinance as yf
import plotly.graph_objects as go
from dotenv import load_dotenv
from groq import Groq
import google.generativeai as genai


st.set_page_config(
    page_title="ValuAI",
    page_icon="logo.png" if os.path.exists("logo.png") else "📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# -----------------------------
# Session State
# -----------------------------
if "analysis_context" not in st.session_state:
    st.session_state.analysis_context = None

if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = [
        {
            "role": "assistant",
            "content": "Merhaba, ben ValuAI asistanıyım. Bir hisse analizi yaptıktan sonra sonuçları seninle yorumlayabilirim."
        }
    ]


# -----------------------------
# CSS
# -----------------------------
st.markdown(
    """
<style>
.block-container { padding-top: 2rem; padding-bottom: 3rem; }

.hero {
    background: linear-gradient(135deg, #101827 0%, #0B1120 55%, #111827 100%);
    border: 1px solid #263041;
    border-radius: 26px;
    padding: 26px 30px;
    margin-bottom: 22px;
    box-shadow: 0 0 45px rgba(0, 212, 255, 0.08);
}

.hero-title {
    font-size: 44px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -1px;
}

.hero-subtitle {
    font-size: 17px;
    color: #AAB2C0;
    margin-top: 8px;
}

.hero-chip {
    display: inline-block;
    margin-top: 14px;
    background: rgba(0, 212, 255, 0.10);
    border: 1px solid rgba(0, 212, 255, 0.25);
    color: #70E6FF;
    padding: 7px 13px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
}

.glow-card {
    background: linear-gradient(145deg, #161B22 0%, #101722 100%);
    border: 1px solid #2B3240;
    border-radius: 20px;
    padding: 18px;
    box-shadow: 0 0 35px rgba(0, 212, 255, 0.06);
    margin-bottom: 12px;
}

.report-card {
    background: linear-gradient(145deg, #111827 0%, #0B1120 100%);
    border: 1px solid #2D3748;
    border-radius: 22px;
    padding: 24px;
    box-shadow: 0 0 40px rgba(0, 212, 255, 0.07);
}

.badge-green {
    background:#12382D; color:#31D0AA; padding:8px 14px;
    border-radius:999px; font-weight:800; display:inline-block;
}

.badge-yellow {
    background:#3A3219; color:#FFD166; padding:8px 14px;
    border-radius:999px; font-weight:800; display:inline-block;
}

.badge-red {
    background:#3A1E27; color:#FF6B6B; padding:8px 14px;
    border-radius:999px; font-weight:800; display:inline-block;
}

.small-muted { color:#AAB2C0; font-size:13px; }

.section-title {
    font-size: 24px;
    font-weight: 850;
    margin-top: 24px;
    margin-bottom: 12px;
}
</style>
""",
    unsafe_allow_html=True
)


# -----------------------------
# Comparable Universe
# -----------------------------
COMPARABLE_GROUPS = {
    "BIST Savunma": ["ASELS.IS", "OTKAR.IS", "SDTTR.IS", "PAPIL.IS"],
    "BIST Teknoloji": ["PATEK.IS", "KAREL.IS", "LOGO.IS", "NETAS.IS", "PAPIL.IS"],
    "BIST Holding": ["KCHOL.IS", "SAHOL.IS", "SISE.IS", "TAVHL.IS"],
    "BIST Ulaştırma": ["THYAO.IS", "PGSUS.IS", "TAVHL.IS"],
    "BIST Sanayi": ["SISE.IS", "EREGL.IS", "KRDMD.IS", "TOASO.IS", "FROTO.IS"],
    "Global Technology": ["AAPL", "MSFT", "NVDA", "GOOGL", "AMD", "META"],
    "Global Financials": ["JPM", "BAC", "GS", "MS", "C"],
    "Global Defense": ["LMT", "RTX", "NOC", "GD", "BA"],
    "Global Healthcare": ["JNJ", "PFE", "MRK", "LLY", "ABBV"],
    "Global Energy": ["XOM", "CVX", "BP", "SHEL", "COP"],
}


def choose_comparable_group(symbol, sector, industry):
    s = symbol.upper()
    text = f"{sector or ''} {industry or ''}".lower()

    if s.endswith(".IS"):
        if any(x in s for x in ["ASELS", "OTKAR", "SDTTR", "PAPIL"]):
            return "BIST Savunma", COMPARABLE_GROUPS["BIST Savunma"]
        if any(x in s for x in ["PATEK", "KAREL", "LOGO", "NETAS"]):
            return "BIST Teknoloji", COMPARABLE_GROUPS["BIST Teknoloji"]
        if any(x in s for x in ["THYAO", "PGSUS", "TAVHL"]):
            return "BIST Ulaştırma", COMPARABLE_GROUPS["BIST Ulaştırma"]
        if any(x in s for x in ["KCHOL", "SAHOL"]):
            return "BIST Holding", COMPARABLE_GROUPS["BIST Holding"]
        return "BIST Sanayi", COMPARABLE_GROUPS["BIST Sanayi"]

    if "technology" in text or "software" in text or "semiconductor" in text:
        return "Global Technology", COMPARABLE_GROUPS["Global Technology"]
    if "financial" in text or "bank" in text:
        return "Global Financials", COMPARABLE_GROUPS["Global Financials"]
    if "aerospace" in text or "defense" in text:
        return "Global Defense", COMPARABLE_GROUPS["Global Defense"]
    if "healthcare" in text or "drug" in text or "pharmaceutical" in text:
        return "Global Healthcare", COMPARABLE_GROUPS["Global Healthcare"]
    if "energy" in text or "oil" in text:
        return "Global Energy", COMPARABLE_GROUPS["Global Energy"]

    return "Global Technology", COMPARABLE_GROUPS["Global Technology"]


# -----------------------------
# Helpers
# -----------------------------
def safe_float(value):
    try:
        if value is None:
            return None
        if isinstance(value, float) and math.isnan(value):
            return None
        return float(value)
    except Exception:
        return None


def fmt(value, suffix="", decimals=2):
    value = safe_float(value)
    if value is None:
        return "Veri yok"
    return f"{value:.{decimals}f}{suffix}"


def fmt_money(value, currency=""):
    value = safe_float(value)
    if value is None:
        return "Veri yok"
    return f"{value:.2f} {currency}"


def fmt_big(value):
    value = safe_float(value)
    if value is None:
        return "Veri yok"
    if abs(value) >= 1_000_000_000:
        return f"{value / 1_000_000_000:.2f} B"
    if abs(value) >= 1_000_000:
        return f"{value / 1_000_000:.2f} M"
    return f"{value:.2f}"


def clamp(value, min_value=0, max_value=100):
    if value is None:
        return 50
    return max(min_value, min(value, max_value))


def logo_base64(path="logo.png"):
    if not os.path.exists(path):
        return None
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def badge_class(text):
    if text in ["Pozitif", "Düşük-Orta", "Görece ucuz / yüksek potansiyelli", "Güçlü"]:
        return "badge-green"
    if text in ["Nötr", "Temkinli", "Orta", "Pozitif potansiyel", "Makul fiyat bandında"]:
        return "badge-yellow"
    return "badge-red"


def resolve_symbol(user_symbol):
    clean = user_symbol.strip().upper()
    possible_symbols = [
        clean,
        f"{clean}.IS",
        f"{clean}.L",
        f"{clean}.TO",
        f"{clean}.NS",
        f"{clean}.BO",
        f"{clean}.HK",
        f"{clean}.SS",
        f"{clean}.SZ",
        f"{clean}.AX",
        f"{clean}.DE",
        f"{clean}.PA",
    ]

    for sym in possible_symbols:
        try:
            stock = yf.Ticker(sym)
            hist = stock.history(period="1y")
            if not hist.empty:
                info = stock.info
                return sym, stock, info, hist
        except Exception:
            continue

    return None, None, None, None


def median_clean(values):
    clean = [v for v in values if v is not None and v > 0 and v < 500]
    if not clean:
        return None
    clean.sort()
    n = len(clean)
    mid = n // 2
    if n % 2 == 1:
        return clean[mid]
    return (clean[mid - 1] + clean[mid]) / 2


def build_comparable_metrics(group_symbols):
    rows = []
    pe_values = []
    pb_values = []

    for sym in group_symbols:
        try:
            info = yf.Ticker(sym).info
            pe = safe_float(info.get("trailingPE"))
            pb = safe_float(info.get("priceToBook"))
            market_cap = safe_float(info.get("marketCap"))
            name = info.get("shortName") or info.get("longName") or sym

            if pe is not None and 0 < pe < 500:
                pe_values.append(pe)
            if pb is not None and 0 < pb < 100:
                pb_values.append(pb)

            rows.append({
                "Sembol": sym,
                "Şirket": name,
                "F/K": pe,
                "PD/DD": pb,
                "Piyasa Değeri": market_cap
            })
        except Exception:
            continue

    sector_pe = median_clean(pe_values)
    sector_pb = median_clean(pb_values)

    return sector_pe, sector_pb, rows


# -----------------------------
# Scoring
# -----------------------------
def score_valuation(pe_ratio, pb_ratio, potential):
    score = 50

    if pe_ratio:
        if pe_ratio < 8: score += 25
        elif pe_ratio < 15: score += 18
        elif pe_ratio < 25: score += 8
        elif pe_ratio < 40: score -= 5
        else: score -= 18

    if pb_ratio:
        if pb_ratio < 1: score += 18
        elif pb_ratio < 3: score += 10
        elif pb_ratio < 6: score -= 5
        else: score -= 15

    if potential is not None:
        if potential > 35: score += 22
        elif potential > 15: score += 12
        elif potential > 0: score += 5
        elif potential < -35: score -= 22
        elif potential < -15: score -= 12

    return round(clamp(score), 1)


def score_profitability(roe, profit_margin):
    score = 50

    if roe is not None:
        roe_pct = roe * 100
        if roe_pct > 25: score += 25
        elif roe_pct > 15: score += 18
        elif roe_pct > 8: score += 8
        elif roe_pct < 0: score -= 25

    if profit_margin is not None:
        margin_pct = profit_margin * 100
        if margin_pct > 25: score += 20
        elif margin_pct > 15: score += 12
        elif margin_pct > 5: score += 5
        elif margin_pct < 0: score -= 20

    return round(clamp(score), 1)


def score_growth(revenue_growth, forward_pe, pe_ratio):
    score = 50

    if revenue_growth is not None:
        growth_pct = revenue_growth * 100
        if growth_pct > 30: score += 25
        elif growth_pct > 15: score += 18
        elif growth_pct > 5: score += 8
        elif growth_pct < 0: score -= 15

    if forward_pe and pe_ratio:
        if forward_pe < pe_ratio: score += 10
        elif forward_pe > pe_ratio * 1.2: score -= 8

    return round(clamp(score), 1)


def score_debt(debt_to_equity, current_ratio):
    score = 50

    if debt_to_equity is not None:
        if debt_to_equity < 50: score += 25
        elif debt_to_equity < 100: score += 12
        elif debt_to_equity < 200: score -= 8
        else: score -= 22

    if current_ratio is not None:
        if current_ratio > 2: score += 15
        elif current_ratio > 1: score += 8
        elif current_ratio < 0.8: score -= 15

    return round(clamp(score), 1)


def score_risk(beta, price_position_52w):
    score = 50

    if beta is not None:
        if beta < 0.8: score += 20
        elif beta < 1.2: score += 10
        elif beta < 1.6: score -= 8
        else: score -= 20

    if price_position_52w is not None:
        if price_position_52w > 85: score -= 15
        elif price_position_52w < 25: score += 10

    return round(clamp(score), 1)


def calculate_valuai_score(valuation, profitability, growth, debt, risk):
    return round(
        valuation * 0.30 +
        profitability * 0.25 +
        growth * 0.20 +
        debt * 0.15 +
        risk * 0.10,
        1
    )


def score_label(score):
    if score >= 80: return "Güçlü"
    if score >= 65: return "Pozitif"
    if score >= 50: return "Dengeli"
    if score >= 35: return "Zayıf"
    return "Riskli"


def market_mood_label(valuai_score, potential, price_position_52w):
    if valuai_score >= 70 and potential > 10:
        return "Pozitif"
    if valuai_score < 45 or potential < -20:
        return "Negatif"
    if price_position_52w is not None and price_position_52w > 85 and potential < 5:
        return "Temkinli"
    return "Nötr"


def build_factor_lists(pe_ratio, pb_ratio, potential, roe, profit_margin, revenue_growth,
                       debt_to_equity, current_ratio, beta, price_position_52w,
                       valuation_score, profitability_score, growth_score, debt_score, risk_score):
    positives, negatives = [], []

    if potential is not None:
        if potential > 15:
            positives.append(f"Comparable model %{potential:.1f} teorik potansiyel gösteriyor.")
        elif potential < -15:
            negatives.append(f"Comparable model %{abs(potential):.1f} aşağı yönlü değerleme riski gösteriyor.")

    if pe_ratio is not None:
        if pe_ratio < 15:
            positives.append(f"F/K {pe_ratio:.2f}; makul çarpan bölgesinde.")
        elif pe_ratio > 35:
            negatives.append(f"F/K {pe_ratio:.2f}; yüksek beklenti fiyatlaması olabilir.")

    if pb_ratio is not None:
        if pb_ratio < 3:
            positives.append(f"PD/DD {pb_ratio:.2f}; defter değeri çarpanı aşırı yüksek değil.")
        elif pb_ratio > 6:
            negatives.append(f"PD/DD {pb_ratio:.2f}; defter değerine göre premium fiyatlama var.")

    if roe is not None:
        roe_pct = roe * 100
        if roe_pct > 15:
            positives.append(f"ROE %{roe_pct:.1f}; özkaynak kârlılığı güçlü.")
        elif roe_pct < 5:
            negatives.append(f"ROE %{roe_pct:.1f}; özkaynak getirisi zayıf.")

    if profit_margin is not None:
        margin_pct = profit_margin * 100
        if margin_pct > 15:
            positives.append(f"Kâr marjı %{margin_pct:.1f}; operasyonel kaliteyi destekliyor.")
        elif margin_pct < 3:
            negatives.append(f"Kâr marjı %{margin_pct:.1f}; kârlılık baskısı olabilir.")

    if revenue_growth is not None:
        growth_pct = revenue_growth * 100
        if growth_pct > 10:
            positives.append(f"Gelir büyümesi %{growth_pct:.1f}; büyüme tarafı destekleyici.")
        elif growth_pct < 0:
            negatives.append(f"Gelir büyümesi %{growth_pct:.1f}; ciro tarafında daralma var.")

    if debt_to_equity is not None:
        if debt_to_equity < 80:
            positives.append(f"Borç/Özkaynak {debt_to_equity:.1f}; borçluluk yönetilebilir.")
        elif debt_to_equity > 180:
            negatives.append(f"Borç/Özkaynak {debt_to_equity:.1f}; kaldıraç riski yüksek.")

    if current_ratio is not None:
        if current_ratio > 1.5:
            positives.append(f"Cari oran {current_ratio:.2f}; kısa vadeli likidite güçlü.")
        elif current_ratio < 1:
            negatives.append(f"Cari oran {current_ratio:.2f}; likidite riski olabilir.")

    if beta is not None:
        if beta < 1:
            positives.append(f"Beta {beta:.2f}; piyasa oynaklığına duyarlılık sınırlı.")
        elif beta > 1.5:
            negatives.append(f"Beta {beta:.2f}; volatilite riski yüksek.")

    if price_position_52w is not None:
        if price_position_52w < 30:
            positives.append(f"Fiyat 52 haftalık bandın %{price_position_52w:.1f} seviyesinde; zirveden uzak.")
        elif price_position_52w > 85:
            negatives.append(f"Fiyat 52 haftalık bandın %{price_position_52w:.1f} seviyesinde; zirveye yakın.")

    if valuation_score >= 70:
        positives.append(f"Değerleme skoru {valuation_score}/100 ile güçlü.")
    elif valuation_score < 40:
        negatives.append(f"Değerleme skoru {valuation_score}/100 ile zayıf.")

    if profitability_score >= 70:
        positives.append(f"Kârlılık skoru {profitability_score}/100 ile destekleyici.")
    elif profitability_score < 40:
        negatives.append(f"Kârlılık skoru {profitability_score}/100 ile zayıf.")

    if growth_score >= 70:
        positives.append(f"Büyüme skoru {growth_score}/100 ile pozitif.")
    elif growth_score < 40:
        negatives.append(f"Büyüme skoru {growth_score}/100 ile sınırlı.")

    if debt_score < 40:
        negatives.append(f"Borçluluk skoru {debt_score}/100; bilanço riski izlenmeli.")

    if risk_score < 40:
        negatives.append(f"Risk skoru {risk_score}/100; volatilite/fiyat konumu baskı yaratıyor.")

    return positives[:5], negatives[:5]


# -----------------------------
# Charts
# -----------------------------
def make_gauge(score):
    if score >= 75:
        bar_color = "#31D0AA"
    elif score >= 55:
        bar_color = "#FFD166"
    else:
        bar_color = "#FF6B6B"

    fig = go.Figure(
        go.Indicator(
            mode="gauge+number",
            value=score,
            number={"suffix": "/100", "font": {"size": 34}},
            gauge={
                "axis": {"range": [0, 100]},
                "bar": {"color": bar_color},
                "steps": [
                    {"range": [0, 35], "color": "#3A1F2B"},
                    {"range": [35, 65], "color": "#3A3520"},
                    {"range": [65, 100], "color": "#1F3A34"},
                ],
                "threshold": {
                    "line": {"color": "white", "width": 3},
                    "thickness": 0.75,
                    "value": score,
                },
            },
            title={"text": "ValuAI Score"},
        )
    )
    fig.update_layout(height=320, margin=dict(l=20, r=20, t=40, b=20),
                      paper_bgcolor="rgba(0,0,0,0)", font=dict(color="#FAFAFA"))
    return fig


def make_radar(scores):
    categories = ["Değerleme", "Kârlılık", "Büyüme", "Borçluluk", "Risk"]
    values = scores + [scores[0]]
    cats = categories + [categories[0]]

    fig = go.Figure()
    fig.add_trace(go.Scatterpolar(r=values, theta=cats, fill="toself", name="Skor Profili"))
    fig.update_layout(
        polar=dict(radialaxis=dict(visible=True, range=[0, 100]), bgcolor="rgba(0,0,0,0)"),
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#FAFAFA"),
        showlegend=False,
        height=360,
        margin=dict(l=30, r=30, t=30, b=30)
    )
    return fig


# -----------------------------
# AI
# -----------------------------
def get_groq_response(prompt):
    client = Groq(api_key=GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": """
Sen profesyonel bir finansal analiz motorusun.
Yatırım tavsiyesi vermeden, verilen finansal oranlara göre net, teknik ve veri odaklı analiz üret.
Veri yoksa uydurma. Mevcut verilerle yorum yap. Türkçe cevap ver.
"""
            },
            {"role": "user", "content": prompt}
        ],
        temperature=0.20,
        max_tokens=1100
    )
    return response.choices[0].message.content


def get_gemini_response(prompt):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return response.text


def get_demo_response(company_name, valuai_score, final_fair_value, current_price, currency):
    return f"""
**1. Değerleme Özeti**  
{company_name} için ValuAI skoru **{valuai_score}/100** seviyesindedir. 
Comparable model teorik değeri **{fmt_money(final_fair_value, currency)}**, mevcut fiyat ise **{fmt_money(current_price, currency)}** seviyesindedir.

**2. Kalite ve Risk**  
Skor; değerleme, kârlılık, büyüme, borçluluk ve volatilite bileşenlerinin ağırlıklı birleşimiyle oluşturulmuştur.

**3. Panel Sonucu**  
Bu çıktı yatırım tavsiyesi değildir; ValuAI tarafından üretilmiş karar destek analizidir.
"""


def generate_ai_analysis(prompt, company_name, valuai_score, final_fair_value, current_price, currency):
    if GROQ_API_KEY:
        try:
            return "Groq", get_groq_response(prompt)
        except Exception as e:
            st.warning(f"Groq çalışmadı, Gemini deneniyor. Hata: {str(e)}")

    if GEMINI_API_KEY:
        try:
            return "Gemini", get_gemini_response(prompt)
        except Exception as e:
            st.warning(f"Gemini çalışmadı, demo yorum gösteriliyor. Hata: {str(e)}")

    return "Demo Modu", get_demo_response(company_name, valuai_score, final_fair_value, current_price, currency)

def get_groq_chat_response(messages):
    client = Groq(api_key=GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.25,
        max_tokens=900
    )
    return response.choices[0].message.content


def get_gemini_chat_response(prompt):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return response.text


def generate_chatbot_response(user_question):
    context = st.session_state.analysis_context

    if context is None:
        return """
Henüz analiz yapılmadı. Önce bir hisse kodu girip **Analiz Et** butonuna basmalısın. 
Analizden sonra bana şu tarz sorular sorabilirsin:

- Bu hissenin güçlü tarafları neler?
- Risk neden yüksek çıktı?
- F/K ve PD/DD ne anlatıyor?
- ValuAI Score neden böyle?
- Bu analizi sade dille özetler misin?
"""

    system_prompt = f"""
Sen ValuAI platformunun finansal chatbot asistanısın.

Kesin kurallar:
- Türkçe cevap ver.
- Yatırım tavsiyesi verme.
- "Al", "sat", "tut", "kesin alınır" gibi emir cümleleri kurma.
- Kullanıcı finans dışı soru sorarsa nazikçe ValuAI kapsamına yönlendir.
- Elindeki analiz verilerine dayan.
- Veri yoksa uydurma.
- Kısa, net ve anlaşılır cevap ver.
- Gerektiğinde F/K, PD/DD, ROE, beta, borç/özsermaye gibi kavramları basitçe açıkla.
- Cevabın sonunda gerektiğinde "Bu yorum yatırım tavsiyesi değildir." ifadesini kullan.

Mevcut analiz verileri:
{context}
"""

    messages = [{"role": "system", "content": system_prompt}]

    for msg in st.session_state.chat_messages[-8:]:
        messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })

    messages.append({"role": "user", "content": user_question})

    if GROQ_API_KEY:
        try:
            return get_groq_chat_response(messages)
        except Exception as e:
            st.warning(f"Groq chatbot çalışmadı, Gemini deneniyor. Hata: {str(e)}")

    if GEMINI_API_KEY:
        try:
            gemini_prompt = system_prompt + "\n\nKullanıcı sorusu:\n" + user_question
            return get_gemini_chat_response(gemini_prompt)
        except Exception as e:
            st.warning(f"Gemini chatbot çalışmadı. Hata: {str(e)}")

    return """
Şu anda AI API anahtarı bulunamadığı için canlı chatbot yanıtı üretilemiyor.

.env dosyana şunlardan en az birini eklemelisin:

GROQ_API_KEY=senin_groq_api_keyin  
GEMINI_API_KEY=senin_gemini_api_keyin
"""
# -----------------------------
# Header
# -----------------------------
logo64 = logo_base64("logo.png")

if logo64:
    st.markdown(
        f"""
<div class="hero">
    <div style="display:flex;align-items:center;gap:20px;">
        <img src="data:image/png;base64,{logo64}" width="78">
        <div>
            <div class="hero-title">ValuAI</div>
            <div class="hero-subtitle">AI-Powered Equity Intelligence Platform</div>
            <div class="hero-chip">Comparable Valuation • Explainable Score • LLM Analysis</div>
        </div>
    </div>
</div>
""",
        unsafe_allow_html=True
    )
else:
    st.markdown(
        """
<div class="hero">
    <div class="hero-title">📊 ValuAI</div>
    <div class="hero-subtitle">AI-Powered Equity Intelligence Platform</div>
    <div class="hero-chip">Comparable Valuation • Explainable Score • LLM Analysis</div>
</div>
""",
        unsafe_allow_html=True
    )

st.warning("Bu platform yatırım tavsiyesi vermez. Eğitim, analiz ve karar destek amacıyla geliştirilmiştir.")


# -----------------------------
# Sidebar
# -----------------------------
if os.path.exists("logo.png"):
    st.sidebar.image("logo.png", width=140)

st.sidebar.title("ValuAI")
st.sidebar.markdown(
    """
**ValuAI**, hisse verilerini canlı çeker, benzer şirket çarpanlarıyla değerleme yapar ve AI ile açıklanabilir finansal yorum üretir.

**Özellikler**
- Canlı piyasa verisi
- Comparable valuation engine
- ValuAI Score
- Açıklanabilir güçlü/zayıf sinyaller
- Groq → Gemini fallback

**Teknolojiler**
Python • Streamlit • yFinance • Plotly • Groq • Gemini
"""
)

st.sidebar.markdown("---")
st.sidebar.caption("Hackathon 2026 • Team Nexus")


# -----------------------------
# Search Area
# -----------------------------
st.markdown('<div class="section-title">🔎 Hisse Analizi Başlat</div>', unsafe_allow_html=True)

c_search1, c_search2 = st.columns([2, 1])

with c_search1:
    user_symbol = st.text_input(
        "Hisse kodu gir",
        value="AAPL",
        placeholder="Örnek: AAPL, MSFT, NVDA, ASELS, THYAO, PATEK"
    )

with c_search2:
    sample = st.selectbox(
        "Hazır örnek",
        ["AAPL", "MSFT", "NVDA", "ASELS", "THYAO", "PATEK", "KCHOL", "SISE"],
        index=0
    )
    if st.button("Örneği Kullan", use_container_width=True):
        user_symbol = sample

analyze = st.button("Analiz Et", type="primary", use_container_width=True)


# -----------------------------
# Main App
# -----------------------------
if analyze:
    try:
        with st.spinner("ValuAI canlı verileri ve comparable evrenini analiz ediyor..."):
            resolved_symbol, stock, info, hist = resolve_symbol(user_symbol)

        if stock is None or hist is None or hist.empty:
            st.error("Hisse bulunamadı. Kodun doğru olduğundan emin ol.")
            st.stop()

        symbol = resolved_symbol

        current_price = safe_float(info.get("currentPrice")) or safe_float(hist["Close"].iloc[-1])
        previous_close = safe_float(info.get("previousClose"))
        day_high = safe_float(info.get("dayHigh"))
        day_low = safe_float(info.get("dayLow"))

        pe_ratio = safe_float(info.get("trailingPE"))
        forward_pe = safe_float(info.get("forwardPE"))
        pb_ratio = safe_float(info.get("priceToBook"))
        eps = safe_float(info.get("trailingEps"))
        book_value = safe_float(info.get("bookValue"))

        roe = safe_float(info.get("returnOnEquity"))
        profit_margin = safe_float(info.get("profitMargins"))
        revenue_growth = safe_float(info.get("revenueGrowth"))
        debt_to_equity = safe_float(info.get("debtToEquity"))
        current_ratio = safe_float(info.get("currentRatio"))
        beta = safe_float(info.get("beta"))

        market_cap = safe_float(info.get("marketCap"))
        enterprise_value = safe_float(info.get("enterpriseValue"))
        target_mean_price = safe_float(info.get("targetMeanPrice"))
        target_high_price = safe_float(info.get("targetHighPrice"))
        target_low_price = safe_float(info.get("targetLowPrice"))

        company_name = info.get("longName", symbol)
        sector = info.get("sector", "Bilinmiyor")
        industry = info.get("industry", "Bilinmiyor")
        currency = info.get("currency", "")

        close_prices = hist["Close"].dropna()
        week_52_low = safe_float(close_prices.min())
        week_52_high = safe_float(close_prices.max())

        if week_52_low is not None and week_52_high is not None and week_52_high != week_52_low:
            price_position_52w = ((current_price - week_52_low) / (week_52_high - week_52_low)) * 100
        else:
            price_position_52w = None

        comparable_group_name, comparable_symbols = choose_comparable_group(symbol, sector, industry)

        with st.spinner("Benzer şirketlerin F/K ve PD/DD verileri hesaplanıyor..."):
            sector_pe, sector_pb, comparable_rows = build_comparable_metrics(comparable_symbols)

        if sector_pe is None:
            sector_pe = 18.0
        if sector_pb is None:
            sector_pb = 3.0

        pe_fair_value = eps * sector_pe if eps is not None else None
        pb_fair_value = book_value * sector_pb if book_value is not None else None

        model_values = []
        if pe_fair_value is not None and pe_fair_value > 0:
            model_values.append(("F/K Modeli", pe_fair_value, 0.45))
        if pb_fair_value is not None and pb_fair_value > 0:
            model_values.append(("PD/DD Modeli", pb_fair_value, 0.35))
        if target_mean_price is not None and target_mean_price > 0:
            model_values.append(("Analist Hedefi", target_mean_price, 0.20))

        if model_values:
            total_weight = sum(w for _, _, w in model_values)
            base_fair_value = sum(value * weight for _, value, weight in model_values) / total_weight
        else:
            base_fair_value = current_price

        growth_adjustment = 1.0
        if revenue_growth is not None:
            if revenue_growth > 0.25:
                growth_adjustment += 0.10
            elif revenue_growth > 0.10:
                growth_adjustment += 0.05
            elif revenue_growth < 0:
                growth_adjustment -= 0.08

        risk_adjustment = 1.0
        if beta is not None:
            if beta > 1.6:
                risk_adjustment -= 0.08
            elif beta > 1.2:
                risk_adjustment -= 0.04
            elif beta < 0.8:
                risk_adjustment += 0.03

        if debt_to_equity is not None:
            if debt_to_equity > 200:
                risk_adjustment -= 0.08
            elif debt_to_equity > 100:
                risk_adjustment -= 0.04
            elif debt_to_equity < 50:
                risk_adjustment += 0.03

        final_fair_value = base_fair_value * growth_adjustment * risk_adjustment
        potential = ((final_fair_value - current_price) / current_price) * 100

        if potential > 30:
            result = "Görece ucuz / yüksek potansiyelli"
        elif potential > 10:
            result = "Pozitif potansiyel"
        elif potential < -30:
            result = "Görece pahalı / aşağı yönlü risk yüksek"
        elif potential < -10:
            result = "Sınırlı aşağı yönlü risk"
        else:
            result = "Makul fiyat bandında"

        valuation_score = score_valuation(pe_ratio, pb_ratio, potential)
        profitability_score = score_profitability(roe, profit_margin)
        growth_score = score_growth(revenue_growth, forward_pe, pe_ratio)
        debt_score = score_debt(debt_to_equity, current_ratio)
        risk_score = score_risk(beta, price_position_52w)

        valuai_score = calculate_valuai_score(
            valuation_score,
            profitability_score,
            growth_score,
            debt_score,
            risk_score
        )

        if valuai_score >= 75:
            risk_label = "Düşük-Orta"
        elif valuai_score >= 60:
            risk_label = "Orta"
        elif valuai_score >= 45:
            risk_label = "Orta-Yüksek"
        else:
            risk_label = "Yüksek"

        mood = market_mood_label(valuai_score, potential, price_position_52w)

        positives, negatives = build_factor_lists(
            pe_ratio, pb_ratio, potential, roe, profit_margin,
            revenue_growth, debt_to_equity, current_ratio,
            beta, price_position_52w, valuation_score, profitability_score,
            growth_score, debt_score, risk_score
        )

        # Header
        st.markdown(f"## {company_name} ({symbol})")

        h1, h2, h3 = st.columns(3)
        h1.markdown(f'<span class="{badge_class(mood)}">Market Mood: {mood}</span>', unsafe_allow_html=True)
        h2.markdown(f'<span class="{badge_class(risk_label)}">Risk: {risk_label}</span>', unsafe_allow_html=True)
        h3.markdown(f'<span class="{badge_class(result)}">{result}</span>', unsafe_allow_html=True)

        st.caption(
            f"Sektör: {sector} • Endüstri: {industry} • Comparable grup: {comparable_group_name} • Çözümlenen sembol: {symbol}"
        )

        left, right = st.columns([1, 2])

        with left:
            st.plotly_chart(make_gauge(valuai_score), use_container_width=True)

        with right:
            k1, k2, k3, k4 = st.columns(4)
            k1.metric("Mevcut Fiyat", fmt_money(current_price, currency))
            k2.metric("Teorik Değer", fmt_money(final_fair_value, currency))
            k3.metric("Potansiyel", fmt(potential, "%"))
            k4.metric("ValuAI Score", f"{valuai_score}/100")

            k5, k6, k7, k8 = st.columns(4)
            k5.metric("F/K", fmt(pe_ratio))
            k6.metric("PD/DD", fmt(pb_ratio))
            k7.metric("52H Konum", fmt(price_position_52w, "%"))
            k8.metric("Piyasa Değeri", fmt_big(market_cap))

            st.markdown(
                f"""
<div class="glow-card">
<b>Comparable Valuation Engine</b><br>
<span class="small-muted">
Bu analizde manuel sektör çarpanı kullanılmaz. ValuAI, <b>{comparable_group_name}</b> grubundaki benzer şirketlerden canlı F/K ve PD/DD verisi çeker.
Hesaplanan comparable F/K: <b>{fmt(sector_pe)}</b> • comparable PD/DD: <b>{fmt(sector_pb)}</b>.
</span>
</div>
""",
                unsafe_allow_html=True
            )

        # Comparable table
        st.markdown('<div class="section-title">🏢 Benzer Şirket Evreni</div>', unsafe_allow_html=True)

        comp_display = []
        for row in comparable_rows:
            comp_display.append({
                "Sembol": row["Sembol"],
                "Şirket": row["Şirket"],
                "F/K": fmt(row["F/K"]),
                "PD/DD": fmt(row["PD/DD"]),
                "Piyasa Değeri": fmt_big(row["Piyasa Değeri"])
            })

        st.dataframe(comp_display, use_container_width=True, hide_index=True)

        cpe1, cpe2, cpe3 = st.columns(3)
        cpe1.metric("Comparable Grup", comparable_group_name)
        cpe2.metric("Medyan F/K", fmt(sector_pe))
        cpe3.metric("Medyan PD/DD", fmt(sector_pb))

        # Chart
        st.markdown('<div class="section-title">📈 1 Yıllık Fiyat ve Teorik Değer</div>', unsafe_allow_html=True)

        fig = go.Figure()
        fig.add_trace(go.Scatter(x=hist.index, y=hist["Close"], mode="lines", name="Kapanış Fiyatı"))

        if final_fair_value is not None:
            fig.add_hline(
                y=final_fair_value,
                line_dash="dash",
                annotation_text="ValuAI Teorik Değer",
                annotation_position="top left"
            )

        fig.update_layout(
            xaxis_title="Tarih",
            yaxis_title=f"Fiyat ({currency})",
            height=460,
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(color="#FAFAFA"),
            margin=dict(l=20, r=20, t=40, b=20)
        )

        st.plotly_chart(fig, use_container_width=True)

        # Explainable Score
        st.markdown('<div class="section-title">🧠 Açıklanabilir Skor Profili</div>', unsafe_allow_html=True)

        r1, r2 = st.columns([1, 1])

        with r1:
            st.plotly_chart(
                make_radar([valuation_score, profitability_score, growth_score, debt_score, risk_score]),
                use_container_width=True
            )

        with r2:
            s1, s2, s3, s4, s5 = st.columns(5)
            s1.metric("Değerleme", f"{valuation_score}/100", score_label(valuation_score))
            s2.metric("Kârlılık", f"{profitability_score}/100", score_label(profitability_score))
            s3.metric("Büyüme", f"{growth_score}/100", score_label(growth_score))
            s4.metric("Borçluluk", f"{debt_score}/100", score_label(debt_score))
            s5.metric("Risk", f"{risk_score}/100", score_label(risk_score))

            pcol, ncol = st.columns(2)

            with pcol:
                st.markdown("### ✅ Güçlü Sinyaller")
                if positives:
                    for item in positives:
                        st.markdown(f"- {item}")
                else:
                    st.markdown("- Belirgin güçlü sinyal bulunamadı.")

            with ncol:
                st.markdown("### ⚠️ İzlenmesi Gerekenler")
                if negatives:
                    for item in negatives:
                        st.markdown(f"- {item}")
                else:
                    st.markdown("- Belirgin negatif sinyal bulunamadı.")

        # Valuation
        st.markdown('<div class="section-title">🧮 Çoklu Değerleme Paneli</div>', unsafe_allow_html=True)

        v1, v2, v3, v4 = st.columns(4)
        v1.metric("F/K Modeli", fmt_money(pe_fair_value, currency))
        v2.metric("PD/DD Modeli", fmt_money(pb_fair_value, currency))
        v3.metric("Baz Değer", fmt_money(base_fair_value, currency))
        v4.metric("Final Teorik Değer", fmt_money(final_fair_value, currency))

        st.markdown(
            f"""
<div class="glow-card">
<b>Model Katmanı</b><br>
<span class="small-muted">
Comparable F/K: <b>{fmt(sector_pe)}</b> • Comparable PD/DD: <b>{fmt(sector_pb)}</b> •
Büyüme düzeltmesi: <b>{growth_adjustment:.2f}x</b> • 
Risk düzeltmesi: <b>{risk_adjustment:.2f}x</b> • 
Tahmini potansiyel: <b>%{potential:.2f}</b>
</span>
</div>
""",
            unsafe_allow_html=True
        )

        # 52 week and financials
        st.markdown('<div class="section-title">📍 52 Haftalık Fiyat Konumu</div>', unsafe_allow_html=True)

        w1, w2, w3 = st.columns(3)
        w1.metric("52 Hafta Dip", fmt_money(week_52_low, currency))
        w2.metric("52 Hafta Zirve", fmt_money(week_52_high, currency))
        w3.metric("Mevcut Konum", fmt(price_position_52w, "%"))

        if price_position_52w is not None:
            st.progress(int(clamp(price_position_52w)))

        st.markdown('<div class="section-title">📌 Ek Finansal Göstergeler</div>', unsafe_allow_html=True)

        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Forward F/K", fmt(forward_pe))
        m2.metric("Beta", fmt(beta))
        m3.metric("Kâr Marjı", fmt(profit_margin * 100 if profit_margin is not None else None, "%"))
        m4.metric("Gelir Büyümesi", fmt(revenue_growth * 100 if revenue_growth is not None else None, "%"))

        m5, m6, m7, m8 = st.columns(4)
        m5.metric("ROE", fmt(roe * 100 if roe is not None else None, "%"))
        m6.metric("Borç/Özkaynak", fmt(debt_to_equity))
        m7.metric("Cari Oran", fmt(current_ratio))
        m8.metric("Firma Değeri", fmt_big(enterprise_value))

        if any(v is not None for v in [target_low_price, target_mean_price, target_high_price]):
            st.markdown('<div class="section-title">🎯 Analist Hedefleri</div>', unsafe_allow_html=True)
            a1, a2, a3 = st.columns(3)
            a1.metric("Analist Düşük Hedef", fmt_money(target_low_price, currency))
            a2.metric("Analist Ortalama Hedef", fmt_money(target_mean_price, currency))
            a3.metric("Analist Yüksek Hedef", fmt_money(target_high_price, currency))

                # Chatbot için analiz bağlamını kaydet
        st.session_state.analysis_context = f"""
Şirket: {company_name}
Sembol: {symbol}
Sektör: {sector}
Endüstri: {industry}
Para birimi: {currency}

Mevcut fiyat: {current_price}
Önceki kapanış: {previous_close}
Gün içi en yüksek: {day_high}
Gün içi en düşük: {day_low}
52 hafta dip: {week_52_low}
52 hafta zirve: {week_52_high}
52 hafta fiyat konumu: {price_position_52w}

Comparable grup: {comparable_group_name}
Benzer şirketler: {comparable_symbols}
Comparable medyan F/K: {sector_pe}
Comparable medyan PD/DD: {sector_pb}

F/K: {pe_ratio}
Forward F/K: {forward_pe}
PD/DD: {pb_ratio}
EPS: {eps}
Defter değeri: {book_value}

F/K bazlı teorik değer: {pe_fair_value}
PD/DD bazlı teorik değer: {pb_fair_value}
Baz teorik değer: {base_fair_value}
Final ValuAI teorik değer: {final_fair_value}
Potansiyel: %{potential:.2f}

ValuAI Score: {valuai_score}/100
Değerleme skoru: {valuation_score}/100
Kârlılık skoru: {profitability_score}/100
Büyüme skoru: {growth_score}/100
Borçluluk skoru: {debt_score}/100
Risk skoru: {risk_score}/100

Panel sonucu: {result}
Risk etiketi: {risk_label}
Market Mood: {mood}

Güçlü sinyaller:
{positives}

İzlenmesi gerekenler:
{negatives}

ROE: {roe}
Kâr marjı: {profit_margin}
Gelir büyümesi: {revenue_growth}
Borç/Özkaynak: {debt_to_equity}
Cari oran: {current_ratio}
Beta: {beta}
Piyasa değeri: {market_cap}
Firma değeri: {enterprise_value}
"""
        # AI
        st.markdown('<div class="section-title">🤖 AI Finansal Yorum</div>', unsafe_allow_html=True)

        prompt = f"""
Aşağıdaki finansal verilere göre profesyonel, net ve veri odaklı analiz üret.

Kesin kurallar:
- Türkçe yaz.
- Yatırım tavsiyesi verme.
- "Al", "sat", "tut", "kesin alınır" gibi emir kipleri kullanma.
- "Daha fazla analiz gerekir", "detaylı araştırma yapılmalıdır", "yatırım kararı öncesi..." gibi kaçış cümleleri kullanma.
- Elindeki veriye göre yorum yap.
- Genel geçer cümleler kurma.
- Şirketi tanıtan uzun açıklama yazma, kısaca tanıt.
- Finansal oranlara doğrudan referans ver.
- Comparable değerleme motorunu özellikle açıkla.
- Maksimum 500 kelime.
- Net, teknik ve profesyonel dashboard dili kullan.
- Sonuç bölümünde net panel yorumu ver.

Veriler:
Şirket: {company_name}
Sembol: {symbol.upper()}
Sektör: {sector}
Endüstri: {industry}
Para birimi: {currency}

Fiyat:
Mevcut fiyat: {current_price}
Önceki kapanış: {previous_close}
Gün içi en yüksek: {day_high}
Gün içi en düşük: {day_low}
52 hafta dip: {week_52_low}
52 hafta zirve: {week_52_high}
52 hafta fiyat konumu: %{price_position_52w if price_position_52w is not None else "Veri yok"}

Comparable Valuation:
Comparable grup: {comparable_group_name}
Benzer şirketler: {comparable_symbols}
Comparable medyan F/K: {sector_pe}
Comparable medyan PD/DD: {sector_pb}

Değerleme:
F/K: {pe_ratio}
Forward F/K: {forward_pe}
PD/DD: {pb_ratio}
EPS: {eps}
Defter değeri: {book_value}
F/K bazlı teorik değer: {pe_fair_value}
PD/DD bazlı teorik değer: {pb_fair_value}
Analist ortalama hedef fiyatı: {target_mean_price}
Base teorik değer: {base_fair_value}
Büyüme düzeltmesi: {growth_adjustment}
Risk düzeltmesi: {risk_adjustment}
Final ValuAI teorik değer: {final_fair_value}
Potansiyel: %{potential:.2f}
Panel sonucu: {result}
Risk etiketi: {risk_label}
Market Mood: {mood}

ValuAI Skorları:
ValuAI Score: {valuai_score}/100
Değerleme skoru: {valuation_score}/100
Kârlılık skoru: {profitability_score}/100
Büyüme skoru: {growth_score}/100
Borçluluk skoru: {debt_score}/100
Risk skoru: {risk_score}/100

Güçlü sinyaller:
{positives}

Zayıf sinyaller:
{negatives}

Kalite / Risk:
ROE: {roe}
Kâr marjı: {profit_margin}
Gelir büyümesi: {revenue_growth}
Borç/Özkaynak: {debt_to_equity}
Cari oran: {current_ratio}
Beta: {beta}
Piyasa değeri: {market_cap}
Firma değeri: {enterprise_value}

Cevabı şu formatta ver:

**1. Değerleme Özeti**
Comparable F/K, Comparable PD/DD, birleşik teorik değer, ValuAI Score ve potansiyel üzerinden net yorum.

**2. Kalite ve Risk**
ROE, kâr marjı, borçluluk, beta, büyüme ve 52 haftalık fiyat konumundan mevcut olanları yorumla.

**3. Panel Sonucu**
Nihai dashboard yorumu.
"""

        with st.spinner("AI finansal yorum oluşturuluyor..."):
            provider, ai_text = generate_ai_analysis(
                prompt=prompt,
                company_name=company_name,
                valuai_score=valuai_score,
                final_fair_value=final_fair_value,
                current_price=current_price,
                currency=currency
            )

        st.caption(f"Kullanılan AI sağlayıcısı: {provider}")
        st.markdown(f"""<div class="report-card">{ai_text}</div>""", unsafe_allow_html=True)

    except Exception as e:
        st.error("Bir hata oluştu.")
        st.code(str(e))

# -----------------------------
# ValuAI Chatbot
# -----------------------------
st.markdown('<div class="section-title">💬 ValuAI Chatbot</div>', unsafe_allow_html=True)

st.markdown(
    """
<div class="glow-card">
<b>ValuAI Asistan</b><br>
<span class="small-muted">
Analiz yaptıktan sonra bu chatbot seçili hissenin skorlarını, risklerini, değerleme sonucunu ve finansal oranlarını açıklayabilir.
</span>
</div>
""",
    unsafe_allow_html=True
)

for message in st.session_state.chat_messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

user_question = st.chat_input("ValuAI analizine dair bir soru sor...")

if user_question:
    st.session_state.chat_messages.append({
        "role": "user",
        "content": user_question
    })

    with st.chat_message("user"):
        st.markdown(user_question)

    with st.chat_message("assistant"):
        with st.spinner("ValuAI asistan yanıtlıyor..."):
            chatbot_answer = generate_chatbot_response(user_question)
            st.markdown(chatbot_answer)

    st.session_state.chat_messages.append({
        "role": "assistant",
        "content": chatbot_answer
    })