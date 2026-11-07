import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Database, Key, CheckCircle2, Lock } from 'lucide-react';

const Settings = () => {
  const [maxRisk, setMaxRisk] = useState(1.0);
  const [maxPositions, setMaxPositions] = useState(5);
  const [minRR, setMinRR] = useState(2.0);
  const [provider, setProvider] = useState('trademind-feed');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto font-mono">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">System Preferences & Safeguards</h1>
        <p className="text-xs text-muted mt-1">Institutional risk tolerances, broker safeguards, and data provider configurations</p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-bullish/10 border border-bullish/30 text-bullish text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>System configuration successfully updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* Risk Budgeting Thresholds */}
        <div className="p-5 bg-surface border border-surface-border rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Risk Management Safeguards
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-muted block mb-1">Max Risk Per Trade (%)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="5.0"
                value={maxRisk}
                onChange={(e) => setMaxRisk(Number(e.target.value))}
                className="w-full p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-slate-100 font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-muted block mb-1">Max Concurrent Positions</label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxPositions}
                onChange={(e) => setMaxPositions(Number(e.target.value))}
                className="w-full p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-slate-100 font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-muted block mb-1">Min Target R:R Ratio</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                value={minRR}
                onChange={(e) => setMinRR(Number(e.target.value))}
                className="w-full p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-slate-100 font-bold focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Paper Trading Execution Safeguards */}
        <div className="p-5 bg-surface border border-surface-border rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Broker Safety Protocol
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg border border-surface-border">
              <div>
                <span className="font-bold text-slate-200 block">Enforce Paper Trading Mode</span>
                <span className="text-[11px] text-muted">Blocks real-money broker execution; all orders route to paper sandbox</span>
              </div>
              <input type="checkbox" defaultChecked disabled className="w-4 h-4 rounded text-primary focus:ring-primary" />
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg border border-surface-border">
              <div>
                <span className="font-bold text-slate-200 block">Realistic Slippage Simulation</span>
                <span className="text-[11px] text-muted">Applies 0.05% price slippage and 0.03% exchange fee deductions</span>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary focus:ring-primary" />
            </div>
          </div>
        </div>

        {/* Market Data Provider Layer */}
        <div className="p-5 bg-surface border border-surface-border rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
            <Database className="w-4 h-4 text-secondary" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Market Data Abstraction Layer
            </h3>
          </div>

          <div className="text-xs space-y-2">
            <label className="text-muted block">Primary Data Feed</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-slate-100 font-bold focus:outline-none focus:border-primary"
            >
              <option value="trademind-feed">TradeMind Active Market Feed (Live & Historical)</option>
              <option value="alpha-vantage">Alpha Vantage API (External Gateway)</option>
              <option value="polygon-io">Polygon.io Market Data Services</option>
              <option value="fmp">Financial Modeling Prep (Statements & Ratios)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:from-primary-hover hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-primary/20 transition-all"
        >
          Save Configuration
        </button>
      </form>
    </div>
  );
};

export default Settings;

