# Guide de Déploiement - Ici Ça Pousse

## 🚀 Configuration de Production

### Variables d'Environnement

#### Frontend (Vercel)
```bash
# URL de l'API Python ML en production
REACT_APP_PYTHON_API_URL=https://ici-ca-pousse-api.vercel.app

# Clé API OpenAI (optionnelle)
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

#### Backend (Vercel Functions)
```bash
# Configuration de l'API Python ML
PYTHON_VERSION=3.11
ML_MODEL_CACHE=true
```

### Configuration Vercel

#### Frontend
Le fichier `vercel.json` est configuré pour :
- Utiliser la commande de build `npm run vercel-build`
- Définir le répertoire de sortie `build`
- Configurer les routes et rewrites
- Définir les variables d'environnement

#### Backend
Les fonctions Vercel sont dans le dossier `api/` et incluent :
- `health.js` - Vérification de santé
- `ml/predict.js` - Prédictions ML
- `ml/train.js` - Entraînement des modèles
- `ml/status.js` - Statut du système ML

### URLs de Production

- **Frontend**: https://ici-ca-pousse.vercel.app
- **API ML**: https://ici-ca-pousse-api.vercel.app
- **Documentation API**: https://ici-ca-pousse-api.vercel.app/docs

### Déploiement

#### 1. Frontend
```bash
# Déploiement automatique via GitHub Actions
git push origin main
```

#### 2. Backend
```bash
# Déploiement des fonctions Vercel
vercel --prod
```

### Vérification

#### Test de l'API
```bash
# Vérification de santé
curl https://ici-ca-pousse-api.vercel.app/health

# Test de prédiction ML
curl -X POST https://ici-ca-pousse-api.vercel.app/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{"exercise_name": "squat", "user_data": {"current_weight": 80}}'
```

### Résolution des Problèmes

#### Erreur "insecure content from localhost"
- Vérifier que `REACT_APP_PYTHON_API_URL` est configuré pour la production
- S'assurer que l'URL utilise HTTPS en production
- Vérifier que l'API backend est déployée et accessible

#### API non accessible
- Vérifier le statut des fonctions Vercel
- Contrôler les logs de déploiement
- Tester l'endpoint de santé de l'API
