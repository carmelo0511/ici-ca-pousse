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
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded shadow font-semibold hover:from-indigo-600 hover:to-purple-700 transition text-sm whitespace-nowrap border border-white/20 flex items-center gap-2"
        title="Dashboard IA Avancée"
      >
        <span>⚙️</span>
        <span>Dashboard</span>
        <span
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white border rounded-xl shadow-xl p-3 min-w-48 z-50">
          <div className="space-y-2">
            {/* En-tête du dashboard */}
            <div className="border-b pb-2 mb-2">
              <h3 className="font-semibold text-gray-800 text-sm">
                IA Avancée
              </h3>
              <div className="text-xs text-gray-600 mt-1">
                💾 {memoryStats.totalMessages} messages
              </div>
            </div>

            {/* Boutons du dashboard */}
            <button
              onClick={() => {
                onMonitoring();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-purple-50 transition flex items-center gap-2 text-sm"
            >
              <span>📊</span>
              <span>Monitoring</span>
            </button>

            <button
              onClick={() => {
                onKnowledgeBase();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition flex items-center gap-2 text-sm"
            >
              <span>📚</span>
              <span>Base de Connaissances</span>
            </button>

            <button
              onClick={() => {
                onExport();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-green-50 transition flex items-center gap-2 text-sm"
            >
              <span>📤</span>
              <span>Exporter</span>
            </button>

            <button
              onClick={() => {
                onReset();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-orange-50 transition flex items-center gap-2 text-sm"
            >
              <span>🧠</span>
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
