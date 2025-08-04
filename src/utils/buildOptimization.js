// Optimisations de build et de production

// Configuration pour le code splitting
export const lazyLoadComponent = (importFunc, fallback = null) => {
  // Note: This function should be used in .jsx files where React is imported
  // For now, we'll export a function that returns the import function
  return importFunc;
};

// Optimisation des imports
export const optimizeImports = {
  // Imports conditionnels pour les fonctionnalités avancées
  advancedFeatures: () => import('./advancedFeatures'),
  
  // Imports conditionnels pour les composants lourds
  heavyComponents: () => import('./heavyComponents'),
  
  // Imports conditionnels pour les utilitaires
  utilities: () => import('./utilities'),
};

// Configuration pour le tree shaking
export const treeShakingConfig = {
  // Fonctions pures pour permettre le tree shaking
  pureFunctions: {
    calculateStats: (workouts) => {
      // Fonction pure pour calculer les statistiques
      return workouts.reduce((stats, workout) => {
        return {
          totalWorkouts: stats.totalWorkouts + 1,
          totalSets: stats.totalSets + (workout.totalSets || 0),
          totalReps: stats.totalReps + (workout.totalReps || 0),
          totalWeight: stats.totalWeight + (workout.totalWeight || 0),
        };
      }, {
        totalWorkouts: 0,
        totalSets: 0,
        totalReps: 0,
        totalWeight: 0,
      });
    },
    
    filterWorkouts: (workouts, filter) => {
      // Fonction pure pour filtrer les workouts
      return workouts.filter(workout => {
        switch (filter.type) {
          case 'date':
            return workout.date === filter.value;
          case 'muscle':
            return workout.exercises.some(ex => ex.type === filter.value);
          case 'duration':
            return workout.duration >= filter.min && workout.duration <= filter.max;
          default:
            return true;
        }
      });
    },
  },
};

// Configuration pour la compression
export const compressionConfig = {
  // Niveaux de compression pour différents types de données
  levels: {
    text: 6, // Niveau optimal pour le texte
    json: 6, // Niveau optimal pour JSON
    images: 8, // Niveau optimal pour les images
  },
  
  // Types de compression supportés
  types: ['gzip', 'brotli'],
  
  // Taille minimale pour la compression
  minSize: 1024, // 1KB
};

// Configuration pour le cache
export const cacheConfig = {
  // Stratégies de cache
  strategies: {
    // Cache pour les données statiques
    static: {
      maxAge: 31536000, // 1 an
      immutable: true,
    },
    
    // Cache pour les données dynamiques
    dynamic: {
      maxAge: 3600, // 1 heure
      staleWhileRevalidate: 86400, // 1 jour
    },
    
    // Cache pour les données utilisateur
    user: {
      maxAge: 300, // 5 minutes
      private: true,
    },
  },
  
  // Clés de cache
  keys: {
    workouts: 'workouts',
    templates: 'templates',
    stats: 'stats',
    user: 'user',
  },
};

// Configuration pour les performances
export const performanceConfig = {
  // Métriques de performance
  metrics: {
    // First Contentful Paint
    fcp: 2000, // 2 secondes
    
    // Largest Contentful Paint
    lcp: 2500, // 2.5 secondes
    
    // First Input Delay
    fid: 100, // 100ms
    
    // Cumulative Layout Shift
    cls: 0.1, // 0.1
  },
  
  // Optimisations automatiques
  optimizations: {
    // Préchargement des ressources critiques
    preload: [
      '/static/js/main.chunk.js',
      '/static/css/main.chunk.css',
    ],
    
    // Préconnexion aux domaines externes
    preconnect: [
      'https://firebase.googleapis.com',
      'https://fonts.googleapis.com',
    ],
    
    // DNS prefetch
    dnsPrefetch: [
      'https://firebase.googleapis.com',
      'https://fonts.googleapis.com',
    ],
  },
};

// Configuration pour le monitoring
export const monitoringConfig = {
  // Métriques à surveiller
  metrics: {
    // Performance
    performance: {
      enabled: true,
      interval: 5000, // 5 secondes
    },
    
    // Erreurs
    errors: {
      enabled: true,
      captureUnhandled: true,
    },
    
    // Utilisation des ressources
    resources: {
      enabled: true,
      interval: 10000, // 10 secondes
    },
  },
  
  // Seuils d'alerte
  thresholds: {
    memory: 50 * 1024 * 1024, // 50MB
    cpu: 80, // 80%
    network: 1000, // 1 seconde
  },
};

// Configuration pour l'optimisation des images
export const imageOptimizationConfig = {
  // Formats supportés
  formats: ['webp', 'avif', 'jpeg', 'png'],
  
  // Tailles d'images
  sizes: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
  },
  
  // Qualité de compression
  quality: {
    webp: 80,
    jpeg: 85,
    png: 9,
  },
};

// Configuration pour l'optimisation des bundles
export const bundleOptimizationConfig = {
  // Taille maximale des chunks
  maxChunkSize: 244 * 1024, // 244KB
  
  // Nombre maximum de chunks
  maxChunks: 10,
  
  // Chunks à exclure de la division
  excludeChunks: ['vendor', 'runtime'],
  
  // Optimisations spécifiques
  optimizations: {
    // Minification
    minify: true,
    
    // Tree shaking
    treeShaking: true,
    
    // Dead code elimination
    deadCodeElimination: true,
    
    // Scope hoisting
    scopeHoisting: true,
  },
};

// Configuration pour l'optimisation du réseau
export const networkOptimizationConfig = {
  // Stratégies de mise en cache
  caching: {
    // Cache-first pour les ressources statiques
    static: {
      strategy: 'cache-first',
      maxAge: 31536000,
    },
    
    // Network-first pour les données dynamiques
    dynamic: {
      strategy: 'network-first',
      maxAge: 3600,
    },
    
    // Stale-while-revalidate pour les données semi-statiques
    semiStatic: {
      strategy: 'stale-while-revalidate',
      maxAge: 86400,
    },
  },
  
  // Optimisations de requêtes
  requests: {
    // Debouncing des requêtes
    debounce: 300,
    
    // Throttling des requêtes
    throttle: 1000,
    
    // Retry automatique
    retry: {
      attempts: 3,
      delay: 1000,
    },
  },
};

// Configuration pour l'optimisation de la mémoire
export const memoryOptimizationConfig = {
  // Limites de mémoire
  limits: {
    // Taille maximale du cache
    cacheSize: 50 * 1024 * 1024, // 50MB
    
    // Nombre maximum d'éléments en cache
    maxCacheItems: 1000,
    
    // Taille maximale des données en mémoire
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  },
  
  // Stratégies de nettoyage
  cleanup: {
    // Nettoyage automatique
    auto: true,
    
    // Intervalle de nettoyage
    interval: 300000, // 5 minutes
    
    // Stratégie de nettoyage
    strategy: 'lru', // Least Recently Used
  },
};

// Configuration pour l'optimisation des animations
export const animationOptimizationConfig = {
  // Utilisation de requestAnimationFrame
  useRequestAnimationFrame: true,
  
  // Limitation du nombre d'animations simultanées
  maxConcurrentAnimations: 5,
  
  // Optimisation des transitions CSS
  cssTransitions: {
    // Utilisation de transform au lieu de position
    useTransform: true,
    
    // Utilisation de opacity au lieu de visibility
    useOpacity: true,
    
    // Hardware acceleration
    hardwareAcceleration: true,
  },
  
  // Optimisation des animations JavaScript
  jsAnimations: {
    // Utilisation de Web Animations API
    useWebAnimations: true,
    
    // Utilisation de CSS Custom Properties
    useCustomProperties: true,
    
    // Optimisation des calculs
    optimizeCalculations: true,
  },
};

// Configuration pour l'optimisation de l'accessibilité
export const accessibilityOptimizationConfig = {
  // Support des lecteurs d'écran
  screenReaders: {
    enabled: true,
    announcements: true,
    landmarks: true,
  },
  
  // Support du clavier
  keyboard: {
    enabled: true,
    focusManagement: true,
    shortcuts: true,
  },
  
  // Support des préférences utilisateur
  preferences: {
    reducedMotion: true,
    highContrast: true,
    largeText: true,
  },
};

// Configuration pour l'optimisation de la sécurité
export const securityOptimizationConfig = {
  // Headers de sécurité
  headers: {
    'Content-Security-Policy': "default-src 'self'",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
  
  // Validation des données
  validation: {
    enabled: true,
    sanitization: true,
    typeChecking: true,
  },
  
  // Protection contre les attaques
  protection: {
    xss: true,
    csrf: true,
    injection: true,
  },
};

// Export de toutes les configurations
export const buildOptimizations = {
  treeShaking: treeShakingConfig,
  compression: compressionConfig,
  cache: cacheConfig,
  performance: performanceConfig,
  monitoring: monitoringConfig,
  images: imageOptimizationConfig,
  bundles: bundleOptimizationConfig,
  network: networkOptimizationConfig,
  memory: memoryOptimizationConfig,
  animations: animationOptimizationConfig,
  accessibility: accessibilityOptimizationConfig,
  security: securityOptimizationConfig,
}; 