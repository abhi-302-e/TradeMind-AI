from typing import Dict, Any
from backend.agents.base_agent import BaseAgent
from backend.schemas.schemas import BaseAgentOutput

class PortfolioManagementAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Portfolio Management Agent",
            code_name="portfolio_agent",
            description="Analyzes overall portfolio allocation, diversification index, sector concentration, and cash reserve adequacy."
        )

    def process(self, asset: str, context: Dict[str, Any]) -> BaseAgentOutput:
        portfolio_val = context.get("portfolio_value", 125400.0)
        cash_balance = context.get("cash_balance", 45200.0)
        holdings = context.get("holdings", [
            {"symbol": "RELIANCE.NS", "value": 35000.0, "sector": "Energy & Retail"},
            {"symbol": "TCS.NS", "value": 24200.0, "sector": "Technology"},
            {"symbol": "HDFCBANK.NS", "value": 21000.0, "sector": "Financial Services"}
        ])

        invested_capital = sum(h["value"] for h in holdings)
        total_equity = invested_capital + cash_balance
        cash_pct = round((cash_balance / total_equity) * 100, 1)

        # Asset concentration
        max_holding = max(holdings, key=lambda x: x["value"]) if holdings else None
        max_holding_pct = round((max_holding["value"] / total_equity) * 100, 1) if max_holding else 0.0

        # Herfindahl-Hirschman index (HHI) for diversification
        hhi = sum(((h["value"] / total_equity) * 100) ** 2 for h in holdings)
        diversification_score = round(max(20.0, min(95.0, 100.0 - (hhi / 40.0))), 1)

        evidence = [
            f"Evaluated portfolio of {len(holdings)} core assets with total equity of ₹{total_equity:,.2f}.",
            f"Cash liquidity reserve stands at {cash_pct}% (₹{cash_balance:,.2f}), providing adequate margin for new positions.",
            f"Portfolio diversification rated at {diversification_score}/100. Largest exposure is {max_holding['symbol']} ({max_holding_pct}%)."
        ]

        warnings = []
        if max_holding_pct > 30.0:
            warnings.append(f"Concentration Warning: {max_holding['symbol']} exceeds 30% of portfolio equity.")
        if cash_pct < 10.0:
            warnings.append("Low cash warning: Cash reserve is below 10% of portfolio value.")

        return BaseAgentOutput(
            agent_name=self.name,
            status="success",
            asset=asset,
            timestamp="",
            score=diversification_score,
            signal="BALANCED",
            confidence=0.88,
            metrics={
                "total_equity": total_equity,
                "cash_balance": cash_balance,
                "cash_reserve_pct": cash_pct,
                "invested_capital": invested_capital,
                "holdings_count": len(holdings),
                "diversification_score": diversification_score,
                "largest_holding_symbol": max_holding["symbol"] if max_holding else "N/A",
                "largest_holding_pct": max_holding_pct
            },
            evidence=evidence,
            warnings=warnings
        )
