/**
 * Configuration de l'API selon l'environnement
 */

const API_CONFIG = {
  // URL de l'API Python ML
  PYTHON_ML_API: {
    development: process.env.REACT_APP_PYTHON_API_URL || 'http://localhost:8000',
    production: process.env.REACT_APP_PYTHON_API_URL || 'https://ici-ca-pousse.vercel.app/api',
    test: 'http://localhost:8000'
  },
  
  // Timeouts et intervalles
  TIMEOUTS: {
    healthCheck: 5000,        // 5 secondes
    prediction: 10000,        // 10 secondes
    training: 30000           // 30 secondes
  },
  
  // Intervalles de vérification
  INTERVALS: {
    healthCheck: 60000,       // 1 minute
    availabilityCheck: 300000 // 5 minutes
  }
};

/**
 * Obtient l'URL de l'API selon l'environnement
 */
export const getApiUrl = (service = 'PYTHON_ML_API') => {
  const env = process.env.NODE_ENV || 'development';
  return API_CONFIG[service][env] || API_CONFIG[service].development;
};

/**
 * Obtient la configuration complète
 */
export const getApiConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return {
    ...API_CONFIG,
    currentEnvironment: env,
    currentApiUrl: getApiUrl()
  };
};

export default API_CONFIG;
