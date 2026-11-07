# TradeMind AI 🧠📈
### Autonomous Multi-Agent Trading Analysis, Opportunity Detection & Risk Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?style=flat&logo=react)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

TradeMind AI is an institutional-grade, full-stack financial market intelligence and simulated paper-trading platform. It orchestrates **ten specialized autonomous AI agents** governed by a stateful directed execution graph to ingest market feeds, compute technical indicators, analyze fundamentals, score financial headlines, detect asymmetric opportunities, forecast forward price cones, and enforce risk budgeting.

---

## 🏛️ System Architecture

```
[User Request / Symbol Input]
             │
             ▼
   [1. Market Data Agent] ──► Validates OHLCV & Historical Bar Continuity
             │
      ┌──────┴──────────────────────────┐
      ▼                                 ▼                                 ▼
[2. Technical Agent]          [3. Fundamental Agent]             [4. News Sentiment Agent]
      │                                 │                                 │
      └──────┬──────────────────────────┴─────────────────────────────────┘
             ▼
   [5. Opportunity Detection Agent]
             │
      ┌──────┴──────────────────────────┐
      ▼                                 ▼
[6. Prediction Agent]           [7. Risk Management Agent]
      │                                 │
      └──────┬──────────────────────────┘
             ▼
   [8. Portfolio Agent] ──► Verifies Cash Reserves & Concentration Caps
             │
             ▼
   [9. Trading Decision Agent] ──► Synthesizes BUY / SELL / HOLD Candidate Thesis
             │
             ▼
   [10. Performance Monitoring Agent] ──► Tracks Paper Trades & Calibration
```

---

## 🤖 The Ten Specialized AI Agents

1. **Market Data Agent (`market_data_agent.py`)**: Fetches & cleans OHLCV prices, volume arrays, and validates gap anomalies.
2. **Technical Analysis Agent (`technical_agent.py`)**: Computes RSI, MACD, EMA (9/21/50/200), SMA, Bollinger Bands, ATR, VWAP, support and resistance.
3. **Fundamental Analysis Agent (`fundamental_agent.py`)**: Evaluates P/E, P/B, EPS growth, ROE, debt-to-equity leverage, and free cash flows.
4. **News Sentiment Agent (`news_agent.py`)**: Ingests financial headlines, calculates polarity (-1.0 to +1.0), and flags catalysts.
5. **Opportunity Detection Agent (`opportunity_agent.py`)**: Synthesizes momentum, valuation, and sentiment into actionable trade setups.
6. **Market Prediction Agent (`prediction_agent.py`)**: Trains chronological regressors to project 5-day price trajectories and confidence bands.
7. **Risk Management Agent (`risk_agent.py`)**: Enforces mathematical position sizing ($R = 0.30V + 0.25D + 0.20C + 0.15L + 0.10E$) and ATR stops.
8. **Portfolio Management Agent (`portfolio_agent.py`)**: Evaluates multi-asset diversification, Herfindahl concentration, and cash reserves.
9. **Trading Decision Agent (`decision_agent.py`)**: Combines all agent outputs into an explainable verdict with target and stop-loss levels.
10. **Performance Monitoring Agent (`monitoring_agent.py`)**: Tracks simulated paper outcomes, Brier calibration, and proposes strategy adjustments.

---

## 💻 Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide React, Recharts, React Router.
- **Backend API**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy 2.0.
- **Quant & ML**: NumPy, Pandas, Scikit-learn, yfinance.
- **Database**: PostgreSQL (Production) / SQLite (Zero-config local development).
- **Deployment**: Docker, Docker Compose.

---

## 🚀 Quickstart Guide

### 1. Clone & Setup Workspace
```bash
git clone https://github.com/abhi-302-e/TradeMind-AI.git
cd TradeMind-AI
```

### 2. Run Backend (FastAPI)
```bash
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be accessible at: `http://localhost:8000/docs`

### 3. Run Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 🧪 Run Automated Tests
```bash
python -m pytest backend/tests/test_trademind.py -v
```

---

## ⚖️ Safety & Regulatory Disclaimer
TradeMind AI provides quantitative analytical models, market research visualizations, and simulated paper-trading tools. It does not provide licensed financial advice, guarantee investment returns, or execute real-money broker trades. All trading signals are analytical candidate suggestions.

