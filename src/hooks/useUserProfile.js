import { useState, useEffect, useCallback } from 'react';
import { auth } from '../utils/firebase/index.js';
import { getUserProfile, ensureUserProfile } from '../utils/firebase/index.js';

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser) => {
    if (authUser) {
      try {
        await ensureUserProfile(authUser);
        const profile = await getUserProfile(authUser.uid);
        if (profile) {
          setUserProfile({ ...authUser, ...profile });
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
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(fetchProfile);
    return unsubscribe;
  }, [fetchProfile]);

  // Permet de rafraîchir le profil à la demande
  const refreshUserProfile = useCallback(async () => {
    const authUser = auth.currentUser;
    if (authUser) {
      setLoading(true);
      await fetchProfile(authUser);
      setLoading(false);
    }
  }, [fetchProfile]);

  return { user: userProfile, loading, refreshUserProfile };
}
