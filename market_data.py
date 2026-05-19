import math
import yfinance as yf


def safe_float(value):
    try:
        if value is None:
            return None
        if isinstance(value, float) and math.isnan(value):
            return None
        return float(value)
    except Exception:
        return None


def resolve_symbol(user_symbol: str):
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

    for symbol in possible_symbols:
        try:
            stock = yf.Ticker(symbol)
            hist = stock.history(period="1y")

            if not hist.empty:
                info = stock.info
                return symbol, info, hist

        except Exception:
            continue

    return None, None, None


def get_market_data(user_symbol: str):
    symbol, info, hist = resolve_symbol(user_symbol)

    if symbol is None or info is None or hist is None or hist.empty:
        return None

    close_prices = hist["Close"].dropna()

    current_price = safe_float(info.get("currentPrice")) or safe_float(close_prices.iloc[-1])
    week_52_low = safe_float(close_prices.min())
    week_52_high = safe_float(close_prices.max())

    if (
        current_price is not None
        and week_52_low is not None
        and week_52_high is not None
        and week_52_high != week_52_low
    ):
        price_position_52w = ((current_price - week_52_low) / (week_52_high - week_52_low)) * 100
    else:
        price_position_52w = None

    history = []

    for index, row in hist.reset_index().iterrows():
        history.append({
            "date": str(row["Date"].date()),
            "close": safe_float(row["Close"]),
        })

    return {
        "symbol": symbol,
        "company_name": info.get("longName") or info.get("shortName") or symbol,
        "sector": info.get("sector", "Bilinmiyor"),
        "industry": info.get("industry", "Bilinmiyor"),
        "currency": info.get("currency", ""),

        "current_price": current_price,
        "previous_close": safe_float(info.get("previousClose")),
        "day_high": safe_float(info.get("dayHigh")),
        "day_low": safe_float(info.get("dayLow")),

        "pe_ratio": safe_float(info.get("trailingPE")),
        "forward_pe": safe_float(info.get("forwardPE")),
        "pb_ratio": safe_float(info.get("priceToBook")),
        "eps": safe_float(info.get("trailingEps")),
        "book_value": safe_float(info.get("bookValue")),

        "roe": safe_float(info.get("returnOnEquity")),
        "profit_margin": safe_float(info.get("profitMargins")),
        "revenue_growth": safe_float(info.get("revenueGrowth")),
        "debt_to_equity": safe_float(info.get("debtToEquity")),
        "current_ratio": safe_float(info.get("currentRatio")),
        "beta": safe_float(info.get("beta")),

        "market_cap": safe_float(info.get("marketCap")),
        "enterprise_value": safe_float(info.get("enterpriseValue")),

        "target_mean_price": safe_float(info.get("targetMeanPrice")),
        "target_high_price": safe_float(info.get("targetHighPrice")),
        "target_low_price": safe_float(info.get("targetLowPrice")),

        "week_52_low": week_52_low,
        "week_52_high": week_52_high,
        "price_position_52w": price_position_52w,

        "history": history,
    }
