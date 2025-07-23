import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants';

export default function useWorkoutTemplates() {
  const [templates, setTemplates] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUT_TEMPLATES)) || []
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.WORKOUT_TEMPLATES,
      JSON.stringify(templates)
    );
  }, [templates]);

  const saveTemplate = (name, exercises) => {
    if (!name || !exercises || exercises.length === 0) return;
    const newTemplate = { id: Date.now().toString(), name, exercises };
    setTemplates((prev) => [...prev, newTemplate]);
  };

  const deleteTemplate = (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const getTemplate = (id) => templates.find((t) => t.id === id);

  return { templates, saveTemplate, deleteTemplate, getTemplate };
}
