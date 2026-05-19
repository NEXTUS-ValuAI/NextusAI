from pydantic import BaseModel, Field
from typing import Optional, List


class StockMetrics(BaseModel):
    """Stock market metrics"""
    symbol: str
    company_name: str
    sector: str
    industry: str
    currency: str
    current_price: Optional[float] = None
    previous_close: Optional[float] = None
    day_high: Optional[float] = None
    day_low: Optional[float] = None


class ValuationData(BaseModel):
    """Valuation results"""
    pe_fair_value: Optional[float] = None
    pb_fair_value: Optional[float] = None
    base_fair_value: Optional[float] = None
    final_fair_value: Optional[float] = None
    potential: Optional[float] = None
    valuation_result: str


class ScoreBreakdown(BaseModel):
    """Score components"""
    valuation_score: float
    profitability_score: float
    growth_score: float
    debt_score: float
    risk_score: float
    valuai_score: float
    market_mood: str
    risk_label: str


class SignalData(BaseModel):
    """Trading signals"""
    positive_signals: List[str]
    negative_signals: List[str]


class ComparableRow(BaseModel):
    """Comparable company"""
    symbol: str
    company_name: str
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    market_cap: Optional[float] = None


class ComparableData(BaseModel):
    """Comparable metrics"""
    comparable_group_name: str
    comparable_symbols: List[str]
    comparable_sector_pe: Optional[float] = None
    comparable_sector_pb: Optional[float] = None
    comparable_rows: List[ComparableRow]


class PriceHistory(BaseModel):
    """Price history point"""
    date: str
    close: Optional[float] = None


class AIReport(BaseModel):
    """AI generated report"""
    ai_report: Optional[str] = None
    ai_provider: Optional[str] = None


class AnalysisResponse(StockMetrics):
    """Complete analysis response"""
    pe_ratio: Optional[float] = None
    forward_pe: Optional[float] = None
    pb_ratio: Optional[float] = None
    eps: Optional[float] = None
    book_value: Optional[float] = None
    roe: Optional[float] = None
    profit_margin: Optional[float] = None
    revenue_growth: Optional[float] = None
    debt_to_equity: Optional[float] = None
    current_ratio: Optional[float] = None
    beta: Optional[float] = None
    market_cap: Optional[float] = None
    enterprise_value: Optional[float] = None
    
    # Valuation
    valuation_data: ValuationData
    
    # Scoring
    scores: ScoreBreakdown
    
    # Signals
    signals: SignalData
    
    # Comparables
    comparables: ComparableData
    
    # AI Report
    ai_data: AIReport
    
    # History
    history: List[PriceHistory]

    # Long-term pricing
    price_5y_start_price: Optional[float] = None
    price_5y_end_price: Optional[float] = None
    price_5y_change_pct: Optional[float] = None
    price_5y_cagr_pct: Optional[float] = None
    next_year_price_estimate: Optional[float] = None
    next_year_change_pct: Optional[float] = None
    
    # 52-week
    week_52_low: Optional[float] = None
    week_52_high: Optional[float] = None
    price_position_52w: Optional[float] = None
    
    # Target prices
    target_mean_price: Optional[float] = None
    target_high_price: Optional[float] = None
    target_low_price: Optional[float] = None


class ChatRequest(BaseModel):
    """Chat request"""
    symbol: str = Field(..., min_length=1, max_length=10)
    question: str = Field(..., min_length=3, max_length=500)


class ChatResponse(BaseModel):
    """Chat response"""
    symbol: str
    company_name: str
    question: str
    chat_provider: str
    answer: str


class SpeechRequest(BaseModel):
    """Speech synthesis request"""
    text: str = Field(..., min_length=1, max_length=5000)


class SpeechResponse(BaseModel):
    """Speech synthesis response"""
    status: str
    voice_type: str
    language: str


class ErrorResponse(BaseModel):
    """Error response"""
    status: str = "error"
    message: str
    detail: Optional[str] = None
    suggestion: Optional[str] = None
