import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import PropTypes from 'prop-types';

const COLORS = [
  'from-yellow-400 to-orange-500', // 1-6
  'from-orange-500 to-red-500',    // 7-29
  'from-red-500 to-yellow-500',    // 30-99
  'from-pink-500 to-purple-500'    // 100+
];

function getStreakColor(streak) {
  if (streak >= 100) return COLORS[3];
  if (streak >= 30) return COLORS[2];
  if (streak >= 7) return COLORS[1];
  return COLORS[0];
}

function getStreakMessage(streak) {
  if (streak >= 100) return '🔥 LÉGENDAIRE !';
  if (streak >= 30) return '🔥 INCROYABLE !';
  if (streak >= 7) return '🔥 EN FEU !';
  if (streak >= 3) return '🔥 CONTINUE !';
  if (streak > 0) return '🔥 COMMENCE !';
  return '';
}

const StreakCounter = ({ streak, className = '' }) => {
  const [displayStreak, setDisplayStreak] = useState(streak);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (streak > displayStreak) {
      setIsAnimating(true);
      let current = displayStreak;
      const timer = setInterval(() => {
        current++;
        setDisplayStreak(current);
        if (current >= streak) {
          clearInterval(timer);
          setIsAnimating(false);
        }
      }, 40);
      return () => clearInterval(timer);
    } else {
      setDisplayStreak(streak);
      setIsAnimating(false);
    }
  }, [streak]);

  return (
    <div className={`flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-orange-200 shadow ${className}`}>
      <div className={`relative ${isAnimating ? 'animate-pulse' : ''}`}>
        <Flame className={`h-7 w-7`} style={{ color: streak >= 7 ? '#f97316' : streak >= 3 ? '#eab308' : '#6b7280' }} />
        {isAnimating && (
          <div className="absolute inset-0 bg-orange-400 rounded-full blur-sm animate-ping" />
        )}
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline space-x-1">
          <span className={`text-2xl font-bold bg-gradient-to-r ${getStreakColor(streak)} bg-clip-text text-transparent`}>
            {displayStreak}
          </span>
          <span className="text-sm text-gray-600 font-medium">jours</span>
        </div>
        <span className="text-xs font-semibold text-orange-700">
          {getStreakMessage(streak)}
        </span>
      </div>
    </div>
  );
};

StreakCounter.propTypes = {
  streak: PropTypes.number.isRequired,
  className: PropTypes.string
};

export default StreakCounter; 