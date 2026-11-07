from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from backend.services.market_service import MarketService

router = APIRouter(tags=["Market Data & Indicators"])

@router.get("/api/market/overview")
def get_market_overview():
    assets = MarketService.get_supported_assets()
    snapshots = [MarketService.get_asset_snapshot(a["symbol"]) for a in assets]
    return {
        "total_assets": len(snapshots),
        "assets": snapshots,
        "market_status": "OPEN",
        "primary_exchange": "NSE / NASDAQ",
        "timestamp": snapshots[0]["last_updated"] if snapshots else ""
    }

@router.get("/api/market/search")
def search_assets(q: str = Query("", description="Symbol or company query")):
    return MarketService.search_assets(q)

@router.get("/api/market/{symbol}")
def get_asset_market_data(symbol: str):
    snapshot = MarketService.get_asset_snapshot(symbol)
    bars = MarketService.get_historical_bars(symbol, days=90)
    indicators = MarketService.calculate_technical_indicators(bars)
    fundamentals = MarketService.get_fundamental_metrics(symbol)
    return {
        "snapshot": snapshot,
        "indicators": indicators,
        "fundamentals": fundamentals,
        "bars_count": len(bars)
    }

@router.get("/api/market/{symbol}/history")
def get_historical_data(symbol: str, days: int = Query(120, ge=10, le=365)):
    bars = MarketService.get_historical_bars(symbol, days=days)
    return {
        "symbol": symbol,
        "days": len(bars),
        "bars": bars
    }

@router.get("/api/indicators/{symbol}")
def get_technical_indicators(symbol: str):
    bars = MarketService.get_historical_bars(symbol, days=120)
    indicators = MarketService.calculate_technical_indicators(bars)
    return {
        "symbol": symbol,
        "indicators": indicators,
        "timestamp": bars[-1]["time"] if bars else ""
    }

@router.get("/api/fundamentals/{symbol}")
def get_financial_fundamentals(symbol: str):
    return {
        "symbol": symbol,
        "metrics": MarketService.get_fundamental_metrics(symbol)
    }

@router.get("/api/news/{symbol}")
def get_news_sentiment(symbol: str):
    articles = MarketService.get_news_and_sentiment(symbol)
    return {
        "symbol": symbol,
        "articles": articles,
        "count": len(articles)
    }

