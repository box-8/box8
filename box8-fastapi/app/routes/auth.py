from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Optional
from jose import JWTError, jwt
from uuid import uuid4

from app.models.user import User, UserLogin, UserRegistration
from app.auth.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    SECRET_KEY,
    ALGORITHM,
    invalidate_token,
    get_password_hash
)
from app.database.database import create_user, check_user_exists

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

@router.post("/register")
async def register(user_data: UserRegistration):
    """Endpoint d'enregistrement d'un nouvel utilisateur"""
    print(f"Tentative d'inscription - Email: {user_data.email}, Username: {user_data.username}")  # Log
    
    # Vérifier si l'utilisateur existe déjà
    exists, error_message = check_user_exists(user_data.email, user_data.username)
    print(f"Résultat de la vérification - Existe: {exists}, Message: {error_message}")  # Log
    
    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )

    # Créer le nouvel utilisateur
    hashed_password = get_password_hash(user_data.password)
    new_user = {
        "id": str(uuid4()),
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hashed_password,
        "is_active": True,
        "is_admin": False
    }

    try:
        print("Tentative de création de l'utilisateur dans la base de données")  # Log
        create_user(new_user)
        print("Utilisateur créé avec succès")  # Log
        return {
            "id": new_user["id"],
            "email": new_user["email"],
            "username": new_user["username"],
            "is_active": new_user["is_active"],
            "is_admin": new_user["is_admin"]
        }
    except Exception as e:
        print(f"Erreur lors de la création de l'utilisateur: {str(e)}")  # Log
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création de l'utilisateur"
        )

@router.post("/logout")
async def logout(response: Response, session: Optional[str] = Cookie(None)):
    """Endpoint de déconnexion qui supprime la session"""
    if session:
        # Invalider le token en l'ajoutant à la blacklist
        invalidate_token(session)
    
    # Supprimer le cookie
    response.delete_cookie(
        key="session",
        httponly=True,
        samesite="lax",
        secure=False  # Mettre à True en production avec HTTPS
    )
    
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
