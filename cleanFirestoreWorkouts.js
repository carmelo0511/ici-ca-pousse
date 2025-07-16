// Script Node.js pour nettoyer le champ 'id' à la racine des documents 'workouts' dans Firestore
// Usage : node cleanFirestoreWorkouts.js
// Prérequis : npm install firebase-admin
// Remplacez './serviceAccountKey.json' par le chemin de votre fichier de credentials Firebase

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json'); // <-- À adapter avec votre chemin

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function cleanWorkoutsIdField() {
  const snapshot = await db.collection('workouts').get();
  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if ('id' in data) {
      await db.collection('workouts').doc(doc.id).update({
        id: FieldValue.delete()
      });
      console.log(`Champ 'id' supprimé pour le document : ${doc.id}`);
      count++;
    }
  }
  console.log(`Nettoyage terminé. ${count} documents modifiés.`);
}

cleanWorkoutsIdField().catch(console.error); 