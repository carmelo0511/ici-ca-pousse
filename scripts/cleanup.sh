#!/bin/bash

# Script de nettoyage du projet Ici Ça Pousse
# Supprime les fichiers temporaires et non nécessaires

echo "🧹 Nettoyage du projet..."

# Nettoyage des fichiers temporaires
echo "📁 Suppression des fichiers temporaires..."
find . -name "*.tmp" -type f -delete 2>/dev/null
find . -name "*.temp" -type f -delete 2>/dev/null
find . -name ".DS_Store" -type f -delete 2>/dev/null

# Nettoyage des logs
echo "📋 Suppression des logs..."
find . -name "*.log" -not -path "./node_modules/*" -type f -delete 2>/dev/null

# Nettoyage Python cache
echo "🐍 Suppression du cache Python..."
find backend -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null
find backend -name "*.pyc" -type f -delete 2>/dev/null

# Nettoyage MLflow artifacts (optionnel)
if [ "$1" == "--deep" ]; then
    echo "🔬 Nettoyage profond des artifacts MLflow..."
    rm -rf backend/mlflow/* 2>/dev/null
    rm -rf backend/models/* 2>/dev/null
fi

# Nettoyage build frontend (optionnel)
if [ "$1" == "--build" ] || [ "$1" == "--deep" ]; then
    echo "🏗️ Suppression du dossier build..."
    rm -rf build/ 2>/dev/null
fi

# Nettoyage coverage (optionnel) 
if [ "$1" == "--coverage" ] || [ "$1" == "--deep" ]; then
    echo "📊 Suppression des rapports de coverage..."
    rm -rf coverage/ 2>/dev/null
fi

echo "✅ Nettoyage terminé !"
echo ""
echo "Options disponibles:"
echo "  ./scripts/cleanup.sh            # Nettoyage standard"
echo "  ./scripts/cleanup.sh --build    # + supprime build/"
echo "  ./scripts/cleanup.sh --coverage # + supprime coverage/"
echo "  ./scripts/cleanup.sh --deep     # Nettoyage complet"