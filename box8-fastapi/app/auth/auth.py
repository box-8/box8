from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from uuid import uuid4

from app.models.user import User, UserLogin, UserInDB, UserRegistration
from app.database.database import (
    get_user_by_email,
    create_user,
    check_user_exists,
    init_db
)

# Configuration de la sécurité
SECRET_KEY = "votre_clé_secrète_très_longue_et_complexe"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Liste des tokens invalidés (blacklist)
invalidated_tokens = set()

# Configuration du hachage des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuration du router
router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe correspond au hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Génère un hash pour le mot de passe"""
    return pwd_context.hash(password)

def get_user(email: str) -> Optional[dict]:
    """Récupère un utilisateur par son email"""
    return get_user_by_email(email)

def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Authentifie un utilisateur"""
    user = get_user(email)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crée un token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(session: Optional[str] = Cookie(None)) -> Optional[dict]:
    """Récupère l'utilisateur actuellement connecté à partir du cookie de session"""
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    try:
        payload = jwt.decode(session, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide"
            )
        user = get_user(email)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur non trouvé"
            )
        return user
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )

@router.post("/register", response_model=User)
async def register(user_data: UserRegistration):
    """Enregistre un nouvel utilisateur"""
    # Vérifie si l'utilisateur existe déjà
    exists, error_message = check_user_exists(user_data.email, user_data.username)
    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    # Crée le nouvel utilisateur
    new_user = {
        "id": str(uuid4()),
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": get_password_hash(user_data.password),
        "is_active": True,
        "is_admin": False
    }
    
    try:
        create_user(new_user)
        return User(**new_user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Impossible d'enregistrer l'utilisateur"
        )

@router.post("/login/")
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

    # Configuration du cookie de session
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

@router.post("/logout/")
async def logout(response: Response, session: Optional[str] = Cookie(None)):
    """Endpoint de déconnexion qui supprime la session"""
    if session:
        invalidated_tokens.add(session)
    
    response.delete_cookie(
        key="session",
        httponly=True,
        samesite="lax"
    )
    return {"authenticated": False}

@router.get("/check-auth/")
async def check_auth(response: Response, session: Optional[str] = Cookie(None)):
    """Vérifie si l'utilisateur est authentifié via le cookie de session"""
    if not session:
        return {"authenticated": False}

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

@router.get("/me/")
async def read_users_me(response: Response, session: Optional[str] = Cookie(None)):
    """Récupère les informations de l'utilisateur connecté"""
    user = await get_current_user(session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session invalide"
        )

    return {
        "id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "is_active": user["is_active"],
        "is_admin": user["is_admin"]
    }

# Initialisation de la base de données au démarrage
init_db()
