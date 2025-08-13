import React from 'react';
import Chip from '../components/ui/Chip';
import { 
  getEstadoReclutamientoVariant, 
  getEstadoReclutamientoText,
  getEstadoInvestigacionVariant,
  getEstadoInvestigacionText
} from '../utils/estadoUtils';

const TestEstadosPage: React.FC = () => {
  const estadosReclutamiento = [
    'pendiente',
    'en progreso',
    'agendada',
    'por agendar',
    'pausado',
    'cancelado',
    'finalizado'
  ];

  const estadosInvestigacion = [
    'en borrador',
    'por agendar',
    'en progreso',
    'finalizado',
    'pausado',
    'cancelado'
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Test de Estados - Colores Únicos</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Estados de Reclutamiento */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              🎯 Estados de Reclutamiento
            </h2>
            <div className="space-y-3">
              {estadosReclutamiento.map((estado) => (
                <div key={estado} className="flex items-center gap-3">
                  <Chip
                    variant={getEstadoReclutamientoVariant(estado) as any}
                    size="md"
                  >
                    {getEstadoReclutamientoText(estado)}
                  </Chip>
                  <span className="text-sm text-muted-foreground">
                    → {getEstadoReclutamientoVariant(estado)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Estados de Investigación */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              🔬 Estados de Investigación
            </h2>
            <div className="space-y-3">
              {estadosInvestigacion.map((estado) => (
                <div key={estado} className="flex items-center gap-3">
                  <Chip
                    variant={getEstadoInvestigacionVariant(estado) as any}
                    size="md"
                  >
                    {getEstadoInvestigacionText(estado)}
                  </Chip>
                  <span className="text-sm text-muted-foreground">
                    → {getEstadoInvestigacionVariant(estado)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen de Colores */}
        <div className="mt-8 bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">📊 Resumen de Colores Únicos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 text-blue-600">Reclutamiento:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Pendiente → <span className="text-yellow-600">warning (amarillo)</span></li>
                <li>• En Progreso → <span className="text-purple-600">accent-purple (púrpura)</span></li>
                <li>• Agendada → <span className="text-blue-600">accent-blue (azul oscuro)</span></li>
                <li>• Por Agendar → <span className="text-indigo-600">accent-indigo (índigo)</span></li>
                <li>• Pausado → <span className="text-pink-600">accent-pink (rosa)</span></li>
                <li>• Cancelado → <span className="text-red-600">danger (rojo)</span></li>
                <li>• Finalizado → <span className="text-green-600">success (verde)</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-green-600">Investigación:</h3>
              <ul className="space-y-1 text-sm">
                <li>• En Borrador → <span className="text-teal-600">accent-teal (verde azulado)</span></li>
                <li>• Por Agendar → <span className="text-orange-600">accent-orange (naranja)</span></li>
                <li>• En Progreso → <span className="text-blue-400">info (azul claro)</span></li>
                <li>• Finalizado → <span className="text-green-600">success (verde)</span></li>
                <li>• Pausado → <span className="text-gray-500">secondary (gris claro)</span></li>
                <li>• Cancelado → <span className="text-red-600">danger (rojo)</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Nota:</h4>
            <p className="text-yellow-700 text-sm">
              Solo "Finalizado" y "Cancelado" comparten colores entre reclutamiento e investigación, 
              ya que son estados semánticamente idénticos. Todos los demás estados tienen colores únicos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEstadosPage;
