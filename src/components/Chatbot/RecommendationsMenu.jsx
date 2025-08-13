import React, { useState } from 'react';

const RecommendationsMenu = ({
  onRecapWorkouts,
  onPersonalizedRecommendation,
  onGoalsAndProgress,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bouton principal Recommandations */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-action-button recommendations-button"
        title="Recommandations IA"
      >
        <span className="button-icon">🧠</span>
        <span>Recommandations IA</span>
        <span
          className={`recommendations-arrow transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="recommendations-dropdown">
          <div className="recommendations-content">
            {/* En-tête du menu */}
            <div className="recommendations-header">
              <h3 className="recommendations-title">
                Recommandations IA
              </h3>
              <div className="recommendations-subtitle">
                Conseils personnalisés basés sur vos données
              </div>
            </div>

            {/* Boutons des recommandations */}
            <button
              onClick={() => {
                onRecapWorkouts();
                setIsOpen(false);
              }}
              className="recommendations-menu-item recap-item"
            >
              <span className="menu-icon">📋</span>
              <span>Récap des dernières séances</span>
            </button>

            <button
              onClick={() => {
                onPersonalizedRecommendation();
                setIsOpen(false);
              }}
              className="recommendations-menu-item personalized-item"
            >
              <span className="menu-icon">🎯</span>
              <span>Conseils personnalisés</span>
            </button>

            <button
              onClick={() => {
                onGoalsAndProgress();
                setIsOpen(false);
              }}
              className="recommendations-menu-item progress-item"
            >
              <span className="menu-icon">📈</span>
              <span>Analyse de progression</span>
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

export default RecommendationsMenu;
