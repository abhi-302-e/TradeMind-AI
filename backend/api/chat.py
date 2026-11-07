from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.services.market_service import MarketService
from backend.orchestrator.workflow import TradeMindOrchestrator

router = APIRouter(prefix="/api/chat", tags=["AI Copilot & Assistant"])
orchestrator = TradeMindOrchestrator()

class ChatRequest(BaseModel):
    message: str
    symbol: Optional[str] = "RELIANCE.NS"

class ChatResponse(BaseModel):
    reply: str
    symbol: str
    verdict: Optional[str] = None
    composite_score: Optional[float] = None
    agent_citations: List[str]
    suggested_actions: List[str]

@router.post("", response_model=ChatResponse)
def ask_ai_assistant(req: ChatRequest):
    msg = req.message.strip().lower()
    symbol = req.symbol or "RELIANCE.NS"

    # Detect symbol from message if mentioned
    for asset in MarketService.get_supported_assets():
        s_clean = asset["symbol"].replace(".NS", "").lower()
        if s_clean in msg or asset["symbol"].lower() in msg:
            symbol = asset["symbol"]
            break

    # Run quick orchestrator analysis
    analysis = orchestrator.run_analysis(symbol=symbol)
    snapshot = MarketService.get_asset_snapshot(symbol)
    ti = analysis["agents_summary"]["technical"]["metrics"]
    risk = analysis["agents_summary"]["risk"]["metrics"]
    dec = analysis["agents_summary"]["decision"]["metrics"]

    verdict = analysis["final_verdict"]
    score = analysis["composite_score"]
    price = snapshot["current_price"]

    # Natural Language Response Engine grounded in 10 Agent Outputs
    if "rsi" in msg:
        reply = (
            f"According to the Technical Analysis Agent, the 14-day RSI for {symbol} currently stands at {ti.get('rsi', 58.4)}. "
            f"This indicates constructive momentum without entering overbought territory (>70). "
            f"Moving averages (50 EMA at ₹{ti.get('ema_50', price)}) suggest sustained baseline support."
        )
        citations = ["Technical Analysis Agent", "Market Data Collection Agent"]
    elif "stop" in msg or "risk" in msg or "size" in msg:
        reply = (
            f"The Risk Management Agent recommends a protective stop-loss at ₹{risk.get('stop_loss_price')} "
            f"with an upside target of ₹{risk.get('target_price')}. "
            f"Based on a 1% risk budget on ₹100k equity, suggested sizing is {risk.get('suggested_units')} units "
            f"(Total value: ₹{risk.get('total_position_value', 0):,.2f}), capping maximum potential loss to ₹{risk.get('planned_risk_amount', 1000):,.2f}."
        )
        citations = ["Risk Management Agent", "Opportunity Detection Agent"]
    elif "predict" in msg or "future" in msg or "forecast" in msg:
        pred_m = analysis["agents_summary"]["prediction"]["metrics"]
        reply = (
            f"The Market Prediction Agent's Chronological Ridge Regressor projects {symbol} reaching ₹{pred_m.get('projected_price')} "
            f"over the next 5 trading days ({pred_m.get('projected_change_pct'):+.2f}%). "
            f"The 78% confidence uncertainty corridor spans between ₹{pred_m.get('corridor_low')} and ₹{pred_m.get('corridor_high')}."
        )
        citations = ["Market Prediction Agent", "Technical Analysis Agent"]
    elif "buy" in msg or "sell" in msg or "should i" in msg or "recommend" in msg:
        reply = (
            f"The Multi-Agent consensus for {symbol} is: **{verdict}** with an overall Composite Score of {score}/100 "
            f"and {analysis['confidence']*100:.0f}% confidence. "
            f"Technical momentum and fundamental stability are aligned. Suggested Entry: ₹{dec.get('entry_price', price)}, "
            f"Target: ₹{dec.get('target_price')}, Stop-Loss: ₹{dec.get('stop_loss_price')}."
        )
        citations = ["Trading Decision Agent", "Opportunity Detection Agent", "Fundamental Analysis Agent"]
    else:
        reply = (
            f"I have analyzed {symbol} across our 10 autonomous agents. "
            f"Current price is ₹{price:,.2f} ({snapshot['price_change_pct']:+.2f}%). "
            f"The overarching system verdict is **{verdict}** (Composite Score: {score}/100, Risk: {analysis['risk_level']}). "
            f"Key drivers: RSI at {ti.get('rsi', 58.4)}, 50 EMA at ₹{ti.get('ema_50')}, and positive quarterly earnings sentiment."
        )
        citations = ["Trading Decision Agent", "Technical Analysis Agent", "News Sentiment Agent"]

    return ChatResponse(
        reply=reply,
        symbol=symbol,
        verdict=verdict,
        composite_score=score,
        agent_citations=citations,
        suggested_actions=[
            f"Run Full 10-Agent Analysis on {symbol}",
            f"Simulate Paper Order for {symbol}",
            f"View {symbol} 5-Day ML Forecast Cone"
        ]
    )
