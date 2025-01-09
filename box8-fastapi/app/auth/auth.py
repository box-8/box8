from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from uuid import uuid4

from app.models.user import User, UserLogin, UserInDB

# Configuration de la sécurité
SECRET_KEY = "votre_clé_secrète_très_longue_et_complexe"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuration du hachage des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuration du router
router = APIRouter()

# Base de données simulée (à remplacer par une vraie BD)
users_db = {
    "gael.jaunin@gmail.com": {
        "id": str(uuid4()),
        "username": "gaeljaunin",
        "email": "gael.jaunin@gmail.com",
        "hashed_password": pwd_context.hash("1234azerty"),
        "is_active": True
    },
    "test@gmail.com": {
        "id": str(uuid4()),
        "username": "testuser",
        "email": "test@gmail.com",
        "hashed_password": pwd_context.hash("password123"),
        "is_active": True
    }
}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe correspond au hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Génère un hash pour le mot de passe"""
    return pwd_context.hash(password)

def get_user(email: str) -> Optional[UserInDB]:
    """Récupère un utilisateur par son email"""
    if email in users_db:
        user_dict = users_db[email]
        return UserInDB(**user_dict)
    return None

def authenticate_user(email: str, password: str) -> Optional[User]:
    """Authentifie un utilisateur"""
    user = get_user(email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return User(
        id=user.id,
        email=user.email,
        username=user.username,
        is_active=user.is_active
    )

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

# Routes d'authentification
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
