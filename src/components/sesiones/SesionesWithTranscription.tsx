import React from 'react';
import { useGlobalTranscription } from '../../contexts/GlobalTranscriptionContext';

interface SesionesWithTranscriptionProps {
  children: (globalTranscription: any) => React.ReactNode;
}

const SesionesWithTranscription: React.FC<SesionesWithTranscriptionProps> = ({ children }) => {
  let globalTranscription = null;
  
  console.log('🎯🎯🎯 SESIONES WRAPPER - INICIANDO WRAPPER 🎯🎯🎯');
  
  try {
    globalTranscription = useGlobalTranscription();
    console.log('✅✅✅ SESIONES WRAPPER - CONTEXTO OBTENIDO:', globalTranscription);
  } catch (error) {
    console.warn('❌❌❌ SESIONES WRAPPER - CONTEXTO NO DISPONIBLE:', error);
  }

  console.log('🔄🔄🔄 SESIONES WRAPPER - PASANDO CONTEXTO A CHILDREN:', globalTranscription);
  return <>{children(globalTranscription)}</>;
};

export default SesionesWithTranscription;
