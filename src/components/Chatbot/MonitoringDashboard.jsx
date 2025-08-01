import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const MonitoringDashboard = ({
  monitoringStats,
  functionStats,
  performanceTrends,
  alerts,
  safetyStats,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const formatUptime = (uptime) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'amélioration':
        return '📈';
      case 'détérioration':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">📊 Dashboard Monitoring IA</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {['overview', 'functions', 'trends', 'alerts', 'safety'].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab === 'overview' && "📈 Vue d'ensemble"}
                {tab === 'functions' && '🔧 Fonctions'}
                {tab === 'trends' && '📊 Tendances'}
                {tab === 'alerts' && '⚠️ Alertes'}
                {tab === 'safety' && '🔒 Sécurité'}
              </button>
            )
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Statistiques globales */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {monitoringStats?.totalRequests || 0}
                  </div>
                  <div className="text-sm text-gray-600">Requêtes totales</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {monitoringStats?.successRate || '0%'}
                  </div>
                  <div className="text-sm text-gray-600">Taux de succès</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {monitoringStats?.averageResponseTime || '0ms'}
                  </div>
                  <div className="text-sm text-gray-600">Temps de réponse</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {monitoringStats?.averageSatisfaction || '0%'}
                  </div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {safetyStats?.safetyRate || '100%'}
                  </div>
                  <div className="text-sm text-gray-600">Sécurité</div>
                </div>
              </div>

              {/* Métriques détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">📊 Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className="font-mono">
                        {formatUptime(monitoringStats?.uptime || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache hit rate:</span>
                      <span className="font-mono">
                        {monitoringStats?.cacheHitRate || '0%'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fonctions utilisées:</span>
                      <span className="font-mono">
                        {monitoringStats?.functionCallCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Appels de fonctions:</span>
                      <span className="font-mono">
                        {monitoringStats?.totalFunctionCalls || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">🎯 Qualité</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Requêtes réussies:</span>
                      <span className="font-mono">
                        {monitoringStats?.successfulRequests || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Session ID:</span>
                      <span className="font-mono text-xs">
                        {monitoringStats?.sessionId || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'functions' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                🔧 Statistiques par fonction
              </h3>
              {functionStats && functionStats.length > 0 ? (
                <div className="space-y-3">
                  {functionStats.map((fn, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-blue-600">
                          {fn.name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            parseFloat(fn.successRate) >= 90
                              ? 'bg-green-100 text-green-800'
                              : parseFloat(fn.successRate) >= 80
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {fn.successRate}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Appels:</span>
                          <span className="font-mono ml-2">{fn.count}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Temps moyen:</span>
                          <span className="font-mono ml-2">
                            {fn.averageExecutionTime}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Erreurs:</span>
                          <span className="font-mono ml-2">
                            {fn.errorCount}
                          </span>
                        </div>
                      </div>
                      {fn.lastCalled && (
                        <div className="text-xs text-gray-500 mt-2">
                          Dernier appel:{' '}
                          {new Date(fn.lastCalled).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Aucune fonction utilisée pour le moment
                </div>
              )}
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">
                📊 Tendances de performance
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Temps de réponse</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {getTrendIcon(performanceTrends?.responseTimeTrend)}
                    </span>
                    <span className="capitalize">
                      {performanceTrends?.responseTimeTrend || 'stable'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Moyenne récente:{' '}
                    {performanceTrends?.recentPerformance?.avgResponseTime || 0}
                    ms
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">
                    Satisfaction utilisateur
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {getTrendIcon(performanceTrends?.satisfactionTrend)}
                    </span>
                    <span className="capitalize">
                      {performanceTrends?.satisfactionTrend || 'stable'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Moyenne récente:{' '}
                    {performanceTrends?.recentPerformance?.avgSatisfaction || 0}
                    %
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                ⚠️ Alertes de performance
              </h3>

              {alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'high'
                          ? 'bg-red-50 border-red-500'
                          : alert.severity === 'medium'
                            ? 'bg-yellow-50 border-yellow-500'
                            : 'bg-green-50 border-green-500'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-xl">
                          {getAlertIcon(alert.severity)}
                        </span>
                        <div>
                          <div className="font-semibold capitalize">
                            {alert.type}
                          </div>
                          <div className="text-sm text-gray-600">
                            {alert.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-green-600 py-8">
                  ✅ Aucune alerte - Tout fonctionne correctement !
                </div>
              )}
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">
                🔒 Validation de Sécurité
              </h3>

              {/* Statistiques de sécurité */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {safetyStats?.totalValidations || 0}
                  </div>
                  <div className="text-sm text-gray-600">Validations</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {safetyStats?.averageSafetyScore || 100}
                  </div>
                  <div className="text-sm text-gray-600">Score moyen</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {safetyStats?.criticalIssues || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Problèmes critiques
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {safetyStats?.warnings || 0}
                  </div>
                  <div className="text-sm text-gray-600">Avertissements</div>
                </div>
              </div>

              {/* Détails de sécurité */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">📊 Détails de Sécurité</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Recommandations sûres:</span>
                    <span className="font-mono">
                      {safetyStats?.safeRecommendations || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux de sécurité:</span>
                    <span className="font-mono">
                      {safetyStats?.safetyRate || 100}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Score de sécurité moyen:</span>
                    <span className="font-mono">
                      {safetyStats?.averageSafetyScore || 100}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommandations de sécurité */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">
                  💡 Recommandations de Sécurité
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    • Toutes les recommandations sont validées automatiquement
                  </div>
                  <div>
                    • Les exercices dangereux sont automatiquement détectés
                  </div>
                  <div>
                    • Les limites d'intensité sont adaptées au niveau
                    utilisateur
                  </div>
                  <div>• Les conditions médicales sont prises en compte</div>
                  <div>• Les avertissements sont affichés en cas de risque</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Dernière mise à jour: {new Date().toLocaleString()}</span>
            <span>
              Session: {monitoringStats?.sessionId?.substring(0, 8) || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

MonitoringDashboard.propTypes = {
  monitoringStats: PropTypes.object,
  functionStats: PropTypes.array,
  performanceTrends: PropTypes.object,
  alerts: PropTypes.array,
  safetyStats: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default MonitoringDashboard;
