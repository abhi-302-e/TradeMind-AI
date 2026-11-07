from fastapi import APIRouter, Query, HTTPException
from backend.orchestrator.workflow import TradeMindOrchestrator

router = APIRouter(prefix="/api/analysis", tags=["Multi-Agent Orchestrator"])
orchestrator = TradeMindOrchestrator()

@router.post("/{symbol}")
@router.get("/{symbol}")
def run_multi_agent_analysis(symbol: str, account_equity: float = Query(100000.0, ge=1000.0)):
    try:
        report = orchestrator.run_analysis(symbol=symbol, account_equity=account_equity)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis orchestration error: {str(e)}")
