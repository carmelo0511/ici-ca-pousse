import { lazy, Suspense, Component } from 'react';
import useMobilePerformance from '../../hooks/useMobilePerformance';

// Composant de chargement optimisé pour mobile
const MobileLoadingSpinner = ({ message = 'Chargement...', minimal = false }) => {
  const { deviceInfo } = useMobilePerformance();
  
  if (minimal || deviceInfo.isLowEnd) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500 text-sm">{message}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
        <div className="mt-2 text-sm text-gray-500 text-center">{message}</div>
      </div>
    </div>
  );
};

// Wrapper de suspense intelligent pour mobile
export const MobileSuspense = ({ 
  children, 
  fallback = <MobileLoadingSpinner />, 
  errorBoundary = true 
}) => {
  const { deviceInfo } = useMobilePerformance();

  // Fallback minimal pour appareils bas de gamme
  const optimizedFallback = deviceInfo.isLowEnd ? 
    <MobileLoadingSpinner minimal={true} /> : 
    fallback;

  if (errorBoundary) {
    return (
      <ErrorBoundary>
        <Suspense fallback={optimizedFallback}>
          {children}
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <Suspense fallback={optimizedFallback}>
      {children}
    </Suspense>
  );
};

// Boundary d'erreur simple
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Code splitting error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-red-500 text-2xl mb-2">⚠️</div>
            <div className="text-gray-600 text-sm">Erreur de chargement</div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600"
            >
              Recharger
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Utilitaire de lazy loading conditionnel
export const createConditionalLazy = (
  importFunc,
  condition = () => true,
  fallbackComponent = null
) => {
  return lazy(async () => {
    if (!condition()) {
      return fallbackComponent ? { default: fallbackComponent } : 
        { default: () => <div>Composant non disponible</div> };
    }

    try {
      const module = await importFunc();
      return module;
    } catch (error) {
      console.error('Erreur lors du chargement du module:', error);
      return { 
        default: () => (
          <div className="p-4 text-center text-red-500">
            Erreur de chargement du composant
          </div>
        ) 
      };
    }
  });
};

// Composants lazy avec optimisations mobiles
export const LazyComponents = {
  // Composants principaux
  Chatbot: createConditionalLazy(
    () => import('../../components/Chatbot/Chatbot'),
    () => !useMobilePerformance().deviceInfo?.isLowEnd || true
  ),
  
  WorkoutList: createConditionalLazy(
    () => import('../../components/Workout/WorkoutList/WorkoutList')
  ),
  
  Leaderboard: createConditionalLazy(
    () => import('../../components/Leaderboard/Leaderboard'),
    () => navigator.onLine // Seulement si en ligne
  ),
  
  ProfilePage: createConditionalLazy(
    () => import('../../components/Profile/ProfilePage')
  ),
  
  BadgesPage: createConditionalLazy(
    () => import('../../components/Badges/BadgesPage')
  ),
  
  StatsView: createConditionalLazy(
    () => import('../../components/StatsView/StatsView')
  ),
  
  CalendarView: createConditionalLazy(
    () => import('../../components/CalendarView/CalendarView')
  ),

  // Composants moins critiques
  MonitoringDashboard: createConditionalLazy(
    () => import('../../components/Chatbot/MonitoringDashboard'),
    () => process.env.NODE_ENV === 'development'
  ),
  
  WorkoutTemplates: createConditionalLazy(
    () => import('../../components/Workout/WorkoutTemplates')
  )
};

// Hooks lazy
export const LazyHooks = {
  useChatGPT: createConditionalLazy(
    () => import('../../hooks/useChatGPTRefactored')
  ),
  
  useWorkouts: createConditionalLazy(
    () => import('../../hooks/useWorkouts')
  ),
  
  useBadges: createConditionalLazy(
    () => import('../../hooks/useBadges')
  ),
  
  useChallenges: createConditionalLazy(
    () => import('../../hooks/useChallenges')
  )
};

// Préchargement intelligent des composants
export const preloadComponents = (componentNames = [], priority = 'low') => {
  if (!Array.isArray(componentNames)) {
    componentNames = [componentNames];
  }

  const { deviceInfo } = useMobilePerformance();
  
  // Ne pas précharger sur appareils bas de gamme ou réseau lent
  if (deviceInfo.isLowEnd || deviceInfo.isSlowNetwork) {
    return Promise.resolve();
  }

  const preloadPromises = componentNames.map(name => {
    const component = LazyComponents[name];
    if (!component) {
      console.warn(`Composant ${name} non trouvé pour le préchargement`);
      return Promise.resolve();
    }

    // Utiliser requestIdleCallback si disponible
    if ('requestIdleCallback' in window && priority === 'low') {
      return new Promise((resolve) => {
        requestIdleCallback(() => {
          component().then(resolve).catch(resolve);
        });
      });
    }

    return component();
  });

  return Promise.allSettled(preloadPromises);
};

// Préchargement basé sur les routes
export const preloadForRoute = (routeName) => {
  const routePreloadMap = {
    home: ['Chatbot'],
    workout: ['WorkoutList', 'WorkoutTemplates'],
    profile: ['ProfilePage', 'StatsView'],
    leaderboard: ['Leaderboard'],
    badges: ['BadgesPage'],
    calendar: ['CalendarView']
  };

  const components = routePreloadMap[routeName] || [];
  return preloadComponents(components);
};

// Optimisation du prefetch selon la connexion
export const intelligentPrefetch = () => {
  const { deviceInfo } = useMobilePerformance();
  
  if (deviceInfo.isSlowNetwork || deviceInfo.isLowEnd) {
    return; // Pas de prefetch sur connexions lentes
  }

  // Précharger les composants critiques après le chargement initial
  const prefetchCritical = () => {
    preloadComponents(['Chatbot', 'WorkoutList'], 'high');
  };

  // Précharger les composants secondaires quand idle
  const prefetchSecondary = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        preloadComponents(['ProfilePage', 'StatsView', 'BadgesPage'], 'low');
      });
    }
  };

  // Démarrer le prefetch après le load
  if (document.readyState === 'complete') {
    setTimeout(prefetchCritical, 1000);
    setTimeout(prefetchSecondary, 3000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(prefetchCritical, 1000);
      setTimeout(prefetchSecondary, 3000);
    });
  }
};

// Utilitaire pour mesurer les performances de chargement
export const measureComponentLoad = (componentName) => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`📦 ${componentName} chargé en ${duration.toFixed(2)}ms`);
      
      // Envoyer les métriques si nécessaire
      if (window.gtag) {
        window.gtag('event', 'timing_complete', {
          name: 'component_load',
          value: Math.round(duration),
          custom_parameter: componentName
        });
      }
      
      return duration;
    }
  };
};

// Auto-initialisation du prefetch intelligent
if (typeof window !== 'undefined') {
  intelligentPrefetch();
}

export default {
  MobileSuspense,
  LazyComponents,
  LazyHooks,
  preloadComponents,
  preloadForRoute,
  measureComponentLoad
};