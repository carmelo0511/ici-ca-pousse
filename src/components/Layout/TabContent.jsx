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
  PageTransition,
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
      <PageTransition isActive={activeTab === 'workout'}>
        <WorkoutList {...workoutProps} />
      </PageTransition>

      {/* Onglet Calendrier */}
      <PageTransition isActive={activeTab === 'calendar'}>
        <CalendarView {...calendarProps} />
      </PageTransition>

      {/* Onglet Statistiques */}
      <PageTransition isActive={activeTab === 'stats'}>
        <StatsView {...statsProps} />
      </PageTransition>

      {/* Onglet Templates */}
      <PageTransition isActive={activeTab === 'templates'}>
        <WorkoutTemplates {...templateProps} />
      </PageTransition>

      {/* Onglet Classement */}
      <PageTransition isActive={activeTab === 'leaderboard'}>
        <LeaderboardView {...leaderboardProps} />
      </PageTransition>

      {/* Onglet Défis */}
      <PageTransition isActive={activeTab === 'challenges'}>
        <Challenges {...challengeProps} />
      </PageTransition>

      {/* Onglet Badges */}
      <PageTransition isActive={activeTab === 'badges'}>
        <BadgesPage {...badgeProps} />
      </PageTransition>

      {/* Onglet Profil */}
      <PageTransition isActive={activeTab === 'profile'}>
        <ProfilePage {...profileProps} />
      </PageTransition>
    </div>
  );
};

export default TabContent;