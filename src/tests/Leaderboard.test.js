import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Leaderboard from '../components/Leaderboard/Leaderboard.jsx';

// Mock Firebase
jest.mock('../utils/firebase', () => ({
  db: {},
  collection: jest.fn(),
  query: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn()
}));

// Mock useFriends hook
jest.mock('../hooks/useFriends', () => ({
  useFriends: () => ({
    friends: [
      { uid: 'friend1', displayName: 'Friend 1', email: 'friend1@example.com' },
      { uid: 'friend2', displayName: 'Friend 2', email: 'friend2@example.com' }
    ],
    loading: false
  })
}));

// Mock ProfilePicture component
jest.mock('../components/Profile/ProfilePicture.jsx', () => {
  return function MockProfilePicture({ user, useBadgeAsProfile, selectedBadge }) {
    return (
      <div data-testid={`avatar-${user.displayName}`}>
        {useBadgeAsProfile && selectedBadge ? '🎯' : '👤'}
      </div>
    );
  };
});

describe('Leaderboard', () => {
  const mockCurrentUser = {
    uid: 'current-user',
    displayName: 'Current User',
    email: 'current@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le titre et les sélecteurs', async () => {
    await act(async () => {
      render(<Leaderboard user={mockCurrentUser} onShowComparison={() => {}} onShowTeam={() => {}} />);
    });
    expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
  });

  it('appelle onShowComparison quand le bouton est cliqué', async () => {
    const mockOnShowComparison = jest.fn();
    
    await act(async () => {
      render(<Leaderboard user={mockCurrentUser} onShowComparison={mockOnShowComparison} onShowTeam={() => {}} />);
    });
    
    const comparisonButton = screen.getByText(/Comparaison détaillée/i);
    comparisonButton.click();
    
    expect(mockOnShowComparison).toHaveBeenCalled();
  });
}); 