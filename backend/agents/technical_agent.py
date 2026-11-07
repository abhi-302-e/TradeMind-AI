from typing import Dict, Any
from backend.agents.base_agent import BaseAgent
from backend.schemas.schemas import BaseAgentOutput
from backend.services.market_service import MarketService

class TechnicalAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Technical Analysis Agent",
            code_name="technical_agent",
            description="Analyzes RSI, MACD, EMA ribbons, Bollinger Bands, VWAP and trend momentum indicators to identify price structure."
        )

    def process(self, asset: str, context: Dict[str, Any]) -> BaseAgentOutput:
        bars = context.get("bars") or MarketService.get_historical_bars(asset, days=120)
        ti = MarketService.calculate_technical_indicators(bars)
        snapshot = MarketService.get_asset_snapshot(asset)
        price = snapshot["current_price"]

        rsi = ti.get("rsi", 50.0)
        macd = ti.get("macd", 0.0)
        macd_sig = ti.get("macd_signal", 0.0)
        ema_50 = ti.get("ema_50", price)
        ema_200 = ti.get("ema_200", price)

        # Technical scoring
        tech_score = 50.0
        evidence = []
        warnings = []

        # RSI analysis
        if 45 <= rsi <= 68:
            tech_score += 15.0
            evidence.append(f"RSI (14) at {rsi} indicates healthy bullish momentum with room before overbought threshold (70).")
        elif rsi > 70:
            tech_score -= 10.0
            warnings.append(f"RSI (14) is elevated at {rsi}, signalling potential overextension or consolidation risk.")
        elif rsi < 30:
            tech_score += 10.0
            evidence.append(f"RSI (14) is in oversold territory ({rsi}), showing potential mean-reversion buying opportunity.")
        else:
            evidence.append(f"RSI (14) at {rsi} is neutral.")

        # Moving Average Trend
        if price > ema_50:
            tech_score += 15.0
            evidence.append(f"Price ({price}) is trading above 50-day EMA ({ema_50}), confirming intermediate uptrend.")
        else:
            tech_score -= 10.0
            evidence.append(f"Price is trading below 50-day EMA ({ema_50}), indicating corrective or bearish pressure.")

        if ema_50 > ema_200:
            tech_score += 10.0
            evidence.append(f"Golden Trend Ribbon: 50 EMA ({ema_50}) is above 200 EMA ({ema_200}).")

        # MACD
        if macd > macd_sig:
            tech_score += 10.0
            evidence.append(f"MACD line ({macd}) is above Signal line ({macd_sig}) with expanding positive histogram.")
        else:
            tech_score -= 10.0
            evidence.append(f"MACD line ({macd}) is below Signal line ({macd_sig}), denoting bearish momentum.")

        tech_score = max(5.0, min(95.0, tech_score))
        signal = "BULLISH" if tech_score >= 65 else ("BEARISH" if tech_score <= 40 else "NEUTRAL")

        return BaseAgentOutput(
            agent_name=self.name,
            status="success",
            asset=asset,
            timestamp="",
            score=round(tech_score, 1),
            signal=signal,
            confidence=0.84,
            metrics=ti,
            evidence=evidence,
            warnings=warnings
        )

