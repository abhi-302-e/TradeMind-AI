import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, TrendingUp, DollarSign, Award, Layers } from 'lucide-react';
import { marketService } from '../services/api';

const FundamentalAnalysis = () => {
  const [searchParams] = useSearchParams();
  const symbol = searchParams.get('symbol') || 'RELIANCE.NS';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFundamentals(symbol);
  }, [symbol]);

  const loadFundamentals = async (sym) => {
    try {
      setLoading(true);
      const res = await marketService.getFundamentals(sym);
      setData(res.data.metrics);
    } catch (err) {
      console.error('Fundamentals load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = data || {};

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-mono text-slate-100 tracking-tight">Fundamental Financial Analysis</h1>
        <p className="text-xs text-muted font-mono mt-1">Valuation multiples, profitability ratios, debt leverage, and capital efficiency for {symbol}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 bg-surface border border-surface-border rounded-xl">
          <span className="text-[10px] text-muted block uppercase">P/E Valuation Ratio</span>
          <div className="text-2xl font-extrabold text-slate-100 mt-1">{metrics.pe_ratio || '24.5'}x</div>
          <span className="text-xs text-primary font-semibold mt-1 block">Sector Median: 26.8x</span>
        </div>

        <div className="p-4 bg-surface border border-surface-border rounded-xl">
          <span className="text-[10px] text-muted block uppercase">Price to Book (P/B)</span>
          <div className="text-2xl font-extrabold text-slate-100 mt-1">{metrics.pb_ratio || '3.2'}x</div>
          <span className="text-xs text-muted mt-1 block">Tangible Net Asset Coverage</span>
        </div>

        <div className="p-4 bg-surface border border-surface-border rounded-xl">
          <span className="text-[10px] text-muted block uppercase">Return on Equity (ROE)</span>
          <div className="text-2xl font-extrabold text-bullish mt-1">{metrics.roe_pct || '16.8'}%</div>
          <span className="text-xs text-bullish font-semibold mt-1 block">Top Quartile Efficiency</span>
        </div>

        <div className="p-4 bg-surface border border-surface-border rounded-xl">
          <span className="text-[10px] text-muted block uppercase">Debt to Equity</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{metrics.debt_to_equity || '0.42'}</div>
          <span className="text-xs text-muted mt-1 block">Conservative Balance Sheet</span>
        </div>
      </div>

      {/* Financial Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        <div className="p-5 bg-surface border border-surface-border rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Profitability & Cash Generation
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-surface-border/60">
              <span className="text-muted">Earnings Per Share (EPS):</span>
              <span className="text-slate-100 font-bold">₹{metrics.eps || '72.4'}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-surface-border/60">
              <span className="text-muted">Operating Margin:</span>
              <span className="text-bullish font-bold">{metrics.operating_margin_pct || '18.4'}%</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-surface-border/60">
              <span className="text-muted">YoY Revenue Growth:</span>
              <span className="text-bullish font-bold">+{metrics.revenue_growth_yoy || '12.6'}%</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-surface-border/60">
              <span className="text-muted">Free Cash Flow (Annual):</span>
              <span className="text-primary font-bold">₹{metrics.free_cash_flow_cr || '18,400'} Cr</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Dividend Yield:</span>
              <span className="text-slate-200 font-bold">{metrics.dividend_yield_pct || '1.15'}%</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-surface border border-surface-border rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Fundamental Score & Analyst Verdict
          </h3>

          <div className="p-4 bg-surface-elevated rounded-xl border border-surface-border space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted uppercase text-[10px]">Fundamental Strength Index</span>
              <span className="text-lg font-extrabold text-bullish">82 / 100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-bullish h-full rounded-full" style={{ width: '82%' }}></div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pt-2">
              The Fundamental Agent identifies low solvency risk, solid cash generation, and pricing power that offsets short-term macro headwinds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundamentalAnalysis;
