import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase/index.js';
import StreakCounter from '../StreakCounter';
import { useExperience } from '../../hooks/useExperience.js';

const Header = memo(
  ({
    workoutCount,
    className = '',
    user,
    workouts = [],
    challenges = [],
    addBadgeUnlockXP,
    onUserUpdate,
    refreshUserProfile,
  }) => {
    // localUser supprimé car non utilisé

    // Ajout du hook d'expérience
    const { experience } = useExperience(user);

    // Suppression de l'effet car localUser n'est plus utilisé

    const handleSignOut = async () => {
      await signOut(auth);
      window.location.reload(); // force retour à Auth
    };

    // Calcul du pourcentage d'XP
    const xpPercent = experience?.progress || 0;
    const level = experience?.level || 1;
    const streak = experience?.streak || 0;

    return (
      <header
        className={`header mb-6 ${className}`}
      >
        <div className="max-w-4xl mx-auto px-2 sm:px-6">
          <div className="flex flex-row items-center w-full py-1 sm:py-4 gap-1 sm:gap-3 min-h-0">
          {/* Titre à gauche du header */}
          <h1 className="text-base sm:text-lg md:text-xl font-extrabold mr-3 whitespace-nowrap">
            Ici Ça Pousse
          </h1>
          {/* Le reste du header */}
          <div className="flex flex-row items-center flex-1 min-w-0 gap-1 sm:gap-3">
            {/* Badge niveau circulaire */}
            <div className="flex flex-col items-center min-w-0">
              <div className="w-7 h-7 sm:w-12 sm:h-12 icon-primary rounded-full flex items-center justify-center">
                <span className="text-xs sm:text-xl font-extrabold drop-shadow">
                  {level}
                </span>
              </div>
            </div>
            {/* Barre d'XP moderne */}
            <div className="flex flex-col items-center min-w-0 flex-1 mx-1">
              <div className="flex items-center w-full">
                <div className="relative w-20 h-1.5 sm:w-40 sm:h-3 progress rounded-full overflow-hidden">
                  <div
                    className="progress-fill absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                    style={{ width: `${xpPercent}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-[9px] sm:text-xs font-bold">
                  {Math.round(xpPercent)}%
                </span>
              </div>
            </div>
            {/* Streak avec titre */}
            <div className="flex flex-col items-center min-w-0">
              <StreakCounter streak={streak} />
            </div>
            {/* Bouton Sign Out */}
            {user && (
              <button
                onClick={handleSignOut}
                className="btn-secondary ripple-effect px-1.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-sm"
                aria-label="Déconnexion"
              >
                <span className="hidden sm:inline">Déconnexion</span>
                <span className="sm:hidden">⎋</span>
              </button>
            )}
          </div>
        </div>
        </div>
        {/* Titre centré sur mobile (supprimé pour compacité) */}
      </header>
    );
  }
);

Header.propTypes = {
  workoutCount: PropTypes.number,
  className: PropTypes.string,
  user: PropTypes.object,
  workouts: PropTypes.array,
  challenges: PropTypes.array,
  onUserUpdate: PropTypes.func,
};

export default Header;
