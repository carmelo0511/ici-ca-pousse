# 🏗️ Architecture de l'application

## 📁 Structure des dossiers

```
src/
├── components/          # Composants React réutilisables
│   ├── Header.jsx      # En-tête de l'application
│   ├── Navigation.jsx  # Navigation entre les onglets
│   ├── WorkoutList.jsx # Liste des exercices
│   ├── CalendarView.jsx # Vue calendrier
│   └── StatsView.jsx   # Vue statistiques
├── hooks/              # Hooks personnalisés
│   ├── useWorkouts.js  # Gestion des séances
│   └── useExercises.js # Gestion des exercices
├── utils/              # Utilitaires
│   ├── storage.js      # Gestion du localStorage
│   ├── workoutUtils.js # Utilitaires pour les workouts
│   └── exerciseDatabase.js # Base de données d'exercices
├── constants/          # Constantes de l'application
│   └── index.js        # Toutes les constantes
└── App.js              # Composant principal
```

## 🔧 Principes d'architecture

### 1. **Séparation des responsabilités**

- **Hooks** : Logique métier et gestion d'état
- **Composants** : Interface utilisateur
- **Utils** : Fonctions utilitaires
- **Constants** : Valeurs centralisées

### 2. **Hooks personnalisés**

- `useWorkouts` : Gestion complète des séances (CRUD)
- `useExercises` : Gestion des exercices et séries

### 3. **Composants modulaires**

- `Header` : En-tête avec logo et compteur
- `Navigation` : Navigation entre les onglets
- Chaque vue est un composant séparé

### 4. **Utilitaires spécialisés**

- `workoutUtils` : Création et calculs des workouts
- `storage` : Abstraction du localStorage
- `exerciseDatabase` : Données des exercices

## 🎯 Avantages de cette architecture

### ✅ **Maintenabilité**

- Code organisé et lisible
- Responsabilités clairement séparées
- Facile à modifier et étendre

### ✅ **Réutilisabilité**

- Hooks réutilisables
- Composants modulaires
- Utilitaires génériques

### ✅ **Testabilité**

- Logique isolée dans les hooks
- Composants purs
- Fonctions utilitaires testables

### ✅ **Performance**

- Re-renders optimisés
- État localisé
- Pas de props drilling

## 🔄 Flux de données

```
App.js
├── useWorkouts (état global des séances)
├── useExercises (état local des exercices)
├── Header (affichage du compteur)
├── Navigation (changement d'onglet)
└── Composants de vue (WorkoutList, CalendarView, StatsView)
```

## 📝 Bonnes pratiques appliquées

1. **Hooks personnalisés** pour la logique métier
2. **Composants purs** pour l'interface
3. **Constantes centralisées** pour la cohérence
4. **Fonctions utilitaires** pour la réutilisabilité
5. **Nommage explicite** pour la lisibilité
6. **Commentaires** pour la documentation
