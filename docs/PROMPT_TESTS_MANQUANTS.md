# 🤖 Prompt pour Claude Code - Ajout des Tests Manquants

## 📋 Contexte du Projet

Vous travaillez sur une application React de fitness avec intégration IA avancée. Le projet a actuellement une couverture de tests de **15.48%** et nous devons l'améliorer à **80% minimum**.

### 🎯 Objectif Principal
Ajouter les tests manquants pour atteindre une couverture de tests complète et professionnelle.

## 📊 État Actuel des Tests

### ✅ Tests Existants (417 tests passants)
- **Modules IA** : 83.47% de couverture (`/utils/ai/`)
- **Utilitaires** : 83.26% de couverture (`/utils/workout/`)
- **ML** : 88.57% de couverture (`/utils/ml/`)
- **Constantes** : 100% de couverture

### ❌ Tests Manquants (0% de couverture)
- **Composants React** : 0% de couverture
- **Hooks personnalisés** : 0% de couverture
- **Interface utilisateur** : 0% de couverture
- **Logique métier** : 0% de couverture

## 🧪 Priorités de Tests à Ajouter

### 1. **Tests des Hooks Personnalisés** (Priorité HAUTE)
```javascript
// Hooks à tester (0% de couverture actuellement)
- useAppState.js
- useBadges.js
- useChallenges.js
- useChatGPT.js (partiellement testé)
- useExercises.js
- useExperience.js
- useFriends.js
- useKeyboardNavigation.js
- useNotifications.js
- usePWA.js
- useSwipeNavigation.js
- useUserProfile.js
- useWeeklyBadgeUnlock.js
- useWorkoutLogic.js
- useWorkoutTemplates.js
- useWorkouts.js
```

### 2. **Tests des Composants React** (Priorité HAUTE)
```javascript
// Composants principaux à tester
- App.js (composant racine)
- Auth.jsx (authentification)
- Chatbot.jsx (interface IA)
- Navigation.jsx (navigation)
- StatsView.jsx (statistiques)
- WorkoutList.jsx (liste des entraînements)
- ProfilePage.jsx (profil utilisateur)
- CalendarView.jsx (vue calendrier)
- Leaderboard.jsx (classement)
- Challenges.jsx (défis)
- BadgesPage.jsx (badges)
```

### 3. **Tests d'Intégration** (Priorité MOYENNE)
```javascript
// Tests d'intégration à ajouter
- Tests de flux utilisateur complets
- Tests d'interaction avec l'IA
- Tests de persistance des données
- Tests de navigation entre les onglets
- Tests de gestion d'état global
```

### 4. **Tests de Performance** (Priorité BASSE)
```javascript
// Tests de performance à ajouter
- Tests de temps de réponse de l'IA
- Tests de performance du cache
- Tests de charge pour les graphiques
- Tests de mémoire pour les hooks
```

## 🛠️ Configuration et Outils

### Stack de Tests
```javascript
// Technologies utilisées
- Jest (framework de test)
- React Testing Library (tests React)
- @testing-library/user-event (interactions utilisateur)
- @testing-library/jest-dom (matchers DOM)
- jsdom (environnement DOM)
```

### Structure des Tests
```javascript
// Organisation des tests
src/tests/
├── components/          // Tests des composants
├── hooks/              // Tests des hooks (existe déjà)
├── integration/        // Tests d'intégration
├── utils/              // Tests des utilitaires (existe déjà)
└── setup/              // Configuration des tests
```

## 📝 Instructions Détaillées

### 1. **Tests des Hooks Personnalisés**

Pour chaque hook, créer un fichier de test avec :
- **Tests de rendu initial** : Vérifier l'état initial
- **Tests de fonctions** : Tester toutes les fonctions exportées
- **Tests d'effets** : Vérifier les useEffect et side effects
- **Tests d'erreurs** : Gestion des cas d'erreur
- **Tests de performance** : Vérifier les optimisations

**Exemple pour useWorkouts.js :**
```javascript
describe('useWorkouts', () => {
  test('should initialize with empty workouts', () => {
    // Test d'initialisation
  });
  
  test('should add workout correctly', () => {
    // Test d'ajout d'entraînement
  });
  
  test('should update workout correctly', () => {
    // Test de mise à jour
  });
  
  test('should delete workout correctly', () => {
    // Test de suppression
  });
  
  test('should handle errors gracefully', () => {
    // Test de gestion d'erreur
  });
});
```

### 2. **Tests des Composants React**

Pour chaque composant, créer un fichier de test avec :
- **Tests de rendu** : Vérifier que le composant se rend correctement
- **Tests de props** : Tester les différentes props
- **Tests d'interactions** : Clics, saisie, navigation
- **Tests d'état** : Vérifier les changements d'état
- **Tests d'accessibilité** : ARIA labels, navigation clavier

**Exemple pour Chatbot.jsx :**
```javascript
describe('Chatbot', () => {
  test('should render chatbot interface', () => {
    // Test de rendu
  });
  
  test('should send message when user types and submits', () => {
    // Test d'envoi de message
  });
  
  test('should display AI response', () => {
    // Test d'affichage de réponse IA
  });
  
  test('should handle different session types', () => {
    // Test des types de session
  });
  
  test('should be accessible with keyboard navigation', () => {
    // Test d'accessibilité
  });
});
```

### 3. **Tests d'Intégration**

Créer des tests qui couvrent des flux complets :
- **Flux d'authentification** : Login → Navigation → Logout
- **Flux d'entraînement** : Création → Modification → Suppression
- **Flux IA** : Question → Réponse → Suivi
- **Flux de données** : Sauvegarde → Synchronisation → Récupération

### 4. **Tests de Performance**

Ajouter des tests pour :
- **Temps de réponse** : Mesurer les performances
- **Mémoire** : Vérifier les fuites mémoire
- **Cache** : Tester l'efficacité du cache
- **Rendu** : Mesurer le temps de rendu des composants

## 🎯 Objectifs de Couverture

### Couverture Cible par Module
```javascript
// Objectifs de couverture
- Composants React : 80% minimum
- Hooks personnalisés : 90% minimum
- Utilitaires : 85% minimum (déjà atteint)
- Tests d'intégration : 70% minimum
- Couverture globale : 80% minimum
```

### Métriques à Suivre
```javascript
// Métriques importantes
- Statements : 80%
- Branches : 75%
- Functions : 85%
- Lines : 80%
```

## 🔧 Configuration Jest

### Mise à jour de jest.config.js
```javascript
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/serviceWorkerRegistration.js',
    '!src/setupTests.js',
    '!src/**/*.test.{js,jsx}',
    '!src/**/*.spec.{js,jsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 85,
      lines: 80,
      statements: 80,
    },
    './src/components/': {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/hooks/': {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
};
```

## 📋 Checklist de Livraison

### ✅ Tests des Hooks
- [ ] useAppState.js
- [ ] useBadges.js
- [ ] useChallenges.js
- [ ] useExercises.js
- [ ] useExperience.js
- [ ] useFriends.js
- [ ] useKeyboardNavigation.js
- [ ] useNotifications.js
- [ ] usePWA.js
- [ ] useSwipeNavigation.js
- [ ] useUserProfile.js
- [ ] useWeeklyBadgeUnlock.js
- [ ] useWorkoutLogic.js
- [ ] useWorkoutTemplates.js
- [ ] useWorkouts.js

### ✅ Tests des Composants
- [ ] App.js
- [ ] Auth.jsx
- [ ] Chatbot.jsx
- [ ] Navigation.jsx
- [ ] StatsView.jsx
- [ ] WorkoutList.jsx
- [ ] ProfilePage.jsx
- [ ] CalendarView.jsx
- [ ] Leaderboard.jsx
- [ ] Challenges.jsx
- [ ] BadgesPage.jsx

### ✅ Tests d'Intégration
- [ ] Flux d'authentification
- [ ] Flux d'entraînement
- [ ] Flux IA
- [ ] Flux de données

### ✅ Configuration
- [ ] Mise à jour jest.config.js
- [ ] Configuration des seuils de couverture
- [ ] Scripts npm pour les tests
- [ ] Documentation des tests

## 🚀 Commandes de Test

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Tests d'intégration
npm run test:integration

# Tests de performance
npm run test:performance
```

## 📚 Ressources et Références

### Documentation
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro/)

### Bonnes Pratiques
- Utiliser des données de test réalistes
- Tester les cas d'erreur et edge cases
- Maintenir les tests à jour avec le code
- Utiliser des mocks appropriés pour les dépendances externes
- Tester l'accessibilité et l'UX

---

**Objectif Final :** Atteindre une couverture de tests de **80% minimum** avec des tests de qualité professionnelle qui garantissent la fiabilité et la maintenabilité du code. 