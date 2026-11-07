from typing import Dict, Any
from backend.agents.base_agent import BaseAgent
from backend.schemas.schemas import BaseAgentOutput
from backend.services.market_service import MarketService

class TradingDecisionAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Trading Decision Agent",
            code_name="decision_agent",
            description="Aggregates multi-agent intelligence into an explainable, risk-adjusted trading recommendation with clear execution targets."
        )

    def process(self, asset: str, context: Dict[str, Any]) -> BaseAgentOutput:
        tech = context.get("technical", {})
        fund = context.get("fundamental", {})
        news = context.get("news", {})
        pred = context.get("prediction", {})
        risk = context.get("risk", {})

        s_tech = tech.get("score", 50.0)
        s_fund = fund.get("score", 50.0)
        s_news = news.get("score", 50.0)
        s_pred = pred.get("score", 50.0)
        risk_score = risk.get("score", 50.0)

        # Unified Multi-Agent Synthesis Formula
        composite_score = round(0.35 * s_tech + 0.25 * s_fund + 0.20 * s_news + 0.20 * s_pred, 1)

        # Risk penalty if risk score is excessively high
        if risk_score > 70.0:
            composite_score = max(10.0, composite_score - 15.0)

        snapshot = MarketService.get_asset_snapshot(asset)
        risk_metrics = risk.get("metrics", {})
        entry_price = risk_metrics.get("current_price", snapshot["current_price"])
        stop_loss = risk_metrics.get("stop_loss_price", round(entry_price * 0.965, 2))
        target_price = risk_metrics.get("target_price", round(entry_price * 1.07, 2))
        suggested_units = risk_metrics.get("suggested_units", 25)

        evidence = []
        warnings = []

        if composite_score >= 65.0 and risk_score <= 65.0:
            verdict = "BUY CANDIDATE"
            confidence = 0.84
            evidence.append(f"Strong consensus achieved: Technical ({s_tech}) and Fundamental ({s_fund}) confirm upside alignment.")
            evidence.append(f"Favorable Risk/Reward structure with stop at {stop_loss} and target at {target_price}.")
            evidence.append(f"Sentiment support ({s_news}) and ML regression projection affirm positive expectation.")
        elif composite_score <= 40.0:
            verdict = "SELL CANDIDATE"
            confidence = 0.81
            evidence.append(f"Technical momentum breakdown ({s_tech}) and low fundamental conviction ({s_fund}) warrant caution.")
            warnings.append("High probability of further downside or capital drawdown.")
        else:
            verdict = "HOLD / NEUTRAL"
            confidence = 0.72
            evidence.append(f"Balanced market signals (Composite: {composite_score}/100). No immediate asymmetric trade setup.")
            evidence.append("Patience advised until clearer directional momentum or earnings catalysts emerge.")

        warnings.extend(risk.get("warnings", []))

        return BaseAgentOutput(
            agent_name=self.name,
            status="success",
            asset=asset,
            timestamp="",
            score=composite_score,
            signal=verdict,
            confidence=confidence,
            metrics={
                "composite_score": composite_score,
                "final_verdict": verdict,
                "entry_price": entry_price,
                "stop_loss_price": stop_loss,
                "target_price": target_price,
                "suggested_units": suggested_units,
                "risk_score": risk_score,
                "risk_level": risk_metrics.get("risk_level", "MODERATE")
            },
            evidence=evidence,
            warnings=warnings
        )

