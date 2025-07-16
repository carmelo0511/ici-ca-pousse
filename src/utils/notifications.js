import { db } from './firebase';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

// Types de notifications
export const NOTIFICATION_TYPES = {
  CHALLENGE_INVITE: 'challenge_invite',
  CHALLENGE_UPDATE: 'challenge_update',
  CHALLENGE_COMPLETED: 'challenge_completed',
  FRIEND_INVITE: 'friend_invite',
  FRIEND_ACCEPTED: 'friend_accepted'
};

// Créer une notification
export const createNotification = async (userId, notification) => {
  if (!userId) return;
  
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  
  const userData = userSnap.data();
  
  const newNotification = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    read: false,
    ...notification
  };
  
  await updateDoc(userRef, {
    notifications: arrayUnion(newNotification)
  });
  
  return newNotification;
};

// Envoyer une notification de défi
export const sendChallengeNotification = async (challenge, sender, recipientId) => {
  const notification = {
    type: NOTIFICATION_TYPES.CHALLENGE_INVITE,
    title: 'Nouveau défi !',
    message: `${sender.displayName || sender.email} t'a défié dans un défi de ${getChallengeTypeLabel(challenge.type)} !`,
    challengeId: challenge.id,
    senderId: sender.uid,
    senderName: sender.displayName || sender.email,
    challengeType: challenge.type,
    challengeDuration: challenge.duration
  };
  
  return await createNotification(recipientId, notification);
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (userId, notificationId) => {
  if (!userId) return;
  
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  
  const userData = userSnap.data();
  const notifications = userData.notifications || [];
  
  const updatedNotifications = notifications.map(notification => 
    notification.id === notificationId 
      ? { ...notification, read: true }
      : notification
  );
  
  await updateDoc(userRef, {
    notifications: updatedNotifications
  });
};

// Supprimer une notification
export const deleteNotification = async (userId, notificationId) => {
  if (!userId) return;
  
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  
  const userData = userSnap.data();
  const notifications = userData.notifications || [];
  
  const updatedNotifications = notifications.filter(notification => 
    notification.id !== notificationId
  );
  
  await updateDoc(userRef, {
    notifications: updatedNotifications
  });
};

// Marquer toutes les notifications comme lues
export const markAllNotificationsAsRead = async (userId) => {
  if (!userId) return;
  
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  
  const userData = userSnap.data();
  const notifications = userData.notifications || [];
  
  const updatedNotifications = notifications.map(notification => ({
    ...notification,
    read: true
  }));
  
  await updateDoc(userRef, {
    notifications: updatedNotifications
  });
};

// Fonctions utilitaires
const getChallengeTypeLabel = (type) => {
  const types = {
    'workouts': 'nombre de séances',
    'duration': 'temps d\'entraînement',
    'streak': 'série consécutive',
    'calories': 'calories brûlées'
  };
  return types[type] || type;
};

// Formater la date de notification
export const formatNotificationDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'À l\'instant';
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
  return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
}; 