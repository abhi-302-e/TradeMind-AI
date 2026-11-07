from typing import Dict, Any
from backend.agents.base_agent import BaseAgent
from backend.schemas.schemas import BaseAgentOutput
from backend.services.market_service import MarketService

class OpportunityDetectionAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Opportunity Detection Agent",
            code_name="opportunity_agent",
            description="Synthesizes technical trend, valuation headroom, and news catalysts to detect actionable trading setups."
        )

    def process(self, asset: str, context: Dict[str, Any]) -> BaseAgentOutput:
        tech_res = context.get("technical", {})
        fund_res = context.get("fundamental", {})
        news_res = context.get("news", {})

        tech_score = tech_res.get("score", 50.0)
        fund_score = fund_res.get("score", 50.0)
        news_score = news_res.get("score", 50.0)

        snapshot = MarketService.get_asset_snapshot(asset)
        current_price = snapshot["current_price"]
        ti = tech_res.get("metrics", {})
        atr = ti.get("atr", current_price * 0.02)

        # Composite Opportunity Score (Weighted: 45% Tech, 35% Fund, 20% News)
        opp_score = round(0.45 * tech_score + 0.35 * fund_score + 0.20 * news_score, 1)

        evidence = []
        warnings = []

        if opp_score >= 65.0:
            signal = "BULLISH_OPPORTUNITY"
            stop_loss = round(current_price - (1.8 * atr), 2)
            target_price = round(current_price + (3.6 * atr), 2)
            risk_reward = round((target_price - current_price) / max(0.01, (current_price - stop_loss)), 2)

            evidence.append(f"High-conviction bullish opportunity flagged with composite score of {opp_score}/100.")
            evidence.append(f"Technical momentum ({tech_score}) confirmed by fundamental score ({fund_score}).")
            evidence.append(f"Suggested Entry: {current_price} | Target: {target_price} | Stop-Loss: {stop_loss} (R:R {risk_reward}:1).")
        elif opp_score <= 40.0:
            signal = "BEARISH_SETUP"
            stop_loss = round(current_price + (1.8 * atr), 2)
            target_price = round(current_price - (3.6 * atr), 2)
            risk_reward = round((current_price - target_price) / max(0.01, (stop_loss - current_price)), 2)

            evidence.append(f"Bearish trend deterioration detected with composite score of {opp_score}/100.")
            warnings.append("Elevated downside risk. Consider hedging or scaling out of long exposure.")
        else:
            signal = "NEUTRAL_RANGE"
            stop_loss = round(current_price * 0.97, 2)
            target_price = round(current_price * 1.04, 2)
            risk_reward = 1.33
            evidence.append(f"Asset is consolidating in a neutral range (Score: {opp_score}/100).")

        return BaseAgentOutput(
            agent_name=self.name,
            status="success",
            asset=asset,
            timestamp="",
            score=opp_score,
            signal=signal,
            confidence=0.82,
            metrics={
                "entry_price": current_price,
                "target_price": target_price,
                "stop_loss": stop_loss,
                "risk_reward_ratio": risk_reward,
                "technical_weight": 0.45,
                "fundamental_weight": 0.35,
                "news_weight": 0.20
            },
            evidence=evidence,
            warnings=warnings
        )

