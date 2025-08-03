import React, { useState } from 'react';
import { auth, googleProvider } from '../utils/firebase/index.js';
import { 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import GradientButton from './GradientButton';
import PropTypes from 'prop-types';

function Auth({ className = '' }) {
  const [user, setUser] = useState(null);
  const [userPseudo, setUserPseudo] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Vérifie l'état de connexion et récupère le pseudo
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        // Essayer de récupérer le pseudo depuis Firestore
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('../utils/firebase/index.js');
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Données utilisateur dans Firestore:', userData);
            const pseudo = userData.pseudo || userData.nickname || userData.displayName || u.displayName;
            setUserPseudo(pseudo);
            console.log('Pseudo récupéré:', pseudo);
          } else {
            setUserPseudo(u.displayName);
            console.log('Pseudo depuis displayName:', u.displayName);
          }
        } catch (error) {
          console.log('Erreur lors de la récupération du pseudo:', error);
          setUserPseudo(u.displayName);
        }
      } else {
        setUserPseudo('');
      }
    });
    return unsubscribe;
  }, []);

  // Force la récupération du pseudo quand l'utilisateur change
  React.useEffect(() => {
    if (user && !userPseudo) {
      const fetchPseudo = async () => {
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('../utils/firebase/index.js');
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const pseudo = userData.pseudo || userData.displayName || user.displayName;
            console.log('Pseudo forcé récupéré:', pseudo);
            setUserPseudo(pseudo);
          }
        } catch (error) {
          console.log('Erreur lors de la récupération forcée du pseudo:', error);
        }
      };
      fetchPseudo();
    }
  }, [user, userPseudo]);

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setEmailLoading(true);
    
    try {
      if (isSignUp) {
        // Vérifier que le pseudo est fourni
        if (!pseudo.trim()) {
          throw new Error('Le pseudo est requis');
        }
        
        console.log('Tentative d\'inscription avec:', { email, pseudo });
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        console.log('Compte créé avec succès, UID:', userCredential.user.uid);
        
        // Sauvegarder d'abord dans Firestore
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../utils/firebase/index.js');
        
        const userData = {
          pseudo: pseudo,
          email: email,
          createdAt: new Date(),
          displayName: pseudo,
          nickname: pseudo
        };
        
        console.log('Sauvegarde des données utilisateur:', userData);
        
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        
        console.log('Données sauvegardées dans Firestore');
        
        // Mettre à jour le profil utilisateur avec le pseudo
        await userCredential.user.updateProfile({
          displayName: pseudo
        });
        
        console.log('Profil utilisateur mis à jour');
        
        // Mettre à jour l'état local du pseudo
        setUserPseudo(pseudo);
        
        console.log('Pseudo mis à jour dans l\'état local:', pseudo);
        
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error('Erreur lors de l\'authentification:', err);
      setError(err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  if (user) {
    return (
      <div
        className={`max-w-md mx-auto mt-10 card flex flex-col items-center ${className}`}
      >
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          Bienvenue !
        </h2>
        <p className="mb-4 text-gray-700">
          Connecté en tant que{' '}
          <span className="font-semibold">
            {userPseudo || user.displayName || user.email}
          </span>
        </p>
        <GradientButton
          onClick={handleSignOut}
          from="blue-500"
          to="blue-600"
          ariaLabel="Se déconnecter"
        >
          Se déconnecter
        </GradientButton>
      </div>
    );
  }

  return (
    <div
      className={`max-w-lg mx-auto mt-10 card ${className}`}
    >
      <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent text-center">
        {isSignUp ? 'Inscription' : 'Connexion'}
      </h2>
      
      {error && (
        <div className="text-red-500 text-sm text-center mb-4 p-3 bg-red-50 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {/* Formulaire Email/Mot de passe */}
      <form onSubmit={handleEmailAuth} className="mb-6">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input w-full"
            placeholder="votre@email.com"
            required
          />
        </div>
        
        {isSignUp && (
          <div className="mb-4">
            <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700 mb-2">
              Pseudo
            </label>
            <input
              type="text"
              id="pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="input w-full"
              placeholder="Votre pseudo"
              required={isSignUp}
              minLength={2}
              maxLength={20}
            />
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input w-full"
            placeholder="Votre mot de passe"
            required
            minLength={6}
          />
        </div>

        <GradientButton
          type="submit"
          from="blue-500"
          to="blue-600"
          className="w-full mb-4"
          disabled={emailLoading}
          ariaLabel={isSignUp ? "S'inscrire" : "Se connecter"}
        >
          {emailLoading ? (
            'Chargement...'
          ) : (
            isSignUp ? "S'inscrire" : "Se connecter"
          )}
        </GradientButton>
      </form>

      {/* Séparateur */}
      <div className="flex items-center mb-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-sm text-gray-500">ou</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Bouton Google */}
      <GradientButton
        type="button"
        from="blue-500"
        to="blue-600"
        className="w-full flex items-center justify-center gap-2 mb-4"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        ariaLabel="Connexion Google"
      >
        {googleLoading ? (
          'Connexion...'
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
              <g>
                <path
                  d="M44.5 20H24v8.5h11.7C34.7 33.4 29.8 36 24 36c-6.6 0-12.2-4.2-14.3-10H4.2C6.6 34.1 14.6 40 24 40c9.4 0 17.3-6.2 19.7-15h.1c.2-.7.3-1.3.3-2s-.1-1.3-.3-2z"
                  fill="#4285F4"
                />
                <path
                  d="M6.3 14.6l6.6 4.8C14.5 16.1 18.9 13 24 13c3.1 0 6 .9 8.3 2.6l6.2-6.2C34.9 5.5 29.7 3.5 24 3.5c-7.7 0-14.4 4.4-17.7 10.9z"
                  fill="#34A853"
                />
                <path
                  d="M24 44c5.5 0 10.5-1.8 14.4-4.9l-6.7-5.5C29.9 35.7 27.1 36.5 24 36.5c-5.8 0-10.7-2.6-13.8-6.6l-6.6 5.1C9.6 41.2 16.3 44 24 44z"
                  fill="#FBBC05"
                />
                <path
                  d="M44.5 20H24v8.5h11.7C34.7 33.4 29.8 36 24 36c-6.6 0-12.2-4.2-14.3-10H4.2C6.6 34.1 14.6 40 24 40c9.4 0 17.3-6.2 19.7-15h.1c.2-.7.3-1.3.3-2s-.1-1.3-.3-2z"
                  fill="none"
                />
              </g>
            </svg>
            <span>Continuer avec Google</span>
          </>
        )}
      </GradientButton>

      {/* Lien pour basculer entre connexion et inscription */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
            setEmail('');
            setPassword('');
          }}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {isSignUp 
            ? "Déjà un compte ? Se connecter" 
            : "Pas de compte ? S'inscrire"
          }
        </button>
      </div>
    </div>
  );
}

Auth.propTypes = {
  className: PropTypes.string,
};

export default Auth;
