from fastapi import APIRouter
from backend.schemas.schemas import RiskCalculationRequest, RiskCalculationResponse
from backend.services.market_service import MarketService

router = APIRouter(prefix="/api/risk", tags=["Risk Management"])

@router.post("/calculate", response_model=RiskCalculationResponse)
def calculate_risk_parameters(req: RiskCalculationRequest):
    symbol = req.asset_symbol or "RELIANCE.NS"
    snapshot = MarketService.get_asset_snapshot(symbol)

    risk_amount = req.account_equity * (req.risk_pct_per_trade / 100.0)
    per_unit_risk = abs(req.entry_price - req.stop_loss_price)

    if per_unit_risk <= 0.0:
        per_unit_risk = max(1.0, req.entry_price * 0.02)

    suggested_shares = int(risk_amount / per_unit_risk)
    total_position_val = round(suggested_shares * req.entry_price, 2)
    max_loss = round(suggested_shares * per_unit_risk, 2)

    # Estimate default target (at least 2:1 R:R)
    target_est = req.entry_price + (2.2 * per_unit_risk) if req.entry_price > req.stop_loss_price else req.entry_price - (2.2 * per_unit_risk)
    rr_ratio = round(abs(target_est - req.entry_price) / max(0.01, per_unit_risk), 2)

    risk_level = "LOW" if req.risk_pct_per_trade <= 1.0 else ("MODERATE" if req.risk_pct_per_trade <= 2.5 else "HIGH")

    warnings = []
    if total_position_val > req.account_equity:
        warnings.append("Position size exceeds entire account equity! Lower risk percentage or widen stop-loss.")
    if req.risk_pct_per_trade > 3.0:
        warnings.append("Aggressive risk warning: Exceeds standard institutional 1%-2% guideline.")

    return RiskCalculationResponse(
        symbol=symbol,
        account_equity=req.account_equity,
        risk_amount=risk_amount,
        entry_price=req.entry_price,
        stop_loss_price=req.stop_loss_price,
        per_unit_risk=round(per_unit_risk, 2),
        suggested_position_size=suggested_shares,
        total_position_value=total_position_val,
        max_potential_loss=max_loss,
        risk_reward_ratio=rr_ratio,
        risk_level=risk_level,
        warnings=warnings
    )
