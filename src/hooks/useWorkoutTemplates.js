import { useState, useEffect, useCallback } from 'react';
import { load, save } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, addDoc, setDoc, deleteDoc, doc } from 'firebase/firestore';

export const useWorkoutTemplates = (user) => {
  const [templates, setTemplates] = useState([]);

  // Synchro Firestore temps réel si user connecté
  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'workoutTemplates'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setTemplates(querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      });
      return unsubscribe;
    } else {
      // Fallback localStorage
      const savedTemplates = load(STORAGE_KEYS.WORKOUT_TEMPLATES, []);
      setTemplates(savedTemplates);
    }
  }, [user]);

  // Sauvegarde locale si pas connecté
  useEffect(() => {
    if (!user) {
      save(STORAGE_KEYS.WORKOUT_TEMPLATES, templates);
    }
  }, [templates, user]);

  // Migration templates locaux -> cloud
  useEffect(() => {
    if (user) {
      const localTemplates = load(STORAGE_KEYS.WORKOUT_TEMPLATES, []);
      if (localTemplates.length > 0) {
        // Migrer chaque template vers Firestore
        localTemplates.forEach(async (template) => {
          try {
            await addDoc(collection(db, 'workoutTemplates'), { 
              ...template, 
              userId: user.uid,
              createdAt: new Date().toISOString()
            });
          } catch (error) {
            console.error('Erreur migration template:', error);
          }
        });
        // Vider le localStorage après migration
        save(STORAGE_KEYS.WORKOUT_TEMPLATES, []);
      }
    }
  }, [user]);

  const addTemplate = useCallback(async (template) => {
    const newTemplate = {
      ...template,
      id: template.id || Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (user) {
      try {
        const cleanedTemplate = { ...newTemplate };
        delete cleanedTemplate.id; // Firestore génère l'ID
        await addDoc(collection(db, 'workoutTemplates'), { 
          ...cleanedTemplate, 
          userId: user.uid 
        });
      } catch (error) {
        console.error('Erreur ajout template Firestore:', error);
        throw error;
      }
    } else {
      setTemplates(prev => [...prev, newTemplate]);
    }
  }, [user]);

  const updateTemplate = useCallback(async (templateId, updatedTemplate) => {
    const templateWithUpdate = {
      ...updatedTemplate,
      updatedAt: new Date().toISOString()
    };

    if (user) {
      try {
        const cleanedTemplate = { ...templateWithUpdate };
        delete cleanedTemplate.id; // Ne pas inclure l'ID dans les données
        await setDoc(
          doc(db, 'workoutTemplates', templateId),
          { ...cleanedTemplate, userId: user.uid },
          { merge: true }
        );
      } catch (error) {
        console.error('Erreur update template Firestore:', error);
        throw error;
      }
    } else {
      setTemplates(prev => prev.map(t => t.id === templateId ? templateWithUpdate : t));
    }
  }, [user]);

  const deleteTemplate = useCallback(async (templateId) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'workoutTemplates', templateId));
      } catch (error) {
        console.error('Erreur suppression template Firestore:', error);
        throw error;
      }
    } else {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  }, [user]);

  const saveCurrentWorkoutAsTemplate = useCallback(async (exercises, name, description = '') => {
    if (!exercises || exercises.length === 0) {
      throw new Error('Aucun exercice à sauvegarder');
    }

    const template = {
      name: name || `Template ${new Date().toLocaleDateString('fr-FR')}`,
      description: description,
      exercises: exercises.map(exercise => ({
        name: exercise.name,
        type: exercise.type,
        sets: exercise.sets.map(set => ({
          reps: set.reps,
          weight: set.weight,
          duration: set.duration
        }))
      })),
      totalExercises: exercises.length,
      totalSets: exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0)
    };

    await addTemplate(template);
    return template;
  }, [addTemplate]);

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    saveCurrentWorkoutAsTemplate
  };
}; 