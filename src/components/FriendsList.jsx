import React, { useState } from 'react';
import { useFriends } from '../hooks/useFriends';
import GradientButton from './GradientButton';
import FriendProfile from './FriendProfile';

function FriendsList({ user }) {
  const {
    friends,
    pendingInvites,
    loading,
    sendInvite,
    acceptInvite,
    declineInvite,
    removeFriend,
    refreshFriends
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
      let msg = err.message || 'Erreur lors de l’envoi';
      if (msg.toLowerCase().includes('utilisateur introuvable') || msg.toLowerCase().includes('not found')) {
        msg = "Aucun utilisateur trouvé avec cet email. Demande-lui de se connecter d'abord.";
      }
      setInviteError(msg);
      setTimeout(() => setInviteError(''), 3000);
    }
  };

  if (selectedFriend) {
    return <FriendProfile friend={selectedFriend} onBack={() => setSelectedFriend(null)} />;
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-8">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Mes amis</h2>
      <form onSubmit={handleSendInvite} className="flex gap-2 mb-4">
        <input
          type="email"
          placeholder="Email de l’ami à inviter"
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
          required
        />
        <GradientButton type="submit">Inviter</GradientButton>
      </form>
      {inviteError && <div className="text-red-500 text-sm mb-2">{inviteError}</div>}
      {inviteSuccess && <div className="text-green-600 text-sm mb-2">{inviteSuccess}</div>}

      <div>
        <h3 className="font-semibold text-indigo-700 mb-2">Invitations reçues</h3>
        {pendingInvites.length === 0 ? (
          <div className="text-gray-400 text-sm mb-4">Aucune invitation</div>
        ) : (
          <ul className="space-y-2 mb-4">
            {pendingInvites.map(invite => (
              <li key={invite.uid} className="flex items-center justify-between bg-indigo-50 rounded-lg px-4 py-2">
                <span>{invite.displayName || invite.email}</span>
                <div className="flex gap-2">
                  <button onClick={() => acceptInvite(invite.uid)} className="bg-green-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-green-600">Accepter</button>
                  <button onClick={() => declineInvite(invite.uid)} className="bg-red-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-red-600">Refuser</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-indigo-700 mb-2">Amis</h3>
        {friends.length === 0 ? (
          <div className="text-gray-400 text-sm">Aucun ami pour l’instant</div>
        ) : (
          <ul className="space-y-2">
            {friends.map(friend => (
              <li key={friend.uid} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                <button
                  className="text-indigo-700 font-semibold hover:underline text-left flex-1"
                  onClick={() => setSelectedFriend(friend)}
                  title="Voir le profil"
                >
                  {friend.displayName || friend.email}
                </button>
                <button onClick={() => removeFriend(friend.uid)} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-semibold hover:bg-red-200">Supprimer</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {loading && <div className="text-gray-400 text-sm">Chargement...</div>}
    </div>
  );
}

export default FriendsList; 