// src/utils/api.js - Utilitaire pour les appels API d'authentification

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
    
    if (!res.ok) {
      const error = (data && data.error) || 'Erreur serveur';
      throw new Error(error);
    }
    
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Impossible de se connecter au serveur d\'authentification');
    }
    throw error;
  }
}

export const AuthAPI = {
  // Connexion utilisateur
  login: (credentials) => apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  // Inscription utilisateur
  register: (userData) => apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // Validation du token
  validate: (token) => apiRequest('/validate', {
    headers: { 'Authorization': `Bearer ${token}` },
  }),
  
  // Liste des utilisateurs
  users: () => apiRequest('/users'),
}; 