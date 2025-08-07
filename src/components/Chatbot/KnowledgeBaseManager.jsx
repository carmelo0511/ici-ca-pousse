import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const KnowledgeBaseManager = ({
  isOpen,
  onClose,
  getKnowledgeBaseStats,
  addCustomKnowledge,
  searchKnowledgeBase,
  getKnowledgeByCategory,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryResults, setCategoryResults] = useState([]);

  // Formulaire pour ajouter du contenu personnalisé
  const [newDocument, setNewDocument] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
  });

  // Charger les statistiques au montage
  useEffect(() => {
    if (isOpen) {
      setStats(getKnowledgeBaseStats());
    }
  }, [isOpen, getKnowledgeBaseStats]);

  // Effectuer une recherche
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchKnowledgeBase(searchQuery);
      setSearchResults(results);
    }
  };

  // Rechercher par catégorie
  const handleCategorySearch = () => {
    if (selectedCategory) {
      const results = getKnowledgeByCategory(selectedCategory);
      setCategoryResults(results);
    }
  };

  // Ajouter un document personnalisé
  const handleAddDocument = () => {
    if (newDocument.title && newDocument.content && newDocument.category) {
      const tags = newDocument.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const result = addCustomKnowledge(
        newDocument.title,
        newDocument.content,
        newDocument.category,
        tags
      );

      if (result.success) {
        alert('Document ajouté avec succès !');
        setNewDocument({ title: '', content: '', category: '', tags: '' });
        setStats(getKnowledgeBaseStats()); // Rafraîchir les stats
      } else {
        alert("Erreur lors de l'ajout du document: " + result.error);
      }
    } else {
      alert('Veuillez remplir tous les champs obligatoires');
    }
  };

  const categories = [
    'anatomy',
    'exercises',
    'nutrition',
    'recovery',
    'programming',
    'injury',
    'supplements',
    'psychology',
  ];

  const categoryLabels = {
    anatomy: 'Anatomie',
    exercises: 'Exercices',
    nutrition: 'Nutrition',
    recovery: 'Récupération',
    programming: 'Programmation',
    injury: 'Blessures',
    supplements: 'Suppléments',
    psychology: 'Psychologie',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-2 sm:p-4 pt-4 sm:pt-8">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden">
        {/* Header - Always visible */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 sm:p-3 flex-none rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-2xl font-bold">📚 Base de Connaissances RAG</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl sm:text-2xl p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs - Always visible */}
        <div className="flex border-b overflow-x-auto flex-none bg-gray-50 min-h-[45px]" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          {['overview', 'search', 'category', 'add'].map((tab) => (
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
                {tab === 'overview' && (<>📊 <span className="hidden sm:inline">Vue d'ensemble</span></>)}
                {tab === 'search' && (<>🔍 <span className="hidden sm:inline">Recherche</span></>)}
                {tab === 'category' && (<>📂 <span className="hidden sm:inline">Par Catégorie</span></>)}
                {tab === 'add' && (<>➕ <span className="hidden sm:inline">Ajouter</span></>)}
              </span>
            </button>
          ))}
        </div>

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto bg-white p-1 sm:p-2" style={{minHeight: 0}}>
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                📊 Statistiques de la Base de Connaissances
              </h3>

              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="bg-glass-bg border border-glass-border p-2 sm:p-3 rounded-lg backdrop-blur-md shadow-glass text-center">
                    <div className="text-base sm:text-lg font-bold text-glass-text">
                      {stats.totalDocuments}
                    </div>
                    <div className="text-xs text-glass-text-secondary font-medium">Documents</div>
                  </div>
                  <div className="bg-glass-bg-secondary border border-glass-border p-2 sm:p-3 rounded-lg backdrop-blur-md shadow-glass text-center">
                    <div className="text-base sm:text-lg font-bold text-glass-text">
                      {stats.totalWords}
                    </div>
                    <div className="text-xs text-glass-text-secondary font-medium">Mots indexés</div>
                  </div>
                  <div className="bg-glass-bg border border-glass-border-light p-2 sm:p-3 rounded-lg backdrop-blur-md shadow-glass text-center">
                    <div className="text-base sm:text-lg font-bold text-glass-text">
                      {stats.categories.length}
                    </div>
                    <div className="text-xs text-glass-text-secondary font-medium">Catégories</div>
                  </div>
                  <div className="bg-glass-bg-light border border-glass-border p-2 sm:p-3 rounded-lg backdrop-blur-md shadow-glass text-center">
                    <div className="text-base sm:text-lg font-bold text-glass-text">
                      {stats.tags.length}
                    </div>
                    <div className="text-xs text-glass-text-secondary font-medium">Tags</div>
                  </div>
                </div>
              )}

              {/* Catégories disponibles */}
              <div className="bg-glass-bg-secondary border border-glass-border p-3 sm:p-4 rounded-lg backdrop-blur-md shadow-glass">
                <h4 className="font-semibold mb-2 text-glass-text text-sm sm:text-base">
                  📂 Catégories Disponibles
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="bg-glass-bg border border-glass-border p-2 rounded backdrop-blur-sm text-xs sm:text-sm text-glass-text text-center"
                    >
                      {categoryLabels[category]}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags populaires */}
              {stats && (
                <div className="bg-glass-bg border border-glass-border p-3 sm:p-4 rounded-lg backdrop-blur-md shadow-glass">
                  <h4 className="font-semibold mb-2 text-glass-text text-sm sm:text-base">🏷️ Tags Populaires</h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {stats.tags.slice(0, 15).map((tag) => (
                      <span
                        key={tag}
                        className="bg-glass-bg-secondary border border-glass-border text-glass-text px-2 py-1 rounded text-xs backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recherche */}
          {activeTab === 'search' && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                🔍 Recherche dans la Base de Connaissances
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Entrez votre recherche..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Rechercher
                </button>
              </div>

              {/* Résultats de recherche */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">
                    Résultats ({searchResults.length})
                  </h4>
                  {searchResults.map((result, index) => (
                    <div key={index} className="bg-glass-bg border border-glass-border rounded-lg p-4 backdrop-blur-md shadow-glass">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-lg text-glass-text">
                          {result.document.title}
                        </h5>
                        <span className="bg-glass-bg-secondary border border-glass-border text-glass-text px-2 py-1 rounded text-sm backdrop-blur-sm">
                          {Math.round(result.score * 100)}% pertinent
                        </span>
                      </div>
                      <div className="text-sm text-glass-text-secondary mb-2">
                        Catégorie: {categoryLabels[result.document.category]}
                      </div>
                      <div className="text-sm text-glass-text line-clamp-3">
                        {result.document.content.substring(0, 200)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recherche par catégorie */}
          {activeTab === 'category' && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                📂 Recherche par Catégorie
              </h3>

              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {categoryLabels[category]}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleCategorySearch}
                  disabled={!selectedCategory}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
                >
                  Rechercher
                </button>
              </div>

              {/* Résultats par catégorie */}
              {categoryResults.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">
                    Documents dans {categoryLabels[selectedCategory]} (
                    {categoryResults.length})
                  </h4>
                  {categoryResults.map((result, index) => (
                    <div key={index} className="bg-glass-bg border border-glass-border rounded-lg p-4 backdrop-blur-md shadow-glass">
                      <h5 className="font-semibold text-lg mb-2 text-glass-text">
                        {result.document.title}
                      </h5>
                      <div className="text-sm text-glass-text line-clamp-3">
                        {result.document.content.substring(0, 200)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ajouter du contenu */}
          {activeTab === 'add' && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                ➕ Ajouter du Contenu Personnalisé
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={newDocument.title}
                    onChange={(e) =>
                      setNewDocument((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Titre du document..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={newDocument.category}
                    onChange={(e) =>
                      setNewDocument((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {categoryLabels[category]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenu *
                  </label>
                  <textarea
                    value={newDocument.content}
                    onChange={(e) =>
                      setNewDocument((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Contenu du document..."
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={newDocument.tags}
                    onChange={(e) =>
                      setNewDocument((prev) => ({
                        ...prev,
                        tags: e.target.value,
                      }))
                    }
                    placeholder="tag1, tag2, tag3..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleAddDocument}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Ajouter le Document
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Always visible */}
        <div className="bg-gray-50 border-t border-gray-300 p-1 flex-none rounded-b-lg">
          <div className="text-xs text-gray-600">
            💡 La base de connaissances RAG enrichit automatiquement les réponses du chatbot avec des informations spécialisées en fitness.
          </div>
        </div>
      </div>
    </div>
  );
};

KnowledgeBaseManager.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  getKnowledgeBaseStats: PropTypes.func.isRequired,
  addCustomKnowledge: PropTypes.func.isRequired,
  searchKnowledgeBase: PropTypes.func.isRequired,
  getKnowledgeByCategory: PropTypes.func.isRequired,
};

export default KnowledgeBaseManager;
