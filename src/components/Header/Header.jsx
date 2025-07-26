import React, { memo, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import PropTypes from 'prop-types';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import ProfileSettings from '../Profile/ProfileSettings';
import ProfilePicture from '../Profile/ProfilePicture';
import StreakCounter from '../StreakCounter';
import { useExperience } from '../../hooks/useExperience.js';
import { STORAGE_KEYS } from '../../constants';

const Header = memo(({ workoutCount, className = '', user, workouts = [], challenges = [], addBadgeUnlockXP, onUserUpdate, refreshUserProfile }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const [theme, setTheme] = useState('light');

  // Ajout du hook d'expérience
  const { experience } = useExperience(user);

  // Dark mode: détecte le mode système à l'init
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved) {
      setTheme(saved);
      document.body.classList.toggle('dark', saved === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.body.classList.toggle('dark', prefersDark);
    }
  }, []);

  // Applique la classe dark/light sur le body à chaque changement
  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Mettre à jour l'utilisateur local quand user change
  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
    window.location.reload(); // force retour à Auth
  };

  // Calcul du pourcentage d'XP
  const xpPercent = experience?.progress || 0;
  const level = experience?.level || 1;
  const streak = experience?.streak || 0;

  return (
    <header className={`backdrop-blur-md bg-gradient-to-r from-indigo-500/80 to-purple-600/80 shadow-xl rounded-b-2xl border-b border-indigo-200 dark:border-gray-800 ${className}`}>
      <div className="flex flex-row items-center w-full px-1.5 py-1 sm:px-8 sm:py-4 gap-1 sm:gap-3 min-h-0">
        {/* Titre à gauche du header */}
        <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-black dark:text-white mr-3 whitespace-nowrap">
          Ici Ça Pousse
        </h1>
        {/* Le reste du header */}
        <div className="flex flex-row items-center flex-1 min-w-0 gap-1 sm:gap-3">
          {/* Badge niveau circulaire */}
          <div className="flex flex-col items-center min-w-0">
            <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow animate-pop border-2 border-white dark:border-white bg-gradient-to-tr from-green-400 to-blue-500 dark:from-cyan-300 dark:to-green-300">
              <span className="text-xs sm:text-xl font-extrabold text-black drop-shadow">{level}</span>
            </div>
          </div>
          {/* Barre d'XP moderne */}
          <div className="flex flex-col items-center min-w-0 flex-1 mx-1">
            <div className="flex items-center w-full">
              <div className="relative w-20 h-1.5 sm:w-40 sm:h-3 bg-black/10 dark:bg-white/30 rounded-full overflow-hidden shadow-inner">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-400 to-blue-500 dark:from-cyan-300 dark:to-green-300 transition-all duration-700"
                  style={{ width: `${xpPercent}%` }}
                ></div>
              </div>
              <span className="ml-2 text-[9px] sm:text-xs font-bold text-black dark:text-white">{Math.round(xpPercent)}%</span>
            </div>
          </div>
          {/* Streak avec titre */}
          <div className="flex flex-col items-center min-w-0 mx-1">
            <StreakCounter streak={streak} className="bg-white/80 dark:bg-gray-800/80 dark:text-white" />
          </div>
          {/* Profil et actions */}
          <div className="flex items-center gap-0.5 sm:gap-2 min-w-0">
            {/* Switch dark mode */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-indigo-300 bg-white/80 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-all shadow"
              aria-label="Basculer le mode sombre"
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400" /> : <Moon className="h-4 w-4 sm:h-6 sm:w-6 text-gray-700" />}
            </button>
            {/* Avatar utilisateur avec halo coloré */}
            {localUser && (
              <button
                onClick={() => setShowProfile(true)}
                className="relative flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-indigo-400 bg-white hover:bg-indigo-50 transition-all shadow group"
                aria-label="Modifier le profil"
              >
                <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 opacity-60 blur-sm animate-halo"></span>
                <ProfilePicture 
                  user={localUser} 
                  size="xs" 
                  useBadgeAsProfile={!!localUser.selectedBadge}
                  selectedBadge={localUser.selectedBadge}
                />
              </button>
            )}
            {/* Bouton Sign Out */}
            {user && (
              <button
                onClick={handleSignOut}
                className="px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg font-semibold border border-red-400 bg-red-50 text-red-600 hover:bg-red-100 transition-all text-[10px] sm:text-sm shadow"
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

export default Header;
