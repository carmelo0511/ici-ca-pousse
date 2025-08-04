import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StreakCounter from '../../components/StreakCounter';

describe('Composant StreakCounter', () => {
  test('devrait afficher le streak avec l\'icône et le titre', () => {
    render(<StreakCounter streak={5} />);
    
    // Vérifier que le streak est affiché
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Vérifier que l'icône est présente
    expect(screen.getByText('🔥')).toBeInTheDocument();
    
    // Vérifier que le titre est affiché
    expect(screen.getByText('MOMENTUM')).toBeInTheDocument();
  });

  test('devrait afficher le streak avec la lettre "j"', () => {
    render(<StreakCounter streak={3} />);
    
    // Vérifier que la lettre "j" est présente
    expect(screen.getByText('j')).toBeInTheDocument();
  });

  test('devrait afficher différents titres selon le streak', () => {
    const { rerender } = render(<StreakCounter streak={1} />);
    expect(screen.getByText('DÉBUTANT MOTIVÉ')).toBeInTheDocument();
    
    rerender(<StreakCounter streak={7} />);
    expect(screen.getByText('FEU SACRÉ')).toBeInTheDocument();
    
    rerender(<StreakCounter streak={21} />);
    expect(screen.getByText('HABITUDE DE CHAMPION')).toBeInTheDocument();
  });

  test('devrait afficher différents icônes selon le streak', () => {
    const { rerender } = render(<StreakCounter streak={1} />);
    expect(screen.getByText('🔥')).toBeInTheDocument();
    
    rerender(<StreakCounter streak={30} />);
    expect(screen.getByText('🌟')).toBeInTheDocument();
    
    rerender(<StreakCounter streak={50} />);
    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  test('devrait gérer un streak de 0', () => {
    render(<StreakCounter streak={0} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('j')).toBeInTheDocument();
    // Pas de titre pour un streak de 0
    expect(screen.queryByText('DÉBUTANT MOTIVÉ')).not.toBeInTheDocument();
  });

  test('devrait gérer un streak très élevé', () => {
    render(<StreakCounter streak={100} />);
    
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('LÉGENDE DU FITNESS')).toBeInTheDocument();
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  test('devrait appliquer les classes CSS personnalisées', () => {
    render(<StreakCounter streak={5} className="custom-class" />);
    
    const container = screen.getByText('5').closest('div').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  test('devrait avoir les classes CSS de base', () => {
    render(<StreakCounter streak={5} />);
    
    const container = screen.getByText('5').closest('div').parentElement;
    expect(container).toHaveClass('flex', 'items-center', 'space-x-1', 'bg-white/90');
  });

  test('devrait gérer les valeurs négatives', () => {
    render(<StreakCounter streak={-1} />);
    
    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  test('devrait animer le streak quand il augmente', () => {
    const { rerender } = render(<StreakCounter streak={3} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    
    rerender(<StreakCounter streak={5} />);
    // Attendre que l'animation se termine
    setTimeout(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    }, 100);
  });
}); 