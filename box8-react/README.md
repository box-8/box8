# Box8 Frontend (React)

Interface utilisateur de Box8 développée avec React, permettant la création et la gestion visuelle de workflows basés sur des agents.

*Dernière mise à jour : Janvier 2025*

## Architecture

```
box8-react/
├── public/              # Ressources statiques
│   ├── locales/        # Fichiers de traduction
│   └── assets/         # Images et icônes
├── src/
│   ├── components/     # Composants React
│   │   ├── agents/           # Composants liés aux agents
│   │   │   ├── AgentNode.js    # Nœud d'agent
│   │   │   └── AgentModal.js   # Configuration d'agent
│   │   ├── diagram/          # Composants du diagramme
│   │   │   ├── CustomEdge.js   # Connexions personnalisées
│   │   │   └── OutputNode.js   # Nœud de sortie
│   │   ├── modals/           # Fenêtres modales
│   │   │   ├── TaskModal.js    # Config. de tâche
│   │   │   ├── DiagramModal.js # Gestion diagrammes
│   │   │   └── ResponseModal.js # Affichage réponses
│   │   └── common/           # Composants partagés
│   ├── hooks/          # Custom hooks React
│   │   ├── useAuth.js       # Gestion auth
│   │   └── useTheme.js      # Gestion thème
│   ├── contexts/       # Contexts React
│   │   ├── AuthContext.js   # Context auth
│   │   └── ThemeContext.js  # Context thème
│   ├── services/       # Services API
│   ├── utils/          # Utilitaires
│   ├── styles/         # Styles CSS/SCSS
│   ├── App.js          # Composant principal
│   └── index.js        # Point d'entrée
└── package.json        # Dépendances
```

## Fonctionnalités

### Éditeur de Diagrammes
- Interface interactive avec React Flow 11
- Création et édition de nœuds d'agents
- Connexions personnalisées entre agents
- Disposition automatique des nœuds
- Zoom et navigation fluide
- Annulation/Rétablissement (Undo/Redo)
- Export PNG/SVG

### Gestion des Agents
- Configuration complète des agents :
  - Nom et rôle
  - Objectif et contexte
  - Histoire personnelle
  - Outils disponibles
  - Paramètres avancés
- Validation en temps réel
- Templates prédéfinis
- Import/Export de configurations

### Gestion des Workflows
- Sauvegarde/Chargement de diagrammes
- Exécution des workflows
- Visualisation temps réel
- Historique des exécutions
- Génération depuis descriptions
- Partage de workflows

### Interface Utilisateur
- Design responsive
- Mode sombre/clair
- Support multilingue (FR/EN)
- Thèmes personnalisables
- Raccourcis clavier
- Tour guidé pour nouveaux utilisateurs

### Nouvelles Fonctionnalités

#### Éditeur Avancé
- Suggestions intelligentes
- Auto-complétion des propriétés
- Validation en temps réel
- Templates personnalisables
- Historique des modifications
- Collaboration en temps réel

#### Visualisation
- Modes de visualisation multiples
- Statistiques d'exécution
- Graphiques de performance
- Timeline des événements
- Export de rapports

#### Intégrations
- Partage via SharePoint
- Export vers différents formats
- Intégration avec des outils externes
- API WebSocket pour temps réel
- SSO et authentification OAuth2

### Performance
- Code splitting par routes
- Prefetching intelligent
- Cache optimisé
- Service Worker pour offline
- Compression des assets
- Bundle size optimisé

## Dépendances Principales

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.8.0",
    "react-bootstrap": "^2.9.0",
    "js-cookie": "^3.0.5",
    "i18next": "^23.5.0",
    "react-i18next": "^13.2.0",
    "@mantine/core": "^7.0.0",
    "@mantine/hooks": "^7.0.0"
  }
}
```

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Créer un fichier `.env` :
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_VERSION=1.0.0
REACT_APP_DEFAULT_LANGUAGE=fr
```

## Scripts Disponibles

```bash
# Développement
npm start

# Build production
npm run build

# Tests
npm test
npm run test:coverage

# Linting
npm run lint
npm run lint:fix

# Analyse des bundles
npm run analyze
```

## Développement

### Structure des Composants
- Composants fonctionnels avec hooks
- Props typées avec PropTypes/TypeScript
- Memoization pour les performances
- Tests unitaires avec Jest/RTL
- Stories Storybook

### État Global
- Context API pour l'état partagé
- Custom hooks pour la logique réutilisable
- Gestion du cache avec SWR
- Persistance locale avec localStorage

### Styles
- CSS Modules pour l'isolation
- Variables CSS pour la personnalisation
- Support des thèmes
- Animations fluides
- Design system cohérent

## Bonnes Pratiques

### Performance
- Code splitting automatique
- Lazy loading des composants
- Optimisation des images
- Memoization des calculs coûteux
- Debouncing des événements

### Accessibilité
- Support ARIA
- Navigation au clavier
- Contraste suffisant
- Messages d'erreur clairs
- Support lecteur d'écran

### Tests
- Tests unitaires
- Tests d'intégration
- Tests end-to-end
- Tests de performance
- Tests d'accessibilité

## Déploiement

1. Build de production :
```bash
npm run build
```

2. Servir avec nginx :
```nginx
server {
    listen 80;
    root /var/www/box8-react/build;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/NewFeature`)
3. Commit les changements (`git commit -m 'Add NewFeature'`)
4. Push la branche (`git push origin feature/NewFeature`)
5. Ouvrir une Pull Request

## Licence

MIT - Voir LICENSE pour plus de détails.
