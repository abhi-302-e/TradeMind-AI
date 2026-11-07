from fastapi import APIRouter
from backend.services.market_service import MarketService

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio Management"])

# In-memory virtual paper portfolio state for demo persistence
PORTFOLIO_STATE = {
    "name": "Institutional Paper Portfolio",
    "initial_capital": 100000.0,
    "cash_balance": 38450.0,
    "currency": "INR",
    "holdings": [
        {
            "id": 1,
            "symbol": "RELIANCE.NS",
            "company_name": "Reliance Industries Ltd",
            "quantity": 15,
            "average_price": 2890.00,
            "sector": "Energy & Retail"
        },
        {
            "id": 2,
            "symbol": "TCS.NS",
            "company_name": "Tata Consultancy Services Ltd",
            "quantity": 8,
            "average_price": 4050.00,
            "sector": "Information Technology"
        },
        {
            "id": 3,
            "symbol": "HDFCBANK.NS",
            "company_name": "HDFC Bank Ltd",
            "quantity": 12,
            "average_price": 1680.00,
            "sector": "Financial Services"
        }
    ]
}

@router.get("")
def get_portfolio():
    cash = PORTFOLIO_STATE["cash_balance"]
    holdings_data = []
    invested_total = 0.0

    for h in PORTFOLIO_STATE["holdings"]:
        snap = MarketService.get_asset_snapshot(h["symbol"])
        curr_price = snap["current_price"]
        current_val = round(h["quantity"] * curr_price, 2)
        cost_val = round(h["quantity"] * h["average_price"], 2)
        pnl = round(current_val - cost_val, 2)
        pnl_pct = round((pnl / cost_val) * 100, 2) if cost_val > 0 else 0.0

        invested_total += current_val
        holdings_data.append({
            **h,
            "current_price": curr_price,
            "current_value": current_val,
            "cost_value": cost_val,
            "unrealized_pnl": pnl,
            "unrealized_pnl_pct": pnl_pct
        })

    total_portfolio_value = round(cash + invested_total, 2)
    total_pnl = round(total_portfolio_value - PORTFOLIO_STATE["initial_capital"], 2)
    total_pnl_pct = round((total_pnl / PORTFOLIO_STATE["initial_capital"]) * 100, 2)

    # Sector breakdown
    sector_map = {}
    for hd in holdings_data:
        sec = hd["sector"]
        sector_map[sec] = sector_map.get(sec, 0.0) + hd["current_value"]

    sector_allocation = [
        {"sector": k, "value": round(v, 2), "pct": round((v / max(1.0, total_portfolio_value)) * 100, 1)}
        for k, v in sector_map.items()
    ]
    sector_allocation.append({
        "sector": "Cash Reserve",
        "value": round(cash, 2),
        "pct": round((cash / max(1.0, total_portfolio_value)) * 100, 1)
    })

    return {
        "portfolio_name": PORTFOLIO_STATE["name"],
        "initial_capital": PORTFOLIO_STATE["initial_capital"],
        "cash_balance": round(cash, 2),
        "total_value": total_portfolio_value,
        "invested_value": round(invested_total, 2),
        "total_pnl": total_pnl,
        "total_pnl_pct": total_pnl_pct,
        "currency": PORTFOLIO_STATE["currency"],
        "holdings_count": len(holdings_data),
        "holdings": holdings_data,
        "sector_allocation": sector_allocation,
        "diversification_score": 82.5
    }
