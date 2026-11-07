import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trademind_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
};

export const dashboardService = {
  getSummary: () => api.get('/api/dashboard'),
};

export const marketService = {
  getOverview: () => api.get('/api/market/overview'),
  searchAssets: (q) => api.get(`/api/market/search?q=${encodeURIComponent(q || '')}`),
  getAsset: (symbol) => api.get(`/api/market/${symbol}`),
  getHistory: (symbol, days = 120) => api.get(`/api/market/${symbol}/history?days=${days}`),
  getIndicators: (symbol) => api.get(`/api/indicators/${symbol}`),
  getFundamentals: (symbol) => api.get(`/api/fundamentals/${symbol}`),
  getNews: (symbol) => api.get(`/api/news/${symbol}`),
};

export const agentService = {
  listAgents: () => api.get('/api/agents'),
  runAgent: (agentCode, symbol = 'RELIANCE.NS') => api.post(`/api/agents/${agentCode}/run?symbol=${symbol}`),
  runAnalysis: (symbol, accountEquity = 100000) => api.post(`/api/analysis/${symbol}?account_equity=${accountEquity}`),
};

export const opportunityService = {
  getOpportunities: () => api.get('/api/opportunities'),
};

export const predictionService = {
  getPrediction: (symbol) => api.get(`/api/predictions/${symbol}`),
};

export const riskService = {
  calculateRisk: (data) => api.post('/api/risk/calculate', data),
};

export const portfolioService = {
  getPortfolio: () => api.get('/api/portfolio'),
};

export const paperService = {
  getOrders: () => api.get('/api/paper/orders'),
  submitOrder: (order) => api.post('/api/paper/orders', order),
  resetPortfolio: () => api.post('/api/paper/reset'),
};

export const backtestService = {
  runBacktest: (data) => api.post('/api/backtest', data),
};

export const reportService = {
  listReports: () => api.get('/api/reports'),
  generateReport: (symbol) => api.post(`/api/reports/generate?symbol=${symbol}`),
};

export default api;
