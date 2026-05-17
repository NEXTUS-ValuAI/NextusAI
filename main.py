from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from market_data import get_market_data
from comparables import choose_comparable_group, build_comparable_metrics
from valuation import calculate_valuation
from scoring import calculate_scores
from ai_engine import generate_ai_report
from chatbot import generate_chat_response


app = FastAPI(
    title="ValuAI API",
    description="AI powered equity analysis and valuation backend",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    symbol: str
    question: str


@app.get("/")
def root():
    return {
        "message": "ValuAI backend is running",
        "status": "ok"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/analyze")
def analyze_stock(symbol: str = Query(..., description="Stock symbol")):
    data = get_market_data(symbol)

    if data is None:
        raise HTTPException(
            status_code=404,
            detail="Hisse bulunamadı veya veri çekilemedi."
        )

    comparable_group_name, comparable_symbols = choose_comparable_group(
        data["symbol"],
        data["sector"],
        data["industry"]
    )

    comparable_data = build_comparable_metrics(comparable_symbols)

    data["comparable_group_name"] = comparable_group_name
    data["comparable_symbols"] = comparable_symbols
    data["comparable_sector_pe"] = comparable_data["sector_pe"]
    data["comparable_sector_pb"] = comparable_data["sector_pb"]
    data["comparable_rows"] = comparable_data["rows"]

    valuation_data = calculate_valuation(data)
    data.update(valuation_data)

    score_data = calculate_scores(data)
    data.update(score_data)

    ai_data = generate_ai_report(data)
    data.update(ai_data)

    return data


@app.post("/chat")
def chat(request: ChatRequest):
    data = analyze_stock(request.symbol)

    chat_data = generate_chat_response(
        data=data,
        question=request.question
    )

    return {
        "symbol": data.get("symbol"),
        "company_name": data.get("company_name"),
        "question": request.question,
        "chat_provider": chat_data["chat_provider"],
        "answer": chat_data["answer"]
    }
