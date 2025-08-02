import React, { useState } from 'react';
import Leaderboard from './Leaderboard';
import StatsComparison from '../Workout/StatsComparison';
import FriendsList from '../Profile/FriendsList';
import FriendProfile from '../Profile/FriendProfile';
import { ArrowLeft, Trophy, Users } from 'lucide-react';
import { useFriends } from '../../hooks/useFriends';

function LeaderboardView({ user, showToastMsg, setActiveTab: setMainActiveTab, setExercisesFromWorkout }) {
  const [showComparison, setShowComparison] = useState(false);
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard', 'friends', 'friendProfile'
  const [selectedFriend, setSelectedFriend] = useState(null);
  
  // Récupère friends et sendInvite pour le leaderboard
  const { friends, sendInvite } = useFriends(user);

  const handleShowFriendProfile = (friend) => {
    setSelectedFriend(friend);
    setActiveTab('friendProfile');
  };

  const handleBackToFriends = () => {
    setSelectedFriend(null);
    setActiveTab('friends');
  };

  const handleBackToMain = () => {
    setSelectedFriend(null);
    setActiveTab('leaderboard');
  };

  // Si on affiche le profil d'un ami
  if (activeTab === 'friendProfile' && selectedFriend) {
    return (
      <FriendProfile 
        friend={selectedFriend} 
        onBack={handleBackToFriends}
        showToastMsg={showToastMsg}
        setActiveTab={setMainActiveTab}
        setExercisesFromWorkout={setExercisesFromWorkout}
      />
    );
  }

  // Si on affiche la comparaison de stats
  if (showComparison) {
    return (
      <div className="max-w-4xl mx-auto">
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
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Onglets principaux */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'leaderboard'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>Classement</span>
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'friends'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Mes Amis</span>
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'leaderboard' && (
        <Leaderboard
          user={user}
          onShowComparison={() => setShowComparison(true)}
          friends={friends}
          sendInvite={sendInvite}
          onShowFriendProfile={handleShowFriendProfile}
        />
      )}

      {activeTab === 'friends' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Mes Amis</h2>
            <button
              onClick={handleBackToMain}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Retour au classement</span>
            </button>
          </div>
          <FriendsList 
            user={user} 
            showToastMsg={showToastMsg}
            onShowFriendProfile={handleShowFriendProfile}
          />
        </div>
      )}
    </div>
  );
}

export default LeaderboardView;
