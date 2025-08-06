import React from 'react';

interface SimpleAvatarProps {
  src?: string | null;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function getInitials(text: string): string {
  return text
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
};

// Cache global persistente en memoria
interface ImageCacheEntry {
  isLoaded: boolean;
  hasError: boolean;
  imageElement?: HTMLImageElement;
}

const globalImageCache = new Map<string, ImageCacheEntry>();

// Función para precargar imagen
function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

const SimpleAvatar: React.FC<SimpleAvatarProps> = ({ 
  src, 
  fallbackText = 'Usuario',
  size = 'md',
  className = ''
}) => {
  const [hasError, setHasError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  
  // Memoizar las iniciales para evitar recálculos
  const initials = React.useMemo(() => getInitials(fallbackText), [fallbackText]);
  
  // Actualizar imageSrc cuando cambie src
  React.useEffect(() => {
    if (src && src.trim() !== '') {
      const trimmedSrc = src.trim();
      setImageSrc(trimmedSrc);
      
      // Verificar si la imagen ya está en cache global
      const cachedEntry = globalImageCache.get(trimmedSrc);
      if (cachedEntry) {
        setIsLoaded(cachedEntry.isLoaded);
        setHasError(cachedEntry.hasError);
      } else {
        // Precargar la imagen
        setIsLoaded(false);
        setHasError(false);
        
        preloadImage(trimmedSrc)
          .then((img) => {
            globalImageCache.set(trimmedSrc, {
              isLoaded: true,
              hasError: false,
              imageElement: img
            });
            setIsLoaded(true);
            setHasError(false);
          })
          .catch(() => {
            globalImageCache.set(trimmedSrc, {
              isLoaded: false,
              hasError: true
            });
            setHasError(true);
            setIsLoaded(false);
          });
      }
    } else {
      setImageSrc(null);
      setHasError(true);
      setIsLoaded(false);
    }
  }, [src]);
  
  const shouldShowImage = imageSrc && !hasError;
  
  const classes = React.useMemo(() => `
    inline-flex items-center justify-center 
    rounded-full bg-blue-500 text-white font-medium
    flex-shrink-0 overflow-hidden relative
    ${sizeClasses[size]}
    ${className}
  `.trim(), [size, className]);

  return (
    <div className={classes}>
      {shouldShowImage ? (
        <>
          {/* Avatar con iniciales como fallback */}
          <span className="select-none">{initials}</span>
          
          {/* Imagen que se superpone cuando carga */}
          <img
            src={imageSrc}
            alt={fallbackText}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out'
            }}
          />
        </>
      ) : (
        <span className="select-none">{initials}</span>
      )}
    </div>
  );
};

export default SimpleAvatar; 