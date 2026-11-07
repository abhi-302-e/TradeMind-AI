import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Calculator } from 'lucide-react';

const RiskCard = ({ riskScore = 42.5, riskLevel = 'MODERATE', volatility = '22.4%', maxDrawdown = '12.8%', onOpenCalculator }) => {
  const isLow = riskScore <= 35;
  const isModerate = riskScore > 35 && riskScore <= 65;
  const isHigh = riskScore > 65;

  const colorClass = isLow ? 'text-bullish' : (isModerate ? 'text-amber-400' : 'text-bearish');
  const bgClass = isLow ? 'bg-bullish' : (isModerate ? 'bg-amber-400' : 'bg-bearish');
  const borderClass = isLow ? 'border-bullish/30' : (isModerate ? 'border-amber-400/30' : 'border-bearish/30');

  return (
    <div className="bg-surface border border-surface-border rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-surface-elevated text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider block">Portfolio Risk Indicator</span>
            <span className="text-[10px] text-muted font-mono">Mathematical Risk Model</span>
          </div>
        </div>

        {onOpenCalculator && (
          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-elevated hover:bg-surface-border text-primary border border-primary/20 text-[11px] font-mono transition-colors"
          >
            <Calculator className="w-3 h-3" />
            <span>Position Size</span>
          </button>
        )}
      </div>

      {/* Main Score Bar */}
      <div className="flex items-center justify-between gap-4 p-3 bg-surface-elevated rounded-lg border border-surface-border mb-3">
        <div>
          <span className="text-[10px] text-muted uppercase font-mono block">Composite Risk</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold font-mono ${colorClass}`}>{riskScore}</span>
            <span className="text-xs text-muted font-mono">/ 100</span>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${borderClass} ${colorClass} bg-surface`}>
          {riskLevel} RISK
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bgClass}`}
          style={{ width: `${Math.min(100, riskScore)}%` }}
        ></div>
      </div>

      {/* Key Risk Parameters */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2 bg-surface-elevated/60 rounded border border-surface-border/40">
          <span className="text-[10px] text-muted block">Annualized Volatility</span>
          <span className="text-slate-200 font-bold">{volatility}</span>
        </div>
        <div className="p-2 bg-surface-elevated/60 rounded border border-surface-border/40">
          <span className="text-[10px] text-muted block">Max Historical DD</span>
          <span className="text-bearish font-bold">-{maxDrawdown}</span>
        </div>
      </div>
    </div>
  );
};

export default RiskCard;

