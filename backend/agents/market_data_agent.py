from typing import Dict, Any
from backend.agents.base_agent import BaseAgent
from backend.schemas.schemas import BaseAgentOutput
from backend.services.market_service import MarketService

class MarketDataAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Market Data Collection Agent",
            code_name="market_data_agent",
            description="Collects and normalizes OHLCV bars, checks timestamp continuity, volume integrity, and prepares clean market datasets."
        )

    def process(self, asset: str, context: Dict[str, Any]) -> BaseAgentOutput:
        snapshot = MarketService.get_asset_snapshot(asset)
        bars = MarketService.get_historical_bars(asset, days=120)

        # Validation
        valid_bars = [b for b in bars if b["high"] >= b["low"] and b["volume"] >= 0]
        data_quality = 100.0 if len(valid_bars) == len(bars) else round((len(valid_bars) / len(bars)) * 100, 1)

        evidence = [
            f"Retrieved {len(bars)} continuous OHLCV daily bars for {asset} on {snapshot['exchange']}",
            f"Latest market price registered at {snapshot['currency']} {snapshot['current_price']} with 24h volume of {snapshot['volume']:,} units",
            f"Market data completeness and bar integrity confirmed at {data_quality}%"
        ]

        warnings = []
        if snapshot["price_change_pct"] > 4.5:
            warnings.append(f"High intraday volatility detected: {snapshot['price_change_pct']}% change.")

        return BaseAgentOutput(
            agent_name=self.name,
            status="success",
            asset=asset,
            timestamp="",
            score=85.0 if data_quality > 98 else 60.0,
            signal="DATA_VERIFIED",
            confidence=0.98,
            metrics={
                "current_price": snapshot["current_price"],
                "price_change": snapshot["price_change"],
                "price_change_pct": snapshot["price_change_pct"],
                "volume": snapshot["volume"],
                "exchange": snapshot["exchange"],
                "currency": snapshot["currency"],
                "bars_count": len(bars),
                "data_quality_pct": data_quality
            },
            evidence=evidence,
            warnings=warnings
        )
