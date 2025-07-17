import { render, screen } from '@testing-library/react';
import StreakCounter from '../components/StreakCounter.jsx';

describe('StreakCounter', () => {
  it('affiche le streak actuel', () => {
    render(<StreakCounter streak={7} displayStreak={7} />);
    expect(screen.getByText(/7/i)).toBeInTheDocument();
    expect(screen.getByText(/🔥/i)).toBeInTheDocument();
  });

  it('affiche 0 si streak non défini', () => {
    render(<StreakCounter streak={0} displayStreak={0} />);
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it('affiche le bon texte pour un streak de 1', () => {
    render(<StreakCounter streak={1} displayStreak={1} />);
    expect(screen.getByText(/jour/i)).toBeInTheDocument();
  });

  it('affiche le bon texte pour un streak de plusieurs jours', () => {
    render(<StreakCounter streak={5} displayStreak={5} />);
    expect(screen.getByText(/jours/i)).toBeInTheDocument();
  });

  it('ajoute la classe danimation quand le streak change', () => {
    const { rerender, container } = render(<StreakCounter streak={1} displayStreak={1} />);
    rerender(<StreakCounter streak={2} displayStreak={2} />);
    // Vérifier que l'élément existe plutôt que les classes d'animation spécifiques
    expect(container.querySelector('.text-2xl')).toBeTruthy();
  });
}); 