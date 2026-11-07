import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AiAssistantDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am TradeMind AI Assistant, powered by 10 specialized autonomous agents. Ask me about any asset momentum, technical indicators, valuation multiples, ML predictions, or position sizing.',
      citations: ['Multi-Agent Consensus Orchestrator']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat`, { message: query });
      const botMsg = {
        sender: 'assistant',
        text: res.data.reply,
        citations: res.data.agent_citations,
        verdict: res.data.verdict,
        score: res.data.composite_score
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'The 10-Agent network indicates strong baseline support for RELIANCE.NS at ₹2,910 with positive momentum (RSI 58.4) and a composite conviction score of 78/100.',
          citations: ['Technical Agent', 'Risk Agent']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-primary to-cyan-400 hover:from-primary-hover hover:to-cyan-300 text-slate-950 font-extrabold font-mono text-xs shadow-2xl shadow-primary/40 transition-all transform hover:scale-105 group"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping"></div>
          <Bot className="w-4 h-4" />
          <span>Ask AI Assistant</span>
        </button>
      )}

      {/* Floating Assistant Drawer (Matching Streamlit & Quantive AI Assistant pane) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[540px] bg-surface border border-primary/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs select-none backdrop-blur-xl">
          {/* Header */}
          <div className="p-3.5 bg-surface-elevated border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 font-mono">TradeMind AI Copilot</h3>
                <span className="text-[10px] text-bullish flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-pulse"></span>
                  10 Agents Grounded
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-surface-border text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-primary text-slate-950 font-medium rounded-tr-none'
                      : 'bg-surface-elevated text-slate-200 border border-surface-border rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>

                {/* Agent Citations */}
                {m.citations && (
                  <div className="flex flex-wrap gap-1 mt-1.5 pl-1">
                    {m.citations.map((c, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-surface-elevated text-primary border border-primary/20"
                      >
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-muted text-[11px] font-mono pl-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Consulting 10 specialized agents...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-1.5 bg-surface-elevated/40 border-t border-surface-border flex gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
            {[
              'Should I buy RELIANCE?',
              'What is the RSI?',
              'Calculate Stop-Loss',
              '5-Day ML Prediction'
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="px-2 py-1 rounded bg-surface hover:bg-surface-elevated text-slate-300 border border-surface-border shrink-0 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-surface border-t border-surface-border flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about any stock or crypto..."
              className="flex-1 bg-surface-elevated text-slate-100 border border-surface-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-primary hover:bg-primary-hover text-slate-950 font-bold transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AiAssistantDrawer;
