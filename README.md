# Box8

Box8 est une application de conception et d'exécution de workflows basée sur un système d'agents. Elle permet de créer, gérer et exécuter des diagrammes de flux de travail interactifs avec une interface graphique moderne.

*Dernière mise à jour : Janvier 2025*

## Fonctionnalités Principales

### Frontend (React)
- Interface de conception de diagrammes avec React Flow
- Création et édition de nœuds d'agents et de connexions
- Gestion des diagrammes (création, sauvegarde, chargement)
- Interface utilisateur avec modales pour :
  - Gestion des agents
  - Gestion des tâches
  - Gestion des diagrammes
  - Gestion des fichiers JSON
  - Authentification utilisateur
  - Profil utilisateur
- Visualisation des réponses et résultats en temps réel
- Support multi-langues (FR/EN)
- Mode sombre/clair
- Responsive design

### Backend (FastAPI)
- API RESTful sécurisée avec authentification JWT
- Gestion des diagrammes :
  - Listage des diagrammes disponibles
  - Récupération des diagrammes
  - Sauvegarde des diagrammes
  - Suppression des diagrammes
- Exécution des workflows avec CrewAI
- Gestion des fichiers utilisateurs
- Génération de diagrammes à partir de descriptions textuelles
- Support CORS pour l'intégration avec le frontend
- Cache Redis pour les performances
- Logging avancé

## Structure du Projet

```
box8/
├── box8-react/           # Frontend React
│   ├── src/
│   │   ├── components/   # Composants React
│   │   ├── hooks/       # Custom hooks
│   │   ├── contexts/    # Contexts React
│   │   ├── App.js       # Point d'entrée
│   │   └── App.css      # Styles
│   └── package.json
│
└── box8-fastapi/         # Backend FastAPI
    ├── app/
    │   ├── auth/         # Authentification
    │   ├── services/     # Services métier
    │   └── utils/        # Utilitaires
    ├── sharepoint/       # Stockage fichiers
    └── main.py          # Point d'entrée API
```

## Prérequis

- Node.js 18+ et npm pour le frontend React
- Python 3.11+ pour le backend FastAPI
- Redis 7+ pour le cache
- Dépendances React :
  - react 18.x
  - react-flow 11.x
  - react-bootstrap 2.x
  - js-cookie 3.x
- Dépendances Python :
  - fastapi 0.104+
  - uvicorn 0.24+
  - python-multipart
  - crewai 0.11+
  - redis-py 5.0+

## Installation

### Frontend (React)

```bash
cd box8-react
npm install
```

### Backend (FastAPI)

```bash
cd box8-fastapi
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Redis
```bash
# Windows (avec WSL2)
wsl
sudo service redis-server start

# Linux
sudo systemctl start redis
```

## Démarrage

### Frontend

```bash
cd box8-react
npm start
```
L'application sera accessible sur http://localhost:3000

### Backend

```bash
cd box8-fastapi
uvicorn main:app --reload
```
L'API sera accessible sur http://localhost:8000

## Documentation API

La documentation de l'API est automatiquement générée et accessible sur :
- Swagger UI : http://localhost:8000/docs
- ReDoc : http://localhost:8000/redoc

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.
