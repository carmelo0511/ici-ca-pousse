import React from 'react';
import PropTypes from 'prop-types';

function MonitoringDashboard({
  monitoringStats,
  functionStats,
  performanceTrends,
  alerts,
  safetyStats,
  onClose,
}) {
  // Test simple pour voir si React.useState fonctionne
  const [activeTab, setActiveTab] = React.useState('overview');

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-2 sm:p-4 pt-4 sm:pt-8">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden">
        {/* Header - Always visible */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 sm:p-3 flex-none rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-2xl font-bold">📊 Dashboard IA</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl sm:text-2xl p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs - Always visible */}
        <div className="flex border-b overflow-x-auto flex-none bg-gray-50 min-h-[45px]" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          {['overview', 'functions', 'trends', 'alerts', 'safety'].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold whitespace-nowrap text-sm flex-shrink-0 transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-1">
                  {tab === 'overview' && (<>📈 <span className="hidden sm:inline">Vue</span></>)}
                  {tab === 'functions' && (<>🔧 <span className="hidden sm:inline">Fonctions</span></>)}
                  {tab === 'trends' && (<>📊 <span className="hidden sm:inline">Tendances</span></>)}
                  {tab === 'alerts' && (<>⚠️ <span className="hidden sm:inline">Alertes</span></>)}
                  {tab === 'safety' && (<>🔒 <span className="hidden sm:inline">Sécurité</span></>)}
                </span>
              </button>
            )
          )}
        </div>

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto bg-white p-1 sm:p-2" style={{minHeight: 0}}>
          {activeTab === 'overview' && (
            <div className="space-y-3 sm:space-y-4">
              {/* Statistiques globales */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
                <div className="bg-glass-bg border border-glass-border p-2 sm:p-4 rounded-lg backdrop-blur-md shadow-glass">
                  <div className="text-lg sm:text-2xl font-bold text-glass-text">
                    {monitoringStats?.totalRequests || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-glass-text-secondary font-medium">Requêtes</div>
                </div>
                <div className="bg-glass-bg border border-glass-border p-2 sm:p-4 rounded-lg backdrop-blur-md shadow-glass">
                  <div className="text-lg sm:text-2xl font-bold text-glass-text">
                    {monitoringStats?.successRate || '0%'}
                  </div>
                  <div className="text-xs sm:text-sm text-glass-text-secondary font-medium">Succès</div>
                </div>
                <div className="bg-glass-bg border border-glass-border p-2 sm:p-4 rounded-lg backdrop-blur-md shadow-glass">
                  <div className="text-lg sm:text-2xl font-bold text-glass-text">
                    {monitoringStats?.averageResponseTime || '0ms'}
                  </div>
                  <div className="text-xs sm:text-sm text-glass-text-secondary font-medium">Réponse</div>
                </div>
                <div className="bg-glass-bg border border-glass-border p-2 sm:p-4 rounded-lg backdrop-blur-md shadow-glass">
                  <div className="text-lg sm:text-2xl font-bold text-glass-text">
                    {monitoringStats?.averageSatisfaction || '0%'}
                  </div>
                  <div className="text-xs sm:text-sm text-glass-text-secondary font-medium">Satisfaction</div>
                </div>
                <div className="bg-glass-bg border border-glass-border p-2 sm:p-4 rounded-lg backdrop-blur-md shadow-glass">
                  <div className="text-lg sm:text-2xl font-bold text-glass-text">
                    {safetyStats?.safetyRate || '100%'}
                  </div>
                  <div className="text-xs sm:text-sm text-glass-text-secondary font-medium">Sécurité</div>
                </div>
              </div>

              {/* Métriques détaillées */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-glass-bg border border-glass-border p-3 sm:p-4 rounded-lg backdrop-blur-md shadow-glass">
                  <h3 className="font-semibold text-sm sm:text-lg mb-2 sm:mb-3 text-glass-text">📊 Performance</h3>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-glass-text-secondary">Uptime:</span>
                      <span className="font-mono text-glass-text">
                        {formatUptime(monitoringStats?.uptime || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-glass-text-secondary">Cache:</span>
                      <span className="font-mono text-glass-text">
                        {monitoringStats?.cacheHitRate || '0%'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-glass-text-secondary">Fonctions:</span>
                      <span className="font-mono text-glass-text">
                        {monitoringStats?.functionCallCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-glass-text-secondary">Appels:</span>
                      <span className="font-mono text-glass-text">
                        {monitoringStats?.totalFunctionCalls || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-glass-bg border border-glass-border p-3 sm:p-4 rounded-lg backdrop-blur-md shadow-glass">
                  <h3 className="font-semibold text-sm sm:text-lg mb-2 sm:mb-3 text-glass-text">🎯 Qualité</h3>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-glass-text-secondary">Réussies:</span>
                      <span className="font-mono text-glass-text">
                        {monitoringStats?.successfulRequests || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-glass-text-secondary">Session:</span>
                      <span className="font-mono text-xs text-glass-text truncate">
                        {monitoringStats?.sessionId?.substring(0, 8) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'functions' && (
            <div className="space-y-2 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-lg text-gray-800">
                🔧 Statistiques par fonction
              </h3>
              {functionStats && functionStats.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {functionStats.map((fn, index) => (
                    <div key={index} className="bg-glass-bg border border-glass-border p-3 sm:p-4 rounded-lg backdrop-blur-md shadow-glass">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-glass-text text-sm sm:text-base truncate">
                          {fn.name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ml-2 ${
                            parseFloat(fn.successRate) >= 90
                              ? 'bg-glass-bg-secondary text-glass-text border border-glass-border'
                              : parseFloat(fn.successRate) >= 80
                                ? 'bg-glass-bg-secondary text-glass-text border border-glass-border'
                                : 'bg-glass-bg-secondary text-glass-text border border-glass-border'
                          }`}
                        >
                          {fn.successRate}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-glass-text-secondary">Appels:</span>
                          <span className="font-mono ml-1 sm:ml-2 text-glass-text">{fn.count}</span>
                        </div>
                        <div>
                          <span className="text-glass-text-secondary">Temps:</span>
                          <span className="font-mono ml-1 sm:ml-2 text-glass-text">
                            {fn.averageExecutionTime}
                          </span>
                        </div>
                        <div>
                          <span className="text-glass-text-secondary">Erreurs:</span>
                          <span className="font-mono ml-1 sm:ml-2 text-glass-text">
                            {fn.errorCount}
                          </span>
                        </div>
                      </div>
                      {fn.lastCalled && (
                        <div className="text-xs text-glass-text-secondary mt-2">
                          Dernier:{' '}
                          {new Date(fn.lastCalled).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-6 sm:py-8 text-sm">
                  Aucune fonction utilisée pour le moment
                </div>
              )}
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-3 sm:space-y-6">
              <h3 className="font-semibold text-sm sm:text-lg text-gray-800">
                📊 Tendances de performance
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div className="bg-glass-bg border border-glass-border p-3 sm:p-4 rounded-lg backdrop-blur-md shadow-glass">
                  <h4 className="font-semibold mb-2 sm:mb-3 text-glass-text text-sm sm:text-base">Temps de réponse</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl sm:text-2xl">
                      {getTrendIcon(performanceTrends?.responseTimeTrend)}
                    </span>
                    <span className="capitalize text-glass-text text-sm sm:text-base">
                      {performanceTrends?.responseTimeTrend || 'stable'}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-glass-text-secondary mt-2">
                    Moyenne:{' '}
                    {performanceTrends?.recentPerformance?.avgResponseTime || 0}
                    ms
                  </div>
                </div>

                <div className="bg-glass-bg border border-glass-border p-3 sm:p-4 rounded-lg backdrop-blur-md shadow-glass">
                  <h4 className="font-semibold mb-2 sm:mb-3 text-glass-text text-sm sm:text-base">
                    Satisfaction
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl sm:text-2xl">
                      {getTrendIcon(performanceTrends?.satisfactionTrend)}
                    </span>
                    <span className="capitalize text-glass-text text-sm sm:text-base">
                      {performanceTrends?.satisfactionTrend || 'stable'}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-glass-text-secondary mt-2">
                    Moyenne:{' '}
                    {performanceTrends?.recentPerformance?.avgSatisfaction || 0}
                    %
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-2 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-lg text-gray-800">
                ⚠️ Alertes de performance
              </h3>

              {alerts && alerts.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 sm:p-4 rounded-lg border-l-4 bg-glass-bg backdrop-blur-md shadow-glass ${
                        alert.severity === 'high'
                          ? 'border-red-500'
                          : alert.severity === 'medium'
                            ? 'border-yellow-500'
                            : 'border-green-500'
                      }`}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <span className="text-lg sm:text-xl">
                          {getAlertIcon(alert.severity)}
                        </span>
                        <div className="flex-1">
                          <div className="font-semibold capitalize text-sm sm:text-base text-glass-text">
                            {alert.type}
                          </div>
                          <div className="text-xs sm:text-sm text-glass-text-secondary">
                            {alert.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-green-600 py-6 sm:py-8 text-sm sm:text-base">
                  ✅ Aucune alerte - Tout fonctionne correctement !
                </div>
              )}
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-semibold text-base sm:text-lg text-glass-text flex items-center gap-2 mb-1">
                🔒 Validation de Sécurité
              </h3>

              {/* Statistiques de sécurité - Mobile optimized */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="bg-glass-bg border border-glass-border p-2 sm:p-3 rounded-lg text-center backdrop-blur-md shadow-glass">
                  <div className="text-base sm:text-lg font-bold text-glass-text">
                    {safetyStats?.totalValidations || 0}
                  </div>
                  <div className="text-xs text-glass-text-secondary font-medium">Validations</div>
                </div>
                <div className="bg-glass-bg-secondary border border-glass-border p-2 sm:p-3 rounded-lg text-center backdrop-blur-md shadow-glass">
                  <div className="text-base sm:text-lg font-bold text-glass-text">
                    {safetyStats?.averageSafetyScore || 100}
                  </div>
                  <div className="text-xs text-glass-text-secondary font-medium">Score</div>
                </div>
                <div className="bg-glass-bg border border-glass-border-light p-2 sm:p-3 rounded-lg text-center backdrop-blur-md shadow-glass">
                  <div className="text-base sm:text-lg font-bold text-glass-text">
                    {safetyStats?.criticalIssues || 0}
                  </div>
                  <div className="text-xs text-glass-text-secondary font-medium">Critiques</div>
                </div>
                <div className="bg-glass-bg-light border border-glass-border p-2 sm:p-3 rounded-lg text-center backdrop-blur-md shadow-glass">
                  <div className="text-base sm:text-lg font-bold text-glass-text">
                    {safetyStats?.warnings || 0}
                  </div>
                  <div className="text-xs text-glass-text-secondary font-medium">Alertes</div>
                </div>
              </div>

              {/* Détails de sécurité */}
              <div className="bg-glass-bg-secondary border border-glass-border p-3 sm:p-4 rounded-lg backdrop-blur-md shadow-glass">
                <h4 className="font-semibold mb-2 text-glass-text flex items-center gap-2 text-sm sm:text-base">
                  📊 Détails de Sécurité
                </h4>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-glass-text-secondary text-xs sm:text-sm">Recommandations sûres:</span>
                    <span className="font-mono text-glass-text font-semibold text-xs sm:text-sm">
                      {safetyStats?.safeRecommendations || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-glass-text-secondary text-xs sm:text-sm">Taux de sécurité:</span>
                    <span className="font-mono text-glass-text font-semibold text-xs sm:text-sm">
                      {safetyStats?.safetyRate || 100}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-glass-text-secondary text-xs sm:text-sm">Score moyen:</span>
                    <span className="font-mono text-glass-text font-semibold text-xs sm:text-sm">
                      {safetyStats?.averageSafetyScore || 100}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommandations de sécurité */}
              <div className="bg-glass-bg border border-glass-border p-3 sm:p-4 rounded-lg backdrop-blur-md shadow-glass">
                <h4 className="font-semibold mb-2 text-glass-text flex items-center gap-2 text-sm sm:text-base">
                  💡 Recommandations de Sécurité
                </h4>
                <div className="space-y-1 text-xs sm:text-sm text-glass-text-secondary">
                  <div className="flex items-start gap-2">
                    <span className="text-glass-text mt-1">•</span>
                    <span>Recommandations validées automatiquement</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-glass-text mt-1">•</span>
                    <span>Exercices dangereux détectés</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-glass-text mt-1">•</span>
                    <span>Limites adaptées au niveau utilisateur</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-glass-text mt-1">•</span>
                    <span>Conditions médicales prises en compte</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-glass-text mt-1">•</span>
                    <span>Avertissements en cas de risque</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Always visible */}
        <div className="bg-gray-50 border-t border-gray-300 p-1 flex-none rounded-b-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-600 space-y-1 sm:space-y-0">
            <span className="truncate">MAJ: {new Date().toLocaleTimeString()}</span>
            <span className="truncate">
              Session: {monitoringStats?.sessionId?.substring(0, 6) || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

MonitoringDashboard.propTypes = {
  monitoringStats: PropTypes.object,
  functionStats: PropTypes.array,
  performanceTrends: PropTypes.object,
  alerts: PropTypes.array,
  safetyStats: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default MonitoringDashboard;
