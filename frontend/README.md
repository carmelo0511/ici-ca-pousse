# 🚀 Ici Ca Pousse - Application de Musculation

Application de suivi de musculation **100% locale** - données sauvegardées sur votre appareil.

## 🏗️ Structure du projet

```
frontend/
├── public/           # Fichiers statiques
├── src/
│   ├── components/   # Composants React
│   ├── utils/        # Utilitaires (storage, exercices)
│   └── ...
└── package.json
```

## 🚀 Déploiement sur Vercel

### Déploiement simple
```bash
# Via Vercel CLI
npm i -g vercel
vercel --prod

# Ou via l'interface web Vercel
# Connectez votre repo GitHub et déployez
```

**✅ Aucune configuration spéciale nécessaire !**

## 🔧 Développement local

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
```

## 📱 Fonctionnalités

- ✅ **Séances de musculation** : Créer, modifier, supprimer
- ✅ **Calendrier** : Visualiser les séances par date
- ✅ **Statistiques** : Suivi des progrès
- ✅ **Stockage local** : Données sauvegardées sur l'appareil
- ✅ **Interface moderne** : Design responsive avec Tailwind CSS
- ✅ **Pas de connexion** : Utilisation immédiate

## 🛠️ Technologies

- React 18
- Tailwind CSS
- Lucide React (icônes)
- LocalStorage pour la persistance

## 💾 Stockage des données

- **LocalStorage** : Toutes les séances sont sauvegardées localement
- **Pas de serveur** : Fonctionne entièrement hors ligne
- **Données privées** : Restent sur votre appareil uniquement

## 📞 Support

En cas de problème :
1. Vérifiez que le build se fait correctement
2. Consultez les logs Vercel
3. Testez en local avec `npm start`

---

**🎯 Application simple, rapide et efficace pour votre suivi de musculation !**
