import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Search,
  LineChart,
  BookOpen,
  Cpu,
  Target,
  Sparkles,
  ShieldAlert,
  Briefcase,
  Layers,
  History,
  Newspaper,
  FileText,
  Settings,
  BrainCircuit
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Market Overview', path: '/market-overview', icon: TrendingUp },
  { name: 'Stock Explorer', path: '/explorer', icon: Search },
  { name: 'Technical Analysis', path: '/technical', icon: LineChart },
  { name: 'Fundamental Analysis', path: '/fundamentals', icon: BookOpen },
  { name: '10 AI Agents', path: '/agents', icon: Cpu, badge: '10 Online' },
  { name: 'AI Opportunities', path: '/opportunities', icon: Target },
  { name: 'Price Prediction', path: '/predictions', icon: Sparkles },
  { name: 'Risk Management', path: '/risk', icon: ShieldAlert },
  { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
  { name: 'Paper Trading', path: '/paper-trading', icon: Layers },
  { name: 'Backtesting', path: '/backtesting', icon: History },
  { name: 'News & Sentiment', path: '/news', icon: Newspaper },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-surface-border bg-surface flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-surface-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-slate-950 shadow-lg shadow-primary/20">
          <BrainCircuit className="w-5 h-5 font-bold" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-primary to-cyan-200 bg-clip-text text-transparent">
            TradeMind AI
          </span>
          <span className="block text-[10px] text-muted tracking-widest uppercase font-mono">
            Autonomous Multi-Agent
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
          Terminal Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-surface-elevated'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-primary/20 text-primary border border-primary/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-surface-border bg-surface-elevated/40">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-1">
          <span>Engine Status</span>
          <span className="text-bullish flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-bullish"></span>
            10/10 Agents Active
          </span>
        </div>
        <div className="w-full bg-surface-border h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-full rounded-full"></div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

