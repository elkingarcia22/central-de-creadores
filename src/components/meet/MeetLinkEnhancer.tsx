import React, { useEffect } from 'react';
import { useGlobalTranscription } from '../../contexts/GlobalTranscriptionContext';

interface MeetLinkEnhancerProps {
  reclutamientoId: string;
  meetLink: string;
}

const MeetLinkEnhancer: React.FC<MeetLinkEnhancerProps> = ({
  reclutamientoId,
  meetLink
}) => {
  // Usar try-catch para manejar el caso cuando el contexto no esté disponible
  let globalTranscription = null;
  try {
    globalTranscription = useGlobalTranscription();
  } catch (error) {
    console.warn('GlobalTranscriptionContext no está disponible:', error);
    return null;
  }
  
  const { startTranscription, stopTranscription, transcriptionState } = globalTranscription;

  useEffect(() => {
    if (!reclutamientoId || !meetLink || !globalTranscription) {
      return;
    }

    console.log('🔗 Mejorando enlaces de Meet...');

    // Función para mejorar enlaces de Meet
    const enhanceMeetLinks = () => {
      const meetLinks = document.querySelectorAll('a[href*="meet.google.com"]');
      
      meetLinks.forEach(link => {
        // Agregar atributo para identificar enlaces mejorados
        if (!link.hasAttribute('data-enhanced')) {
          link.setAttribute('data-enhanced', 'true');
          
          // Agregar event listener personalizado
          link.addEventListener('click', (event) => {
            console.log('🔗 Enlace de Meet mejorado clickeado:', link.href);
            
            // Iniciar transcripción si no está activa
            if (!transcriptionState?.isRecording) {
              console.log('🎤 Iniciando transcripción automática...');
              startTranscription(reclutamientoId, meetLink);
              
              // Mostrar notificación
              setTimeout(() => {
                alert('🎤 Transcripción automática iniciada!');
              }, 1000);
            }
          });
        }
      });
    };

    // Función para detectar cuando se cierra la ventana
    const handleBeforeUnload = () => {
      if (transcriptionState?.isRecording) {
        console.log('🚪 Ventana cerrándose, deteniendo transcripción...');
        stopTranscription();
      }
    };

    // Mejorar enlaces existentes
    enhanceMeetLinks();
    
    // Agregar event listener para enlaces nuevos
    const observer = new MutationObserver(() => {
      enhanceMeetLinks();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Agregar event listener para cierre de ventana
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [reclutamientoId, meetLink, globalTranscription, startTranscription, stopTranscription, transcriptionState?.isRecording]);

  // Este componente no renderiza nada visible
  return null;
};

export default MeetLinkEnhancer;
