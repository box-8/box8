# Box8 Frontend - Guide des Composants

*Dernière mise à jour : Janvier 2025*

Ce document décrit les fonctionnalités et l'utilisation de chaque composant du frontend Box8.

## Composants de l'Interface

### 1. Composants de Diagramme

#### AgentNode.js
- Représentation visuelle d'un agent dans le diagramme
- Affichage du nom et du rôle de l'agent
- Indicateurs d'état (actif, en cours, terminé)
- Gestion des connexions entrantes/sortantes
- Menu contextuel pour les actions rapides
- Animation lors de l'exécution

#### CustomEdge.js
- Connexions personnalisées entre les nœuds
- Styles différents selon le type de connexion
- Indicateurs de flux de données
- Animation du flux d'informations
- Gestion des interactions (clic, survol)
- Support pour les chemins complexes

#### OutputNode.js
- Nœud de sortie pour les résultats
- Affichage formaté des données
- Support pour différents types de sortie
- Indicateurs de statut
- Prévisualisation des données

### 2. Modales

#### AgentModal.js
- Configuration complète des agents
- Paramètres :
  - Nom et description
  - Rôle et objectifs
  - Outils disponibles
  - Contexte et contraintes
- Validation en temps réel
- Templates prédéfinis
- Historique des modifications

#### DiagramModal.js & DiagramModalNew.js
- Gestion des diagrammes existants
- Création de nouveaux diagrammes
- Options de configuration :
  - Nom et description
  - Type de workflow
  - Paramètres d'exécution
- Importation/Exportation
- Versioning
- Prévisualisation

#### JsonFilesModal.js
- Gestionnaire de fichiers JSON
- Liste des fichiers disponibles
- Prévisualisation du contenu
- Actions :
  - Upload
  - Download
  - Suppression
  - Édition
- Validation du format
- Historique des modifications

#### LoadingModal.js
- Indicateur de chargement animé
- Messages de progression
- Estimation du temps restant
- Annulation possible
- Affichage des étapes en cours

#### LoginModal.js
- Interface de connexion
- Support multi-méthodes :
  - Email/Mot de passe
  - SSO
  - OAuth2
- Validation des champs
- Messages d'erreur contextuels
- Mode "Se souvenir de moi"
- Réinitialisation du mot de passe

#### ResponseModal.js
- Affichage des résultats d'exécution
- Formatage intelligent du contenu
- Filtres et recherche
- Export des résultats
- Historique des exécutions
- Métriques de performance

#### TaskModal.js
- Configuration des tâches
- Paramètres :
  - Description
  - Priorité
  - Dépendances
  - Contraintes temporelles
- Validation des entrées
- Suggestions contextuelles
- Prévisualisation

#### UserProfileModal.js
- Gestion du profil utilisateur
- Informations personnelles
- Préférences :
  - Thème
  - Langue
  - Notifications
- Historique d'activité
- Gestion des API keys
- Paramètres de sécurité

### 3. Éléments d'Interface

#### FloatingButtons.js
- Boutons d'action flottants
- Menu contextuel
- Actions rapides :
  - Nouveau diagramme
  - Sauvegarde
  - Exécution
  - Aide
- Adaptation responsive
- Personnalisation des raccourcis

## Interactions entre Composants

### Flux de Données
1. Les `AgentNode` communiquent via `CustomEdge`
2. Les résultats sont affichés dans `OutputNode`
3. Les modales se coordonnent pour la configuration
4. `FloatingButtons` contrôle les actions globales

### États Partagés
- Contexte d'authentification
- État du diagramme actif
- Configuration globale
- Préférences utilisateur
- Cache des données

### Événements
- Mise à jour en temps réel
- Notifications push
- Websockets pour les updates
- Synchronisation multi-onglets
- Gestion des erreurs

## Personnalisation

### Thèmes
- Mode clair/sombre
- Couleurs personnalisables
- Styles des composants
- Animations configurables
- Polices adaptables

### Accessibilité
- Support ARIA
- Navigation clavier
- Contraste configurable
- Taille de texte adaptative
- Messages d'aide contextuels

### Internationalisation
- Support multi-langues
- Formats de date/heure
- Unités localisées
- Messages traduits
- RTL support

## Performance

### Optimisations
- Code splitting
- Lazy loading
- Memoization
- Cache intelligent
- Compression des données

### Monitoring
- Métriques de performance
- Logging des erreurs
- Analytics utilisateur
- Diagnostics en temps réel
- Rapports de performance
