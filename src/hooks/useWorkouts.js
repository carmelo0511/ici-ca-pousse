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
} from 'firebase/firestore';
import { cleanWorkoutForFirestore } from '../utils/workout/workoutUtils';

export const useWorkouts = (user) => {
  const [workouts, setWorkouts] = useState([]);

  // Synchro Firestore temps réel si user connecté
  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', user.uid)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setWorkouts(
          querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
        );
      });
      return unsubscribe;
    } else {
      // Fallback localStorage
      const savedWorkouts = load(STORAGE_KEYS.WORKOUTS, []);
      setWorkouts(savedWorkouts);
    }
  }, [user]);

  // Sauvegarde locale si pas connecté
  useEffect(() => {
    if (!user) {
      save(STORAGE_KEYS.WORKOUTS, workouts);
    }
  }, [workouts, user]);

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
        try {
          // setDoc permet de créer ou mettre à jour le document avec le même ID
          await setDoc(
            doc(db, 'workouts', workoutId),
            { ...cleanedWorkout, userId: user.uid },
            { merge: true }
          );
        } catch (error) {
          console.error('Erreur update Firestore:', error);
          throw error;
        }
      } else {
        setWorkouts((prev) =>
          prev.map((w) => (w.id === workoutId ? updatedWorkout : w))
        );
      }
    },
    [user]
  );

  const deleteWorkout = useCallback(
    async (workoutId) => {
      if (user) {
        try {
          await deleteDoc(doc(db, 'workouts', workoutId));
        } catch (error) {
          console.error('Erreur suppression Firestore:', error);
          throw error;
        }
      } else {
        setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
      }
    },
    [user]
  );

  const getWorkoutForDate = useCallback(
    (date) => {
      return workouts.find((w) => w.date === date);
    },
    [workouts]
  );

  const getStats = useCallback(() => {
    const totalWorkouts = workouts.length;
    const totalSets = workouts.reduce((acc, w) => acc + (w.totalSets || 0), 0);
    const totalReps = workouts.reduce((acc, w) => acc + (w.totalReps || 0), 0);
    const totalWeight = workouts.reduce(
      (acc, w) => acc + (w.totalWeight || 0),
      0
    );
    const avgDuration =
      workouts.length > 0
        ? Math.round(
            workouts.reduce((acc, w) => acc + (w.duration || 0), 0) /
              workouts.length
          )
        : 0;
    return { totalWorkouts, totalSets, totalReps, totalWeight, avgDuration };
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
