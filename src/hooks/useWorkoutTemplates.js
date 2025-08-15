import { useState, useEffect, useCallback } from 'react';
import { load, save } from '../utils/firebase/storage';
import { STORAGE_KEYS } from '../constants';
import { db } from '../utils/firebase/index.js';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';

export const useWorkoutTemplates = (user) => {
  const [templates, setTemplates] = useState([]);

  // Synchro Firestore temps réel si user connecté
  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'workoutTemplates'),
        where('userId', '==', user.uid)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setTemplates(
          querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
        );
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
            const cleanedTemplate = { ...template };
            delete cleanedTemplate.id; // Supprimer l'ID local pour que Firestore génère le sien
            await addDoc(collection(db, 'workoutTemplates'), {
              ...cleanedTemplate,
              userId: user.uid,
              createdAt: new Date().toISOString(),
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

  const addTemplate = useCallback(
    async (template) => {
      const newTemplate = {
        ...template,
        id: template.id || Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (user) {
        try {
          const cleanedTemplate = { ...newTemplate };
          delete cleanedTemplate.id; // Firestore génère l'ID
          await addDoc(collection(db, 'workoutTemplates'), {
            ...cleanedTemplate,
            userId: user.uid,
          });
        } catch (error) {
          console.error('Erreur ajout template Firestore:', error);
          throw error;
        }
      } else {
        setTemplates((prev) => [...prev, newTemplate]);
      }
    },
    [user]
  );

  const updateTemplate = useCallback(
    async (templateId, updatedTemplate) => {
      // updateTemplate appelé: ${templateId}, ${updatedTemplate.name}

      const templateWithUpdate = {
        ...updatedTemplate,
        updatedAt: new Date().toISOString(),
        // S'assurer que ces champs ne sont jamais undefined
        totalExercises: updatedTemplate.totalExercises ?? 0,
        totalSets: updatedTemplate.totalSets ?? 0,
        exercises: updatedTemplate.exercises ?? [],
        description: updatedTemplate.description ?? '',
        createdAt: updatedTemplate.createdAt ?? new Date().toISOString(),
      };

      if (user) {
        try {
          const cleanedTemplate = { ...templateWithUpdate };
          delete cleanedTemplate.id; // Ne pas inclure l'ID dans les données
          // Mise à jour Firestore
          await setDoc(
            doc(db, 'workoutTemplates', templateId),
            { ...cleanedTemplate, userId: user.uid },
            { merge: true }
          );
          // Mise à jour Firestore réussie
        } catch (error) {
          console.error('Erreur update template Firestore:', error);
          throw error;
        }
      } else {
        // Mise à jour locale
        setTemplates((prev) =>
          prev.map((t) => (t.id === templateId ? templateWithUpdate : t))
        );
      }
    },
    [user]
  );

  const deleteTemplate = useCallback(
    async (templateId) => {
          // Tentative suppression template

      if (user) {
        try {
          // Si l'ID est un nombre (généré par Date.now()), on ne peut pas le supprimer de Firestore
          if (typeof templateId === 'number') {
            throw new Error('Template avec ID numérique - migration requise');
          }

          await deleteDoc(doc(db, 'workoutTemplates', templateId));
        } catch (error) {
          console.error('Erreur suppression template Firestore:', error);
          throw error;
        }
      } else {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      }
    },
    [user]
  );

  // Fonction pour nettoyer les templates avec IDs problématiques
  const cleanProblematicTemplates = useCallback(async () => {
    if (user) {
      // Récupérer tous les templates pour identifier ceux avec des IDs numériques
      const problematicTemplates = templates.filter(
        (t) => typeof t.id === 'number'
      );

      if (problematicTemplates.length > 0) {


        // Recréer ces templates avec de nouveaux IDs Firestore
        for (const template of problematicTemplates) {
          try {
            const cleanTemplate = { ...template };
            delete cleanTemplate.id; // Supprimer l'ancien ID

            // Ajouter comme nouveau template
            await addDoc(collection(db, 'workoutTemplates'), {
              ...cleanTemplate,
              userId: user.uid,
              createdAt: template.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });


          } catch (error) {
            console.error('Erreur migration template:', template.name, error);
          }
        }


      }
    }
  }, [user, templates]);

  // Fonction pour supprimer TOUS les templates (reset complet)
  const deleteAllTemplates = useCallback(async () => {
    if (user) {
      try {
        // Récupérer tous les templates de l'utilisateur
        const q = query(
          collection(db, 'workoutTemplates'),
          where('userId', '==', user.uid)
        );

        const snapshot = await getDocs(q);


        // Supprimer chaque template
        const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);


      } catch (error) {
        console.error('Erreur suppression tous templates:', error);
        throw error;
      }
    } else {
      // Vider le localStorage
      setTemplates([]);
      localStorage.removeItem(STORAGE_KEYS.WORKOUT_TEMPLATES);

    }
  }, [user]);

  // Fonction pour supprimer un template spécifique par force
  const forceDeleteTemplate = useCallback(
    async (templateId) => {


      if (user) {
        try {
          // Essayer de supprimer directement par ID string
          const templateRef = doc(db, 'workoutTemplates', String(templateId));
          await deleteDoc(templateRef);
  
        } catch (error) {
          console.error('Erreur suppression forcée:', error);

          // Si ça échoue, chercher le template par son contenu et le supprimer
          try {
            const q = query(
              collection(db, 'workoutTemplates'),
              where('userId', '==', user.uid)
            );

            const snapshot = await getDocs(q);
            const templateToDelete = snapshot.docs.find((doc) => {
              const data = doc.data();
              return (
                data.name === templates.find((t) => t.id === templateId)?.name
              );
            });

            if (templateToDelete) {
              await deleteDoc(templateToDelete.ref);
      
                          } else {
                // Template non trouvé dans Firestore
              }
          } catch (secondError) {
            console.error('Échec suppression par nom aussi:', secondError);
          }
        }
      } else {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      }
    },
    [user, templates]
  );

  const saveCurrentWorkoutAsTemplate = useCallback(
    async (exercises, name, description = '') => {
      if (!exercises || exercises.length === 0) {
        throw new Error('Aucun exercice à sauvegarder');
      }

      const template = {
        name: name || `Template ${new Date().toLocaleDateString('fr-FR')}`,
        description: description,
        exercises: exercises.map((exercise) => ({
          name: exercise.name,
          type: exercise.type,
          sets: exercise.sets.map((set) => ({
            reps: set.reps,
            weight: set.weight,
            duration: set.duration,
          })),
        })),
        totalExercises: exercises.length,
        totalSets: exercises.reduce(
          (acc, ex) => acc + (ex.sets?.length || 0),
          0
        ),
      };

      await addTemplate(template);
      return template;
    },
    [addTemplate]
  );

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    saveCurrentWorkoutAsTemplate,
    cleanProblematicTemplates,
    deleteAllTemplates,
    forceDeleteTemplate,
  };
};
