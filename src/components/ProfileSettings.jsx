import React from 'react';
import Modal from './Modal';
import { useBadges } from '../hooks/useBadges';
import { BADGE_CONFIG } from './Badges';
import ProfilePicture from './ProfilePicture';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const ProfileSettings = ({ user, isOpen, onClose }) => {
  const { badges, selectedBadge } = useBadges(user.workouts, user.challenges, user);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleBadgeSelect = async (badgeId) => {
    setLoading(true);
    setError('');
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { selectedBadge: badgeId });
    } catch (e) {
      setError("Erreur lors de la sélection du badge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Paramètres du profil">
      <h2 className="text-xl font-bold mb-4 text-center">Mon Profil</h2>
      <div className="flex flex-col items-center mb-6">
        <ProfilePicture
          user={user}
          size="xl"
          useBadgeAsProfile={!!selectedBadge}
          selectedBadge={selectedBadge}
        />
        <div className="mt-2 text-lg font-semibold">{user.displayName || user.email}</div>
        <div className="text-sm text-gray-500">{user.email}</div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Choisir un badge comme avatar</h3>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge) => (
            <button
              key={badge}
              onClick={() => handleBadgeSelect(badge)}
              className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${selectedBadge === badge ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'} hover:border-indigo-400`}
              disabled={loading}
            >
              <span className={`text-3xl mb-1 ${BADGE_CONFIG[badge].color}`}>{BADGE_CONFIG[badge].icon}</span>
              <span className="text-xs text-gray-700 text-center">{BADGE_CONFIG[badge].name}</span>
              {selectedBadge === badge && <span className="text-indigo-500 text-xs mt-1">Sélectionné</span>}
            </button>
          ))}
        </div>
        <button
          onClick={() => handleBadgeSelect(null)}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium w-full"
          disabled={loading}
        >
          Retirer le badge de profil
        </button>
      </div>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
    </Modal>
  );
};

export default ProfileSettings; 