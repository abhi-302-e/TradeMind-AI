import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MarketOverview from './pages/MarketOverview';
import StockExplorer from './pages/StockExplorer';
import TechnicalAnalysis from './pages/TechnicalAnalysis';
import FundamentalAnalysis from './pages/FundamentalAnalysis';
import NewsSentiment from './pages/NewsSentiment';
import Opportunities from './pages/Opportunities';
import Predictions from './pages/Predictions';
import RiskManagement from './pages/RiskManagement';
import Portfolio from './pages/Portfolio';
import PaperTrading from './pages/PaperTrading';
import Backtesting from './pages/Backtesting';
import Agents from './pages/Agents';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/', '/login', '/register'].includes(location.pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-slate-100 font-sans selection:bg-primary selection:text-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto flex flex-col bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/market-overview" element={<MarketOverview />} />
            <Route path="/explorer" element={<StockExplorer />} />
            <Route path="/technical" element={<TechnicalAnalysis />} />
            <Route path="/analysis" element={<TechnicalAnalysis />} />
            <Route path="/fundamentals" element={<FundamentalAnalysis />} />
            <Route path="/news" element={<NewsSentiment />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/risk" element={<RiskManagement />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/paper-trading" element={<PaperTrading />} />
            <Route path="/backtesting" element={<Backtesting />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
