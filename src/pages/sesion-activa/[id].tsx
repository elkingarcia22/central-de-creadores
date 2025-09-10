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
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
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
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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

  const handleSaveAndViewSession = async () => {
    try {
      // Guardar transcripción si existe
      if (transcription.trim() && reclutamiento?.id) {
        console.log('💾 Guardando transcripción antes de redirigir...');
        
        const duracionTotal = recordingTime;
        const segments = transcriptionHistory.map((text, index) => ({
          timestamp: index * 1000,
          text: text,
          speaker: 'Participante'
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

        console.log('✅ Transcripción guardada exitosamente');
      }

      // Redirigir a la vista de la sesión
      if (participante?.id) {
        router.push(`/participacion/${participante.id}`);
      } else {
        alert('❌ No se pudo obtener el ID del participante');
      }
      
    } catch (error) {
      console.error('❌ Error guardando y redirigiendo:', error);
      alert('❌ Error al guardar. Intenta nuevamente.');
    }
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MicIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <Typography variant="h3" className="text-gray-900">
                    Transcripción Automática
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Captura automática de la conversación en tiempo real
                  </Typography>
                </div>
              </div>
              
              <Chip variant={isRecording ? 'success' : 'danger'} size="md">
                {isRecording ? 'Transcribiendo' : 'Inactivo'}
              </Chip>
            </div>

            {reclutamiento?.meet_link && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <Typography variant="body2" className="text-blue-800">
                  <strong>Enlace de Meet:</strong> {reclutamiento.meet_link}
                </Typography>
              </div>
            )}

            {/* Controles de transcripción */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <MicIcon className="h-4 w-4" />
                      Detener Transcripción
                    </Button>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    {!isRecording ? 'Presiona para comenzar a transcribir' : 'Transcripción en curso'}
                  </div>
                </div>
                
                {/* Indicador de tiempo de transcripción */}
                {isRecording && (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Typography variant="body2" className="font-mono">
                      {formatRecordingTime(recordingTime)}
                    </Typography>
                  </div>
                )}
              </div>
            </div>

            {/* Transcripción en tiempo real */}
            {isTranscribing && (
              <Card className="p-4 border-l-4 border-l-green-500 bg-green-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Typography variant="body1" className="text-green-800 font-medium">
                    Transcripción en tiempo real
                  </Typography>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200 min-h-[80px] shadow-sm">
                  <Typography variant="body2" className="text-gray-700 leading-relaxed">
                    {liveTranscription || 'Escuchando...'}
                  </Typography>
                </div>
              </Card>
            )}

            {/* Historial de transcripción */}
            {transcriptionHistory.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <Typography variant="h4" className="text-gray-900">
                    Transcripción Final
                  </Typography>
                  <Chip variant="success" size="sm">
                    {transcriptionHistory.length} segmentos
                  </Chip>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto space-y-3">
                  {transcriptionHistory.map((text, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <Typography variant="body2" className="text-gray-700 leading-relaxed">
                        {text}
                      </Typography>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Campo de transcripción completa */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileTextIcon className="w-5 h-5 text-gray-600" />
                <Typography variant="h4" className="text-gray-900">
                  Transcripción Completa
                </Typography>
                {isTranscribing && (
                  <Chip variant="info" size="sm">
                    Auto-completando
                  </Chip>
                )}
              </div>
              
              <Typography variant="body2" className="text-gray-600 mb-4">
                {isTranscribing 
                  ? 'La transcripción automática se está agregando aquí en tiempo real'
                  : 'Puedes escribir o pegar la transcripción de la sesión aquí'
                }
              </Typography>

              <div className="space-y-4">
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Usa el botón "Guardar y Ver Sesión" en el header para guardar todo
                  </div>
                  
                  {transcription.length > 0 && (
                    <Chip variant="info" size="sm">
                      {transcription.length} caracteres
                    </Chip>
                  )}
                </div>
              </div>
            </Card>
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
                      <Chip variant="info" size="md">
                        {participante.tipo}
                      </Chip>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Estado</Typography>
                      <Chip variant="success" size="md">
                        {participante.estado}
                      </Chip>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Información de empresa */}
              {participante.empresa_nombre && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <BuildingIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <Typography variant="h3" className="text-gray-900">
                        Información de Empresa
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Datos corporativos del participante
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Empresa</Typography>
                      <Typography variant="body1" className="text-gray-900 font-medium">
                        {participante.empresa_nombre}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Rol</Typography>
                      <Typography variant="body1" className="text-gray-900">
                        {participante.rol_empresa || 'No disponible'}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Departamento</Typography>
                      <Typography variant="body1" className="text-gray-900">
                        {participante.departamento_nombre || 'No disponible'}
                      </Typography>
                    </div>
                  </div>
                </Card>
              )}

              {/* Fechas */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <Typography variant="h3" className="text-gray-900">
                      Fechas
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Historial de fechas del participante
                    </Typography>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Typography variant="body2" className="text-gray-500 mb-1">Fecha de Nacimiento</Typography>
                    <Typography variant="body1" className="text-gray-900">
                      {participante.fecha_nacimiento ? formatearFecha(participante.fecha_nacimiento) : 'No disponible'}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="text-gray-500 mb-1">Fecha de Creación</Typography>
                    <Typography variant="body1" className="text-gray-900">
                      {participante.created_at ? formatearFecha(participante.created_at) : 'No disponible'}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="text-gray-500 mb-1">Última Actualización</Typography>
                    <Typography variant="body1" className="text-gray-900">
                      {participante.updated_at ? formatearFecha(participante.updated_at) : 'No disponible'}
                    </Typography>
                  </div>
                </div>
              </Card>
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
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <CalendarIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <Typography variant="h3" className="text-gray-900">
                      Detalles de la Sesión
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Información de la sesión programada
                    </Typography>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Título</Typography>
                      <Typography variant="body1" className="text-gray-900 font-medium">
                        {reclutamiento.titulo}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Estado</Typography>
                      <Chip variant="info" size="md">
                        {reclutamiento.estado}
                      </Chip>
                    </div>
                  </div>
                  
                  <div>
                    <Typography variant="body2" className="text-gray-500 mb-1">Descripción</Typography>
                    <Typography variant="body1" className="text-gray-900">
                      {reclutamiento.descripcion || 'No disponible'}
                    </Typography>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Fecha</Typography>
                      <Typography variant="body1" className="text-gray-900">
                        {formatearFecha(reclutamiento.fecha)}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Enlace de Meet</Typography>
                      {reclutamiento.meet_link ? (
                        <a 
                          href={reclutamiento.meet_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {reclutamiento.meet_link}
                        </a>
                      ) : (
                        <Typography variant="body1" className="text-gray-500">
                          No disponible
                        </Typography>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Información del reclutador */}
              {reclutamiento.reclutador && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <UsersIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <Typography variant="h3" className="text-gray-900">
                        Reclutador
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Información del reclutador asignado
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Nombre</Typography>
                      <Typography variant="body1" className="text-gray-900 font-medium">
                        {reclutamiento.reclutador.nombre}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Email</Typography>
                      <Typography variant="body1" className="text-gray-900">
                        {reclutamiento.reclutador.email}
                      </Typography>
                    </div>
                  </div>
                </Card>
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
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header con PageHeader estándar */}
          <PageHeader
            title="Sesión Activa"
            subtitle={reclutamiento?.titulo ? `Reclutamiento: ${reclutamiento.titulo}` : 'Cargando reclutamiento...'}
            color="blue"
            primaryAction={{
              label: "Guardar y Ver Sesión",
              onClick: handleSaveAndViewSession,
              variant: "primary",
              icon: (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              ),
              disabled: isRecording
            }}
            secondaryActions={[
              {
                label: "Volver a Sesiones",
                onClick: handleBackToSessions,
                variant: "outline",
                icon: <ArrowLeftIcon className="h-4 w-4" />
              }
            ]}
          />

          {/* Estado de la sesión */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <Typography variant="body1" className="text-gray-700">
                  <strong>Participante:</strong> {participante?.nombre || 'Cargando...'}
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <EmailIcon className="w-4 h-4 text-gray-500" />
                <Typography variant="body2" className="text-gray-600">
                  {participante?.email || 'Sin email'}
                </Typography>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Chip variant={isRecording ? 'success' : 'danger'} size="md">
                {isRecording ? 'Transcribiendo' : 'Inactivo'}
              </Chip>
              {isRecording && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Typography variant="body2" className="font-mono">
                    Transcribiendo: {formatRecordingTime(recordingTime)}
                  </Typography>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
