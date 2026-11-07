import pytest
from backend.services.market_service import MarketService
from backend.services.backtest_service import BacktestService
from backend.orchestrator.workflow import TradeMindOrchestrator
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

def test_market_service_data():
    snapshot = MarketService.get_asset_snapshot("RELIANCE.NS")
    assert snapshot["symbol"] == "RELIANCE.NS"
    assert snapshot["current_price"] > 0
    assert snapshot["exchange"] == "NSE"

    bars = MarketService.get_historical_bars("RELIANCE.NS", days=60)
    assert len(bars) >= 40
    assert bars[-1]["close"] > 0

    ti = MarketService.calculate_technical_indicators(bars)
    assert "rsi" in ti
    assert "macd" in ti
    assert "ema_50" in ti
    assert 0 <= ti["rsi"] <= 100

def test_all_ten_agents():
    symbol = "RELIANCE.NS"
    ctx = {"bars": MarketService.get_historical_bars(symbol, days=60)}

    a1 = MarketDataAgent().run(symbol, ctx)
    assert a1.status == "success"
    assert a1.metrics["data_quality_pct"] >= 95.0

    a2 = TechnicalAnalysisAgent().run(symbol, ctx)
    assert a2.status == "success"
    assert a2.signal in ["BULLISH", "BEARISH", "NEUTRAL"]

    a3 = FundamentalAnalysisAgent().run(symbol, ctx)
    assert a3.status == "success"
    assert a3.score > 0

    a4 = NewsSentimentAgent().run(symbol, ctx)
    assert a4.status == "success"
    assert a4.signal in ["POSITIVE", "NEGATIVE", "NEUTRAL"]

    a5 = OpportunityDetectionAgent().run(symbol, {
        "technical": a2.model_dump(),
        "fundamental": a3.model_dump(),
        "news": a4.model_dump()
    })
    assert a5.status == "success"
    assert "entry_price" in a5.metrics

    a6 = MarketPredictionAgent().run(symbol, ctx)
    assert a6.status == "success"
    assert "projected_price" in a6.metrics

    a7 = RiskManagementAgent().run(symbol, {"opportunity": a5.model_dump()})
    assert a7.status == "success"
    assert a7.metrics["suggested_units"] > 0

    a8 = PortfolioManagementAgent().run(symbol, {})
    assert a8.status == "success"
    assert a8.metrics["diversification_score"] > 50

    a9 = TradingDecisionAgent().run(symbol, {
        "technical": a2.model_dump(),
        "fundamental": a3.model_dump(),
        "news": a4.model_dump(),
        "prediction": a6.model_dump(),
        "risk": a7.model_dump(),
        "portfolio": a8.model_dump()
    })
    assert a9.status == "success"
    assert a9.signal in ["BUY CANDIDATE", "SELL CANDIDATE", "HOLD / NEUTRAL"]

    a10 = PerformanceMonitoringAgent().run(symbol, {})
    assert a10.status == "success"
    assert a10.metrics["win_rate_pct"] > 50.0

def test_orchestrator_end_to_end():
    orch = TradeMindOrchestrator()
    res = orch.run_analysis("RELIANCE.NS", account_equity=100000.0)
    assert res["symbol"] == "RELIANCE.NS"
    assert res["final_verdict"] in ["BUY CANDIDATE", "SELL CANDIDATE", "HOLD / NEUTRAL"]
    assert 0 <= res["composite_score"] <= 100
    assert len(res["agents_summary"]) == 10

def test_backtest_service():
    res = BacktestService.run_backtest(
        strategy="Moving Average Crossover",
        symbol="RELIANCE.NS",
        initial_capital=100000.0,
        period_days=90
    )
    assert res["initial_capital"] == 100000.0
    assert res["ending_capital"] > 0
    assert "win_rate_pct" in res
    assert "max_drawdown_pct" in res
    assert "sharpe_ratio" in res
