# 🚀 Ici Ca Pousse - Frontend React

Application de suivi de musculation avec authentification.

## 🏗️ Structure du projet

```
frontend/
├── public/           # Fichiers statiques
├── src/
│   ├── components/   # Composants React
│   ├── utils/        # Utilitaires (API, storage, etc.)
│   └── ...
├── .env.example      # Configuration d'exemple
└── package.json
```

## 🚀 Déploiement sur Vercel

### 1. Prérequis
- Backend d'authentification déployé (voir dossier `../auth-backend/`)
- URL publique du backend (ex: `https://icicapousse-auth.onrender.com`)

### 2. Configuration
1. **Créez un fichier `.env` à la racine du frontend** :
   ```bash
   REACT_APP_API_URL=https://votre-backend-url.com/api
   ```

2. **Déployez sur Vercel** :
   ```bash
   # Via Vercel CLI
   npm i -g vercel
   vercel --prod
   
   # Ou via l'interface web Vercel
   # Connectez votre repo GitHub et déployez
   ```

### 3. Variables d'environnement Vercel
Dans les paramètres Vercel, ajoutez :
- `REACT_APP_API_URL` = URL de votre backend

## 🔧 Développement local

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start

# Le backend doit tourner sur localhost:3001
# node ../auth-backend/server.js
```

## 🔑 Authentification

L'app utilise un système d'authentification complet :
- ✅ Inscription/Connexion
- ✅ Validation de token
- ✅ Stockage local sécurisé
- ✅ Gestion d'erreurs
- ✅ Interface utilisateur moderne

## 📱 Fonctionnalités

- **Séances de musculation** : Créer, modifier, supprimer
- **Calendrier** : Visualiser les séances par date
- **Statistiques** : Suivi des progrès
- **Authentification** : Comptes utilisateurs sécurisés

## 🛠️ Technologies

- React 18
- Tailwind CSS
- Lucide React (icônes)
- LocalStorage pour la persistance

## 📞 Support

En cas de problème :
1. Vérifiez que le backend est déployé et accessible
2. Contrôlez les variables d'environnement
3. Consultez les logs Vercel
