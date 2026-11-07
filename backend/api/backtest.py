from fastapi import APIRouter
from backend.schemas.schemas import BacktestRequest, BacktestResponse
from backend.services.backtest_service import BacktestService

router = APIRouter(prefix="/api/backtest", tags=["Strategy Backtesting"])

@router.post("", response_model=BacktestResponse)
def execute_strategy_backtest(req: BacktestRequest):
    result = BacktestService.run_backtest(
        strategy=req.strategy,
        symbol=req.symbol,
        initial_capital=req.initial_capital,
        period_days=req.period_days,
        stop_loss_pct=req.stop_loss_pct,
        take_profit_pct=req.take_profit_pct
    )
    return BacktestResponse(**result)
