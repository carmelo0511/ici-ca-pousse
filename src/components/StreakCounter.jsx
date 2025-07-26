import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import PropTypes from 'prop-types';

function getStreakMessage(streak) {
  if (streak >= 100) return '🔥 LÉGENDAIRE !';
  if (streak >= 50) return '🔥 MYTHIQUE !';
  if (streak >= 30) return '🔥 INCROYABLE !';
  if (streak >= 21) return '🔥 HABITUDE !';
  if (streak >= 14) return '🔥 RÉGULIER !';
  if (streak >= 7) return '🔥 EN FEU !';
  if (streak >= 3) return '🔥 CONTINUE !';
  if (streak > 0) return '🔥 COMMENCE !';
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
    <div className={`flex items-center space-x-2 bg-gradient-to-r from-white/80 to-white/60 rounded-xl px-3 py-2 border border-gray-200 shadow-lg backdrop-blur-sm ${className}`} style={{ minWidth: 0 }}>
      <span className={`text-lg ${getStreakColor(streak)} mr-1`} style={{ minWidth: 20 }}>{getStreakIcon(streak)}</span>
      <span className="text-base font-bold text-gray-800" style={{ letterSpacing: 0.5 }}>
        {displayStreak} <span className="text-xs font-normal text-gray-500">jours</span>
      </span>
      {getStreakMessage(streak) && (
        <span className={`ml-2 text-xs font-semibold ${getStreakColor(streak)}`} style={{ whiteSpace: 'nowrap' }}>
          {getStreakMessage(streak)}
        </span>
      )}
    </div>
  );
};

StreakCounter.propTypes = {
  streak: PropTypes.number.isRequired,
  className: PropTypes.string
};

export default StreakCounter; 