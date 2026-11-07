import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="trader")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")
    paper_orders = relationship("PaperOrder", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    exchange = Column(String(50), default="NSE")
    asset_type = Column(String(50), default="EQUITY")
    currency = Column(String(10), default="INR")
    is_active = Column(Boolean, default=True)

    market_data = relationship("MarketData", back_populates="asset", cascade="all, delete-orphan")
    indicators = relationship("Indicator", back_populates="asset", cascade="all, delete-orphan")
    financial_metrics = relationship("FinancialMetric", back_populates="asset", cascade="all, delete-orphan")
    news_articles = relationship("NewsArticle", back_populates="asset", cascade="all, delete-orphan")
    opportunities = relationship("Opportunity", back_populates="asset", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="asset", cascade="all, delete-orphan")


class MarketData(Base):
    __tablename__ = "market_data"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), index=True)
    timestamp = Column(DateTime, index=True, nullable=False)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)

    asset = relationship("Asset", back_populates="market_data")


class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), index=True)
    indicator_type = Column(String(50), nullable=False)
    value = Column(Float, nullable=False)
    params_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    asset = relationship("Asset", back_populates="indicators")


class FinancialMetric(Base):
    __tablename__ = "financial_metrics"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), index=True)
    metric_name = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    reporting_period = Column(String(50), default="TTM")
    report_date = Column(DateTime, default=datetime.datetime.utcnow)

    asset = relationship("Asset", back_populates="financial_metrics")


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True)
    title = Column(String(500), nullable=False)
    source = Column(String(200), default="Financial News Wire")
    url = Column(String(1000), default="")
    published_at = Column(DateTime, default=datetime.datetime.utcnow)
    sentiment_score = Column(Float, default=0.0)
    sentiment_label = Column(String(20), default="NEUTRAL")
    summary = Column(Text, default="")

    asset = relationship("Asset", back_populates="news_articles")


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(30), default="ONLINE")
    last_run_at = Column(DateTime, default=datetime.datetime.utcnow)
    total_runs = Column(Integer, default=0)
    success_rate = Column(Float, default=100.0)

    runs = relationship("AgentRun", back_populates="agent", cascade="all, delete-orphan")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), index=True)
    asset_symbol = Column(String(50), default="")
    status = Column(String(30), default="SUCCESS")
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    execution_time_ms = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    agent = relationship("Agent", back_populates="runs")


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), index=True)
    signal = Column(String(30), nullable=False)
    score = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    entry_price = Column(Float, nullable=False)
    target_price = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=False)
    risk_reward_ratio = Column(Float, default=2.0)
    evidence_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    asset = relationship("Asset", back_populates="opportunities")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), index=True)
    model_name = Column(String(100), default="Ensemble_Reg_v1")
    forecast_horizon = Column(String(50), default="5_DAYS")
    predicted_price = Column(Float, nullable=False)
    price_low = Column(Float, nullable=False)
    price_high = Column(Float, nullable=False)
    confidence = Column(Float, default=0.75)
    model_metrics = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    asset = relationship("Asset", back_populates="predictions")


class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    name = Column(String(120), default="Default Paper Portfolio")
    cash_balance = Column(Float, default=100000.0)
    initial_balance = Column(Float, default=100000.0)
    currency = Column(String(10), default="INR")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="portfolios")
    holdings = relationship("Holding", back_populates="portfolio", cascade="all, delete-orphan")
    orders = relationship("PaperOrder", back_populates="portfolio", cascade="all, delete-orphan")


class Holding(Base):
    __tablename__ = "holdings"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), index=True)
    symbol = Column(String(50), nullable=False)
    company_name = Column(String(200), default="")
    quantity = Column(Float, default=0.0)
    average_buy_price = Column(Float, default=0.0)
    current_price = Column(Float, default=0.0)
    unrealized_pnl = Column(Float, default=0.0)
    unrealized_pnl_pct = Column(Float, default=0.0)

    portfolio = relationship("Portfolio", back_populates="holdings")


class PaperOrder(Base):
    __tablename__ = "paper_orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), index=True)
    symbol = Column(String(50), nullable=False)
    order_type = Column(String(30), default="MARKET")
    side = Column(String(10), nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String(30), default="FILLED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="paper_orders")
    portfolio = relationship("Portfolio", back_populates="orders")
    trades = relationship("PaperTrade", back_populates="order", cascade="all, delete-orphan")


class PaperTrade(Base):
    __tablename__ = "paper_trades"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("paper_orders.id"), index=True)
    execution_price = Column(Float, nullable=False)
    executed_quantity = Column(Float, nullable=False)
    fees = Column(Float, default=0.0)
    slippage = Column(Float, default=0.0)
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("PaperOrder", back_populates="trades")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    asset_symbol = Column(String(50), nullable=False, index=True)
    risk_score = Column(Float, default=45.0)
    risk_level = Column(String(20), default="MODERATE")
    volatility_annualized = Column(Float, default=0.22)
    max_drawdown_pct = Column(Float, default=12.5)
    recommended_position_pct = Column(Float, default=5.0)
    stop_loss_distance_pct = Column(Float, default=2.5)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Backtest(Base):
    __tablename__ = "backtests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    strategy_name = Column(String(100), nullable=False)
    symbol = Column(String(50), nullable=False)
    start_date = Column(String(30), nullable=False)
    end_date = Column(String(30), nullable=False)
    total_return_pct = Column(Float, default=0.0)
    win_rate_pct = Column(Float, default=0.0)
    max_drawdown_pct = Column(Float, default=0.0)
    sharpe_ratio = Column(Float, default=0.0)
    profit_factor = Column(Float, default=1.0)
    trades_count = Column(Integer, default=0)
    trade_logs_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    report_type = Column(String(50), default="MARKET_ANALYSIS")
    title = Column(String(255), nullable=False)
    content_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reports")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), default="")
    details_json = Column(JSON, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
