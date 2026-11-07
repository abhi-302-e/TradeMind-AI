from typing import Dict, Any
from backend.agents.base_agent import BaseAgent
from backend.schemas.schemas import BaseAgentOutput
from backend.services.market_service import MarketService

class FundamentalAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Fundamental Analysis Agent",
            code_name="fundamental_agent",
            description="Evaluates balance sheet strength, valuation multiples (P/E, P/B), ROE, debt leverage, and revenue growth."
        )

    def process(self, asset: str, context: Dict[str, Any]) -> BaseAgentOutput:
        metrics = MarketService.get_fundamental_metrics(asset)
        snapshot = MarketService.get_asset_snapshot(asset)

        score = 50.0
        evidence = []
        warnings = []

        if snapshot["asset_type"] == "CRYPTO":
            score = 72.0
            evidence.append(f"Crypto asset with total network dominance at {metrics.get('dominance_pct')}% and robust on-chain activity.")
            evidence.append(f"Circulating supply: {metrics.get('circulating_supply')} against capped limit.")
            signal = "BULLISH"
        else:
            pe = metrics.get("pe_ratio", 25.0)
            roe = metrics.get("roe_pct", 15.0)
            de = metrics.get("debt_to_equity", 0.5)
            rev_growth = metrics.get("revenue_growth_yoy", 10.0)

            if pe < 28.0:
                score += 15.0
                evidence.append(f"Valuation is reasonable with a P/E multiple of {pe}x relative to sector growth.")
            else:
                score -= 10.0
                warnings.append(f"Elevated P/E ratio at {pe}x prices in aggressive forward growth expectations.")

            if roe >= 15.0:
                score += 15.0
                evidence.append(f"Strong capital efficiency: Return on Equity (ROE) stands at {roe}%.")
            else:
                evidence.append(f"Moderate ROE at {roe}%.")

            if de < 0.8:
                score += 10.0
                evidence.append(f"Conservative debt leverage with Debt-to-Equity ratio of {de}.")
            else:
                score -= 15.0
                warnings.append(f"High balance sheet leverage: Debt-to-Equity stands at {de}.")

            if rev_growth > 10.0:
                score += 10.0
                evidence.append(f"Solid top-line expansion with YoY revenue growth of {rev_growth}%.")

            score = max(10.0, min(95.0, score))
            signal = "BULLISH" if score >= 65 else ("BEARISH" if score <= 40 else "NEUTRAL")

        return BaseAgentOutput(
            agent_name=self.name,
            status="success",
            asset=asset,
            timestamp="",
            score=round(score, 1),
            signal=signal,
            confidence=0.80,
            metrics=metrics,
            evidence=evidence,
            warnings=warnings
        )

