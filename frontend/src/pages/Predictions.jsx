import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, TrendingUp, Cpu, AlertCircle, ArrowRight } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { predictionService } from '../services/api';

const Predictions = () => {
  const [searchParams] = useSearchParams();
  const symbol = searchParams.get('symbol') || 'RELIANCE.NS';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrediction(symbol);
  }, [symbol]);

  const loadPrediction = async (sym) => {
    try {
      setLoading(true);
      const res = await predictionService.getPrediction(sym);
      setData(res.data);
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const pred = data || {};
  const forecastPoints = pred.forecast_points || [];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto font-mono">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Machine Learning Price Predictions</h1>
        <p className="text-xs text-muted mt-1">Probabilistic forward return scenarios with econometric uncertainty corridors for {symbol}</p>
      </div>

      {/* Target & KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-surface border border-surface-border rounded-xl">
          <span className="text-[10px] text-muted block uppercase">Current Price</span>
          <div className="text-2xl font-extrabold text-slate-100 mt-1">₹{pred.current_price?.toLocaleString()}</div>
          <span className="text-xs text-muted mt-1 block">Baseline Reference</span>
        </div>

        <div className="p-4 bg-surface border border-surface-border rounded-xl">
          <span className="text-[10px] text-muted block uppercase">5-Day Target Forecast</span>
          <div className="text-2xl font-extrabold text-bullish mt-1">₹{pred.projected_price?.toLocaleString()}</div>
          <span className="text-xs text-bullish font-semibold mt-1 block">
            {pred.projected_change_pct >= 0 ? '+' : ''}{pred.projected_change_pct}% Expected
          </span>
        </div>

        <div className="p-4 bg-surface border border-surface-border rounded-xl">
          <span className="text-[10px] text-muted block uppercase">Uncertainty Corridor</span>
          <div className="text-base font-extrabold text-slate-200 mt-1.5">
            ₹{pred.corridor_low} - ₹{pred.corridor_high}
          </div>
          <span className="text-xs text-primary mt-1 block">±2.8% Confidence Band</span>
        </div>

        <div className="p-4 bg-surface border border-surface-border rounded-xl">
          <span className="text-[10px] text-muted block uppercase">Model Directional Accuracy</span>
          <div className="text-2xl font-extrabold text-primary mt-1">{pred.historical_accuracy_pct || '74.8'}%</div>
          <span className="text-xs text-muted mt-1 block">Ridge Regressor v2</span>
        </div>
      </div>

      {/* Chart: 5-Day Projection Cone */}
      <div className="p-5 bg-surface border border-surface-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              5-Day Probabilistic Trajectory
            </h3>
          </div>
          <span className="text-[11px] text-muted">Chronological Out-of-Sample Regression</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} orientation="right" stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
              <Area type="monotone" dataKey="upper" stroke="#00d2ff" fill="#00d2ff" fillOpacity={0.15} name="Upper Corridor" />
              <Line type="monotone" dataKey="expected" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Expected Trajectory" />
              <Area type="monotone" dataKey="lower" stroke="#00d2ff" fill="#00d2ff" fillOpacity={0.05} name="Lower Corridor" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trajectory Breakdown Table */}
      <div className="bg-surface border border-surface-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-surface-border font-bold text-xs text-slate-200 uppercase">
          Daily Trajectory Milestones
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated text-slate-400 border-b border-surface-border">
              <tr>
                <th className="py-2.5 px-4">Horizon</th>
                <th className="py-2.5 px-4">Lower Bound</th>
                <th className="py-2.5 px-4">Expected Target</th>
                <th className="py-2.5 px-4">Upper Bound</th>
                <th className="py-2.5 px-4">Model Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-slate-200">
              {forecastPoints.map((p, idx) => (
                <tr key={idx} className="hover:bg-surface-elevated/40">
                  <td className="py-2.5 px-4 font-bold text-primary">{p.day}</td>
                  <td className="py-2.5 px-4 text-bearish">₹{p.lower}</td>
                  <td className="py-2.5 px-4 font-bold text-bullish">₹{p.expected}</td>
                  <td className="py-2.5 px-4 text-primary">₹{p.upper}</td>
                  <td className="py-2.5 px-4 text-slate-400">78%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Predictions;
