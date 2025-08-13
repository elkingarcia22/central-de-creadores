import { useState, useEffect } from 'react';
import { obtenerInvestigaciones } from '../api/supabase-investigaciones';
import { Layout } from '../components/ui';
import Badge from '../components/ui/Badge';
import Typography from '../components/ui/Typography';
import { getRiesgoBadgeVariant, getRiesgoIconName, getRiesgoText } from '../utils/riesgoUtils';
import { getEstadoInvestigacionVariant } from '../utils/estadoUtils';

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



export default function TestRiesgoAutomaticoPage() {
  const [investigaciones, setInvestigaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await obtenerInvestigaciones();
        setInvestigaciones(response.data || []);
      } catch (error) {
        console.error('Error al obtener investigaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout rol="administrador">
        <div className="p-8">
          <div className="text-center">Cargando investigaciones...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout rol="administrador">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <Typography variant="h1" color="title" weight="bold" className="mb-6">
            Test: Sistema de Riesgo Automático
          </Typography>
          
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <Typography variant="h3" className="mb-2">📊 Lógica del Sistema:</Typography>
            <ul className="space-y-1 text-sm">
              <li>🔴 <strong>Alto:</strong> Vencida o vence en ≤ 7 días</li>
              <li>🟡 <strong>Medio:</strong> Vence en 8-30 días</li>
              <li>🟢 <strong>Bajo:</strong> Vence en &gt; 30 días</li>
              <li>✅ <strong>Completado:</strong> Finalizada o cancelada</li>
              <li>⚪ <strong>Sin fecha:</strong> No tiene fecha límite</li>
            </ul>
          </div>

          <div className="space-y-4">
            {investigaciones.map((investigacion) => {
              const riesgoInfo = calcularNivelRiesgo(investigacion);
              const badgeVariant = getRiesgoBadgeVariant(riesgoInfo.nivel);
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
                <div key={investigacion.id} className="border border-border rounded-lg p-4 bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Typography variant="h3" className="mb-2">
                        {investigacion.nombre}
                      </Typography>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Estado:</span>
                          <div className="mt-1">
                            <Badge variant={getEstadoInvestigacionVariant(investigacion.estado)}>
                              {investigacion.estado}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Fecha Fin:</span>
                          <div className="mt-1">
                            {investigacion.fecha_fin ? 
                              new Date(investigacion.fecha_fin).toLocaleDateString() : 
                              'Sin fecha'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Días Restantes:</span>
                          <div className="mt-1">
                            {riesgoInfo.diasRestantes !== 0 ? riesgoInfo.diasRestantes : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Nivel de Riesgo:</span>
                          <div className="mt-1 flex items-center gap-2">
                            <span>{icon}</span>
                            <Badge variant={badgeVariant} className="text-xs">
                              {getRiesgoText(riesgoInfo.nivel)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {riesgoInfo.descripcion}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {investigaciones.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay investigaciones para mostrar
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 