import React, { useState } from 'react';
import { ShieldAlert, Calculator, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { riskService } from '../services/api';

const RiskManagement = () => {
  const [accountEquity, setAccountEquity] = useState(100000);
  const [riskPct, setRiskPct] = useState(1.0);
  const [entryPrice, setEntryPrice] = useState(2980.50);
  const [stopLossPrice, setStopLossPrice] = useState(2910.00);
  const [calcResult, setCalcResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    try {
      setCalculating(true);
      const res = await riskService.calculateRisk({
        account_equity: Number(accountEquity),
        risk_pct_per_trade: Number(riskPct),
        entry_price: Number(entryPrice),
        stop_loss_price: Number(stopLossPrice),
        asset_symbol: 'RELIANCE.NS'
      });
      setCalcResult(res.data);
    } catch (err) {
      console.error('Risk calc error:', err);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto font-mono">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Risk Management & Capital Preservation</h1>
        <p className="text-xs text-muted mt-1">Mathematical position sizing, stop-loss budgeting, and portfolio drawdown caps</p>
      </div>

      {/* Institutional Scoring Formula Card */}
      <div className="p-4 bg-surface border border-surface-border rounded-xl">
        <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Risk Budgeting Engine Formula</span>
        <div className="text-sm font-bold text-primary">
          R = 0.30·Volatility + 0.25·Drawdown + 0.20·Concentration + 0.15·Liquidity + 0.10·Event Risk
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Each component is dynamically bounded on a 0–100 scale. Position sizes are mathematically capped to prevent single-trade ruin.
        </p>
      </div>

      {/* Main Grid: Interactive Calculator + Output Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Form */}
        <div className="p-6 bg-surface border border-surface-border rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
            <Calculator className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Position Sizing Calculator
            </h3>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4 text-xs">
            <div>
              <label className="text-muted block mb-1">Account Equity (₹)</label>
              <input
                type="number"
                value={accountEquity}
                onChange={(e) => setAccountEquity(e.target.value)}
                className="w-full p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-slate-100 font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-muted block mb-1">Risk Per Trade (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="5"
                  value={riskPct}
                  onChange={(e) => setRiskPct(e.target.value)}
                  className="w-32 p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-slate-100 font-bold focus:outline-none focus:border-primary"
                />
                <div className="flex gap-1.5">
                  {[0.5, 1.0, 1.5, 2.0].map((pct) => (
                    <button
                      type="button"
                      key={pct}
                      onClick={() => setRiskPct(pct)}
                      className={`px-2.5 py-1 rounded text-[11px] border ${riskPct === pct ? 'bg-primary text-slate-950 font-bold border-primary' : 'bg-surface-elevated text-slate-300 border-surface-border'}`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted block mb-1">Planned Entry Price (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-slate-100 font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted block mb-1">Protective Stop-Loss (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  className="w-full p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-slate-100 font-bold focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={calculating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:from-primary-hover hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-primary/20 transition-all"
            >
              Calculate Sizing & Loss Limits
            </button>
          </form>
        </div>

        {/* Right: Calculated Risk Output Card */}
        <div className="p-6 bg-surface border border-surface-border rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-bullish" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Risk Engine Output
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Verified Model
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-surface-elevated rounded-xl border border-surface-border flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted block uppercase">Suggested Position Size</span>
                <span className="text-3xl font-extrabold text-slate-100">
                  {calcResult?.suggested_position_size || 14} <span className="text-sm font-normal text-muted">Units</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted block uppercase">Total Position Value</span>
                <span className="text-xl font-bold text-primary">
                  ₹{calcResult?.total_position_value?.toLocaleString() || '41,727.00'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border">
                <span className="text-[10px] text-muted block">Maximum Loss at Stop</span>
                <span className="text-base font-bold text-bearish">
                  ₹{calcResult?.max_potential_loss?.toLocaleString() || '987.00'}
                </span>
              </div>

              <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border">
                <span className="text-[10px] text-muted block">Per-Unit Downside Risk</span>
                <span className="text-base font-bold text-slate-200">
                  ₹{calcResult?.per_unit_risk || '70.50'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border">
              <span className="text-[10px] text-muted block">Risk-to-Reward Ratio</span>
              <span className="text-base font-bold text-bullish">
                {calcResult?.risk_reward_ratio || 2.2}:1 Minimum Target
              </span>
            </div>

            {calcResult?.warnings && calcResult.warnings.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
                {calcResult.warnings[0]}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskManagement;

