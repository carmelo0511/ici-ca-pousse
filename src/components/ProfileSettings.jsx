import React from 'react';
import Modal from './Modal';
import { useBadges } from '../hooks/useBadges';
import { BADGE_CONFIG } from './Badges';
import ProfilePicture from './ProfilePicture';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const ProfileSettings = ({ user, workouts = [], challenges = [], isOpen, onClose, onUserUpdate }) => {
  const { badges, selectedBadge } = useBadges(workouts, challenges, user);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [localSelectedBadge, setLocalSelectedBadge] = React.useState(selectedBadge);
  const [successMessage, setSuccessMessage] = React.useState('');

  // Mettre à jour l'état local quand selectedBadge change
  React.useEffect(() => {
    setLocalSelectedBadge(selectedBadge);
  }, [selectedBadge]);

  const handleBadgeSelect = async (badgeId) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { selectedBadge: badgeId });
      
      // Mettre à jour l'état local immédiatement
      setLocalSelectedBadge(badgeId);
      
      // Mettre à jour l'utilisateur localement
      if (onUserUpdate) {
        onUserUpdate({ ...user, selectedBadge: badgeId });
      }
      
      // Afficher un message de succès
      if (badgeId) {
        setSuccessMessage(`Badge "${BADGE_CONFIG[badgeId]?.name}" sélectionné !`);
      } else {
        setSuccessMessage('Badge retiré du profil');
      }
      
      // Effacer le message après 3 secondes
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (e) {
      console.error('Erreur lors de la sélection du badge:', e);
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
          useBadgeAsProfile={!!localSelectedBadge}
          selectedBadge={localSelectedBadge}
        />
        <div className="mt-2 text-lg font-semibold">{user.displayName || user.email}</div>
        <div className="text-sm text-gray-500">{user.email}</div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Choisir un badge comme avatar</h3>
        {badges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔒</div>
            <p>Aucun badge débloqué pour l'instant</p>
            <p className="text-sm">Commence à t'entraîner pour débloquer des badges !</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {badges.map((badge) => (
              <button
                key={badge}
                onClick={() => handleBadgeSelect(badge)}
                className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${localSelectedBadge === badge ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'} hover:border-indigo-400`}
                disabled={loading}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${BADGE_CONFIG[badge].color}`}>
                  {BADGE_CONFIG[badge].icon}
                </div>
                <span className="text-xs text-gray-700 text-center mt-1">{BADGE_CONFIG[badge].name}</span>
                {localSelectedBadge === badge && <span className="text-indigo-500 text-xs mt-1">✓ Sélectionné</span>}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => handleBadgeSelect(null)}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium w-full"
          disabled={loading}
        >
          Retirer le badge de profil
        </button>
      </div>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {successMessage && <div className="text-green-600 text-sm mb-2 bg-green-50 p-2 rounded-lg">{successMessage}</div>}
    </Modal>
  );
};

export default ProfileSettings; 