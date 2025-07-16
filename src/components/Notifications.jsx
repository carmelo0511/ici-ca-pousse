import React, { useState } from 'react';
import Card from './Card';
import { Bell, X, Check, Zap, Trophy, User, Users } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const Notifications = ({ user }) => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    removeNotification, 
    markAllAsRead,
    formatNotification 
  } = useNotifications(user);
  const [showAll, setShowAll] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'challenge_invite':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'challenge_completed':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'friend_invite':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'friend_accepted':
        return <Users className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'challenge_invite':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'challenge_completed':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'friend_invite':
        return 'border-l-blue-500 bg-blue-50';
      case 'friend_accepted':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔔</div>
          <h3 className="text-lg font-semibold mb-2">Chargement des notifications...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        {unreadCount > 0 && (
          <div className="flex items-center space-x-2">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {unreadCount}
            </span>
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Tout marquer comme lu
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
            <p className="text-gray-600">Tu recevras des notifications quand tes amis t'enverront des défis !</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayedNotifications.map(notification => {
            const formattedNotification = formatNotification(notification);
            return (
              <Card 
                key={notification.id} 
                className={`border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formattedNotification.formattedDate}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Marquer comme lu</span>
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-xs text-red-600 hover:text-red-800 flex items-center space-x-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          
          {notifications.length > 5 && (
            <div className="text-center pt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {showAll ? 'Voir moins' : `Voir toutes (${notifications.length})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications; 