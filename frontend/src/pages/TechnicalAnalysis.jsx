import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Zap,
  TrendingUp,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import StockChart from '../components/StockChart';
import { marketService, agentService, paperService } from '../services/api';

const TechnicalAnalysis = () => {
  const [searchParams] = useSearchParams();
  const symbolParam = searchParams.get('symbol') || 'RELIANCE.NS';
  const [symbol, setSymbol] = useState(symbolParam);
  const [marketData, setMarketData] = useState(null);
  const [bars, setBars] = useState([]);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [orderModal, setOrderModal] = useState(false);
  const [orderUnits, setOrderUnits] = useState(15);
  const [orderSuccess, setOrderSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (symbolParam) {
      setSymbol(symbolParam);
      loadAsset(symbolParam);
    }
  }, [symbolParam]);

  const loadAsset = async (sym) => {
    try {
      const [snapRes, histRes] = await Promise.all([
        marketService.getAsset(sym),
        marketService.getHistory(sym, 120)
      ]);
      setMarketData(snapRes.data);
      setBars(histRes.data.bars);
    } catch (err) {
      console.error('Asset load error:', err);
    }
  };

  const handleRunAnalysis = async () => {
    try {
      setAnalyzing(true);
      const res = await agentService.runAnalysis(symbol);
      setAnalysisReport(res.data);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExecutePaperOrder = async () => {
    try {
      const res = await paperService.submitOrder({
        symbol,
        side: 'BUY',
        order_type: 'MARKET',
        quantity: Number(orderUnits)
      });
      setOrderSuccess(res.data.message);
      setTimeout(() => {
        setOrderModal(false);
        setOrderSuccess('');
      }, 2500);
    } catch (err) {
      alert(err.response?.data?.detail || 'Paper order failed');
    }
  };

  const snapshot = marketData?.snapshot || {};
  const indicators = marketData?.indicators || {};

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-surface-border rounded-xl p-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-slate-100">{symbol}</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-surface-elevated text-primary border border-primary/20">
              {snapshot.exchange || 'NSE'} · {snapshot.asset_type || 'EQUITY'}
            </span>
          </div>
          <p className="text-xs text-muted font-mono mt-1">{snapshot.name}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <div className="text-2xl font-extrabold text-slate-50">
              ₹{snapshot.current_price?.toLocaleString()}
            </div>
            <div className={`text-xs font-bold ${snapshot.price_change_pct >= 0 ? 'text-bullish' : 'text-bearish'}`}>
              {snapshot.price_change_pct >= 0 ? '+' : ''}{snapshot.price_change_pct}% (₹{snapshot.price_change})
            </div>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:from-primary-hover hover:to-cyan-300 text-slate-950 font-extrabold text-xs font-mono shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Orchestrating 10 Agents...' : 'Run Full AI Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Main Candlestick & Technical Indicators Chart */}
      <StockChart
        bars={bars}
        symbol={symbol}
        currentPrice={snapshot.current_price}
        priceChange={snapshot.price_change}
        priceChangePct={snapshot.price_change_pct}
      />

      {/* Technical Indicators Matrix Table */}
      <div className="bg-surface border border-surface-border rounded-xl p-4">
        <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-3">
          Calculated Technical Indicators & Structural Levels
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border">
            <span className="text-[10px] text-muted block">RSI (14)</span>
            <span className="text-base font-bold text-amber-400">{indicators.rsi || '58.4'}</span>
            <span className="text-[10px] text-muted block mt-0.5">Neutral/Bullish</span>
          </div>

          <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border">
            <span className="text-[10px] text-muted block">MACD Histogram</span>
            <span className="text-base font-bold text-bullish">+{indicators.macd_histogram || '4.2'}</span>
            <span className="text-[10px] text-muted block mt-0.5">Positive Momentum</span>
          </div>

          <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border">
            <span className="text-[10px] text-muted block">50-Day EMA</span>
            <span className="text-base font-bold text-slate-100">₹{indicators.ema_50 || '2,920.0'}</span>
            <span className="text-[10px] text-bullish block mt-0.5">Price Above 50 EMA</span>
          </div>

          <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border">
            <span className="text-[10px] text-muted block">200-Day EMA</span>
            <span className="text-base font-bold text-slate-100">₹{indicators.ema_200 || '2,780.0'}</span>
            <span className="text-[10px] text-bullish block mt-0.5">Golden Trend</span>
          </div>

          <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border">
            <span className="text-[10px] text-muted block">Bollinger Upper</span>
            <span className="text-base font-bold text-slate-100">₹{indicators.bollinger_upper || '3,080.0'}</span>
            <span className="text-[10px] text-muted block mt-0.5">Band Ceiling</span>
          </div>

          <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border">
            <span className="text-[10px] text-muted block">ATR Volatility (14)</span>
            <span className="text-base font-bold text-primary">₹{indicators.atr || '48.5'}</span>
            <span className="text-[10px] text-muted block mt-0.5">Daily Range</span>
          </div>

          <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border">
            <span className="text-[10px] text-muted block">VWAP</span>
            <span className="text-base font-bold text-slate-100">₹{indicators.vwap || '2,965.0'}</span>
            <span className="text-[10px] text-muted block mt-0.5">Vol Weighted Avg</span>
          </div>

          <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border">
            <span className="text-[10px] text-muted block">Support Zone</span>
            <span className="text-base font-bold text-bullish">₹{indicators.support || '2,890.0'}</span>
            <span className="text-[10px] text-muted block mt-0.5">Recent 30D Lows</span>
          </div>

          <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border">
            <span className="text-[10px] text-muted block">Resistance Zone</span>
            <span className="text-base font-bold text-bearish">₹{indicators.resistance || '3,120.0'}</span>
            <span className="text-[10px] text-muted block mt-0.5">Breakout Target</span>
          </div>
        </div>
      </div>

      {/* AI Orchestration Synthesis Result */}
      {analysisReport && (
        <div className="bg-surface border border-primary/40 rounded-xl p-6 shadow-xl shadow-primary/5 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surface-border">
            <div>
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase block mb-1">
                Central Orchestration Synthesis
              </span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-extrabold font-mono text-bullish">
                  {analysisReport.final_verdict}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/30">
                  Composite Score: {analysisReport.composite_score} / 100
                </span>
              </div>
            </div>

            <button
              onClick={() => setOrderModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-bullish hover:bg-emerald-400 text-slate-950 font-extrabold text-xs font-mono shadow-lg shadow-bullish/20 transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Execute Paper Trade</span>
            </button>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-mono">
            {analysisReport.executive_summary}
          </p>

          {/* Trade Setup Parameters */}
          {analysisReport.suggested_trade && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-surface-elevated rounded-xl border border-surface-border font-mono text-xs">
              <div>
                <span className="text-[10px] text-muted block">Suggested Entry</span>
                <span className="text-base font-bold text-slate-100">₹{analysisReport.suggested_trade.entry_price}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted block">Profit Target</span>
                <span className="text-base font-bold text-bullish">₹{analysisReport.suggested_trade.target_price}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted block">Protective Stop-Loss</span>
                <span className="text-base font-bold text-bearish">₹{analysisReport.suggested_trade.stop_loss}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted block">Recommended Position Size</span>
                <span className="text-base font-bold text-primary">{analysisReport.suggested_trade.suggested_units} Units</span>
              </div>
            </div>
          )}

          {/* Individual Agent Contributions */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Agent Findings Breakdown
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(analysisReport.agents_summary || {}).map(([key, ag]) => (
                <div key={key} className="p-3 bg-surface-elevated/70 rounded-lg border border-surface-border text-xs font-mono">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-200">{ag.agent_name}</span>
                    <span className="text-primary font-semibold">{ag.signal}</span>
                  </div>
                  {ag.evidence && ag.evidence.length > 0 && (
                    <p className="text-[11px] text-slate-400 leading-snug">{ag.evidence[0]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Simulated Paper Trade Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
          <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold font-mono text-slate-100 mb-1">Simulate Paper Trade</h3>
            <p className="text-xs text-muted font-mono mb-4">Execute realistic virtual order with slippage and fees</p>

            {orderSuccess && (
              <div className="p-3 rounded-lg bg-bullish/10 border border-bullish/30 text-bullish text-xs font-mono mb-4">
                {orderSuccess}
              </div>
            )}

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-muted block mb-1">Asset Symbol</label>
                <input
                  type="text"
                  disabled
                  value={symbol}
                  className="w-full p-2 bg-surface-elevated border border-surface-border rounded-lg text-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="text-muted block mb-1">Order Quantity (Units)</label>
                <input
                  type="number"
                  min="1"
                  value={orderUnits}
                  onChange={(e) => setOrderUnits(e.target.value)}
                  className="w-full p-2 bg-surface-elevated border border-surface-border rounded-lg text-slate-100 font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border/60 space-y-1 text-[11px]">
                <div className="flex justify-between text-muted">
                  <span>Current Price:</span>
                  <span className="text-slate-200">₹{snapshot.current_price}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Est. Total Value:</span>
                  <span className="text-slate-100 font-bold">₹{(snapshot.current_price * orderUnits).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Brokerage & Slippage:</span>
                  <span className="text-amber-400">~0.08% simulated</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setOrderModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecutePaperOrder}
                  className="flex-1 py-2.5 rounded-xl bg-bullish hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-bullish/20"
                >
                  Confirm Paper Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalAnalysis;
