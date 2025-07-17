import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import PropTypes from 'prop-types';

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
    <div className={`flex items-center space-x-2 bg-white/70 rounded-lg px-2 py-1 border border-gray-100 shadow-sm ${className}`} style={{ minWidth: 0 }}>
      <Flame className="h-5 w-5 text-orange-300 mr-1" style={{ minWidth: 20 }} />
      <span className="text-base font-semibold text-gray-700" style={{ letterSpacing: 0.5 }}>{displayStreak} <span className="text-xs font-normal text-gray-400">jours</span></span>
      {getStreakMessage(streak) && (
        <span className="ml-2 text-xs text-orange-400 font-medium" style={{ whiteSpace: 'nowrap' }}>{getStreakMessage(streak)}</span>
      )}
    </div>
  );
};

StreakCounter.propTypes = {
  streak: PropTypes.number.isRequired,
  className: PropTypes.string
};

export default StreakCounter; 