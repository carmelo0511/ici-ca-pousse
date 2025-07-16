import React, { useState } from 'react';
import { auth } from '../utils/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import GradientButton from './GradientButton';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login'); // 'login' ou 'register'
  const [loading, setLoading] = useState(false);

  // Vérifie l'état de connexion
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Bienvenue !</h2>
        <p className="mb-4 text-gray-700">Connecté en tant que <span className="font-semibold">{user.email}</span></p>
        <GradientButton onClick={handleSignOut} from="red-500" to="red-700">Se déconnecter</GradientButton>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center">
        {mode === 'register' ? "Créer un compte" : "Connexion"}
      </h2>
      <form onSubmit={handleAuth} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center font-medium focus:border-indigo-500 focus:outline-none transition-colors duration-200 shadow-sm"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center font-medium focus:border-indigo-500 focus:outline-none transition-colors duration-200 shadow-sm"
          required
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <GradientButton
          type="submit"
          from="indigo-500"
          to="purple-600"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Chargement...' : (mode === 'register' ? "S'inscrire" : "Se connecter")}
        </GradientButton>
      </form>
      <div className="mt-4 text-center">
        {mode === 'register' ? (
          <>
            <span className="text-gray-600">Déjà un compte ? </span>
            <button className="text-indigo-600 font-semibold hover:underline" onClick={() => setMode('login')}>Se connecter</button>
          </>
        ) : (
          <>
            <span className="text-gray-600">Pas encore de compte ? </span>
            <button className="text-indigo-600 font-semibold hover:underline" onClick={() => setMode('register')}>Créer un compte</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Auth; 