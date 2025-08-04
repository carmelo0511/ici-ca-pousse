import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../../components/Card';

describe('Composant Card', () => {
  test('devrait rendre le contenu enfant', () => {
    render(
      <Card>
        <div>Contenu de la carte</div>
      </Card>
    );
    
    expect(screen.getByText('Contenu de la carte')).toBeInTheDocument();
  });

  test('devrait appliquer les classes CSS personnalisées', () => {
    render(
      <Card className="custom-card">
        <div>Test</div>
      </Card>
    );
    
    const card = screen.getByText('Test').closest('div').parentElement;
    expect(card).toHaveClass('custom-card');
  });

  test('devrait avoir les classes CSS par défaut', () => {
    render(
      <Card>
        <div>Test</div>
      </Card>
    );
    
    const card = screen.getByText('Test').closest('div').parentElement;
    expect(card).toHaveClass('card');
  });

  test('devrait être cliquable quand clickable est true', () => {
    render(
      <Card clickable={true}>
        <div>Test</div>
      </Card>
    );
    
    const card = screen.getByText('Test').closest('div').parentElement;
    expect(card).toHaveClass('ripple-effect');
    expect(card).toHaveAttribute('data-clickable', 'true');
  });

  test('devrait ne pas être cliquable par défaut', () => {
    render(
      <Card>
        <div>Test</div>
      </Card>
    );
    
    const card = screen.getByText('Test').closest('div').parentElement;
    expect(card).not.toHaveClass('ripple-effect');
    expect(card).not.toHaveAttribute('data-clickable');
  });

  test('devrait gérer les props supplémentaires', () => {
    render(
      <Card 
        data-testid="test-card"
        aria-label="Carte de test"
      >
        <div>Test</div>
      </Card>
    );
    
    const card = screen.getByTestId('test-card');
    expect(card).toHaveAttribute('aria-label', 'Carte de test');
  });

  test('devrait fonctionner avec des éléments complexes', () => {
    render(
      <Card>
        <h2>Titre</h2>
        <p>Description</p>
        <button>Action</button>
      </Card>
    );
    
    expect(screen.getByText('Titre')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  test('devrait gérer les événements de clic', () => {
    const handleClick = jest.fn();
    
    render(
      <Card onClick={handleClick}>
        <div>Test</div>
      </Card>
    );
    
    const card = screen.getByText('Test').closest('div').parentElement;
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('devrait fonctionner sans props optionnelles', () => {
    render(
      <Card>
        <div>Test simple</div>
      </Card>
    );
    
    expect(screen.getByText('Test simple')).toBeInTheDocument();
  });
});