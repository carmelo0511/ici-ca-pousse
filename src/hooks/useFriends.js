import { useState, useEffect, useCallback } from 'react';
import { db } from '../utils/firebase';
import { collection, doc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, query, where } from 'firebase/firestore';

export function useFriends(currentUser) {
  const [friends, setFriends] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Récupère le profil complet d'un user par UID
  const getUserProfile = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    return snap.exists() ? { uid, ...snap.data() } : null;
  };

  // Rafraîchit la liste d'amis et d'invitations
  const refreshFriends = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const data = userSnap.data();
    // Amis
    const friendsProfiles = await Promise.all(
      (data.friends || []).map(getUserProfile)
    );
    setFriends(friendsProfiles.filter(Boolean));
    // Invitations reçues (UIDs)
    const invitesProfiles = await Promise.all(
      (data.pendingInvites || []).map(getUserProfile)
    );
    setPendingInvites(invitesProfiles.filter(Boolean));
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    refreshFriends();
  }, [refreshFriends]);

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
    refreshFriends();
  };

  // Refuse une invitation reçue
  const declineInvite = async (uid) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid), {
      pendingInvites: arrayRemove(uid)
    });
    refreshFriends();
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
    refreshFriends();
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