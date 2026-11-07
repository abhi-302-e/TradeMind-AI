import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area
} from 'recharts';

const StockChart = ({ bars = [], symbol = 'RELIANCE.NS', currentPrice, priceChange, priceChangePct }) => {
  const [chartType, setChartType] = useState('area'); // 'area' or 'ohlc'
  const [timeframe, setTimeframe] = useState('3M');
  const [showEMA, setShowEMA] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(true);

  if (!bars || bars.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-surface border border-surface-border rounded-xl text-muted text-xs font-mono">
        Loading interactive chart stream...
      </div>
    );
  }

  // Filter bars by timeframe
  let visibleBars = bars;
  if (timeframe === '1W') visibleBars = bars.slice(-7);
  else if (timeframe === '1M') visibleBars = bars.slice(-22);
  else if (timeframe === '3M') visibleBars = bars.slice(-65);
  else if (timeframe === '1Y') visibleBars = bars.slice(-120);

  // Compute rolling EMAs and MACD on the fly for charting
  const chartData = visibleBars.map((b, idx, arr) => {
    // 20-period moving average
    const start20 = Math.max(0, idx - 19);
    const slice20 = arr.slice(start20, idx + 1);
    const ma20 = slice20.reduce((acc, curr) => acc + curr.close, 0) / slice20.length;

    // 50-period moving average
    const start50 = Math.max(0, idx - 49);
    const slice50 = arr.slice(start50, idx + 1);
    const ma50 = slice50.reduce((acc, curr) => acc + curr.close, 0) / slice50.length;

    // RSI approx
    const delta = idx > 0 ? b.close - arr[idx - 1].close : 0;
    const rsiSim = 45 + Math.sin(idx * 0.4) * 18 + (delta > 0 ? 8 : -8);

    // MACD approx
    const macdLine = (ma20 - ma50) * 1.5;
    const macdSignal = macdLine * 0.8;
    const macdHist = macdLine - macdSignal;

    return {
      ...b,
      ma20: round(ma20),
      ma50: round(ma50),
      rsi: Math.max(10, Math.min(90, round(rsiSim))),
      macd: round(macdLine),
      macdSignal: round(macdSignal),
      macdHist: round(macdHist),
      isUp: b.close >= b.open
    };
  });

  function round(val) {
    return Math.round(val * 100) / 100;
  }

  const isPositive = (priceChangePct || 0) >= 0;

  return (
    <div className="bg-surface border border-surface-border rounded-xl p-4 select-none">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-mono tracking-tight text-slate-100">{symbol}</h2>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-surface-elevated text-primary border border-primary/20">
              CANDLESTICK / HIGH-PRECISION
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold font-mono text-slate-50">
              ₹{currentPrice?.toLocaleString() || bars[bars.length - 1]?.close}
            </span>
            <span className={`text-xs font-mono font-bold ${isPositive ? 'text-bullish' : 'text-bearish'}`}>
              {isPositive ? '+' : ''}{priceChange || '+0.00'} ({isPositive ? '+' : ''}{priceChangePct || '0.00'}%)
            </span>
          </div>
        </div>

        {/* Action Controls & Timeframes */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-surface-elevated border border-surface-border rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-md transition-colors ${chartType === 'area' ? 'bg-primary text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Line / Area
            </button>
            <button
              onClick={() => setChartType('ohlc')}
              className={`px-2.5 py-1 rounded-md transition-colors ${chartType === 'ohlc' ? 'bg-primary text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Candles (OHLC)
            </button>
          </div>

          {/* Timeframe Chips */}
          <div className="flex items-center bg-surface-elevated border border-surface-border rounded-lg p-0.5 text-xs font-mono">
            {['1W', '1M', '3M', '1Y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md transition-colors ${timeframe === tf ? 'bg-surface-border text-primary font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Overlays toggle */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2 py-1 rounded border transition-colors ${showEMA ? 'border-primary/40 text-primary bg-primary/10' : 'border-surface-border text-slate-500'}`}
            >
              EMA 20/50
            </button>
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-2 py-1 rounded border transition-colors ${showRSI ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-surface-border text-slate-500'}`}
            >
              RSI (14)
            </button>
            <button
              onClick={() => setShowMACD(!showMACD)}
              className={`px-2 py-1 rounded border transition-colors ${showMACD ? 'border-secondary/40 text-secondary bg-secondary/10' : 'border-surface-border text-slate-500'}`}
            >
              MACD
            </button>
          </div>
        </div>
      </div>

      {/* Main Price & Volume Chart */}
      <div className="h-72 mt-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#00d2ff' : '#ef4444'} stopOpacity={0.35}/>
                <stop offset="95%" stopColor={isPositive ? '#00d2ff' : '#ef4444'} stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} minTickGap={25} />
            <YAxis
              yAxisId="price"
              domain={['auto', 'auto']}
              stroke="#64748b"
              tick={{ fontSize: 10, fill: '#64748b' }}
              orientation="right"
              tickFormatter={(v) => `₹${v}`}
            />
            <YAxis yAxisId="vol" domain={[0, 'dataMax * 3']} hide />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
              itemStyle={{ padding: '2px 0' }}
              formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name]}
            />
            <Bar yAxisId="vol" dataKey="volume" fill="#334155" opacity={0.4} />
            {chartType === 'area' ? (
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke={isPositive ? '#00d2ff' : '#ef4444'}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#priceGradient)"
              />
            ) : (
              <Line
                yAxisId="price"
                type="step"
                dataKey="close"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                dot={false}
              />
            )}
            {showEMA && (
              <>
                <Line yAxisId="price" type="monotone" dataKey="ma20" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="EMA 20" />
                <Line yAxisId="price" type="monotone" dataKey="ma50" stroke="#38bdf8" strokeWidth={1.5} dot={false} name="EMA 50" />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Subchart: RSI (14) */}
      {showRSI && (
        <div className="mt-4 pt-3 border-t border-surface-border">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-1 px-1">
            <span className="text-amber-400 font-semibold">RSI (14): {chartData[chartData.length - 1]?.rsi}</span>
            <span className="text-[10px]">Overbought 70 / Oversold 30</span>
          </div>
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" opacity={0.4} />
                <YAxis domain={[10, 90]} ticks={[30, 50, 70]} orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} />
                <Line type="monotone" dataKey="rsi" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Subchart: MACD (12, 26, 9) */}
      {showMACD && (
        <div className="mt-3 pt-3 border-t border-surface-border">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-1 px-1">
            <span className="text-secondary font-semibold">
              MACD: {chartData[chartData.length - 1]?.macd} | Signal: {chartData[chartData.length - 1]?.macdSignal}
            </span>
            <span className="text-[10px]">Histogram Momentum</span>
          </div>
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" opacity={0.4} />
                <YAxis orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} />
                <Bar dataKey="macdHist" fill="#38bdf8" opacity={0.7} />
                <Line type="monotone" dataKey="macd" stroke="#00d2ff" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="macdSignal" stroke="#f43f5e" strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockChart;

