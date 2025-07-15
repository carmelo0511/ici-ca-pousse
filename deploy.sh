#!/bin/bash

echo "🚀 Script de déploiement - Ici Ca Pousse"
echo "========================================"

# Vérifier que nous sommes dans le bon dossier
if [ ! -d "frontend" ] || [ ! -d "auth-backend" ]; then
    echo "❌ Erreur : Ce script doit être exécuté à la racine du projet"
    exit 1
fi

echo ""
echo "📋 Étapes de déploiement :"
echo ""

echo "1️⃣  BACKEND (Authentification)"
echo "   - Allez dans le dossier auth-backend/"
echo "   - Suivez les instructions dans auth-backend/README.md"
echo "   - Déployez sur Render ou Railway"
echo "   - Notez l'URL publique (ex: https://icicapousse-auth.onrender.com)"
echo ""

echo "2️⃣  FRONTEND (React)"
echo "   - Allez dans le dossier frontend/"
echo "   - Créez un fichier .env avec :"
echo "     REACT_APP_API_URL=https://votre-backend-url.com/api"
echo "   - Déployez sur Vercel"
echo ""

echo "3️⃣  CONFIGURATION VERCEL"
echo "   - Dans les paramètres Vercel, ajoutez la variable d'environnement :"
echo "     REACT_APP_API_URL = URL de votre backend"
echo ""

echo "✅ Votre app sera alors fonctionnelle en ligne !"
echo ""
echo "🔗 Liens utiles :"
echo "   - Render : https://render.com"
echo "   - Railway : https://railway.app"
echo "   - Vercel : https://vercel.com"
echo ""

read -p "Appuyez sur Entrée pour continuer..." 