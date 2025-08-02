# 🚀 Guide Zapier - Bilan Hebdomadaire Automatique

## ⚡ **Configuration en 5 minutes :**

### 1. **Créer un compte Zapier**
- Allez sur [zapier.com](https://zapier.com)
- Cliquez sur "Sign up free"
- Créez votre compte

### 2. **Créer le Zap**

1. **Cliquez sur "Create Zap"**
2. **Nommez-le :** "Bilan Hebdomadaire Ici Ça Pousse"

### 3. **Déclencheur (Trigger)**

1. **Recherchez "Schedule by Zapier"**
2. **Configurez :**
   - **Trigger :** "Every Monday at 9:00 AM"
   - **Timezone :** Votre fuseau horaire

### 4. **Action Webhook**

1. **Recherchez "Webhooks by Zapier"**
2. **Configurez :**
   - **Event :** "POST"
   - **URL :** `https://ici-ca-pousse.vercel.app/api/zapier-webhook`
   - **Payload Type :** JSON
   - **Data :**
     ```json
     {
       "action": "weekly-report",
       "email": "test@example.com"
     }
     ```

### 5. **Action Email**

1. **Recherchez "Gmail"**
2. **Connectez votre compte Gmail**
3. **Configurez :**
   - **To :** `{{ 2.email }}`
   - **Subject :** `🏋️‍♂️ Votre bilan hebdomadaire - Ici Ça Pousse`
   - **Body :** Template HTML (voir ci-dessous)

### 6. **Template Email**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; padding: 30px; text-align: center; border-radius: 10px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin: 20px 0; }
        .stats { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; }
        .highlight { color: #667eea; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏋️‍♂️ Votre Bilan Hebdomadaire</h1>
            <p>Semaine du {{ 2.weekStart }} au {{ 2.weekEnd }}</p>
        </div>
        
        <div class="content">
            <p>{{ 2.report.summary }}</p>
        </div>
        
        <div class="stats">
            <h3>📊 Statistiques de la semaine</h3>
            <p><span class="highlight">{{ 2.report.totalWorkouts }}</span> séances effectuées</p>
            <p><span class="highlight">{{ 2.report.totalSets }}</span> séries réalisées</p>
            <p><span class="highlight">{{ 2.report.totalReps }}</span> répétitions totales</p>
            <p><span class="highlight">{{ 2.report.totalWeight }}</span> kg soulevés</p>
            <p><span class="highlight">{{ 2.report.avgDuration }}</span> min de durée moyenne</p>
        </div>
        
        <div class="footer">
            <p>💪 Continuez comme ça ! Votre coach IA vous accompagne dans votre progression.</p>
            <p>Ici Ça Pousse - Votre partenaire fitness intelligent</p>
        </div>
    </div>
</body>
</html>
```

### 7. **Tester et Activer**

1. **Cliquez sur "Test trigger"** ✅
2. **Cliquez sur "Test action"** ✅
3. **Cliquez sur "Turn on Zap"** 🚀

## ✅ **C'est tout !**

Chaque lundi à 9h00, Zapier :
- ✅ Déclenche automatiquement
- ✅ Appelle votre webhook
- ✅ Envoie l'email personnalisé

## 🎯 **Avantages Zapier :**

- ⚡ **Configuration en 5 minutes**
- 🔒 **Pas de problèmes d'authentification**
- 📧 **Intégrations prêtes (Gmail, Outlook, etc.)**
- 🆓 **Gratuit pour 100 exécutions/mois**
- 🎨 **Interface intuitive**

**Zapier est la solution la plus simple ! 🚀** 