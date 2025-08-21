import { useEffect, useRef, useState, useCallback } from 'react';

export interface MicroInteractionOptions {
  /** Tipo de animación */
  type?: 'fade-in' | 'slide-in-left' | 'slide-in-right' | 'slide-in-up' | 'scale-in' | 'bounce' | 'pulse';
  /** Delay antes de la animación */
  delay?: number;
  /** Duración de la animación */
  duration?: number;
  /** Si la animación debe repetirse */
  repeat?: boolean;
  /** Trigger para la animación */
  trigger?: 'onMount' | 'onScroll' | 'onClick' | 'onHover' | 'manual';
  /** Umbral de scroll para trigger onScroll */
  scrollThreshold?: number;
  /** Callback cuando la animación comienza */
  onStart?: () => void;
  /** Callback cuando la animación termina */
  onEnd?: () => void;
}

export interface MicroInteractionReturn {
  /** Ref para el elemento */
  ref: React.RefObject<HTMLElement>;
  /** Estado de la animación */
  isAnimating: boolean;
  /** Estado si la animación ha sido activada */
  hasTriggered: boolean;
  /** Función para activar la animación manualmente */
  trigger: () => void;
  /** Función para resetear la animación */
  reset: () => void;
  /** Clases CSS para aplicar */
  className: string;
}

/**
 * Hook para gestionar micro-interacciones y animaciones
 */
export const useMicroInteractions = (
  options: MicroInteractionOptions = {}
): MicroInteractionReturn => {
  const {
    type = 'fade-in',
    delay = 0,
    duration = 300,
    repeat = false,
    trigger = 'onMount',
    scrollThreshold = 0.1,
    onStart,
    onEnd
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Mapeo de tipos de animación a clases CSS
  const getAnimationClass = useCallback((animationType: string) => {
    const classMap = {
      'fade-in': 'fade-in',
      'slide-in-left': 'slide-in-left',
      'slide-in-right': 'slide-in-right',
      'slide-in-up': 'slide-in-up',
      'scale-in': 'scale-in',
      'bounce': 'bounce',
      'pulse': 'pulse'
    };
    return classMap[animationType as keyof typeof classMap] || 'fade-in';
  }, []);

  // Función para activar la animación
  const triggerAnimation = useCallback(() => {
    if (hasTriggered && !repeat) return;

    setIsAnimating(true);
    setHasTriggered(true);
    onStart?.();

    // Aplicar la clase de animación
    if (ref.current) {
      ref.current.classList.add(getAnimationClass(type));
    }

    // Limpiar la animación después de la duración
    setTimeout(() => {
      setIsAnimating(false);
      onEnd?.();
    }, duration);
  }, [hasTriggered, repeat, onStart, onEnd, duration, type, getAnimationClass]);

  // Función para resetear la animación
  const reset = useCallback(() => {
    setIsAnimating(false);
    setHasTriggered(false);
    setIsVisible(false);
    
    if (ref.current) {
      ref.current.classList.remove(getAnimationClass(type));
    }
  }, [type, getAnimationClass]);

  // Observer para scroll
  useEffect(() => {
    if (trigger !== 'onScroll' || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setIsVisible(true);
          setTimeout(() => {
            triggerAnimation();
          }, delay);
        }
      },
      {
        threshold: scrollThreshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [trigger, hasTriggered, scrollThreshold, delay, triggerAnimation]);

  // Trigger onMount
  useEffect(() => {
    if (trigger === 'onMount') {
      setTimeout(() => {
        triggerAnimation();
      }, delay);
    }
  }, [trigger, delay, triggerAnimation]);

  // Event listeners para click y hover
  useEffect(() => {
    if (!ref.current || (trigger !== 'onClick' && trigger !== 'onHover')) return;

    const element = ref.current;

    if (trigger === 'onClick') {
      const handleClick = () => {
        triggerAnimation();
      };
      element.addEventListener('click', handleClick);
      return () => element.removeEventListener('click', handleClick);
    }

    if (trigger === 'onHover') {
      const handleMouseEnter = () => {
        triggerAnimation();
      };
      element.addEventListener('mouseenter', handleMouseEnter);
      return () => element.removeEventListener('mouseenter', handleMouseEnter);
    }
  }, [trigger, triggerAnimation]);

  // Construir className
  const className = useCallback(() => {
    const baseClasses = [];
    
    if (trigger === 'onScroll' && !isVisible) {
      baseClasses.push('opacity-0');
    }
    
    if (isAnimating) {
      baseClasses.push(getAnimationClass(type));
    }
    
    return baseClasses.join(' ');
  }, [trigger, isVisible, isAnimating, getAnimationClass, type]);

  return {
    ref,
    isAnimating,
    hasTriggered,
    trigger: triggerAnimation,
    reset,
    className: className()
  };
};

/**
 * Hook para animaciones de entrada escalonadas
 */
export const useStaggeredAnimation = (
  items: any[],
  options: Omit<MicroInteractionOptions, 'trigger'> = {}
) => {
  const [animatedItems, setAnimatedItems] = useState<Set<number>>(new Set());

  const triggerItem = useCallback((index: number) => {
    setAnimatedItems(prev => new Set([...prev, index]));
  }, []);

  const triggerAll = useCallback(() => {
    items.forEach((_, index) => {
      setTimeout(() => {
        triggerItem(index);
      }, (options.delay || 0) + (index * 100));
    });
  }, [items, options.delay, triggerItem]);

  const reset = useCallback(() => {
    setAnimatedItems(new Set());
  }, []);

  return {
    animatedItems,
    triggerItem,
    triggerAll,
    reset
  };
};

/**
 * Hook para animaciones de página
 */
export const usePageAnimation = () => {
  const [isPageVisible, setIsPageVisible] = useState(false);

  useEffect(() => {
    setIsPageVisible(true);
  }, []);

  return {
    isPageVisible,
    className: isPageVisible ? 'page-fade-in' : 'opacity-0'
  };
};

/**
 * Hook para animaciones de lista
 */
export const useListAnimation = (items: any[]) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      items.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => new Set([...prev, index]));
        }, index * 100);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [items]);

  return {
    visibleItems,
    isItemVisible: (index: number) => visibleItems.has(index)
  };
};

/**
 * Hook para animaciones de carga
 */
export const useLoadingAnimation = (isLoading: boolean) => {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowSpinner(true);
    } else {
      const timer = setTimeout(() => {
        setShowSpinner(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return {
    showSpinner,
    className: showSpinner ? 'spinner' : ''
  };
};

/**
 * Hook para animaciones de notificación
 */
export const useNotificationAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);

  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    show,
    hide,
    className: isVisible ? 'notification-pop' : 'opacity-0 scale-0'
  };
};

/**
 * Hook para animaciones de modal
 */
export const useModalAnimation = (isOpen: boolean) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return {
    isAnimating,
    backdropClassName: isOpen ? 'modal-backdrop' : 'opacity-0',
    contentClassName: isOpen ? 'modal-content' : 'opacity-0 scale-95'
  };
};
