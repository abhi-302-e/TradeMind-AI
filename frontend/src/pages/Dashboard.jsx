import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  ShieldAlert,
  Layers,
  ArrowRight,
  Zap,
  Cpu,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StockChart from '../components/StockChart';
import RiskCard from '../components/RiskCard';
import { dashboardService, marketService, agentService } from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE.NS');
  const [chartBars, setChartBars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadChart(selectedSymbol);
  }, [selectedSymbol]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getSummary();
      setData(res.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChart = async (sym) => {
    try {
      const res = await marketService.getHistory(sym, 120);
      setChartBars(res.data.bars);
    } catch (err) {
      console.error('Chart bars error:', err);
    }
  };

  const handleRunFullAnalysis = async (sym) => {
    navigate(`/analysis?symbol=${sym}`);
  };

  if (loading && !data) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 font-mono text-xs text-muted">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span>Synchronizing multi-agent terminal telemetry...</span>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const activeSignals = data?.active_signals || [];
  const indices = data?.indices || [];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Top Banner: Indices Ticker Bar (Matching Streamlit & Quantive terminal screenshots) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {indices.map((idx, i) => {
          const isUp = idx.change_pct >= 0;
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface border border-surface-border whitespace-nowrap shrink-0 hover:border-slate-700 transition-all font-mono text-xs"
            >
              <span className="font-bold text-slate-300">{idx.name}</span>
              <span className="font-semibold text-slate-100">{idx.value?.toLocaleString()}</span>
              <span className={`flex items-center text-[11px] font-bold ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                {isUp ? '+' : ''}{idx.change_pct}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Hero KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio Equity"
          value={`₹${kpis.portfolio_value?.toLocaleString() || '128,450'}`}
          change={kpis.daily_pnl}
          changePct={kpis.daily_pnl_pct}
          isPositive={true}
          icon={Activity}
          subtitle="Simulated Paper Balance"
        />
        <StatCard
          title="Active Opportunities"
          value={kpis.active_opportunities || 3}
          isNeutral={true}
          icon={Target}
          subtitle="Multi-Agent Confirmed Setups"
        />
        <StatCard
          title="Portfolio Risk Score"
          value={`${kpis.portfolio_risk_score || 38.5}/100`}
          isNeutral={true}
          icon={ShieldAlert}
          subtitle="Moderate Volatility Risk"
        />
        <StatCard
          title="Open Paper Positions"
          value={kpis.open_paper_trades || 3}
          isNeutral={true}
          icon={Layers}
          subtitle="Zero Capital at Risk"
        />
      </div>

      {/* AI Agent Status Header (Directly matching the uploaded AI Agent Trading Dashboard screenshot) */}
      <div className="bg-surface border border-surface-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Autonomous AI Agent Team Telemetry
            </span>
          </div>
          <span className="text-[11px] font-mono text-bullish font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-bullish animate-pulse"></span>
            10/10 Agents Synchronized
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(data?.agents_status?.slice(0, 5) || []).map((ag, idx) => (
            <div key={idx} className="p-3 bg-surface-elevated rounded-lg border border-surface-border/60 font-mono">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-200 truncate">{ag.name.replace(' Agent', '')}</span>
                <span className="text-[10px] text-bullish font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>Latency: {ag.latency}</span>
                <span>Tasks: {ag.tasks_completed}</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full w-4/5 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Stock Chart + Signals & Risk Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Stock Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            {/* Asset Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
              {['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'AAPL', 'BTC-USD'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSymbol(s)}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    selectedSymbol === s
                      ? 'bg-primary text-slate-950 border-primary font-bold shadow-md shadow-primary/20'
                      : 'bg-surface hover:bg-surface-elevated text-slate-300 border-surface-border'
                  }`}
                >
                  {s.replace('.NS', '')}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleRunFullAnalysis(selectedSymbol)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-primary to-cyan-400 hover:from-primary-hover hover:to-cyan-300 text-slate-950 font-bold text-xs font-mono shadow-md shadow-primary/20 transition-all shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Run AI Analysis</span>
            </button>
          </div>

          <StockChart
            bars={chartBars}
            symbol={selectedSymbol}
            currentPrice={chartBars[chartBars.length - 1]?.close}
            priceChange={14.5}
            priceChangePct={1.84}
          />
        </div>

        {/* Right 1 Col: AI Signals & Risk Card */}
        <div className="space-y-4">
          <RiskCard
            riskScore={kpis.portfolio_risk_score || 38.5}
            riskLevel={kpis.risk_classification || 'MODERATE'}
            volatility="21.8%"
            maxDrawdown="8.6%"
            onOpenCalculator={() => navigate('/risk')}
          />

          {/* AI Trading Signals Panel (Matching Stock Signals screenshot) */}
          <div className="bg-surface border border-surface-border rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3 font-mono">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                Active AI Trade Setups
              </span>
              <button
                onClick={() => navigate('/opportunities')}
                className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
              >
                <span>All Signals</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {activeSignals.map((sig, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedSymbol(sig.symbol)}
                  className="p-3 bg-surface-elevated hover:bg-surface-border/60 border border-surface-border/80 rounded-lg cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1 font-mono text-xs">
                    <span className="font-bold text-slate-100 group-hover:text-primary transition-colors">
                      {sig.symbol}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-bullish/10 text-bullish border border-bullish/30">
                      {sig.signal} ({sig.score})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono flex justify-between my-1">
                    <span>Entry: ₹{sig.entry}</span>
                    <span className="text-bullish">Tgt: ₹{sig.target}</span>
                    <span className="text-bearish">SL: ₹{sig.stop_loss}</span>
                  </div>
                  <p className="text-[11px] text-muted line-clamp-1">{sig.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Market Movers & News Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Movers */}
        <div className="bg-surface border border-surface-border rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3 font-mono">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-bullish" />
              Top Market Movers
            </span>
            <button
              onClick={() => navigate('/market-overview')}
              className="text-[11px] text-primary hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {(data?.top_gainers || []).concat(data?.top_losers || []).slice(0, 5).map((m, i) => {
              const isUp = m.price_change_pct >= 0;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedSymbol(m.symbol)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-elevated cursor-pointer transition-colors font-mono text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">{m.symbol}</span>
                    <span className="text-[10px] text-muted">{m.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-100 block">₹{m.current_price?.toLocaleString()}</span>
                    <span className={`text-[11px] font-bold ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                      {isUp ? '+' : ''}{m.price_change_pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial News Sentiment */}
        <div className="bg-surface border border-surface-border rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3 font-mono">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Live Financial News Sentiment
            </span>
            <button
              onClick={() => navigate('/news')}
              className="text-[11px] text-primary hover:underline"
            >
              News Desk
            </button>
          </div>

          <div className="space-y-3">
            {(data?.recent_news || []).map((art, idx) => (
              <div key={idx} className="p-2.5 bg-surface-elevated/60 rounded-lg border border-surface-border/50 text-xs">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted mb-1">
                  <span>{art.source}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-bullish/10 text-bullish border border-bullish/20">
                    +{art.sentiment_score}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-200 line-clamp-1">{art.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{art.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
