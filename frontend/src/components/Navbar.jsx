import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Activity, User, ShieldCheck, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim().toUpperCase());
      } else {
        navigate(`/analysis?symbol=${encodeURIComponent(query.trim().toUpperCase())}`);
      }
    }
  };

  return (
    <header className="h-16 border-b border-surface-border bg-background/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-80 md:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symbol (e.g. RELIANCE, AAPL, BTC)..."
          className="w-full pl-10 pr-4 py-2 bg-surface text-sm text-slate-200 border border-surface-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Market Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-surface-elevated border border-surface-border rounded-full text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-bullish animate-pulse"></span>
          <span className="text-slate-300">NSE / NASDAQ FEED:</span>
          <span className="text-primary font-bold">ACTIVE</span>
        </div>

        {/* Paper Simulation Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PAPER TRADING</span>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-surface-elevated rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 bg-surface-elevated hover:bg-surface-border border border-surface-border rounded-lg text-xs transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            <span className="font-medium text-slate-200 hidden md:inline">{user?.name || 'Trader'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-elevated border border-surface-border rounded-lg shadow-2xl py-1.5 z-50">
              <div className="px-3.5 py-2 border-b border-surface-border/50 text-xs text-muted">
                Signed in as <strong className="text-slate-200 block">{user?.email}</strong>
              </div>
              <button
                onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-surface-border transition-colors"
              >
                Settings & Risk Bounds
              </button>
              <button
                onClick={() => { setDropdownOpen(false); logout(); }}
                className="w-full text-left px-3.5 py-2 text-xs text-bearish hover:bg-surface-border flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

