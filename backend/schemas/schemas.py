from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str
    role: str

class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class UserLoginRequest(BaseModel):
    email: str
    password: str

class MarketOHLCVBar(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: float

class AssetInfo(BaseModel):
    id: Optional[int] = None
    symbol: str
    name: str
    exchange: str
    asset_type: str
    currency: str
    current_price: float
    price_change: float
    price_change_pct: float
    volume: float
    high_24h: float
    low_24h: float
    is_live: bool = False
    source: str = "Simulated Real-time Feed"
    last_updated: str

class BaseAgentOutput(BaseModel):
    agent_name: str
    status: str
    asset: str
    timestamp: str
    score: float = 50.0
    signal: str = "NEUTRAL"
    confidence: float = 0.5
    metrics: Dict[str, Any] = Field(default_factory=dict)
    evidence: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    execution_time_ms: float = 0.0

class MultiAgentAnalysisResponse(BaseModel):
    symbol: str
    company_name: str
    current_price: float
    timestamp: str
    final_verdict: str
    composite_score: float
    confidence: float
    risk_level: str
    agents_summary: Dict[str, BaseAgentOutput]
    suggested_trade: Optional[Dict[str, Any]] = None
    executive_summary: str

class OpportunityItem(BaseModel):
    id: int
    symbol: str
    company_name: str
    exchange: str
    signal: str
    score: float
    confidence: float
    entry_price: float
    target_price: float
    stop_loss: float
    risk_reward: float
    evidence: List[str]
    created_at: str

class PredictionScenario(BaseModel):
    symbol: str
    current_price: float
    model_name: str
    horizon: str
    target_price: float
    low_band: float
    high_band: float
    confidence: float
    predicted_change_pct: float
    historical_accuracy: float
    forecast_points: List[Dict[str, Any]]

class RiskCalculationRequest(BaseModel):
    account_equity: float = 100000.0
    risk_pct_per_trade: float = 1.0
    entry_price: float
    stop_loss_price: float
    asset_symbol: Optional[str] = "RELIANCE.NS"

class RiskCalculationResponse(BaseModel):
    symbol: str
    account_equity: float
    risk_amount: float
    entry_price: float
    stop_loss_price: float
    per_unit_risk: float
    suggested_position_size: int
    total_position_value: float
    max_potential_loss: float
    risk_reward_ratio: float
    risk_level: str
    warnings: List[str]

class PaperOrderRequest(BaseModel):
    symbol: str
    order_type: str = "MARKET"
    side: str
    quantity: float
    price: Optional[float] = None

class BacktestRequest(BaseModel):
    strategy: str
    symbol: str
    initial_capital: float = 100000.0
    period_days: int = 180
    stop_loss_pct: float = 2.0
    take_profit_pct: float = 4.0

class BacktestResponse(BaseModel):
    strategy: str
    symbol: str
    initial_capital: float
    ending_capital: float
    total_return_pct: float
    win_rate_pct: float
    max_drawdown_pct: float
    sharpe_ratio: float
    profit_factor: float
    trades_count: int
    trades: List[Dict[str, Any]]
    equity_curve: List[Dict[str, Any]]
