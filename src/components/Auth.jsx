import React, { useState } from 'react';
import { auth, googleProvider } from '../utils/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import GradientButton from './GradientButton';
import PropTypes from 'prop-types';

function Auth({ className = '' }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Vérifie l'état de connexion
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

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

  if (user) {
    return (
      <div className={`max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg flex flex-col items-center ${className}`}>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Bienvenue !</h2>
        <p className="mb-4 text-gray-700">Connecté en tant que <span className="font-semibold">{user.email || user.displayName}</span></p>
        <GradientButton onClick={handleSignOut} from="red-500" to="red-700" ariaLabel="Se déconnecter">Se déconnecter</GradientButton>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg ${className}`}>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center">
        Connexion
      </h2>
      {error && <div className="text-red-500 text-sm text-center mb-4" role="alert">{error}</div>}
      <GradientButton
        type="button"
        from="yellow-400"
        to="orange-500"
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        ariaLabel="Connexion Google"
      >
        {googleLoading ? 'Connexion...' : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true"><g><path d="M44.5 20H24v8.5h11.7C34.7 33.4 29.8 36 24 36c-6.6 0-12.2-4.2-14.3-10H4.2C6.6 34.1 14.6 40 24 40c9.4 0 17.3-6.2 19.7-15h.1c.2-.7.3-1.3.3-2s-.1-1.3-.3-2z" fill="#4285F4"/><path d="M6.3 14.6l6.6 4.8C14.5 16.1 18.9 13 24 13c3.1 0 6 .9 8.3 2.6l6.2-6.2C34.9 5.5 29.7 3.5 24 3.5c-7.7 0-14.4 4.4-17.7 10.9z" fill="#34A853"/><path d="M24 44c5.5 0 10.5-1.8 14.4-4.9l-6.7-5.5C29.9 35.7 27.1 36.5 24 36.5c-5.8 0-10.7-2.6-13.8-6.6l-6.6 5.1C9.6 41.2 16.3 44 24 44z" fill="#FBBC05"/><path d="M44.5 20H24v8.5h11.7C34.7 33.4 29.8 36 24 36c-6.6 0-12.2-4.2-14.3-10H4.2C6.6 34.1 14.6 40 24 40c9.4 0 17.3-6.2 19.7-15h.1c.2-.7.3-1.3.3-2s-.1-1.3-.3-2z" fill="none"/></g></svg>
            <span>Continuer avec Google</span>
          </>
        )}
      </GradientButton>
    </div>
  );
}

Auth.propTypes = {
  className: PropTypes.string,
};

export default Auth; 