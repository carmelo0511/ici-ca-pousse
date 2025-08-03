import React, { useState } from 'react';
import { useFriends } from '../../hooks/useFriends';
import { useNotifications } from '../../hooks/useNotifications';
import GradientButton from '../GradientButton';
import FriendProfile from './FriendProfile';
import BadgeList from '../Badges/Badges';
import ProfilePicture from './ProfilePicture';

function FriendsList({ user, showToastMsg, onShowFriendProfile }) {
  const { notifications, markAsRead } = useNotifications(user);
  const {
    friends,
    pendingInvites,
    loading,
    sendInvite,
    acceptInvite,
    declineInvite,
    removeFriend,
    refreshFriends,
  } = useFriends(user);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    try {
      await sendInvite(inviteEmail);
      setInviteSuccess('Invitation envoyée !');
      setInviteEmail('');
      refreshFriends();
      setTimeout(() => setInviteSuccess(''), 3000);
    } catch (err) {
      let msg = err.message || "Erreur lors de l'envoi";
      if (
        msg.toLowerCase().includes('utilisateur introuvable') ||
        msg.toLowerCase().includes('not found')
      ) {
        msg =
          "Aucun utilisateur trouvé avec cet email. Demande-lui de se connecter d'abord.";
      }
      setInviteError(msg);
      setTimeout(() => setInviteError(''), 3000);
    }
  };

  if (selectedFriend) {
    return (
      <FriendProfile
        friend={selectedFriend}
        onBack={() => setSelectedFriend(null)}
        showToastMsg={showToastMsg}
      />
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 card space-y-8">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Mes amis
      </h2>

      {/* Notifications d'amis */}
      {notifications.filter((n) => n.type === 'friend_invite' && !n.read)
        .length > 0 && (
        <div className="bg-blue-900/20 border-l-4 border-l-blue-500 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">👥</div>
              <div>
                <h3 className="font-semibold text-white">
                  Nouvelles invitations d'amis !
                </h3>
                <p className="text-sm text-gray-300">
                  Tu as{' '}
                  {
                    notifications.filter(
                      (n) => n.type === 'friend_invite' && !n.read
                    ).length
                  }{' '}
                  invitation(s) d'ami(s)
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                notifications
                  .filter((n) => n.type === 'friend_invite' && !n.read)
                  .forEach((n) => markAsRead(n.id))
              }
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Marquer comme lu
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSendInvite} className="flex gap-2 mb-4">
        <input
          type="email"
          placeholder="Email de l'ami à inviter"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          className="flex-1 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-gray-800 text-white"
          required
        />
        <GradientButton type="submit">Inviter</GradientButton>
      </form>
      {inviteError && (
        <div className="text-red-400 text-sm mb-2">{inviteError}</div>
      )}
      {inviteSuccess && (
        <div className="text-green-400 text-sm mb-2">{inviteSuccess}</div>
      )}

      <div>
        <h3 className="font-semibold text-blue-400 mb-2">
          Invitations reçues
        </h3>
        {pendingInvites.length === 0 ? (
          <div className="text-gray-300 text-sm mb-4">Aucune invitation</div>
        ) : (
          <ul className="space-y-2 mb-4">
            {pendingInvites.map((invite) => (
              <li
                key={invite.uid}
                className="flex items-center justify-between bg-blue-900/20 rounded-lg px-4 py-2"
              >
                <div className="flex items-center space-x-3">
                  <ProfilePicture
                    user={invite}
                    size="sm"
                    useBadgeAsProfile={!!invite.selectedBadge}
                    selectedBadge={invite.selectedBadge}
                  />
                  <span className="font-medium text-white">
                    {invite.displayName || invite.email}
                  </span>
                  {invite.badges && invite.badges.length > 0 && (
                    <BadgeList
                      badges={invite.badges}
                      size="xs"
                      maxDisplay={2}
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptInvite(invite.uid)}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-green-600"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => declineInvite(invite.uid)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-red-600"
                  >
                    Refuser
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-blue-400 mb-2">Amis</h3>
        {friends.length === 0 ? (
          <div className="text-gray-300 text-sm">Aucun ami pour l'instant</div>
        ) : (
          <ul className="space-y-3">
            {friends.map((friend) => (
              <li
                key={friend.uid}
                className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-3 hover:bg-gray-700/50 transition-colors"
              >
                <button
                  className="flex items-center space-x-3 text-left flex-1 group"
                  onClick={() => setSelectedFriend(friend)}
                  title="Voir le profil"
                >
                  <ProfilePicture
                    user={friend}
                    size="sm"
                    useBadgeAsProfile={!!friend.selectedBadge}
                    selectedBadge={friend.selectedBadge}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-blue-400 group-hover:underline truncate">
                      {friend.displayName || friend.email}
                    </div>
                    {friend.badges && friend.badges.length > 0 && (
                      <BadgeList
                        badges={friend.badges}
                        size="xs"
                        maxDisplay={3}
                      />
                    )}
                  </div>
                </button>
                <button
                  onClick={() => removeFriend(friend.uid)}
                  className="bg-red-900/30 text-red-400 px-3 py-1 rounded-lg font-semibold hover:bg-red-800/40 transition-colors"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {loading && <div className="text-gray-300 text-sm">Chargement...</div>}
    </div>
  );
}

export default FriendsList;
