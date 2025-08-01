import { useState, useEffect, useCallback } from 'react';
import { db } from '../utils/firebase/index.js';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
  formatNotificationDate,
} from '../utils/notifications';

export const useNotifications = (user) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Écouter les changements de notifications en temps réel
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const userNotifications = userData.notifications || [];

          // Trier par date (plus récentes en premier)
          const sortedNotifications = userNotifications.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );

          setNotifications(sortedNotifications);
          setUnreadCount(sortedNotifications.filter((n) => !n.read).length);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Erreur lors de l'écoute des notifications:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!user) return;
      await markNotificationAsRead(user.uid, notificationId);
    },
    [user]
  );

  // Supprimer une notification
  const removeNotification = useCallback(
    async (notificationId) => {
      if (!user) return;
      await deleteNotification(user.uid, notificationId);
    },
    [user]
  );

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    await markAllNotificationsAsRead(user.uid);
  }, [user]);

  // Obtenir les notifications non lues
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((notification) => !notification.read);
  }, [notifications]);

  // Obtenir les notifications récentes (dernières 24h)
  const getRecentNotifications = useCallback(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return notifications.filter(
      (notification) => new Date(notification.timestamp) > oneDayAgo
    );
  }, [notifications]);

  // Formater une notification pour l'affichage
  const formatNotification = useCallback((notification) => {
    return {
      ...notification,
      formattedDate: formatNotificationDate(notification.timestamp),
      isRecent:
        new Date(notification.timestamp) > new Date(Date.now() - 5 * 60 * 1000), // 5 minutes
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    removeNotification,
    markAllAsRead,
    getUnreadNotifications,
    getRecentNotifications,
    formatNotification,
  };
};
