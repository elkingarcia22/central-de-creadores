import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout, PageHeader, Tabs, Card, Typography, Button, Chip } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircleIcon, ClockIcon, UserIcon, VideoIcon, HelpIcon, ArrowLeftIcon, MoreVerticalIcon, MessageIcon, AlertTriangleIcon, FileTextIcon, BarChartIcon, TrendingUpIcon, EyeIcon, TrashIcon, CheckIcon, RefreshIcon, SearchIcon, FilterIcon, AIIcon, MicIcon } from '../../components/icons';
import { getTipoParticipanteVariant } from '../../utils/tipoParticipanteUtils';
import { useWebSpeechTranscriptionSimple } from '../../hooks/useWebSpeechTranscriptionSimple';
import { NotasManualesContent } from '../../components/notas/NotasManualesContent';
import { NotasAutomaticasContent } from '../../components/transcripciones/NotasAutomaticasContent';
import { PerfilamientosTab } from '../../components/participantes/PerfilamientosTab';
import DoloresUnifiedContainer from '../../components/dolores/DoloresUnifiedContainer';
import InfoContainer from '../../components/ui/InfoContainer';
import InfoItem from '../../components/ui/InfoItem';
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
          console.log('🔍 Datos de sesión de apoyo desde localStorage:', sesionData);
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

  const tabs = [
    {
      id: 'notas-manuales',
      label: 'Notas Manuales',
      content: (() => {
        console.log('🔍 [SESION APOYO] Datos para NotasManualesContent:', {
          participante,
          participanteId: participante?.id,
          sesionApoyo,
          sesionId: sesionApoyo?.id
        });
        return <NotasManualesContent 
          participanteId={participante?.id || ''}
          sesionId={sesionApoyo?.id || ''}
        />;
      })()
    },
    {
      id: 'placeholder',
      label: 'Placeholder',
      content: (
        <div className="space-y-6">
          <Card padding="lg">
            <div className="space-y-4">
              <div>
                <Typography variant="h3" className="mb-2">
                  {sesionApoyo.titulo}
                </Typography>
                <Typography variant="body1" color="secondary">
                  {sesionApoyo.objetivo_sesion}
                </Typography>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">
                    Fecha y Hora
                  </Typography>
                  <Typography variant="body1">
                    {formatFecha(sesionApoyo.fecha)}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">
                    Moderador
                  </Typography>
                  <Typography variant="body1">
                    {moderador?.full_name || 'Cargando...'}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">
                    Estado
                  </Typography>
                  <Chip variant="success" size="sm">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    En Progreso
                  </Chip>
                </div>
                
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">
                    Observadores
                  </Typography>
                  <Typography variant="body1">
                    {observadores.length} persona(s)
                  </Typography>
                </div>
              </div>
            </div>
          </Card>

          {sesionApoyo.meet_link && (
            <Card padding="lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <VideoIcon className="w-5 h-5 text-primary" />
                  <div>
                    <Typography variant="body1" className="font-medium">
                      Sesión de Google Meet
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      La sesión está activa en otra pestaña
                    </Typography>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open(sesionApoyo.meet_link, '_blank')}
                >
                  Abrir Meet
                </Button>
              </div>
            </Card>
          )}
        </div>
      )
    },
    {
      id: 'participantes',
      label: 'Participantes',
      content: (
        <div className="space-y-4">
          <Card padding="lg">
            <Typography variant="h4" className="mb-4">
              Moderador
            </Typography>
            {moderador ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Typography variant="body1" className="font-medium">
                    {moderador.full_name}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    {moderador.email}
                  </Typography>
                </div>
                <Chip variant="primary" size="sm">
                  Moderador
                </Chip>
              </div>
            ) : (
              <Typography variant="body2" color="secondary">
                Cargando información del moderador...
              </Typography>
            )}
          </Card>

          {observadores.length > 0 && (
            <Card padding="lg">
              <Typography variant="h4" className="mb-4">
                Observadores ({observadores.length})
              </Typography>
              <div className="space-y-3">
                {observadores.map((observador) => (
                  <div key={observador.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <Typography variant="body1" className="font-medium">
                        {observador.full_name}
                      </Typography>
                      <Typography variant="body2" color="secondary">
                        {observador.email}
                      </Typography>
                    </div>
                    <Chip variant="secondary" size="sm">
                      Observador
                    </Chip>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )
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
