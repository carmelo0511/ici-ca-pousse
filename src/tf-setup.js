/**
 * Configuration TensorFlow.js pour le navigateur
 * Évite les conflits avec Node.js backend
 */

// Import des backends explicitement
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

// Configuration pour forcer l'utilisation du backend WebGL ou CPU
import * as tf from '@tensorflow/tfjs';

// Fonction d'initialisation TensorFlow
export const initializeTensorFlow = async () => {
  try {
    // Attendre que TensorFlow soit prêt
    await tf.ready();
    
    console.log('TensorFlow.js initialisé avec backend:', tf.getBackend());
    
    // Vérifier les backends disponibles
    const backends = tf.engine().registryFactory;
    console.log('Backends disponibles:', Object.keys(backends));
    
    return true;
  } catch (error) {
    console.error('Erreur d\'initialisation TensorFlow:', error);
    return false;
  }
};

// Configuration par défaut
export const tensorFlowConfig = {
  // Forcer l'utilisation du backend WebGL si disponible, sinon CPU
  preferredBackend: 'webgl',
  fallbackBackend: 'cpu'
};

export default { initializeTensorFlow, tensorFlowConfig };