# Configuration Firebase Storage pour les photos de profil

## Problème actuel

Les erreurs CORS 404 indiquent que Firebase Storage n'est pas configuré correctement pour permettre l'upload et la lecture des photos de profil.

## Solution

### 1. Activer Firebase Storage

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet "ici-ca-pousse"
3. Dans le menu de gauche, cliquez sur "Storage"
4. Si Storage n'est pas activé, cliquez sur "Commencer"
5. Choisissez un emplacement (ex: europe-west1)
6. Cliquez sur "Suivant" puis "Terminé"

### 2. Configurer les règles de sécurité

1. Dans Firebase Storage, cliquez sur l'onglet "Règles"
2. Remplacez le contenu par les règles suivantes :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Règles pour les photos de profil
    match /profile-pictures/{userId}/{allPaths=**} {
      // Permettre la lecture à tous les utilisateurs authentifiés
      allow read: if request.auth != null;

      // Permettre l'écriture seulement à l'utilisateur propriétaire
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // 5MB max
                   && request.resource.contentType.matches('image/.*');
    }

    // Règles par défaut - refuser tout le reste
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

3. Cliquez sur "Publier"

### 3. Vérifier la configuration

1. Assurez-vous que l'authentification Firebase est activée
2. Vérifiez que les utilisateurs peuvent se connecter
3. Testez l'upload d'une photo de profil

### 4. Alternative temporaire (si les règles ne fonctionnent pas)

Si les erreurs persistent, vous pouvez temporairement utiliser des règles plus permissives pour le développement :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ ATTENTION : Ces règles sont moins sécurisées et ne doivent être utilisées que pour le développement.**

## Test

Après avoir configuré les règles :

1. Rechargez l'application
2. Essayez de changer votre photo de profil
3. Vérifiez que les photos s'affichent correctement dans le leaderboard et la liste d'amis

## Dépannage

- **Erreur 404** : Firebase Storage n'est pas activé
- **Erreur CORS** : Les règles de sécurité ne sont pas correctes
- **Erreur d'autorisation** : L'utilisateur n'est pas connecté
- **Erreur de quota** : Limite de stockage atteinte
