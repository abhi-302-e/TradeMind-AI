# TradeMind AI Multi-Agent Workflow Specification

## End-to-End Orchestrated Pipeline

```
+-------------------------------------------------------------+
|                      User Request                           |
|       (Symbol: e.g. "RELIANCE.NS", "AAPL", "BTC/USD")       |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                   1. Market Data Agent                      |
| - Fetches OHLCV bars (Daily & Intraday)                     |
| - Verifies timestamp continuity, detects gaps               |
| - Normalizes volume, high, low, close                       |
+-------------------------------------------------------------+
                              |
             +----------------+----------------+
             |                                 |
             v                                 v
+---------------------------+     +---------------------------+
| 2. Technical Agent        |     | 3. Fundamental Agent      |
| - RSI (14)                |     | - P/E, P/B, Market Cap    |
| - MACD (12, 26, 9)        |     | - EPS Growth (YoY)        |
| - EMA (20, 50, 200)       |     | - Debt-to-Equity          |
| - Bollinger Bands (20, 2) |     | - Free Cash Flow (FCF)    |
| - Support / Resistance    |     | - Margin Analysis         |
+---------------------------+     +---------------------------+
             |                                 |
             +----------------+----------------+
                              |
                              v
+-------------------------------------------------------------+
|                   4. News & Sentiment Agent                 |
| - Ingests market headlines & press releases                 |
| - Analyzes NLP sentiment polarity (-1.0 to +1.0)            |
| - Extracts market catalysts & macroeconomic warnings        |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                5. Opportunity Detection Agent               |
| - Correlates Technical Momentum with Fundamental Value      |
| - Evaluates Sentiment Confirmation                          |
| - Yields: Trade Setup (Bullish/Bearish/Neutral)             |
| - Calculates Initial Entry, Target, and Stop-Loss Levels    |
+-------------------------------------------------------------+
                              |
             +----------------+----------------+
             |                                 |
             v                                 v
+---------------------------+     +---------------------------+
| 6. Market Prediction Agent|     | 7. Risk Management Agent  |
| - Ensemble Regressors     |     | - Max Capital at Risk: 2% |
| - Price Direction Scenarios|    | - Kelly / Fractional Size |
| - Projected Volatility Band|    | - Stop-Loss Distance (ATR)|
| - Forecast Confidence     |     | - Min 1:2 Risk/Reward     |
+---------------------------+     +---------------------------+
             |                                 |
             +----------------+----------------+
                              |
                              v
+-------------------------------------------------------------+
|                 8. Portfolio Management Agent               |
| - Evaluates simulated wallet cash balance                   |
| - Assesses existing exposure by sector & asset class        |
| - Caps single asset exposure to 15% maximum                 |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                  9. Trading Decision Agent                  |
| - Synthesizes all agent outputs into final recommendation:  |
|   "BUY CANDIDATE", "SELL CANDIDATE", or "HOLD"              |
| - Produces explainable audit summary & confidence score     |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|           10. Performance Monitoring & Learning Agent       |
| - Persists agent run traces to database                     |
| - Compares predictions with forward realized prices         |
| - Computes ongoing Sharpe ratio, Win Rate, and Drawdowns    |
+-------------------------------------------------------------+
```

## Consensus & Execution Engine Rules
- **Buy Candidate**: Requires positive technical momentum (RSI $\in [40, 68]$, EMA 50 > EMA 200 or breakout), non-negative news sentiment, risk score $\le 65$, and potential reward at least $1.5\times$ the risk.
- **Sell/Short Candidate**: Triggered if technical trend breaks below key supports, negative sentiment catalyst exists, or stop-loss trigger is breached.
- **Hold / Neutral**: Default state if indicators conflict or market volatility exceeds safe thresholds ($> 3.5\sigma$).
- **Simulated Paper Execution**: Slippage formula:
  $$\text{Fill Price} = \text{Market Price} \times (1 \pm \text{Slippage Rate})$$
  with transaction fee deductions of $0.05\%$.
