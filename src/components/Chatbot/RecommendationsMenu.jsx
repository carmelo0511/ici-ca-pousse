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
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded shadow font-semibold hover:from-blue-600 hover:to-blue-700 transition text-sm whitespace-nowrap border border-white/20 flex items-center gap-2"
        title="Recommandations IA"
      >
        <span>🧠</span>
        <span>Recommandations IA</span>
        <span
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 bg-white border rounded-xl shadow-xl p-3 min-w-64 z-50">
          <div className="space-y-3">
            {/* En-tête du menu */}
            <div className="border-b pb-2 mb-2">
              <h3 className="font-semibold text-gray-800 text-sm">
                Recommandations IA
              </h3>
              <div className="text-xs text-gray-600 mt-1">
                Conseils personnalisés basés sur vos données
              </div>
            </div>

            {/* Boutons des recommandations */}

            <button
              onClick={() => {
                onRecapWorkouts();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition flex items-center gap-2 text-sm"
            >
              <span>📋</span>
              <span>Récap des dernières séances</span>
            </button>

            <button
              onClick={() => {
                onPersonalizedRecommendation();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition flex items-center gap-2 text-sm"
            >
              <span>🎯</span>
              <span>Conseils personnalisés</span>
            </button>

            <button
              onClick={() => {
                onGoalsAndProgress();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition flex items-center gap-2 text-sm"
            >
              <span>📈</span>
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
