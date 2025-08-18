# 🛠️ Guide de Maintenance - Ici Ça Pousse

## 🧹 Scripts de Nettoyage

### Nettoyage Standard
```bash
# Supprime les fichiers temporaires et cache
./scripts/cleanup.sh
```

### Nettoyage Complet
```bash
# Nettoyage profond incluant build/ et artifacts MLflow
./scripts/cleanup.sh --deep
```

### Options Disponibles
```bash
./scripts/cleanup.sh            # Nettoyage standard
./scripts/cleanup.sh --build    # + supprime build/
./scripts/cleanup.sh --coverage # + supprime coverage/
./scripts/cleanup.sh --deep     # Nettoyage complet
```

## 📊 Analyse du Code

### Analyse des Imports
```bash
# Détecte les imports potentiellement inutiles
node scripts/optimize-imports.js
```

### Vérification de la Qualité
```bash
# Frontend
npm run lint                    # ESLint
npm run test                    # Tests Jest
npm run test:coverage           # Coverage report

# Backend Python
cd backend
pytest                          # Tests Python
pytest --cov                    # Coverage Python
python -m black .               # Formatage automatique
python -m flake8 .              # Analyse statique
```

## 🐳 Maintenance Docker

### Nettoyage des Containers
```bash
docker-compose down --volumes   # Arrêter et supprimer volumes
docker system prune -f          # Nettoyer le système Docker
```

### Rebuild Complet
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## 🗄️ Maintenance Base de Données

### MLflow Database
```bash
# Nettoyer la base MLflow (optionnel)
rm backend/mlflow.db*

# Sauvegarder les expérimentations
cp backend/mlflow.db backend/mlflow_backup_$(date +%Y%m%d).db
```

### Firestore (Production)
- Nettoyage via la console Firebase
- Export des données importantes avant maintenance

## 📦 Gestion des Dépendances

### Frontend (Node.js)
```bash
# Vérifier les vulnérabilités
npm audit
npm audit fix

# Mettre à jour les dépendances
npm update
npm outdated                    # Voir les packages obsolètes
```

### Backend (Python)
```bash
cd backend
pip list --outdated             # Packages obsolètes
pip-review --local --auto       # Mise à jour automatique (optionnel)

# Sécurité
safety check                    # Vérifier les vulnérabilités
bandit -r app/                  # Analyse sécurité statique
```

## 🔍 Monitoring et Performance

### Métriques de Performance
```bash
# Analyse des bundles
npm run build
npm run analyze                 # Si configuré

# Tests de performance
npm run test:perf              # Si configuré
```

### Monitoring Production
- **Vercel Analytics**: Métriques utilisateur
- **MLflow UI**: Performance des modèles ML
- **Firebase Console**: Utilisation backend

## 📋 Checklist de Maintenance Mensuelle

### ✅ Code Quality
- [ ] Exécuter `npm run lint` et corriger les erreurs
- [ ] Exécuter `pytest` backend et vérifier 100% pass
- [ ] Analyser les imports avec `node scripts/optimize-imports.js`
- [ ] Vérifier les vulnérabilités avec `npm audit`

### ✅ Performance
- [ ] Vérifier Core Web Vitals sur Vercel
- [ ] Analyser les métriques MLflow
- [ ] Nettoyer les artefacts anciens
- [ ] Optimiser les images et assets

### ✅ Sécurité
- [ ] Mettre à jour les dépendances critiques
- [ ] Vérifier les clés API et tokens
- [ ] Réviser les règles de sécurité Firebase
- [ ] Scanner avec `safety check` (Python)

### ✅ Infrastructure
- [ ] Vérifier les logs d'erreur
- [ ] Tester le système de fallback ML
- [ ] Valider les backups de données
- [ ] Nettoyer les containers Docker

## 🚨 Procédures d'Urgence

### Rollback Rapide
```bash
# Vercel
vercel --prod --confirm        # Déployer la dernière version stable

# Base de données
# Restaurer depuis Firebase console si nécessaire
```

### Debug API Python
```bash
# Logs détaillés
docker-compose logs backend -f

# Health check
curl http://localhost:8000/health

# Mode debug
cd backend
uvicorn app.main:app --reload --log-level debug
```

### Debug Frontend
```bash
# Logs build
npm run build 2>&1 | tee build.log

# Mode développement verbose
GENERATE_SOURCEMAP=true npm start
```

## 📝 Documentation à Maintenir

### Mettre à Jour Régulièrement
- [ ] `README.md` - Versions et badges
- [ ] `PYTHON_ML_INTEGRATION.md` - Documentation technique
- [ ] `package.json` - Descriptions et scripts
- [ ] `requirements.txt` - Versions Python

### Tests de Documentation
```bash
# Vérifier que tous les liens fonctionnent
# Valider les exemples de code dans la documentation
# Tester les commandes d'installation
```

## 🔧 Outils Recommandés

### IDE Extensions
- **ESLint** - Qualité JavaScript
- **Python** - Support Python complet
- **Docker** - Gestion containers
- **GitLens** - Historique Git avancé

### Monitoring Local
```bash
# Performance monitoring
npm install -g clinic
clinic doctor -- npm start

# Bundle analysis
npm install -g webpack-bundle-analyzer
```

---

💡 **Conseil**: Automatisez ces tâches avec des GitHub Actions pour la maintenance continue !

🚀 **Pour toute question**: Consultez la documentation ou créez une issue GitHub.