import React, { useEffect, useState } from 'react';
import GlobalMeetDetector from './GlobalMeetDetector';
import TranscriptionStatusIndicator from './TranscriptionStatusIndicator';

const GlobalTranscriptionWrapper: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Solo renderizar en el cliente para evitar problemas de hidratación
  if (!isClient) {
    return null;
  }

  return (
    <>
      <GlobalMeetDetector />
      <TranscriptionStatusIndicator />
    </>
  );
};

export default GlobalTranscriptionWrapper;
