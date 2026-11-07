import datetime
from fastapi import APIRouter, HTTPException
from backend.schemas.schemas import PaperOrderRequest
from backend.services.market_service import MarketService
from backend.api.portfolio import PORTFOLIO_STATE

router = APIRouter(prefix="/api/paper", tags=["Paper Trading Engine"])

ORDERS_HISTORY = [
    {
        "id": 101,
        "symbol": "RELIANCE.NS",
        "side": "BUY",
        "order_type": "MARKET",
        "quantity": 15,
        "requested_price": 2890.00,
        "execution_price": 2890.50,
        "fees": 21.68,
        "slippage": 0.50,
        "status": "FILLED",
        "timestamp": "2026-11-05T10:15:00Z"
    },
    {
        "id": 102,
        "symbol": "TCS.NS",
        "side": "BUY",
        "order_type": "MARKET",
        "quantity": 8,
        "requested_price": 4050.00,
        "execution_price": 4051.20,
        "fees": 16.20,
        "slippage": 1.20,
        "status": "FILLED",
        "timestamp": "2026-11-06T11:30:00Z"
    }
]

@router.get("/orders")
def get_paper_orders():
    return {
        "count": len(ORDERS_HISTORY),
        "orders": list(reversed(ORDERS_HISTORY))
    }

@router.post("/orders")
def submit_paper_order(order: PaperOrderRequest):
    snap = MarketService.get_asset_snapshot(order.symbol)
    base_price = snap["current_price"]

    # Realistic execution simulation: 0.05% slippage and 0.03% exchange/brokerage fees
    slippage_rate = 0.0005 if order.side.upper() == "BUY" else -0.0005
    exec_price = round(base_price * (1.0 + slippage_rate), 2)
    trade_value = round(exec_price * order.quantity, 2)
    fees = round(trade_value * 0.0003, 2)
    total_cost = trade_value + fees

    if order.side.upper() == "BUY":
        if PORTFOLIO_STATE["cash_balance"] < total_cost:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient paper cash balance (₹{PORTFOLIO_STATE['cash_balance']:,.2f}) for order of ₹{total_cost:,.2f}."
            )
        PORTFOLIO_STATE["cash_balance"] -= total_cost

        # Update or add holding
        existing = next((h for h in PORTFOLIO_STATE["holdings"] if h["symbol"] == order.symbol), None)
        if existing:
            new_qty = existing["quantity"] + order.quantity
            existing["average_price"] = round(
                ((existing["quantity"] * existing["average_price"]) + trade_value) / new_qty, 2
            )
            existing["quantity"] = new_qty
        else:
            PORTFOLIO_STATE["holdings"].append({
                "id": len(PORTFOLIO_STATE["holdings"]) + 1,
                "symbol": order.symbol,
                "company_name": snap["name"],
                "quantity": order.quantity,
                "average_price": exec_price,
                "sector": "Diversified Equities"
            })
    else: # SELL
        existing = next((h for h in PORTFOLIO_STATE["holdings"] if h["symbol"] == order.symbol), None)
        if not existing or existing["quantity"] < order.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot sell {order.quantity} units of {order.symbol}. Currently holding {existing['quantity'] if existing else 0} units."
            )
        existing["quantity"] -= order.quantity
        if existing["quantity"] <= 0:
            PORTFOLIO_STATE["holdings"] = [h for h in PORTFOLIO_STATE["holdings"] if h["symbol"] != order.symbol]

        net_proceeds = trade_value - fees
        PORTFOLIO_STATE["cash_balance"] += net_proceeds

    order_record = {
        "id": len(ORDERS_HISTORY) + 101,
        "symbol": order.symbol,
        "side": order.side.upper(),
        "order_type": order.order_type.upper(),
        "quantity": order.quantity,
        "requested_price": base_price,
        "execution_price": exec_price,
        "fees": fees,
        "slippage": round(abs(exec_price - base_price), 2),
        "status": "FILLED",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    ORDERS_HISTORY.append(order_record)

    return {
        "success": True,
        "message": f"Simulated {order.side.upper()} order for {order.quantity} units of {order.symbol} filled at {snap['currency']} {exec_price}.",
        "order": order_record,
        "remaining_cash": round(PORTFOLIO_STATE["cash_balance"], 2)
    }

@router.post("/reset")
def reset_paper_portfolio():
    PORTFOLIO_STATE["cash_balance"] = 100000.0
    PORTFOLIO_STATE["holdings"] = []
    ORDERS_HISTORY.clear()
    return {"success": True, "message": "Paper portfolio reset to ₹100,000 virtual balance."}

