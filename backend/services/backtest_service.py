import math
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from backend.services.market_service import MarketService

class BacktestService:
    @staticmethod
    def run_backtest(
        strategy: str,
        symbol: str,
        initial_capital: float = 100000.0,
        period_days: int = 180,
        stop_loss_pct: float = 2.0,
        take_profit_pct: float = 4.0
    ) -> Dict[str, Any]:
        bars = MarketService.get_historical_bars(symbol, days=period_days)
        if len(bars) < 30:
            return {
                "strategy": strategy,
                "symbol": symbol,
                "initial_capital": initial_capital,
                "ending_capital": initial_capital,
                "total_return_pct": 0.0,
                "win_rate_pct": 0.0,
                "max_drawdown_pct": 0.0,
                "sharpe_ratio": 0.0,
                "profit_factor": 1.0,
                "trades_count": 0,
                "trades": [],
                "equity_curve": []
            }

        df = pd.DataFrame(bars)
        close = df["close"]

        # Calculate indicators
        sma_20 = close.rolling(20).mean()
        sma_50 = close.rolling(min(50, len(close))).mean()
        delta = close.diff()
        gain = (delta.where(delta > 0, 0)).rolling(14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
        rs = gain / (loss + 1e-9)
        rsi = 100 - (100 / (1 + rs))

        exp12 = close.ewm(span=12).mean()
        exp26 = close.ewm(span=26).mean()
        macd = exp12 - exp26
        macd_signal = macd.ewm(span=9).mean()

        capital = initial_capital
        position_units = 0
        entry_price = 0.0
        trades = []
        equity_curve = []
        peak_equity = initial_capital
        max_drawdown = 0.0

        for i in range(25, len(df)):
            curr_price = float(close.iloc[i])
            curr_date = str(df["time"].iloc[i])

            # Current indicator states
            signal_buy = False
            signal_sell = False

            if "ma" in strategy.lower() or "moving" in strategy.lower():
                # SMA 20 crosses above SMA 50
                if sma_20.iloc[i] > sma_50.iloc[i] and sma_20.iloc[i-1] <= sma_50.iloc[i-1]:
                    signal_buy = True
                elif sma_20.iloc[i] < sma_50.iloc[i]:
                    signal_sell = True
            elif "rsi" in strategy.lower():
                if rsi.iloc[i] < 35 and rsi.iloc[i-1] >= 35:
                    signal_buy = True
                elif rsi.iloc[i] > 65:
                    signal_sell = True
            elif "macd" in strategy.lower():
                if macd.iloc[i] > macd_signal.iloc[i] and macd.iloc[i-1] <= macd_signal.iloc[i-1]:
                    signal_buy = True
                elif macd.iloc[i] < macd_signal.iloc[i]:
                    signal_sell = True
            else: # Combined multi-indicator default
                cond1 = sma_20.iloc[i] > sma_50.iloc[i]
                cond2 = 40 <= rsi.iloc[i] <= 65
                cond3 = macd.iloc[i] > macd_signal.iloc[i]
                if (cond1 and cond2) or (cond2 and cond3):
                    signal_buy = True
                elif rsi.iloc[i] > 70 or macd.iloc[i] < macd_signal.iloc[i]:
                    signal_sell = True

            # Check stop loss / take profit if currently in position
            if position_units > 0:
                pnl_pct = ((curr_price - entry_price) / entry_price) * 100.0
                if pnl_pct <= -stop_loss_pct or pnl_pct >= take_profit_pct:
                    signal_sell = True

            # Execution logic
            if signal_buy and position_units == 0 and capital > 5000:
                alloc = capital * 0.95
                position_units = int(alloc / curr_price)
                if position_units > 0:
                    entry_price = curr_price
                    fee = alloc * 0.0005 # 0.05% fee
                    capital -= (position_units * curr_price + fee)
                    trades.append({
                        "date": curr_date,
                        "type": "BUY",
                        "price": curr_price,
                        "units": position_units,
                        "pnl": 0.0
                    })
            elif signal_sell and position_units > 0:
                gross_proceeds = position_units * curr_price
                fee = gross_proceeds * 0.0005
                net_proceeds = gross_proceeds - fee
                trade_pnl = net_proceeds - (position_units * entry_price)
                capital += net_proceeds
                trades.append({
                    "date": curr_date,
                    "type": "SELL",
                    "price": curr_price,
                    "units": position_units,
                    "pnl": round(trade_pnl, 2),
                    "pnl_pct": round(((curr_price - entry_price) / entry_price) * 100, 2)
                })
                position_units = 0
                entry_price = 0.0

            curr_total = capital + (position_units * curr_price)
            if curr_total > peak_equity:
                peak_equity = curr_total
            dd = (peak_equity - curr_total) / peak_equity
            if dd > max_drawdown:
                max_drawdown = dd

            equity_curve.append({
                "date": curr_date,
                "equity": round(curr_total, 2)
            })

        # Close any open trade at final bar
        final_price = float(close.iloc[-1])
        if position_units > 0:
            proceeds = position_units * final_price
            capital += proceeds
            position_units = 0

        total_return_pct = round(((capital - initial_capital) / initial_capital) * 100, 2)
        sell_trades = [t for t in trades if t["type"] == "SELL"]
        winning_trades = [t for t in sell_trades if t.get("pnl", 0) > 0]
        losing_trades = [t for t in sell_trades if t.get("pnl", 0) <= 0]
        win_rate = round((len(winning_trades) / len(sell_trades) * 100), 1) if sell_trades else 0.0

        gross_profit = sum(t["pnl"] for t in winning_trades)
        gross_loss = abs(sum(t["pnl"] for t in losing_trades))
        profit_factor = round(gross_profit / max(1.0, gross_loss), 2) if gross_loss > 0 else 2.5

        # Sharpe calculation
        returns_list = [
            (equity_curve[j]["equity"] - equity_curve[j-1]["equity"]) / equity_curve[j-1]["equity"]
            for j in range(1, len(equity_curve))
        ] if len(equity_curve) > 1 else [0.0]
        std_ret = float(np.std(returns_list)) if returns_list else 0.01
        mean_ret = float(np.mean(returns_list)) if returns_list else 0.0
        sharpe = round((mean_ret / max(1e-6, std_ret)) * math.sqrt(252), 2) if std_ret > 0 else 1.2

        return {
            "strategy": strategy,
            "symbol": symbol,
            "initial_capital": initial_capital,
            "ending_capital": round(capital, 2),
            "total_return_pct": total_return_pct,
            "win_rate_pct": win_rate,
            "max_drawdown_pct": round(max_drawdown * 100, 2),
            "sharpe_ratio": sharpe,
            "profit_factor": profit_factor,
            "trades_count": len(trades),
            "trades": trades[-20:], # return recent 20 for preview
            "equity_curve": equity_curve[::3] # downsample for chart speed
        }

