import React from 'react';
import { render, screen } from '@testing-library/react';
import Toast from '../../components/Toast';

describe('Toast', () => {

  test('should render toast when show is true', () => {
    render(<Toast show={true} message="Test message" />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('should not render toast when show is false', () => {
    render(<Toast show={false} message="Test message" />);
    
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  test('should render with success type by default', () => {
    render(<Toast show={true} message="Success message" />);
    
    const toast = screen.getByRole('status');
    expect(toast).toHaveClass('badge-success');
    expect(toast).not.toHaveClass('badge-danger');
  });

  test('should render with success type when explicitly set', () => {
    render(<Toast show={true} message="Success message" type="success" />);
    
    const toast = screen.getByRole('status');
    expect(toast).toHaveClass('badge-success');
    expect(toast).not.toHaveClass('badge-danger');
  });

  test('should render with error type when specified', () => {
    render(<Toast show={true} message="Error message" type="error" />);
    
    const toast = screen.getByRole('status');
    expect(toast).toHaveClass('badge-danger');
    expect(toast).not.toHaveClass('badge-success');
  });

  test('should apply custom className', () => {
    render(<Toast show={true} message="Test message" className="custom-class" />);
    
    const toast = screen.getByRole('status');
    expect(toast).toHaveClass('custom-class');
  });

  test('should have proper accessibility attributes', () => {
    render(<Toast show={true} message="Accessible message" />);
    
    const toast = screen.getByRole('status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  test('should apply base CSS classes', () => {
    render(<Toast show={true} message="Test message" />);
    
    const toast = screen.getByRole('status');
    expect(toast).toHaveClass('toast-notification');
    expect(toast).toHaveClass('font-semibold');
    expect(toast).toHaveClass('text-lg');
  });

  test('should pass through additional props', () => {
    render(<Toast show={true} message="Test message" data-testid="custom-toast" />);
    
    expect(screen.getByTestId('custom-toast')).toBeInTheDocument();
  });

  test('should handle empty message', () => {
    render(<Toast show={true} message="" />);
    
    const toast = screen.getByRole('status');
    expect(toast).toBeInTheDocument();
    expect(toast.textContent).toBe('');
  });

  test('should render message inside span element', () => {
    render(<Toast show={true} message="Span test" />);
    
    const span = screen.getByText('Span test');
    expect(span.tagName).toBe('SPAN');
  });
});