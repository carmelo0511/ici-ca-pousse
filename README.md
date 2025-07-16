# Ici Ca Pousse

**Ici Ca Pousse** est une application moderne de suivi d'entraînement (musculation & cardio) avec synchronisation cloud, internationalisation (français/anglais), et gamification !

## 🚀 Fonctionnalités principales

- **Suivi des séances** : Ajoutez, modifiez, supprimez vos entraînements (musculation & cardio)
- **Gestion des exercices** : Personnalisez vos exercices, séries, répétitions, poids, durée
- **Favoris** : Marquez vos exercices préférés pour un accès rapide
- **Statistiques avancées** : Visualisez vos progrès (séries, répétitions, poids, durée, régularité)
- **Synchronisation cloud** : Vos données sont sauvegardées et accessibles sur tous vos appareils (Firebase/Firestore)
- **Migration automatique** : Vos anciennes séances locales sont migrées vers le cloud à la connexion
- **Internationalisation** : Interface disponible en français 🇫🇷 et anglais 🇬🇧 (sélecteur de langue dans le header)
- **Responsive & PWA** : Utilisable sur mobile, tablette, desktop, et installable comme application
- **Sécurité** : Authentification Google (Firebase Auth)
- **Tests unitaires** : Couverture des hooks et de la logique Firestore
- **CI/CD** : Déploiement continu (Vercel/GitHub Actions)

## 🏅 Gamification : Badges & Succès

Pour booster la motivation, l'app propose un système de **badges** à débloquer selon vos progrès :

| Badge | Condition | Description |
|-------|-----------|-------------|
| 🏅 | 1 séance | Première séance réalisée |
| 🥉 | 5 séances | 5 séances réalisées |
| 🥈 | 10 séances | 10 séances réalisées |
| 🥇 | 20 séances | 20 séances réalisées |
| 💪 | 100 séries | 100 séries cumulées |
| 🔥 | 1000 répétitions | 1000 répétitions cumulées |
| 🏋️ | 10 000 kg | 10 000 kg soulevés au total |
| ⏱️ | 60 min de moyenne | Séances longues (moyenne ≥ 60 min) |

Les badges sont visibles dans la section **Statistiques** et s'affichent automatiquement dès qu'ils sont débloqués !

## 🌍 Internationalisation
- Changez la langue à tout moment (FR/EN)
- Tous les textes, boutons, labels, groupes musculaires et exercices sont traduits

## ☁️ Synchronisation Cloud
- Toutes vos séances et favoris sont stockés dans Firestore (Firebase)
- Accès multi-appareils, migration automatique des données locales

## 🛠️ Installation & Lancement

```bash
npm install
npm start
```

Pour la production :
```bash
npm run build
```

## 🔒 Authentification
- Connexion via Google (Firebase Auth)

## 📱 PWA
- Installable sur mobile/tablette/desktop

## 🧪 Tests
- Lancer les tests unitaires :
```bash
npm test
```

## 🤝 Contribuer
Les PR sont les bienvenues !

---

**Ici Ca Pousse** : le coach digital qui rend l'entraînement fun, motivant et accessible à tous ! 💪
