import React from 'react';
import { Typography, Card, Chip } from '../ui';
import { 
  getEstadoReclutamientoVariant, 
  getEstadoReclutamientoText,
  getEstadoInvestigacionVariant, 
  getEstadoInvestigacionText 
} from '../../utils/estadoUtils';
import { 
  getRiesgoBadgeVariant, 
  getRiesgoText 
} from '../../utils/riesgoUtils';
import { 
  getTipoParticipanteVariant, 
  getTipoParticipanteText 
} from '../../utils/tipoParticipanteUtils';

const EstadosSection: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Descripción */}
      <Card className="p-6">
        <Typography variant="h2" weight="bold" className="mb-4">
          Manejo de Estados
        </Typography>
        <Typography variant="body1" color="secondary" className="mb-4">
          Sistema centralizado de manejo de estados para toda la aplicación. Cada estado tiene un color único y texto específico para mantener consistencia visual.
        </Typography>
      </Card>

      {/* Estados de Reclutamiento */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Estados de Reclutamiento
        </Typography>
        <Typography variant="body1" color="secondary" className="mb-6">
          Estados específicos para el módulo de reclutamiento con colores únicos.
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="warning">Pendiente</Chip>
            <div>
              <Typography variant="body2" weight="medium">Pendiente</Typography>
              <Typography variant="caption" color="secondary">Amarillo</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="accent-purple">En Progreso</Chip>
            <div>
              <Typography variant="body2" weight="medium">En Progreso</Typography>
              <Typography variant="caption" color="secondary">Púrpura</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="success">Agendada</Chip>
            <div>
              <Typography variant="body2" weight="medium">Agendada</Typography>
              <Typography variant="caption" color="secondary">Verde</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="accent-indigo">Por Agendar</Chip>
            <div>
              <Typography variant="body2" weight="medium">Por Agendar</Typography>
              <Typography variant="caption" color="secondary">Índigo</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="accent-pink">Pausado</Chip>
            <div>
              <Typography variant="body2" weight="medium">Pausado</Typography>
              <Typography variant="caption" color="secondary">Rosa</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="danger">Cancelado</Chip>
            <div>
              <Typography variant="body2" weight="medium">Cancelado</Typography>
              <Typography variant="caption" color="secondary">Rojo</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="success">Finalizado</Chip>
            <div>
              <Typography variant="body2" weight="medium">Finalizado</Typography>
              <Typography variant="caption" color="secondary">Verde</Typography>
            </div>
          </div>
        </div>
      </Card>

      {/* Estados de Investigación */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Estados de Investigación
        </Typography>
        <Typography variant="body1" color="secondary" className="mb-6">
          Estados específicos para el módulo de investigación con colores únicos.
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="accent-teal">En Borrador</Chip>
            <div>
              <Typography variant="body2" weight="medium">En Borrador</Typography>
              <Typography variant="caption" color="secondary">Verde azulado</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="accent-orange">Por Agendar</Chip>
            <div>
              <Typography variant="body2" weight="medium">Por Agendar</Typography>
              <Typography variant="caption" color="secondary">Naranja</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="info">En Progreso</Chip>
            <div>
              <Typography variant="body2" weight="medium">En Progreso</Typography>
              <Typography variant="caption" color="secondary">Azul claro</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="success">Finalizado</Chip>
            <div>
              <Typography variant="body2" weight="medium">Finalizado</Typography>
              <Typography variant="caption" color="secondary">Verde</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="secondary">Pausado</Chip>
            <div>
              <Typography variant="body2" weight="medium">Pausado</Typography>
              <Typography variant="caption" color="secondary">Gris claro</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="danger">Cancelado</Chip>
            <div>
              <Typography variant="body2" weight="medium">Cancelado</Typography>
              <Typography variant="caption" color="secondary">Rojo</Typography>
            </div>
          </div>
        </div>
      </Card>

      {/* Estados de Riesgo */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Estados de Riesgo
        </Typography>
        <Typography variant="body1" color="secondary" className="mb-6">
          Niveles de riesgo simplificados sin la palabra "riesgo" para ocupar menos espacio.
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="success">Bajo</Chip>
            <div>
              <Typography variant="body2" weight="medium">Bajo</Typography>
              <Typography variant="caption" color="secondary">Verde</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="warning">Medio</Chip>
            <div>
              <Typography variant="body2" weight="medium">Medio</Typography>
              <Typography variant="caption" color="secondary">Amarillo</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="danger">Alto</Chip>
            <div>
              <Typography variant="body2" weight="medium">Alto</Typography>
              <Typography variant="caption" color="secondary">Rojo</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="accent-purple">Crítico</Chip>
            <div>
              <Typography variant="body2" weight="medium">Crítico</Typography>
              <Typography variant="caption" color="secondary">Púrpura</Typography>
            </div>
          </div>
        </div>
      </Card>

      {/* Tipos de Participante */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Tipos de Participante
        </Typography>
        <Typography variant="body1" color="secondary" className="mb-6">
          Tipos de participantes con colores únicos que no se mezclan con los estados.
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="accent-cyan">Externo</Chip>
            <div>
              <Typography variant="body2" weight="medium">Externo</Typography>
              <Typography variant="caption" color="secondary">Cian</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="accent-emerald">Interno</Chip>
            <div>
              <Typography variant="body2" weight="medium">Interno</Typography>
              <Typography variant="caption" color="secondary">Esmeralda</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="accent-violet">Friend & Family</Chip>
            <div>
              <Typography variant="body2" weight="medium">Friend & Family</Typography>
              <Typography variant="caption" color="secondary">Violeta</Typography>
            </div>
          </div>
        </div>
      </Card>

      {/* Implementación */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Implementación
        </Typography>
        <Typography variant="body1" color="secondary" className="mb-6">
          Cómo usar el sistema de estados en tu código.
        </Typography>
        
        <div className="bg-muted p-4 rounded-lg">
          <Typography variant="h5" weight="semibold" className="mb-2">
            Importar funciones:
          </Typography>
          <pre className="bg-background p-3 rounded text-sm overflow-x-auto">
{`import { 
  getEstadoReclutamientoVariant, 
  getEstadoReclutamientoText,
  getEstadoInvestigacionVariant, 
  getEstadoInvestigacionText 
} from '../utils/estadoUtils';

import { 
  getRiesgoBadgeVariant, 
  getRiesgoText 
} from '../utils/riesgoUtils';

import { 
  getTipoParticipanteVariant, 
  getTipoParticipanteText 
} from '../utils/tipoParticipanteUtils';`}
          </pre>
        </div>
        
        <div className="bg-muted p-4 rounded-lg mt-4">
          <Typography variant="h5" weight="semibold" className="mb-2">
            Uso en componentes:
          </Typography>
          <pre className="bg-background p-3 rounded text-sm overflow-x-auto">
{`// Para estados de reclutamiento
<Chip 
  variant={getEstadoReclutamientoVariant(estado)}
>
  {getEstadoReclutamientoText(estado)}
</Chip>

// Para estados de investigación
<Chip 
  variant={getEstadoInvestigacionVariant(estado)}
>
  {getEstadoInvestigacionText(estado)}
</Chip>

// Para niveles de riesgo
<Chip 
  variant={getRiesgoBadgeVariant(nivel)}
>
  {getRiesgoText(nivel)}
</Chip>

// Para tipos de participante
<Chip 
  variant={getTipoParticipanteVariant(tipo)}
>
  {getTipoParticipanteText(tipo)}
</Chip>`}
          </pre>
        </div>
      </Card>
    </div>
  );
};

export default EstadosSection;
