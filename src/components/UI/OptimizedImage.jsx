import React, { useState, useRef, useEffect, useCallback } from 'react';
import useMobilePerformance from '../../hooks/useMobilePerformance';

// Composant Image Optimisé pour Mobile
const OptimizedImage = ({
  src,
  alt = '',
  width,
  height,
  className = '',
  sizes = '100vw',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  loading = 'lazy',
  style = {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Si priority, charger immédiatement
  const [currentSrc, setCurrentSrc] = useState('');
  
  const imgRef = useRef(null);
  const { deviceInfo, optimizedSettings } = useMobilePerformance();

  // Générer les sources responsives
  const generateResponsiveSources = useCallback((baseSrc) => {
    if (!baseSrc) return [];
    
    const baseUrl = baseSrc.split('.').slice(0, -1).join('.');
    const extension = baseSrc.split('.').pop();
    
    const breakpoints = [
      { width: 320, suffix: '-sm' },
      { width: 640, suffix: '-md' },
      { width: 1024, suffix: '-lg' },
      { width: 1920, suffix: '-xl' }
    ];

    return breakpoints.map(bp => ({
      srcSet: `${baseUrl}${bp.suffix}.webp ${bp.width}w`,
      media: bp.width === 320 ? '(max-width: 639px)' : 
             bp.width === 640 ? '(max-width: 1023px)' :
             bp.width === 1024 ? '(max-width: 1919px)' : 
             '(min-width: 1920px)'
    }));
  }, []);

  // Optimiser la qualité selon l'appareil
  const getOptimizedQuality = useCallback(() => {
    if (deviceInfo.isLowEnd) return Math.min(quality, 60);
    if (deviceInfo.isSlowNetwork) return Math.min(quality, 70);
    return quality;
  }, [deviceInfo, quality]);

  // Intersection Observer pour lazy loading
  useEffect(() => {
    if (priority || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: optimizedSettings.prefetchLevel === 'aggressive' ? '200px' : '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, optimizedSettings.prefetchLevel]);

  // Déterminer la source optimale
  useEffect(() => {
    if (!isInView || !src) return;

    let optimizedSrc = src;
    const optimizedQuality = getOptimizedQuality();

    // Ajouter les paramètres de qualité si c'est une URL avec query params supportée
    if (src.includes('?') || optimizedQuality !== quality) {
      const separator = src.includes('?') ? '&' : '?';
      optimizedSrc = `${src}${separator}quality=${optimizedQuality}`;
    }

    // Format WebP si supporté et activé
    if (optimizedSettings.enableWebP && 'HTMLPictureElement' in window) {
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
      optimizedSrc = webpSrc;
    }

    setCurrentSrc(optimizedSrc);
  }, [isInView, src, getOptimizedQuality, optimizedSettings, quality]);

  // Handlers d'événements
  const handleLoad = useCallback((event) => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.(event);
  }, [onLoad]);

  const handleError = useCallback((event) => {
    setHasError(true);
    setIsLoaded(false);
    
    // Fallback vers l'image originale si WebP échoue
    if (currentSrc.includes('.webp') && src) {
      setCurrentSrc(src);
      return;
    }
    
    onError?.(event);
  }, [onError, currentSrc, src]);

  // Placeholder pendant le chargement
  const getPlaceholder = () => {
    if (placeholder === 'blur' && blurDataURL) {
      return blurDataURL;
    }
    
    if (placeholder === 'empty') {
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }

    // Générer un placeholder coloré basé sur les dimensions
    const placeholderColor = deviceInfo.isLowEnd ? '#f3f4f6' : '#e5e7eb';
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${placeholderColor}"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
          ${hasError ? 'Erreur de chargement' : 'Chargement...'}
        </text>
      </svg>
    `)}`;
  };

  // Styles optimisés
  const containerStyle = {
    display: 'inline-block',
    overflow: 'hidden',
    position: 'relative',
    ...style
  };

  const imageStyle = {
    transition: optimizedSettings.enableTransitions ? 
      'opacity 0.3s ease-in-out, transform 0.3s ease-in-out' : 'none',
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'scale(1)' : 'scale(0.95)',
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    objectFit: 'cover'
  };

  const placeholderStyle = {
    position: isLoaded ? 'absolute' : 'static',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: isLoaded ? 0 : 1,
    transition: optimizedSettings.enableTransitions ? 'opacity 0.3s ease-in-out' : 'none'
  };

  // Rendu conditionnel selon les capacités
  if (optimizedSettings.enableWebP && 'HTMLPictureElement' in window && !hasError) {
    const sources = generateResponsiveSources(src);
    
    return (
      <div ref={imgRef} style={containerStyle} className={className}>
        <picture>
          {sources.map((source, index) => (
            <source
              key={index}
              srcSet={isInView ? source.srcSet : undefined}
              media={source.media}
              type="image/webp"
            />
          ))}
          <img
            src={isInView ? currentSrc : getPlaceholder()}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            loading={priority ? 'eager' : loading}
            style={imageStyle}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </picture>
        {!isLoaded && !hasError && (
          <img
            src={getPlaceholder()}
            alt=""
            style={placeholderStyle}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }

  // Fallback classique pour anciens navigateurs
  return (
    <div ref={imgRef} style={containerStyle} className={className}>
      <img
        src={isInView ? (currentSrc || src) : getPlaceholder()}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : loading}
        style={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      {!isLoaded && !hasError && (
        <img
          src={getPlaceholder()}
          alt=""
          style={placeholderStyle}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// Wrapper pour les images critiques (LCP)
export const CriticalImage = (props) => {
  return <OptimizedImage {...props} priority={true} loading="eager" />;
};

// Wrapper pour les images de fond
export const BackgroundImage = ({ src, children, className, style, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { optimizedSettings } = useMobilePerformance();

  const backgroundStyle = {
    backgroundImage: isLoaded ? `url(${src})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transition: optimizedSettings.enableTransitions ? 
      'background-image 0.3s ease-in-out' : 'none',
    ...style
  };

  return (
    <div className={className} style={backgroundStyle}>
      <img
        src={src}
        alt=""
        style={{ display: 'none' }}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
      {children}
    </div>
  );
};

export default OptimizedImage;