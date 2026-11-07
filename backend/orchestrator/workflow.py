import datetime
from typing import Dict, Any
from backend.orchestrator.state import TradeMindWorkflowState
from backend.services.market_service import MarketService
from backend.agents.market_data_agent import MarketDataAgent
from backend.agents.technical_agent import TechnicalAnalysisAgent
from backend.agents.fundamental_agent import FundamentalAnalysisAgent
from backend.agents.news_agent import NewsSentimentAgent
from backend.agents.opportunity_agent import OpportunityDetectionAgent
from backend.agents.prediction_agent import MarketPredictionAgent
from backend.agents.risk_agent import RiskManagementAgent
from backend.agents.portfolio_agent import PortfolioManagementAgent
from backend.agents.decision_agent import TradingDecisionAgent
from backend.agents.monitoring_agent import PerformanceMonitoringAgent

class TradeMindOrchestrator:
    def __init__(self):
        # Instantiate the 10 specialized AI agents
        self.market_data_agent = MarketDataAgent()
        self.technical_agent = TechnicalAnalysisAgent()
        self.fundamental_agent = FundamentalAnalysisAgent()
        self.news_agent = NewsSentimentAgent()
        self.opportunity_agent = OpportunityDetectionAgent()
        self.prediction_agent = MarketPredictionAgent()
        self.risk_agent = RiskManagementAgent()
        self.portfolio_agent = PortfolioManagementAgent()
        self.decision_agent = TradingDecisionAgent()
        self.monitoring_agent = PerformanceMonitoringAgent()

    def run_analysis(self, symbol: str, account_equity: float = 100000.0) -> Dict[str, Any]:
        state = TradeMindWorkflowState(symbol=symbol, account_equity=account_equity)

        # Stage 1: Market Data Collection & Validation
        market_res = self.market_data_agent.run(symbol, {})
        state.market_data = market_res.model_dump()
        state.bars = MarketService.get_historical_bars(symbol, days=120)

        # Context for parallel analytical agents
        shared_ctx = {
            "bars": state.bars,
            "account_equity": state.account_equity,
            "portfolio_value": state.portfolio_value,
            "cash_balance": state.cash_balance
        }

        # Stage 2: Technical, Fundamental & News Sentiment
        tech_res = self.technical_agent.run(symbol, shared_ctx)
        fund_res = self.fundamental_agent.run(symbol, shared_ctx)
        news_res = self.news_agent.run(symbol, shared_ctx)

        state.technical = tech_res.model_dump()
        state.fundamental = fund_res.model_dump()
        state.news = news_res.model_dump()

        # Stage 3: Opportunity Detection
        opp_ctx = {
            **shared_ctx,
            "technical": state.technical,
            "fundamental": state.fundamental,
            "news": state.news
        }
        opp_res = self.opportunity_agent.run(symbol, opp_ctx)
        state.opportunity = opp_res.model_dump()

        # Stage 4: Prediction & Risk Management
        pred_ctx = {**shared_ctx, "opportunity": state.opportunity}
        risk_ctx = {**shared_ctx, "opportunity": state.opportunity, "technical": state.technical}

        pred_res = self.prediction_agent.run(symbol, pred_ctx)
        risk_res = self.risk_agent.run(symbol, risk_ctx)
        port_res = self.portfolio_agent.run(symbol, shared_ctx)

        state.prediction = pred_res.model_dump()
        state.risk = risk_res.model_dump()
        state.portfolio = port_res.model_dump()

        # Stage 5: Final Trading Decision Synthesis
        decision_ctx = {
            **shared_ctx,
            "technical": state.technical,
            "fundamental": state.fundamental,
            "news": state.news,
            "opportunity": state.opportunity,
            "prediction": state.prediction,
            "risk": state.risk,
            "portfolio": state.portfolio
        }
        decision_res = self.decision_agent.run(symbol, decision_ctx)
        state.decision = decision_res.model_dump()

        # Stage 6: Performance Monitoring & Learning Loop
        mon_res = self.monitoring_agent.run(symbol, decision_ctx)
        state.monitoring = mon_res.model_dump()

        snapshot = MarketService.get_asset_snapshot(symbol)
        dec_metrics = decision_res.metrics

        return {
            "symbol": symbol,
            "company_name": snapshot["name"],
            "current_price": snapshot["current_price"],
            "currency": snapshot["currency"],
            "exchange": snapshot["exchange"],
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "final_verdict": dec_metrics.get("final_verdict", "HOLD / NEUTRAL"),
            "composite_score": dec_metrics.get("composite_score", 50.0),
            "confidence": decision_res.confidence,
            "risk_level": dec_metrics.get("risk_level", "MODERATE"),
            "suggested_trade": {
                "entry_price": dec_metrics.get("entry_price", snapshot["current_price"]),
                "stop_loss": dec_metrics.get("stop_loss_price", round(snapshot["current_price"] * 0.965, 2)),
                "target_price": dec_metrics.get("target_price", round(snapshot["current_price"] * 1.07, 2)),
                "suggested_units": dec_metrics.get("suggested_units", 20),
                "total_cost": round(dec_metrics.get("suggested_units", 20) * snapshot["current_price"], 2)
            },
            "agents_summary": {
                "market_data": state.market_data,
                "technical": state.technical,
                "fundamental": state.fundamental,
                "news": state.news,
                "opportunity": state.opportunity,
                "prediction": state.prediction,
                "risk": state.risk,
                "portfolio": state.portfolio,
                "decision": state.decision,
                "monitoring": state.monitoring
            },
            "executive_summary": (
                f"Multi-Agent consensus for {symbol}: {dec_metrics.get('final_verdict')}. "
                f"Composite score is {dec_metrics.get('composite_score')}/100 with {decision_res.confidence*100:.0f}% confidence. "
                f"Risk is classified as {dec_metrics.get('risk_level')}."
            )
        }

