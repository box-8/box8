# Box8

Box8 est une application de conception et d'exécution de workflows basée sur un système d'agents. Elle permet de créer, gérer et exécuter des diagrammes de flux de travail interactifs avec une interface graphique moderne.

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
- Visualisation des réponses et résultats

### Backend (FastAPI)
- API RESTful sécurisée avec authentification
- Gestion des diagrammes :
  - Listage des diagrammes disponibles
  - Récupération des diagrammes
  - Sauvegarde des diagrammes
  - Suppression des diagrammes
- Exécution des workflows avec CrewAI
- Gestion des fichiers utilisateurs
- Génération de diagrammes à partir de descriptions textuelles
- Support CORS pour l'intégration avec le frontend

## Structure du Projet

```
box8/
├── box8-react/           # Frontend React
│   ├── src/
│   │   ├── components/   # Composants React (AgentNode, OutputNode, etc.)
│   │   ├── App.js        # Point d'entrée de l'application
│   │   └── App.css       # Styles de l'application
│   └── package.json
│
└── box8-fastapi/         # Backend FastAPI
    ├── app/
    │   ├── auth/         # Gestion de l'authentification
    │   └── services/     # Services métier
    ├── sharepoint/       # Stockage des fichiers utilisateurs
    └── main.py          # Point d'entrée de l'API
```

## Prérequis

- Node.js et npm pour le frontend React
- Python 3.8+ pour le backend FastAPI
- Dépendances React :
  - react-flow
  - react-bootstrap
  - js-cookie
- Dépendances Python :
  - fastapi
  - uvicorn
  - python-multipart
  - crewai

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

La documentation de l'API est automatiquement générée par FastAPI et accessible sur :
- Swagger UI : http://localhost:8000/docs
- ReDoc : http://localhost:8000/redoc
