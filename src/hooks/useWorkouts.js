import { useState, useEffect, useCallback } from 'react';
import { load, save } from '../utils/storage';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { cleanWorkoutForFirestore } from '../utils/workoutUtils';

export const useWorkouts = (user) => {
  const [workouts, setWorkouts] = useState([]);

  // Synchro Firestore temps réel si user connecté
  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'workouts'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setWorkouts(querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      });
      return unsubscribe;
    } else {
      // Fallback localStorage
      const savedWorkouts = load('iciCaPousse_workouts', []);
      setWorkouts(savedWorkouts);
    }
  }, [user]);

  // Sauvegarde locale si pas connecté
  useEffect(() => {
    if (!user) {
      save('iciCaPousse_workouts', workouts);
    }
  }, [workouts, user]);

  const addWorkout = useCallback(async (workout) => {
    if (user) {
      const cleanedWorkout = cleanWorkoutForFirestore(workout);
      await addDoc(collection(db, 'workouts'), { ...cleanedWorkout, userId: user.uid });
      // On ne met pas à jour localement, la synchro temps réel s'en charge
    } else {
      setWorkouts(prev => [...prev, { ...workout, id: workout.id || Date.now() }]);
    }
  }, [user]);

  const updateWorkout = useCallback(async (workoutId, updatedWorkout) => {
    if (user) {
      const cleanedWorkout = cleanWorkoutForFirestore(updatedWorkout);
      try {
        await updateDoc(doc(db, 'workouts', workoutId), cleanedWorkout);
      } catch (error) {
        console.error('Erreur update Firestore:', error);
        // Si le document n'existe pas, on le crée à la place
        if (error.code === 'not-found') {
          console.log('Document non trouvé, création d\'un nouveau workout');
          await addDoc(collection(db, 'workouts'), { ...cleanedWorkout, userId: user.uid });
        } else {
          throw error;
        }
      }
    } else {
      setWorkouts(prev => prev.map(w => w.id === workoutId ? updatedWorkout : w));
    }
  }, [user]);

  const deleteWorkout = useCallback(async (workoutId) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'workouts', workoutId));
      } catch (error) {
        console.error('Erreur suppression Firestore:', error);
        throw error;
      }
    } else {
      setWorkouts(prev => prev.filter(w => w.id !== workoutId));
    }
  }, [user]);

  const getWorkoutForDate = useCallback((date) => {
    return workouts.find(w => w.date === date);
  }, [workouts]);

  const getStats = useCallback(() => {
    const totalWorkouts = workouts.length;
    const totalSets = workouts.reduce((acc, w) => acc + (w.totalSets || 0), 0);
    const totalReps = workouts.reduce((acc, w) => acc + (w.totalReps || 0), 0);
    const totalWeight = workouts.reduce((acc, w) => acc + (w.totalWeight || 0), 0);
    const avgDuration = workouts.length > 0 
      ? Math.round(workouts.reduce((acc, w) => acc + (w.duration || 0), 0) / workouts.length) 
      : 0;
    return { totalWorkouts, totalSets, totalReps, totalWeight, avgDuration };
  }, [workouts]);

  return {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutForDate,
    getStats
  };
}; 