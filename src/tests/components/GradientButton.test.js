import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GradientButton from '../../components/GradientButton';

// Composant icône simple pour les tests
const TestIcon = ({ className }) => <span className={className}>🏋️</span>;

describe('Composant GradientButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devrait rendre un bouton avec le texte fourni', () => {
    render(
      <GradientButton 
        onClick={mockOnClick}
      >
        Test Button
      </GradientButton>
    );
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('devrait appeler onClick quand le bouton est cliqué', () => {
    render(
      <GradientButton 
        onClick={mockOnClick}
      >
        Test Button
      </GradientButton>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('devrait être désactivé quand disabled est true', () => {
    render(
      <GradientButton 
        onClick={mockOnClick}
        disabled={true}
      >
        Test Button
      </GradientButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('devrait ne pas appeler onClick quand désactivé', () => {
    render(
      <GradientButton 
        onClick={mockOnClick}
        disabled={true}
      >
        Test Button
      </GradientButton>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  test('devrait appliquer les classes CSS personnalisées', () => {
    render(
      <GradientButton 
        onClick={mockOnClick}
        className="custom-class"
      >
        Test Button
      </GradientButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  test('devrait avoir les classes CSS par défaut', () => {
    render(
      <GradientButton 
        onClick={mockOnClick}
      >
        Test Button
      </GradientButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary', 'ripple-effect', 'flex', 'items-center');
  });

  test('devrait gérer les props supplémentaires', () => {
    render(
      <GradientButton 
        onClick={mockOnClick}
        data-testid="custom-button"
        aria-label="Custom label"
      >
        Test Button
      </GradientButton>
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
  });

  test('devrait fonctionner sans onClick', () => {
    render(
      <GradientButton>
        Test Button
      </GradientButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    // Ne devrait pas planter quand on clique sans onClick
    fireEvent.click(button);
  });

  test('devrait afficher l\'icône si fournie', () => {
    render(
      <GradientButton 
        onClick={mockOnClick}
        icon={TestIcon}
      >
        Test Button
      </GradientButton>
    );
    
    expect(screen.getByText('🏋️')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  test('devrait gérer les différentes tailles', () => {
    const { rerender } = render(
      <GradientButton 
        size="sm"
      >
        Small Button
      </GradientButton>
    );
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('text-sm');
    
    rerender(
      <GradientButton 
        size="lg"
      >
        Large Button
      </GradientButton>
    );
    
    button = screen.getByRole('button');
    expect(button).toHaveClass('text-lg');
  });

  test('devrait gérer les variantes', () => {
    const { rerender } = render(
      <GradientButton 
        variant="primary"
      >
        Primary Button
      </GradientButton>
    );
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
    
    rerender(
      <GradientButton 
        variant="secondary"
      >
        Secondary Button
      </GradientButton>
    );
    
    button = screen.getByRole('button');
    expect(button).toHaveClass('btn-secondary');
  });

  test('devrait gérer les types de bouton', () => {
    render(
      <GradientButton 
        type="submit"
      >
        Submit Button
      </GradientButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  test('devrait passer les props à l\'icône', () => {
    render(
      <GradientButton 
        icon={TestIcon}
      >
        Test Button
      </GradientButton>
    );
    
    const icon = screen.getByText('🏋️');
    expect(icon).toHaveClass('h-5', 'w-5');
  });
}); 