import { useState, useEffect } from 'react';
import { auth } from '../utils/firebase';
import { getUserProfile } from '../utils/firebase';

export function useUserProfile() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        try {
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