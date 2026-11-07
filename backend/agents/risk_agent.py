import math
import numpy as np
from typing import Dict, Any
from backend.agents.base_agent import BaseAgent
from backend.schemas.schemas import BaseAgentOutput
from backend.services.market_service import MarketService

class RiskManagementAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Risk Management Agent",
            code_name="risk_agent",
            description="Evaluates downside exposure, computes mathematical position sizing, volatility risk, and stop-loss boundaries."
        )

    def process(self, asset: str, context: Dict[str, Any]) -> BaseAgentOutput:
        snapshot = MarketService.get_asset_snapshot(asset)
        current_price = snapshot["current_price"]
        bars = context.get("bars") or MarketService.get_historical_bars(asset, days=60)
        opp = context.get("opportunity", {}).get("metrics", {})

        stop_loss = opp.get("stop_loss", round(current_price * 0.965, 2))
        target_price = opp.get("target_price", round(current_price * 1.07, 2))

        # 1. Historical Volatility (annualized)
        returns = [bars[i]["close"] / bars[i-1]["close"] - 1.0 for i in range(1, len(bars))]
        daily_vol = float(np.std(returns)) if returns else 0.015
        annual_vol = round(daily_vol * math.sqrt(252) * 100, 2)

        # 2. Maximum Drawdown
        closes = [b["close"] for b in bars]
        peak = closes[0]
        max_dd = 0.0
        for c in closes:
            if c > peak:
                peak = c
            dd = (peak - c) / peak
            if dd > max_dd:
                max_dd = dd
        max_dd_pct = round(max_dd * 100, 2)

        # 3. Transparent Configurable Risk Model:
        # R = 0.30*V + 0.25*D + 0.20*C + 0.15*L + 0.10*E
        v_score = min(100.0, annual_vol * 2.8)
        d_score = min(100.0, max_dd_pct * 3.5)
        c_score = 35.0 # Concentration risk
        l_score = 25.0 if snapshot["volume"] > 1000000 else 60.0 # Liquidity risk
        e_score = 30.0 # Event risk

        composite_risk = round(0.30*v_score + 0.25*d_score + 0.20*c_score + 0.15*l_score + 0.10*e_score, 1)

        # 4. Position Sizing Calculation
        account_equity = context.get("account_equity", 100000.0)
        risk_pct = 1.0 # 1% risk per trade default
        planned_risk_amount = account_equity * (risk_pct / 100.0)
        per_unit_risk = max(1.0, abs(current_price - stop_loss))
        suggested_shares = int(planned_risk_amount / per_unit_risk)
        total_position_val = round(suggested_shares * current_price, 2)

        risk_level = "LOW" if composite_risk < 30 else ("MODERATE" if composite_risk <= 60 else "HIGH")

        evidence = [
            f"Annualized asset volatility evaluated at {annual_vol}% with peak historical drawdown of {max_dd_pct}%.",
            f"Composite Risk Score: {composite_risk}/100 ({risk_level} Risk Category).",
            f"Safe Position Sizing: {suggested_shares} units (Value: {snapshot['currency']} {total_position_val:,.2f}) caps account loss to exactly {snapshot['currency']} {planned_risk_amount:,.2f} at stop-loss ({stop_loss})."
        ]

        warnings = []
        if annual_vol > 35.0:
            warnings.append(f"High volatility alert: Asset annual volatility ({annual_vol}%) exceeds comfortable thresholds.")
        if composite_risk > 65.0:
            warnings.append("Caution: Overall risk score is elevated. Strict stop-loss adherence recommended.")

        return BaseAgentOutput(
            agent_name=self.name,
            status="success",
            asset=asset,
            timestamp="",
            score=composite_risk,
            signal=f"{risk_level}_RISK",
            confidence=0.90,
            metrics={
                "composite_risk_score": composite_risk,
                "risk_level": risk_level,
                "annualized_volatility_pct": annual_vol,
                "max_drawdown_pct": max_dd_pct,
                "account_equity": account_equity,
                "risk_per_trade_pct": risk_pct,
                "planned_risk_amount": planned_risk_amount,
                "per_unit_risk": round(per_unit_risk, 2),
                "suggested_units": suggested_shares,
                "total_position_value": total_position_val,
                "stop_loss_price": stop_loss,
                "target_price": target_price
            },
            evidence=evidence,
            warnings=warnings
        )

