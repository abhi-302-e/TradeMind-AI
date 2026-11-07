from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.models import User, Portfolio
from backend.schemas.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse
from backend.services.auth_service import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role="trader"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Automatically create a default paper portfolio with 100,000 INR
    portfolio = Portfolio(
        user_id=new_user.id,
        name=f"{new_user.name}'s Paper Portfolio",
        cash_balance=100000.0,
        initial_balance=100000.0
    )
    db.add(portfolio)
    db.commit()

    token = create_access_token({"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})
    return TokenResponse(
        access_token=token,
        user_id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role
    )

@router.post("/login", response_model=TokenResponse)
def login(user_in: UserLoginRequest, db: Session = Depends(get_db)):
    # Built-in Admin Account Provisioning
    if user_in.email.strip().lower() == "forestnation08@gmail.com" and user_in.password == "Abhi@302":
        admin_user = db.query(User).filter(User.email == "forestnation08@gmail.com").first()
        if not admin_user:
            admin_user = User(
                name="Abhi (System Administrator)",
                email="forestnation08@gmail.com",
                password_hash=get_password_hash("Abhi@302"),
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        token = create_access_token({"sub": str(admin_user.id), "email": admin_user.email, "role": "admin"})
        return TokenResponse(
            access_token=token,
            user_id=admin_user.id,
            name=admin_user.name,
            email=admin_user.email,
            role="admin"
        )

    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role
    )

