import React, { useEffect } from 'react';
import { useGlobalMeetDetection } from '../../hooks/useGlobalMeetDetection';
import { useGlobalTranscription } from '../../contexts/GlobalTranscriptionContext';

const GlobalMeetDetector: React.FC = () => {
  const { registerMeetSession, unregisterMeetSession, activeSessions } = useGlobalMeetDetection();
  const { transcriptionState } = useGlobalTranscription();

  useEffect(() => {
    // Función para detectar cuando se hace clic en un enlace de Meet
    const handleMeetLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href*="meet.google.com"]') as HTMLAnchorElement;
      
      if (link) {
        const meetLink = link.href;
        console.log('🔗 Enlace de Meet detectado:', meetLink);
        
        // Buscar información de reclutamiento en el contexto
        const reclutamientoElement = document.querySelector('[data-reclutamiento-id]');
        if (reclutamientoElement) {
          const reclutamientoId = reclutamientoElement.getAttribute('data-reclutamiento-id');
          if (reclutamientoId) {
            registerMeetSession(reclutamientoId, meetLink);
          }
        }
      }
    };

    // Función para detectar cuando se abre una nueva ventana/pestaña de Meet
    const handleWindowOpen = (event: Event) => {
      // Este evento se dispara cuando se abre una nueva ventana
      console.log('🪟 Nueva ventana abierta, verificando si es Meet...');
      
      // Esperar un poco para que la ventana se cargue
      setTimeout(() => {
        // Verificar si hay nuevas pestañas de Meet
        // Nota: Esto es limitado por las políticas de seguridad del navegador
      }, 2000);
    };

    // Función para detectar cambios en el título de la página (indica Meet activo)
    const handleTitleChange = () => {
      const title = document.title;
      if (title.includes('Meet') || title.includes('Google Meet')) {
        console.log('📋 Título de Meet detectado:', title);
        
        // Buscar información de reclutamiento
        const reclutamientoElement = document.querySelector('[data-reclutamiento-id]');
        if (reclutamientoElement) {
          const reclutamientoId = reclutamientoElement.getAttribute('data-reclutamiento-id');
          if (reclutamientoId) {
            // Buscar enlace de Meet en la página
            const meetLink = document.querySelector('a[href*="meet.google.com"]') as HTMLAnchorElement;
            if (meetLink) {
              registerMeetSession(reclutamientoId, meetLink.href);
            }
          }
        }
      }
    };

    // Función para detectar cuando se cierra una ventana/pestaña
    const handleBeforeUnload = () => {
      console.log('🚪 Ventana cerrándose, limpiando sesiones...');
      // Limpiar todas las sesiones activas
      activeSessions.forEach(session => {
        unregisterMeetSession(session.meetLink);
      });
    };

    // Función para detectar cambios en la visibilidad de la página
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👁️ Página oculta');
      } else {
        console.log('👁️ Página visible');
        // Verificar si hay sesiones de Meet activas
        const meetLinks = document.querySelectorAll('a[href*="meet.google.com"]');
        meetLinks.forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          if (href) {
            const reclutamientoElement = document.querySelector('[data-reclutamiento-id]');
            if (reclutamientoElement) {
              const reclutamientoId = reclutamientoElement.getAttribute('data-reclutamiento-id');
              if (reclutamientoId) {
                registerMeetSession(reclutamientoId, href);
              }
            }
          }
        });
      }
    };

    // Agregar event listeners
    document.addEventListener('click', handleMeetLinkClick);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Observer para cambios en el título
    const titleObserver = new MutationObserver(handleTitleChange);
    titleObserver.observe(document.querySelector('title') || document.head, {
      childList: true,
      subtree: true
    });

    // Verificar inmediatamente si hay enlaces de Meet en la página
    const initialMeetLinks = document.querySelectorAll('a[href*="meet.google.com"]');
    initialMeetLinks.forEach(link => {
      const href = (link as HTMLAnchorElement).href;
      if (href) {
        const reclutamientoElement = document.querySelector('[data-reclutamiento-id]');
        if (reclutamientoElement) {
          const reclutamientoId = reclutamientoElement.getAttribute('data-reclutamiento-id');
          if (reclutamientoId) {
            registerMeetSession(reclutamientoId, href);
          }
        }
      }
    });

    // Cleanup
    return () => {
      document.removeEventListener('click', handleMeetLinkClick);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      titleObserver.disconnect();
    };
  }, [registerMeetSession, unregisterMeetSession, activeSessions]);

  // Este componente no renderiza nada visible
  return null;
};

export default GlobalMeetDetector;
