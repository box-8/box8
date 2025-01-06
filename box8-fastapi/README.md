# Box8 Backend (FastAPI)

Backend de l'application Box8 développé avec FastAPI, fournissant une API RESTful pour la gestion des workflows et des agents.

## Architecture

```
box8-fastapi/
├── app/
│   ├── auth/              # Authentification et gestion des utilisateurs
│   │   ├── auth.py       # Routes et logique d'authentification
│   │   └── models.py     # Modèles d'authentification
│   └── services/         # Services métier
│       └── diagram_service.py  # Service de gestion des diagrammes
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

### Gestion des Diagrammes
- `GET /designer/list-json-files` : Liste tous les diagrammes disponibles
- `GET /designer/get-diagram/{filename}` : Récupère un diagramme spécifique
- `POST /designer/save-diagram` : Sauvegarde un nouveau diagramme
- `DELETE /designer/delete-diagram/{filename}` : Supprime un diagramme
- `POST /designer/launch-crewai` : Exécute un workflow avec CrewAI
- `POST /designer/generate-diagram` : Génère un diagramme depuis une description

### Gestion des Fichiers Utilisateur
- `GET /user-files` : Liste les fichiers de l'utilisateur
- `POST /upload-file` : Upload un nouveau fichier
- `DELETE /delete-file/{filename}` : Supprime un fichier utilisateur

## Configuration

### Variables d'Environnement
```env
SECRET_KEY=votre_clé_secrète
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### CORS
L'API est configurée pour accepter les requêtes de :
- http://localhost:3000 (Frontend React)
- http://127.0.0.1:3000

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

## Démarrage

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Documentation API

- Swagger UI : http://localhost:8000/docs
- ReDoc : http://localhost:8000/redoc

## Modèles de Données

### DiagramData
```python
class DiagramData(BaseModel):
    name: str
    diagram: str
```

### DiagramDescription
```python
class DiagramDescription(BaseModel):
    name: str
    description: str
```

## Sécurité

- Authentification basée sur JWT (JSON Web Tokens)
- Support des cookies sécurisés
- Middleware CORS configuré
- Validation des données avec Pydantic
