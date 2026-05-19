def clamp(value, min_value=0, max_value=100):
    if value is None:
        return 50
    return max(min_value, min(value, max_value))


def score_valuation(pe_ratio, pb_ratio, potential):
    score = 50

    if pe_ratio:
        if pe_ratio < 8:
            score += 25
        elif pe_ratio < 15:
            score += 18
        elif pe_ratio < 25:
            score += 8
        elif pe_ratio < 40:
            score -= 5
        else:
            score -= 18

    if pb_ratio:
        if pb_ratio < 1:
            score += 18
        elif pb_ratio < 3:
            score += 10
        elif pb_ratio < 6:
            score -= 5
        else:
            score -= 15

    if potential is not None:
        if potential > 35:
            score += 22
        elif potential > 15:
            score += 12
        elif potential > 0:
            score += 5
        elif potential < -35:
            score -= 22
        elif potential < -15:
            score -= 12

    return round(clamp(score), 1)


def score_profitability(roe, profit_margin):
    score = 50

    if roe is not None:
        roe_pct = roe * 100
        if roe_pct > 25:
            score += 25
        elif roe_pct > 15:
            score += 18
        elif roe_pct > 8:
            score += 8
        elif roe_pct < 0:
            score -= 25

    if profit_margin is not None:
        margin_pct = profit_margin * 100
        if margin_pct > 25:
            score += 20
        elif margin_pct > 15:
            score += 12
        elif margin_pct > 5:
            score += 5
        elif margin_pct < 0:
            score -= 20

    return round(clamp(score), 1)


def score_growth(revenue_growth, forward_pe, pe_ratio):
    score = 50

    if revenue_growth is not None:
        growth_pct = revenue_growth * 100
        if growth_pct > 30:
            score += 25
        elif growth_pct > 15:
            score += 18
        elif growth_pct > 5:
            score += 8
        elif growth_pct < 0:
            score -= 15

    if forward_pe and pe_ratio:
        if forward_pe < pe_ratio:
            score += 10
        elif forward_pe > pe_ratio * 1.2:
            score -= 8

    return round(clamp(score), 1)


def score_debt(debt_to_equity, current_ratio):
    score = 50

    if debt_to_equity is not None:
        if debt_to_equity < 50:
            score += 25
        elif debt_to_equity < 100:
            score += 12
        elif debt_to_equity < 200:
            score -= 8
        else:
            score -= 22

    if current_ratio is not None:
        if current_ratio > 2:
            score += 15
        elif current_ratio > 1:
            score += 8
        elif current_ratio < 0.8:
            score -= 15

    return round(clamp(score), 1)


def score_risk(beta, price_position_52w):
    score = 50

    if beta is not None:
        if beta < 0.8:
            score += 20
        elif beta < 1.2:
            score += 10
        elif beta < 1.6:
            score -= 8
        else:
            score -= 20

    if price_position_52w is not None:
        if price_position_52w > 85:
            score -= 15
        elif price_position_52w < 25:
            score += 10

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
    if score >= 80:
        return "Güçlü"
    if score >= 65:
        return "Pozitif"
    if score >= 50:
        return "Dengeli"
    if score >= 35:
        return "Zayıf"
    return "Riskli"


def market_mood_label(valuai_score, potential, price_position_52w):
    if potential is None:
        return "Nötr"

    if valuai_score >= 70 and potential > 10:
        return "Pozitif"

    if valuai_score < 45 or potential < -20:
        return "Negatif"

    if price_position_52w is not None and price_position_52w > 85 and potential < 5:
        return "Temkinli"

    return "Nötr"


def risk_label_from_score(valuai_score):
    if valuai_score >= 75:
        return "Düşük-Orta"
    if valuai_score >= 60:
        return "Orta"
    if valuai_score >= 45:
        return "Orta-Yüksek"
    return "Yüksek"


def build_factor_lists(data, scores):
    positives = []
    negatives = []

    pe_ratio = data.get("pe_ratio")
    pb_ratio = data.get("pb_ratio")
    potential = data.get("potential")
    roe = data.get("roe")
    profit_margin = data.get("profit_margin")
    revenue_growth = data.get("revenue_growth")
    debt_to_equity = data.get("debt_to_equity")
    current_ratio = data.get("current_ratio")
    beta = data.get("beta")
    price_position_52w = data.get("price_position_52w")

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

    if scores["valuation_score"] >= 70:
        positives.append(f"Değerleme skoru {scores['valuation_score']}/100 ile güçlü.")
    elif scores["valuation_score"] < 40:
        negatives.append(f"Değerleme skoru {scores['valuation_score']}/100 ile zayıf.")

    if scores["profitability_score"] >= 70:
        positives.append(f"Kârlılık skoru {scores['profitability_score']}/100 ile destekleyici.")
    elif scores["profitability_score"] < 40:
        negatives.append(f"Kârlılık skoru {scores['profitability_score']}/100 ile zayıf.")

    if scores["growth_score"] >= 70:
        positives.append(f"Büyüme skoru {scores['growth_score']}/100 ile pozitif.")
    elif scores["growth_score"] < 40:
        negatives.append(f"Büyüme skoru {scores['growth_score']}/100 ile sınırlı.")

    if scores["debt_score"] < 40:
        negatives.append(f"Borçluluk skoru {scores['debt_score']}/100; bilanço riski izlenmeli.")

    if scores["risk_score"] < 40:
        negatives.append(f"Risk skoru {scores['risk_score']}/100; volatilite/fiyat konumu baskı yaratıyor.")

    return positives[:5], negatives[:5]


def calculate_scores(data):
    valuation_score = score_valuation(
        data.get("pe_ratio"),
        data.get("pb_ratio"),
        data.get("potential")
    )

    profitability_score = score_profitability(
        data.get("roe"),
        data.get("profit_margin")
    )

    growth_score = score_growth(
        data.get("revenue_growth"),
        data.get("forward_pe"),
        data.get("pe_ratio")
    )

    debt_score = score_debt(
        data.get("debt_to_equity"),
        data.get("current_ratio")
    )

    risk_score = score_risk(
        data.get("beta"),
        data.get("price_position_52w")
    )

    valuai_score = calculate_valuai_score(
        valuation_score,
        profitability_score,
        growth_score,
        debt_score,
        risk_score
    )

    scores = {
        "valuation_score": valuation_score,
        "profitability_score": profitability_score,
        "growth_score": growth_score,
        "debt_score": debt_score,
        "risk_score": risk_score,
        "valuai_score": valuai_score,
        "valuation_label": score_label(valuation_score),
        "profitability_label": score_label(profitability_score),
        "growth_label": score_label(growth_score),
        "debt_label": score_label(debt_score),
        "risk_score_label": score_label(risk_score),
        "risk_label": risk_label_from_score(valuai_score),
        "market_mood": market_mood_label(
            valuai_score,
            data.get("potential"),
            data.get("price_position_52w")
        )
    }

    positives, negatives = build_factor_lists(data, scores)

    scores["positive_signals"] = positives
    scores["negative_signals"] = negatives

    return scores
