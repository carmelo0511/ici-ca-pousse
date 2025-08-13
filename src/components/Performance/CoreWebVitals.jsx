import React, { useState, useEffect } from 'react';
import { Activity, Clock, Zap, Layers, Smartphone, Wifi, AlertTriangle } from 'lucide-react';
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

  // Déterminer la couleur selon l'état de l'appareil
  const getDeviceColor = () => {
    if (isLowEndDevice) return 'text-red-500 bg-red-100';
    if (connectionSpeed === 'slow') return 'text-yellow-500 bg-yellow-100';
    return 'text-green-500 bg-green-100';
  };

  const deviceScore = isLowEndDevice ? 'Bas de gamme' : 
                     connectionSpeed === 'slow' ? 'Réseau lent' : 'Optimal';

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Performance Mobile
          </h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
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
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-xs font-medium text-gray-900 mb-1">Optimisations actives</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Animations: {optimizations.enableAnimations ? 'Activées' : 'Désactivées'}</div>
              <div>• Qualité image: {optimizations.imageQuality}</div>
              <div>• Cache: {optimizations.cacheStrategy}</div>
              <div>• Calculs complexes: {optimizations.enableComplexCalculations ? 'Oui' : 'Non'}</div>
            </div>
          </div>
        </div>

        {/* Info appareil */}
        <div className="border-t pt-3 mb-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-gray-500" />
              <span>Appareil</span>
            </div>
            <span className={
              isLowEndDevice ? 'text-red-600' : 'text-green-600'
            }>
              {isMobile ? 'Mobile' : 'Desktop'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs mt-1">
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-gray-500" />
              <span>Connexion</span>
            </div>
            <span className={
              connectionSpeed === 'slow' ? 'text-red-600' : connectionSpeed === 'medium' ? 'text-yellow-600' : 'text-green-600'
            }>
              {connectionSpeed.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Optimisations recommandées */}
        <div className="border-t pt-3">
          <div 
            className="flex items-center gap-2 text-xs font-medium text-gray-900 cursor-pointer"
            onClick={() => setExpandedSection(
              expandedSection === 'optimizations' ? null : 'optimizations'
            )}
          >
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
            Optimisations
          </div>
          
          {expandedSection === 'optimizations' && (
            <div className="mt-2 space-y-1">
              {isLowEndDevice && (
                <div className="text-xs text-gray-600 p-2 bg-yellow-50 rounded">
                  <div className="font-medium text-gray-800">Appareil bas de gamme détecté</div>
                  <div className="mt-1">
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      Animations réduites
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      Cache agressif activé
                    </div>
                  </div>
                </div>
              )}
              {connectionSpeed === 'slow' && (
                <div className="text-xs text-gray-600 p-2 bg-yellow-50 rounded">
                  <div className="font-medium text-gray-800">Connexion lente détectée</div>
                  <div className="mt-1">
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      Lazy loading agressif
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      Images compressées
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="border-t pt-3 mt-3">
          <div className="flex gap-2">
            <button
              onClick={() => {
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
                }
                window.location.reload();
              }}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
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
              className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
            >
              Export
            </button>
          </div>
        </div>

        {/* Toggle persistant */}
        <div className="border-t pt-2 mt-2">
          <label className="flex items-center gap-2 text-xs text-gray-600">
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