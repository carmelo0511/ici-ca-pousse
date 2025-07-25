import React, { useState } from 'react';
import Leaderboard from './Leaderboard';
import StatsComparison from '../Workout/StatsComparison';
import { ArrowLeft } from 'lucide-react';
import { useFriends } from '../../hooks/useFriends';

function LeaderboardView({ user }) {
  const [showComparison, setShowComparison] = useState(false);
  // Récupère friends et sendInvite pour le leaderboard
  const { friends, sendInvite } = useFriends(user);

  return (
    <div className="max-w-4xl mx-auto">
      {!showComparison ? (
        <Leaderboard user={user} onShowComparison={() => setShowComparison(true)} friends={friends} sendInvite={sendInvite} />
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