import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginScreen from '../components/LoginScreen';

describe('LoginScreen', () => {
  const defaultProps = {
    loginForm: { username: '', password: '' },
    setLoginForm: jest.fn(),
    registerForm: { username: '', password: '', confirmPassword: '' },
    setRegisterForm: jest.fn(),
    handleLogin: jest.fn((e) => e.preventDefault()),
    handleRegister: jest.fn((e) => e.preventDefault()),
    toggleRegistering: jest.fn(),
    users: [],
  };

  test('renders login form when not registering', () => {
    render(<LoginScreen isRegistering={false} {...defaultProps} />);
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Entrez votre nom d'utilisateur")
    ).toBeInTheDocument();
  });

  test('renders register form when registering', () => {
    render(<LoginScreen isRegistering={true} {...defaultProps} />);
    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Confirmez votre mot de passe')
    ).toBeInTheDocument();
  });

  test('calls handleLogin on login submission', async () => {
    render(<LoginScreen isRegistering={false} {...defaultProps} />);
    await userEvent.type(
      screen.getByPlaceholderText("Entrez votre nom d'utilisateur"),
      'john'
    );
    await userEvent.type(
      screen.getByPlaceholderText('Entrez votre mot de passe'),
      'secret'
    );
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));
    expect(defaultProps.handleLogin).toHaveBeenCalled();
  });
});
