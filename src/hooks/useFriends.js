import { useState, useEffect, useCallback } from 'react';
import { db } from '../utils/firebase';
import { collection, doc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, query, where, onSnapshot } from 'firebase/firestore';
import { getUserProfile as getUserProfileFromFirebase } from '../utils/firebase';

export function useFriends(currentUser) {
  const [friends, setFriends] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Récupère le profil complet d'un user par UID
  const getUserProfile = async (uid) => {
    try {
      const profile = await getUserProfileFromFirebase(uid);
      return profile;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  };

  // Rafraîchit la liste d'amis et d'invitations
  const refreshFriends = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const data = userSnap.data();
    
    // Amis avec profils complets (photos et badges)
    const friendsProfiles = await Promise.all(
      (data.friends || []).map(getUserProfile)
    );
    setFriends(friendsProfiles.filter(Boolean));
    
    // Invitations reçues avec profils complets
    const invitesProfiles = await Promise.all(
      (data.pendingInvites || []).map(getUserProfile)
    );
    setPendingInvites(invitesProfiles.filter(Boolean));
    setLoading(false);
  }, [currentUser]);

  // Synchronisation en temps réel des profils amis
  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    
    // Écoute les changements du profil utilisateur actuel
    const unsubscribeUser = onSnapshot(userRef, async (userSnap) => {
      if (!userSnap.exists()) return;
      const data = userSnap.data();
      
      // Amis avec profils complets (photos et badges)
      const friendsProfiles = await Promise.all(
        (data.friends || []).map(getUserProfile)
      );
      setFriends(friendsProfiles.filter(Boolean));
      
      // Invitations reçues avec profils complets
      const invitesProfiles = await Promise.all(
        (data.pendingInvites || []).map(getUserProfile)
      );
      setPendingInvites(invitesProfiles.filter(Boolean));
      setLoading(false);
    });

    return () => {
      unsubscribeUser();
    };
  }, [currentUser]);

  // Envoie une invitation à un utilisateur par email
  const sendInvite = async (email) => {
    if (!currentUser) return;
    // Cherche l'utilisateur cible par email
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Utilisateur introuvable');
    const targetDoc = snap.docs[0];
    const targetUid = targetDoc.id;
    // Ajoute l'invitation dans pendingInvites du destinataire
    await updateDoc(doc(db, 'users', targetUid), {
      pendingInvites: arrayUnion(currentUser.uid)
    });
  };

  // Accepte une invitation reçue (uid = expéditeur)
  const acceptInvite = async (uid) => {
    if (!currentUser) return;
    // Ajoute chacun dans la liste d'amis de l'autre
    await updateDoc(doc(db, 'users', currentUser.uid), {
      friends: arrayUnion(uid),
      pendingInvites: arrayRemove(uid)
    });
    await updateDoc(doc(db, 'users', uid), {
      friends: arrayUnion(currentUser.uid)
    });
    // Pas besoin d'appeler refreshFriends() car onSnapshot sen charge
  };

  // Refuse une invitation reçue
  const declineInvite = async (uid) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid), {
      pendingInvites: arrayRemove(uid)
    });
    // Pas besoin d'appeler refreshFriends() car onSnapshot sen charge
  };

  // Supprime un ami
  const removeFriend = async (uid) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid), {
      friends: arrayRemove(uid)
    });
    await updateDoc(doc(db, 'users', uid), {
      friends: arrayRemove(currentUser.uid)
    });
    // Pas besoin d'appeler refreshFriends() car onSnapshot sen charge
  };

  return {
    friends,
    pendingInvites,
    loading,
    sendInvite,
    acceptInvite,
    declineInvite,
    removeFriend,
    refreshFriends
  };
} 