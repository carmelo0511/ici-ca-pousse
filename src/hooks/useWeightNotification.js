import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { WEIGHT_NOTIFICATION_CONFIG } from '../config/app';

/**
 * Hook pour gérer les notifications de poids hebdomadaires
 */
export const useWeightNotification = (user, refreshUserProfile, setActiveTab) => {
  const [showWeightNotif, setShowWeightNotif] = useState(false);
  const [isFading, setIsFading] = useState(false);

  // Vérifier si une notification de poids doit être affichée
  useEffect(() => {
    if (!user || !user.uid) return;

    const checkWeightNotif = async () => {
      // Date de la semaine courante (lundi)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, on remonte de 6 jours
      const monday = new Date(now);
      monday.setDate(now.getDate() + daysToMonday);
      monday.setHours(0, 0, 0, 0);
      const weekKey = monday.toISOString().slice(0, 10);
      
      const weightHistory = user.weightHistory || [];
      const hasEntry = weightHistory.some((w) => w.weekKey === weekKey);
      
      // Vérifie si la notif a déjà été affichée cette semaine
      const lastNotifWeek = localStorage.getItem(WEIGHT_NOTIFICATION_CONFIG.STORAGE_KEY);
      
      if (!hasEntry && lastNotifWeek !== weekKey) {
        setShowWeightNotif(true);
        localStorage.setItem(WEIGHT_NOTIFICATION_CONFIG.STORAGE_KEY, weekKey);
      }
    };

    checkWeightNotif();
  }, [user]);

  // Action 'C'est le même poids'
  const handleSameWeight = async () => {
    if (!user || !user.uid) return;
    
    setIsFading(true);
    setTimeout(() => setShowWeightNotif(false), WEIGHT_NOTIFICATION_CONFIG.FADE_DURATION);
    
    // Date de la semaine courante (lundi)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);
    const weekKey = monday.toISOString().slice(0, 10);
    
    const weightHistory = user.weightHistory || [];
    const last = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;
    
    if (last && last.weekKey !== weekKey) {
      const userRef = doc(db, 'users', user.uid);
      const newHistory = [...weightHistory, { weekKey, value: last.value }];
      await updateDoc(userRef, { weightHistory: newHistory });
      if (refreshUserProfile) await refreshUserProfile();
    } else {
      // Force refresh même si rien n'est ajouté
      if (refreshUserProfile) await refreshUserProfile();
    }
  };

  // Action 'Mettre à jour' (ouvre le profil)
  const handleUpdateWeight = () => {
    setIsFading(true);
    setTimeout(() => setShowWeightNotif(false), WEIGHT_NOTIFICATION_CONFIG.FADE_DURATION);
    setActiveTab('profile');
  };

  return {
    showWeightNotif,
    isFading,
    handleSameWeight,
    handleUpdateWeight,
  };
};