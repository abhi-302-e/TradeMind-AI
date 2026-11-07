import datetime
from fastapi import APIRouter
from backend.services.market_service import MarketService
from backend.orchestrator.workflow import TradeMindOrchestrator

router = APIRouter(prefix="/api/reports", tags=["Reports & Analytics"])
orchestrator = TradeMindOrchestrator()

GENERATED_REPORTS = [
    {
        "id": "RPT-2026-001",
        "title": "Comprehensive Multi-Agent Analysis: RELIANCE.NS",
        "symbol": "RELIANCE.NS",
        "report_type": "MULTI_AGENT_SYNTHESIS",
        "verdict": "BUY CANDIDATE",
        "score": 78.4,
        "created_at": "2026-11-06T14:30:00Z",
        "summary": "Technical momentum and solid quarterly balance sheet metrics substantiate an attractive risk-adjusted entry setup."
    },
    {
        "id": "RPT-2026-002",
        "title": "Quantitative Opportunity Scan: NSE Top 50 Equities",
        "symbol": "MARKET_WIDE",
        "report_type": "OPPORTUNITY_SCREEN",
        "verdict": "BULLISH BIAS",
        "score": 72.1,
        "created_at": "2026-11-07T09:15:00Z",
        "summary": "Scanned 50 large-cap constituents; 14 active buy setups identified against 3 downside warnings."
    }
]

@router.get("")
def list_reports():
    return {
        "count": len(GENERATED_REPORTS),
        "reports": GENERATED_REPORTS
    }

@router.post("/generate")
def generate_report(symbol: str = "RELIANCE.NS"):
    analysis = orchestrator.run_analysis(symbol=symbol)
    report_id = f"RPT-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    new_report = {
        "id": report_id,
        "title": f"TradeMind AI Institutional Report: {symbol}",
        "symbol": symbol,
        "report_type": "MULTI_AGENT_SYNTHESIS",
        "verdict": analysis["final_verdict"],
        "score": analysis["composite_score"],
        "created_at": datetime.datetime.utcnow().isoformat() + "Z",
        "summary": analysis["executive_summary"],
        "details": analysis
    }
    GENERATED_REPORTS.insert(0, new_report)
    return new_report

