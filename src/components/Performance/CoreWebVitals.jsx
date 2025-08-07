import React, { useState, useEffect } from 'react';
import { Activity, Clock, Zap, Layers, Smartphone, Wifi, AlertTriangle } from 'lucide-react';
import useMobilePerformance from '../../hooks/useMobilePerformance';

const CoreWebVitals = ({ className = '' }) => {
  const {
    performanceMetrics,
    performanceScore,
    recommendations,
    deviceInfo
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

  // Déterminer la couleur selon le score
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500 bg-green-100';
    if (score >= 70) return 'text-yellow-500 bg-yellow-100';
    return 'text-red-500 bg-red-100';
  };

  // Déterminer la couleur selon la métrique
  const getMetricColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'text-green-500';
    if (value <= thresholds.needs_improvement) return 'text-yellow-500';
    return 'text-red-500';
  };

  const metrics = [
    {
      key: 'fcp',
      name: 'First Contentful Paint',
      description: 'Temps avant le premier élément visible',
      value: performanceMetrics.fcp,
      unit: 'ms',
      icon: Clock,
      thresholds: { good: 1800, needs_improvement: 3000 }
    },
    {
      key: 'lcp',
      name: 'Largest Contentful Paint',
      description: 'Temps de chargement du plus gros élément',
      value: performanceMetrics.lcp,
      unit: 'ms',
      icon: Layers,
      thresholds: { good: 2500, needs_improvement: 4000 }
    },
    {
      key: 'fid',
      name: 'First Input Delay',
      description: 'Délai avant la première interaction',
      value: performanceMetrics.fid,
      unit: 'ms',
      icon: Zap,
      thresholds: { good: 100, needs_improvement: 300 }
    },
    {
      key: 'cls',
      name: 'Cumulative Layout Shift',
      description: 'Stabilité visuelle de la page',
      value: performanceMetrics.cls,
      unit: '',
      icon: Activity,
      thresholds: { good: 0.1, needs_improvement: 0.25 }
    }
  ];

  const deviceScore = deviceInfo.isLowEnd ? 'Bas de gamme' : 
                     deviceInfo.isSlowNetwork ? 'Réseau lent' : 'Optimal';

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
        {performanceScore && (
          <div className={`text-center p-2 rounded-lg mb-3 ${getScoreColor(performanceScore)}`}>
            <div className="text-2xl font-bold">{performanceScore}</div>
            <div className="text-xs">Score Performance</div>
          </div>
        )}

        {/* Métriques Core Web Vitals */}
        <div className="space-y-2 mb-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const value = metric.value;
            
            if (value === null || value === undefined) return null;

            const color = getMetricColor(value, metric.thresholds);
            
            return (
              <div
                key={metric.key}
                className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                onClick={() => setExpandedSection(
                  expandedSection === metric.key ? null : metric.key
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-xs font-medium text-gray-900">
                      {metric.name}
                    </div>
                    {expandedSection === metric.key && (
                      <div className="text-xs text-gray-500 mt-1">
                        {metric.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`text-sm font-semibold ${color}`}>
                  {value}{metric.unit}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info appareil */}
        <div className="border-t pt-3 mb-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-gray-500" />
              <span>Appareil</span>
            </div>
            <span className={
              deviceInfo.isLowEnd ? 'text-red-600' : 'text-green-600'
            }>
              {deviceScore}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs mt-1">
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-gray-500" />
              <span>Connexion</span>
            </div>
            <span className={
              deviceInfo.isSlowNetwork ? 'text-red-600' : 'text-green-600'
            }>
              {deviceInfo.connectionType.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Recommandations */}
        {recommendations && recommendations.length > 0 && (
          <div className="border-t pt-3">
            <div 
              className="flex items-center gap-2 text-xs font-medium text-gray-900 cursor-pointer"
              onClick={() => setExpandedSection(
                expandedSection === 'recommendations' ? null : 'recommendations'
              )}
            >
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
              Recommandations ({recommendations.length})
            </div>
            
            {expandedSection === 'recommendations' && (
              <div className="mt-2 space-y-1">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="text-xs text-gray-600 p-2 bg-yellow-50 rounded">
                    <div className="font-medium text-gray-800">{rec.message}</div>
                    <div className="mt-1">
                      {rec.actions.slice(0, 2).map((action, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
                  performanceMetrics,
                  deviceInfo,
                  performanceScore,
                  recommendations
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