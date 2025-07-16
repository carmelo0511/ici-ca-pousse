// Script pour nettoyer les défis existants du localStorage
// À exécuter une seule fois pour migrer vers Firebase

console.log('🧹 Nettoyage des défis existants...');

// Récupérer tous les clés localStorage
const keys = Object.keys(localStorage);

// Trouver les clés liées aux défis
const challengeKeys = keys.filter(key => key.startsWith('challenges_'));

console.log(`📋 Défis trouvés: ${challengeKeys.length}`);

// Supprimer les défis du localStorage
challengeKeys.forEach(key => {
  console.log(`🗑️ Suppression de ${key}`);
  localStorage.removeItem(key);
});

console.log('✅ Nettoyage terminé !');
console.log('💡 Les nouveaux défis seront maintenant stockés dans Firebase'); 