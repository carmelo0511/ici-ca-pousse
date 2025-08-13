import React, { useState } from 'react';

const ChatbotDashboard = ({
  onMonitoring,
  onKnowledgeBase,
  onExport,
  onReset,
  memoryStats,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bouton principal Dashboard */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dashboard-button"
        title="Dashboard IA Avancée"
      >
        <span className="dashboard-icon">⚙️</span>
        <span>Dashboard</span>
        <span
          className={`dashboard-arrow transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="dashboard-dropdown">
          <div className="dashboard-content">
            {/* En-tête du dashboard */}
            <div className="dashboard-header">
              <h3 className="dashboard-title">
                IA Avancée
              </h3>
              <div className="dashboard-stats">
                💾 {memoryStats.totalMessages} messages
              </div>
            </div>

            {/* Boutons du dashboard */}
            <button
              onClick={() => {
                onMonitoring();
                setIsOpen(false);
              }}
              className="dashboard-menu-item monitoring-item"
            >
              <span className="menu-icon">📊</span>
              <span>Monitoring</span>
            </button>

            <button
              onClick={() => {
                onKnowledgeBase();
                setIsOpen(false);
              }}
              className="dashboard-menu-item knowledge-item"
            >
              <span className="menu-icon">📚</span>
              <span>Base de Connaissances</span>
            </button>

            <button
              onClick={() => {
                onExport();
                setIsOpen(false);
              }}
              className="dashboard-menu-item export-item"
            >
              <span className="menu-icon">📤</span>
              <span>Exporter</span>
            </button>

            <button
              onClick={() => {
                onReset();
                setIsOpen(false);
              }}
              className="dashboard-menu-item reset-item"
            >
              <span className="menu-icon">🧠</span>
              <span>Reset Mémoire</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay pour fermer le menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default ChatbotDashboard;
