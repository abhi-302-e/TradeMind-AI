import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Zap, ArrowRight, ShieldCheck, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { opportunityService } from '../services/api';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [sortBy, setSortBy] = useState('score');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const res = await opportunityService.getOpportunities();
      setOpportunities(res.data.opportunities || []);
    } catch (err) {
      console.error('Opportunities error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...opportunities].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'reward') return b.risk_reward - a.risk_reward;
    if (sortBy === 'confidence') return b.confidence - a.confidence;
    return 0;
  });

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto font-mono">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">AI Trading Opportunities</h1>
          <p className="text-xs text-muted mt-1">Multi-factor opportunity detection combining technical trend, valuation, and sentiment</p>
        </div>

        {/* Sort Controls (Matching Stock Signals screenshot) */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted">SORT BY:</span>
          {['score', 'reward', 'confidence'].map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg border transition-all uppercase ${
                sortBy === s
                  ? 'bg-primary text-slate-950 font-bold border-primary shadow-sm'
                  : 'bg-surface text-slate-300 border-surface-border hover:bg-surface-elevated'
              }`}
            >
              {s === 'score' ? 'Composite Score' : (s === 'reward' ? 'Risk/Reward' : 'Confidence')}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Signals Matrix Table (Directly matching Stock Signals screenshot) */}
      <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated text-slate-400 border-b border-surface-border">
              <tr>
                <th className="py-3 px-4">Ticker</th>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Entry Price</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Stop Loss</th>
                <th className="py-3 px-4">R:R Ratio</th>
                <th className="py-3 px-4">Composite Score</th>
                <th className="py-3 px-4">Signal</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-slate-200">
              {sorted.map((opp) => {
                const isStrong = opp.score >= 75;
                const isBuy = opp.score >= 60;
                return (
                  <tr
                    key={opp.symbol}
                    onClick={() => navigate(`/analysis?symbol=${opp.symbol}`)}
                    className="hover:bg-surface-elevated/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-bold text-slate-100 group-hover:text-primary transition-colors">
                      {opp.symbol}
                    </td>
                    <td className="py-4 px-4 text-slate-300">{opp.company_name}</td>
                    <td className="py-4 px-4 font-bold text-slate-100">₹{opp.entry_price?.toLocaleString()}</td>
                    <td className="py-4 px-4 font-bold text-bullish">₹{opp.target_price?.toLocaleString()}</td>
                    <td className="py-4 px-4 font-bold text-bearish">₹{opp.stop_loss?.toLocaleString()}</td>
                    <td className="py-4 px-4 font-bold text-primary">{opp.risk_reward}:1</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm">{opp.score}</span>
                        <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isStrong ? 'bg-bullish' : (isBuy ? 'bg-primary' : 'bg-amber-400')}`}
                            style={{ width: `${opp.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isStrong
                          ? 'bg-bullish/15 text-bullish border-bullish/40'
                          : (isBuy ? 'bg-primary/15 text-primary border-primary/40' : 'bg-amber-500/15 text-amber-400 border-amber-500/40')
                      }`}>
                        {isStrong ? '(STRONG BUY)' : (isBuy ? '(BUY)' : '(HOLD)')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/analysis?symbol=${opp.symbol}`); }}
                        className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-primary hover:text-slate-950 text-slate-200 border border-surface-border text-xs font-semibold transition-all"
                      >
                        Trade Setup
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Opportunities;

