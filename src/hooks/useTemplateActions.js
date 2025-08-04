import { TOAST_MESSAGES } from '../config/app';

/**
 * Hook pour gérer les actions sur les templates
 */
export const useTemplateActions = ({
  saveCurrentWorkoutAsTemplate,
  updateTemplate,
  deleteTemplate,
  clearExercises,
  setExercisesFromWorkout,
  setActiveTab,
  showToastMsg,
}) => {
  const handleSaveTemplate = async (exercises, name, description = '') => {
    try {
      await saveCurrentWorkoutAsTemplate(exercises, name, description);
      setActiveTab('templates');
      showToastMsg(TOAST_MESSAGES.TEMPLATE_SAVED);
    } catch (error) {
      console.error('Erreur sauvegarde template:', error);
      showToastMsg(TOAST_MESSAGES.TEMPLATE_SAVE_ERROR, 'error');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await deleteTemplate(templateId);
      showToastMsg(TOAST_MESSAGES.TEMPLATE_DELETED);
    } catch (error) {
      console.error('Erreur suppression template:', error);
      showToastMsg(TOAST_MESSAGES.TEMPLATE_DELETE_ERROR, 'error');
    }
  };

  const handleEditTemplate = async (templateId, updatedTemplate) => {
    try {
      await updateTemplate(templateId, updatedTemplate);
      showToastMsg(TOAST_MESSAGES.TEMPLATE_UPDATED);
    } catch (error) {
      console.error('Erreur modification template:', error);
      showToastMsg(TOAST_MESSAGES.TEMPLATE_UPDATE_ERROR, 'error');
    }
  };

  const handleLoadTemplate = (template) => {
    // Convertir le template en exercices pour la séance actuelle
    const templateExercises = template.exercises.map((exercise, index) => ({
      id: Date.now() + index,
      name: exercise.name,
      type: exercise.type,
      sets: exercise.sets.map((set, setIndex) => ({
        id: Date.now() + index * 100 + setIndex,
        reps: set.reps || 0,
        weight: set.weight || 0,
        duration: set.duration || 0,
      })),
    }));

    // Vider les exercices actuels et charger le template
    clearExercises();
    setExercisesFromWorkout(templateExercises);

    // Basculer vers l'onglet séance
    setActiveTab('workout');
    showToastMsg(TOAST_MESSAGES.TEMPLATE_LOADED(template.name));
  };

  return {
    handleSaveTemplate,
    handleDeleteTemplate,
    handleEditTemplate,
    handleLoadTemplate,
  };
};