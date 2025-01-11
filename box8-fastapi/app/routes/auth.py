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

@router.post("/login")
async def login(response: Response, user_data: UserLogin):
    """Endpoint de login qui retourne un token JWT et crée une session"""
    user = authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=access_token_expires
    )

    # Définir le cookie de session
    response.set_cookie(
        key="session",
        value=access_token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False  # Mettre à True en production avec HTTPS
    )

    return {
        "authenticated": True,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "is_active": user["is_active"],
            "is_admin": user["is_admin"]
        }
    }

@router.post("/logout")
async def logout(response: Response):
    """Endpoint de déconnexion qui supprime la session"""
    response.delete_cookie(key="session")
    return {"message": "Déconnecté avec succès"}

@router.get("/check-auth")
async def check_auth(session: Optional[str] = Cookie(None)):
    """Vérifie si l'utilisateur est authentifié via le cookie de session"""
    if not session:
        return {"authenticated": False}

    try:
        user = await get_current_user(session)
        if not user:
            return {"authenticated": False}

        return {
            "authenticated": True,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "username": user["username"],
                "is_active": user["is_active"],
                "is_admin": user["is_admin"]
            }
        }
    except HTTPException:
        return {"authenticated": False}

@router.get("/me")
async def read_users_me(session: Optional[str] = Cookie(None)):
    """Récupère les informations de l'utilisateur connecté"""
    user = await get_current_user(session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )

    return {
        "id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "is_active": user["is_active"],
        "is_admin": user["is_admin"]
    }
