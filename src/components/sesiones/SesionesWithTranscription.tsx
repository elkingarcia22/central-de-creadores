import React from 'react';
import { useGlobalTranscription } from '../../contexts/GlobalTranscriptionContext';

interface SesionesWithTranscriptionProps {
  children: (globalTranscription: any) => React.ReactNode;
}

const SesionesWithTranscription: React.FC<SesionesWithTranscriptionProps> = ({ children }) => {
  let globalTranscription = null;
  
  try {
    globalTranscription = useGlobalTranscription();
  } catch (error) {
    console.warn('GlobalTranscriptionContext no está disponible:', error);
  }

  return <>{children(globalTranscription)}</>;
};

export default SesionesWithTranscription;
