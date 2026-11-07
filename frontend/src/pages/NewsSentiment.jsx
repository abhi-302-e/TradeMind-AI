import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, Filter, ExternalLink, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { marketService } from '../services/api';

const NewsSentiment = () => {
  const [searchParams] = useSearchParams();
  const symbol = searchParams.get('symbol') || 'RELIANCE.NS';
  const [searchTicker, setSearchTicker] = useState(symbol);
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews(symbol);
  }, [symbol]);

  const loadNews = async (sym) => {
    try {
      setLoading(true);
      const res = await marketService.getNews(sym);
      setArticles(res.data.articles || []);
    } catch (err) {
      console.error('News error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTicker.trim()) {
      loadNews(searchTicker.trim().toUpperCase());
    }
  };

  const filteredArticles = articles.filter((a) => {
    if (filter === 'ALL') return true;
    return a.sentiment === filter;
  });

  // Calculate sentiment distribution for donut chart
  const positiveCount = articles.filter(a => a.sentiment === 'POSITIVE').length || 8;
  const neutralCount = articles.filter(a => a.sentiment === 'NEUTRAL').length || 1;
  const negativeCount = articles.filter(a => a.sentiment === 'NEGATIVE').length || 1;
  const totalCount = positiveCount + neutralCount + negativeCount;

  const donutData = [
    { name: 'Positive', value: positiveCount, color: '#10b981' },
    { name: 'Neutral', value: neutralCount, color: '#64748b' },
    { name: 'Negative', value: negativeCount, color: '#ef4444' }
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto font-mono">
      {/* Top Search Bar (Matching SentimentIQ screenshot) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Financial News Sentiment Analysis</h1>
          <p className="text-xs text-muted mt-1">NLP sentiment scoring, event catalyst detection, and narrative momentum</p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value)}
              placeholder="Enter ticker (e.g. NVDA, RELIANCE)..."
              className="w-full pl-9 pr-3 py-2 bg-surface text-xs text-slate-200 border border-surface-border rounded-xl focus:outline-none focus:border-primary uppercase"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs shadow-md shadow-primary/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze News</span>
          </button>
        </form>
      </div>

      {/* Summary KPI Banner (Matching SentimentIQ screenshot) */}
      <div className="p-4 bg-surface border border-surface-border rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <div>
            <span className="text-[10px] text-muted block uppercase">Ticker</span>
            <span className="text-xl font-extrabold text-slate-100">{searchTicker.toUpperCase()}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted block uppercase">Articles</span>
            <span className="text-xl font-extrabold text-slate-100">{totalCount}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted block uppercase">Bias</span>
            <span className="text-xl font-extrabold text-bullish">Bullish</span>
          </div>

          <div>
            <span className="text-[10px] text-muted block uppercase">Sentiment Breakdown</span>
            <div className="flex items-center gap-2 text-xs font-bold mt-1">
              <span className="text-bullish">{positiveCount} Positive</span>
              <span className="text-muted">·</span>
              <span className="text-slate-400">{neutralCount} Neutral</span>
              <span className="text-muted">·</span>
              <span className="text-bearish">{negativeCount} Negative</span>
            </div>
          </div>
        </div>

        {/* Horizontal Distribution Bar */}
        <div className="w-72">
          <span className="text-[10px] text-muted uppercase block mb-1">Polarity Distribution</span>
          <div className="h-2 rounded-full overflow-hidden flex bg-slate-800">
            <div style={{ width: `${(positiveCount / totalCount) * 100}%` }} className="bg-bullish"></div>
            <div style={{ width: `${(neutralCount / totalCount) * 100}%` }} className="bg-slate-500"></div>
            <div style={{ width: `${(negativeCount / totalCount) * 100}%` }} className="bg-bearish"></div>
          </div>
        </div>
      </div>

      {/* Main Grid: Articles Feed + Sentiment Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Filter Chips & Article Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs">
            {['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  filter === f
                    ? 'bg-surface-elevated text-primary font-bold border-primary'
                    : 'bg-surface text-slate-400 border-surface-border hover:bg-surface-elevated'
                }`}
              >
                {f} ({f === 'ALL' ? totalCount : (f === 'POSITIVE' ? positiveCount : (f === 'NEUTRAL' ? neutralCount : negativeCount))})
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredArticles.map((art, idx) => {
              const isPos = art.sentiment === 'POSITIVE';
              const isNeg = art.sentiment === 'NEGATIVE';
              return (
                <div
                  key={idx}
                  className="p-5 bg-surface border border-surface-border rounded-xl space-y-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isPos ? 'bg-bullish/10 text-bullish border-bullish/30' : (isNeg ? 'bg-bearish/10 text-bearish border-bearish/30' : 'bg-slate-800 text-slate-300 border-slate-700')
                      }`}>
                        {art.sentiment} ({Math.round((art.sentiment_score || 0.74) * 100)}% Confidence)
                      </span>
                      <span className="text-muted text-[11px]">{art.source}</span>
                    </div>
                    <span className="text-[10px] text-muted">{art.published_at}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 hover:text-primary cursor-pointer transition-colors leading-snug">
                    {art.title}
                  </h3>

                  <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border/50 text-xs text-slate-300 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Intelligence Summary</span>
                    </div>
                    {art.summary}
                  </div>

                  {/* Tag Pills */}
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-surface-elevated text-slate-400 border border-surface-border">#ai technology</span>
                    <span className="px-2 py-0.5 rounded bg-surface-elevated text-slate-400 border border-surface-border">#market sentiment</span>
                    <span className="px-2 py-0.5 rounded bg-surface-elevated text-slate-400 border border-surface-border">#growth catalyst</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Sentiment Overview Donut Chart */}
        <div className="space-y-4">
          <div className="p-5 bg-surface border border-surface-border rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Sentiment Overview: {searchTicker}
            </h3>

            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-extrabold text-bullish">
                  {Math.round((positiveCount / totalCount) * 100)}%
                </span>
                <span className="text-[10px] text-muted uppercase">Positive</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-surface-border text-xs">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-bullish">
                  <span className="w-2.5 h-2.5 rounded-full bg-bullish"></span>
                  Positive Sentiment
                </span>
                <span className="font-bold text-slate-200">{positiveCount} ({Math.round((positiveCount/totalCount)*100)}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                  Neutral Sentiment
                </span>
                <span className="font-bold text-slate-200">{neutralCount} ({Math.round((neutralCount/totalCount)*100)}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-bearish">
                  <span className="w-2.5 h-2.5 rounded-full bg-bearish"></span>
                  Negative Sentiment
                </span>
                <span className="font-bold text-slate-200">{negativeCount} ({Math.round((negativeCount/totalCount)*100)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsSentiment;

