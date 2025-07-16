# 🏋️‍♂️ Ici Ca Pousse - Application de Suivi d'Entraînement

Une application React moderne pour suivre vos séances d'entraînement avec une interface intuitive, des fonctionnalités cloud, et une synchronisation multi-appareils.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178c6.svg)
![Tests](https://img.shields.io/badge/tests-passing-green.svg)
![Build](https://img.shields.io/badge/build-passing-green.svg)

## ✨ Fonctionnalités

- 🏋️ **Gestion complète des séances** : Ajout, modification, suppression
- ☁️ **Synchronisation cloud (Firestore)** : Vos séances et favoris sont liés à votre compte Google et accessibles sur tous vos appareils
- 🔄 **Migration automatique** : Vos anciennes données locales sont importées dans le cloud à la première connexion
- ⭐ **Favoris synchronisés** : Vos exercices favoris sont aussi synchronisés avec votre compte
- 🌍 **Internationalisation (i18n)** : Interface multilingue (français/anglais), sélecteur de langue dans le header
- 📅 **Vue calendrier interactive** : Visualisation des séances par date
- 📊 **Statistiques détaillées** : Suivi de vos progrès
- 💾 **Fallback localStorage** : Fonctionne hors connexion, les données sont synchronisées dès que vous vous connectez
- 📱 **Design responsive** : Optimisé mobile et desktop
- ⚡ **Performance optimisée** : React.memo, useCallback, useMemo, lazy loading
- 🧪 **Tests complets** : Couverture de tests pour les hooks et composants

## 🚀 Technologies Utilisées

- **Frontend** : React 18, TypeScript
- **Styling** : Tailwind CSS
- **Icônes** : Lucide React
- **Tests** : Jest, React Testing Library
- **Cloud** : Firebase Auth & Firestore
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

## 🔑 Authentification & Cloud Sync

- **Connexion Google** : Cliquez sur "Connexion" puis "Continuer avec Google".
- **Synchronisation automatique** : Vos séances et favoris sont stockés dans Firestore, liés à votre compte Google.
- **Migration automatique** : Si des données locales sont détectées, l'application vous propose de les migrer dans le cloud à la première connexion.
- **Compatibilité multi-appareils** : Retrouvez vos données sur tous vos appareils en vous connectant avec le même compte Google.

## 🌍 Internationalisation

- Interface disponible en français et anglais
- Sélecteur de langue dans le header
- Facile à étendre pour d'autres langues

## 🛡️ Sécurité Firestore

- Les règles Firestore doivent restreindre l'accès aux documents à l'utilisateur authentifié (`userId == request.auth.uid`)
- Exemple de règle :

```js
service cloud.firestore {
  match /databases/{database}/documents {
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /favorites/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🏗️ Architecture

```
src/
├── components/          # Composants React réutilisables
│   ├── Header.jsx      # En-tête de l'application (avec sélecteur de langue)
│   ├── Navigation.jsx  # Navigation entre les onglets
│   ├── WorkoutList.jsx # Liste des exercices (synchro Firestore)
│   ├── CalendarView.jsx # Vue calendrier
│   └── StatsView.jsx   # Vue statistiques
├── hooks/              # Hooks personnalisés (useWorkouts synchronisé cloud)
├── utils/              # Utilitaires (Firestore, localStorage, migration)
├── constants/          # Constantes de l'application
└── App.js              # Composant principal
```

## 🎯 Fonctionnalités Détaillées

### Gestion des Séances
- Ajout d'exercices par groupe musculaire
- Gestion des séries, répétitions et poids
- Calcul automatique des statistiques
- Sauvegarde automatique cloud/local

### Vue Calendrier
- Affichage des séances par date
- Navigation intuitive
- Indicateurs visuels pour les séances

### Statistiques
- Nombre total de séances
- Séries et répétitions cumulées
- Durée moyenne des séances
- Historique des dernières séances

### Favoris
- Ajout/suppression d'exercices favoris
- Favoris synchronisés avec Firestore

### Internationalisation
- Interface multilingue (fr/en)
- Sélecteur de langue dans le header

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Lancer les tests avec couverture
npm run test:coverage

# Lancer le linting
npm run lint
```

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
- [Firebase](https://firebase.google.com/) pour l'authentification et la base de données cloud

---

⭐ Si ce projet vous plaît, n'hésitez pas à le star sur GitHub !
