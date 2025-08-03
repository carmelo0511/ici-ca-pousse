import React, { useState, useEffect } from 'react';
import {
  Calendar,
  BarChart3,
  Dumbbell,
  User,
  Trophy,
  Zap,
  Award,
  ChevronLeft,
  ChevronRight,
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
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
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

  // Vérifier si on peut faire défiler
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      setShowScrollButtons(scrollWidth > clientWidth);
    }
  };

  // Faire défiler
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  useEffect(() => {
    // Faire défiler vers l'onglet actif
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(
        `[data-tab="${activeTab}"]`
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeTab]);

  return (
    <nav
      className={`navbar sticky top-0 z-40 mb-6 ${className}`}
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="relative px-4 md:px-6">
        {/* Boutons de défilement */}
        {showScrollButtons && (
          <>
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 btn-secondary ripple-effect rounded-full flex items-center justify-center ${
                canScrollLeft
                  ? ''
                  : 'cursor-not-allowed'
              }`}
              aria-label="Défiler vers la gauche"
            >
              <ChevronLeft className="h-4 w-4 nav-icon" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 btn-secondary ripple-effect rounded-full flex items-center justify-center ${
                canScrollRight
                  ? ''
                  : 'cursor-not-allowed'
              }`}
              aria-label="Défiler vers la droite"
            >
              <ChevronRight className="h-4 w-4 nav-icon" />
            </button>
          </>
        )}

        <div
          ref={scrollContainerRef}
          className="flex flex-row overflow-x-auto flex-nowrap min-w-0 w-full space-x-1 md:space-x-2 py-3 px-1 max-w-4xl mx-auto"
          onScroll={checkScroll}
        >
          {navItems.map(({ id, icon: Icon, label, color, shortcut }) => (
            <button
              key={id}
              data-tab={id}
              onClick={() => setActiveTab(id)}
              className={`nav-tab ripple-effect group relative flex-shrink-0 py-1.5 px-2.5 md:py-2 md:px-4 font-semibold text-xs md:text-sm focus:outline-none max-w-[90px] md:max-w-[120px] truncate text-ellipsis text-center ${
                activeTab === id ? 'active' : ''
              }`}
              aria-current={activeTab === id ? 'page' : undefined}
              aria-label={label}
            >
              <div className="flex flex-col items-center justify-center gap-1 w-full">
                <Icon
                  className={`nav-icon h-4 w-4 md:h-5 md:w-5 transition-transform duration-200 ${activeTab === id ? 'animate-pulse' : 'group-hover:scale-110'}`}
                />
                <span className="truncate w-full">{label}</span>
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
