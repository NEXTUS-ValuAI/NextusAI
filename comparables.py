import yfinance as yf
from market_data import safe_float


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


def choose_comparable_group(symbol: str, sector: str, industry: str):
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


def median_clean(values, max_value=500):
    clean = [v for v in values if v is not None and 0 < v < max_value]

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

    for symbol in group_symbols:
        try:
            info = yf.Ticker(symbol).info

            pe = safe_float(info.get("trailingPE"))
            pb = safe_float(info.get("priceToBook"))
            market_cap = safe_float(info.get("marketCap"))
            name = info.get("shortName") or info.get("longName") or symbol

            if pe is not None and 0 < pe < 500:
                pe_values.append(pe)

            if pb is not None and 0 < pb < 100:
                pb_values.append(pb)

            rows.append({
                "symbol": symbol,
                "company_name": name,
                "pe_ratio": pe,
                "pb_ratio": pb,
                "market_cap": market_cap,
            })

        except Exception:
            continue

    sector_pe = median_clean(pe_values, max_value=500)
    sector_pb = median_clean(pb_values, max_value=100)

    return {
        "sector_pe": sector_pe,
        "sector_pb": sector_pb,
        "rows": rows,
    }
