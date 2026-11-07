import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, DollarSign, PieChart as PieIcon, Plus, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import StatCard from '../components/StatCard';
import { portfolioService } from '../services/api';

const COLORS = ['#00d2ff', '#3a86ff', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

const Portfolio = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const res = await portfolioService.getPortfolio();
      setData(res.data);
    } catch (err) {
      console.error('Portfolio error:', err);
    } finally {
      setLoading(false);
    }
  };

  const port = data || {};
  const holdings = port.holdings || [];
  const allocation = port.sector_allocation || [];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Portfolio Tracker & Asset Allocation</h1>
          <p className="text-xs text-muted mt-1">Multi-asset holdings, sector diversification, and unrealized profit/loss metrics</p>
        </div>
      </div>

      {/* Top KPI Cards (Matching Portfolio screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Portfolio Value"
          value={`₹${port.total_value?.toLocaleString() || '128,450'}`}
          change={port.total_pnl}
          changePct={port.total_pnl_pct}
          isPositive={true}
          subtitle={`₹${port.invested_value?.toLocaleString() || '90,000'} Invested`}
        />
        <StatCard
          title="Virtual Cash Balance"
          value={`₹${port.cash_balance?.toLocaleString() || '38,450'}`}
          isNeutral={true}
          subtitle="Available for New Allocations"
        />
        <StatCard
          title="Diversification Score"
          value={`${port.diversification_score || 82.5}/100`}
          isPositive={true}
          subtitle="Herfindahl Index: Healthy"
        />
        <StatCard
          title="Total Holdings"
          value={port.holdings_count || 3}
          isNeutral={true}
          subtitle="Active Asset Positions"
        />
      </div>

      {/* Main Grid: Sector Allocation Donut Chart + Holdings Breakdown (Matching Portfolio screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Donut Chart */}
        <div className="p-5 bg-surface border border-surface-border rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Sector Weight Allocation
          </h3>

          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="sector"
                >
                  {allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-extrabold text-slate-100">{allocation.length}</span>
              <span className="text-[10px] text-muted uppercase">Sectors</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-surface-border text-xs">
            {allocation.map((sec, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  {sec.sector}
                </span>
                <span className="font-bold text-slate-100">{sec.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Holdings Table */}
        <div className="lg:col-span-2 bg-surface border border-surface-border rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-surface-border font-bold text-xs text-slate-200 uppercase flex justify-between items-center">
            <span>Current Asset Holdings</span>
            <span className="text-muted text-[11px] font-normal">Realized & Unrealized PnL</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated text-slate-400 border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Avg Buy</th>
                  <th className="py-3 px-4">Current Price</th>
                  <th className="py-3 px-4">Total Value</th>
                  <th className="py-3 px-4">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50 text-slate-200">
                {holdings.map((h) => {
                  const isUp = h.unrealized_pnl >= 0;
                  return (
                    <tr key={h.symbol} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-100">
                        <div>{h.symbol}</div>
                        <span className="text-[10px] text-muted font-normal">{h.company_name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold">{h.quantity}</td>
                      <td className="py-3.5 px-4">₹{h.average_price?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-bold">₹{h.current_price?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">₹{h.current_value?.toLocaleString()}</td>
                      <td className={`py-3.5 px-4 font-bold ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                        {isUp ? '+' : ''}₹{h.unrealized_pnl?.toLocaleString()} ({isUp ? '+' : ''}{h.unrealized_pnl_pct}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;

