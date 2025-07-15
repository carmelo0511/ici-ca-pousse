import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Bell, BellOff } from 'lucide-react';

const PWAStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérifier la permission des notifications
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Envoyer une notification de test
        new Notification('Ici Ca Pousse', {
          body: 'Notifications activées ! Vous recevrez des rappels pour vos séances.',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png'
        });
      }
    }
  };

  const sendTestNotification = () => {
    if (notificationPermission === 'granted') {
      new Notification('Rappel Séance', {
        body: 'Il est temps de faire votre séance d\'entraînement ! 💪',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [100, 50, 100]
      });
    }
  };

  return (
    <div className="fixed top-4 right-4 flex flex-col space-y-2 z-50">
      {/* Statut de connexion */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-full shadow-lg ${
        isOnline ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        <span className="text-sm font-medium">
          {isOnline ? 'En ligne' : 'Hors ligne'}
        </span>
      </div>

      {/* Gestion des notifications */}
      <div className="bg-white rounded-full shadow-lg p-2">
        {notificationPermission === 'granted' ? (
          <button
            onClick={sendTestNotification}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="text-sm font-medium">Test notification</span>
          </button>
        ) : (
          <button
            onClick={requestNotificationPermission}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
          >
            <BellOff className="h-4 w-4" />
            <span className="text-sm font-medium">Activer notifications</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PWAStatus; 