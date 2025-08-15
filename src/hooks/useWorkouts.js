import { useState, useEffect, useCallback, useRef } from 'react';
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
} from 'firebase/firestore';
import { cleanWorkoutForFirestore } from '../utils/workout/workoutUtils';

// Cache pour éviter les re-renders inutiles
const workoutCache = new Map();
const lastUpdateTime = new Map();

export const useWorkouts = (user) => {
  const [workouts, setWorkouts] = useState([]);
  const unsubscribeRef = useRef(null);
  const lastUserId = useRef(null);

  // Optimisation : éviter de recréer la subscription si l'utilisateur n'a pas changé
  useEffect(() => {
    if (user && user.uid !== lastUserId.current) {
      // Nettoyer l'ancienne subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Vérifier le cache
      const cacheKey = `workouts_${user.uid}`;
      const now = Date.now();

      // Effacer le cache pour forcer le rechargement
      workoutCache.delete(cacheKey);
      lastUpdateTime.delete(cacheKey);

      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', user.uid)
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const newWorkouts = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        
        // Mettre en cache
        workoutCache.set(cacheKey, newWorkouts);
        lastUpdateTime.set(cacheKey, now);
        
        setWorkouts(newWorkouts);
      });

      unsubscribeRef.current = unsubscribe;
      lastUserId.current = user.uid;
    } else if (!user) {
      // Nettoyer la subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      lastUserId.current = null;
      
      // Fallback localStorage
      const savedWorkouts = load(STORAGE_KEYS.WORKOUTS, []);
      setWorkouts(savedWorkouts);
    }

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user]);

  // Optimisation : éviter les sauvegardes inutiles
  const lastSavedWorkouts = useRef([]);
  useEffect(() => {
    if (!user && JSON.stringify(workouts) !== JSON.stringify(lastSavedWorkouts.current)) {
      save(STORAGE_KEYS.WORKOUTS, workouts);
      lastSavedWorkouts.current = [...workouts];
    }
  }, [workouts, user]);

  // Optimisation des fonctions avec useCallback
  const addWorkout = useCallback(
    async (workout) => {
      if (user) {
        const cleanedWorkout = cleanWorkoutForFirestore(workout);
        await addDoc(collection(db, 'workouts'), {
          ...cleanedWorkout,
          userId: user.uid,
        });
        // On ne met pas à jour localement, la synchro temps réel s'en charge
      } else {
        setWorkouts((prev) => [
          ...prev,
          { ...workout, id: workout.id || Date.now() },
        ]);
      }
    },
    [user]
  );

  const updateWorkout = useCallback(
    async (workoutId, updatedWorkout) => {
      if (user) {
        const cleanedWorkout = cleanWorkoutForFirestore(updatedWorkout);
        await setDoc(doc(db, 'workouts', workoutId), {
          ...cleanedWorkout,
          userId: user.uid,
        });
      } else {
        setWorkouts((prev) =>
          prev.map((w) => (w.id === workoutId ? { ...w, ...updatedWorkout } : w))
        );
      }
    },
    [user]
  );

  const deleteWorkout = useCallback(
    async (workoutId) => {
      if (user) {
        await deleteDoc(doc(db, 'workouts', workoutId));
      } else {
        setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
      }
    },
    [user]
  );

  // Optimisation des calculs avec useMemo
  const getWorkoutForDate = useCallback(
    (date) => {
      // Gérer le cas où date est une chaîne (YYYY-MM-DD) ou un objet Date
      let dateStr;
      if (typeof date === 'string') {
        dateStr = date;
      } else if (date instanceof Date) {
        dateStr = date.toISOString().split('T')[0];
      } else {
        return null;
      }
      return workouts.find((w) => w.date === dateStr);
    },
    [workouts]
  );

  const getStats = useCallback(() => {
    if (workouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalSets: 0,
        totalReps: 0,
        totalWeight: 0,
        avgDuration: 0,
      };
    }

    return workouts.reduce(
      (stats, workout) => {
        const workoutSets = workout.exercises?.reduce(
          (acc, ex) => acc + (ex.sets?.length || 0),
          0
        ) || 0;
        const workoutReps = workout.exercises?.reduce(
          (acc, ex) =>
            acc +
            (ex.sets?.reduce((setAcc, set) => setAcc + (set.reps || 0), 0) || 0),
          0
        ) || 0;
        const workoutWeight = workout.exercises?.reduce(
          (acc, ex) =>
            acc +
            (ex.sets?.reduce(
              (setAcc, set) => setAcc + (set.weight || 0) * (set.reps || 0),
              0
            ) || 0),
          0
        ) || 0;

        return {
          totalWorkouts: stats.totalWorkouts + 1,
          totalSets: stats.totalSets + workoutSets,
          totalReps: stats.totalReps + workoutReps,
          totalWeight: stats.totalWeight + workoutWeight,
          avgDuration:
            (stats.avgDuration * stats.totalWorkouts + (workout.duration || 0)) /
            (stats.totalWorkouts + 1),
        };
      },
      {
        totalWorkouts: 0,
        totalSets: 0,
        totalReps: 0,
        totalWeight: 0,
        avgDuration: 0,
      }
    );
  }, [workouts]);

  return {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutForDate,
    getStats,
  };
};
