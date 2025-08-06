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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-glass-bg border border-glass-border rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              📚 Gestionnaire de Base de Connaissances RAG
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-glass-border bg-glass-bg-secondary">
          {['overview', 'search', 'category', 'add'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-glass-bg text-glass-text border-b-2 border-blue-600 backdrop-blur-md'
                  : 'text-glass-text-secondary hover:text-glass-text hover:bg-glass-bg'
              }`}
            >
              {tab === 'overview' && "📊 Vue d'ensemble"}
              {tab === 'search' && '🔍 Recherche'}
              {tab === 'category' && '📂 Par Catégorie'}
              {tab === 'add' && '➕ Ajouter'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">
                📊 Statistiques de la Base de Connaissances
              </h3>

              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-glass-bg border border-glass-border p-4 rounded-lg backdrop-blur-md shadow-glass">
                    <div className="text-2xl font-bold text-glass-text">
                      {stats.totalDocuments}
                    </div>
                    <div className="text-sm text-glass-text-secondary">Documents</div>
                  </div>
                  <div className="bg-glass-bg border border-glass-border p-4 rounded-lg backdrop-blur-md shadow-glass">
                    <div className="text-2xl font-bold text-glass-text">
                      {stats.totalWords}
                    </div>
                    <div className="text-sm text-glass-text-secondary">Mots indexés</div>
                  </div>
                  <div className="bg-glass-bg border border-glass-border p-4 rounded-lg backdrop-blur-md shadow-glass">
                    <div className="text-2xl font-bold text-glass-text">
                      {stats.categories.length}
                    </div>
                    <div className="text-sm text-glass-text-secondary">Catégories</div>
                  </div>
                  <div className="bg-glass-bg border border-glass-border p-4 rounded-lg backdrop-blur-md shadow-glass">
                    <div className="text-2xl font-bold text-glass-text">
                      {stats.tags.length}
                    </div>
                    <div className="text-sm text-glass-text-secondary">Tags</div>
                  </div>
                </div>
              )}

              {/* Catégories disponibles */}
              <div className="bg-glass-bg border border-glass-border p-4 rounded-lg backdrop-blur-md shadow-glass">
                <h4 className="font-semibold mb-3 text-glass-text">
                  📂 Catégories Disponibles
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="bg-glass-bg-secondary border border-glass-border p-2 rounded backdrop-blur-sm text-sm text-glass-text"
                    >
                      {categoryLabels[category]}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags populaires */}
              {stats && (
                <div className="bg-glass-bg border border-glass-border p-4 rounded-lg backdrop-blur-md shadow-glass">
                  <h4 className="font-semibold mb-3 text-glass-text">🏷️ Tags Populaires</h4>
                  <div className="flex flex-wrap gap-2">
                    {stats.tags.slice(0, 20).map((tag) => (
                      <span
                        key={tag}
                        className="bg-glass-bg-secondary border border-glass-border text-glass-text px-2 py-1 rounded text-sm backdrop-blur-sm"
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
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
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
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
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
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
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

        {/* Footer */}
        <div className="bg-glass-bg-secondary border-t border-glass-border p-4 backdrop-blur-sm">
          <div className="text-sm text-glass-text-secondary">
            💡 La base de connaissances RAG enrichit automatiquement les
            réponses du chatbot avec des informations spécialisées en fitness.
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
