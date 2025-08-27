import React from 'react';
import { Layout } from '../components/ui';
import Typography from '../components/ui/Typography';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { getRiesgoIconName } from '../utils/riesgoUtils';
import { getChipVariant, getChipText } from '../utils/chipUtils';

// Función para calcular el nivel de riesgo (igual que en investigaciones.tsx)
const calcularNivelRiesgo = (investigacion: any): {
  nivel: 'bajo' | 'medio' | 'alto' | 'completado' | 'sin_fecha';
  diasRestantes: number;
  descripcion: string;
} => {
  if (investigacion.estado === 'finalizado') {
    return {
      nivel: 'completado',
      diasRestantes: 0,
      descripcion: 'Investigación completada'
    };
  }

  if (investigacion.estado === 'cancelado') {
    return {
      nivel: 'completado',
      diasRestantes: 0,
      descripcion: 'Investigación cancelada'
    };
  }

  if (!investigacion.fecha_fin) {
    return {
      nivel: 'sin_fecha',
      diasRestantes: 0,
      descripcion: 'Sin fecha límite definida'
    };
  }

  const fechaFin = new Date(investigacion.fecha_fin);
  const fechaActual = new Date();
  const diasRestantes = Math.ceil((fechaFin.getTime() - fechaActual.getTime()) / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0) {
    return {
      nivel: 'alto',
      diasRestantes,
      descripcion: `Vencida hace ${Math.abs(diasRestantes)} días`
    };
  } else if (diasRestantes <= 7) {
    return {
      nivel: 'alto',
      diasRestantes,
      descripcion: `Vence en ${diasRestantes} días`
    };
  } else if (diasRestantes <= 30) {
    return {
      nivel: 'medio',
      diasRestantes,
      descripcion: `Vence en ${diasRestantes} días`
    };
  } else {
    return {
      nivel: 'bajo',
      diasRestantes,
      descripcion: `Vence en ${diasRestantes} días`
    };
  }
};



export default function TestRiesgoVisualPage() {
  // Datos de prueba
  const investigacionesPrueba = [
    {
      id: 1,
      nombre: 'Investigación Vencida',
      estado: 'en_progreso',
      fecha_fin: '2024-01-01'
    },
    {
      id: 2,
      nombre: 'Investigación Urgente',
      estado: 'en_progreso',
      fecha_fin: '2024-12-25'
    },
    {
      id: 3,
      nombre: 'Investigación Media',
      estado: 'en_progreso',
      fecha_fin: '2025-01-15'
    },
    {
      id: 4,
      nombre: 'Investigación Baja',
      estado: 'en_progreso',
      fecha_fin: '2025-03-01'
    },
    {
      id: 5,
      nombre: 'Investigación Completada',
      estado: 'finalizado',
      fecha_fin: '2024-12-01'
    },
    {
      id: 6,
      nombre: 'Investigación Sin Fecha',
      estado: 'en_progreso',
      fecha_fin: null
    }
  ];

  const RiesgoColumn = ({ investigacion }: { investigacion: any }) => {
    const riesgoInfo = calcularNivelRiesgo(investigacion);
            const badgeVariant = getChipVariant(riesgoInfo.nivel) as any;
    const iconName = getRiesgoIconName(riesgoInfo.nivel);

    // Mapeo de iconos por nombre
    const iconMap: { [key: string]: string } = {
      AlertTriangleIcon: '🔴',
      ExclamationTriangleIcon: '🟡',
      CheckCircleIcon: '🟢',
      QuestionMarkCircleIcon: '⚪'
    };

    const icon = iconMap[iconName] || '⚪';

    return (
      <div className="flex flex-col gap-1 py-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <Badge variant={badgeVariant} className="text-xs whitespace-nowrap">
                          {getChipText(riesgoInfo.nivel)}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {riesgoInfo.descripcion}
        </div>
      </div>
    );
  };

  return (
    <Layout rol="administrador">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <Typography variant="h1" color="title" weight="bold" className="mb-6">
            Test: Columna de Riesgo Visual
          </Typography>
          
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <Typography variant="h3" className="mb-2">📊 Formato de Columna:</Typography>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Línea 1:</strong> Icono + Badge con nivel de riesgo</li>
              <li>• <strong>Línea 2:</strong> Descripción con días restantes</li>
              <li>• <strong>Ancho:</strong> min-w-[160px] para evitar cortes</li>
              <li>• <strong>Texto:</strong> whitespace-nowrap para no partir</li>
            </ul>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground w-80">
                      Investigación
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground min-w-[120px]">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground min-w-[160px]">
                      Nivel de Riesgo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground min-w-[120px]">
                      Fecha Fin
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                  {investigacionesPrueba.map((investigacion) => (
                    <tr key={investigacion.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{investigacion.nombre}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={getChipVariant(investigacion.estado) as any}>
                          {investigacion.estado}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <RiesgoColumn investigacion={investigacion} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {investigacion.fecha_fin ? 
                          new Date(investigacion.fecha_fin).toLocaleDateString() : 
                          'Sin fecha'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <Typography variant="h3" className="mb-2">✅ Verificaciones:</Typography>
            <ul className="space-y-1 text-sm">
              <li>• La información no se corta horizontalmente</li>
              <li>• El nivel de riesgo aparece en la línea superior</li>
              <li>• La descripción aparece debajo del nivel</li>
              <li>• Los colores corresponden al nivel de riesgo</li>
              <li>• La tabla se puede desplazar horizontalmente si es necesario</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
} 