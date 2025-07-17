import { useState, useEffect } from 'react';
import { auth } from '../utils/firebase';
import { getUserProfile, ensureUserProfile } from '../utils/firebase';

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        try {
          // S'assurer que le profil existe avec l'expérience initialisée
          await ensureUserProfile(authUser);
          
          // Récupérer le profil complet depuis Firestore
          const profile = await getUserProfile(authUser.uid);
          if (profile) {
            // Fusionner les données Auth avec les données Firestore
            setUserProfile({
              ...authUser,
              ...profile
            });
          } else {
            setUserProfile(authUser);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          setUserProfile(authUser);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user: userProfile, loading };
} 