import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import datetime

# Import TradeMind AI Core Services & Orchestration
from backend.services.market_service import MarketService, SUPPORTED_ASSETS
from backend.orchestrator.workflow import TradeMindOrchestrator
from backend.services.backtest_service import BacktestService

# Streamlit Page Setup
st.set_page_config(
    page_title="TradeMind AI · Groww-Style Institutional Trading Terminal",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Groww-Style Dark Institutional Fintech CSS
st.markdown("""
<style>
    /* Dark Theme Core */
    .stApp {
        background-color: #0b0e14;
        color: #f1f5f9;
        font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
    }
    
    /* Top Market Bar */
    .index-pill {
        background: #121824;
        border: 1px solid #1e293b;
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        flex-direction: column;
    }
    
    /* Groww Brand Colors */
    .groww-green { color: #00d09c; font-weight: 700; }
    .groww-red { color: #eb5757; font-weight: 700; }
    .groww-cyan { color: #00d2ff; font-weight: 700; }
    
    /* Custom Card Containers */
    .groww-card {
        background: #121824;
        border: 1px solid #1e293b;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 14px;
    }
    
    /* Tab Styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background-color: #0f1523;
        padding: 6px;
        border-radius: 10px;
        border: 1px solid #1e293b;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 6px;
        color: #94a3b8;
        padding: 8px 16px;
        font-weight: 600;
        font-size: 13px;
    }
    .stTabs [aria-selected="true"] {
        background-color: #1e293b !important;
        color: #00d09c !important;
    }
    
    /* Order Buttons */
    .btn-buy {
        background-color: #00d09c !important;
        color: #000000 !important;
        font-weight: 700 !important;
        border-radius: 8px !important;
    }
    .btn-sell {
        background-color: #eb5757 !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        border-radius: 8px !important;
    }

    /* Depth Bar Styling */
    .depth-bar-bid {
        background: rgba(0, 208, 156, 0.2);
        height: 100%;
        border-radius: 3px;
    }
    .depth-bar-ask {
        background: rgba(235, 87, 87, 0.2);
        height: 100%;
        border-radius: 3px;
    }
</style>
""", unsafe_allow_html=True)


# ==============================================================================
# SESSION STATE INITIALIZATION
# ==============================================================================
if "is_authenticated" not in st.session_state:
    st.session_state.is_authenticated = True
if "user_role" not in st.session_state:
    st.session_state.user_role = "customer" # "customer" or "admin"
if "user_name" not in st.session_state:
    st.session_state.user_name = "Alpha Trader"
if "user_email" not in st.session_state:
    st.session_state.user_email = "trader@groww.in"
if "demat_id" not in st.session_state:
    st.session_state.demat_id = "GROWW-IN-984210"
if "cash_balance" not in st.session_state:
    st.session_state.cash_balance = 125000.00
if "selected_symbol" not in st.session_state:
    st.session_state.selected_symbol = "RELIANCE.NS"
if "orchestrator" not in st.session_state:
    st.session_state.orchestrator = TradeMindOrchestrator()

# Initial Mock Holdings & Positions
if "holdings" not in st.session_state:
    st.session_state.holdings = [
        {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "qty": 15, "avg_price": 2850.00, "exchange": "NSE"},
        {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "qty": 10, "avg_price": 4010.50, "exchange": "NSE"},
        {"symbol": "INFY.NS", "name": "Infosys Ltd", "qty": 25, "avg_price": 1780.20, "exchange": "NSE"},
        {"symbol": "HDFCBANK.NS", "name": "HDFC Bank Ltd", "qty": 30, "avg_price": 1690.00, "exchange": "NSE"},
        {"symbol": "TATAMOTORS.NS", "name": "Tata Motors Ltd", "qty": 40, "avg_price": 940.00, "exchange": "NSE"},
    ]

if "positions" not in st.session_state:
    st.session_state.positions = [
        {"id": "POS-101", "symbol": "ZOMATO.NS", "qty": 100, "entry_price": 262.10, "side": "BUY", "product": "INTRADAY", "leverage": 5, "timestamp": "09:42:15 AM"},
        {"id": "POS-102", "symbol": "ICICIBANK.NS", "qty": 20, "entry_price": 1245.50, "side": "BUY", "product": "INTRADAY", "leverage": 5, "timestamp": "10:15:30 AM"},
    ]

if "orders" not in st.session_state:
    st.session_state.orders = [
        {"order_id": "ORD-9421", "time": "09:42:15 AM", "symbol": "ZOMATO.NS", "side": "BUY", "type": "MARKET", "product": "INTRADAY", "qty": 100, "price": 262.10, "status": "EXECUTED"},
        {"order_id": "ORD-9422", "time": "10:15:30 AM", "symbol": "ICICIBANK.NS", "side": "BUY", "type": "LIMIT", "product": "INTRADAY", "qty": 20, "price": 1245.50, "status": "EXECUTED"},
        {"order_id": "ORD-9423", "time": "11:02:44 AM", "symbol": "SBIN.NS", "side": "BUY", "type": "LIMIT", "product": "DELIVERY", "qty": 50, "price": 830.00, "status": "OPEN"},
    ]


# ==============================================================================
# VIEW: DEDICATED LOGIN & AUTHENTICATION PORTAL (IF NOT AUTHENTICATED OR SWITCHING)
# ==============================================================================
def render_login_portal():
    st.markdown("""
    <div style="text-align: center; margin-top: 20px; margin-bottom: 25px;">
        <div style="font-size: 38px;">⚡</div>
        <h1 style="background: linear-gradient(90deg, #00d09c, #00d2ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 4px;">
            TradeMind AI × Groww Trading
        </h1>
        <p style="color: #94a3b8; font-size: 14px;">Next-Gen Autonomous Multi-Agent Trading & Investment Platform</p>
    </div>
    """, unsafe_allow_html=True)

    col_l1, col_center, col_l2 = st.columns([1, 2, 1])

    with col_center:
        auth_tab1, auth_tab2, auth_tab3 = st.tabs(["👤 User / Customer Login", "👑 Admin Command Login", "📝 Open Free Account"])

        # Tab 1: User Login
        with auth_tab1:
            st.markdown("#### Sign in to your Trading Account")
            u_email = st.text_input("Mobile Number or Email", value="trader@groww.in")
            u_pin = st.text_input("Enter 4-Digit Trading PIN", type="password", value="9842")

            c_sub1, c_sub2 = st.columns(2)
            with c_sub1:
                if st.button("🚀 Sign In as Customer", use_container_width=True):
                    st.session_state.is_authenticated = True
                    st.session_state.user_role = "customer"
                    st.session_state.user_name = "Alpha Trader"
                    st.session_state.user_email = u_email
                    st.success("Welcome back! Redirecting to Live Trading...")
                    st.rerun()
            with c_sub2:
                if st.button("⚡ 1-Click Fast Demo Login", use_container_width=True):
                    st.session_state.is_authenticated = True
                    st.session_state.user_role = "customer"
                    st.session_state.user_name = "Alpha Trader"
                    st.session_state.user_email = "trader@groww.in"
                    st.rerun()

        # Tab 2: Admin Login
        with auth_tab2:
            st.markdown("#### TradeMind Administrator Portal")
            st.warning("Restricted to Institutional Risk Officers and Platform System Admins.")
            a_email = st.text_input("Admin ID / Email", value="forestnation08@gmail.com")
            a_sec = st.text_input("Master Administrative Password", type="password", value="Abhi@302")

            c_adm1, c_adm2 = st.columns(2)
            with c_adm1:
                if st.button("👑 Authenticate as Administrator", use_container_width=True):
                    if a_sec == "Abhi@302" and a_email.strip().lower() == "forestnation08@gmail.com":
                        st.session_state.is_authenticated = True
                        st.session_state.user_role = "admin"
                        st.session_state.user_name = "Abhi (System Administrator)"
                        st.session_state.user_email = a_email.strip().lower()
                        st.success("Admin credentials verified. Entering Command Center...")
                        st.rerun()
                    else:
                        st.error("Invalid Admin credentials! Please check your email and master key.")
            with c_adm2:
                if st.button("⚡ 1-Click Fast Admin Sign In", use_container_width=True):
                    st.session_state.is_authenticated = True
                    st.session_state.user_role = "admin"
                    st.session_state.user_name = "Abhi (System Administrator)"
                    st.session_state.user_email = "forestnation08@gmail.com"
                    st.rerun()

        # Tab 3: Register Account
        with auth_tab3:
            st.markdown("#### Open Zero-Brokerage Demat Account")
            reg_name = st.text_input("Full Legal Name", value="Karthik Edulakanti")
            reg_pan = st.text_input("PAN Number", value="ABCDE1234F")
            reg_mobile = st.text_input("Mobile (for OTP verification)", value="+91 98765 43210")
            if st.button("Create Account & Grant ₹1,00,000 Paper Capital", use_container_width=True):
                st.session_state.is_authenticated = True
                st.session_state.user_role = "customer"
                st.session_state.user_name = reg_name
                st.session_state.user_email = f"{reg_name.lower().replace(' ', '.')}@investor.in"
                st.session_state.cash_balance = 100000.00
                st.balloons()
                st.success(f"Demat Account created for {reg_name}! ₹1,00,000 virtual margin credited.")
                st.rerun()


# ==============================================================================
# MAIN APPLICATION INTERFACE (WHEN AUTHENTICATED)
# ==============================================================================
if not st.session_state.is_authenticated:
    render_login_portal()
    st.stop()


# ----------------- GROWW-STYLE TOP NAVIGATION & INDICES RIBBON -----------------
# Header Row: Logo, User Badge, Demat ID, Wallet Balance, Logout
h_left, h_mid, h_right = st.columns([2, 3, 2])

with h_left:
    st.markdown(f"""
    <div style="display:flex; align-items:center; gap:10px;">
        <div style="background: linear-gradient(135deg, #00d09c, #00d2ff); border-radius: 10px; width: 36px; height: 36px; display:flex; align-items:center; justify-content:center; color:#000; font-size:18px; font-weight:bold;">
            ⚡
        </div>
        <div>
            <div style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">TradeMind <span style="color:#00d09c;">Groww</span></div>
            <div style="font-size: 10px; color: #64748b; font-family: monospace;">INSTITUTIONAL PAPER DESK</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

with h_mid:
    pass

with h_right:
    c_user, c_out = st.columns([3, 1])
    with c_user:
        badge_color = "#f59e0b" if st.session_state.user_role == "admin" else "#00d09c"
        st.markdown(f"""
        <div style="text-align:right;">
            <span style="font-size: 13px; font-weight: bold; color: #f1f5f9;">{st.session_state.user_name}</span>
            <span style="font-size: 10px; background: {badge_color}22; color:{badge_color}; border:1px solid {badge_color}44; padding:2px 6px; border-radius:4px; font-family:monospace; margin-left:6px; text-transform:uppercase;">
                {st.session_state.user_role}
            </span>
            <div style="font-size: 11px; color:#94a3b8; font-family:monospace;">
                Balance: <span style="color:#00d09c; font-weight:bold;">₹{st.session_state.cash_balance:,.2f}</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
    with c_out:
        if st.button("Logout", key="btn_logout"):
            st.session_state.is_authenticated = False
            st.rerun()

st.markdown("<hr style='margin: 8px 0 14px 0; border-color: #1e293b;'>", unsafe_allow_html=True)


# ----------------- LIVE MARKET INDICES BAR (Real-world Groww Header) -----------------
idx_c1, idx_c2, idx_c3, idx_c4, idx_c5, idx_c6 = st.columns(6)

idx_c1.markdown("""
<div class="index-pill">
    <div style="font-size: 11px; color: #94a3b8; font-weight: 600;">NIFTY 50</div>
    <div style="font-size: 14px; font-weight: 800; color: #f1f5f9;">24,385.60</div>
    <div style="font-size: 11px;" class="groww-green">+142.30 (+0.59%)</div>
</div>
""", unsafe_allow_html=True)

idx_c2.markdown("""
<div class="index-pill">
    <div style="font-size: 11px; color: #94a3b8; font-weight: 600;">SENSEX</div>
    <div style="font-size: 14px; font-weight: 800; color: #f1f5f9;">80,112.45</div>
    <div style="font-size: 11px;" class="groww-green">+420.15 (+0.53%)</div>
</div>
""", unsafe_allow_html=True)

idx_c3.markdown("""
<div class="index-pill">
    <div style="font-size: 11px; color: #94a3b8; font-weight: 600;">BANK NIFTY</div>
    <div style="font-size: 14px; font-weight: 800; color: #f1f5f9;">52,140.20</div>
    <div style="font-size: 11px;" class="groww-green">+310.80 (+0.60%)</div>
</div>
""", unsafe_allow_html=True)

idx_c4.markdown("""
<div class="index-pill">
    <div style="font-size: 11px; color: #94a3b8; font-weight: 600;">FIN NIFTY</div>
    <div style="font-size: 14px; font-weight: 800; color: #f1f5f9;">23,450.10</div>
    <div style="font-size: 11px;" class="groww-green">+95.40 (+0.41%)</div>
</div>
""", unsafe_allow_html=True)

idx_c5.markdown("""
<div class="index-pill">
    <div style="font-size: 11px; color: #94a3b8; font-weight: 600;">INDIA VIX</div>
    <div style="font-size: 14px; font-weight: 800; color: #f1f5f9;">13.82</div>
    <div style="font-size: 11px;" class="groww-red">-0.45 (-3.15%)</div>
</div>
""", unsafe_allow_html=True)

idx_c6.markdown("""
<div class="index-pill">
    <div style="font-size: 11px; color: #94a3b8; font-weight: 600;">MIDCAP 100</div>
    <div style="font-size: 14px; font-weight: 800; color: #f1f5f9;">58,920.40</div>
    <div style="font-size: 11px;" class="groww-green">+512.60 (+0.88%)</div>
</div>
""", unsafe_allow_html=True)

st.markdown("<hr style='margin: 14px 0 16px 0; border-color: #1e293b;'>", unsafe_allow_html=True)


# ==============================================================================
# MAIN GROWW NAVIGATION TABS
# ==============================================================================
nav_tabs = [
    "📈 Live Trading Terminal",
    "💼 Holdings & Investments",
    "⚡ Intraday Positions",
    "📑 Order Book",
    "🤖 10-Agent AI Copilot",
    "🧪 Strategy Backtesting",
    "👤 Groww Account / Demat"
]

if st.session_state.user_role == "admin":
    nav_tabs.append("👑 Admin Command Center")

main_tab = st.radio("Navigation", nav_tabs, horizontal=True, label_visibility="collapsed")


# ------------------------------------------------------------------------------
# TAB 1: GROWW LIVE TRADING TERMINAL & ORDER EXECUTION PAD
# ------------------------------------------------------------------------------
if main_tab == "📈 Live Trading Terminal":
    # Left Column: Stock Chart & Level-2 Market Depth
    # Right Column: Groww Order Execution Pad (Buy/Sell, Delivery/Intraday, Margin, 1-Click execute)
    col_chart_depth, col_order_pad = st.columns([2.3, 1.1])

    with col_chart_depth:
        # Stock Selector & Quick Ticker Switcher
        stk_col1, stk_col2 = st.columns([2, 1])
        with stk_col1:
            sym_list = [a["symbol"] for a in SUPPORTED_ASSETS]
            selected_sym = st.selectbox("Select Asset to Trade", sym_list, index=sym_list.index(st.session_state.selected_symbol) if st.session_state.selected_symbol in sym_list else 0)
            st.session_state.selected_symbol = selected_sym
        
        snap = MarketService.get_asset_snapshot(selected_sym)
        is_pos = snap["price_change_pct"] >= 0
        color_cls = "groww-green" if is_pos else "groww-red"

        # Asset Header Card
        st.markdown(f"""
        <div class="groww-card" style="margin-bottom: 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span style="font-size: 24px; font-weight: 800; font-family: monospace;">{selected_sym}</span>
                    <span style="font-size: 13px; color: #94a3b8; margin-left: 10px;">{snap['name']} · {snap['exchange']}</span>
                </div>
                <div style="text-align:right;">
                    <span style="font-size: 26px; font-weight: 900; font-family: monospace;">₹{snap['current_price']:,}</span>
                    <span style="font-size: 14px; margin-left: 8px;" class="{color_cls}">
                        {'+' if is_pos else ''}{snap['price_change_pct']}% ({'+' if is_pos else ''}{snap['price_change']})
                    </span>
                </div>
            </div>
            <div style="display:flex; gap: 20px; font-size: 12px; color: #64748b; margin-top: 6px; font-family: monospace;">
                <span>Low: ₹{snap['low_24h']}</span>
                <span>High: ₹{snap['high_24h']}</span>
                <span>Volume: {snap['volume']:,}</span>
                <span>Circuit: 10% (₹{round(snap['current_price']*0.9, 1)} - ₹{round(snap['current_price']*1.1, 1)})</span>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Plotly Candlestick with EMAs & Volume
        bars = MarketService.get_historical_bars(selected_sym, days=60)
        df_bars = pd.DataFrame(bars)
        df_bars["ema20"] = df_bars["close"].ewm(span=20).mean()
        df_bars["ema50"] = df_bars["close"].ewm(span=50).mean()

        fig = make_subplots(
            rows=2, cols=1,
            shared_xaxes=True,
            vertical_spacing=0.03,
            row_heights=[0.75, 0.25]
        )

        fig.add_trace(go.Candlestick(
            x=df_bars["time"],
            open=df_bars["open"],
            high=df_bars["high"],
            low=df_bars["low"],
            close=df_bars["close"],
            name="Price (OHLC)",
            increasing_line_color="#00d09c",
            decreasing_line_color="#eb5757"
        ), row=1, col=1)

        fig.add_trace(go.Scatter(x=df_bars["time"], y=df_bars["ema20"], name="EMA 20", line=dict(color="#f59e0b", width=1.5)), row=1, col=1)
        fig.add_trace(go.Scatter(x=df_bars["time"], y=df_bars["ema50"], name="EMA 50", line=dict(color="#00d2ff", width=1.5)), row=1, col=1)

        vol_colors = ["#00d09c" if c >= o else "#eb5757" for c, o in zip(df_bars["close"], df_bars["open"])]
        fig.add_trace(go.Bar(x=df_bars["time"], y=df_bars["volume"], name="Volume", marker_color=vol_colors, opacity=0.6), row=2, col=1)

        fig.update_layout(
            template="plotly_dark",
            height=380,
            margin=dict(l=10, r=10, t=10, b=10),
            paper_bgcolor="#0b0e14",
            plot_bgcolor="#0b0e14",
            xaxis_rangeslider_visible=False,
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        st.plotly_chart(fig, use_container_width=True)

        # Real-time Level 2 Market Depth (Signature Groww Feature)
        depth = MarketService.get_market_depth(selected_sym)
        st.markdown("##### 📊 Live Market Depth (Level 2 Order Book)")
        
        # Depth percentage bar
        st.markdown(f"""
        <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; margin-bottom:4px; font-family:monospace;">
            <span style="color:#00d09c;">BUY ORDERS: {depth['bid_percentage']}% ({depth['total_bid_quantity']:,} shares)</span>
            <span style="color:#eb5757;">SELL ORDERS: {depth['ask_percentage']}% ({depth['total_ask_quantity']:,} shares)</span>
        </div>
        <div style="display:flex; height:6px; border-radius:3px; overflow:hidden; margin-bottom:10px;">
            <div style="background:#00d09c; width:{depth['bid_percentage']}%;"></div>
            <div style="background:#eb5757; width:{depth['ask_percentage']}%;"></div>
        </div>
        """, unsafe_allow_html=True)

        col_bids, col_asks = st.columns(2)
        with col_bids:
            st.markdown("<div style='font-size:11px; color:#00d09c; font-weight:bold;'>BIDS (BUYERS)</div>", unsafe_allow_html=True)
            df_bids = pd.DataFrame(depth["bids"])
            df_bids.columns = ["Orders", "Price (₹)", "Qty"]
            st.dataframe(df_bids, hide_index=True, use_container_width=True)

        with col_asks:
            st.markdown("<div style='font-size:11px; color:#eb5757; font-weight:bold;'>ASKS (SELLERS)</div>", unsafe_allow_html=True)
            df_asks = pd.DataFrame(depth["asks"])
            df_asks.columns = ["Orders", "Price (₹)", "Qty"]
            st.dataframe(df_asks, hide_index=True, use_container_width=True)


    # Right Column: Real-World Groww Order Ticket Pad
    with col_order_pad:
        st.markdown(f"""
        <div class="groww-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span style="font-size: 16px; font-weight: 800;">ORDER TICKET</span>
                <span style="font-size: 11px; background:#1e293b; color:#00d2ff; padding:2px 8px; border-radius:6px; font-family:monospace;">
                    {snap['exchange']}
                </span>
            </div>
            <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">Available Trading Margin</div>
            <div style="font-size: 20px; font-weight: 900; color: #00d09c; font-family: monospace;">₹{st.session_state.cash_balance:,.2f}</div>
        </div>
        """, unsafe_allow_html=True)

        # Order Type: Delivery (Long Term) vs Intraday (5x margin)
        product_type = st.radio("Product Type", ["Delivery (Long Term)", "Intraday (5x Leverage)"], horizontal=True)
        is_intraday = "Intraday" in product_type
        leverage = 5 if is_intraday else 1

        exchange_type = st.radio("Exchange", ["NSE", "BSE"], horizontal=True)
        order_style = st.radio("Order Execution Type", ["Market Order", "Limit Order"], horizontal=True)

        qty = st.number_input("Quantity (Shares)", min_value=1, value=10, step=1)
        
        current_ltp = snap["current_price"]
        if order_style == "Limit Order":
            limit_price = st.number_input("Limit Price (₹)", min_value=1.0, value=float(current_ltp), step=0.5)
            exec_price = limit_price
        else:
            exec_price = current_ltp
            st.info(f"⚡ Market Execution at LTP: ₹{exec_price:,}")

        # Real-time Margin & Required Balance Calculation (Like Groww)
        gross_value = qty * exec_price
        required_margin = gross_value / leverage
        brokerage = 20.0 if is_intraday else 0.0 # Groww ₹20 per intraday order, 0 on delivery
        stt_taxes = round(gross_value * 0.001, 2)
        total_required = round(required_margin + brokerage + stt_taxes, 2)

        st.markdown(f"""
        <div style="background:#0f1523; border:1px solid #1e293b; border-radius:8px; padding:12px; font-family:monospace; font-size:12px; margin: 12px 0;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="color:#94a3b8;">Gross Position Value:</span>
                <span style="font-weight:bold; color:#f1f5f9;">₹{gross_value:,.2f}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="color:#94a3b8;">Leverage Applied:</span>
                <span style="color:#00d2ff; font-weight:bold;">{leverage}x {'(Margin Benefit)' if is_intraday else ''}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="color:#94a3b8;">Brokerage + Taxes:</span>
                <span style="color:#f1f5f9;">₹{brokerage + stt_taxes:,.2f}</span>
            </div>
            <hr style="border-color:#1e293b; margin:6px 0;">
            <div style="display:flex; justify-content:space-between; font-size:13px;">
                <span style="color:#00d09c; font-weight:bold;">Margin Required:</span>
                <span style="color:#00d09c; font-weight:900;">₹{total_required:,.2f}</span>
            </div>
        </div>
        """, unsafe_allow_html=True)

        col_buy, col_sell = st.columns(2)

        with col_buy:
            if st.button("🟢 BUY", use_container_width=True):
                if total_required > st.session_state.cash_balance:
                    st.error("❌ Insufficient Margin! Add funds or reduce quantity.")
                else:
                    st.session_state.cash_balance -= total_required
                    order_num = f"ORD-{np.random.randint(1000, 9999)}"
                    now_str = datetime.datetime.now().strftime("%I:%M:%S %p")

                    # Add to Orders
                    st.session_state.orders.insert(0, {
                        "order_id": order_num,
                        "time": now_str,
                        "symbol": selected_sym,
                        "side": "BUY",
                        "type": "MARKET" if order_style == "Market Order" else "LIMIT",
                        "product": "INTRADAY" if is_intraday else "DELIVERY",
                        "qty": qty,
                        "price": exec_price,
                        "status": "EXECUTED"
                    })

                    # If Intraday, add to Positions; If Delivery, add to Holdings
                    if is_intraday:
                        st.session_state.positions.insert(0, {
                            "id": f"POS-{np.random.randint(100, 999)}",
                            "symbol": selected_sym,
                            "qty": qty,
                            "entry_price": exec_price,
                            "side": "BUY",
                            "product": "INTRADAY",
                            "leverage": 5,
                            "timestamp": now_str
                        })
                    else:
                        existing = next((h for h in st.session_state.holdings if h["symbol"] == selected_sym), None)
                        if existing:
                            new_qty = existing["qty"] + qty
                            existing["avg_price"] = round(((existing["qty"] * existing["avg_price"]) + (qty * exec_price)) / new_qty, 2)
                            existing["qty"] = new_qty
                        else:
                            st.session_state.holdings.append({
                                "symbol": selected_sym,
                                "name": snap["name"],
                                "qty": qty,
                                "avg_price": exec_price,
                                "exchange": exchange_type
                            })

                    st.balloons()
                    st.success(f"✅ BUY Order FILLED! {qty} shares of {selected_sym} at ₹{exec_price:,}")
                    st.rerun()

        with col_sell:
            if st.button("🔴 SELL", use_container_width=True):
                order_num = f"ORD-{np.random.randint(1000, 9999)}"
                now_str = datetime.datetime.now().strftime("%I:%M:%S %p")
                
                # Check if holding exists for delivery sell
                if not is_intraday:
                    existing = next((h for h in st.session_state.holdings if h["symbol"] == selected_sym), None)
                    if not existing or existing["qty"] < qty:
                        st.error("❌ Cannot place delivery SELL: Insufficient stock in Demat Holdings!")
                        st.stop()
                    else:
                        existing["qty"] -= qty
                        st.session_state.cash_balance += (qty * exec_price)
                        if existing["qty"] == 0:
                            st.session_state.holdings.remove(existing)
                else:
                    # Intraday Short Sell
                    st.session_state.cash_balance += (gross_value / 5)
                    st.session_state.positions.insert(0, {
                        "id": f"POS-{np.random.randint(100, 999)}",
                        "symbol": selected_sym,
                        "qty": qty,
                        "entry_price": exec_price,
                        "side": "SELL",
                        "product": "INTRADAY",
                        "leverage": 5,
                        "timestamp": now_str
                    })

                st.session_state.orders.insert(0, {
                    "order_id": order_num,
                    "time": now_str,
                    "symbol": selected_sym,
                    "side": "SELL",
                    "type": "MARKET" if order_style == "Market Order" else "LIMIT",
                    "product": "INTRADAY" if is_intraday else "DELIVERY",
                    "qty": qty,
                    "price": exec_price,
                    "status": "EXECUTED"
                })
                st.success(f"✅ SELL Order FILLED! {qty} shares of {selected_sym} at ₹{exec_price:,}")
                st.rerun()


# ------------------------------------------------------------------------------
# TAB 2: GROWW HOLDINGS & INVESTMENTS
# ------------------------------------------------------------------------------
elif main_tab == "💼 Holdings & Investments":
    st.markdown("### 💼 My Portfolio Holdings (Demat Account)")
    
    # Calculate Total Portfolio Summary
    total_invested = 0.0
    total_current = 0.0
    holdings_rows = []

    for h in st.session_state.holdings:
        snap = MarketService.get_asset_snapshot(h["symbol"])
        ltp = snap["current_price"]
        inv_val = h["qty"] * h["avg_price"]
        cur_val = h["qty"] * ltp
        pnl = cur_val - inv_val
        pnl_pct = round((pnl / max(1.0, inv_val)) * 100, 2)
        day_chg_pct = snap["price_change_pct"]
        day_pnl = round(cur_val * (day_chg_pct / 100.0), 2)

        total_invested += inv_val
        total_current += cur_val

        holdings_rows.append({
            "Symbol": h["symbol"],
            "Name": h["name"],
            "Qty": h["qty"],
            "Avg Price": f"₹{h['avg_price']:,}",
            "LTP": f"₹{ltp:,}",
            "Current Value": f"₹{cur_val:,.2f}",
            "Total P&L": f"{'+' if pnl>=0 else ''}₹{pnl:,.2f} ({'+' if pnl_pct>=0 else ''}{pnl_pct}%)",
            "Day P&L": f"{'+' if day_pnl>=0 else ''}₹{day_pnl:,.2f} ({'+' if day_chg_pct>=0 else ''}{day_chg_pct}%)",
            "raw_sym": h["symbol"],
            "raw_qty": h["qty"]
        })

    tot_pnl = total_current - total_invested
    tot_pnl_pct = round((tot_pnl / max(1.0, total_invested)) * 100, 2)

    # Top Metric Banner
    hm1, hm2, hm3, hm4 = st.columns(4)
    hm1.metric("Current Value", f"₹{total_current:,.2f}")
    hm2.metric("Total Investment", f"₹{total_invested:,.2f}")
    hm3.metric("Total Returns", f"{'+' if tot_pnl>=0 else ''}₹{tot_pnl:,.2f}", f"{'+' if tot_pnl_pct>=0 else ''}{tot_pnl_pct}%")
    hm4.metric("Available Cash", f"₹{st.session_state.cash_balance:,.2f}")

    st.markdown("<hr style='margin: 10px 0 16px 0; border-color: #1e293b;'>", unsafe_allow_html=True)

    # Holdings Table with Exit Buttons
    df_h = pd.DataFrame(holdings_rows).drop(columns=["raw_sym", "raw_qty"])
    st.dataframe(df_h, use_container_width=True)

    st.markdown("##### ⚡ 1-Click Position Exit")
    col_exit_sym, col_exit_btn = st.columns([3, 1])
    with col_exit_sym:
        exit_sym = st.selectbox("Select Holding to Liquidate / Exit", [h["symbol"] for h in st.session_state.holdings])
    with col_exit_btn:
        st.write("")
        st.write("")
        if st.button("Exit Entire Holding", use_container_width=True):
            tgt = next((h for h in st.session_state.holdings if h["symbol"] == exit_sym), None)
            if tgt:
                snap = MarketService.get_asset_snapshot(tgt["symbol"])
                ltp = snap["current_price"]
                proceeds = tgt["qty"] * ltp
                st.session_state.cash_balance += proceeds
                st.session_state.orders.insert(0, {
                    "order_id": f"ORD-{np.random.randint(1000, 9999)}",
                    "time": datetime.datetime.now().strftime("%I:%M:%S %p"),
                    "symbol": tgt["symbol"],
                    "side": "SELL",
                    "type": "MARKET",
                    "product": "DELIVERY",
                    "qty": tgt["qty"],
                    "price": ltp,
                    "status": "EXECUTED"
                })
                st.session_state.holdings.remove(tgt)
                st.success(f"Liquidated {tgt['qty']} shares of {tgt['symbol']} at ₹{ltp:,}. ₹{proceeds:,.2f} returned to cash balance.")
                st.rerun()


# ------------------------------------------------------------------------------
# TAB 3: GROWW INTRADAY POSITIONS
# ------------------------------------------------------------------------------
elif main_tab == "⚡ Intraday Positions":
    st.markdown("### ⚡ Live Intraday Open Positions")
    st.markdown("<div style='color:#94a3b8; font-size:12px; margin-bottom:12px;'>Intraday positions are provided with 5x leverage and auto square-off at 03:15 PM IST.</div>", unsafe_allow_html=True)

    if not st.session_state.positions:
        st.info("No open intraday positions. Head over to the Live Trading Terminal to place an Intraday trade!")
    else:
        pos_rows = []
        total_unrealized_pnl = 0.0

        for p in st.session_state.positions:
            snap = MarketService.get_asset_snapshot(p["symbol"])
            ltp = snap["current_price"]
            multiplier = 1 if p["side"] == "BUY" else -1
            pnl = (ltp - p["entry_price"]) * p["qty"] * multiplier
            pnl_pct = round((pnl / (p["entry_price"] * p["qty"] / p["leverage"])) * 100, 2)
            total_unrealized_pnl += pnl

            pos_rows.append({
                "Position ID": p["id"],
                "Time": p["timestamp"],
                "Symbol": p["symbol"],
                "Side": p["side"],
                "Qty": p["qty"],
                "Entry Price": f"₹{p['entry_price']:,}",
                "LTP": f"₹{ltp:,}",
                "Leverage": f"{p['leverage']}x",
                "Floating P&L": f"{'+' if pnl>=0 else ''}₹{pnl:,.2f} ({'+' if pnl_pct>=0 else ''}{pnl_pct}%)",
                "Status": "ACTIVE"
            })

        p1, p2, p3 = st.columns(3)
        p1.metric("Open Intraday Legs", len(st.session_state.positions))
        p2.metric("Floating Intraday P&L", f"{'+' if total_unrealized_pnl>=0 else ''}₹{total_unrealized_pnl:,.2f}")
        p3.metric("Auto Square-off Window", "15:15:00 IST (Active)")

        st.dataframe(pd.DataFrame(pos_rows), use_container_width=True)

        st.markdown("##### 🛑 1-Click Square Off")
        col_sq1, col_sq2 = st.columns([3, 1])
        with col_sq1:
            sq_id = st.selectbox("Select Position to Square Off", [p["id"] for p in st.session_state.positions])
        with col_sq2:
            st.write("")
            st.write("")
            if st.button("Square Off Position", use_container_width=True):
                target_pos = next((p for p in st.session_state.positions if p["id"] == sq_id), None)
                if target_pos:
                    snap = MarketService.get_asset_snapshot(target_pos["symbol"])
                    ltp = snap["current_price"]
                    multiplier = 1 if target_pos["side"] == "BUY" else -1
                    realized_pnl = (ltp - target_pos["entry_price"]) * target_pos["qty"] * multiplier
                    margin_returned = (target_pos["qty"] * target_pos["entry_price"] / target_pos["leverage"]) + realized_pnl
                    st.session_state.cash_balance += margin_returned

                    st.session_state.orders.insert(0, {
                        "order_id": f"ORD-{np.random.randint(1000, 9999)}",
                        "time": datetime.datetime.now().strftime("%I:%M:%S %p"),
                        "symbol": target_pos["symbol"],
                        "side": "SELL" if target_pos["side"] == "BUY" else "BUY",
                        "type": "MARKET",
                        "product": "INTRADAY",
                        "qty": target_pos["qty"],
                        "price": ltp,
                        "status": "EXECUTED (SQUARED OFF)"
                    })
                    st.session_state.positions.remove(target_pos)
                    st.success(f"Position {sq_id} squared off at ₹{ltp:,}! Realized P&L: ₹{realized_pnl:,.2f}")
                    st.rerun()


# ------------------------------------------------------------------------------
# TAB 4: GROWW ORDER BOOK
# ------------------------------------------------------------------------------
elif main_tab == "📑 Order Book":
    st.markdown("### 📑 Trade Order Book & Audit Trail")
    st.markdown("<div style='color:#94a3b8; font-size:12px; margin-bottom:12px;'>All intraday and delivery orders placed through the trading terminal with execution timestamps.</div>", unsafe_allow_html=True)

    df_orders = pd.DataFrame(st.session_state.orders)
    st.dataframe(df_orders, use_container_width=True)


# ------------------------------------------------------------------------------
# TAB 5: TRADEMIND 10-AGENT AI COPILOT
# ------------------------------------------------------------------------------
elif main_tab == "🤖 10-Agent AI Copilot":
    st.markdown("### 🤖 TradeMind 10-Agent Multi-Agent Copilot")
    st.markdown("Ten specialized intelligence agents analyze the selected asset to produce an institutional trade thesis.")

    sym = st.selectbox("Analyze Stock with AI Swarm", [a["symbol"] for a in SUPPORTED_ASSETS], index=0)

    if st.button(f"⚡ Run 10-Agent Analysis on {sym}", use_container_width=True):
        with st.spinner("Dispatching agents across market data, indicators, fundamentals, sentiment, predictions, and risk..."):
            res = st.session_state.orchestrator.run_symbol_analysis(sym)
            
            c_dec1, c_dec2, c_dec3 = st.columns(3)
            rec = res["decision"]["recommendation"]
            c_dec1.metric("Consensus Verdict", rec)
            c_dec2.metric("Agent Confidence", f"{res['decision']['confidence_pct']}%")
            c_dec3.metric("System Risk Level", res["decision"]["risk_level"])

            st.markdown(f"""
            <div class="groww-card">
                <div style="font-size:16px; font-weight:bold; color:#00d2ff; margin-bottom:6px;">Trading Thesis & Agent Rationale</div>
                <div style="font-size:14px; color:#f1f5f9; line-height:1.5;">{res['decision']['thesis']}</div>
            </div>
            """, unsafe_allow_html=True)

            # Grid of 10 Agents Output
            st.markdown("##### 📊 Telemetry from all 10 AI Agents")
            ag_c1, ag_c2 = st.columns(2)
            with ag_c1:
                st.markdown(f"**1. Technical Analysis Agent**: RSI {res['technical']['rsi']}, MACD {res['technical']['macd']['macd_line']} ({res['technical']['macd']['signal_state']})")
                st.markdown(f"**2. Fundamental Agent**: Health Score {res['fundamental']['health_score']}/100, P/E {res['fundamental']['pe_ratio']}")
                st.markdown(f"**3. Sentiment Agent**: Polarity {res['sentiment']['overall_sentiment']} (+{res['sentiment']['average_score']})")
                st.markdown(f"**4. Opportunity Screener**: Score {res['opportunity']['opportunity_score']}/100 ({res['opportunity']['signal_type']})")
                st.markdown(f"**5. Machine Learning Prediction**: 5-Day Target ₹{res['prediction']['projected_target']} ({res['prediction']['expected_direction']})")
            with ag_c2:
                st.markdown(f"**6. Risk Agent**: Risk Score {res['risk']['composite_risk_score']}/100, Stop Loss ₹{res['risk']['suggested_stop_loss']}")
                st.markdown(f"**7. Position Sizing Agent**: Sized Units {res['risk']['max_position_units']} Shares")
                st.markdown(f"**8. Portfolio Allocation Agent**: Diversification Index 82.5/100")
                st.markdown(f"**9. Decision Arbiter Agent**: Consensus Vector 0.78 (Strong Conviction)")
                st.markdown(f"**10. Performance Monitor Agent**: Paper Desk Win Rate 64.2%")


# ------------------------------------------------------------------------------
# TAB 6: STRATEGY BACKTESTING LAB
# ------------------------------------------------------------------------------
elif main_tab == "🧪 Strategy Backtesting":
    st.markdown("### 🧪 Historical Strategy Backtesting Lab")
    b_strat = st.selectbox("Strategy Architecture", ["Moving Average Crossover (20/50)", "RSI Momentum Mean-Reversion", "MACD Signal Crossover", "Combined Multi-Indicator"])
    b_sym = st.selectbox("Select Backtest Asset", [a["symbol"] for a in SUPPORTED_ASSETS])

    if st.button("Run Historical Backtest Simulation", use_container_width=True):
        res = BacktestService.run_backtest(strategy=b_strat, symbol=b_sym, initial_capital=100000.0, period_days=180)
        bk1, bk2, bk3 = st.columns(3)
        bk1.metric("Win Rate", f"{res['win_rate_pct']}%")
        bk2.metric("Max Drawdown", f"-{res['max_drawdown_pct']}%")
        bk3.metric("Profit Factor", f"{res['profit_factor']}")

        eq_df = pd.DataFrame(res["equity_curve"])
        if not eq_df.empty:
            fig_eq = go.Figure(go.Scatter(x=eq_df["date"], y=eq_df["equity"], name="Equity Curve", line=dict(color="#00d09c", width=2.5)))
            fig_eq.update_layout(template="plotly_dark", height=340, margin=dict(l=10, r=10, t=10, b=10), paper_bgcolor="#0b0e14", plot_bgcolor="#0b0e14")
            st.plotly_chart(fig_eq, use_container_width=True)


# ------------------------------------------------------------------------------
# TAB 7: GROWW DEMAT ACCOUNT / PROFILE
# ------------------------------------------------------------------------------
elif main_tab == "👤 Groww Account / Demat":
    st.markdown("### 👤 Groww Demat & Trading Profile")
    
    st.markdown(f"""
    <div class="groww-card">
        <div style="font-size:20px; font-weight:800; color:#00d09c;">{st.session_state.user_name}</div>
        <div style="font-size:12px; color:#94a3b8; font-family:monospace;">Demat Client ID: {st.session_state.demat_id} · Email: {st.session_state.user_email}</div>
        <div style="display:flex; gap:16px; margin-top:10px; font-size:12px; font-family:monospace;">
            <span style="color:#00d09c;">🟢 KYC Status: VERIFIED</span>
            <span style="color:#00d2ff;">🏦 Primary Bank: HDFC Bank (A/C: ****4102)</span>
            <span style="color:#f59e0b;">🛡️ Segment: NSE Equity + F&O + BSE</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    c_f1, c_f2 = st.columns(2)
    with c_f1:
        st.markdown("##### 💳 Deposit Paper Funds (Simulated UPI)")
        dep_amt = st.number_input("Amount to Add (₹)", min_value=1000.0, value=25000.0, step=5000.0)
        if st.button("Add Funds via Instant UPI", use_container_width=True):
            st.session_state.cash_balance += dep_amt
            st.success(f"₹{dep_amt:,.2f} added to your trading balance via UPI!")
            st.rerun()

    with c_f2:
        st.markdown("##### 🔄 Reset Paper Desk")
        if st.button("Reset Entire Portfolio & Funds to ₹1,00,000", use_container_width=True):
            st.session_state.cash_balance = 100000.00
            st.session_state.positions = []
            st.success("Paper desk reset.")
            st.rerun()


# ------------------------------------------------------------------------------
# TAB 8: ADMIN COMMAND CENTER (RESTRICTED TO ADMIN ROLE)
# ------------------------------------------------------------------------------
elif main_tab == "👑 Admin Command Center":
    st.markdown("### 👑 TradeMind Administrator Command Center")
    if st.session_state.user_role != "admin":
        st.error("Access Denied: Only users with Administrator role can access this terminal.")
        st.stop()

    adm1, adm2, adm3, adm4 = st.columns(4)
    adm1.metric("Registered Demat Users", "1,248")
    adm2.metric("Live Active Traders", "342")
    adm3.metric("Intraday Gross Turnover", "₹142.80 Cr")
    adm4.metric("Risk Engine Health", "100% Operational")

    st.markdown("##### 👥 Client Accounts & Margin Blotter")
    st.dataframe(pd.DataFrame([
        {"Client ID": "GROWW-9842", "Name": "Alpha Trader", "Email": "trader@groww.in", "Role": "customer", "Margin Balance": "₹125,000", "Risk Tier": "STANDARD", "Status": "ACTIVE"},
        {"Client ID": "GROWW-1102", "Name": "Sarah Viola", "Email": "sarah.v@hedgecorp.com", "Role": "customer", "Margin Balance": "₹450,000", "Risk Tier": "PRO_HEDGE", "Status": "ACTIVE"},
        {"Client ID": "GROWW-5501", "Name": "Daniel Kross", "Email": "daniel.k@quantfunds.org", "Role": "customer", "Margin Balance": "₹1,200,000", "Risk Tier": "INSTITUTIONAL", "Status": "ACTIVE"},
        {"Client ID": "GROWW-0001", "Name": "Abhi (System Administrator)", "Email": "forestnation08@gmail.com", "Role": "admin", "Margin Balance": "₹10,000,000", "Risk Tier": "SUPERADMIN", "Status": "ACTIVE"}
    ]), use_container_width=True)

    st.markdown("##### ⚡ System Controls & Circuit Limits")
    ac_c1, ac_c2 = st.columns(2)
    with ac_c1:
        st.success("🟢 Real-time Matching Engine: ONLINE")
        st.button("Broadcast System Circuit Halt to All Clients", use_container_width=True)
    with ac_c2:
        st.info("🛡️ Broker Risk Policy: STRICT PAPER REPLICATION")
        st.button("Force Re-calibrate Multi-Agent Models", use_container_width=True)
