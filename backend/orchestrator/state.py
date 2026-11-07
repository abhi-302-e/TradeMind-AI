from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from backend.schemas.schemas import BaseAgentOutput

class TradeMindWorkflowState(BaseModel):
    symbol: str
    bars: List[Dict[str, Any]] = Field(default_factory=list)
    account_equity: float = 100000.0
    portfolio_value: float = 125000.0
    cash_balance: float = 45000.0

    # Agent output dictionaries
    market_data: Optional[Dict[str, Any]] = None
    technical: Optional[Dict[str, Any]] = None
    fundamental: Optional[Dict[str, Any]] = None
    news: Optional[Dict[str, Any]] = None
    opportunity: Optional[Dict[str, Any]] = None
    prediction: Optional[Dict[str, Any]] = None
    risk: Optional[Dict[str, Any]] = None
    portfolio: Optional[Dict[str, Any]] = None
    decision: Optional[Dict[str, Any]] = None
    monitoring: Optional[Dict[str, Any]] = None

    final_verdict: str = "HOLD"
    composite_score: float = 50.0
    confidence: float = 0.5
    errors: List[str] = Field(default_factory=list)
