import { render, screen } from '@testing-library/react';
import StreakCounter from '../components/StreakCounter';
import React from 'react';

describe('StreakCounter', () => {
  it('affiche le streak actuel', () => {
    render(<StreakCounter streak={7} />);
    expect(screen.getByText(/7/i)).toBeInTheDocument();
    expect(screen.getByText(/🔥/i)).toBeInTheDocument();
  });

  it('affiche 0 si streak non défini', () => {
    render(<StreakCounter />);
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it('affiche le bon texte pour un streak de 1', () => {
    render(<StreakCounter streak={1} />);
    expect(screen.getByText(/1/)).toBeInTheDocument();
  });

  it('ajoute la classe danimation quand le streak change', () => {
    const { rerender, container } = render(<StreakCounter streak={1} />);
    rerender(<StreakCounter streak={2} />);
    expect(container.querySelector('.animate-bounce, .animate-pop')).toBeTruthy();
  });
}); 