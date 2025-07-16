import { useState, useEffect, useCallback } from 'react';
import { load, save } from '../utils/storage';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export const useWorkouts = (user) => {
  const [workouts, setWorkouts] = useState([]);

  // Synchro Firestore temps réel si user connecté
  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'workouts'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setWorkouts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
      await addDoc(collection(db, 'workouts'), { ...workout, userId: user.uid });
    } else {
      setWorkouts(prev => [...prev, workout]);
    }
  }, [user]);

  const updateWorkout = useCallback(async (workoutId, updatedWorkout) => {
    if (user) {
      await updateDoc(doc(db, 'workouts', workoutId), updatedWorkout);
    } else {
      setWorkouts(prev => prev.map(w => w.id === workoutId ? updatedWorkout : w));
    }
  }, [user]);

  const deleteWorkout = useCallback(async (workoutId) => {
    if (user) {
      await deleteDoc(doc(db, 'workouts', workoutId));
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