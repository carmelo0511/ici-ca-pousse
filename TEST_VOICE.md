# Guide de Test - Reconnaissance Vocale

## Problèmes identifiés et corrigés

### 1. **Problème de parsing vocal** ✅ CORRIGÉ
- **Problème** : "développé couché 80 kg 5 répétitions 6 séries" était détecté comme "Pompes"
- **Cause** : Pattern regex trop générique qui matchait "6 séries" seul
- **Solution** : Ajout de `^` et `$` pour matcher la phrase complète + nouveau pattern spécifique

### 2. **Problème de reconnaissance vocale** ✅ CORRIGÉ
- **Problème** : Erreurs "aborted" et "no-speech" dans la console
- **Cause** : Configuration instable de la reconnaissance vocale
- **Solution** : 
  - `continuous = false` pour éviter les conflits
  - Meilleure gestion des erreurs
  - Plus de logs pour le debug

## Comment tester

### 1. **Ouvrir l'application**
- Aller sur `http://localhost:3000`
- Cliquer sur le bouton "🎤 Ajouter vocal"

### 2. **Tester la reconnaissance vocale**
- Cliquer sur le bouton microphone bleu
- Parler clairement et lentement
- Attendre que la reconnaissance se termine automatiquement (10 secondes)
- Ou cliquer à nouveau pour arrêter manuellement

### 3. **Phrases à tester**
```
✅ "développé couché 80 kg 5 répétitions 6 séries"
✅ "pompes trois séries 15 REP 25 kg"
✅ "squats 4 séries 12 reps 60 kg"
✅ "curl biceps 20 kg 10 répétitions 3 séries"
```

### 4. **Vérifier les logs**
- Ouvrir la console du navigateur (F12)
- Regarder les messages avec 🎤
- Vérifier qu'il n'y a plus d'erreurs "aborted" ou "no-speech"

## Résultat attendu

Quand vous dites "développé couché 80 kg 5 répétitions 6 séries", vous devriez voir :
- ✅ Exercise détecté : Développé couché
- ✅ Poids : 80 kg
- ✅ Répétitions : 5
- ✅ Séries : 6

## Si ça ne fonctionne toujours pas

1. **Vérifier les permissions microphone** dans le navigateur
2. **Parler plus fort et plus clairement**
3. **Attendre 2-3 secondes avant de parler** après avoir cliqué
4. **Vérifier que le microphone fonctionne** dans d'autres applications 