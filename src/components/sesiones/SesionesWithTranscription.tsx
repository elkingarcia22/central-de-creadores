import React from 'react';
import { useGlobalTranscription } from '../../contexts/GlobalTranscriptionContext';

interface SesionesWithTranscriptionProps {
  children: (globalTranscription: any) => React.ReactNode;
}

const SesionesWithTranscription: React.FC<SesionesWithTranscriptionProps> = ({ children }) => {
  let globalTranscription = null;
  
  console.log('🔍 SesionesWithTranscription - Iniciando wrapper...');
  
  try {
    globalTranscription = useGlobalTranscription();
    console.log('✅ SesionesWithTranscription - Contexto obtenido:', globalTranscription);
  } catch (error) {
    console.warn('❌ SesionesWithTranscription - GlobalTranscriptionContext no está disponible:', error);
  }

  console.log('🔍 SesionesWithTranscription - Pasando contexto a children:', globalTranscription);
  return <>{children(globalTranscription)}</>;
};

export default SesionesWithTranscription;
