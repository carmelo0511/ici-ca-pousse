import React, { memo } from 'react';
import { Dumbbell } from 'lucide-react';
import PropTypes from 'prop-types';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import ProfileSettings from '../Profile/ProfileSettings';
import ProfilePicture from '../Profile/ProfilePicture';
import { useExperience } from '../../hooks/useExperience.js';
import StreakCounter from '../StreakCounter';

const Header = memo(({ workoutCount, className = '', user, workouts = [], challenges = [], addBadgeUnlockXP, onUserUpdate, refreshUserProfile }) => {
  const [showProfile, setShowProfile] = React.useState(false);
  const [localUser, setLocalUser] = React.useState(user);

  // Ajout du hook d'expérience
  const { experience } = useExperience(user);

  // Mettre à jour l'utilisateur local quand user change
  React.useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
    window.location.reload(); // force retour à Auth
  };

  return (
    <header className={`bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200 ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Ici Ca Pousse
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                {`Séances effectuées : ${workoutCount}`}
              </p>
              {/* Barre d'expérience et niveau */}
              {user && (
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-semibold text-indigo-700">
                        Niveau {experience?.level || 1} - {experience?.levelName || 'Débutant'}
                      </span>
                      <div className="w-40 h-3 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                          style={{ width: `${experience?.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">{experience?.xp || 0} XP</span>
                  </div>
                  {/* StreakCounter intégré */}
                  <StreakCounter streak={experience?.streak || 0} />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-wrap w-full justify-end sm:justify-end sm:flex-row flex-col gap-2">
            {/* Avatar utilisateur pour ouvrir la modale de profil */}
            {localUser && (
              <button
                onClick={() => setShowProfile(true)}
                className="ml-2 flex items-center justify-center w-10 h-10 rounded-full border-2 border-indigo-400 bg-white hover:bg-indigo-50 transition-all"
                aria-label="Modifier le profil"
              >
                <ProfilePicture 
                  user={localUser} 
                  size="sm" 
                  useBadgeAsProfile={!!localUser.selectedBadge}
                  selectedBadge={localUser.selectedBadge}
                />
              </button>
            )}
            {/* Bouton Sign Out */}
            {user && (
              <button
                onClick={handleSignOut}
                className="ml-2 px-3 py-1 rounded-lg font-semibold border border-red-400 bg-red-50 text-red-600 hover:bg-red-100 transition-all text-sm"
                aria-label="Déconnexion"
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Modale de profil */}
      {localUser && (
        <ProfileSettings 
          user={localUser} 
          workouts={workouts} 
          challenges={challenges} 
          isOpen={showProfile} 
          onClose={() => setShowProfile(false)}
          onUserUpdate={(updatedUser) => {
            setLocalUser(updatedUser);
            if (onUserUpdate) {
              onUserUpdate(updatedUser);
            }
          }}
          addBadgeUnlockXP={addBadgeUnlockXP}
          refreshUserProfile={refreshUserProfile}
        />
      )}
    </header>
  );
});

Header.propTypes = {
  workoutCount: PropTypes.number,
  className: PropTypes.string,
  user: PropTypes.object,
  workouts: PropTypes.array,
  challenges: PropTypes.array,
  onUserUpdate: PropTypes.func,
};

export default Header; // Force rebuild
