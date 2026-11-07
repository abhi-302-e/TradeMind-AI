import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.services.market_service import MarketService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("")
def get_dashboard_summary(db: Session = Depends(get_db)):
    assets = MarketService.get_supported_assets()
    snapshots = [MarketService.get_asset_snapshot(a["symbol"]) for a in assets]

    # Indices
    indices = [
        {"name": "NIFTY 50", "value": 24385.60, "change": 142.30, "change_pct": 0.59, "status": "bullish"},
        {"name": "SENSEX", "value": 80112.45, "change": 420.10, "change_pct": 0.53, "status": "bullish"},
        {"name": "BANK NIFTY", "value": 52140.80, "change": -110.25, "change_pct": -0.21, "status": "bearish"},
        {"name": "NASDAQ", "value": 18988.20, "change": 178.60, "change_pct": 0.95, "status": "bullish"},
        {"name": "S&P 500", "value": 5995.10, "change": 24.50, "change_pct": 0.41, "status": "bullish"},
        {"name": "BTC/USD", "value": 89450.00, "change": 1820.00, "change_pct": 2.08, "status": "bullish"},
    ]

    # Top Gainers / Losers
    sorted_movers = sorted(snapshots, key=lambda x: x["price_change_pct"], reverse=True)
    top_gainers = sorted_movers[:3]
    top_losers = sorted_movers[-3:]

    # Active AI Signals
    active_signals = [
        {
            "symbol": "RELIANCE.NS",
            "name": "Reliance Industries",
            "signal": "BULLISH",
            "score": 78.4,
            "confidence": 0.86,
            "entry": 2980.50,
            "target": 3120.00,
            "stop_loss": 2910.00,
            "reason": "50 EMA crossover with positive earnings momentum"
        },
        {
            "symbol": "TCS.NS",
            "name": "Tata Consultancy Services",
            "signal": "BULLISH",
            "score": 74.2,
            "confidence": 0.82,
            "entry": 4120.00,
            "target": 4350.00,
            "stop_loss": 4020.00,
            "reason": "Oversold RSI rebound and expansion in multi-cloud client deals"
        },
        {
            "symbol": "AAPL",
            "name": "Apple Inc.",
            "signal": "BULLISH",
            "score": 76.8,
            "confidence": 0.84,
            "entry": 224.50,
            "target": 238.00,
            "stop_loss": 218.00,
            "reason": "Breakout above resistance corridor with high volume confirmation"
        }
    ]

    # Agent Live Statuses
    agents_status = [
        {"name": "Market Data Agent", "status": "ONLINE", "latency": "42ms", "tasks_completed": 1420},
        {"name": "Technical Analysis Agent", "status": "ONLINE", "latency": "68ms", "tasks_completed": 1395},
        {"name": "Fundamental Analysis Agent", "status": "ONLINE", "latency": "85ms", "tasks_completed": 1120},
        {"name": "News Sentiment Agent", "status": "ONLINE", "latency": "112ms", "tasks_completed": 980},
        {"name": "Opportunity Detection Agent", "status": "ONLINE", "latency": "54ms", "tasks_completed": 1284},
        {"name": "Market Prediction Agent", "status": "ONLINE", "latency": "145ms", "tasks_completed": 890},
        {"name": "Risk Management Agent", "status": "ONLINE", "latency": "38ms", "tasks_completed": 1420},
        {"name": "Portfolio Management Agent", "status": "ONLINE", "latency": "44ms", "tasks_completed": 950},
        {"name": "Trading Decision Agent", "status": "ONLINE", "latency": "62ms", "tasks_completed": 1240},
        {"name": "Performance Monitoring Agent", "status": "ONLINE", "latency": "51ms", "tasks_completed": 820},
    ]

    return {
        "kpis": {
            "portfolio_value": 128450.00,
            "daily_pnl": 2340.50,
            "daily_pnl_pct": 1.86,
            "market_trend": "BULLISH_EXPANSION",
            "active_opportunities": len(active_signals),
            "portfolio_risk_score": 38.5,
            "risk_classification": "MODERATE",
            "open_paper_trades": 3,
            "available_cash": 42100.00
        },
        "indices": indices,
        "top_gainers": top_gainers,
        "top_losers": top_losers,
        "active_signals": active_signals,
        "agents_status": agents_status,
        "recent_news": MarketService.get_news_and_sentiment("RELIANCE.NS"),
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

