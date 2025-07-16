import React from 'react';
import { Calendar, BarChart3, Dumbbell, User, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const Navigation = ({ activeTab, setActiveTab, className = '' }) => {
  const { t } = useTranslation();
  const navItems = [
    { id: 'workout', icon: Dumbbell, label: t('workout_tab') },
    { id: 'calendar', icon: Calendar, label: t('calendar_tab') },
    { id: 'stats', icon: BarChart3, label: t('stats_tab') },
    { id: 'friends', icon: User, label: 'Amis' },
    { id: 'leaderboard', icon: Trophy, label: 'Classement' }
  ];

  return (
    <nav className={`bg-white/80 backdrop-blur-sm border-b border-gray-200 ${className}`} role="navigation" aria-label="Navigation principale">
      <div className="px-6">
        <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-4 px-4 border-b-3 font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                activeTab === id
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              } rounded-t-lg`}
              aria-current={activeTab === id ? 'page' : undefined}
              aria-label={label}
            >
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </div>
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