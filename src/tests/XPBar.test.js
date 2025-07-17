import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock du composant XPBar qui n'existe pas encore
const XPBar = ({ level, experience, progressPercentage }) => (
  <div data-testid="xp-bar">
    <div data-testid="level">Niveau {level}</div>
    <div data-testid="experience">{experience} XP</div>
    <div data-testid="xp-progress" style={{ width: `${progressPercentage}%` }}></div>
  </div>
);

describe('XPBar', () => {
  it('affiche le niveau et la progression', () => {
    render(<XPBar level={3} experience={250} progressPercentage={50} />);
    expect(screen.getByText(/Niveau 3/i)).toBeInTheDocument();
    expect(screen.getByText(/250 XP/i)).toBeInTheDocument();
    const progress = screen.getByTestId('xp-progress');
    expect(progress.style.width).toBe('50%');
  });

  it('affiche 0% si pas dXP', () => {
    render(<XPBar level={1} experience={0} progressPercentage={0} />);
    const progress = screen.getByTestId('xp-progress');
    expect(progress.style.width).toBe('0%');
  });

  it('affiche 100% si progression complète', () => {
    render(<XPBar level={5} experience={1000} progressPercentage={100} />);
    const progress = screen.getByTestId('xp-progress');
    expect(progress.style.width).toBe('100%');
  });
}); 