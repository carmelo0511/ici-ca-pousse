import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function getStreakTitle(streak) {
  if (streak >= 100) return 'LÉGENDE DU FITNESS';
  if (streak >= 50) return 'MYTHE DE LA MUSCULATION';
  if (streak >= 30) return 'INCROYABLE DÉTERMINATION';
  if (streak >= 21) return 'HABITUDE DE CHAMPION';
  if (streak >= 14) return "RÉGULARITÉ D'ACIER";
  if (streak >= 7) return 'FEU SACRÉ';
  if (streak >= 3) return 'MOMENTUM';
  if (streak >= 1) return 'DÉBUTANT MOTIVÉ';
  return '';
}

function getStreakColor(streak) {
  if (streak >= 100) return 'text-red-400';
  if (streak >= 50) return 'text-orange-400';
  if (streak >= 30) return 'text-yellow-400';
  if (streak >= 21) return 'text-emerald-400';
  if (streak >= 14) return 'text-blue-400';
  if (streak >= 7) return 'text-cyan-400';
  if (streak >= 3) return 'text-pink-400';
  return 'text-gray-400';
}

function getStreakIcon(streak) {
  if (streak >= 100) return '👑';
  if (streak >= 50) return '⚡';
  if (streak >= 30) return '🌟';
  if (streak >= 21) return '💎';
  if (streak >= 14) return '🎯';
  if (streak >= 7) return '🔥';
  if (streak >= 3) return '💪';
  return '🚀';
}

const StreakCounter = ({ streak, className = '' }) => {
  const [displayStreak, setDisplayStreak] = useState(streak);

  useEffect(() => {
    if (streak > displayStreak) {
      let current = displayStreak;
      const timer = setInterval(() => {
        current++;
        setDisplayStreak(current);
        if (current >= streak) {
          clearInterval(timer);
        }
      }, 40);
      return () => clearInterval(timer);
    } else {
      setDisplayStreak(streak);
    }
  }, [streak, displayStreak]);

  return (
    <div
      className={`relative flex items-center space-x-0.5 bg-gray-900/90 rounded-lg px-1.5 py-0.5 border border-gray-700/50 shadow-md backdrop-blur-sm ${className}`}
      style={{ minWidth: 0 }}
    >
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg"></div>
      
      {/* Icône avec effet glow */}
      <span
        className={`text-xs ${getStreakColor(streak)} drop-shadow-sm`}
        style={{ 
          minWidth: '12px',
          textShadow: `0 0 4px ${streak >= 7 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(156, 163, 175, 0.2)'}`
        }}
      >
        {getStreakIcon(streak)}
      </span>
      
      {/* Contenu principal */}
      <div className="relative flex flex-col items-center">
        <span
          className="text-[10px] font-bold text-gray-100"
          style={{ letterSpacing: '0.3px' }}
        >
          {displayStreak}<span className="text-[8px] font-medium text-gray-300 ml-0.5">j</span>
        </span>
        {getStreakTitle(streak) && (
          <span
            className={`text-[6px] font-semibold ${getStreakColor(streak)} uppercase tracking-wide leading-none text-center opacity-80`}
            style={{ 
              textShadow: `0 0 2px ${streak >= 7 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(156, 163, 175, 0.1)'}`
            }}
          >
            {getStreakTitle(streak)}
          </span>
        )}
      </div>
      
      {/* Effet de bordure brillante pour les streaks élevées */}
      {streak >= 7 && (
        <div className="absolute inset-0 rounded-lg border border-blue-400/20 shadow-[0_0_8px_rgba(59,130,246,0.15)]"></div>
      )}
    </div>
  );
};

StreakCounter.propTypes = {
  streak: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default StreakCounter;
