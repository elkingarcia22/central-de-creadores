import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout, PageHeader, Tabs, Card, Typography, Button, Chip, EmptyState } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircleIcon, ClockIcon, UserIcon, VideoIcon, HelpIcon, ArrowLeftIcon, MoreVerticalIcon, MessageIcon, AlertTriangleIcon, FileTextIcon, BarChartIcon, TrendingUpIcon, EyeIcon, TrashIcon, CheckIcon, RefreshIcon, SearchIcon, FilterIcon, AIIcon, MicIcon, UsersIcon, BuildingIcon } from '../../components/icons';
import { getTipoParticipanteVariant } from '../../utils/tipoParticipanteUtils';
import { getEstadoParticipanteVariant, getEstadoEmpresaVariant } from '../../utils/estadoUtils';
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
  estado_agendamiento?: string;
  estado_real?: string;
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
  empresa_id?: string;
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
  estado_nombre?: string;
  pais?: string;
  industria?: string;
  tamano?: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  website?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
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
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [errorEstadisticas, setErrorEstadisticas] = useState<string | null>(null);
  const [investigaciones, setInvestigaciones] = useState<any[]>([]);
  const [participacionesPorMes, setParticipacionesPorMes] = useState<{ [key: string]: number }>({});
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  // Hook para transcripción de audio
  const audioTranscription = useWebSpeechTranscriptionSimple();

  useEffect(() => {
    if (id) {
      // Mostrar logs de debug guardados
      const debugLogs = localStorage.getItem('debug_sesion_apoyo');
      const debugGuardado = localStorage.getItem('debug_guardado_sesion_apoyo');
      
      if (debugLogs) {
        console.log('🔍 [DEBUG LOGS] Logs de sesión de apoyo:', JSON.parse(debugLogs));
      }
      
      if (debugGuardado) {
        console.log('🔍 [DEBUG GUARDADO] Logs de guardado:', JSON.parse(debugGuardado));
      }
      
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

  // Cargar datos de empresa cuando el participante cambie
  useEffect(() => {
    if (participante && participante.tipo === 'externo') {
      loadEmpresaData();
    }
  }, [participante]);

  // Cargar estadísticas de empresa cuando la empresa cambie
  useEffect(() => {
    console.log('🔍 Empresa ID:', empresa?.id);
    
    // Cargar estadísticas de empresa si es un participante externo
    if (empresa && participante?.tipo === 'externo' && empresa.id) {
      console.log('🔍 Cargando estadísticas de empresa...');
      cargarEstadisticasEmpresa(empresa.id);
    }
  }, [empresa, participante?.tipo]);

  const loadParticipantData = async (participanteId: string) => {
    try {
      console.log('🔍 Iniciando carga de datos del participante para ID:', participanteId);
      // Cargar datos completos del participante desde la API
      const participanteResponse = await fetch(`/api/participantes/${participanteId}`);
      console.log('🔍 Respuesta de la API de participantes:', participanteResponse.status, participanteResponse.statusText);
      
      if (participanteResponse.ok) {
        const participanteData = await participanteResponse.json();
        console.log('🔍 Datos del participante recibidos:', participanteData);
        setParticipante(participanteData);
        console.log('🔍 Estado del participante actualizado:', participanteData);
      } else {
        console.error('🔍 Error cargando información del participante:', participanteResponse.status);
        const errorText = await participanteResponse.text();
        console.error('🔍 Error details:', errorText);
      }
    } catch (error) {
      console.error('🔍 Error cargando información del participante:', error);
    }
  };

  const loadSesionApoyoData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de la sesión de apoyo desde localStorage
      const currentSesionApoyo = localStorage.getItem('currentSesionApoyo');
      if (currentSesionApoyo) {
        try {
          const sesionData = JSON.parse(currentSesionApoyo);
          console.log('🔍 [DEBUG] Datos de sesión de apoyo desde localStorage:', sesionData);
          console.log('🔍 [DEBUG] Estado de agendamiento:', sesionData.estado_agendamiento);
          console.log('🔍 [DEBUG] Estado real:', sesionData.estado_real);
          console.log('🔍 [DEBUG] Tipo de sesión:', sesionData.tipo);
          console.log('🔍 [DEBUG] Todos los campos disponibles:', Object.keys(sesionData));
          setSesionApoyo(sesionData);
          
          // Cargar información completa del participante desde la API
          if (sesionData.participante && sesionData.participante.id) {
            await loadParticipantData(sesionData.participante.id);
          } else {
            console.error('🔍 No se encontró ID del participante en la sesión de apoyo');
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
          if (sesionData.participante && sesionData.participante.id) {
            await loadInvestigacionesData(sesionData.participante.id);
          }
          
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

  const loadInvestigacionesData = async (participanteId: string) => {
    try {
      console.log('🔍 Cargando investigaciones para participante:', participanteId);
      const response = await fetch(`/api/participantes/${participanteId}/investigaciones`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Respuesta completa de investigaciones:', data);
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
        console.log('🔍 Primera investigación (ejemplo):', data.investigaciones?.[0]);
      } else {
        console.error('🔍 Error en respuesta de investigaciones:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('🔍 Error data:', errorData);
      }
    } catch (error) {
      console.error('Error cargando investigaciones:', error);
    }
  };

  const loadEmpresaData = async () => {
    try {
      // Solo cargar empresa para participantes externos
      if (participante?.tipo === 'externo') {
        if (participante.empresa_id) {
          console.log('🔍 Cargando empresa por ID:', participante.empresa_id);
          await cargarEmpresaPorId(participante.empresa_id);
        } else if (participante.empresa_nombre) {
          console.log('🔍 Buscando empresa por nombre:', participante.empresa_nombre);
          await buscarEmpresaPorNombre(participante.empresa_nombre);
        } else {
          console.log('🔍 Participante externo sin empresa_id ni empresa_nombre');
        }
      } else {
        console.log('🔍 No se cargará empresa - Tipo:', participante?.tipo);
      }
    } catch (error) {
      console.error('🔍 Error cargando empresa:', error);
    }
  };

  const cargarEmpresaPorId = async (empresaId: string) => {
    try {
      console.log('🔍 Cargando empresa por ID:', empresaId);
      const response = await fetch(`/api/empresas/${empresaId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Empresa cargada por ID:', data);
        setEmpresa(data);
      } else {
        console.error('🔍 Error cargando empresa por ID:', response.status);
      }
    } catch (error) {
      console.error('🔍 Error cargando empresa por ID:', error);
    }
  };

  const buscarEmpresaPorNombre = async (empresaNombre: string) => {
    try {
      console.log('🔍 Buscando empresa por nombre:', empresaNombre);
      const response = await fetch('/api/empresas');
      if (response.ok) {
        const empresas = await response.json();
        console.log('🔍 Todas las empresas cargadas:', empresas.length);
        
        // Buscar empresa por nombre (ignorando mayúsculas/minúsculas)
        const empresaEncontrada = empresas.find((empresa: any) => 
          empresa.nombre && empresa.nombre.toLowerCase() === empresaNombre.toLowerCase()
        );
        
        if (empresaEncontrada) {
          console.log('🔍 Empresa encontrada por nombre:', empresaEncontrada);
          setEmpresa(empresaEncontrada);
        } else {
          console.log('🔍 No se encontró empresa con el nombre:', empresaNombre);
        }
      } else {
        console.error('🔍 Error cargando empresas:', response.status);
      }
    } catch (error) {
      console.error('🔍 Error buscando empresa por nombre:', error);
    }
  };

  const cargarEstadisticasEmpresa = async (empresaId: string) => {
    setLoadingEstadisticas(true);
    setErrorEstadisticas(null);

    try {
      console.log('🔍 Cargando estadísticas de empresa:', empresaId);
      const response = await fetch(`/api/empresas/${empresaId}/estadisticas`);

      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }

      const data = await response.json();
      console.log('🔍 Estadísticas de empresa cargadas:', data);

      setEmpresaData({
        ...empresa,
        estadisticas: data.estadisticas,
        participantes: data.participantes
      });
    } catch (err) {
      console.error('🔍 Error cargando estadísticas de empresa:', err);
      setErrorEstadisticas(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoadingEstadisticas(false);
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

  const formatearFecha = (fecha: string) => {
    try {
      const fechaObj = new Date(fecha);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(fechaObj);
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return fecha;
    }
  };

  const getEstadoParticipanteVariant = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'disponible':
        return 'terminada';
      case 'activo':
        return 'terminada';
      case 'buena':
        return 'terminada';
      case 'en enfriamiento':
        return 'pendiente';
      case 'ocupado':
        return 'transitoria';
      case 'no_disponible':
        return 'fallo';
      default:
        return 'default';
    }
  };

  const getChipText = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'disponible':
        return 'Disponible';
      case 'ocupado':
        return 'Ocupado';
      case 'no_disponible':
        return 'No Disponible';
      default:
        return estado || 'Sin estado';
    }
  };

  const getChipVariant = (relacion: string) => {
    switch (relacion?.toLowerCase()) {
      case 'cliente':
        return 'terminada';
      case 'prospecto':
        return 'transitoria';
      case 'ex-cliente':
        return 'fallo';
      default:
        return 'default';
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
    console.log('🔍 InformacionContent - participante comentarios:', participante?.comentarios);
    console.log('🔍 InformacionContent - participante doleres_necesidades:', participante?.doleres_necesidades);
    
    // Verificar si el participante está cargado
    if (!participante) {
      console.error('🔍 Error: participante es null en InformacionContent');
      return (
        <div className="space-y-6">
          <Card padding="lg">
            <Typography variant="body1" color="secondary">
              Cargando información del participante...
            </Typography>
          </Card>
        </div>
      );
    }
    
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


                  </div>
    );
  };

  // Componente para el contenido del tab de Información de la Sesión de Apoyo
  const SesionApoyoContent: React.FC<{ sesionApoyo: SesionApoyoData; participante: Participante }> = ({ sesionApoyo, participante }) => {
    // Debug logs para ver qué datos están llegando
    console.log('🔍 [SesionApoyoContent] sesionApoyo recibido:', sesionApoyo);
    console.log('🔍 [SesionApoyoContent] estado_agendamiento:', sesionApoyo?.estado_agendamiento);
    console.log('🔍 [SesionApoyoContent] estado_real:', sesionApoyo?.estado_real);
    console.log('🔍 [SesionApoyoContent] Campos disponibles en sesionApoyo:', sesionApoyo ? Object.keys(sesionApoyo) : 'sesionApoyo es null/undefined');
    // Función para obtener el nombre del usuario por ID
    const getNombreUsuario = (userId: string) => {
      if (!usuarios || !userId) return 'Usuario no encontrado';
      const usuario = usuarios.find(u => u.id === userId);
      return usuario ? usuario.full_name || 'Sin nombre' : 'Usuario no encontrado';
    };

    // Función para obtener el email del usuario por ID
    const getEmailUsuario = (userId: string) => {
      if (!usuarios || !userId) return 'Email no encontrado';
      const usuario = usuarios.find(u => u.id === userId);
      return usuario ? usuario.email || 'Sin email' : 'Email no encontrado';
    };

    // Función para formatear la duración
    const formatearDuracion = (duracion: number) => {
      if (!duracion) return '0 min';
      if (duracion >= 60) {
        const horas = Math.floor(duracion / 60);
        const minutos = duracion % 60;
        return minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`;
      }
      return `${duracion} min`;
    };

    if (!sesionApoyo) {
      return (
        <div className="space-y-6">
          <Card padding="lg">
            <Typography variant="body1" color="secondary">
              Sin información de sesión de apoyo disponible.
            </Typography>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Información de la Sesión de Apoyo */}
        <InfoContainer 
          title="Detalles de la Sesión de Apoyo"
          icon={<FileTextIcon className="w-4 h-4" />}
        >
          <InfoItem 
            label="ID de la Sesión"
            value={sesionApoyo.id}
          />
          <InfoItem 
            label="Título"
            value={sesionApoyo.titulo}
          />
          <InfoItem 
            label="Moderador"
            value={
              <div className="flex items-center gap-2">
                <span>{getNombreUsuario(sesionApoyo.moderador_id)}</span>
                <Chip variant="secondary" size="sm">
                  {getEmailUsuario(sesionApoyo.moderador_id)}
                </Chip>
              </div>
            }
          />
          <InfoItem 
            label="Participante"
            value={participante.nombre}
          />
          <InfoItem 
            label="Email del Participante"
            value={participante.email || 'Sin email'}
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
            label="Fecha de Sesión"
            value={sesionApoyo.fecha ? 
              formatearFecha(sesionApoyo.fecha) : 
              'No programada'
            }
          />
          <InfoItem 
            label="Objetivo de la Sesión"
            value={sesionApoyo.objetivo_sesion || 'Sin objetivo definido'}
          />
          <InfoItem 
            label="Estado de Agendamiento"
            value={
              (() => {
                const estadoReal = sesionApoyo.estado_real;
                const estadoAgendamiento = sesionApoyo.estado_agendamiento;
                const estadoFinal = estadoReal || estadoAgendamiento || 'Sin estado';
                const variantFinal = getChipVariant(estadoFinal);
                
                console.log('🔍 [ESTADO DEBUG] estado_real:', estadoReal);
                console.log('🔍 [ESTADO DEBUG] estado_agendamiento:', estadoAgendamiento);
                console.log('🔍 [ESTADO DEBUG] estado_final:', estadoFinal);
                console.log('🔍 [ESTADO DEBUG] variant_final:', variantFinal);
                
                return (
                  <Chip 
                    variant={variantFinal as any}
                    size="sm"
                  >
                    {estadoFinal}
                  </Chip>
                );
              })()
            }
          />
          {sesionApoyo.meet_link && (
            <InfoItem 
              label="Enlace de Google Meet"
              value={
                <div className="flex items-center gap-2">
                  <a 
                    href={sesionApoyo.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline break-all"
                  >
                    {sesionApoyo.meet_link}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(sesionApoyo.meet_link)}
                    className="p-1 h-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </Button>
                </div>
              }
            />
          )}
        </InfoContainer>

        {/* Observadores */}
        {sesionApoyo.observadores && sesionApoyo.observadores.length > 0 && (
          <InfoContainer 
            title="Observadores"
            icon={<UsersIcon className="w-4 h-4" />}
          >
            <div className="space-y-3">
              {sesionApoyo.observadores.map((observadorId: string, index: number) => (
                <div key={observadorId} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <Typography variant="body1" className="font-medium">
                      {getNombreUsuario(observadorId)}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      {getEmailUsuario(observadorId)}
                    </Typography>
                  </div>
                  <Chip variant="secondary" size="sm">
                    Observador
                  </Chip>
                </div>
              ))}
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
      content: (() => {
        console.log('🔍 Renderizando tab de información - participante:', participante);
        console.log('🔍 Renderizando tab de información - investigaciones:', investigaciones);
        console.log('🔍 Renderizando tab de información - participacionesPorMes:', participacionesPorMes);
        
        if (!participante) {
          return (
            <div className="space-y-6">
              <Card padding="lg">
                <Typography variant="body1" color="secondary">
                  Cargando información del participante...
                </Typography>
              </Card>
            </div>
          );
        }
        
        return (
          <InformacionContent 
            participante={participante} 
            empresa={empresa} 
            investigaciones={investigaciones}
            participacionesPorMes={participacionesPorMes}
          />
        );
      })()
    },
    {
      id: 'sesion',
      label: 'Información de la Sesión',
      content: (() => {
        console.log('🔍 Renderizando tab de sesión - sesionApoyo:', sesionApoyo);
        console.log('🔍 Renderizando tab de sesión - participante:', participante);
        
        if (!sesionApoyo || !participante) {
          return (
            <div className="space-y-6">
              <Card padding="lg">
                <Typography variant="body1" color="secondary">
                  Cargando información de la sesión...
                </Typography>
              </Card>
            </div>
          );
        }
        
        return (
          <SesionApoyoContent 
            sesionApoyo={sesionApoyo} 
            participante={participante} 
          />
        );
      })()
    },
    {
      id: 'empresa-informacion',
      label: 'Información Empresa',
      content: (
        <div className="space-y-6">
          {empresa && participante?.tipo === 'externo' ? (
            <>
              {/* Descripción */}
              {(empresaData?.descripcion || empresa.descripcion) && (
                <InfoContainer 
                  title="Descripción"
                  icon={<FileTextIcon className="w-4 h-4" />}
                >
                  <InfoItem 
                    label="Descripción" 
                    value={empresaData?.descripcion || empresa.descripcion}
                  />
                </InfoContainer>
              )}

              {/* Estadísticas principales */}
              {empresaData && empresaData.estadisticas && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Participaciones */}
                    <Card variant="elevated" padding="md">
                      <div className="flex items-center justify-between">
                  <div>
                          <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                            <AnimatedCounter
                              value={empresaData.estadisticas.totalParticipaciones || 0}
                              duration={2000}
                              className="text-gray-700 dark:text-gray-200"
                            />
                    </Typography>
                          <Typography variant="body2" color="secondary">
                            Total Participaciones
                    </Typography>
                  </div>
                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                          <TrendingUpIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                      </div>
                    </Card>
                
                    {/* Total Participantes */}
                    <Card variant="elevated" padding="md">
                      <div className="flex items-center justify-between">
                    <div>
                          <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                            <AnimatedCounter
                              value={empresaData.estadisticas.totalParticipantes || 0}
                              duration={2000}
                              className="text-gray-700 dark:text-gray-200"
                            />
                          </Typography>
                          <Typography variant="body2" color="secondary">
                            Total Participantes
                      </Typography>
                    </div>
                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                          <UsersIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>
                    </Card>
                  
                    {/* Investigaciones Participadas */}
                    <Card variant="elevated" padding="md">
                      <div className="flex items-center justify-between">
                  <div>
                          <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                            <AnimatedCounter
                              value={empresaData.estadisticas.investigacionesParticipadas || 0}
                              duration={2000}
                              className="text-gray-700 dark:text-gray-200"
                            />
                    </Typography>
                          <Typography variant="body2" color="secondary">
                            Investigaciones
                      </Typography>
                    </div>
                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                          <BarChartIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              </Card>

                    {/* Tiempo Total */}
                    <Card variant="elevated" padding="md">
                      <div className="flex items-center justify-between">
                    <div>
                          <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                            <AnimatedCounter 
                              value={Math.round((empresaData.estadisticas.duracionTotalSesiones || 0) / 60)} 
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

                  {/* Última participación y resumen del mes */}
                  <InfoContainer 
                    title="Resumen de Participación"
                    icon={<UserIcon className="w-4 h-4" />}
                  >
                    {empresaData.estadisticas.fechaUltimaParticipacion && (
                      <InfoItem 
                        label="Última Participación" 
                        value={formatearFecha(empresaData.estadisticas.fechaUltimaParticipacion)}
                      />
                    )}
                    
                    <InfoItem 
                      label="Participaciones del Mes" 
                      value={
                        (() => {
                          const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
                          const participacionesMesActual = empresaData.estadisticas.participacionesPorMes?.[mesActual] || 0;
                          const nombreMes = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                          return `${participacionesMesActual} en ${nombreMes}`;
                        })()
                      }
                    />
                  </InfoContainer>
                </>
              )}

              {/* Información básica */}
              <InfoContainer 
                title="Información Básica"
                icon={<BuildingIcon className="w-4 h-4" />}
              >
                <InfoItem 
                  label="Nombre" 
                  value={empresa.nombre}
                />
                {(empresaData?.estado_nombre || empresa.estado_nombre) && (
                  <InfoItem 
                    label="Estado" 
                    value={
                      <Chip 
                        variant={getEstadoEmpresaVariant(empresaData?.estado_nombre || empresa.estado_nombre || 'activa')}
                        size="sm"
                      >
                        {empresaData?.estado_nombre || empresa.estado_nombre || 'Activa'}
                      </Chip>
                    }
                  />
                )}
                {(empresaData?.pais_nombre || empresa.pais) && (
                  <InfoItem label="País" value={empresaData?.pais_nombre || empresa.pais} />
                )}
                {(empresaData?.industria_nombre || empresa.industria) && (
                  <InfoItem label="Industria" value={empresaData?.industria_nombre || empresa.industria} />
                )}
                {(empresaData?.modalidad_nombre) && (
                  <InfoItem label="Modalidad" value={empresaData.modalidad_nombre} />
                )}
                {(empresaData?.tamano_nombre || empresa.tamano) && (
                  <InfoItem label="Tamaño" value={empresaData?.tamano_nombre || empresa.tamano} />
                )}
                {(empresaData?.relacion_nombre) && (
                  <InfoItem 
                    label="Relación" 
                    value={
                      <Chip 
                        variant={empresaData.relacion_nombre?.toLowerCase() === 'buena' ? 'terminada' : getChipVariant(empresaData.relacion_nombre) as any}
                        size="sm"
                      >
                        {empresaData.relacion_nombre}
                      </Chip>
                    }
                  />
                )}
                {(empresaData?.productos_nombres) && (
                  <InfoItem 
                    label="Productos" 
                    value={empresaData.productos_nombres.join(', ')}
                  />
                )}
                {(empresaData?.kam_nombre) && (
                  <InfoItem 
                    label="KAM Asignado" 
                    value={
                      <div className="flex items-center gap-2">
                        <SimpleAvatar 
                          fallbackText={empresaData.kam_nombre}
                          size="sm"
                        />
                        <span>{empresaData.kam_nombre}</span>
                  </div>
                    }
                  />
                )}
                {empresa.ciudad && <InfoItem label="Ciudad" value={empresa.ciudad} />}
                {empresa.direccion && <InfoItem label="Dirección" value={empresa.direccion} />}
                {empresa.telefono && <InfoItem label="Teléfono" value={empresa.telefono} />}
                {empresa.email && <InfoItem label="Email" value={empresa.email} />}
                {empresa.website && <InfoItem label="Website" value={empresa.website} />}
              </InfoContainer>

              {/* Fechas */}
              <InfoContainer 
                title="Fechas"
                icon={<ClockIcon className="w-4 h-4" />}
              >
                {(empresaData?.created_at || empresa.fecha_creacion) && (
                  <InfoItem 
                    label="Fecha de Creación" 
                    value={formatearFecha(empresaData?.created_at || empresa.fecha_creacion)}
                  />
                )}
                {(empresaData?.updated_at || empresa.fecha_actualizacion) && (
                  <InfoItem 
                    label="Última Actualización" 
                    value={formatearFecha(empresaData?.updated_at || empresa.fecha_actualizacion)}
                  />
                )}
              </InfoContainer>
            </>
          ) : (
            <EmptyState
              icon={<BuildingIcon className="w-8 h-8" />}
              title="Información de Empresa no disponible"
              description="Este participante no está asociado a una empresa externa."
            />
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
