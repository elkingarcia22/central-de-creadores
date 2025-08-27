import React from 'react';
import { Typography, Card, Chip } from '../ui';
import { 
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
import { 
  getChipVariant, 
  getChipText,
  ESTADOS_TRANSITORIOS,
  ESTADOS_TERMINADOS,
  ESTADOS_FALLO,
  TIPOS_PARTICIPANTE
} from '../../utils/chipUtils';

const EstadosSection: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Descripción */}
      <Card className="p-6">
        <Typography variant="h2" weight="bold" className="mb-4">
          Manejo de Estados
        </Typography>
        <Typography variant="body1" color="secondary" className="mb-4">
          Sistema centralizado de manejo de estados para toda la aplicación. Los estados están agrupados por colores lógicos para reducir la cantidad de variantes y mejorar la consistencia visual.
        </Typography>
      </Card>

      {/* Estados Pendientes (Azul) */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Estados Pendientes
        </Typography>
        <Typography variant="body1" color="secondary" className="mb-6">
          Estados que están esperando acción o revisión. Color azul para indicar que requieren atención.
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="pendiente">Pendiente</Chip>
            <div>
              <Typography variant="body2" weight="medium">Pendiente</Typography>
              <Typography variant="caption" color="secondary">Azul</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="pendiente">Por Agendar</Chip>
            <div>
              <Typography variant="body2" weight="medium">Por Agendar</Typography>
              <Typography variant="caption" color="secondary">Azul</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="pendiente">En Borrador</Chip>
            <div>
              <Typography variant="body2" weight="medium">En Borrador</Typography>
              <Typography variant="caption" color="secondary">Azul</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="pendiente">En Enfriamiento</Chip>
            <div>
              <Typography variant="body2" weight="medium">En Enfriamiento</Typography>
              <Typography variant="caption" color="secondary">Azul</Typography>
            </div>
          </div>
        </div>
      </Card>

      {/* Estados Transitorios (Amarillo más fuerte) */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Estados Transitorios
        </Typography>
        <Typography variant="body1" color="secondary" className="mb-6">
          Estados que indican procesos en curso. Color amarillo más fuerte para mejor visibilidad.
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="transitoria">En Progreso</Chip>
            <div>
              <Typography variant="body2" weight="medium">En Progreso</Typography>
              <Typography variant="caption" color="secondary">Amarillo fuerte</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="transitoria" className="whitespace-nowrap">Pendiente de Agendamiento</Chip>
            <div>
              <Typography variant="body2" weight="medium">Pendiente de Agendamiento</Typography>
              <Typography variant="caption" color="secondary">Amarillo fuerte</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="transitoria">Pausado</Chip>
            <div>
              <Typography variant="body2" weight="medium">Pausado</Typography>
              <Typography variant="caption" color="secondary">Amarillo fuerte</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="transitoria">Medio</Chip>
            <div>
              <Typography variant="body2" weight="medium">Medio</Typography>
              <Typography variant="caption" color="secondary">Amarillo fuerte</Typography>
            </div>
          </div>
        </div>
      </Card>

      {/* Estados Terminados (Verde) */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Estados Terminados
        </Typography>
        <Typography variant="body1" color="secondary" className="mb-6">
          Estados que indican procesos completados exitosamente. Color verde para indicar éxito.
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="terminada">Agendada</Chip>
            <div>
              <Typography variant="body2" weight="medium">Agendada</Typography>
              <Typography variant="caption" color="secondary">Verde</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="terminada">Finalizado</Chip>
            <div>
              <Typography variant="body2" weight="medium">Finalizado</Typography>
              <Typography variant="caption" color="secondary">Verde</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="terminada">Completado</Chip>
            <div>
              <Typography variant="body2" weight="medium">Completado</Typography>
              <Typography variant="caption" color="secondary">Verde</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="terminada">Convertido</Chip>
            <div>
              <Typography variant="body2" weight="medium">Convertido</Typography>
              <Typography variant="caption" color="secondary">Verde</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="terminada">Bajo</Chip>
            <div>
              <Typography variant="body2" weight="medium">Bajo</Typography>
              <Typography variant="caption" color="secondary">Verde</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="terminada">Activo</Chip>
            <div>
              <Typography variant="body2" weight="medium">Activo</Typography>
              <Typography variant="caption" color="secondary">Verde</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="terminada">Disponible</Chip>
            <div>
              <Typography variant="body2" weight="medium">Disponible</Typography>
              <Typography variant="caption" color="secondary">Verde</Typography>
            </div>
          </div>
        </div>
      </Card>

      {/* Estados de Fallo (Rojo) */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Estados de Fallo
        </Typography>
        <Typography variant="body1" color="secondary" className="mb-6">
          Estados que indican procesos cancelados o con problemas. Color rojo para indicar atención requerida.
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="fallo">Cancelado</Chip>
            <div>
              <Typography variant="body2" weight="medium">Cancelado</Typography>
              <Typography variant="caption" color="secondary">Rojo</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="fallo">Alto</Chip>
            <div>
              <Typography variant="body2" weight="medium">Alto</Typography>
              <Typography variant="caption" color="secondary">Rojo</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="fallo">Crítico</Chip>
            <div>
              <Typography variant="body2" weight="medium">Crítico</Typography>
              <Typography variant="caption" color="secondary">Rojo</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="fallo">Inactivo</Chip>
            <div>
              <Typography variant="body2" weight="medium">Inactivo</Typography>
              <Typography variant="caption" color="secondary">Rojo</Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Chip variant="fallo">No Disponible</Chip>
            <div>
              <Typography variant="body2" weight="medium">No Disponible</Typography>
              <Typography variant="caption" color="secondary">Rojo</Typography>
            </div>
          </div>
        </div>
      </Card>

      {/* Tipos de Participante (Colores únicos) */}
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
            <Chip variant="accent-blue">Interno</Chip>
            <div>
              <Typography variant="body2" weight="medium">Interno</Typography>
              <Typography variant="caption" color="secondary">Azul</Typography>
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
          Cómo usar el sistema de estados agrupados en tu código.
        </Typography>
        
        <div className="bg-muted p-4 rounded-lg">
          <Typography variant="h5" weight="semibold" className="mb-2">
            Importar funciones:
          </Typography>
          <pre className="bg-background p-3 rounded text-sm overflow-x-auto">
{`import { 
  getChipVariant, 
  getChipText 
} from '../utils/chipUtils';`}
          </pre>
        </div>
        
        <div className="bg-muted p-4 rounded-lg mt-4">
          <Typography variant="h5" weight="semibold" className="mb-2">
            Uso en componentes:
          </Typography>
          <pre className="bg-background p-3 rounded text-sm overflow-x-auto">
{`// Para cualquier estado o tipo
<Chip 
  variant={getChipVariant(estado)}
>
  {getChipText(estado)}
</Chip>

// Ejemplos de uso
<Chip variant={getChipVariant('pendiente')}>Pendiente</Chip>
<Chip variant={getChipVariant('finalizado')}>Finalizado</Chip>
<Chip variant={getChipVariant('cancelado')}>Cancelado</Chip>
<Chip variant={getChipVariant('externo')}>Externo</Chip>`}
          </pre>
        </div>

        <div className="bg-muted p-4 rounded-lg mt-4">
          <Typography variant="h5" weight="semibold" className="mb-2">
            Estados incluidos en cada grupo:
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Typography variant="body2" weight="semibold" className="mb-2">Transitorios (Amarillo):</Typography>
              <ul className="text-sm text-muted-foreground space-y-1">
                {ESTADOS_TRANSITORIOS.map(estado => (
                  <li key={estado}>• {estado}</li>
                ))}
              </ul>
            </div>
            <div>
              <Typography variant="body2" weight="semibold" className="mb-2">Terminados (Verde):</Typography>
              <ul className="text-sm text-muted-foreground space-y-1">
                {ESTADOS_TERMINADOS.map(estado => (
                  <li key={estado}>• {estado}</li>
                ))}
              </ul>
            </div>
            <div>
              <Typography variant="body2" weight="semibold" className="mb-2">Fallo (Rojo):</Typography>
              <ul className="text-sm text-muted-foreground space-y-1">
                {ESTADOS_FALLO.map(estado => (
                  <li key={estado}>• {estado}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EstadosSection;
