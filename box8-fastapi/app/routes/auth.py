from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Optional
from jose import JWTError, jwt

from app.models.user import User, UserLogin
from app.auth.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    SECRET_KEY,
    ALGORITHM
)

# Configuration du router
router = APIRouter()

def get_user_from_token(token: str) -> Optional[User]:
    """Récupère l'utilisateur à partir d'un token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        user_db = get_user(email)
        if user_db is None:
            return None
        return User(
            id=user_db.id,
            email=user_db.email,
            username=user_db.username,
            is_active=user_db.is_active
        )
    except JWTError:
        return None

@router.get("/auth/check-auth/")
async def check_auth(session: Optional[str] = Cookie(None)):
    """Vérifie si l'utilisateur est authentifié via le cookie de session"""
    if not session:
        return {"authenticated": False}
    
    user = get_user_from_token(session)
    if not user:
        return {"authenticated": False}
    
    return {
        "authenticated": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_active": user.is_active
        }
    }

@router.post("/auth/login/")
async def login(response: Response, user_data: UserLogin):
    """Endpoint de login qui retourne un token JWT et crée une session"""
    user = authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Définir le cookie de session
    response.set_cookie(
        key="session",
        value=access_token,
        httponly=True,
        secure=False,  # Mettre à True en production avec HTTPS
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return {
        "authenticated": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_active": user.is_active
        }
    }

@router.post("/auth/logout/")
async def logout(response: Response):
    """Endpoint de déconnexion qui supprime la session"""
    response.delete_cookie(key="session")
    return {"authenticated": False}

@router.get("/auth/me/")
async def read_users_me(session: Optional[str] = Cookie(None)):
    """Récupère les informations de l'utilisateur connecté"""
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    user = get_user_from_token(session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session invalide"
        )
    
    return user
