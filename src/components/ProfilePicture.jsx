import React, { useState } from 'react';
import { Camera, User } from 'lucide-react';
import { BADGE_CONFIG } from './Badges';

// Composant pour afficher une photo de profil
function ProfilePicture({ 
  user, 
  size = 'md', 
  showBadges = false, 
  badges = [], 
  onClick = null,
  className = '',
  useBadgeAsProfile = false,
  selectedBadge = null
}) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const sizeClasses = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-24 h-24 text-2xl'
  };

  const badgeSizeMap = {
    xs: 'xs',
    sm: 'xs',
    md: 'sm',
    lg: 'sm',
    xl: 'md',
    '2xl': 'lg'
  };

  const hasProfilePicture = user?.photoURL && !imageError;
  const displayName = user?.displayName || user?.email || 'Utilisateur';
  
  // Vérifier si on utilise un badge comme photo de profil
  const badgeConfig = selectedBadge && BADGE_CONFIG[selectedBadge];

  const handleImageError = () => {
    console.warn('Erreur lors du chargement de la photo de profil:', user?.photoURL);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageStartLoad = () => {
    setIsLoading(true);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Photo de profil */}
      <div 
        className={`
          ${sizeClasses[size]} 
          ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
          rounded-full overflow-hidden border-2 border-gray-200 
          ${useBadgeAsProfile && badgeConfig ? badgeConfig.color.replace('text-', 'bg-').replace('border-', 'bg-') : 'bg-gradient-to-br from-indigo-100 to-purple-100'}
          flex items-center justify-center font-semibold text-gray-700
          ${isLoading ? 'animate-pulse' : ''}
        `}
        onClick={onClick}
      >
        {useBadgeAsProfile && badgeConfig ? (
          <div className="text-2xl">{badgeConfig.icon}</div>
        ) : hasProfilePicture ? (
          <>
            <img
              src={user.photoURL}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={handleImageError}
              onLoad={handleImageLoad}
              onLoadStart={handleImageStartLoad}
              crossOrigin="anonymous"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full"></div>
            )}
          </>
        ) : (
          <User className={`${size === 'xs' ? 'w-4 h-4' : size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : size === 'xl' ? 'w-10 h-10' : 'w-12 h-12'} text-gray-500`} />
        )}
      </div>

      {/* Badges */}
      {showBadges && badges && badges.length > 0 && (
        <div className="absolute -bottom-1 -right-1">
          <div className="bg-white rounded-full p-0.5 shadow-sm">
            <div className={`${sizeClasses[badgeSizeMap[size]]} bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs`}>
              {badges.length > 9 ? '9+' : badges.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour éditer la photo de profil
function ProfilePictureEditor({ user, onPhotoChange, className = '' }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type et la taille du fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      alert('L\'image doit faire moins de 5MB');
      return;
    }

    setIsUploading(true);
    try {
      await onPhotoChange(file);
    } catch (error) {
      console.error('Erreur lors du changement de photo:', error);
      
      // Messages d'erreur plus spécifiques
      if (error.code === 'storage/unauthorized') {
        alert('Erreur d\'autorisation. Vérifiez que vous êtes connecté.');
      } else if (error.code === 'storage/cors') {
        alert('Erreur CORS. Les règles Firebase Storage doivent être configurées.');
      } else {
        alert(`Erreur lors du changement de photo: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <ProfilePicture user={user} size="xl" />
      
      <label className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg">
        <Camera className="w-4 h-4 text-white" />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </label>

      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}

export { ProfilePicture, ProfilePictureEditor };
export default ProfilePicture; 