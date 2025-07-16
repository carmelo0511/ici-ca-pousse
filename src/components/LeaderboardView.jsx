import React, { useState } from 'react';
import Leaderboard from './Leaderboard';
import StatsComparison from './StatsComparison';
import { ArrowLeft } from 'lucide-react';

function LeaderboardView({ user }) {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      {!showComparison ? (
        <Leaderboard user={user} onShowComparison={() => setShowComparison(true)} />
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setShowComparison(false)}
            className="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au classement</span>
          </button>
          <StatsComparison user={user} />
        </div>
      )}
    </div>
  );
}

export default LeaderboardView; 