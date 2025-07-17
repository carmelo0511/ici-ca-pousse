import { render, screen, fireEvent } from '@testing-library/react';
import ProfilePicture from '../components/Profile/ProfilePicture.jsx';

describe('ProfilePicture', () => {
  const user = {
    uid: '123',
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: 'https://example.com/photo.jpg',
    selectedBadge: 'first_workout'
  };

  it('affiche le badge sélectionné comme avatar', () => {
    render(<ProfilePicture user={user} useBadgeAsProfile={true} selectedBadge="first_workout" />);
    expect(screen.getByText(/🎯/)).toBeInTheDocument();
  });

  it('affiche un fallback si pas de badge sélectionné', () => {
    render(<ProfilePicture user={{ ...user, selectedBadge: null }} useBadgeAsProfile={true} />);
    expect(screen.getByText(/🏆/)).toBeInTheDocument();
  });

  it('appelle onTeamClick si bouton équipe cliqué', () => {
    const mockOnTeamClick = jest.fn();
    render(<ProfilePicture user={user} showTeamButton={true} onTeamClick={mockOnTeamClick} />);
    
    const teamButton = screen.getByTitle('Voir l\'équipe');
    fireEvent.click(teamButton);
    
    expect(mockOnTeamClick).toHaveBeenCalled();
  });

  it('affiche la photo de profil si disponible', () => {
    render(<ProfilePicture user={user} />);
    const img = screen.getByAltText('Test User');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('affiche l\'icône utilisateur si pas de photo', () => {
    render(<ProfilePicture user={{ ...user, photoURL: null }} />);
    // Vérifier que l'icône User est présente (lucide-react)
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
}); 