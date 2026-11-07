import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.connection import engine, Base
import backend.models.models as models

# Routers
from backend.api.auth import router as auth_router
from backend.api.dashboard import router as dashboard_router
from backend.api.market import router as market_router
from backend.api.analysis import router as analysis_router
from backend.api.agents import router as agents_router
from backend.api.opportunities import router as opportunities_router
from backend.api.predictions import router as predictions_router
from backend.api.risk import router as risk_router
from backend.api.portfolio import router as portfolio_router
from backend.api.paper import router as paper_router
from backend.api.backtest import router as backtest_router
from backend.api.reports import router as reports_router

# Auto-create all 18 tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TradeMind AI: Autonomous Multi-Agent Trading Analysis & Risk Management System",
    description="Intelligent financial market analysis platform powered by ten specialized AI agents.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All API Routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(market_router)
app.include_router(analysis_router)
app.include_router(agents_router)
app.include_router(opportunities_router)
app.include_router(predictions_router)
app.include_router(risk_router)
app.include_router(portfolio_router)
app.include_router(paper_router)
app.include_router(backtest_router)
app.include_router(reports_router)

@app.get("/")
def root():
    return {
        "system": "TradeMind AI",
        "tagline": "Analyze Markets. Discover Opportunities. Manage Risk.",
        "version": "1.0.0",
        "status": "OPERATIONAL",
        "agents_online": 10,
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
