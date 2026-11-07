from fastapi import APIRouter, HTTPException
from backend.orchestrator.workflow import TradeMindOrchestrator

router = APIRouter(prefix="/api/agents", tags=["AI Agents"])
orchestrator = TradeMindOrchestrator()

AGENTS_METADATA = [
    {
        "id": 1,
        "name": "Market Data Agent",
        "code_name": "market_data_agent",
        "description": "Collects, verifies, and normalizes OHLCV prices and volume across equities and crypto.",
        "status": "ONLINE",
        "total_runs": 1420,
        "success_rate": 99.8,
        "primary_inputs": ["Asset Symbol", "Timeframe (1D/1H)"],
        "primary_outputs": ["OHLCV Arrays", "Volume Integrity", "Data Quality %"]
    },
    {
        "id": 2,
        "name": "Technical Analysis Agent",
        "code_name": "technical_agent",
        "description": "Computes RSI, MACD, EMA (9/21/50/200), SMA, Bollinger Bands, ATR, VWAP and trend momentum.",
        "status": "ONLINE",
        "total_runs": 1395,
        "success_rate": 99.4,
        "primary_inputs": ["Historical OHLCV Bars"],
        "primary_outputs": ["RSI", "MACD Histogram", "Moving Average Ribbon", "Support/Resistance"]
    },
    {
        "id": 3,
        "name": "Fundamental Analysis Agent",
        "code_name": "fundamental_agent",
        "description": "Analyzes balance sheet health, P/E, P/B, ROE, debt leverage, cash flow, and YoY growth.",
        "status": "ONLINE",
        "total_runs": 1120,
        "success_rate": 98.7,
        "primary_inputs": ["Financial Statements", "Quarterly Reports"],
        "primary_outputs": ["Valuation Multiples", "Capital Efficiency", "Leverage Health"]
    },
    {
        "id": 4,
        "name": "News Sentiment Agent",
        "code_name": "news_agent",
        "description": "Monitors financial headlines, calculates NLP polarity (-1.0 to +1.0) and detects catalyst events.",
        "status": "ONLINE",
        "total_runs": 980,
        "success_rate": 99.1,
        "primary_inputs": ["Financial News Wire Articles", "Headlines"],
        "primary_outputs": ["Polarity Score", "Event Triggers", "Sentiment Momentum"]
    },
    {
        "id": 5,
        "name": "Opportunity Detection Agent",
        "code_name": "opportunity_agent",
        "description": "Synthesizes technical, fundamental, and sentiment scores to pinpoint high-probability trade setups.",
        "status": "ONLINE",
        "total_runs": 1284,
        "success_rate": 99.5,
        "primary_inputs": ["Tech Score", "Fund Score", "Sentiment Score"],
        "primary_outputs": ["Trade Candidate Setup", "Entry", "Target", "Stop-Loss"]
    },
    {
        "id": 6,
        "name": "Market Prediction Agent",
        "code_name": "prediction_agent",
        "description": "Executes machine learning regressors to forecast forward price trajectories and confidence bands.",
        "status": "ONLINE",
        "total_runs": 890,
        "success_rate": 97.9,
        "primary_inputs": ["Chronological Feature Vectors", "Lagged Returns"],
        "primary_outputs": ["5-Day Target", "Confidence Interval", "Uncertainty Corridor"]
    },
    {
        "id": 7,
        "name": "Risk Management Agent",
        "code_name": "risk_agent",
        "description": "Enforces risk budgeting, position sizing formulas, drawdown limits, and volatility-adjusted stops.",
        "status": "ONLINE",
        "total_runs": 1420,
        "success_rate": 100.0,
        "primary_inputs": ["Account Balance", "Risk %", "Entry/Stop-Loss Gap"],
        "primary_outputs": ["Position Size (Units)", "Max Planned Loss", "Risk Score (0-100)"]
    },
    {
        "id": 8,
        "name": "Portfolio Management Agent",
        "code_name": "portfolio_agent",
        "description": "Monitors asset allocation, Herfindahl concentration index, sector exposure, and cash reserves.",
        "status": "ONLINE",
        "total_runs": 950,
        "success_rate": 99.6,
        "primary_inputs": ["Holdings List", "Cash Balance"],
        "primary_outputs": ["Diversification Score", "Sector Exposure %", "Concentration Warning"]
    },
    {
        "id": 9,
        "name": "Trading Decision Agent",
        "code_name": "decision_agent",
        "description": "Synthesizes all agent outputs into final BUY / SELL / HOLD candidate recommendations with evidence.",
        "status": "ONLINE",
        "total_runs": 1240,
        "success_rate": 99.7,
        "primary_inputs": ["Outputs from Agents 1 to 8"],
        "primary_outputs": ["Final Analytical Verdict", "Consensus Score", "Confidence"]
    },
    {
        "id": 10,
        "name": "Performance Monitoring Agent",
        "code_name": "monitoring_agent",
        "description": "Tracks paper-trading outcomes, monitors Brier probability calibration, and proposes strategy improvements.",
        "status": "ONLINE",
        "total_runs": 820,
        "success_rate": 100.0,
        "primary_inputs": ["Historical Recommendations", "Forward Realized PnL"],
        "primary_outputs": ["Empirical Win Rate", "Sharpe Ratio", "Strategy Improvement Proposals"]
    }
]

@router.get("")
def list_agents():
    return {
        "count": len(AGENTS_METADATA),
        "agents": AGENTS_METADATA
    }

@router.post("/{agent_code}/run")
def trigger_agent(agent_code: str, symbol: str = "RELIANCE.NS"):
    agent_map = {
        "market_data_agent": orchestrator.market_data_agent,
        "technical_agent": orchestrator.technical_agent,
        "fundamental_agent": orchestrator.fundamental_agent,
        "news_agent": orchestrator.news_agent,
        "opportunity_agent": orchestrator.opportunity_agent,
        "prediction_agent": orchestrator.prediction_agent,
        "risk_agent": orchestrator.risk_agent,
        "portfolio_agent": orchestrator.portfolio_agent,
        "decision_agent": orchestrator.decision_agent,
        "monitoring_agent": orchestrator.monitoring_agent,
    }

    agent = agent_map.get(agent_code)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_code}' not found.")

    res = agent.run(symbol, {})
    return res.model_dump()
