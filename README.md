# 🏋️ Ici Ca Pousse - Application de Musculation

Application complète de suivi de musculation avec authentification et interface moderne.

## 📁 Structure du projet

```
ici-ca-pousse/
├── frontend/          # Application React (déployée sur Vercel)
│   ├── src/          # Code source React
│   ├── public/       # Fichiers statiques
│   └── README.md     # Instructions frontend
├── auth-backend/     # Serveur d'authentification (déployé sur Render/Railway)
│   ├── server.js     # Serveur Node.js
│   └── README.md     # Instructions backend
└── README.md         # Ce fichier
```

## 🚀 Déploiement rapide

### 1. Backend d'authentification
```bash
cd auth-backend
# Suivez les instructions dans auth-backend/README.md
# Déployez sur Render ou Railway
```

### 2. Frontend React
```bash
cd frontend
# Créez .env avec REACT_APP_API_URL=URL_DE_VOTRE_BACKEND
# Déployez sur Vercel
```

## 🔧 Développement local

```bash
# Terminal 1 - Backend
cd auth-backend
npm install
node server.js

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

## 📱 Fonctionnalités

- ✅ **Authentification complète** : Inscription, connexion, sessions
- ✅ **Gestion des séances** : Créer, modifier, supprimer des workouts
- ✅ **Calendrier interactif** : Visualiser les séances par date
- ✅ **Statistiques** : Suivi des progrès et performances
- ✅ **Interface moderne** : Design responsive avec Tailwind CSS
- ✅ **Stockage local** : Données persistantes par utilisateur

## 🛠️ Technologies

**Frontend :**
- React 18
- Tailwind CSS
- Lucide React (icônes)

**Backend :**
- Node.js
- Crypto (hashage sécurisé)
- CORS configuré

## 📞 Support

- **Frontend** : Voir `frontend/README.md`
- **Backend** : Voir `auth-backend/README.md`
- **Problèmes** : Vérifiez les logs de déploiement

---

**🎯 Objectif :** Application de musculation fonctionnelle et prête pour la production ! 