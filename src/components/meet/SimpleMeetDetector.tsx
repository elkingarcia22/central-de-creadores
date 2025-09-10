import React from 'react';
import { useSimpleMeetDetection } from '../../hooks/useSimpleMeetDetection';

interface SimpleMeetDetectorProps {
  reclutamientoId: string;
  meetLink: string;
}

const SimpleMeetDetector: React.FC<SimpleMeetDetectorProps> = ({
  reclutamientoId,
  meetLink
}) => {
  // Usar el hook simple
  useSimpleMeetDetection({
    reclutamientoId,
    meetLink
  });

  // Este componente no renderiza nada visible
  return null;
};

export default SimpleMeetDetector;
