from market_data import safe_float


def calculate_valuation(data):
    current_price = safe_float(data.get("current_price"))
    eps = safe_float(data.get("eps"))
    book_value = safe_float(data.get("book_value"))
    target_mean_price = safe_float(data.get("target_mean_price"))

    sector_pe = safe_float(data.get("comparable_sector_pe"))
    sector_pb = safe_float(data.get("comparable_sector_pb"))

    revenue_growth = safe_float(data.get("revenue_growth"))
    beta = safe_float(data.get("beta"))
    debt_to_equity = safe_float(data.get("debt_to_equity"))

    if sector_pe is None:
        sector_pe = 18.0

    if sector_pb is None:
        sector_pb = 3.0

    pe_fair_value = eps * sector_pe if eps is not None else None
    pb_fair_value = book_value * sector_pb if book_value is not None else None

    model_values = []

    if pe_fair_value is not None and pe_fair_value > 0:
        model_values.append({
            "model": "F/K Modeli",
            "value": pe_fair_value,
            "weight": 0.45
        })

    if pb_fair_value is not None and pb_fair_value > 0:
        model_values.append({
            "model": "PD/DD Modeli",
            "value": pb_fair_value,
            "weight": 0.35
        })

    if target_mean_price is not None and target_mean_price > 0:
        model_values.append({
            "model": "Analist Hedefi",
            "value": target_mean_price,
            "weight": 0.20
        })

    if model_values:
        total_weight = sum(item["weight"] for item in model_values)
        base_fair_value = sum(
            item["value"] * item["weight"] for item in model_values
        ) / total_weight
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

    final_fair_value = None
    potential = None

    if base_fair_value is not None:
        final_fair_value = base_fair_value * growth_adjustment * risk_adjustment

    if final_fair_value is not None and current_price not in [None, 0]:
        potential = ((final_fair_value - current_price) / current_price) * 100

    if potential is None:
        result = "Veri yetersiz"
    elif potential > 30:
        result = "Görece ucuz / yüksek potansiyelli"
    elif potential > 10:
        result = "Pozitif potansiyel"
    elif potential < -30:
        result = "Görece pahalı / aşağı yönlü risk yüksek"
    elif potential < -10:
        result = "Sınırlı aşağı yönlü risk"
    else:
        result = "Makul fiyat bandında"

    return {
        "pe_fair_value": pe_fair_value,
        "pb_fair_value": pb_fair_value,
        "model_values": model_values,
        "base_fair_value": base_fair_value,
        "growth_adjustment": growth_adjustment,
        "risk_adjustment": risk_adjustment,
        "final_fair_value": final_fair_value,
        "potential": potential,
        "valuation_result": result,
    }
