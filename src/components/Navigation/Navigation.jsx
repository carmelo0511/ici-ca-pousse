import React from 'react';
import {
  Calendar,
  BarChart3,
  Dumbbell,
  User,
  Trophy,
  Zap,
  Award,
  Bookmark,
} from 'lucide-react';
// import { useTranslation } from 'react-i18next'; // Temporarily disabled for CI
import PropTypes from 'prop-types';

const Navigation = ({
  activeTab,
  setActiveTab,
  notifications = [],
  className = '',
}) => {
  // const { t } = useTranslation(); // Temporarily disabled for CI
  const scrollContainerRef = React.useRef(null);


  const navItems = [
    {
      id: 'workout',
      icon: Dumbbell,
      label: 'Séance',
      color: 'from-blue-500 to-blue-600',
      shortcut: 'W',
    },
    {
      id: 'calendar',
      icon: Calendar,
      label: 'Calendrier',
      color: 'from-blue-500 to-blue-600',
      shortcut: 'C',
    },
    {
      id: 'stats',
      icon: BarChart3,
      label: 'Statistiques',
      color: 'from-blue-500 to-blue-600',
      shortcut: 'S',
    },
    {
      id: 'templates',
      icon: Bookmark,
      label: 'Templates',
      color: 'from-blue-500 to-blue-600',
      shortcut: 'T',
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profil',
      color: 'from-blue-500 to-blue-600',
      shortcut: 'P',
    },
    {
      id: 'leaderboard',
      icon: Trophy,
      label: 'Classement & Amis',
      color: 'from-blue-500 to-blue-600',
      shortcut: 'L',
    },
    {
      id: 'challenges',
      icon: Zap,
      label: 'Défis',
      color: 'from-blue-500 to-blue-600',
      shortcut: 'D',
    },
    {
      id: 'badges',
      icon: Award,
      label: 'Badges',
      color: 'from-blue-500 to-blue-600',
      shortcut: 'B',
    },

  ];







  return (
    <nav
      className={`navbar sticky top-0 z-40 mb-6 ${className}`}
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="max-w-4xl mx-auto px-2 sm:px-6">
        <div
          ref={scrollContainerRef}
          className="flex flex-row overflow-x-auto flex-nowrap min-w-0 w-full space-x-1 md:space-x-4 lg:space-x-6 py-3"
        >
          {navItems.map(({ id, icon: Icon, label, color, shortcut }) => (
            <button
              key={id}
              data-tab={id}
              onClick={() => setActiveTab(id)}
              className={`nav-tab ripple-effect group relative flex-shrink-0 py-2 px-3 md:py-2.5 md:px-4 font-semibold text-xs md:text-sm focus:outline-none w-[85px] md:w-[100px] lg:w-[120px] text-center ${
                activeTab === id ? 'active' : ''
              }`}
              aria-current={activeTab === id ? 'page' : undefined}
              aria-label={label}
            >
              <div className="flex flex-col items-center justify-center gap-1 w-full">
                <Icon
                  className={`nav-icon h-4 w-4 md:h-5 md:w-5 transition-transform duration-200 ${activeTab === id ? 'animate-pulse' : 'group-hover:scale-110'}`}
                />
                <span className="truncate w-full leading-tight">{label}</span>
              </div>
              {/* Indicateur de progression pour certains onglets */}
              {id === 'challenges' &&
                notifications &&
                notifications.filter(
                  (n) => n.type === 'challenge_invite' && !n.read
                ).length > 0 && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                )}
              {id === 'friends' &&
                notifications &&
                notifications.filter(
                  (n) => n.type === 'friend_invite' && !n.read
                ).length > 0 && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

Navigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default Navigation;
