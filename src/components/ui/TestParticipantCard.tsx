import React from 'react';

interface TestParticipant {
  id: string;
  nombre: string;
  total_participaciones: number;
  fecha_ultima_participacion: string | null;
}

interface TestParticipantCardProps {
  participant: TestParticipant;
  onViewDetails?: (id: string) => void;
}

const TestParticipantCard: React.FC<TestParticipantCardProps> = ({ participant, onViewDetails }) => {
  return (
    <div className="border p-4 rounded-lg bg-white shadow-sm">
      <h3 className="font-semibold text-lg mb-2">{participant.nombre}</h3>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Participaciones:</span> 
          <span className="font-bold text-blue-600 ml-1">{participant.total_participaciones}</span>
        </p>
        
        {participant.fecha_ultima_participacion && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Última participación:</span> 
            <span className="ml-1">{new Date(participant.fecha_ultima_participacion).toLocaleDateString()}</span>
          </p>
        )}
        
        <p className="text-xs text-gray-500">
          ID: {participant.id}
        </p>
      </div>
      
      {onViewDetails && (
        <button 
          onClick={() => onViewDetails(participant.id)}
          className="mt-3 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
        >
          Ver
        </button>
      )}
      
      {/* Debug info */}
      <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
        <strong>Debug:</strong> total_participaciones = {participant.total_participaciones} (tipo: {typeof participant.total_participaciones})
      </div>
    </div>
  );
};

export default TestParticipantCard;
