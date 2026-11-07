import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const StatCard = ({ title, value, change, changePct, prefix = '', suffix = '', isPositive, isNeutral, icon: Icon, subtitle }) => {
  const isUp = isPositive !== undefined ? isPositive : (changePct > 0 || (typeof change === 'number' && change > 0));
  const isZero = isNeutral || changePct === 0 || change === 0;

  return (
    <div className="bg-surface border border-surface-border hover:border-slate-700 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/40 group">
      <div className="flex items-center justify-between text-muted text-xs font-medium mb-2">
        <span className="font-mono tracking-wider uppercase text-[11px] text-slate-400">{title}</span>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-surface-elevated text-primary group-hover:scale-110 transition-transform">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 font-mono">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>

        {(change !== undefined || changePct !== undefined) && (
          <div className={`flex items-center text-xs font-semibold font-mono ${
            isZero ? 'text-amber-400' : (isUp ? 'text-bullish' : 'text-bearish')
          }`}>
            {isZero ? (
              <Minus className="w-3 h-3 mr-0.5" />
            ) : isUp ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            <span>
              {change !== undefined && Math.abs(change) > 0 ? `${change > 0 ? '+' : ''}${change} ` : ''}
              {changePct !== undefined ? `(${changePct > 0 ? '+' : ''}${changePct}%)` : ''}
            </span>
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-1 text-[11px] text-slate-400">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;

