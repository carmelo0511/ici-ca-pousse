import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

export function useWeeklyBadgeUnlock(user) {
  const [weeklyUnlockData, setWeeklyUnlockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canUnlock, setCanUnlock] = useState(false);
  const [lastUnlockDate, setLastUnlockDate] = useState(null);

  // Charger les données de déblocage hebdomadaire
  useEffect(() => {
    if (!user?.uid) return;

    const loadWeeklyUnlockData = async () => {
      try {
        const unlockRef = doc(db, 'users', user.uid, 'weeklyUnlocks', 'data');
        const unlockDoc = await getDoc(unlockRef);
        
        if (unlockDoc.exists()) {
          const data = unlockDoc.data();
          setWeeklyUnlockData(data);
          setLastUnlockDate(data.lastUnlockDate ? new Date(data.lastUnlockDate) : null);
          
          // Vérifier si on peut débloquer (7 jours depuis le dernier déblocage)
          const now = new Date();
          const lastUnlock = data.lastUnlockDate ? new Date(data.lastUnlockDate) : null;
          
          if (!lastUnlock) {
            setCanUnlock(true);
          } else {
            const daysSinceLastUnlock = Math.floor((now - lastUnlock) / (1000 * 60 * 60 * 24));
            setCanUnlock(daysSinceLastUnlock >= 7);
          }
        } else {
          // Première fois, créer le document
          const initialData = {
            lastUnlockDate: null,
            unlockedBadges: [],
            canUnlock: true
          };
          await setDoc(unlockRef, initialData);
          setWeeklyUnlockData(initialData);
          setCanUnlock(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de déblocage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyUnlockData();
  }, [user?.uid]);

  // Fonction pour débloquer un badge
  const unlockBadge = async (badgeId) => {
    if (!user?.uid || !canUnlock) {
      throw new Error('Impossible de débloquer un badge pour le moment');
    }

    try {
      // Mettre à jour les données de déblocage
      const unlockRef = doc(db, 'users', user.uid, 'weeklyUnlocks', 'data');
      const now = new Date();
      
      await updateDoc(unlockRef, {
        lastUnlockDate: now.toISOString(),
        unlockedBadges: [...(weeklyUnlockData?.unlockedBadges || []), {
          badgeId,
          unlockedAt: now.toISOString()
        }]
      });

      // Mettre à jour les badges de l'utilisateur
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const currentBadges = userDoc.data()?.badges || [];
      
      if (!currentBadges.includes(badgeId)) {
        await updateDoc(userRef, {
          badges: [...currentBadges, badgeId]
        });
      }

      // Mettre à jour l'état local
      setWeeklyUnlockData(prev => ({
        ...prev,
        lastUnlockDate: now.toISOString(),
        unlockedBadges: [...(prev?.unlockedBadges || []), {
          badgeId,
          unlockedAt: now.toISOString()
        }]
      }));
      setLastUnlockDate(now);
      setCanUnlock(false);

      return true;
    } catch (error) {
      console.error('Erreur lors du déblocage du badge:', error);
      throw error;
    }
  };

  // Calculer le temps restant avant le prochain déblocage
  const getTimeUntilNextUnlock = () => {
    if (canUnlock || !lastUnlockDate) return null;
    
    const now = new Date();
    const nextUnlock = new Date(lastUnlockDate);
    nextUnlock.setDate(nextUnlock.getDate() + 7);
    
    const timeDiff = nextUnlock - now;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days, hours };
  };

  // Fonction de test pour réinitialiser le déblocage hebdomadaire
  const resetWeeklyUnlock = async () => {
    if (!user?.uid) return;

    try {
      const unlockRef = doc(db, 'users', user.uid, 'weeklyUnlocks', 'data');
      const resetData = {
        lastUnlockDate: null,
        unlockedBadges: weeklyUnlockData?.unlockedBadges || [],
        canUnlock: true
      };
      
      await setDoc(unlockRef, resetData);
      setWeeklyUnlockData(resetData);
      setLastUnlockDate(null);
      setCanUnlock(true);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      throw error;
    }
  };

  return {
    loading,
    canUnlock,
    lastUnlockDate,
    weeklyUnlockData,
    unlockBadge,
    getTimeUntilNextUnlock,
    resetWeeklyUnlock
  };
} 