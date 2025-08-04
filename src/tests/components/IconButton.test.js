import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IconButton from '../../components/IconButton';

// Composant icône simple pour les tests
const TestIcon = ({ className }) => <span className={className}>🏋️</span>;

describe('Composant IconButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devrait rendre un bouton avec l\'icône', () => {
    render(
      <IconButton 
        icon={TestIcon}
        onClick={mockOnClick}
      />
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('🏋️')).toBeInTheDocument();
  });

  test('devrait appeler onClick quand le bouton est cliqué', () => {
    render(
      <IconButton 
        icon={TestIcon}
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('devrait fonctionner sans onClick', () => {
    render(
      <IconButton 
        icon={TestIcon}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    // Ne devrait pas planter quand on clique sans onClick
    fireEvent.click(button);
  });

  test('devrait appliquer les classes CSS personnalisées', () => {
    render(
      <IconButton 
        icon={TestIcon}
        className="custom-class"
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  test('devrait avoir les classes CSS par défaut', () => {
    render(
      <IconButton 
        icon={TestIcon}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('p-2', 'rounded-lg', 'flex', 'items-center', 'justify-center');
  });

  test('devrait gérer les props supplémentaires', () => {
    render(
      <IconButton 
        icon={TestIcon}
        data-testid="custom-button"
        aria-label="Custom label"
      />
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
  });

  test('devrait afficher le titre', () => {
    render(
      <IconButton 
        icon={TestIcon}
        title="Bouton de test"
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Bouton de test');
  });

  test('devrait fonctionner sans icône', () => {
    render(
      <IconButton 
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.queryByText('🏋️')).not.toBeInTheDocument();
  });

  test('devrait passer les props à l\'icône', () => {
    render(
      <IconButton 
        icon={TestIcon}
      />
    );
    
    const icon = screen.getByText('🏋️');
    expect(icon).toHaveClass('h-5', 'w-5');
  });
}); 