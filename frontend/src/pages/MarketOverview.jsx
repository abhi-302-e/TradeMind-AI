import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Search, ArrowRight, Zap, Filter } from 'lucide-react';
import { marketService } from '../services/api';

const MarketOverview = () => {
  const [assets, setAssets] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await marketService.getOverview();
      setAssets(res.data.assets || []);
    } catch (err) {
      console.error('Market overview error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter((a) => {
    const matchesSearch = !searchQuery ||
      a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || a.asset_type === filterType || a.exchange === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono text-slate-100 tracking-tight">Market Overview & Watchlist</h1>
          <p className="text-xs text-muted font-mono mt-1">Live price action, volume, and multi-asset sector distribution</p>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter symbols..."
            className="w-full pl-9 pr-3 py-1.5 bg-surface text-xs font-mono text-slate-200 border border-surface-border rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
        {['ALL', 'EQUITY', 'CRYPTO', 'NSE', 'NASDAQ'].map((ft) => (
          <button
            key={ft}
            onClick={() => setFilterType(ft)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterType === ft
                ? 'bg-primary text-slate-950 font-bold border-primary shadow-sm'
                : 'bg-surface hover:bg-surface-elevated text-slate-300 border-surface-border'
            }`}
          >
            {ft}
          </button>
        ))}
      </div>

      {/* Watchlist Cards Grid (Matching TradIQ Watchlist Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredAssets.map((asset) => {
          const isUp = asset.price_change_pct >= 0;
          return (
            <div
              key={asset.symbol}
              onClick={() => navigate(`/analysis?symbol=${asset.symbol}`)}
              className="p-4 bg-surface hover:bg-surface-elevated border border-surface-border hover:border-primary/40 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-base font-bold font-mono text-slate-100 group-hover:text-primary transition-colors">
                      {asset.symbol}
                    </h3>
                    <span className="text-[11px] text-muted line-clamp-1">{asset.name}</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-surface-elevated text-slate-300 border border-surface-border">
                    {asset.exchange}
                  </span>
                </div>

                <div className="my-3">
                  <div className="text-xl font-extrabold font-mono text-slate-50">
                    {asset.currency === 'INR' ? '₹' : '$'}{asset.current_price?.toLocaleString()}
                  </div>
                  <div className={`text-xs font-mono font-bold flex items-center gap-1 mt-0.5 ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                    {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{isUp ? '+' : ''}{asset.price_change_pct}%</span>
                    <span className="text-muted text-[10px] font-normal">({isUp ? '+' : ''}{asset.price_change})</span>
                  </div>
                </div>

                {/* 24h High/Low bar */}
                <div className="space-y-1 text-[10px] font-mono text-muted mb-2">
                  <div className="flex justify-between">
                    <span>L: {asset.low_24h}</span>
                    <span>H: {asset.high_24h}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-2/3 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted">Vol: {(asset.volume / 1000).toFixed(0)}k</span>
                <span className="text-primary font-semibold flex items-center gap-1 group-hover:underline">
                  <span>Analyze</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketOverview;

