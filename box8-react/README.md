# Box8 Frontend (React)

Interface utilisateur de Box8 développée avec React, permettant la création et la gestion visuelle de workflows basés sur des agents.

## Architecture

```
box8-react/
├── public/              # Ressources statiques
├── src/
│   ├── components/     # Composants React
│   │   ├── AgentNode.js       # Nœud d'agent dans le diagramme
│   │   ├── OutputNode.js      # Nœud de sortie dans le diagramme
│   │   ├── CustomEdge.js      # Connexion personnalisée entre les nœuds
│   │   ├── AgentModal.js      # Modal de configuration d'agent
│   │   ├── TaskModal.js       # Modal de configuration de tâche
│   │   ├── DiagramModal.js    # Modal de gestion des diagrammes
│   │   ├── DiagramModalNew.js # Modal de création de diagramme
│   │   ├── ResponseModal.js   # Modal d'affichage des réponses
│   │   ├── JsonFilesModal.js  # Modal de gestion des fichiers JSON
│   │   ├── LoginModal.js      # Modal de connexion
│   │   ├── UserProfileModal.js # Modal de profil utilisateur
│   │   └── FloatingButtons.js # Boutons flottants d'actions
│   ├── App.js          # Composant principal
│   ├── App.css         # Styles principaux
│   └── index.js        # Point d'entrée
└── package.json        # Dépendances et scripts
```

## Fonctionnalités

### Éditeur de Diagrammes
- Interface interactive basée sur React Flow
- Création et édition de nœuds d'agents
- Connexions personnalisées entre les agents
- Disposition automatique des nœuds
- Zoom et navigation dans le diagramme

### Gestion des Agents
- Configuration des propriétés des agents :
  - Nom et rôle
  - Objectif
  - Histoire personnelle
  - Outils disponibles
- Validation des configurations

### Gestion des Workflows
- Sauvegarde et chargement des diagrammes
- Exécution des workflows
- Visualisation des résultats
- Génération de diagrammes depuis des descriptions textuelles

### Authentification et Profil
- Connexion/Déconnexion utilisateur
- Gestion du profil utilisateur
- Sessions persistantes avec cookies

## Dépendances Principales

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "reactflow": "^11.x",
    "react-bootstrap": "^2.x",
    "js-cookie": "^3.x"
  }
}
```

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Créer un fichier `.env` à la racine :
```env
REACT_APP_API_URL=http://localhost:8000
```

## Scripts Disponibles

```bash
# Démarrage en mode développement
npm start

# Build de production
npm run build

# Lancement des tests
npm test
```

## Utilisation

### Création d'un Diagramme
1. Cliquer sur le bouton "Nouveau Diagramme"
2. Ajouter des agents en utilisant le menu flottant
3. Configurer chaque agent via le modal de configuration
4. Connecter les agents en glissant-déposant entre les points de connexion
5. Sauvegarder le diagramme

### Exécution d'un Workflow
1. Charger un diagramme existant
2. Cliquer sur le bouton "Exécuter"
3. Suivre l'avancement dans le modal de réponse

## Développement

### Structure des Composants
- Composants sans état pour l'UI
- Hooks React pour la gestion d'état
- Context API pour l'état global
- Gestion des événements avec React Flow

### Bonnes Pratiques
- Composants modulaires et réutilisables
- Gestion des états avec hooks personnalisés
- Validation des props avec PropTypes
- Gestion des erreurs et retours utilisateur

## Communication avec le Backend

- Appels API RESTful
- Gestion des tokens d'authentification
- Validation des données
- Gestion des erreurs réseau
