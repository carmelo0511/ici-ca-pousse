import React from 'react';
import {
  WorkoutList,
  CalendarView,
  StatsView,
  WorkoutTemplates,
  LeaderboardView,
  Challenges,
  BadgesPage,
  ProfilePage,
} from '../index';

const TabContent = ({ 
  activeTab, 
  workoutProps,
  calendarProps,
  statsProps,
  templateProps,
  leaderboardProps,
  challengeProps,
  badgeProps,
  profileProps,
}) => {
  return (
    <div className="relative">
      {/* Onglet Séance */}
      {activeTab === 'workout' && (
        <div>
          <WorkoutList {...workoutProps} />
        </div>
      )}

      {/* Onglet Calendrier */}
      {activeTab === 'calendar' && (
        <div>
          <CalendarView {...calendarProps} />
        </div>
      )}

      {/* Onglet Statistiques */}
      {activeTab === 'stats' && (
        <div>
          <StatsView {...statsProps} />
        </div>
      )}

      {/* Onglet Templates */}
      {activeTab === 'templates' && (
        <div>
          <WorkoutTemplates {...templateProps} />
        </div>
      )}

      {/* Onglet Classement */}
      {activeTab === 'leaderboard' && (
        <div>
          <LeaderboardView {...leaderboardProps} />
        </div>
      )}

      {/* Onglet Défis */}
      {activeTab === 'challenges' && (
        <div>
          <Challenges {...challengeProps} />
        </div>
      )}

      {/* Onglet Badges */}
      {activeTab === 'badges' && (
        <div>
          <BadgesPage {...badgeProps} />
        </div>
      )}

      {/* Onglet Profil */}
      {activeTab === 'profile' && (
        <div>
          <ProfilePage {...profileProps} />
        </div>
      )}
    </div>
  );
};

export default TabContent;