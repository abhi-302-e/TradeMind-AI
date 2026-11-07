import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, ArrowRight, RotateCcw, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { paperService, marketService } from '../services/api';

const PaperTrading = () => {
  const [orders, setOrders] = useState([]);
  const [symbol, setSymbol] = useState('RELIANCE.NS');
  const [side, setSide] = useState('BUY');
  const [quantity, setQuantity] = useState(10);
  const [orderType, setOrderType] = useState('MARKET');
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadOrders();
    loadQuote(symbol);
  }, [symbol]);

  const loadOrders = async () => {
    try {
      const res = await paperService.getOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Orders load error:', err);
    }
  };

  const loadQuote = async (sym) => {
    try {
      const res = await marketService.getAsset(sym);
      setSnapshot(res.data.snapshot);
    } catch (err) {
      console.error('Quote load error:', err);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await paperService.submitOrder({
        symbol,
        side,
        order_type: orderType,
        quantity: Number(quantity)
      });
      setStatusMsg(res.data.message);
      loadOrders();
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Paper order failed');
    } finally {
      setLoading(false);
    }
  };

  const currPrice = snapshot?.current_price || 2980.50;
  const estTotal = round(currPrice * quantity);

  function round(val) {
    return Math.round(val * 100) / 100;
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto font-mono">
      {/* Header (Matching Paper Desk screenshot) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Paper Desk — Simulated Execution</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-bullish/10 text-bullish border border-bullish/30">
              LIVE SIMULATION
            </span>
          </div>
          <p className="text-xs text-muted mt-1">Simulated risk-free execution with realistic order routing, slippage, and fees</p>
        </div>

        <button
          onClick={async () => {
            if (confirm('Reset paper wallet balance to ₹100,000?')) {
              await paperService.resetPortfolio();
              loadOrders();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-elevated text-slate-400 hover:text-slate-200 border border-surface-border text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Balance</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-bullish/10 border border-bullish/30 text-bullish text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Grid: Active Positions & Orders on Left, Order Ticket on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Orders History */}
        <div className="lg:col-span-2 bg-surface border border-surface-border rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-surface-border font-bold text-xs text-slate-200 uppercase flex justify-between items-center">
            <span>Simulated Executed Orders</span>
            <span className="text-[11px] text-muted font-normal">{orders.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated text-slate-400 border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4">Side</th>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Fill Price</th>
                  <th className="py-3 px-4">Slippage</th>
                  <th className="py-3 px-4">Fees</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50 text-slate-200">
                {orders.map((ord) => {
                  const isBuy = ord.side === 'BUY';
                  return (
                    <tr key={ord.id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isBuy ? 'bg-bullish/15 text-bullish border-bullish/30' : 'bg-bearish/15 text-bearish border-bearish/30'
                        }`}>
                          {ord.side}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">{ord.symbol}</td>
                      <td className="py-3.5 px-4 font-semibold">{ord.quantity}</td>
                      <td className="py-3.5 px-4 font-bold">₹{ord.execution_price?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-amber-400">₹{ord.slippage || '0.50'}</td>
                      <td className="py-3.5 px-4 text-slate-400">₹{ord.fees || '12.00'}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-bullish font-bold text-[11px]">{ord.status}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[10px] text-muted">
                        {ord.timestamp ? new Date(ord.timestamp).toLocaleTimeString() : 'Recent'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Trade Ticket / Order Entry (Matching Paper Desk Screenshot) */}
        <div className="p-6 bg-surface border border-surface-border rounded-xl space-y-4">
          <div className="pb-3 border-b border-surface-border flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Trade Ticket · Order Entry
            </span>
            <span className="text-[10px] text-primary font-bold">Buying Power: ₹38,450</span>
          </div>

          <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
            {/* Long / Short Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-elevated rounded-xl border border-surface-border">
              <button
                type="button"
                onClick={() => setSide('BUY')}
                className={`py-2 rounded-lg font-bold text-xs transition-colors ${
                  side === 'BUY' ? 'bg-bullish text-slate-950 shadow-md shadow-bullish/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Buy (Long)
              </button>
              <button
                type="button"
                onClick={() => setSide('SELL')}
                className={`py-2 rounded-lg font-bold text-xs transition-colors ${
                  side === 'SELL' ? 'bg-bearish text-slate-950 shadow-md shadow-bearish/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sell (Short)
              </button>
            </div>

            {/* Asset Selector */}
            <div>
              <label className="text-muted block mb-1">Asset Symbol</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-slate-100 font-bold focus:outline-none focus:border-primary"
              >
                <option value="RELIANCE.NS">RELIANCE.NS (Reliance Industries)</option>
                <option value="TCS.NS">TCS.NS (Tata Consultancy)</option>
                <option value="INFY.NS">INFY.NS (Infosys)</option>
                <option value="HDFCBANK.NS">HDFCBANK.NS (HDFC Bank)</option>
                <option value="AAPL">AAPL (Apple Inc.)</option>
                <option value="BTC-USD">BTC-USD (Bitcoin)</option>
              </select>
            </div>

            {/* Live Quote Display */}
            <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border/60 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-muted block">Market Quote</span>
                <span className="text-xl font-extrabold text-slate-100">₹{currPrice}</span>
              </div>
              <div className="text-right text-[11px] text-muted">
                <span>Bid: ₹{round(currPrice * 0.9995)}</span>
                <span className="block">Ask: ₹{round(currPrice * 1.0005)}</span>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-muted block mb-1">Quantity (Units)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 5))}
                  className="px-3 py-2 bg-surface-elevated hover:bg-surface-border text-slate-200 rounded-lg border border-surface-border font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="flex-1 p-2 bg-surface-elevated border border-surface-border rounded-lg text-center text-slate-100 font-bold focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 5)}
                  className="px-3 py-2 bg-surface-elevated hover:bg-surface-border text-slate-200 rounded-lg border border-surface-border font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Estimated Total */}
            <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border/60 space-y-1 text-[11px]">
              <div className="flex justify-between text-muted">
                <span>Estimated Value:</span>
                <span className="text-slate-100 font-bold">₹{estTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Est. Transaction Cost:</span>
                <span className="text-slate-300">₹{round(estTotal * 0.0005)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-xs text-slate-950 shadow-lg transition-all ${
                side === 'BUY'
                  ? 'bg-bullish hover:bg-emerald-400 shadow-bullish/25'
                  : 'bg-bearish hover:bg-rose-400 shadow-bearish/25'
              }`}
            >
              {loading ? 'Routing Order...' : `Place ${side === 'BUY' ? 'Buy Order' : 'Sell Order'}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaperTrading;

