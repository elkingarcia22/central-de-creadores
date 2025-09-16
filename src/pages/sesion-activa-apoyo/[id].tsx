import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout, PageHeader, Tabs, Card, Typography, Button, Chip } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircleIcon, ClockIcon, UserIcon, VideoIcon, HelpIcon, ArrowLeftIcon, MoreVerticalIcon, MessageIcon, AlertTriangleIcon, FileTextIcon, BarChartIcon, TrendingUpIcon, EyeIcon, TrashIcon, CheckIcon, RefreshIcon, SearchIcon, FilterIcon, AIIcon, MicIcon, UsersIcon } from '../../components/icons';
import { getTipoParticipanteVariant } from '../../utils/tipoParticipanteUtils';
import { getEstadoParticipanteVariant } from '../../utils/estadoUtils';
import { getChipText } from '../../utils/chipUtils';
import { useWebSpeechTranscriptionSimple } from '../../hooks/useWebSpeechTranscriptionSimple';
import { NotasManualesContent } from '../../components/notas/NotasManualesContent';
import { NotasAutomaticasContent } from '../../components/transcripciones/NotasAutomaticasContent';
import { PerfilamientosTab } from '../../components/participantes/PerfilamientosTab';
import DoloresUnifiedContainer from '../../components/dolores/DoloresUnifiedContainer';
import { InfoContainer, InfoItem } from '../../components/ui/InfoContainer';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import SimpleAvatar from '../../components/ui/SimpleAvatar';
import { formatearFecha } from '../../utils/fechas';

interface SesionApoyoData {
  id: string;
  meet_link: string;
  titulo: string;
  fecha: string;
  moderador_id: string;
  moderador_nombre: string;
  objetivo_sesion: string;
  observadores: string[];
  tipo: 'apoyo';
  // Información del participante
  participante?: {
    id: string;
    nombre: string;
    email: string;
    tipo: 'externo' | 'interno' | 'friend_family';
  };
  tipo_participante?: 'externo' | 'interno' | 'friend_family';
}

interface Usuario {
  id: string;
  full_name: string;
  email: string;
  foto_url?: string;
}

interface Participante {
  id: string;
  nombre: string;
  email: string;
  tipo: 'externo' | 'interno' | 'friend_family';
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  estado_participante?: string;
  empresa_nombre?: string;
  rol_empresa?: string;
  departamento_nombre?: string;
  comentarios?: string;
  doleres_necesidades?: string;
  total_participaciones?: number;
  fecha_ultima_participacion?: string;
  created_at?: string;
  updated_at?: string;
}

interface Empresa {
  id: string;
  nombre: string;
  descripcion?: string;
}

export default function SesionActivaApoyoPage() {
  const router = useRouter();
  const { id } = router.query;
  const { showSuccess, showError } = useToast();
  
  const [sesionApoyo, setSesionApoyo] = useState<SesionApoyoData | null>(null);
  const [moderador, setModerador] = useState<Usuario | null>(null);
  const [observadores, setObservadores] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notas-manuales');
  
  // Estados para acciones
  const [isRecording, setIsRecording] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
  const [showCrearDolorModal, setShowCrearDolorModal] = useState(false);
  
  // Estados para tabs
  const [participante, setParticipante] = useState<Participante | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [empresaData, setEmpresaData] = useState<any>(null);
  const [investigaciones, setInvestigaciones] = useState<any[]>([]);
  const [participacionesPorMes, setParticipacionesPorMes] = useState<{ [key: string]: number }>({});
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  // Hook para transcripción de audio
  const audioTranscription = useWebSpeechTranscriptionSimple();

  useEffect(() => {
    if (id) {
      loadSesionApoyoData();
    }
  }, [id]);

  // Cerrar menú de acciones cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionsMenu) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setShowActionsMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  const loadSesionApoyoData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de la sesión de apoyo desde localStorage
      const currentSesionApoyo = localStorage.getItem('currentSesionApoyo');
      if (currentSesionApoyo) {
        try {
          const sesionData = JSON.parse(currentSesionApoyo);
          setSesionApoyo(sesionData);
          
          // Cargar información del participante
          if (sesionData.participante) {
            setParticipante(sesionData.participante);
          }
          
          // Cargar información del moderador
          await loadModeradorData(sesionData.moderador_id);
          
          // Cargar información de los observadores
          if (sesionData.observadores && sesionData.observadores.length > 0) {
            await loadObservadoresData(sesionData.observadores);
          }
          
          // Cargar usuarios para los tabs
          await loadUsuarios();
          
          // Cargar investigaciones para el tab de información del participante
          await loadInvestigacionesData();
          
        } catch (error) {
          console.error('🔍 Error parseando sesión de apoyo desde localStorage:', error);
          showError('Error al cargar los datos de la sesión de apoyo');
        }
      } else {
        console.log('🔍 No hay sesión de apoyo en localStorage');
        showError('No se encontraron datos de la sesión de apoyo');
      }
    } catch (error) {
      console.error('Error cargando datos de sesión de apoyo:', error);
      showError('Error al cargar los datos de la sesión');
    } finally {
      setLoading(false);
    }
  };

  const loadModeradorData = async (moderadorId: string) => {
    try {
      const response = await fetch(`/api/usuarios/${moderadorId}`);
      if (response.ok) {
        const data = await response.json();
        setModerador(data);
      }
    } catch (error) {
      console.error('Error cargando datos del moderador:', error);
    }
  };

  const loadObservadoresData = async (observadoresIds: string[]) => {
    try {
      const observadoresData = [];
      for (const observadorId of observadoresIds) {
        const response = await fetch(`/api/usuarios/${observadorId}`);
        if (response.ok) {
          const data = await response.json();
          observadoresData.push(data);
        }
      }
      setObservadores(observadoresData);
    } catch (error) {
      console.error('Error cargando datos de observadores:', error);
    }
  };

  const loadUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data.usuarios || []);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const loadInvestigacionesData = async () => {
    try {
      console.log('🔍 Cargando investigaciones para participante:', id);
      const response = await fetch(`/api/participantes/${id}/investigaciones`);
      if (response.ok) {
        const data = await response.json();
        setInvestigaciones(data.investigaciones || []);
        
        // Calcular participaciones por mes
        const participacionesPorMes: { [key: string]: number } = {};
        (data.investigaciones || []).forEach((inv: any) => {
          if (inv.fecha_participacion) {
            const mes = inv.fecha_participacion.slice(0, 7); // YYYY-MM
            participacionesPorMes[mes] = (participacionesPorMes[mes] || 0) + 1;
          }
        });
        setParticipacionesPorMes(participacionesPorMes);
        
        console.log('🔍 Investigaciones cargadas:', data.investigaciones?.length || 0);
        console.log('🔍 Participaciones por mes:', participacionesPorMes);
      }
    } catch (error) {
      console.error('Error cargando investigaciones:', error);
    }
  };

  const formatFecha = (fecha: string) => {
    try {
      const fechaObj = new Date(fecha);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(fechaObj);
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const handleBackToSessions = () => {
    router.push('/sesiones');
  };

  const handleToggleRecording = async () => {
    try {
      if (audioTranscription.state.isRecording) {
        console.log('🛑 Deteniendo grabación...');
        audioTranscription.stopRecording();
        setIsRecording(false);
      } else {
        console.log('🎤 Iniciando grabación...');
        setIsRecording(true);
        audioTranscription.startRecording();
      }
    } catch (error) {
      console.error('❌ Error en grabación:', error);
      setIsRecording(false);
    }
  };

  const handleSaveAndViewSession = async () => {
    try {
      // Actualizar el estado de la sesión de apoyo a "En progreso"
      if (sesionApoyo?.id) {
        const response = await fetch(`/api/sesiones-apoyo/${sesionApoyo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estado: 'en_curso'
          })
        });

        if (response.ok) {
          showSuccess('Sesión guardada exitosamente');
        } else {
          showError('Error al guardar la sesión');
        }
      }
    } catch (error) {
      console.error('❌ Error guardando sesión:', error);
      showError('Error al guardar la sesión');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <Typography variant="body1" color="secondary">
                Cargando sesión de apoyo...
              </Typography>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!sesionApoyo) {
    return (
      <Layout>
        <div className="py-8">
          <div className="text-center py-12">
            <HelpIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <Typography variant="h3" className="mb-2">
              Sesión de apoyo no encontrada
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              No se pudieron cargar los datos de la sesión de apoyo
            </Typography>
            <Button onClick={handleBackToSessions} variant="primary">
              Volver a Sesiones
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Componente para el contenido del tab de Información
  const InformacionContent: React.FC<{ 
    participante: Participante; 
    empresa?: Empresa;
    investigaciones: any[];
    participacionesPorMes: { [key: string]: number };
  }> = ({ participante, empresa, investigaciones, participacionesPorMes }) => {
    // Debug: Log de datos recibidos
    console.log('🔍 InformacionContent - investigaciones recibidas:', investigaciones);
    console.log('🔍 InformacionContent - participacionesPorMes recibidas:', participacionesPorMes);
    console.log('🔍 InformacionContent - participante recibido:', participante);
    
    const totalInvestigaciones = investigaciones.length;
    const investigacionesFinalizadas = investigaciones.filter(inv => 
      inv.estado === 'finalizada' || inv.estado === 'completada'
    ).length;
    const investigacionesEnProgreso = investigaciones.filter(inv => 
      inv.estado === 'en_progreso' || inv.estado === 'activa'
    ).length;
    
    const tiempoTotalHoras = investigaciones.reduce((total, inv) => {
      if (inv.duracion_sesion) {
        const duracion = parseInt(inv.duracion_sesion);
        return total + (isNaN(duracion) ? 0 : duracion);
      }
      return total;
    }, 0) / 60; // Convertir minutos a horas
    
    console.log('🔍 InformacionContent - Métricas calculadas:', {
      totalInvestigaciones,
      investigacionesFinalizadas,
      investigacionesEnProgreso,
      tiempoTotalHoras
    });

    return (
      <div className="space-y-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Investigaciones */}
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                  <AnimatedCounter
                    value={totalInvestigaciones}
                    duration={2000}
                    className="text-gray-700 dark:text-gray-200"
                  />
                    </Typography>
                <Typography variant="body2" color="secondary">
                  Total
                  </Typography>
                </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <FileTextIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                </div>
              </Card>

          {/* Investigaciones Finalizadas */}
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                  <AnimatedCounter
                    value={investigacionesFinalizadas}
                    duration={2000}
                    className="text-gray-700 dark:text-gray-200"
                  />
                </Typography>
                <Typography variant="body2" color="secondary">
                  Finalizadas
              </Typography>
                  </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <BarChartIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </Card>

          {/* Investigaciones En Progreso */}
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
                  <div>
                <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                  <AnimatedCounter
                    value={investigacionesEnProgreso}
                    duration={2000}
                    className="text-gray-700 dark:text-gray-200"
                  />
                    </Typography>
                <Typography variant="body2" color="secondary">
                  En Progreso
                    </Typography>
                  </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <UsersIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                </div>
              </Card>
                
          {/* Tiempo Total Estimado */}
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
                    <div>
                <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                  <AnimatedCounter 
                    value={tiempoTotalHoras} 
                    duration={2000}
                    className="text-gray-700 dark:text-gray-200"
                    suffix="h"
                  />
                      </Typography>
                <Typography variant="body2" color="secondary">
                  Tiempo Total
                      </Typography>
                    </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
            </div>
          </Card>
                  </div>
                  
        {/* Información adicional */}
        <InfoContainer 
          title="Resumen de Participación"
          icon={<UserIcon className="w-4 h-4" />}
        >
          <InfoItem 
            label="Última Participación" 
            value={
              (() => {
                if (investigaciones.length > 0) {
                  const investigacionesOrdenadas = investigaciones.sort((a, b) => 
                    new Date(b.fecha_participacion).getTime() - new Date(a.fecha_participacion).getTime()
                  );
                  return formatearFecha(investigacionesOrdenadas[0].fecha_participacion);
                }
                return participante.fecha_ultima_participacion ? 
                  formatearFecha(participante.fecha_ultima_participacion) : 
                  'Sin participaciones';
              })()
            }
          />
          <InfoItem 
            label="Participaciones del Mes" 
            value={
              (() => {
                const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
                const participacionesMesActual = participacionesPorMes[mesActual] || 0;
                const nombreMes = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                return `${participacionesMesActual} en ${nombreMes}`;
              })()
            }
          />
        </InfoContainer>

        {/* Información del Participante */}
        <InfoContainer 
          title="Información del Participante"
          icon={<UserIcon className="w-4 h-4" />}
        >
          <InfoItem 
            label="Nombre Completo"
            value={participante.nombre}
          />
          <InfoItem 
            label="Email"
            value={participante.email}
          />
          <InfoItem 
            label="Tipo de Participante"
            value={
              <Chip 
                variant={getTipoParticipanteVariant(participante.tipo as any)}
                size="sm"
              >
                {participante.tipo === 'externo' ? 'Externo' : 
                 participante.tipo === 'interno' ? 'Interno' : 'Friend & Family'}
                      </Chip>
            }
          />
          <InfoItem 
            label="Estado"
            value={
              <Chip 
                variant={getEstadoParticipanteVariant(participante.estado_participante || 'disponible')}
                size="sm"
              >
                {getChipText(participante.estado_participante || 'disponible')}
                      </Chip>
            }
          />
          <InfoItem 
            label="Total de Participaciones"
            value={participante.total_participaciones?.toString() || '0'}
          />
          <InfoItem 
            label="Última Participación"
            value={
              participante.fecha_ultima_participacion ? 
              formatearFecha(participante.fecha_ultima_participacion) : 
              'Sin participaciones'
            }
          />
          <InfoItem 
            label="Fecha de Registro"
            value={formatearFecha(participante.created_at)}
          />
          <InfoItem 
            label="Última Actualización"
            value={formatearFecha(participante.updated_at)}
          />
        </InfoContainer>

        {/* Información adicional */}
        {participante.comentarios && (
          <InfoContainer 
            title="Comentarios"
            icon={<MessageIcon className="w-4 h-4" />}
            variant="bordered"
            padding="md"
          >
            <div className="col-span-full">
              <Typography variant="body2" color="secondary">
                {participante.comentarios}
                      </Typography>
                    </div>
          </InfoContainer>
        )}

        {participante.doleres_necesidades && (
          <InfoContainer 
            title="Dolores y Necesidades"
            icon={<AlertTriangleIcon className="w-4 h-4" />}
            variant="bordered"
            padding="md"
          >
            <div className="col-span-full">
              <Typography variant="body2" color="secondary">
                {participante.doleres_necesidades}
                      </Typography>
                    </div>
          </InfoContainer>
        )}

                  </div>
    );
  };

  const tabs = [
    {
      id: 'notas-manuales',
      label: 'Notas Manuales',
      content: <NotasManualesContent 
        participanteId={participante?.id || ''}
        sesionId={sesionApoyo?.id || ''}
      />
    },
    {
      id: 'informacion',
      label: 'Información de Participante',
      content: <InformacionContent 
        participante={participante!} 
        empresa={empresa} 
        investigaciones={investigaciones}
        participacionesPorMes={participacionesPorMes}
      />
    }
  ];

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToSessions}
              className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <PageHeader
              title="Sesión Activa"
              variant="compact"
              color="blue"
              className="mb-0"
              chip={{
                label: sesionApoyo.participante?.nombre || 'Sin participante',
                variant: getTipoParticipanteVariant(sesionApoyo.tipo_participante || 'externo'),
                size: 'sm'
              }}
            />
          </div>
          
          {/* Acciones principales */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleToggleRecording}
              variant={audioTranscription.state.isRecording ? "destructive" : "outline"}
              size="md"
              className="flex items-center gap-2"
              disabled={audioTranscription.state.isProcessing}
            >
              {audioTranscription.state.isProcessing ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : audioTranscription.state.isRecording ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Detener Grabación
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Grabar
                </>
              )}
            </Button>
            <Button 
              onClick={handleSaveAndViewSession}
              variant="primary"
              size="md"
            >
              Guardar
            </Button>
            
            {/* Menú de acciones con 3 puntos */}
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="w-10 h-10 rounded-md border border-border bg-card text-card-foreground hover:bg-accent flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                aria-label="Más opciones"
              >
                <MoreVerticalIcon className="w-4 h-4" />
              </button>
              
              {/* Menú desplegable */}
              {showActionsMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowSeguimientoModal(true);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-card-foreground hover:bg-accent flex items-center gap-3"
                    >
                      <MessageIcon className="w-4 h-4" />
                      Crear Seguimiento
                    </button>
                    <button
                      onClick={() => {
                        setShowCrearDolorModal(true);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-card-foreground hover:bg-accent flex items-center gap-3"
                    >
                      <AlertTriangleIcon className="w-4 h-4" />
                      Crear Dolor
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="underline"
          />
        </div>
      </div>
    </Layout>
  );
}
