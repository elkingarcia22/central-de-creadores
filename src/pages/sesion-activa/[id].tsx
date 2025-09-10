import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout, PageHeader, InfoContainer, InfoItem } from '../../components/ui';
import Typography from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import { SideModal, Input, Textarea, Select, ConfirmModal, EmptyState } from '../../components/ui';
import { ArrowLeftIcon, EditIcon, BuildingIcon, UsersIcon, UserIcon, EmailIcon, CalendarIcon, PlusIcon, MessageIcon, AlertTriangleIcon, BarChartIcon, TrendingUpIcon, ClockIcon, EyeIcon, TrashIcon, CheckIcon, CheckCircleIcon, RefreshIcon, SearchIcon, FilterIcon, MoreVerticalIcon, FileTextIcon, MicIcon } from '../../components/icons';
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
  const [transcription, setTranscription] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('notas');

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

  const handleStartRecording = () => {
    setIsRecording(true);
    // Aquí implementarías la lógica de grabación
    console.log('Iniciando grabación...');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Aquí implementarías la lógica para detener la grabación
    console.log('Deteniendo grabación...');
  };

  const handleSaveTranscription = () => {
    if (transcription.trim()) {
      // Aquí implementarías la lógica para guardar la transcripción
      console.log('Guardando transcripción:', transcription);
      alert('Transcripción guardada exitosamente');
    }
  };

  const handleBackToSessions = () => {
    router.push('/sesiones');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Typography variant="body2" className="text-gray-600">
              Cargando sesión activa...
            </Typography>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    {
      id: 'notas',
      label: 'Notas Automáticas',
      content: (
        <div className="space-y-6">
          {/* Estado de la sesión */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MicIcon className="w-5 h-5 text-blue-600" />
                <Typography variant="h3" className="text-gray-900">
                  Sesión Activa
                </Typography>
              </div>
              <Badge variant={isRecording ? 'success' : 'secondary'}>
                {isRecording ? 'Grabando' : 'Inactivo'}
              </Badge>
            </div>

            {reclutamiento?.meet_link && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <Typography variant="body2" className="text-blue-800">
                  <strong>Enlace de Meet:</strong> {reclutamiento.meet_link}
                </Typography>
              </div>
            )}

            {/* Controles de grabación */}
            <div className="flex space-x-3 mb-6">
              {!isRecording ? (
                <Button
                  onClick={handleStartRecording}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <MicIcon className="h-4 w-4" />
                  Iniciar Grabación
                </Button>
              ) : (
                <Button
                  onClick={handleStopRecording}
                  variant="danger"
                  className="flex items-center gap-2"
                >
                  <MicIcon className="h-4 w-4" />
                  Detener Grabación
                </Button>
              )}
            </div>

            {/* Campo de transcripción */}
            <div className="space-y-4">
              <div>
                <Typography variant="h4" className="text-gray-900 mb-2">
                  Transcripción Manual
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-4">
                  Puedes escribir o pegar la transcripción de la sesión aquí
                </Typography>
              </div>

              <Textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="Escribe o pega aquí la transcripción de la sesión..."
                rows={12}
                className="w-full"
              />

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveTranscription}
                  variant="primary"
                  disabled={!transcription.trim()}
                >
                  Guardar Transcripción
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    },
    {
      id: 'participante',
      label: 'Información del Participante',
      content: (
        <div className="space-y-6">
          {participante ? (
            <>
              {/* Información básica */}
              <InfoContainer 
                title="Información Básica"
                icon={<UserIcon className="w-4 h-4" />}
              >
                <InfoItem label="Nombre" value={participante.nombre} />
                <InfoItem label="Email" value={participante.email} />
                <InfoItem label="Teléfono" value={participante.telefono || 'No disponible'} />
                <InfoItem label="Tipo" value={
                  <Badge variant={getTipoParticipanteVariant(participante.tipo)}>
                    {participante.tipo}
                  </Badge>
                } />
                <InfoItem label="Estado" value={
                  <Badge variant={getEstadoParticipanteVariant(participante.estado)}>
                    {participante.estado}
                  </Badge>
                } />
              </InfoContainer>

              {/* Información de empresa */}
              {participante.empresa_nombre && (
                <InfoContainer 
                  title="Información de Empresa"
                  icon={<BuildingIcon className="w-4 h-4" />}
                >
                  <InfoItem label="Empresa" value={participante.empresa_nombre} />
                  <InfoItem label="Rol" value={participante.rol_empresa || 'No disponible'} />
                  <InfoItem label="Departamento" value={participante.departamento_nombre || 'No disponible'} />
                </InfoContainer>
              )}

              {/* Fechas */}
              <InfoContainer 
                title="Fechas"
                icon={<ClockIcon className="w-4 h-4" />}
              >
                <InfoItem label="Fecha de Nacimiento" value={participante.fecha_nacimiento ? formatearFecha(participante.fecha_nacimiento) : 'No disponible'} />
                <InfoItem label="Fecha de Creación" value={participante.created_at ? formatearFecha(participante.created_at) : 'No disponible'} />
                <InfoItem label="Última Actualización" value={participante.updated_at ? formatearFecha(participante.updated_at) : 'No disponible'} />
              </InfoContainer>
            </>
          ) : (
            <EmptyState
              icon={<UserIcon className="w-8 h-8" />}
              title="Participante no encontrado"
              description="No se pudo cargar la información del participante."
            />
          )}
        </div>
      )
    },
    {
      id: 'sesion',
      label: 'Información de la Sesión',
      content: (
        <div className="space-y-6">
          {reclutamiento ? (
            <>
              {/* Información de la sesión */}
              <InfoContainer 
                title="Detalles de la Sesión"
                icon={<CalendarIcon className="w-4 h-4" />}
              >
                <InfoItem label="Título" value={reclutamiento.titulo} />
                <InfoItem label="Descripción" value={reclutamiento.descripcion || 'No disponible'} />
                <InfoItem label="Fecha" value={formatearFecha(reclutamiento.fecha)} />
                <InfoItem label="Estado" value={
                  <Badge variant={getEstadoReclutamientoVariant(reclutamiento.estado)}>
                    {reclutamiento.estado}
                  </Badge>
                } />
                <InfoItem label="Enlace de Meet" value={
                  reclutamiento.meet_link ? (
                    <a 
                      href={reclutamiento.meet_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {reclutamiento.meet_link}
                    </a>
                  ) : 'No disponible'
                } />
              </InfoContainer>

              {/* Información del reclutador */}
              {reclutamiento.reclutador && (
                <InfoContainer 
                  title="Reclutador"
                  icon={<UsersIcon className="w-4 h-4" />}
                >
                  <InfoItem label="Nombre" value={reclutamiento.reclutador.nombre} />
                  <InfoItem label="Email" value={reclutamiento.reclutador.email} />
                </InfoContainer>
              )}
            </>
          ) : (
            <EmptyState
              icon={<CalendarIcon className="w-8 h-8" />}
              title="Sesión no encontrada"
              description="No se pudo cargar la información de la sesión."
            />
          )}
        </div>
      )
    }
  ];

  return (
    <Layout>
      <PageHeader
        title={`Sesión Activa: ${reclutamiento?.titulo || 'Cargando...'}`}
        subtitle={participante?.nombre ? `Participante: ${participante.nombre}` : 'Cargando participante...'}
        onBack={handleBackToSessions}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={isRecording ? 'success' : 'secondary'}>
              {isRecording ? 'Grabando' : 'Inactivo'}
            </Badge>
          </div>
        }
      />

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
