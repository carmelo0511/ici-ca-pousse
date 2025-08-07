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
  if (streak >= 100) return 'text-red-500';
  if (streak >= 50) return 'text-orange-500';
  if (streak >= 30) return 'text-yellow-500';
  if (streak >= 21) return 'text-green-500';
  if (streak >= 14) return 'text-blue-500';
  if (streak >= 7) return 'text-purple-500';
  if (streak >= 3) return 'text-pink-500';
  return 'text-orange-300';
}

function getStreakIcon(streak) {
  if (streak >= 100) return '🔥';
  if (streak >= 50) return '⚡';
  if (streak >= 30) return '🌟';
  if (streak >= 21) return '💪';
  if (streak >= 14) return '🎯';
  if (streak >= 7) return '🔥';
  if (streak >= 3) return '🔥';
  return '🔥';
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
      className={`flex items-center space-x-0.5 md:space-x-1 bg-white/90 dark:bg-gray-800/90 rounded-lg px-1.5 md:px-2 py-0.5 md:py-1 border border-white/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm ${className}`}
      style={{ minWidth: 0 }}
    >
      <span
        className={`text-xs md:text-sm ${getStreakColor(streak)} mr-0.5 md:mr-1`}
        style={{ minWidth: '12px' }}
      >
        {getStreakIcon(streak)}
      </span>
      <div className="flex flex-col items-center">
        <span
          className="text-[10px] md:text-xs font-bold text-gray-800 dark:text-white"
          style={{ letterSpacing: '0.3px' }}
        >
          {displayStreak}{' '}
          <span className="text-[8px] md:text-[10px] font-normal text-gray-500 dark:text-gray-400">
            j
          </span>
        </span>
        {getStreakTitle(streak) && (
          <span
            className={`text-[6px] md:text-[8px] font-bold ${getStreakColor(streak)} uppercase tracking-wide leading-tight text-center`}
          >
            {getStreakTitle(streak)}
          </span>
        )}
      </div>
    </div>
  );
};

StreakCounter.propTypes = {
  streak: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default StreakCounter;
