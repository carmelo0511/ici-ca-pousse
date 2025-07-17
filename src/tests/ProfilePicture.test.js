import { render, screen, fireEvent } from '@testing-library/react';
import ProfilePicture from '../components/Profile/ProfilePicture';
import React from 'react';

describe('ProfilePicture', () => {
  const user = {
    displayName: 'Alice',
    selectedBadge: 'first_workout',
    badges: ['first_workout', 'streak_5']
  };

  it('affiche le badge sélectionné comme avatar', () => {
    render(<ProfilePicture user={user} useBadgeAsProfile={true} selectedBadge="first_workout" />);
    expect(screen.getByText(/🎯/)).toBeInTheDocument();
  });

  it('affiche un fallback si pas de badge sélectionné', () => {
    render(<ProfilePicture user={{ ...user, selectedBadge: null }} useBadgeAsProfile={true} />);
    expect(screen.getByTestId('profile-fallback')).toBeInTheDocument();
  });

  it('appelle onTeamClick si bouton équipe cliqué', () => {
    const onTeamClick = jest.fn();
    render(<ProfilePicture user={user} showTeamButton={true} onTeamClick={onTeamClick} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onTeamClick).toHaveBeenCalled();
  });
}); 