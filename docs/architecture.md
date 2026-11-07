# TradeMind AI: Autonomous Multi-Agent Trading Analysis & Risk Management System
## Architectural Design & System Specification

### 1. Agent Architecture & Responsibilities
TradeMind AI deploys **ten specialized, autonomous analytical agents** governed by a central stateful orchestrator. Each agent operates with single-responsibility modularity:

| Agent | Module Name | Primary Responsibility |
|---|---|---|
| **1. Market Data Agent** | `market_data_agent.py` | Fetches OHLCV, volume, real-time/delayed market feeds, verifies data integrity, cleans anomalies and handles stale data. |
| **2. Technical Analysis Agent** | `technical_agent.py` | Computes RSI, MACD, EMA (9/21/50/200), SMA, Bollinger Bands, ATR, VWAP, support/resistance levels, and volume trend signals. |
| **3. Fundamental Analysis Agent** | `fundamental_agent.py` | Analyzes P/E, P/B, EPS, ROE, Debt-to-Equity, Free Cash Flow, operating margins, revenue growth, and quarterly trends. |
| **4. News & Sentiment Agent** | `news_agent.py` | Ingests market headlines, computes polarity/sentiment scores (-1.0 to +1.0), extracts catalysts, events, and sentiment momentum. |
| **5. Opportunity Detection Agent** | `opportunity_agent.py` | Synthesizes technical, fundamental, and sentiment scores against configurable opportunity strategies to generate Bullish/Bearish/Neutral trade setups. |
| **6. Market Prediction Agent** | `prediction_agent.py` | Runs ML models (Linear/Ridge, Random Forest, XGBoost-style ensembles) with chronological splits to forecast price ranges and confidence intervals. |
| **7. Risk Management Agent** | `risk_agent.py` | Calculates mathematical position sizing, VaR, volatility-adjusted stop-loss, risk/reward ratios (min 1:2), and enforces portfolio risk caps. |
| **8. Portfolio Management Agent** | `portfolio_agent.py` | Evaluates multi-asset diversification, sector concentration, cash reserve health, drawdown limits, and portfolio rebalancing recommendations. |
| **9. Trading Decision Agent** | `decision_agent.py` | Aggregates findings from all upstream agents into an actionable verdict (BUY / SELL / HOLD candidate) with explainable rationales and confidence metrics. |
| **10. Performance Monitoring & Learning Agent** | `monitoring_agent.py` | Tracks simulated trade outcomes against predictions, calculates Brier scores, win rate, Sharpe ratio, and proposes strategy adjustments. |

---

### 2. Input and Output Specifications (Data Contracts)
All agents consume and return strict Pydantic schemas inheriting from `BaseAgentOutput`.

#### Universal Agent Output Schema:
```json
{
  "agent_name": "Technical Analysis Agent",
  "status": "success",
  "asset": "RELIANCE.NS",
  "timestamp": "2026-11-07T13:45:00Z",
  "score": 78.5,
  "signal": "BULLISH",
  "confidence": 0.82,
  "metrics": {
    "rsi": 58.4,
    "macd": 12.6,
    "macd_signal": 8.2,
    "ema_50_above_200": true
  },
  "evidence": [
    "RSI at 58.4 indicating positive momentum without being overbought",
    "Golden cross: 50 EMA is above 200 EMA with expanding histogram"
  ],
  "warnings": [],
  "execution_time_ms": 142.5
}
```

---

### 3. Decision-Making Matrix
Agents employ a tiered decision engine combining:
1. **Deterministic Rule Engines**: Hard risk caps (e.g., maximum 2% portfolio risk per trade, stop-loss mandatory, minimum risk-reward >= 1.5).
2. **Quantitative Scoring Functions**:
   $$\text{Composite Score} = 0.35 \times S_{\text{tech}} + 0.25 \times S_{\text{fund}} + 0.20 \times S_{\text{sent}} + 0.20 \times S_{\text{pred}}$$
3. **Multi-Agent Consensus**:
   - Strong Buy: Composite $\ge 75$ AND Risk Score $\le 60$ AND Technical Signal is Bullish.
   - Buy: Composite $\ge 60$ AND Risk Score $\le 65$.
   - Hold: Composite between 40 and 60 OR high conflicting signals between Fundamental and Technical.
   - Sell/Avoid: Composite $< 40$ OR Risk Score $> 75$.

---

### 4. Communication Flow & Graph Orchestration
Coordination is handled via **LangGraph / Directed State Graph** (`orchestrator/workflow.py`):
```
[User Request / Symbol Input]
             │
             ▼
   [Market Data Agent]  ◄── Validates OHLCV & Historical Bars
             │
      ┌──────┴──────────────────────────┐
      ▼                                 ▼                                 ▼
[Technical Agent]             [Fundamental Agent]                [News Sentiment Agent]
      │                                 │                                 │
      └──────┬──────────────────────────┴─────────────────────────────────┘
             ▼
   [Opportunity Agent]
             │
      ┌──────┴──────────────────────────┐
      ▼                                 ▼
[Prediction Agent]              [Risk Management Agent]
      │                                 │
      └──────┬──────────────────────────┘
             ▼
   [Portfolio Agent] (Checks user cash & concentration limits)
             │
             ▼
   [Trading Decision Agent] (Produces final synthesis & recommendation)
             │
             ▼
   [Performance Monitoring Agent] (Logs audit trail & tracks paper execution)
```

---

### 5. Error Handling & Fault Tolerance
1. **Data Source Failures**: Exponential backoff (3 retries). If remote market data is unavailable or rate-limited, fall back to cached database snapshot with a clear warning: `STALE_DATA_CACHE`.
2. **Missing Indicators / Insufficient History**: If an asset has less than 200 bars, disable long-term EMA calculations gracefully and lower prediction confidence.
3. **Isolated Agent Failure**: If an individual agent throws an exception, the orchestrator flags that node as `PARTIAL_FAILURE` and computes the trade verdict using weighted available signals, lowering overall confidence.
4. **Order Execution Safety**: Paper trading simulates realistic slippage (5-15 bps) and rejects trades that exceed user cash or risk constraints.

---

### 6. Self-Improvement & Continuous Learning
The **Performance Monitoring Agent** maintains historical paper trade records and prediction logs:
- **Accuracy Tracking**: Compares predicted $T+5$ and $T+15$ price trajectories against realized prices.
- **Signal Attribution**: Measures which indicators contributed most to profitable vs. losing trades.
- **Walk-Forward Validation**: Re-tunes ML weights and indicator threshold sensitivities iteratively on out-of-sample data.

---

### 7. End-to-End Workflow
1. User enters a ticker (e.g. `AAPL`, `RELIANCE.NS`, `BTC/USD`) on the web dashboard.
2. Backend receives request at `/api/analysis/{symbol}`.
3. Orchestrator executes agent graph within sub-second to low-second latency.
4. Detailed JSON report is saved to PostgreSQL/SQLite audit table.
5. Frontend renders interactive charts, agent breakdown cards, risk gauges, and paper trade execution buttons.
6. User can click **"Execute Paper Trade"** to automatically size and place simulated market or limit orders.

---

### 8. Technology Stack
- **Frontend**: React 18 / 19, Vite, Tailwind CSS, Lucide Icons, Recharts, TradingView Lightweight Charts.
- **Backend API**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2.
- **Orchestration**: LangGraph StateGraph / Pipeline DAG engine.
- **Persistence**: SQLAlchemy 2.0 ORM with PostgreSQL (production) and high-performance SQLite fallback (development/local).
- **ML / Quant**: Scikit-learn, NumPy, Pandas, yfinance.
- **Deployment**: Docker containerization & Docker Compose.
