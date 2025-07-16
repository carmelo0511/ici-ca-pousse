import React, { memo } from 'react';
import { Dumbbell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';

const Header = memo(({ workoutCount, className = '', user }) => {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => i18n.changeLanguage(lng);

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
                {t('workout_done', { count: workoutCount })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => changeLanguage('fr')}
              className={`px-3 py-1 rounded-lg font-semibold border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${i18n.language === 'fr' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50'}`}
              aria-label="Passer en français"
            >
              FR
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 rounded-lg font-semibold border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${i18n.language === 'en' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50'}`}
              aria-label="Switch to English"
            >
              EN
            </button>
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
    </header>
  );
});

Header.propTypes = {
  workoutCount: PropTypes.number,
  className: PropTypes.string,
};

export default Header; 