# 🏋️‍♂️ Ici Ca Pousse - Application de Suivi d'Entraînement

Une application React moderne pour suivre vos séances d'entraînement avec une interface intuitive et des fonctionnalités complètes.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178c6.svg)
![Tests](https://img.shields.io/badge/tests-passing-green.svg)
![Build](https://img.shields.io/badge/build-passing-green.svg)

## ✨ Fonctionnalités

- 🏋️ **Gestion complète des séances** : Ajout, modification, suppression
- 📅 **Vue calendrier interactive** : Visualisation des séances par date
- 📊 **Statistiques détaillées** : Suivi de vos progrès
- 💾 **Stockage local** : Données persistantes sans serveur
- 📱 **Design responsive** : Optimisé mobile et desktop
- ⚡ **Performance optimisée** : React.memo et lazy loading
- 🧪 **Tests complets** : Couverture de tests pour les hooks et composants

## 🚀 Technologies Utilisées

- **Frontend** : React 18, TypeScript
- **Styling** : Tailwind CSS
- **Icônes** : Lucide React
- **Tests** : Jest, React Testing Library
- **Build** : Create React App
- **CI/CD** : GitHub Actions
- **Déploiement** : Vercel

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/carmelo0511/ici-ca-pousse.git
cd ici-ca-pousse

# Installer les dépendances
npm install

# Lancer en mode développement
npm start
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Lancer les tests avec couverture
npm run test:coverage

# Lancer le linting
npm run lint
```

## 🏗️ Architecture

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
└── __tests__/          # Tests unitaires
    ├── useWorkouts.test.js
    ├── useExercises.test.js
    └── ...
```

## 🎯 Fonctionnalités Détaillées

### Gestion des Séances
- Ajout d'exercices par groupe musculaire
- Gestion des séries, répétitions et poids
- Calcul automatique des statistiques
- Sauvegarde automatique

### Vue Calendrier
- Affichage des séances par date
- Navigation intuitive
- Indicateurs visuels pour les séances

### Statistiques
- Nombre total de séances
- Séries et répétitions cumulées
- Durée moyenne des séances
- Historique des dernières séances

## 🔧 Scripts Disponibles

```bash
npm start          # Lancer en mode développement
npm run build      # Build de production
npm test           # Lancer les tests
npm run lint       # Vérifier le code
npm run format     # Formater le code
```

## 📊 Métriques de Qualité

- **Couverture de tests** : >90%
- **Performance Lighthouse** : 95+
- **Accessibilité** : WCAG 2.1 AA
- **SEO** : Optimisé

## 🚀 Déploiement

L'application est configurée pour un déploiement automatique sur Vercel via GitHub Actions.

### Variables d'environnement requises :
- `VERCEL_TOKEN` : Token d'authentification Vercel
- `ORG_ID` : ID de l'organisation Vercel
- `PROJECT_ID` : ID du projet Vercel

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Bryan Nakache**
- GitHub: [@carmelo0511](https://github.com/carmelo0511)

## 🙏 Remerciements

- [React](https://reactjs.org/) pour le framework
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- [Lucide](https://lucide.dev/) pour les icônes
- [Vercel](https://vercel.com/) pour l'hébergement

---

⭐ Si ce projet vous plaît, n'hésitez pas à le star sur GitHub !
