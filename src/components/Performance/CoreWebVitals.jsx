import React, { useState, useEffect } from 'react';
import { Activity, Smartphone, Wifi, AlertTriangle } from 'lucide-react';
import useMobilePerformance from '../../hooks/useMobilePerformance';

const CoreWebVitals = ({ className = '' }) => {
  const {
    isMobile,
    isLowEndDevice,
    connectionSpeed,
    optimizations
  } = useMobilePerformance();

  const [isVisible, setIsVisible] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  // Afficher seulement en développement ou si explicitement demandé
  useEffect(() => {
    const showMetrics = 
      process.env.NODE_ENV === 'development' || 
      localStorage.getItem('show-performance-metrics') === 'true' ||
      new URLSearchParams(window.location.search).has('debug');
    
    setIsVisible(showMetrics);
  }, []);

  if (!isVisible) return null;

  // Déterminer la couleur selon l'état de l'appareil (harmonisée avec le thème)
  const getDeviceColor = () => {
    if (isLowEndDevice) return 'text-red-400 bg-red-900/20 border border-red-500/30';
    if (connectionSpeed === 'slow') return 'text-yellow-400 bg-yellow-900/20 border border-yellow-500/30';
    return 'text-emerald-400 bg-emerald-900/20 border border-emerald-500/30';
  };

  const deviceScore = isLowEndDevice ? 'Bas de gamme' : 
                     connectionSpeed === 'slow' ? 'Réseau lent' : 'Optimal';

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-xl border border-gray-700/50 p-4 max-w-sm">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Performance Mobile
          </h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Score global */}
        <div className={`text-center p-2 rounded-lg mb-3 ${getDeviceColor()}`}>
          <div className="text-2xl font-bold">{deviceScore}</div>
          <div className="text-xs">État Appareil</div>
        </div>

        {/* Optimisations actives */}
        <div className="space-y-2 mb-3">
          <div className="p-2 bg-gray-800/50 rounded border border-gray-700/50">
            <div className="text-xs font-medium text-gray-100 mb-1">Optimisations actives</div>
            <div className="text-xs text-gray-300 space-y-1">
              <div>• Animations: {optimizations.enableAnimations ? 'Activées' : 'Désactivées'}</div>
              <div>• Qualité image: {optimizations.imageQuality}</div>
              <div>• Cache: {optimizations.cacheStrategy}</div>
              <div>• Calculs complexes: {optimizations.enableComplexCalculations ? 'Oui' : 'Non'}</div>
            </div>
          </div>
        </div>

        {/* Info appareil */}
        <div className="border-t border-gray-700/50 pt-3 mb-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-gray-400" />
              <span className="text-gray-300">Appareil</span>
            </div>
            <span className={
              isLowEndDevice ? 'text-red-400' : 'text-emerald-400'
            }>
              {isMobile ? 'Mobile' : 'Desktop'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs mt-1">
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-gray-400" />
              <span className="text-gray-300">Connexion</span>
            </div>
            <span className={
              connectionSpeed === 'slow' ? 'text-red-400' : connectionSpeed === 'medium' ? 'text-yellow-400' : 'text-emerald-400'
            }>
              {connectionSpeed.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Optimisations recommandées */}
        <div className="border-t border-gray-700/50 pt-3">
          <div 
            className="flex items-center gap-2 text-xs font-medium text-gray-100 cursor-pointer"
            onClick={() => setExpandedSection(
              expandedSection === 'optimizations' ? null : 'optimizations'
            )}
          >
            <AlertTriangle className="w-3 h-3 text-yellow-400" />
            Optimisations
          </div>
          
                      {expandedSection === 'optimizations' && (
              <div className="mt-2 space-y-1">
                {isLowEndDevice && (
                  <div className="text-xs text-gray-300 p-2 bg-yellow-900/20 rounded border border-yellow-500/30">
                    <div className="font-medium text-yellow-300">Appareil bas de gamme détecté</div>
                    <div className="mt-1">
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                        Animations réduites
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                        Cache agressif activé
                      </div>
                    </div>
                  </div>
                )}
                {connectionSpeed === 'slow' && (
                  <div className="text-xs text-gray-300 p-2 bg-yellow-900/20 rounded border border-yellow-500/30">
                    <div className="font-medium text-yellow-300">Connexion lente détectée</div>
                    <div className="mt-1">
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                        Lazy loading agressif
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                        Images compressées
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Actions rapides */}
        <div className="border-t border-gray-700/50 pt-3 mt-3">
          <div className="flex gap-2">
            <button
              onClick={() => {
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
                }
                window.location.reload();
              }}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-2 py-1 rounded border border-gray-600/50"
            >
              Vider Cache
            </button>
            <button
              onClick={() => {
                const data = {
                  timestamp: new Date().toISOString(),
                  deviceInfo: {
                    isMobile,
                    isLowEndDevice,
                    connectionSpeed
                  },
                  optimizations
                };
                
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                  type: 'application/json'
                });
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `performance-report-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-xs bg-blue-900/50 hover:bg-blue-800/50 text-blue-200 px-2 py-1 rounded border border-blue-600/50"
            >
              Export
            </button>
          </div>
        </div>

        {/* Toggle persistant */}
        <div className="border-t border-gray-700/50 pt-2 mt-2">
          <label className="flex items-center gap-2 text-xs text-gray-300">
            <input
              type="checkbox"
              checked={localStorage.getItem('show-performance-metrics') === 'true'}
              onChange={(e) => {
                localStorage.setItem('show-performance-metrics', e.target.checked.toString());
              }}
              className="w-3 h-3"
            />
            Toujours afficher
          </label>
        </div>
      </div>
    </div>
  );
};

export default CoreWebVitals;