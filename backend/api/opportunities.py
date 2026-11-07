from fastapi import APIRouter
from backend.services.market_service import MarketService
from backend.orchestrator.workflow import TradeMindOrchestrator

router = APIRouter(prefix="/api/opportunities", tags=["AI Opportunities"])
orchestrator = TradeMindOrchestrator()

@router.get("")
def get_trading_opportunities():
    assets = MarketService.get_supported_assets()
    opportunities = []

    for idx, a in enumerate(assets):
        symbol = a["symbol"]
        snapshot = MarketService.get_asset_snapshot(symbol)
        curr = snapshot["current_price"]

        # Run quick opportunity detection
        opp_out = orchestrator.opportunity_agent.run(symbol, {
            "technical": orchestrator.technical_agent.run(symbol, {}).model_dump(),
            "fundamental": orchestrator.fundamental_agent.run(symbol, {}).model_dump(),
            "news": orchestrator.news_agent.run(symbol, {}).model_dump()
        })

        metrics = opp_out.metrics
        opportunities.append({
            "id": idx + 1,
            "symbol": symbol,
            "company_name": a["name"],
            "exchange": a["exchange"],
            "signal": opp_out.signal,
            "score": opp_out.score,
            "confidence": opp_out.confidence,
            "entry_price": metrics.get("entry_price", curr),
            "target_price": metrics.get("target_price", round(curr * 1.05, 2)),
            "stop_loss": metrics.get("stop_loss", round(curr * 0.97, 2)),
            "risk_reward": metrics.get("risk_reward_ratio", 2.0),
            "evidence": opp_out.evidence,
            "warnings": opp_out.warnings
        })

    # Sort high conviction opportunities first
    opportunities = sorted(opportunities, key=lambda x: x["score"], reverse=True)
    return {
        "count": len(opportunities),
        "opportunities": opportunities
    }

