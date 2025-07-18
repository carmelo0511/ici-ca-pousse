import React, { useState, useEffect } from 'react';
import { Calendar, BarChart3, Dumbbell, User, Trophy, Zap, Award, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
// import { useTranslation } from 'react-i18next'; // Temporarily disabled for CI
import PropTypes from 'prop-types';

const Navigation = ({ activeTab, setActiveTab, notifications = [], className = '' }) => {
  // const { t } = useTranslation(); // Temporarily disabled for CI
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = React.useRef(null);

  const navItems = [
    { id: 'workout', icon: Dumbbell, label: 'Séance', color: 'from-blue-500 to-blue-600', shortcut: 'W' },
    { id: 'calendar', icon: Calendar, label: 'Calendrier', color: 'from-green-500 to-green-600', shortcut: 'C' },
    { id: 'stats', icon: BarChart3, label: 'Statistiques', color: 'from-purple-500 to-purple-600', shortcut: 'S' },
    { id: 'friends', icon: User, label: 'Amis', color: 'from-pink-500 to-pink-600', shortcut: 'F' },
    { id: 'leaderboard', icon: Trophy, label: 'Classement', color: 'from-yellow-500 to-yellow-600', shortcut: 'L' },
    { id: 'challenges', icon: Zap, label: 'Défis', color: 'from-orange-500 to-orange-600', shortcut: 'D' },
    { id: 'badges', icon: Award, label: 'Badges', color: 'from-indigo-500 to-indigo-600', shortcut: 'B' },
    { id: 'notifications', icon: Bell, label: 'Notifications', color: 'from-red-500 to-red-600', shortcut: 'N' }
  ];

  // Vérifier si on peut faire défiler
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      setShowScrollButtons(scrollWidth > clientWidth);
    }
  };

  // Faire défiler
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
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
      const activeElement = scrollContainerRef.current.querySelector(`[data-tab="${activeTab}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  return (
    <nav className={`bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-40 ${className}`} role="navigation" aria-label="Navigation principale">
      <div className="relative px-4 md:px-6">
        {/* Boutons de défilement */}
        {showScrollButtons && (
          <>
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ${
                canScrollLeft ? 'hover:bg-gray-50 text-gray-600' : 'text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Défiler vers la gauche"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ${
                canScrollRight ? 'hover:bg-gray-50 text-gray-600' : 'text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Défiler vers la droite"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        <div 
          ref={scrollContainerRef}
          className="menu-horizontal-scroll space-x-2 md:space-x-4 py-2 px-2"
          onScroll={checkScroll}
        >
          {navItems.map(({ id, icon: Icon, label, color, shortcut }) => (
            <button
              key={id}
              data-tab={id}
              onClick={() => setActiveTab(id)}
              className={`group relative flex-shrink-0 py-3 px-4 md:px-6 rounded-xl font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${
                activeTab === id
                  ? `bg-gradient-to-r ${color} text-white shadow-lg transform scale-105`
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-md transform hover:scale-105'
              }`}
              aria-current={activeTab === id ? 'page' : undefined}
              aria-label={label}
            >
              <div className="flex items-center space-x-2 md:space-x-3">
                <Icon className={`h-5 w-5 transition-transform duration-200 ${activeTab === id ? 'animate-pulse' : 'group-hover:scale-110'}`} />
                <div className="flex flex-col items-start">
                  <span>{label}</span>
                </div>
              </div>
              
              {/* Indicateur de progression pour certains onglets */}
              {id === 'workout' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
              {id === 'notifications' && notifications && notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
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