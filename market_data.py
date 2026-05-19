import math
import yfinance as yf
import logging

logger = logging.getLogger(__name__)


def safe_float(value):
    """Safely convert value to float"""
    try:
        if value is None:
            return None
        if isinstance(value, float) and math.isnan(value):
            return None
        return float(value)
    except Exception as e:
        logger.debug(f"Failed to convert {value} to float: {e}")
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
            hist = stock.history(period="5y")

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
    close_count = len(close_prices)

    current_price = safe_float(info.get("currentPrice")) or safe_float(close_prices.iloc[-1])
    week_52_slice = close_prices.tail(252)
    week_52_low = safe_float(info.get("fiftyTwoWeekLow")) or safe_float(week_52_slice.min())
    week_52_high = safe_float(info.get("fiftyTwoWeekHigh")) or safe_float(week_52_slice.max())

    five_year_start_price = safe_float(close_prices.iloc[0]) if close_count else None
    five_year_end_price = safe_float(close_prices.iloc[-1]) if close_count else None

    if close_count >= 2:
      first_timestamp = hist.index[0]
      last_timestamp = hist.index[-1]
      elapsed_years = max((last_timestamp - first_timestamp).days / 365.25, 0.01)
    else:
      elapsed_years = None

    if (
        five_year_start_price is not None
        and five_year_start_price > 0
        and five_year_end_price is not None
    ):
        price_5y_change_pct = ((five_year_end_price - five_year_start_price) / five_year_start_price) * 100
    else:
        price_5y_change_pct = None

    if (
        five_year_start_price is not None
        and five_year_start_price > 0
        and five_year_end_price is not None
        and elapsed_years is not None
    ):
        price_5y_cagr_pct = (((five_year_end_price / five_year_start_price) ** (1 / elapsed_years)) - 1) * 100
    else:
        price_5y_cagr_pct = None

    forecast_base_price = current_price or five_year_end_price
    if forecast_base_price is not None and price_5y_cagr_pct is not None:
        next_year_price_estimate = forecast_base_price * (1 + (price_5y_cagr_pct / 100))
        next_year_change_pct = price_5y_cagr_pct
    else:
        next_year_price_estimate = None
        next_year_change_pct = None

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

        "price_5y_start_price": five_year_start_price,
        "price_5y_end_price": five_year_end_price,
        "price_5y_change_pct": price_5y_change_pct,
        "price_5y_cagr_pct": price_5y_cagr_pct,
        "next_year_price_estimate": next_year_price_estimate,
        "next_year_change_pct": next_year_change_pct,

        "history": history,
    }
