import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock de Firebase Auth
const mockSignInWithPopup = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();

// Mock de Firebase
jest.mock('../../utils/firebase/index.js', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
  },
  googleProvider: {},
}));

// Mock de firebase/auth
jest.mock('firebase/auth', () => ({
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

// Mock de firebase/firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

import Auth from '../../components/Auth';
import { auth } from '../../utils/firebase/index.js';
import { signInWithPopup, signOut } from 'firebase/auth';

describe('Composant Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock par défaut pour onAuthStateChanged
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(null); // Utilisateur non connecté par défaut
      return jest.fn(); // unsubscribe function
    });
  });

  test('devrait afficher le formulaire de connexion', () => {
    render(<Auth />);
    
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });

  test('devrait afficher le bouton Google', () => {
    render(<Auth />);
    
    expect(screen.getByText('Continuer avec Google')).toBeInTheDocument();
  });

  test('devrait afficher le lien d\'inscription', () => {
    render(<Auth />);
    
    expect(screen.getByText("Pas de compte ? S'inscrire")).toBeInTheDocument();
  });

  test('devrait basculer entre connexion et inscription', () => {
    render(<Auth />);
    
    // Cliquer sur le lien d'inscription
    const signUpLink = screen.getByText("Pas de compte ? S'inscrire");
    fireEvent.click(signUpLink);
    
    // Devrait afficher le formulaire d'inscription
    expect(screen.getByText('Inscription')).toBeInTheDocument();
    expect(screen.getByLabelText('Pseudo')).toBeInTheDocument();
  });

  test('devrait gérer la soumission du formulaire de connexion', async () => {
    render(<Auth />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    const submitButton = screen.getByText('Se connecter');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Le formulaire devrait être soumis
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('devrait gérer la connexion Google', async () => {
    render(<Auth />);
    
    const googleButton = screen.getByText('Continuer avec Google');
    fireEvent.click(googleButton);
    
    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
    });
  });

  test('devrait afficher l\'utilisateur connecté', () => {
    // Mock un utilisateur connecté
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback({
        uid: '123',
        displayName: 'Test User',
        email: 'test@example.com'
      });
      return jest.fn();
    });
    
    render(<Auth />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    // L'email n'est pas affiché car le displayName est prioritaire
  });

  test('devrait afficher le bouton de déconnexion pour un utilisateur connecté', () => {
    // Mock un utilisateur connecté
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback({
        uid: '123',
        displayName: 'Test User',
        email: 'test@example.com'
      });
      return jest.fn();
    });
    
    render(<Auth />);
    
    const logoutButton = screen.getByText('Se déconnecter');
    expect(logoutButton).toBeInTheDocument();
  });

  test('devrait appeler signOut quand le bouton de déconnexion est cliqué', async () => {
    // Mock un utilisateur connecté
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback({
        uid: '123',
        displayName: 'Test User',
        email: 'test@example.com'
      });
      return jest.fn();
    });
    
    render(<Auth />);
    
    const logoutButton = screen.getByText('Se déconnecter');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
  });

  test('devrait gérer les erreurs de connexion', async () => {
    signInWithPopup.mockRejectedValueOnce(new Error('Erreur de connexion'));
    
    render(<Auth />);
    
    const googleButton = screen.getByText('Continuer avec Google');
    fireEvent.click(googleButton);
    
    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
    });
  });

  test('devrait avoir les bonnes classes CSS', () => {
    render(<Auth />);
    
    const container = screen.getByText('Connexion').closest('div');
    expect(container).toHaveClass('max-w-lg', 'mx-auto', 'mt-10', 'card');
  });

  test('devrait valider les champs requis', () => {
    render(<Auth />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });

  test('devrait avoir les bons types d\'input', () => {
    render(<Auth />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
}); 