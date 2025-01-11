from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.admin import router as admin_router
from .routes.auth import router as auth_router
from .database.database import init_db

app = FastAPI()

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialisation de la base de données
init_db()

# Inclusion des routes
app.include_router(auth_router, prefix="/auth", tags=["auth"])  # Routes d'authentification
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])  # Routes d'administration
