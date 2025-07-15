import React, { useState } from 'react';
import { Dumbbell, LogIn, User, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const LoginScreen = ({
  isRegistering,
  loginForm,
  setLoginForm,
  registerForm,
  setRegisterForm,
  handleLogin,
  handleRegister,
  toggleRegistering,
  users,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      await handleLogin(e);
      setSuccess('Connexion réussie ! 🎉');
    } catch (err) {
      setError('Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Les mots de passe ne correspondent pas 🔒');
      return;
    }
    if (registerForm.username.length < 3) {
      setError("Le nom d'utilisateur doit contenir au moins 3 caractères ✏️");
      return;
    }
    if (registerForm.password.length < 4) {
      setError('Le mot de passe doit contenir au moins 4 caractères 🔐');
      return;
    }
    
    setIsLoading(true);
    try {
      await handleRegister(e);
      setSuccess('Compte créé avec succès ! 🎉');
    } catch (err) {
      setError('Erreur de création de compte.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRegistering = () => {
    setError('');
    setSuccess('');
    toggleRegistering();
  };

  const handleUserClick = (username) => {
    setLoginForm({ ...loginForm, username });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl inline-block mb-4 shadow-lg">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Ici Ca Pousse
          </h1>
          <p className="text-gray-600">Votre coach musculation personnel</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        {!isRegistering ? (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d&apos;utilisateur
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Entrez votre nom d'utilisateur"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Entrez votre mot de passe"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              <span>{isLoading ? 'Connexion...' : 'Se connecter'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d&apos;utilisateur
              </label>
              <input
                type="text"
                value={registerForm.username}
                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Choisissez un nom d'utilisateur"
                required
                minLength="3"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Créez un mot de passe"
                required
                minLength="4"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Confirmez votre mot de passe"
                required
                minLength="4"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span>{isLoading ? 'Création...' : 'Créer un compte'}</span>
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={handleToggleRegistering}
            disabled={isLoading}
            className="text-blue-500 hover:text-blue-600 text-sm transition-colors duration-200 disabled:opacity-50"
          >
            {isRegistering ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
          </button>
        </div>

        {users.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-3 font-medium">Comptes enregistrés ({users.length}) :</p>
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleUserClick(user.username)}
                  disabled={isLoading}
                  className="w-full text-left text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200 disabled:opacity-50"
                >
                  👤 {user.username}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;

