import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout, PageHeader, InfoContainer, InfoItem } from '../../components/ui';
import Typography from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import Chip from '../../components/ui/Chip';
import { SideModal, Input, Textarea, Select, ConfirmModal, EmptyState } from '../../components/ui';
import { ArrowLeftIcon, EditIcon, BuildingIcon, UsersIcon, UserIcon, EmailIcon, CalendarIcon, PlusIcon, MessageIcon, AlertTriangleIcon, BarChartIcon, TrendingUpIcon, ClockIcon, EyeIcon, TrashIcon, CheckIcon, CheckCircleIcon, RefreshIcon, SearchIcon, FilterIcon, MoreVerticalIcon, FileTextIcon } from '../../components/icons';
import SimpleAvatar from '../../components/ui/SimpleAvatar';
import { formatearFecha } from '../../utils/fechas';
import { getEstadoParticipanteVariant, getEstadoReclutamientoVariant } from '../../utils/estadoUtils';
import { getChipVariant, getEstadoDolorVariant, getSeveridadVariant, getEstadoDolorText } from '../../utils/chipUtils';
import { getTipoParticipanteVariant } from '../../utils/tipoParticipanteUtils';

interface Participante {
  id: string;
  nombre: string;
  email: string;
  tipo: 'externo' | 'interno' | 'friend_family';
  empresa_nombre?: string;
  rol_empresa?: string;
  departamento_nombre?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  estado?: string;
  created_at?: string;
  updated_at?: string;
}

interface Reclutamiento {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  meet_link?: string;
  estado: string;
  participante?: Participante;
  reclutador?: {
    id: string;
    nombre: string;
    email: string;
  };
}

export default function SesionActivaPage() {
  const router = useRouter();
  const { id } = router.query;
  const [participante, setParticipante] = useState<Participante | null>(null);
  const [reclutamiento, setReclutamiento] = useState<Reclutamiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('participante');

  // Cargar datos del participante y reclutamiento
  useEffect(() => {
    if (id) {
      loadParticipantData();
    }
  }, [id]);

  const loadParticipantData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del participante
      const participanteResponse = await fetch(`/api/participantes/${id}`);
      if (participanteResponse.ok) {
        const participanteData = await participanteResponse.json();
        setParticipante(participanteData);
      }

      // Cargar datos del reclutamiento actual
      const reclutamientoResponse = await fetch(`/api/participantes/${id}/reclutamiento-actual`);
      if (reclutamientoResponse.ok) {
        const reclutamientoData = await reclutamientoResponse.json();
        setReclutamiento(reclutamientoData);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSessions = () => {
    router.push('/sesiones');
  };

  const handleSaveAndViewSession = async () => {
    try {
      // Redirigir a la vista de la sesión
      if (participante?.id) {
        router.push(`/participacion/${participante.id}`);
      } else {
        alert('❌ No se pudo obtener el ID del participante');
      }
      
    } catch (error) {
      console.error('❌ Error redirigiendo:', error);
      alert('❌ Error al redirigir. Intenta nuevamente.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Typography variant="body1" className="text-gray-600">
              Cargando sesión...
            </Typography>
          </div>
        </div>
      </Layout>
    );
  }

  if (!participante || !reclutamiento) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <Typography variant="h3" className="text-gray-900 mb-2">
              Sesión no encontrada
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-4">
              No se pudo cargar la información de la sesión
            </Typography>
            <Button onClick={handleBackToSessions} variant="secondary">
              Volver a Sesiones
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    {
      id: 'participante',
      label: 'Información del Participante',
      content: (
        <div className="space-y-6">
          {participante ? (
            <>
              {/* Información básica */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <UserIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <Typography variant="h3" className="text-gray-900">
                      Información Básica
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Datos principales del participante
                    </Typography>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Nombre</Typography>
                      <Typography variant="body1" className="text-gray-900 font-medium">
                        {participante.nombre}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Email</Typography>
                      <Typography variant="body1" className="text-gray-900">
                        {participante.email}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Teléfono</Typography>
                      <Typography variant="body1" className="text-gray-900">
                        {participante.telefono || 'No disponible'}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Tipo</Typography>
                      <Chip variant={getTipoParticipanteVariant(participante.tipo)} size="sm">
                        {participante.tipo}
                      </Chip>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Estado</Typography>
                      <Chip variant={getEstadoParticipanteVariant(participante.estado)} size="sm">
                        {participante.estado || 'Activo'}
                      </Chip>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Fecha de registro</Typography>
                      <Typography variant="body1" className="text-gray-900">
                        {participante.created_at ? formatearFecha(participante.created_at) : 'No disponible'}
                      </Typography>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Información de empresa (si aplica) */}
              {participante.empresa_nombre && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <BuildingIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <Typography variant="h3" className="text-gray-900">
                        Información de Empresa
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Datos laborales del participante
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Typography variant="body2" className="text-gray-500 mb-1">Empresa</Typography>
                        <Typography variant="body1" className="text-gray-900 font-medium">
                          {participante.empresa_nombre}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" className="text-gray-500 mb-1">Rol</Typography>
                        <Typography variant="body1" className="text-gray-900">
                          {participante.rol_empresa || 'No especificado'}
                        </Typography>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Typography variant="body2" className="text-gray-500 mb-1">Departamento</Typography>
                        <Typography variant="body1" className="text-gray-900">
                          {participante.departamento_nombre || 'No especificado'}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <EmptyState
              icon={<UserIcon className="w-12 h-12 text-gray-400" />}
              title="Participante no encontrado"
              description="No se pudo cargar la información del participante"
            />
          )}
        </div>
      )
    },
    {
      id: 'reclutamiento',
      label: 'Información del Reclutamiento',
      content: (
        <div className="space-y-6">
          {reclutamiento ? (
            <>
              {/* Información del reclutamiento */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CalendarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <Typography variant="h3" className="text-gray-900">
                      Detalles del Reclutamiento
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Información de la sesión programada
                    </Typography>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Título</Typography>
                      <Typography variant="body1" className="text-gray-900 font-medium">
                        {reclutamiento.titulo}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Fecha</Typography>
                      <Typography variant="body1" className="text-gray-900">
                        {formatearFecha(reclutamiento.fecha)}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Estado</Typography>
                      <Chip variant={getEstadoReclutamientoVariant(reclutamiento.estado)} size="sm">
                        {reclutamiento.estado}
                      </Chip>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {reclutamiento.reclutador && (
                      <div>
                        <Typography variant="body2" className="text-gray-500 mb-1">Reclutador</Typography>
                        <Typography variant="body1" className="text-gray-900">
                          {reclutamiento.reclutador.nombre}
                        </Typography>
                      </div>
                    )}
                    {reclutamiento.meet_link && (
                      <div>
                        <Typography variant="body2" className="text-gray-500 mb-1">Enlace de Meet</Typography>
                        <a 
                          href={reclutamiento.meet_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Abrir en Google Meet
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                {reclutamiento.descripcion && (
                  <div className="mt-6">
                    <Typography variant="body2" className="text-gray-500 mb-2">Descripción</Typography>
                    <Typography variant="body1" className="text-gray-900">
                      {reclutamiento.descripcion}
                    </Typography>
                  </div>
                )}
              </Card>
            </>
          ) : (
            <EmptyState
              icon={<CalendarIcon className="w-12 h-12 text-gray-400" />}
              title="Reclutamiento no encontrado"
              description="No se pudo cargar la información del reclutamiento"
            />
          )}
        </div>
      )
    }
  ];

  return (
    <Layout>
      <PageHeader
        title="Sesión Activa"
        subtitle={`Participante: ${participante.nombre}`}
      />

      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleBackToSessions} variant="secondary" className="flex items-center gap-2">
          <ArrowLeftIcon className="w-4 h-4" />
          Volver a Sesiones
        </Button>
        <Button onClick={handleSaveAndViewSession} variant="primary" className="flex items-center gap-2">
          <EyeIcon className="w-4 h-4" />
          Ver Participación
        </Button>
      </div>

      <div className="space-y-6">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </Layout>
  );
}