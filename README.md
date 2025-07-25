# 🏋️ Ici Ça Pousse - Application de Fitness Gamifiée

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7.0-orange.svg)](https://firebase.google.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](https://jestjs.io/)
[![Coverage](https://img.shields.io/badge/coverage-86%25-brightgreen)](https://jestjs.io/)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)

## 🌐 Application en ligne

**[ici-ca-pousse.vercel.app](https://ici-ca-pousse.vercel.app)**

Application moderne de suivi de séances de sport avec gamification avancée et fonctionnalités sociales complètes.

## 🚀 Fonctionnalités

### 🎮 Gamification Avancée
- **Système de niveaux et XP** : Progression basée sur la durée, variété d'exercices et streaks
- **Streak animé** : Compteur de jours consécutifs avec bonus XP
- **Badges et réalisations** : Débloquez des badges pour vos exploits
- **Leaderboard dynamique** : Classement entre amis selon différents critères

### 🔐 Authentification & Profil
- **Connexion Google** : Authentification rapide et sécurisée
- **Gestion du profil** : Photo, pseudo et badge sélectionné
- **Notifications en temps réel** : Suivi des invitations et rappels

### 👥 Social & Défis
- **Système d'amis** : Ajoutez, gérez vos connexions
- **Défis personnalisés** : Lancez des challenges à vos amis
- **Notifications intelligentes** : Rappels et félicitations automatiques
- **Profils enrichis** : Photos de profil, statistiques détaillées

### 📊 Analytics & Progression
- **Système de suivi du poids** : Enregistrez votre poids chaque semaine, visualisez votre évolution sur une courbe dédiée, recevez un rappel intelligent pour ne rien oublier.
- **Statistiques avancées** : Graphiques, comparaisons, historique
- **Courbe d'évolution du poids** : Suivi visuel de votre poids semaine par semaine, affichée en haut de la page Statistiques
- **Notification hebdomadaire** : Rappel automatique chaque début de semaine pour mettre à jour votre poids (avec option 'C'est le même')
- **Suivi des performances** : Records personnels, tendances
- **Calendrier interactif** : Vue d'ensemble de vos séances
- **Export de données** : Sauvegarde de vos progrès

### 🌐 Internationalisation
- **Français / Anglais** : Interface disponible dans deux langues
- **Formatage localisé** : Dates et unités adaptées automatiquement

### 📱 PWA & Mobile-First
- **Header ultra-compact** : Nouveau header moderne, mobile-first, avec titre à gauche et navigation optimisée
- **Application installable** : Fonctionne hors ligne
- **Design responsive** : Optimisé mobile et desktop
- **Performance optimisée** : Chargement rapide, animations fluides
- **Accessibilité** : Compatible avec les lecteurs d'écran
- **Mode sombre global** : Commutation instantanée clair/sombre
- **Notifications push** : Restez informé même hors de l'application

### 🤖 Chatbot IA
- **Coach virtuel** : Le chatbot fonctionne en développement et répond à toutes vos questions (sport, motivation, nutrition, bien-être, etc.).
- **Contexte personnalisé** : L'IA prend en compte vos dernières séances, votre taille et votre poids pour adapter ses réponses.
- **Accès aux données utilisateur** : Le chatbot utilise vos informations de profil (taille, poids) pour des conseils personnalisés.
- **Interface unifiée** : Plus de mode "libre" ou "recommandation" à choisir, tout se fait dans la même interface de chat.
- **Mode sombre** : Interface adaptée aux thèmes clairs et foncés
- **Tests dédiés** : Scénarios vérifiant le comportement du chatbot (envoi de message, gestion du contexte, API key, interface unifiée)

**Exemples d'utilisation :**
- "Comment améliorer ma récupération après l'entraînement ?"
- "Peux-tu me donner une recette saine ?"
- "J'ai du mal à rester motivé, des conseils ?"
- "Explique-moi la différence entre cardio et musculation."
- "Quels sont les bienfaits de la méditation ?"

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend - React 18"
        A[App.js] --> B[Context API]
        B --> C[useAppState]
        B --> D[useWorkouts]
        B --> E[useExperience]
        B --> F[useFriends]
        
        A --> G[Components]
        G --> H[Header]
        G --> I[Navigation]
        G --> J[WorkoutList]
        G --> K[CalendarView]
        G --> L[StatsView]
    end
    
    subgraph "Backend - Firebase"
        M[Authentication] --> N[Google Auth]
        O[Firestore] --> P[Workouts]
        O --> Q[Users]
        O --> R[Friends]
        O --> S[Challenges]
        T[Storage] --> U[Profile Pictures]
    end
    
    subgraph "External Services"
        V[Vercel] --> W[Deployment]
        X[GitHub Actions] --> Y[CI/CD]
    end
    
    A -.-> M
    A -.-> O
    A -.-> T
    V --> A
```

### 📁 Structure du Projet

```
src/
├── components/
│   ├── common/           # Composants réutilisables
│   ├── features/         # Fonctionnalités métier
│   │   ├── auth/
│   │   ├── workout/
│   │   ├── badges/
│   │   ├── challenges/
│   │   ├── leaderboard/
│   │   ├── profile/
│   │   └── stats/
│   └── layout/           # Composants de mise en page
├── hooks/                # Hooks personnalisés
├── utils/                # Utilitaires
├── constants/            # Constantes
└── App.js               # Point d'entrée
```

## 🛠️ Installation & Développement

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Firebase

### Installation

```bash
# Cloner le projet
git clone https://github.com/bryannakache/ici-ca-pousse.git
cd ici-ca-pousse

# Installer les dépendances
npm install

# Démarrer en mode développement
npm start
```

### Scripts disponibles

```bash
npm start          # Démarre le serveur de développement
npm run build      # Build de production
npm test           # Lance les tests
npm run test:coverage  # Tests avec couverture
npm run lint       # Vérification du code
npm run format     # Formatage automatique
```

## 🔥 Configuration Firebase

### 1. Créer un projet Firebase
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet "ici-ca-pousse"
3. Activez l'authentification Google
4. Créez une base de données Firestore
5. Activez Firebase Storage

### 2. Variables d'environnement
Créez un fichier `.env.local` :

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

### 3. Règles Firestore
Dans Firebase Console > Firestore Database > Rules :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Workouts - utilisateur peut lire/écrire ses propres données
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == resource.data.userId;
    }
    
    // Users - lecture publique, écriture propriétaire
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.auth.uid == userId;
    }
    
    // Friends - lecture/écriture pour utilisateurs connectés
    match /friends/{friendId} {
      allow read, write: if request.auth != null;
    }
    
    // Challenges - lecture/écriture pour utilisateurs connectés
    match /challenges/{challengeId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Règles Storage
Dans Firebase Console > Storage > Rules :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Photos de profil
    match /profile-pictures/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // 5MB max
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Règles par défaut - refuser tout le reste
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. Fichiers de configuration Firebase
Le projet contient plusieurs fichiers de configuration Firebase utiles :

- **`firebase-storage-rules.txt`** : Règles Storage complètes pour les photos de profil
- **`firebase-firestore-rules-default.txt`** : Règles Firestore par défaut (accès complet)
- **`firebase-storage-rules-default.txt`** : Règles Storage par défaut (accès complet)
- **`FIREBASE_SETUP.md`** : Guide détaillé de configuration Firebase
- **`REFACTORING_NOTES.md`** : Notes sur l'architecture et les refactorings
- **`ARCHITECTURE.md`** : Documentation de l'architecture du projet

**⚠️ Note** : Les fichiers `*-default.txt` contiennent des règles moins sécurisées pour le développement. Utilisez les règles sécurisées en production.

## 🚀 Déploiement

### Déploiement automatique (recommandé)
1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement dans Vercel
3. Déploiement automatique à chaque push

### Déploiement manuel
```bash
npm run build
# Uploadez le dossier build/ sur votre hébergeur
```

## 🧪 Tests

> **Couverture actuelle :**
> - **Statements** : 86.21%
> - **Branches** : 60.89%
> - **Functions** : 93.04%
> - **Lines** : 90.39%

### Suite de Tests Complète
Le projet dispose d'une suite de tests moderne et extensible :

- **Tests de hooks** :
  - `useAppState` (gestion d'état global, 100% couvert)
  - `useExercises` (gestion des exercices, ajout/suppression/édition)
  - `useChatGPT` (intégration API OpenAI, gestion des messages, contexte, erreurs)
- **Tests de composants** :
  - `Chatbot` (envoi de messages, gestion du contexte personnalisé, API key, interface unifiée, mode sombre)
- **Tests utilitaires** :
  - `workoutUtils` (calculs, analyse, formatage, badges)
  - `leaderboardUtils` (classements, stats, labels)

**Nouveau** :
- Le Chatbot a été mis à jour pour accepter toutes les questions dans une interface unique, et les tests vérifient ce comportement (interface, contexte, gestion des erreurs, personnalisation).

### Lancement des tests
```bash
# Tests unitaires et d'intégration
npm test

# Tests avec couverture
npm run test:coverage
```

### Structure des Tests
```
src/tests/
├── hooks/           # Tests des hooks personnalisés
│   ├── useAppState.test.js
│   ├── useExercises.test.js
│   └── useChatGPT.test.js
├── components/      # Tests des composants
│   └── Chatbot.test.js
└── utils/           # Tests des utilitaires
    ├── workoutUtils.test.js
    └── leaderboardUtils.test.js
```

### Couverture détaillée
- **Statements** : 86.21%
- **Branches** : 60.89%
- **Functions** : 93.04%
- **Lines** : 90.39%

**Note** : La couverture a été augmentée grâce à la refonte de la suite de tests et à l'ajout de tests complets pour le chatbot et les hooks principaux.

## 📈 Roadmap 2025

### ✅ Complété
- [x] Système de niveaux, XP et progression
- [x] Streak animé avec bonus
- [x] Leaderboard dynamique entre amis
- [x] Badges, réalisations et photos de profil
- [x] Défis entre amis et notifications intelligentes
- [x] PWA installable et design mobile-first
- [x] Header ultra-compact et moderne
- [x] Suite de tests complète (100% sur useAppState)
- [x] Chatbot IA (fonctionnel en développement, accès aux données utilisateur, interface unifiée, conseils personnalisés)
- [x] Système de suivi du poids (courbe d'évolution, notification hebdomadaire intelligente)

### 🚧 En développement
- [ ] Recommandations d'exercices intelligentes
- [ ] Analyse de performance avancée
- [ ] Intégration wearables (Apple Watch, Fitbit)

### 📋 Planifié
- [ ] Thèmes personnalisables
- [ ] Export/import de données (poids, séances, etc.)
- [ ] Analyse avancée du poids (tendances, alertes, objectifs)
- [ ] Suggestions IA ultra-personnalisées (nutrition, récupération, etc.)
- [ ] Mode compétition avancé
- [ ] Réseau social enrichi

## 🔧 Dépannage

### Erreurs Firebase
- **Erreur 404 Storage** : Firebase Storage non activé
- **Erreur CORS** : Règles de sécurité incorrectes
- **Erreur d'autorisation** : Utilisateur non connecté
- **Erreur de quota** : Limite de stockage atteinte

### Erreurs courantes
- **Photos de profil** : Vérifiez la configuration Storage
- **Authentification** : Vérifiez les variables d'environnement
- **Synchronisation** : Vérifiez les règles Firestore
- **Performance** : Vérifiez la taille des images uploadées

### Support
- **Issues** : [GitHub Issues](https://github.com/bryannakache/ici-ca-pousse/issues)
- **Documentation** : [Wiki du projet](https://github.com/bryannakache/ici-ca-pousse/wiki)

## 🤝 Contribution

### Comment contribuer
1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Standards de code
- **ESLint** : Configuration standard React
- **Prettier** : Formatage automatique
- **Tests** : Minimum 80% de couverture
- **Commits** : Convention Conventional Commits

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Développeur

- **Développeur Full-Stack** : [Bryan Nakache](https://github.com/bryannakache)
- **Technologies** : React, Firebase, PWA, Gamification
- **Focus** : UX/UI, Performance, Tests

