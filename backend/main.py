import logging
import os
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import edge_tts

from schemas import (
    AnalysisResponse, ChatRequest, ChatResponse, ErrorResponse,
    SpeechRequest, SpeechResponse,
    ValuationData, ScoreBreakdown, SignalData, ComparableData
)
from exceptions import StockNotFoundError, DataFetchError, ValidationError
from cache import cache

from market_data import get_market_data
from comparables import choose_comparable_group, build_comparable_metrics
from valuation import calculate_valuation
from scoring import calculate_scores
from ai_engine import generate_ai_report
from chatbot import generate_chat_response


# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TTS_VOICE = "tr-TR-AhmetNeural"
TTS_RATE = "-5%"
TTS_PITCH = "+0Hz"

# FastAPI app
app = FastAPI(
    title="NextusAI API",
    description="AI powered equity analysis and valuation backend",
    version="2.0.0"
)

# CORS - Restricted for production
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return {
        "error": "Çok fazla istek gönderdiniz. Lütfen 1 dakika bekleyip tekrar deneyin.",
        "detail": str(exc.detail)
    }

# Security headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.get("/", tags=["Health"])
def root():
    """API status"""
    return {
        "status": "ok",
        "service": "NextusAI",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/analyze", tags=["Analysis"])
@limiter.limit("30/minute")
def analyze_stock(request: Request, symbol: str = Query(..., min_length=1, max_length=10, description="Stock symbol")):
    """
    Analyze stock and return comprehensive valuation report.
    
    Args:
        symbol: Stock symbol (e.g., ASELS, AAPL, PATEK)
    
    Returns:
        Complete analysis with scores, valuation, comparables, and AI report
    """
    try:
        # Validate input
        if not symbol or len(symbol) > 10:
            raise ValidationError("Invalid stock symbol")
        
        logger.info(f"Analyzing stock: {symbol}")
        
        # Check cache
        cache_key = f"analysis_{symbol.upper()}"
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for {symbol}")
            return cached_result
        
        # Fetch market data
        data = get_market_data(symbol)
        if data is None:
            logger.warning(f"Stock not found: {symbol}")
            raise StockNotFoundError(f"Stock symbol '{symbol}' not found")
        
        # Get comparable group
        comparable_group_name, comparable_symbols = choose_comparable_group(
            data["symbol"],
            data["sector"],
            data["industry"]
        )
        
        # Build comparable metrics
        comparable_data = build_comparable_metrics(comparable_symbols)
        
        # Merge data
        data["comparable_group_name"] = comparable_group_name
        data["comparable_symbols"] = comparable_symbols
        data["comparable_sector_pe"] = comparable_data["sector_pe"]
        data["comparable_sector_pb"] = comparable_data["sector_pb"]
        data["comparable_rows"] = comparable_data["rows"]
        
        # Calculate valuation
        valuation_data = calculate_valuation(data)
        data.update(valuation_data)
        
        # Calculate scores
        score_data = calculate_scores(data)
        data.update(score_data)
        
        # Generate AI report
        ai_data = generate_ai_report(data)
        data.update(ai_data)
        
        # Cache result (5 minutes)
        cache.set(cache_key, data, ttl_seconds=300)
        
        logger.info(f"Analysis complete for {symbol}")
        return data
    
    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except StockNotFoundError as e:
        logger.error(f"Stock not found: {e}")
        raise HTTPException(
            status_code=404,
            detail=f"Hisse '{symbol}' bulunamadı",
        )
    
    except DataFetchError as e:
        logger.error(f"Data fetch error: {e}")
        raise HTTPException(
            status_code=503,
            detail="Veri kaynağından bilgi alınamadı. Lütfen tekrar deneyin."
        )
    
    except Exception as e:
        logger.error(f"Unexpected error analyzing {symbol}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Analiz yapılırken beklenmeyen bir hata oluştu"
        )


@app.post("/chat", tags=["Chat"])
@limiter.limit("20/minute")
def chat(request: Request, chat_req: ChatRequest):
    """
    Chat with AI about analyzed stock.
    
    Args:
        request: ChatRequest with symbol and question
    
    Returns:
        AI-generated answer about the stock
    """
    try:
        # Validate input
        if not chat_req.symbol or not chat_req.question:
            raise ValidationError("Symbol and question are required")
        
        logger.info(f"Chat request for {chat_req.symbol}")
        
        # Get analysis data
        data = get_market_data(chat_req.symbol)
        if data is None:
            raise StockNotFoundError(f"Stock '{chat_req.symbol}' not found")
        
        # Re-analyze with full context
        comparable_group_name, comparable_symbols = choose_comparable_group(
            data["symbol"], data["sector"], data["industry"]
        )
        comparable_data = build_comparable_metrics(comparable_symbols)
        data.update({
            "comparable_group_name": comparable_group_name,
            "comparable_symbols": comparable_symbols,
            "comparable_sector_pe": comparable_data["sector_pe"],
            "comparable_sector_pb": comparable_data["sector_pb"],
            "comparable_rows": comparable_data["rows"],
        })
        
        data.update(calculate_valuation(data))
        data.update(calculate_scores(data))
        data.update(generate_ai_report(data))
        
        # Generate chat response
        chat_data = generate_chat_response(
            data=data,
            question=chat_req.question
        )
        
        logger.info(f"Chat response generated for {chat_req.symbol}")
        
        return {
            "symbol": data.get("symbol"),
            "company_name": data.get("company_name"),
            "question": chat_req.question,
            "chat_provider": chat_data["chat_provider"],
            "answer": chat_data["answer"]
        }
    
    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except StockNotFoundError:
        logger.error(f"Stock not found: {request.symbol}")
        raise HTTPException(
            status_code=404,
            detail=f"Hisse '{request.symbol}' bulunamadı"
        )
    
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Chatbot yanıtı alınamadı. Lütfen tekrar deneyin."
        )


@app.post("/tts/speak", tags=["TTS"])
async def speak_text(speech_req: SpeechRequest):
    """Generate Turkish speech using a natural neural voice."""
    try:
        communicate = edge_tts.Communicate(
            text=speech_req.text.strip(),
            voice=TTS_VOICE,
            rate=TTS_RATE,
            pitch=TTS_PITCH,
        )

        audio_buffer = bytearray()
        async for chunk in communicate.stream():
            if chunk.get("type") == "audio":
                audio_buffer.extend(chunk["data"])

        if not audio_buffer:
            raise HTTPException(
                status_code=502,
                detail="Doğal ses verisi üretilemedi."
            )

        return Response(content=bytes(audio_buffer), media_type="audio/mpeg")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TTS speak error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Doğal ses oluşturulamadı"
        )


@app.post("/tts/stop", tags=["TTS"])
def stop_text_to_speech():
    """Acknowledge client-side speech stop requests."""
    return SpeechResponse(
        status="stopped",
        voice_type=TTS_VOICE,
        language="tr",
    )
