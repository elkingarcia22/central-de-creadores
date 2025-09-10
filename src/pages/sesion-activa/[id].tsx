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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState<string>('');
  const [transcriptionHistory, setTranscriptionHistory] = useState<string[]>([]);

  // Cargar datos del participante y reclutamiento
  useEffect(() => {
    if (id) {
      loadParticipantData();
    }
  }, [id]);

  // Cargar transcripción existente cuando se carga el reclutamiento
  useEffect(() => {
    if (reclutamiento?.id) {
      loadExistingTranscription();
    }
  }, [reclutamiento?.id]);

  // Limpiar recursos al desmontar el componente
  useEffect(() => {
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
      if (speechRecognition && isRecording) {
        speechRecognition.stop();
      }
    };
  }, [recordingInterval, speechRecognition, isRecording]);

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

  const loadExistingTranscription = async () => {
    try {
      if (!reclutamiento?.id) return;
      
      console.log('🔍 Cargando transcripción existente...');
      
      const response = await fetch(`/api/transcripciones/${reclutamiento.id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.transcripcion) {
          console.log('✅ Transcripción existente encontrada');
          setTranscription(data.transcripcion.transcripcion_completa || '');
          
          // Convertir segmentos a historial si existen
          if (data.transcripcion.transcripcion_por_segmentos) {
            const history = data.transcripcion.transcripcion_por_segmentos.map((segment: any) => segment.text);
            setTranscriptionHistory(history);
          }
        }
      } else if (response.status === 404) {
        console.log('ℹ️ No hay transcripción existente');
      } else {
        console.error('❌ Error cargando transcripción:', response.status);
      }
      
    } catch (error) {
      console.error('❌ Error cargando transcripción existente:', error);
    }
  };

  const handleStartRecording = async () => {
    try {
      console.log('🎤 Iniciando transcripción automática...');
      
      // Verificar si el navegador soporta Speech Recognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('❌ Tu navegador no soporta transcripción de voz. Usa Chrome o Edge.');
        return;
      }
      
      // Solicitar permisos de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      console.log('✅ Permisos de micrófono obtenidos');
      
      // Crear Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Configurar Speech Recognition
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';
      recognition.maxAlternatives = 1;
      
      // Eventos de Speech Recognition
      recognition.onstart = () => {
        console.log('🎤 Transcripción iniciada');
        setIsTranscribing(true);
        setIsRecording(true);
        setRecordingTime(0);
        setLiveTranscription('');
        setTranscriptionHistory([]);
        
        // Iniciar contador de tiempo
        const interval = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        setRecordingInterval(interval);
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            console.log('📝 Transcripción final:', transcript);
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Actualizar transcripción en tiempo real
        setLiveTranscription(interimTranscript);
        
        // Agregar transcripción final al historial
        if (finalTranscript) {
          setTranscriptionHistory(prev => [...prev, finalTranscript]);
          setTranscription(prev => prev + finalTranscript + ' ');
        }
      };
      
      recognition.onerror = (event) => {
        console.error('❌ Error en transcripción:', event.error);
        setIsTranscribing(false);
        setIsRecording(false);
        
        if (recordingInterval) {
          clearInterval(recordingInterval);
          setRecordingInterval(null);
        }
        
        // Detener el stream
        stream.getTracks().forEach(track => track.stop());
        
        alert(`❌ Error en transcripción: ${event.error}`);
      };
      
      recognition.onend = () => {
        console.log('🛑 Transcripción detenida');
        setIsTranscribing(false);
        setIsRecording(false);
        
        if (recordingInterval) {
          clearInterval(recordingInterval);
          setRecordingInterval(null);
        }
        
        // Detener el stream
        stream.getTracks().forEach(track => track.stop());
        
        // Guardar automáticamente la transcripción en Supabase
        if (transcription.trim() && reclutamiento?.id) {
          handleSaveTranscription();
        }
      };
      
      // Guardar referencias
      setSpeechRecognition(recognition);
      
      // Iniciar transcripción
      recognition.start();
      
      console.log('🎤 Transcripción automática iniciada');
      
    } catch (error) {
      console.error('❌ Error al iniciar transcripción:', error);
      alert('❌ Error al acceder al micrófono. Verifica los permisos.');
    }
  };

  const handleStopRecording = () => {
    if (speechRecognition && isRecording) {
      console.log('🛑 Deteniendo transcripción...');
      
      // Detener transcripción
      speechRecognition.stop();
      setIsRecording(false);
      setIsTranscribing(false);
      
      // Limpiar intervalo
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
      
      // Limpiar estado
      setSpeechRecognition(null);
      setRecordingTime(0);
      
      console.log('✅ Transcripción detenida');
    }
  };

  const handleSaveTranscription = async () => {
    if (transcription.trim() && reclutamiento?.id) {
      try {
        console.log('💾 Guardando transcripción en Supabase...');
        
        const duracionTotal = recordingTime;
        const segments = transcriptionHistory.map((text, index) => ({
          timestamp: index * 1000, // Timestamp aproximado
          text: text,
          speaker: 'Participante' // Por ahora asumimos que es el participante
        }));

        const response = await fetch(`/api/transcripciones/${reclutamiento.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meet_link: reclutamiento.meet_link || '',
            transcripcion_completa: transcription,
            transcripcion_por_segmentos: segments,
            duracion_total: duracionTotal,
            idioma_detectado: 'es'
          }),
        });

        if (!response.ok) {
          throw new Error('Error guardando transcripción');
        }

        const data = await response.json();
        console.log('✅ Transcripción guardada en Supabase:', data);
        
        alert('✅ Transcripción guardada exitosamente en Supabase!');
        
      } catch (error) {
        console.error('❌ Error guardando transcripción:', error);
        alert('❌ Error al guardar la transcripción. Intenta nuevamente.');
      }
    }
  };

  const handleBackToSessions = () => {
    router.push('/sesiones');
  };

  const formatRecordingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
                {isRecording ? 'Transcribiendo' : 'Inactivo'}
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-3">
                {!isRecording ? (
                  <Button
                    onClick={handleStartRecording}
                    variant="primary"
                    className="flex items-center gap-2"
                  >
                    <MicIcon className="h-4 w-4" />
                    Iniciar Transcripción Automática
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopRecording}
                    variant="danger"
                    className="flex items-center gap-2"
                  >
                    <MicIcon className="h-4 w-4" />
                    Detener Transcripción
                  </Button>
                )}
              </div>
              
              {/* Indicador de tiempo de transcripción */}
              {isRecording && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Typography variant="body2" className="font-mono">
                    Transcribiendo: {formatRecordingTime(recordingTime)}
                  </Typography>
                </div>
              )}
            </div>

            {/* Transcripción en tiempo real */}
            {isTranscribing && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Typography variant="body2" className="text-green-800 font-medium">
                    Transcripción en tiempo real:
                  </Typography>
                </div>
                <div className="bg-white p-3 rounded border min-h-[60px]">
                  <Typography variant="body2" className="text-gray-700">
                    {liveTranscription || 'Escuchando...'}
                  </Typography>
                </div>
              </div>
            )}

            {/* Historial de transcripción */}
            {transcriptionHistory.length > 0 && (
              <div className="mb-6">
                <Typography variant="h4" className="text-gray-900 mb-2">
                  Transcripción Final
                </Typography>
                <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                  {transcriptionHistory.map((text, index) => (
                    <div key={index} className="mb-2">
                      <Typography variant="body2" className="text-gray-700">
                        {text}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campo de transcripción manual */}
            <div className="space-y-4">
              <div>
                <Typography variant="h4" className="text-gray-900 mb-2">
                  Transcripción Completa
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-4">
                  {isTranscribing 
                    ? 'La transcripción automática se está agregando aquí en tiempo real'
                    : 'Puedes escribir o pegar la transcripción de la sesión aquí'
                  }
                </Typography>
              </div>

              <Textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder={isTranscribing 
                  ? 'La transcripción automática aparecerá aquí...'
                  : 'Escribe o pega aquí la transcripción de la sesión...'
                }
                rows={12}
                className="w-full"
                readOnly={isTranscribing}
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
