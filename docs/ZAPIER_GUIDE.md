# 🚀 Guide Zapier - Bilan Hebdomadaire Automatique

## 📋 **Étapes pour configurer Zapier :**

### 1. **Créer un compte Zapier**
- Allez sur [zapier.com](https://zapier.com)
- Créez un compte gratuit

### 2. **Créer un nouveau Zap**

1. **Cliquez sur "Create Zap"**
2. **Nommez-le :** "Bilan Hebdomadaire Ici Ça Pousse"

### 3. **Configurer le déclencheur (Trigger)**

1. **Recherchez "Schedule by Zapier"**
2. **Configurez :**
   - **Trigger :** "Every Monday at 9:00 AM"
   - **Timezone :** Votre fuseau horaire

### 4. **Configurer l'action Webhook**

1. **Recherchez "Webhooks by Zapier"**
2. **Configurez :**
   - **Event :** "POST"
   - **URL :** `https://ici-ca-pousse-3-407tw1w9a-bryan-nakache-s-projects.vercel.app/api/zapier-webhook`
   - **Payload Type :** JSON
   - **Data :**
     ```json
     {
       "action": "weekly-report",
       "email": "{{ 1.email }}"
     }
     ```

### 5. **Configurer l'envoi d'email**

1. **Ajoutez une action "Gmail"**
2. **Configurez :**
   - **To :** `{{ 2.email }}`
   - **Subject :** `🏋️‍♂️ Votre bilan hebdomadaire - Ici Ça Pousse`
   - **Body :** Template HTML (voir ci-dessous)

### 6. **Template Email HTML**

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

### 7. **Tester le Zap**

1. **Cliquez sur "Test trigger"** pour tester le déclencheur
2. **Cliquez sur "Test action"** pour tester l'envoi d'email
3. **Activez le Zap** quand tout fonctionne

## ✅ **Avantages de Zapier :**

- ✅ **Plus simple** que n8n
- ✅ **Pas de problèmes d'authentification**
- ✅ **Interface intuitive**
- ✅ **Intégrations prêtes à l'emploi**
- ✅ **Gratuit** pour 100 exécutions/mois

## 🎯 **Résultat :**

Chaque lundi à 9h00, Zapier :
1. **Déclenche** automatiquement
2. **Appelle** votre webhook
3. **Génère** le rapport
4. **Envoie** l'email personnalisé

**Zapier est effectivement plus simple pour ce cas d'usage ! 🚀** 