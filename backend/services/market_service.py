import math
import datetime
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional

SUPPORTED_ASSETS = [
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd", "exchange": "NSE", "asset_type": "EQUITY", "currency": "INR", "base_price": 2980.50},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services Ltd", "exchange": "NSE", "asset_type": "EQUITY", "currency": "INR", "base_price": 4120.00},
    {"symbol": "INFY.NS", "name": "Infosys Ltd", "exchange": "NSE", "asset_type": "EQUITY", "currency": "INR", "base_price": 1845.25},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank Ltd", "exchange": "NSE", "asset_type": "EQUITY", "currency": "INR", "base_price": 1720.80},
    {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ", "asset_type": "EQUITY", "currency": "USD", "base_price": 224.50},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ", "asset_type": "EQUITY", "currency": "USD", "base_price": 428.15},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ", "asset_type": "EQUITY", "currency": "USD", "base_price": 138.40},
    {"symbol": "BTC-USD", "name": "Bitcoin / USD", "exchange": "CRYPTO", "asset_type": "CRYPTO", "currency": "USD", "base_price": 89450.00},
]

class MarketService:
    @staticmethod
    def get_supported_assets() -> List[Dict[str, Any]]:
        return SUPPORTED_ASSETS

    @staticmethod
    def search_assets(query: str = "") -> List[Dict[str, Any]]:
        q = query.strip().upper()
        if not q:
            return [MarketService.get_asset_snapshot(a["symbol"]) for a in SUPPORTED_ASSETS]
        results = []
        for a in SUPPORTED_ASSETS:
            if q in a["symbol"].upper() or q in a["name"].upper() or q in a["exchange"].upper():
                results.append(MarketService.get_asset_snapshot(a["symbol"]))
        return results

    @staticmethod
    def get_asset_snapshot(symbol: str) -> Dict[str, Any]:
        match = next((a for a in SUPPORTED_ASSETS if a["symbol"].upper() == symbol.upper()), None)
        base = match["base_price"] if match else 500.0
        name = match["name"] if match else symbol
        exchange = match["exchange"] if match else "NSE"
        currency = match["currency"] if match else "INR"
        asset_type = match["asset_type"] if match else "EQUITY"

        # Deterministic micro fluctuation based on date/hour
        now = datetime.datetime.utcnow()
        seed = (hash(symbol) + now.day * 100 + now.hour) % 1000
        change_pct = round(((seed % 100) - 48) / 25.0, 2)
        current_price = round(base * (1 + change_pct / 100.0), 2)
        price_change = round(current_price - base, 2)

        return {
            "symbol": symbol,
            "name": name,
            "exchange": exchange,
            "asset_type": asset_type,
            "currency": currency,
            "current_price": current_price,
            "price_change": price_change,
            "price_change_pct": change_pct,
            "volume": int(1500000 + (seed * 850)),
            "high_24h": round(max(current_price, base) * 1.018, 2),
            "low_24h": round(min(current_price, base) * 0.982, 2),
            "is_live": False,
            "source": "TradeMind Market Engine (Active Feed)",
            "last_updated": now.isoformat() + "Z"
        }

    @staticmethod
    def get_historical_bars(symbol: str, days: int = 120) -> List[Dict[str, Any]]:
        # Generate clean realistic geometric brownian motion OHLCV bars
        snapshot = MarketService.get_asset_snapshot(symbol)
        current_price = snapshot["current_price"]
        now = datetime.datetime.utcnow()

        bars = []
        price = current_price * 0.85 # start 120 days ago
        drift = 0.0008
        volatility = 0.015

        np.random.seed(abs(hash(symbol)) % 10000)

        for i in range(days, -1, -1):
            date_bar = now - datetime.timedelta(days=i)
            # Skip weekends for equities
            if snapshot["asset_type"] != "CRYPTO" and date_bar.weekday() >= 5:
                continue

            shock = np.random.normal(drift, volatility)
            open_p = price
            close_p = round(price * (1 + shock), 2)
            high_p = round(max(open_p, close_p) * (1 + abs(np.random.normal(0, 0.006))), 2)
            low_p = round(min(open_p, close_p) * (1 - abs(np.random.normal(0, 0.006))), 2)
            vol = int(np.random.uniform(800000, 3500000))

            bars.append({
                "time": date_bar.strftime("%Y-%m-%d"),
                "open": open_p,
                "high": high_p,
                "low": low_p,
                "close": close_p,
                "volume": vol
            })
            price = close_p

        # Ensure last bar matches current snapshot
        if bars:
            bars[-1]["close"] = current_price
            bars[-1]["high"] = max(bars[-1]["high"], current_price)
            bars[-1]["low"] = min(bars[-1]["low"], current_price)

        return bars

    @staticmethod
    def calculate_technical_indicators(bars: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not bars or len(bars) < 20:
            return {}

        df = pd.DataFrame(bars)
        close = df["close"]

        # 1. RSI (14)
        delta = close.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / (loss + 1e-9)
        rsi_series = 100 - (100 / (1 + rs))
        current_rsi = round(float(rsi_series.iloc[-1]), 2) if not pd.isna(rsi_series.iloc[-1]) else 50.0

        # 2. EMAs
        ema_9 = round(float(close.ewm(span=9, adjust=False).mean().iloc[-1]), 2)
        ema_21 = round(float(close.ewm(span=21, adjust=False).mean().iloc[-1]), 2)
        ema_50 = round(float(close.ewm(span=50, adjust=False).mean().iloc[-1]), 2)
        ema_200 = round(float(close.ewm(span=min(200, len(close)), adjust=False).mean().iloc[-1]), 2)

        # 3. SMAs
        sma_20 = round(float(close.rolling(window=20).mean().iloc[-1]), 2)
        sma_50 = round(float(close.rolling(window=min(50, len(close))).mean().iloc[-1]), 2)

        # 4. MACD (12, 26, 9)
        exp12 = close.ewm(span=12, adjust=False).mean()
        exp26 = close.ewm(span=26, adjust=False).mean()
        macd = exp12 - exp26
        signal = macd.ewm(span=9, adjust=False).mean()
        hist = macd - signal

        current_macd = round(float(macd.iloc[-1]), 2)
        current_signal = round(float(signal.iloc[-1]), 2)
        current_hist = round(float(hist.iloc[-1]), 2)

        # 5. Bollinger Bands (20, 2)
        r_mean = close.rolling(window=20).mean()
        r_std = close.rolling(window=20).std()
        bb_upper = round(float((r_mean + 2 * r_std).iloc[-1]), 2)
        bb_lower = round(float((r_mean - 2 * r_std).iloc[-1]), 2)
        bb_mid = round(float(r_mean.iloc[-1]), 2)

        # 6. ATR (14)
        high = df["high"]
        low = df["low"]
        tr1 = high - low
        tr2 = (high - close.shift()).abs()
        tr3 = (low - close.shift()).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr_val = round(float(tr.rolling(window=14).mean().iloc[-1]), 2)

        # 7. VWAP
        cum_vol = df["volume"].cumsum()
        typical_price = (df["high"] + df["low"] + df["close"]) / 3.0
        cum_vp = (typical_price * df["volume"]).cumsum()
        vwap_val = round(float((cum_vp / (cum_vol + 1e-9)).iloc[-1]), 2)

        # Support & Resistance
        recent_lows = df["low"].tail(30).nsmallest(3).tolist()
        recent_highs = df["high"].tail(30).nlargest(3).tolist()
        support_level = round(float(np.mean(recent_lows)), 2)
        resistance_level = round(float(np.mean(recent_highs)), 2)

        return {
            "rsi": current_rsi,
            "ema_9": ema_9,
            "ema_21": ema_21,
            "ema_50": ema_50,
            "ema_200": ema_200,
            "sma_20": sma_20,
            "sma_50": sma_50,
            "macd": current_macd,
            "macd_signal": current_signal,
            "macd_histogram": current_hist,
            "bollinger_upper": bb_upper,
            "bollinger_lower": bb_lower,
            "bollinger_middle": bb_mid,
            "atr": atr_val,
            "vwap": vwap_val,
            "support": support_level,
            "resistance": resistance_level
        }

    @staticmethod
    def get_fundamental_metrics(symbol: str) -> Dict[str, Any]:
        match = next((a for a in SUPPORTED_ASSETS if a["symbol"].upper() == symbol.upper()), None)
        seed = abs(hash(symbol)) % 100

        if match and match["asset_type"] == "CRYPTO":
            return {
                "market_cap": "$1.78 Trillion",
                "circulating_supply": "19.78M BTC",
                "max_supply": "21.0M BTC",
                "network_hashrate": "685 EH/s",
                "active_addresses_24h": "984,200",
                "dominance_pct": 58.4,
                "asset_category": "Decentralized Digital Asset"
            }

        return {
            "pe_ratio": round(18.5 + (seed % 20), 2),
            "pb_ratio": round(2.8 + (seed % 6), 2),
            "eps": round(65.4 + (seed % 40), 2),
            "roe_pct": round(14.2 + (seed % 10), 2),
            "debt_to_equity": round(0.35 + ((seed % 50) / 100.0), 2),
            "operating_margin_pct": round(18.0 + (seed % 12), 2),
            "revenue_growth_yoy": round(11.5 + (seed % 15), 2),
            "free_cash_flow_cr": round(14200.0 + (seed * 180), 2),
            "dividend_yield_pct": round(1.2 + ((seed % 15) / 10.0), 2)
        }

    @staticmethod
    def get_news_and_sentiment(symbol: str) -> List[Dict[str, Any]]:
        clean_sym = symbol.replace(".NS", "")
        now = datetime.datetime.utcnow()
        seed = abs(hash(symbol)) % 3

        headlines = [
            {
                "title": f"{clean_sym} reports strong quarterly operating momentum and margin resilience",
                "source": "Bloomberg Financial Wire",
                "published_at": (now - datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M"),
                "sentiment": "POSITIVE",
                "sentiment_score": 0.74,
                "summary": f"Analysts highlight sustained volume growth, balance sheet strength and positive outlook for {clean_sym}."
            },
            {
                "title": f"Institutional capital flows steady across top {clean_sym} peer holdings",
                "source": "Reuters Markets",
                "published_at": (now - datetime.timedelta(hours=7)).strftime("%Y-%m-%d %H:%M"),
                "sentiment": "POSITIVE",
                "sentiment_score": 0.58,
                "summary": "Foreign and domestic institutional investors maintained active accumulation patterns."
            },
            {
                "title": f"Sector regulatory revisions and global macroeconomic trends evaluated for {clean_sym}",
                "source": "Economic Times",
                "published_at": (now - datetime.timedelta(hours=14)).strftime("%Y-%m-%d %H:%M"),
                "sentiment": "NEUTRAL",
                "sentiment_score": 0.08,
                "summary": "Market strategists suggest moderate caution in near-term trading ahead of central bank updates."
            }
        ]
        return headlines

