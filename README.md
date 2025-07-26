# 🏋️ Ici Ça Pousse - Application de Fitness Gamifiée avec Coach IA

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7.0-orange.svg)](https://firebase.google.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](https://jestjs.io/)
[![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)](https://jestjs.io/)
[![Linting](https://img.shields.io/badge/ESLint-Clean-brightgreen.svg)](https://eslint.org/)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)
[![Analytics](https://img.shields.io/badge/Analytics-Vercel-blue.svg)](https://vercel.com/analytics)
[![Speed Insights](https://img.shields.io/badge/Speed%20Insights-Vercel-green.svg)](https://vercel.com/speed-insights)
[![AI Coach](https://img.shields.io/badge/AI%20Coach-OpenAI-purple.svg)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/bryannakache/ici-ca-pousse/graphs/commit-activity)

## 🌐 Application en ligne

**[ici-ca-pousse.vercel.app](https://ici-ca-pousse.vercel.app)**

Application moderne de suivi de séances de sport avec gamification avancée, fonctionnalités sociales complètes et **Coach IA intelligent** qui analyse votre historique pour proposer des recommandations personnalisées.

## ⚡ Quick Start

```bash
# Cloner le projet
git clone https://github.com/bryannakache/ici-ca-pousse.git
cd ici-ca-pousse

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Firebase et OpenAI

# Démarrer en mode développement
npm start
```

**🚀 En 5 minutes, vous aurez :**
- ✅ Application fonctionnelle avec authentification Google
- ✅ Coach IA intelligent pour vos séances
- ✅ Système de gamification complet
- ✅ Interface mobile-first responsive

## 🚀 Fonctionnalités

### 🧠 Coach Lex IA - Assistant Personnel Intelligent

#### 🎯 **Recommandations d'exercices intelligentes**
- **Analyse de l'historique** : Le coach analyse vos 5 dernières séances
- **Détection des groupes sous-traités** : Identifie automatiquement les muscles peu travaillés
- **Évitement des répétitions** : Évite les exercices récents (2 dernières séances)
- **Adaptation au type de séance** : Filtre selon cardio/HIIT/abdos/etc.
- **Attribution correcte des groupes musculaires** : Plus d'exercices marqués comme "custom"

#### 🏋️ **Génération automatique de séances personnalisées**
- **Bouton "Propose-moi une séance"** : Séances adaptées à votre niveau
- **Types de séances** : Full body, Haut/Bas du corps, Push/Pull, Cardio, Abdos, HIIT, Mobilité
- **Niveaux d'intensité** : Facile, Moyen, Difficile
- **Exercices en français** : Tous les exercices traduits (Mountain climbers → Grimpeur)
- **4-6 exercices** : Sélection intelligente basée sur votre historique
- **3-4 séries** : Configuration automatique selon l'intensité

#### 📊 **Analyse intelligente des séances**
- **Bouton "Récap des dernières séances"** : Analyse détaillée de vos 3 dernières séances
- **Affichage des groupes musculaires** : Chaque exercice avec son groupe associé
- **Analyse de régularité** : Détection des jours depuis la dernière séance
- **Recommandations personnalisées** : Conseils adaptés à votre progression
- **Équilibre musculaire** : Identification des groupes négligés

#### 📈 **Analyse de progression avancée**
- **Bouton "📈 Progression"** : Analyse détaillée de votre évolution
- **Progression des poids** : Suivi des charges par exercice sur 4 semaines
- **Analyse des performances** : Tendances, améliorations, points d'attention
- **Recommandations ciblées** : Conseils basés sur vos données réelles
- **Visualisation des progrès** : Graphiques et statistiques détaillées

#### 🧠 **Recommandations IA personnalisées**
- **Bouton "Recommandations IA"** : Analyse complète de votre profil
- **Niveau d'activité** : Débutant, intermédiaire, avancé
- **Analyse de progression** : Évaluation de l'intensité et de la régularité
- **Conseils adaptés** : Recommandations selon votre historique
- **Objectifs personnalisés** : Suggestions d'amélioration

#### 💬 **Interface de chat unifiée**
- **Messages d'accueil automatiques** : "Bonjour [prénom], je suis Coach Lex IA"
- **Contexte enrichi** : L'IA connaît vos dernières séances, taille, poids
- **Questions libres** : Sport, nutrition, motivation, bien-être
- **Messages explicatifs** : Explications des recommandations
- **Mode sombre/clair** : Interface adaptée à tous les thèmes
- **Bulle flottante** : Accès au coach depuis tous les onglets

### 🎮 Gamification Avancée
- **Système de niveaux et XP** : Progression basée sur la durée, variété d'exercices et streaks
- **Streak animé** : Compteur de jours consécutifs avec bonus XP
- **Badges et réalisations** : Débloquez des badges pour vos exploits
- **Leaderboard dynamique** : Classement entre amis selon différents critères

### 🔐 Authentification & Profil
- **Connexion Google** : Authentification rapide et sécurisée
- **Gestion du profil** : Photo, pseudo, surnom personnalisé et badge sélectionné
- **Notifications en temps réel** : Suivi des invitations et rappels

### 👥 Social & Défis
- **Système d'amis** : Ajoutez, gérez vos connexions avec bouton d'invitation direct
- **Défis personnalisés** : Lancez des challenges à vos amis
- **Notifications intelligentes** : Rappels et félicitations automatiques
- **Profils enrichis** : Photos de profil, statistiques détaillées, surnoms personnalisés

### 📊 Analytics & Progression
- **Système de suivi du poids** : Enregistrez votre poids chaque semaine, visualisez votre évolution sur une courbe dédiée, recevez un rappel intelligent pour ne rien oublier.
- **Statistiques avancées** : Graphiques, comparaisons, historique
- **Courbe d'évolution du poids** : Suivi visuel de votre poids semaine par semaine, affichée en haut de la page Statistiques avec dates formatées en français
- **Notification hebdomadaire** : Rappel automatique chaque début de semaine pour mettre à jour votre poids (avec option 'C'est le même')
- **Suivi des performances** : Records personnels, tendances
- **Calendrier interactif** : Vue d'ensemble de vos séances avec bouton de suppression
- **Export de données** : Sauvegarde de vos progrès
- **Ressentis après séance** : Enregistrez vos sensations (facile, difficile, fatigué, motivé, etc.)
- **Analyse des ressentis** : Le coach IA analyse vos ressentis pour améliorer ses conseils

### 🎨 Interface Utilisateur Améliorée
- **Boutons de suppression visibles** : Suppression d'exercices et de séries avec confirmation
- **Bouton "Vider la séance"** : Supprime tous les exercices d'une séance en une fois
- **Confirmations de sécurité** : Popups de confirmation avant suppression
- **Interface intuitive** : Gestion efficace des séances même quand on n'aime pas la séance proposée
- **Couleurs optimisées** : Boutons visibles en mode clair et sombre
- **Mode sombre/clair** : Bulle flottante pour changer de thème instantanément
- **Header moderne** : Design épuré avec cercle de niveau blanc et streak intégrée
- **Poids décimal** : Support des poids avec virgules (ex: 70.5 kg)

### 📊 Monitoring & Analytics
- **Vercel Analytics** : Suivi des visiteurs, pages vues, taux de rebond en temps réel
- **Vercel Speed Insights** : Métriques de performance (FCP, LCP, CLS, TTFB)
- **Monitoring automatique** : Collecte de données dès le déploiement
- **Optimisation continue** : Amélioration basée sur les métriques réelles
- **Dashboard intégré** : Visualisation des performances dans Vercel

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
        G --> M[Coach Lex IA]
        G --> N[ChatbotBubble]
    end
    
    subgraph "Backend - Firebase"
        O[Authentication] --> P[Google Auth]
        Q[Firestore] --> R[Workouts]
        Q --> S[Users]
        Q --> T[Friends]
        Q --> U[Challenges]
        V[Storage] --> W[Profile Pictures]
    end
    
    subgraph "External Services"
        X[OpenAI API] --> Y[Coach Lex IA]
        Z[Vercel] --> AA[Deployment]
        BB[GitHub Actions] --> CC[CI/CD]
    end
    
    A -.-> O
    A -.-> Q
    A -.-> V
    M -.-> X
    Z --> A
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
│   │   ├── stats/
│   │   └── Chatbot/      # Coach Lex IA
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
- Clé API OpenAI (pour Coach Lex IA)

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
npm run lint       # Vérification du code (0 erreurs, 0 warnings)
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
> - **Statements** : 85.49%
> - **Branches** : 59.45%
> - **Functions** : 93.1%
> - **Lines** : 89.56%

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
- Coach Lex IA a été mis à jour pour accepter toutes les questions dans une interface unique, et les tests vérifient ce comportement (interface, contexte, gestion des erreurs, personnalisation).

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
- **Statements** : 85.49%
- **Branches** : 59.45%
- **Functions** : 93.1%
- **Lines** : 89.56%

**Note** : La couverture a été maintenue grâce à la suite de tests complète et aux tests pour Coach Lex IA et les hooks principaux.

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
- [x] Coach Lex IA (fonctionnel en développement, accès aux données utilisateur, interface unifiée, conseils personnalisés)
- [x] Système de suivi du poids (courbe d'évolution, notification hebdomadaire intelligente)
- [x] Génération automatique de séances personnalisées par le coach (type, intensité, exercices/séries aléatoires)
- [x] Messages de félicitations automatiques après chaque séance
- [x] Bulle de chat flottante avec synchronisation des messages
- [x] Récapitulatif intelligent des dernières séances avec recommandations
- [x] Surnoms personnalisés dans le profil et leaderboard
- [x] Boutons d'invitation d'amis dans le leaderboard
- [x] Bouton de suppression des séances dans le calendrier
- [x] Code propre avec 0 erreurs ESLint
- [x] **Recommandations d'exercices intelligentes** (analyse historique, groupes sous-traités)
- [x] **Traduction complète des exercices en français** (Mountain climbers → Grimpeur)
- [x] **Attribution correcte des groupes musculaires** (plus d'exercices "custom")
- [x] **Interface de suppression améliorée** (boutons visibles, confirmations, "Vider la séance")
- [x] **Analyse intelligente des séances** (régularité, progression, équilibre musculaire)
- [x] **Analyse de progression avancée** (bouton "📈 Progression" avec analyse détaillée des poids)
- [x] **Système de ressentis** (enregistrement des sensations après chaque séance)
- [x] **Mode sombre/clair** (bulle flottante pour changer de thème)
- [x] **Poids décimal** (support des poids avec virgules)
- [x] **Header optimisé** (cercle de niveau blanc, streak intégrée)
- [x] **Dates corrigées** (calcul correct des semaines pour l'évolution du poids)
- [x] **Vercel Analytics & Speed Insights** (monitoring des performances et analytics)

### 🚧 En développement
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
- **Coach Lex IA** : Vérifiez la clé API OpenAI

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
- **ESLint** : Configuration standard React (0 erreurs, 0 warnings)
- **Prettier** : Formatage automatique
- **Tests** : Minimum 80% de couverture
- **Commits** : Convention Conventional Commits

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Développeur

- **Développeur Full-Stack** : [Bryan Nakache](https://github.com/bryannakache)
- **Technologies** : React, Firebase, PWA, Gamification, IA, Vercel Analytics, Speed Insights
- **Focus** : UX/UI, Performance, Tests, Code Quality

---

## 🎯 Exemples d'utilisation du Coach IA

#### 💬 Questions générales
- "Comment améliorer ma récupération après l'entraînement ?"
- "Peux-tu me donner une recette saine ?"
- "J'ai du mal à rester motivé, des conseils ?"
- "Explique-moi la différence entre cardio et musculation."
- "Quels sont les bienfaits de la méditation ?"

#### 🏋️ Génération de séances
- "Propose-moi une séance full body difficile"
- "Je veux une séance abdos facile"
- "Donne-moi une séance cardio pour perdre du poids"

#### 📊 Analyse et conseils
- "Comment analyser mes progrès ?"
- "Quels exercices pour renforcer mes épaules ?"
- "Je me sens fatigué, que faire ?"

#### 📈 Progression et performance
- "Analyse ma progression sur les derniers mois"
- "Quels sont mes points forts et mes axes d'amélioration ?"
- "Comment optimiser mes séances pour progresser plus vite ?"

---

<div align="center">

**⭐ Si ce projet vous plaît, n'oubliez pas de le star sur GitHub ! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/bryannakache/ici-ca-pousse?style=social)](https://github.com/bryannakache/ici-ca-pousse/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/bryannakache/ici-ca-pousse?style=social)](https://github.com/bryannakache/ici-ca-pousse/network/members)

</div>

