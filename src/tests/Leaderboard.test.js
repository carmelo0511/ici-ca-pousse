import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Leaderboard from '../components/Leaderboard/Leaderboard';
import React from 'react';

// Mock Firebase
jest.mock('../utils/firebase', () => ({
  db: {},
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn()
}));

// Mock useFriends
jest.mock('../hooks/useFriends', () => ({
  useFriends: () => ({
    friends: [
      { uid: '2', displayName: 'Alice', photoURL: 'alice.jpg', badges: ['first_workout'] },
      { uid: '3', displayName: 'Bob', photoURL: 'bob.jpg', badges: ['streak_5'] },
      { uid: '4', displayName: 'Charlie', photoURL: 'charlie.jpg', badges: ['level_10'] }
    ],
    loading: false
  })
}));

// Mock ProfilePicture
jest.mock('../components/Profile/ProfilePicture', () => {
  return function MockProfilePicture({ user, ...props }) {
    return <div data-testid={`avatar-${user.displayName}`} {...props}>{user.displayName}</div>;
  };
});

describe('Leaderboard', () => {
  const mockUser = { uid: '1', displayName: 'Test User' };

  beforeEach(() => {
    // Mock getDocs pour retourner des données valides
    const { getDocs } = require('../utils/firebase');
    getDocs.mockResolvedValue({
      docs: [
        { data: () => ({ workouts: 5, maxWeight: 100 }), id: '1' },
        { data: () => ({ workouts: 3, maxWeight: 80 }), id: '2' },
        { data: () => ({ workouts: 2, maxWeight: 60 }), id: '3' }
      ]
    });
  });

  it('affiche le titre et les sélecteurs', async () => {
    await act(async () => {
      render(<Leaderboard user={mockUser} onShowComparison={() => {}} onShowTeam={() => {}} />);
    });
    expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Période/i)).toBeInTheDocument();
    expect(screen.getByText(/Métrique/i)).toBeInTheDocument();
  });

  it('affiche les utilisateurs et leurs badges', async () => {
    await act(async () => {
      render(<Leaderboard user={mockUser} onShowComparison={() => {}} onShowTeam={() => {}} />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('avatar-Alice')).toBeInTheDocument();
      expect(screen.getByTestId('avatar-Bob')).toBeInTheDocument();
      expect(screen.getByTestId('avatar-Charlie')).toBeInTheDocument();
    });
  });

  it('affiche les médailles pour les 3 premiers', async () => {
    await act(async () => {
      render(<Leaderboard user={mockUser} onShowComparison={() => {}} onShowTeam={() => {}} />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('🥇')).toBeInTheDocument();
      expect(screen.getByText('🥈')).toBeInTheDocument();
      expect(screen.getByText('🥉')).toBeInTheDocument();
    });
  });

  it('appelle onShowComparison quand le bouton est cliqué', async () => {
    const onShowComparison = jest.fn();
    await act(async () => {
      render(<Leaderboard user={mockUser} onShowComparison={onShowComparison} onShowTeam={() => {}} />);
    });
    
    const button = screen.getByText(/Comparaison détaillée/i);
    fireEvent.click(button);
    expect(onShowComparison).toHaveBeenCalled();
  });
}); 