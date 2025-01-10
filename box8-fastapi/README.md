# Box8 Backend (FastAPI)

Backend de l'application Box8 développé avec FastAPI, fournissant une API RESTful pour la gestion des workflows et des agents.

*Dernière mise à jour : Janvier 2025*

## Architecture

```
box8-fastapi/
├── app/
│   ├── auth/              # Authentification et sécurité
│   │   ├── auth.py       # Routes et logique d'authentification
│   │   ├── models.py     # Modèles d'authentification
│   │   └── security.py   # Utilitaires de sécurité
│   ├── services/         # Services métier
│   │   ├── diagram_service.py  # Service diagrammes
│   │   ├── crewai_service.py   # Service CrewAI
│   │   └── cache_service.py    # Service Redis
│   └── utils/            # Utilitaires
│       ├── logger.py     # Configuration logging
│       └── validators.py # Validateurs personnalisés
├── sharepoint/           # Stockage des fichiers
│   ├── designer/        # Diagrammes partagés
│   └── [user_email]/    # Fichiers par utilisateur
└── main.py              # Point d'entrée de l'application
```

## Points d'API

### Authentification
- `POST /auth/login/` : Connexion utilisateur
- `POST /auth/logout/` : Déconnexion utilisateur
- `GET /auth/check-auth/` : Vérification de l'état d'authentification
- `POST /auth/refresh-token/` : Rafraîchissement du token JWT

### Gestion des Diagrammes
- `GET /designer/list-json-files` : Liste tous les diagrammes disponibles
- `GET /designer/get-diagram/{filename}` : Récupère un diagramme spécifique
- `POST /designer/save-diagram` : Sauvegarde un nouveau diagramme
- `DELETE /designer/delete-diagram/{filename}` : Supprime un diagramme
- `POST /designer/launch-crewai` : Exécute un workflow avec CrewAI
- `POST /designer/generate-diagram` : Génère un diagramme depuis une description
- `GET /designer/cached-diagrams` : Liste les diagrammes en cache

### Gestion des Fichiers Utilisateur
- `GET /user-files` : Liste les fichiers de l'utilisateur
- `POST /upload-file` : Upload un nouveau fichier
- `DELETE /delete-file/{filename}` : Supprime un fichier utilisateur
- `GET /download-file/{filename}` : Télécharge un fichier utilisateur

## Configuration

### Variables d'Environnement
```env
SECRET_KEY=votre_clé_secrète
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_HOST=localhost
REDIS_PORT=6379
LOG_LEVEL=INFO
```

### CORS
L'API est configurée pour accepter les requêtes de :
- http://localhost:3000 (Frontend React)
- http://127.0.0.1:3000
- https://box8.example.com (Production)

## Installation

1. Créer un environnement virtuel :
```bash
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

2. Installer les dépendances :
```bash
pip install -r requirements.txt
```

3. Configurer Redis :
```bash
# Windows (WSL2)
wsl
sudo service redis-server start

# Linux
sudo systemctl start redis
```

## Démarrage

```bash
# Développement
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Documentation API

- Swagger UI : http://localhost:8000/docs
- ReDoc : http://localhost:8000/redoc

## Modèles de Données

### DiagramData
```python
class DiagramData(BaseModel):
    name: str
    diagram: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    owner: str
```

### DiagramDescription
```python
class DiagramDescription(BaseModel):
    name: str
    description: str
    language: str = "fr"
    complexity: Optional[str] = "medium"
```

## Sécurité

- Authentification basée sur JWT (JSON Web Tokens)
- Support des cookies sécurisés avec SameSite
- Middleware CORS configuré
- Validation des données avec Pydantic
- Rate limiting par IP
- Protection CSRF
- Headers de sécurité (HSTS, X-Frame-Options, etc.)

## Performance

- Cache Redis pour les diagrammes fréquemment accédés
- Pagination des résultats
- Compression gzip
- Optimisation des requêtes avec asyncio
- Logging structuré avec rotation des fichiers

## Tests

```bash
# Lancer les tests unitaires
pytest tests/unit

# Lancer les tests d'intégration
pytest tests/integration

# Couverture des tests
pytest --cov=app tests/
```

## Contribution

Voir le fichier CONTRIBUTING.md à la racine du projet.
