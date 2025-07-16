# Ici Ca Pousse

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![PWA](https://img.shields.io/badge/PWA-ready-blueviolet)
![i18n](https://img.shields.io/badge/i18n-FR%20%7C%20EN-yellowgreen)

---

## 🏋️‍♂️ Ici Ca Pousse

**Ici Ca Pousse** est une application web moderne de suivi d’entraînement (musculation & cardio) pensée pour la performance, la motivation et la synchronisation multi-appareils. Profitez d’une expérience fluide, gamifiée et sécurisée, que vous soyez débutant ou confirmé.

---

## 📑 Sommaire
- [Fonctionnalités](#fonctionnalités)
- [Gamification](#gamification)
- [Internationalisation](#internationalisation)
- [Synchronisation Cloud](#synchronisation-cloud)
- [Installation & Configuration](#installation--configuration)
- [Authentification](#authentification)
- [PWA & Mobile](#pwa--mobile)
- [Tests](#tests)
- [Contribution](#contribution)
- [Licence](#licence)
- [Crédits](#crédits)
- [Screenshots](#screenshots)

---

## 🚀 Fonctionnalités

- 🏋️‍♂️ **Suivi complet des séances** (musculation & cardio)
- ⭐ **Favoris synchronisés**
- 📊 **Statistiques avancées** (séries, répétitions, poids, durée, régularité)
- 🏅 **Badges & Succès** (gamification)
- ☁️ **Synchronisation cloud** (Firebase/Firestore)
- 🌍 **Internationalisation** (français 🇫🇷 / anglais 🇬🇧)
- 🔒 **Authentification Google** (Firebase Auth)
- 📱 **Responsive & PWA** (installable sur mobile/tablette/desktop)
- 🧪 **Tests unitaires** (hooks, logique Firestore)
- ⚡ **Performance & sécurité** (optimisations React, CI/CD, règles Firestore)

---

## 🏅 Gamification

Boostez votre motivation grâce à un système de **badges** déblocables selon vos progrès :

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

Les badges sont visibles dans la section **Statistiques** et s’affichent automatiquement dès qu’ils sont débloqués.

---

## 🌍 Internationalisation
- Interface disponible en **français** 🇫🇷 et **anglais** 🇬🇧
- Sélecteur de langue accessible dans le header
- Tous les textes, boutons, groupes musculaires et exercices sont traduits

---

## ☁️ Synchronisation Cloud
- Toutes vos séances et favoris sont stockés dans **Firestore** (Firebase)
- Accès multi-appareils, migration automatique des données locales
- Sécurité : accès restreint à l’utilisateur authentifié

---

## 🛠️ Installation & Configuration

### Prérequis
- Node.js >= 16
- npm >= 8

### Installation
```bash
git clone https://github.com/carmelo0511/ici-ca-pousse.git
cd ici-ca-pousse
npm install
```

### Lancement en développement
```bash
npm start
```

### Build production
```bash
npm run build
```

---

## 🔒 Authentification
- Connexion via Google (Firebase Auth)
- Sécurité des données assurée par les règles Firestore

---

## 📱 PWA & Mobile
- Application installable sur mobile/tablette/desktop
- Design responsive et moderne
- Expérience fluide sur tous les appareils

---

## 🧪 Tests
- Lancer les tests unitaires :
```bash
npm test
```
- Couverture des hooks, logique Firestore, et composants principaux

---

## 🤝 Contribution
Les PR sont les bienvenues !
1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/ma-feature`)
3. Committez vos changements (`git commit -m 'feat: ma feature'`)
4. Pushez (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

---

## 📄 Licence
MIT

---

## 🙏 Crédits
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide](https://lucide.dev/)
- [Vercel](https://vercel.com/)
- [Firebase](https://firebase.google.com/)

---

## 📸 Screenshots

> _Ajoutez ici vos captures d’écran pour illustrer l’application !_

---

⭐ **N’oubliez pas de star le projet si vous l’aimez, et de contribuer !**

Pour toute question ou suggestion, ouvrez une issue ou contactez [@carmelo0511](https://github.com/carmelo0511).
