import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Bookmark,
  Plus,
  Edit,
  Trash2,
  Play,
  Dumbbell,
  Heart,
  Target,
  X,
  Save,
  Star,
} from 'lucide-react';
import { exerciseDatabase } from '../../utils/workout/exerciseDatabase';
import Card from '../Card';
import GradientButton from '../GradientButton';
import IconButton from '../IconButton';

const WorkoutTemplates = ({
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  onLoadTemplate,
  onEditTemplate,
  saveCurrentWorkoutAsTemplate,
  exercises = [],
  className = '',
  showToastMsg,
  addTemplate,
  cleanProblematicTemplates,
  deleteAllTemplates,
  forceDeleteTemplate,
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplateExercises, setNewTemplateExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('exerciseFavorites');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Veuillez donner un nom au template');
      return;
    }

    try {
      await saveCurrentWorkoutAsTemplate(
        exercises,
        templateName.trim(),
        templateDescription.trim()
      );
      setShowSaveModal(false);
      setTemplateName('');
      setTemplateDescription('');
      if (showToastMsg) {
        showToastMsg('Template sauvegardé avec succès !');
      }
    } catch (error) {
      console.error('Erreur sauvegarde template:', error);
      if (showToastMsg) {
        showToastMsg('Erreur lors de la sauvegarde du template', 'error');
      } else {
        alert('Erreur lors de la sauvegarde du template');
      }
    }
  };

  const handleEditTemplate = async () => {
    if (!templateName.trim() || !editingTemplate) {
      alert('Veuillez donner un nom au template');
      return;
    }

    try {
      const updatedTemplate = {
        name: templateName.trim(),
        description: templateDescription.trim(),
        exercises: editingTemplate.exercises,
        totalExercises: editingTemplate.exercises?.length || 0,
        totalSets:
          editingTemplate.exercises?.reduce(
            (acc, ex) => acc + (ex.sets?.length || 0),
            0
          ) || 0,
        createdAt: editingTemplate.createdAt || new Date().toISOString(),
      };

      await onEditTemplate(editingTemplate.id, updatedTemplate);
      setShowEditModal(false);
      setTemplateName('');
      setTemplateDescription('');
      setEditingTemplate(null);
      if (showToastMsg) {
        showToastMsg('Template modifié avec succès !');
      }
    } catch (error) {
      console.error('Erreur modification template:', error);
      if (showToastMsg) {
        showToastMsg('Erreur lors de la modification du template', 'error');
      } else {
        alert('Erreur lors de la modification du template');
      }
    }
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
    setShowEditModal(true);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      try {
        await onDeleteTemplate(templateId);
        if (showToastMsg) {
          showToastMsg('Template supprimé avec succès !');
        }
      } catch (error) {
        console.error('Erreur suppression template:', error);
        if (showToastMsg) {
          showToastMsg('Erreur lors de la suppression du template', 'error');
        } else {
          alert('Erreur lors de la suppression du template');
        }
      }
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      alert('Veuillez donner un nom au template');
      return;
    }

    if (newTemplateExercises.length === 0) {
      alert('Veuillez ajouter au moins un exercice');
      return;
    }

    try {
      const template = {
        name: templateName.trim(),
        description: templateDescription.trim(),
        exercises: newTemplateExercises.map((exercise) => ({
          name: exercise.name,
          type: exercise.type,
          sets: exercise.sets.map((set) => ({
            reps: set.reps,
            weight: set.weight,
            duration: set.duration,
          })),
        })),
        totalExercises: newTemplateExercises.length,
        totalSets: newTemplateExercises.reduce(
          (acc, ex) => acc + (ex.sets?.length || 0),
          0
        ),
      };

      await addTemplate(template);
      setShowCreateModal(false);
      setTemplateName('');
      setTemplateDescription('');
      setNewTemplateExercises([]);
      if (showToastMsg) {
        showToastMsg('Template créé avec succès !');
      }
    } catch (error) {
      console.error('Erreur création template:', error);
      if (showToastMsg) {
        showToastMsg('Erreur lors de la création du template', 'error');
      } else {
        alert('Erreur lors de la création du template');
      }
    }
  };

  const addExerciseToNewTemplate = (exerciseName, muscleGroup) => {
    const newExercise = {
      id: Date.now(),
      name: exerciseName,
      type: muscleGroup || 'custom',
      sets: [{ reps: 0, weight: 0, duration: 0 }],
    };
    setNewTemplateExercises([...newTemplateExercises, newExercise]);
    setShowAddExerciseModal(false);
    setSearchTerm('');
    setCustomExerciseName('');
  };

  const openAddExerciseModal = () => {
    setShowAddExerciseModal(true);
    setSearchTerm('');
    setCustomExerciseName('');
  };

  const removeExerciseFromNewTemplate = (exerciseId) => {
    setNewTemplateExercises(
      newTemplateExercises.filter((ex) => ex.id !== exerciseId)
    );
  };

  const updateExerciseInNewTemplate = (exerciseId, field, value) => {
    setNewTemplateExercises(
      newTemplateExercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, [field]: value } : ex
      )
    );
  };

  const addSetToExercise = (exerciseId) => {
    setNewTemplateExercises(
      newTemplateExercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0, duration: 0 }] }
          : ex
      )
    );
  };

  const removeSetFromExercise = (exerciseId, setIndex) => {
    setNewTemplateExercises(
      newTemplateExercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((_, idx) => idx !== setIndex) }
          : ex
      )
    );
  };

  const updateSetInExercise = (exerciseId, setIndex, field, value) => {
    setNewTemplateExercises(
      newTemplateExercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set, idx) =>
                idx === setIndex
                  ? { ...set, [field]: Math.max(0, parseInt(value) || 0) }
                  : set
              ),
            }
          : ex
      )
    );
  };

  const getMuscleIcon = (muscle) => {
    switch (muscle) {
      case 'pectoraux':
        return <Dumbbell className="h-4 w-4 text-blue-600" />;
      case 'dos':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'jambes':
        return <Target className="h-4 w-4 text-purple-600" />;
      case 'abdos':
        return <Target className="h-4 w-4 text-orange-600" />;
      case 'biceps':
        return <Dumbbell className="h-4 w-4 text-red-600" />;
      case 'triceps':
        return <Dumbbell className="h-4 w-4 text-indigo-600" />;
      case 'épaules':
        return <Target className="h-4 w-4 text-yellow-600" />;
      case 'cardio':
        return <Heart className="h-4 w-4 text-red-500" />;
      default:
        return <Dumbbell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMuscleIconLarge = (muscle) => {
    switch (muscle) {
      case 'pectoraux':
        return <Dumbbell className="h-8 w-8 text-white" />;
      case 'dos':
        return <Target className="h-8 w-8 text-white" />;
      case 'jambes':
        return <Target className="h-8 w-8 text-white" />;
      case 'abdos':
        return <Target className="h-8 w-8 text-white" />;
      case 'biceps':
        return <Dumbbell className="h-8 w-8 text-white" />;
      case 'triceps':
        return <Dumbbell className="h-8 w-8 text-white" />;
      case 'épaules':
        return <Target className="h-8 w-8 text-white" />;
      case 'cardio':
        return <Heart className="h-8 w-8 text-white" />;
      default:
        return <Dumbbell className="h-8 w-8 text-white" />;
    }
  };

  const toggleFavorite = (exercise) => {
    const newFavorites = favorites.includes(exercise)
      ? favorites.filter((fav) => fav !== exercise)
      : [...favorites, exercise];
    setFavorites(newFavorites);
    localStorage.setItem('exerciseFavorites', JSON.stringify(newFavorites));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="pt-6 mb-6 pl-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          Mes Templates
        </h2>
        <p className="text-gray-600 mt-1">Gérez vos séances favorites</p>
      </div>

      {/* Boutons d'action principaux */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20"
        >
          <Plus className="h-5 w-5" />
          Créer un template
        </button>

        {exercises.length > 0 && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20"
          >
            <Save className="h-5 w-5" />
            Sauvegarder la séance
          </button>
        )}
      </div>

      {/* Liste des templates */}
      {templates.length === 0 ? (
        <Card className="text-center py-12">
          <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Aucun template
          </h3>
          <p className="text-gray-500 mb-6">
            Utilisez les boutons ci-dessus pour créer votre premier template
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            console.log(
              'Template affiché:',
              template.id,
              template.name,
              typeof template.id
            );
            return (
              <Card
                key={template.id}
                className="p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Dumbbell className="h-4 w-4" />
                        <span>{template.totalExercises} exercices</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>{template.totalSets} séries</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <IconButton
                      icon={Edit}
                      onClick={() => openEditModal(template)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Modifier"
                    />
                    <IconButton
                      icon={Trash2}
                      onClick={() => {
                        console.log(
                          'Tentative suppression template:',
                          template.id,
                          template.name,
                          'Type ID:',
                          typeof template.id
                        );
                        handleDeleteTemplate(template.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                      title={`Supprimer (ID: ${template.id}, Type: ${typeof template.id})`}
                    />

                    {/* Bouton suppression forcée pour templates problématiques */}
                    {typeof template.id === 'number' && (
                      <button
                        onClick={async () => {
                          if (
                            window.confirm(
                              `🗑️ FORCER la suppression du template "${template.name}" ?\n\nID: ${template.id} (type: ${typeof template.id})\n\nCette action est irréversible !`
                            )
                          ) {
                            try {
                              await forceDeleteTemplate(template.id);
                              if (showToastMsg) {
                                showToastMsg(
                                  `Template "${template.name}" supprimé !`
                                );
                              }
                            } catch (error) {
                              console.error(
                                'Erreur suppression forcée:',
                                error
                              );
                              if (showToastMsg) {
                                showToastMsg(
                                  'Erreur lors de la suppression forcée',
                                  'error'
                                );
                              }
                            }
                          }
                        }}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-300"
                        title="🗑️ Template problématique - Suppression forcée"
                      >
                        💥
                      </button>
                    )}
                  </div>
                </div>

                {/* Liste des exercices */}
                <div className="space-y-2 mb-4">
                  {template.exercises.slice(0, 3).map((exercise, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-sm"
                    >
                      {getMuscleIcon(exercise.type)}
                      <span className="text-gray-700 flex-1 truncate">
                        {exercise.name}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {exercise.sets.length} séries
                      </span>
                    </div>
                  ))}
                  {template.exercises.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{template.exercises.length - 3} autres exercices
                    </div>
                  )}
                </div>

                {/* Bouton charger template */}
                <GradientButton
                  icon={Play}
                  from="green-500"
                  to="emerald-600"
                  onClick={() => onLoadTemplate(template)}
                  className="w-full text-white"
                >
                  Charger ce template
                </GradientButton>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal sauvegarder template */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Sauvegarder en template
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du template *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none"
                  placeholder="Ex: Séance pectoraux"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none"
                  placeholder="Description du template..."
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm text-blue-800">
                  <Star className="h-4 w-4" />
                  <span>
                    Cette séance contient {exercises.length} exercices
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveTemplate}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal modifier template */}
      {showEditModal && editingTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Modifier le template
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du template *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none"
                  placeholder="Ex: Séance pectoraux"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none"
                  placeholder="Description du template..."
                  rows={3}
                  maxLength={200}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleEditTemplate}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal créer template depuis zéro */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
            style={{ height: '90vh' }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Créer un nouveau template
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setTemplateName('');
                  setTemplateDescription('');
                  setNewTemplateExercises([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informations du template */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du template *
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none"
                    placeholder="Ex: Séance pectoraux"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optionnel)
                  </label>
                  <input
                    type="text"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none"
                    placeholder="Description du template..."
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Liste des exercices */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Exercices
                  </h4>
                  <button
                    onClick={openAddExerciseModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un exercice
                  </button>
                </div>

                {newTemplateExercises.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Dumbbell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Aucun exercice ajouté</p>
                    <p className="text-sm text-gray-400">
                      Cliquez sur "Ajouter un exercice" pour commencer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newTemplateExercises.map((exercise, exerciseIndex) => (
                      <Card key={exercise.id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={(e) =>
                                updateExerciseInNewTemplate(
                                  exercise.id,
                                  'name',
                                  e.target.value
                                )
                              }
                              className="text-lg font-semibold bg-transparent border-none outline-none text-gray-800 w-full"
                              placeholder="Nom de l'exercice"
                            />
                            <div className="flex items-center space-x-2 mt-1">
                              {getMuscleIcon(exercise.type)}
                              <span className="text-sm text-gray-600 capitalize font-medium">
                                {exercise.type === 'custom'
                                  ? 'Exercice personnalisé'
                                  : exercise.type}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              removeExerciseFromNewTemplate(exercise.id)
                            }
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Séries */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                              Séries
                            </span>
                            <button
                              onClick={() => addSetToExercise(exercise.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              + Ajouter série
                            </button>
                          </div>
                          {exercise.sets.map((set, setIndex) => (
                            <div
                              key={setIndex}
                              className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                            >
                              <span className="text-sm font-medium text-gray-600 w-8">
                                #{setIndex + 1}
                              </span>
                              <div className="flex gap-2 flex-1">
                                <div className="flex-1">
                                  <label className="text-xs text-gray-500">
                                    Reps
                                  </label>
                                  <input
                                    type="number"
                                    value={set.reps}
                                    onChange={(e) =>
                                      updateSetInExercise(
                                        exercise.id,
                                        setIndex,
                                        'reps',
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm"
                                    min="0"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="text-xs text-gray-500">
                                    Poids (kg)
                                  </label>
                                  <input
                                    type="number"
                                    value={set.weight}
                                    onChange={(e) =>
                                      updateSetInExercise(
                                        exercise.id,
                                        setIndex,
                                        'weight',
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm"
                                    min="0"
                                    step="0.5"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="text-xs text-gray-500">
                                    Durée (s)
                                  </label>
                                  <input
                                    type="number"
                                    value={set.duration}
                                    onChange={(e) =>
                                      updateSetInExercise(
                                        exercise.id,
                                        setIndex,
                                        'duration',
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm"
                                    min="0"
                                  />
                                </div>
                              </div>
                              {exercise.sets.length > 1 && (
                                <button
                                  onClick={() =>
                                    removeSetFromExercise(exercise.id, setIndex)
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setTemplateName('');
                    setTemplateDescription('');
                    setNewTemplateExercises([]);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateTemplate}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20"
                >
                  Créer le template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal sélection exercice pour template */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                💪 Ajouter un exercice
              </h3>
              <button
                onClick={() => {
                  setShowAddExerciseModal(false);
                  setSearchTerm('');
                  setCustomExerciseName('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div
              className="overflow-y-auto flex-1 pr-2"
              style={{ maxHeight: 'calc(90vh - 200px)' }}
            >
              {/* Champ de recherche global */}
              <div className="flex flex-col items-center mb-6 w-full">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un exercice..."
                  className="border-2 border-gray-200 rounded-xl px-4 py-2 w-full max-w-md text-center font-medium focus:border-indigo-500 focus:outline-none transition-colors duration-200 shadow-sm"
                  autoFocus
                />
              </div>

              {/* Affichage par groupes musculaires */}
              <div className="space-y-6">
                {Object.entries(exerciseDatabase).map(
                  ([muscle, exerciseList]) => {
                    // Filtrer les exercices selon la recherche
                    const filteredForMuscle = exerciseList.filter((exercise) =>
                      exercise.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (filteredForMuscle.length === 0 && searchTerm)
                      return null;

                    // Séparer favoris et non-favoris pour ce groupe
                    const favoritesInMuscle = filteredForMuscle.filter(
                      (exercise) => favorites.includes(exercise)
                    );
                    const nonFavoritesInMuscle = filteredForMuscle.filter(
                      (exercise) => !favorites.includes(exercise)
                    );

                    return (
                      <div key={muscle} className="bg-gray-50 rounded-2xl p-4">
                        {/* En-tête du groupe musculaire */}
                        <div className="flex items-center space-x-3 mb-4">
                          <div
                            className={`p-3 rounded-xl ${muscle === 'cardio' ? 'bg-red-500' : 'bg-indigo-500'} shadow-lg`}
                          >
                            {getMuscleIconLarge(muscle)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 capitalize text-xl">
                              {muscle}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {filteredForMuscle.length} exercice
                              {filteredForMuscle.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        {/* Liste des exercices */}
                        <div className="grid grid-cols-1 gap-3">
                          {/* Favoris en premier */}
                          {favoritesInMuscle.map((exercise) => (
                            <div key={exercise} className="relative">
                              <button
                                onClick={() =>
                                  addExerciseToNewTemplate(exercise, muscle)
                                }
                                className="w-full text-left p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl font-medium text-gray-700 transition-all duration-200 border border-yellow-200 hover:border-yellow-400 hover:shadow-md transform hover:scale-[1.02]"
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`p-2 rounded-lg ${muscle === 'cardio' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}
                                  >
                                    {muscle === 'cardio' ? (
                                      <Heart className="h-4 w-4" />
                                    ) : (
                                      <Dumbbell className="h-4 w-4" />
                                    )}
                                  </div>
                                  <span className="flex-1 text-base font-medium">
                                    {exercise}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                </div>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(exercise);
                                }}
                                className="absolute top-2 right-2 text-yellow-500 hover:text-yellow-600"
                                title="Retirer des favoris"
                              >
                                <Star fill="currentColor" className="h-5 w-5" />
                              </button>
                            </div>
                          ))}

                          {/* Exercices non favoris */}
                          {nonFavoritesInMuscle.map((exercise) => (
                            <div key={exercise} className="relative">
                              <button
                                onClick={() =>
                                  addExerciseToNewTemplate(exercise, muscle)
                                }
                                className="w-full text-left p-4 bg-white hover:bg-gray-50 rounded-xl font-medium text-gray-700 transition-all duration-200 border border-gray-200 hover:border-indigo-300 hover:shadow-md transform hover:scale-[1.02]"
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`p-2 rounded-lg ${muscle === 'cardio' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}
                                  >
                                    {muscle === 'cardio' ? (
                                      <Heart className="h-4 w-4" />
                                    ) : (
                                      <Dumbbell className="h-4 w-4" />
                                    )}
                                  </div>
                                  <span className="flex-1 text-base font-medium">
                                    {exercise}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                </div>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(exercise);
                                }}
                                className="absolute top-2 right-2 text-gray-300 hover:text-yellow-500"
                                title="Ajouter aux favoris"
                              >
                                <Star className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Champ pour exercice personnalisé */}
              <div className="flex flex-col items-center justify-center gap-3 mt-6 w-full">
                <div className="w-full max-w-md bg-white rounded-2xl p-4 border-2 border-dashed border-indigo-300">
                  <h5 className="text-center font-semibold text-gray-700 mb-3">
                    Exercice personnalisé
                  </h5>
                  <input
                    type="text"
                    value={customExerciseName}
                    onChange={(e) => setCustomExerciseName(e.target.value)}
                    placeholder="Nom d'exercice personnalisé..."
                    className="border-2 border-indigo-200 rounded-xl px-4 py-3 w-full text-center font-semibold focus:border-indigo-500 focus:outline-none transition-colors duration-200 shadow-sm mb-3"
                  />
                  <button
                    onClick={() => {
                      if (customExerciseName.trim()) {
                        addExerciseToNewTemplate(
                          customExerciseName.trim(),
                          'custom'
                        );
                      }
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full"
                  >
                    Ajouter l'exercice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

WorkoutTemplates.propTypes = {
  templates: PropTypes.array.isRequired,
  onSaveTemplate: PropTypes.func.isRequired,
  onDeleteTemplate: PropTypes.func.isRequired,
  onLoadTemplate: PropTypes.func.isRequired,
  onEditTemplate: PropTypes.func.isRequired,
  saveCurrentWorkoutAsTemplate: PropTypes.func.isRequired,
  exercises: PropTypes.array,
  className: PropTypes.string,
  showToastMsg: PropTypes.func,
  addTemplate: PropTypes.func.isRequired,
  cleanProblematicTemplates: PropTypes.func.isRequired,
  deleteAllTemplates: PropTypes.func.isRequired,
  forceDeleteTemplate: PropTypes.func.isRequired,
};

export default WorkoutTemplates;
