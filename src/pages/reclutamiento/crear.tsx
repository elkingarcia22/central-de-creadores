import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Layout, Typography, Card, Button, Input, Select, DatePicker, UserSelectorWithAvatar, Textarea } from '../../components/ui';
import { 
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  BuildingIcon,
  UsersIcon,
  SaveIcon,
  PlusIcon,
  InfoIcon
} from '../../components/icons';
import { obtenerUsuarios } from '../../api/supabase-investigaciones';
import { obtenerInvestigacionPorId } from '../../api/supabase-investigaciones';
import { getMinDate, createUTCDateFromLocal } from '../../utils/timezone';

interface CrearReclutamientoPageProps {}

interface Usuario {
  id: string;
  nombre: string;
  apellidos?: string;
  email: string;
  avatar_url?: string;
}

interface RolEmpresa {
  id: string;
  nombre: string;
}

interface Empresa {
  id: string;
  nombre: string;
}

interface ParticipanteInterno {
  id: string;
  nombre: string;
  email: string;
  rol_empresa_id: string;
  departamento_id?: string;
  departamento?: string;
  departamento_categoria?: string;
}

interface ParticipanteExterno {
  id: string;
  nombre: string;
  rol_empresa_id: string;
  doleres_necesidades?: string;
  descripcion?: string;
  kam_id?: string;
  empresa_id?: string;
  productos_relacionados?: string;
  estado_participante?: string;
  fecha_ultima_participacion?: string;
}

interface Investigacion {
  id: string;
  nombre: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  responsable_id?: string;
  responsable_nombre?: string;
  producto_nombre?: string;
  tipo_investigacion_nombre?: string;
}

const CrearReclutamientoPage: NextPage<CrearReclutamientoPageProps> = () => {
  const router = useRouter();
  const { investigacion: investigacionId } = router.query;
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();

  // Estados del formulario
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    participantes_id: '',
    reclutador_id: '',
    fechaSesion: '',
    horaSesion: '',
    investigacion_id: '',
    tipoParticipante: 'externo' as 'externo' | 'interno' | 'friend_family',
    participanteSeleccionado: null as ParticipanteInterno | ParticipanteExterno | null,
    estadoAgendamiento: 'pendiente' as 'pendiente' | 'en_progreso' | 'agendado' | 'completado' | 'cancelado'
  });

  // Estados para datos de catálogo
  const [responsables, setResponsables] = useState<Usuario[]>([]);
  const [participantesExternos, setParticipantesExternos] = useState<ParticipanteExterno[]>([]);
  const [participantesInternos, setParticipantesInternos] = useState<ParticipanteInterno[]>([]);
  const [participantesFriendFamily, setParticipantesFriendFamily] = useState<any[]>([]);
  const [rolesEmpresa, setRolesEmpresa] = useState<RolEmpresa[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [investigacion, setInvestigacion] = useState<Investigacion | null>(null);

  // Estados para modales de creación
  const [showModalExterno, setShowModalExterno] = useState(false);
  const [showModalInterno, setShowModalInterno] = useState(false);
  const [showModalFriendFamily, setShowModalFriendFamily] = useState(false);

  // Estados para nuevo participante
  const [nuevoParticipanteExterno, setNuevoParticipanteExterno] = useState({
    nombre: '',
    rolEmpresaId: '',
    doleresNecesidades: '',
    descripcion: '',
    kamId: '',
    empresaId: '',
    productosRelacionados: '',
    estadoParticipante: '',
    fechaUltimaParticipacion: ''
  });

  const [nuevoParticipanteInterno, setNuevoParticipanteInterno] = useState({
    nombre: '',
    email: '',
    departamentoId: '',
    rolEmpresaId: ''
  });

  const [nuevoParticipanteFriendFamily, setNuevoParticipanteFriendFamily] = useState({
    nombre: '',
    email: '',
    departamentoId: ''
  });

  // Estados para mostrar formularios inline
  const [mostrarFormularioExterno, setMostrarFormularioExterno] = useState(false);
  const [mostrarFormularioInterno, setMostrarFormularioInterno] = useState(false);
  const [mostrarFormularioFriendFamily, setMostrarFormularioFriendFamily] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoadingData(true);
        await Promise.all([
          cargarResponsables(),
          cargarParticipantesExternos(),
          cargarParticipantesInternos(),
          cargarParticipantesFriendFamily(), // Added for Friend and Family
          cargarInvestigacion()
        ]);
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        showError('Error al cargar los datos iniciales');
      } finally {
        setLoadingData(false);
      }
    };

    cargarDatosIniciales();
  }, [investigacionId]);

  const cargarResponsables = async () => {
    try {
      const response = await obtenerUsuarios();
      if (response.data) {
        setResponsables(response.data as any);
      } else {
        console.error('Error cargando responsables:', response.error);
      }
    } catch (error) {
      console.error('Error cargando responsables:', error);
    }
  };

  const cargarParticipantesExternos = async () => {
    try {
      const response = await fetch('/api/participantes');
      if (response.ok) {
        const data = await response.json();
        setParticipantesExternos(data);
      }
    } catch (error) {
      console.error('Error cargando participantes externos:', error);
    }
  };

  const cargarParticipantesInternos = async () => {
    try {
      const response = await fetch('/api/participantes-internos');
      if (response.ok) {
        const data = await response.json();
        setParticipantesInternos(data);
      }
    } catch (error) {
      console.error('Error cargando participantes internos:', error);
    }
  };

  const cargarParticipantesFriendFamily = async () => {
    try {
      const response = await fetch('/api/participantes-friend-family');
      if (response.ok) {
        const data = await response.json();
        setParticipantesFriendFamily(data);
      }
    } catch (error) {
      console.error('Error cargando participantes Friend and Family:', error);
    }
  };

  const cargarInvestigacion = async () => {
    if (investigacionId && typeof investigacionId === 'string') {
      try {
        const resultado = await obtenerInvestigacionPorId(investigacionId);
        if (!resultado.error && resultado.data) {
          setInvestigacion(resultado.data);
        }
      } catch (error) {
        console.error('Error cargando investigación:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.participantes_id || !formData.reclutador_id || !formData.fechaSesion || !formData.horaSesion) {
      showError('Por favor completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      // Combinar fecha y hora en un timestamp ISO para fecha_sesion
      const fechaHoraCompleta = createUTCDateFromLocal(formData.fechaSesion, formData.horaSesion);
      
      const response = await fetch('/api/reclutamientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantes_id: formData.participantes_id,
          reclutador_id: formData.reclutador_id,
          fecha_sesion: fechaHoraCompleta,
          hora_sesion: formData.horaSesion, // Enviar hora por separado
          investigacion_id: formData.investigacion_id
        }),
      });

      if (response.ok) {
        showSuccess('Reclutamiento creado exitosamente');
        router.push('/reclutamiento');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al crear el reclutamiento');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al crear el reclutamiento');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearParticipanteExterno = async () => {
    if (!nuevoParticipanteExterno.nombre || !nuevoParticipanteExterno.rolEmpresaId) {
      showError('Por favor completa los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/participantes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoParticipanteExterno),
      });

      if (response.ok) {
        const nuevoParticipante = await response.json();
        showSuccess('Participante externo creado exitosamente');
        
        // Agregar a la lista y seleccionar
        setParticipantesExternos(prev => [...prev, nuevoParticipante]);
        setFormData(prev => ({
          ...prev,
          participanteSeleccionado: nuevoParticipante
        }));
        
        // Limpiar formulario
        setNuevoParticipanteExterno({
          nombre: '',
          rolEmpresaId: '',
          doleresNecesidades: '',
          descripcion: '',
          kamId: '',
          empresaId: '',
          productosRelacionados: '',
          estadoParticipante: '',
          fechaUltimaParticipacion: ''
        });
        setMostrarFormularioExterno(false);
      } else {
        const error = await response.json();
        showError(error.error || 'Error al crear participante externo');
      }
    } catch (error) {
      console.error('Error creando participante externo:', error);
      showError('Error al crear participante externo');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearParticipanteInterno = async () => {
    if (!nuevoParticipanteInterno.nombre || !nuevoParticipanteInterno.email) {
      showError('Por favor completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/participantes-internos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nuevoParticipanteInterno.nombre,
          email: nuevoParticipanteInterno.email,
          departamento_id: nuevoParticipanteInterno.departamentoId || null,
          rol_empresa_id: nuevoParticipanteInterno.rolEmpresaId || null
        }),
      });

      if (response.ok) {
        const nuevoParticipante = await response.json();
        setParticipantesInternos(prev => [...prev, nuevoParticipante]);
        setFormData(prev => ({ ...prev, participantes_id: nuevoParticipante.id }));
        setNuevoParticipanteInterno({ nombre: '', email: '', departamentoId: '', rolEmpresaId: '' });
        setMostrarFormularioInterno(false);
        showSuccess('Participante interno creado exitosamente');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al crear el participante interno');
      }
    } catch (error) {
      console.error('Error creando participante interno:', error);
      showError('Error interno del servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearParticipanteFriendFamily = async () => {
    if (!nuevoParticipanteFriendFamily.nombre || !nuevoParticipanteFriendFamily.email) {
      showError('Por favor completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/participantes-friend-family', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nuevoParticipanteFriendFamily.nombre,
          email: nuevoParticipanteFriendFamily.email,
          departamento_id: nuevoParticipanteFriendFamily.departamentoId || null
        }),
      });

      if (response.ok) {
        const nuevoParticipante = await response.json();
        setParticipantesFriendFamily(prev => [...prev, nuevoParticipante]);
        setFormData(prev => ({ ...prev, participantes_id: nuevoParticipante.id }));
        setNuevoParticipanteFriendFamily({ nombre: '', email: '', departamentoId: '' });
        setMostrarFormularioFriendFamily(false);
        showSuccess('Participante Friend and Family creado exitosamente');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al crear el participante Friend and Family');
      }
    } catch (error) {
      console.error('Error creando participante Friend and Family:', error);
      showError('Error interno del servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    router.push('/reclutamiento');
  };

  const participantesDisponibles = formData.tipoParticipante === 'externo' 
    ? participantesExternos 
    : formData.tipoParticipante === 'interno'
    ? participantesInternos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        email: p.email,
        tipo: 'interno' as const
      }))
    : participantesFriendFamily.map(p => ({
        id: p.id,
        nombre: p.nombre,
        email: p.email,
        tipo: 'friend_family' as const
      }));

  if (loadingData) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Typography variant="h2">
                Agregar Participante
              </Typography>
              <Typography variant="body2" color="secondary">
                Agrega un nuevo participante para la investigación
              </Typography>
            </div>
            
            {/* Acciones */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleVolver}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={loading}
                disabled={loading || !formData.reclutador_id || !formData.fechaSesion || !formData.participanteSeleccionado}
              >
                <SaveIcon className="w-4 h-4 mr-2" />
                Agregar Participante
              </Button>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información de la investigación */}
            {investigacion && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <InfoIcon className="w-5 h-5 text-primary" />
                  <Typography variant="h4">Investigación</Typography>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="subtitle2" weight="medium" className="mb-1">
                      Nombre
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      {investigacion.nombre}
                    </Typography>
                  </div>
                  
                  {investigacion.producto_nombre && (
                    <div>
                      <Typography variant="subtitle2" weight="medium" className="mb-1">
                        Producto
                      </Typography>
                      <Typography variant="body2" color="secondary">
                        {investigacion.producto_nombre}
                      </Typography>
                    </div>
                  )}
                  
                  {investigacion.tipo_investigacion_nombre && (
                    <div>
                      <Typography variant="subtitle2" weight="medium" className="mb-1">
                        Tipo de Investigación
                      </Typography>
                      <Typography variant="body2" color="secondary">
                        {investigacion.tipo_investigacion_nombre}
                      </Typography>
                    </div>
                  )}
                  
                  {investigacion.responsable_nombre && (
                    <div>
                      <Typography variant="subtitle2" weight="medium" className="mb-1">
                        Responsable
                      </Typography>
                      <Typography variant="body2" color="secondary">
                        {investigacion.responsable_nombre}
                      </Typography>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Información del reclutamiento */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <UserIcon className="w-5 h-5 text-primary" />
                <Typography variant="h4">Información del Reclutamiento</Typography>
              </div>
              
              <div className="space-y-6">
                {/* Responsable del agendamiento */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Responsable del Agendamiento *
                  </Typography>
                  <UserSelectorWithAvatar
                    value={formData.reclutador_id}
                    onChange={(value) => setFormData(prev => ({ ...prev, reclutador_id: value }))}
                    users={responsables.map(r => ({
                      id: r.id,
                      full_name: r.nombre,
                      email: r.email,
                      avatar_url: r.avatar_url
                    }))}
                    placeholder="Seleccionar responsable"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Fecha de la sesión */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Fecha de la Sesión *
                  </Typography>
                  <DatePicker
                    value={formData.fechaSesion}
                    onChange={date => setFormData(prev => ({ ...prev, fechaSesion: date ? date.toISOString().split('T')[0] : '' }))}
                    placeholder="Seleccionar fecha"
                    minDate={new Date(getMinDate())}
                    disabled={loading}
                    required
                    fullWidth
                  />
                </div>

                {/* Hora de la sesión */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Hora de la Sesión *
                  </Typography>
                  <Input
                    type="time"
                    value={formData.horaSesion}
                    onChange={(e) => setFormData(prev => ({ ...prev, horaSesion: e.target.value }))}
                    disabled={loading}
                    required
                    fullWidth
                  />
                </div>

                {/* Tipo de participante */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Tipo de Participante *
                  </Typography>
                  <Select
                    value={formData.tipoParticipante}
                    onChange={(value) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        tipoParticipante: value as 'externo' | 'interno' | 'friend_family',
                        participanteSeleccionado: null
                      }));
                      setMostrarFormularioExterno(false);
                      setMostrarFormularioInterno(false);
                      setMostrarFormularioFriendFamily(false);
                    }}
                    options={[
                      { value: 'externo', label: 'Cliente Externo' },
                      { value: 'interno', label: 'Cliente Interno' },
                      { value: 'friend_family', label: 'Friend and Family' }
                    ]}
                    placeholder="Seleccionar tipo de participante"
                    disabled={loading}
                    fullWidth
                  />
                </div>

                {/* Selección de participante */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Participante *
                  </Typography>
                  <div className="space-y-3">
                    <Select
                      value={formData.participanteSeleccionado?.id || ''}
                      onChange={(value) => {
                        const participante = participantesDisponibles.find(p => p.id === value);
                        setFormData(prev => ({ ...prev, participanteSeleccionado: participante as any || null }));
                      }}
                      placeholder={`Seleccionar participante ${formData.tipoParticipante}`}
                      options={participantesDisponibles.map(p => ({
                        value: p.id,
                        label: p.nombre
                      }))}
                      disabled={loading}
                      fullWidth
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (formData.tipoParticipante === 'interno') {
                          setMostrarFormularioInterno(true);
                          setMostrarFormularioExterno(false);
                          setMostrarFormularioFriendFamily(false);
                        } else if (formData.tipoParticipante === 'friend_family') {
                          setMostrarFormularioFriendFamily(true);
                          setMostrarFormularioInterno(false);
                          setMostrarFormularioExterno(false);
                        } else {
                          setMostrarFormularioExterno(true);
                          setMostrarFormularioInterno(false);
                          setMostrarFormularioFriendFamily(false);
                        }
                      }}
                      disabled={loading}
                      className="w-full"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Crear Nuevo Participante {formData.tipoParticipante === 'interno' ? 'Interno' : formData.tipoParticipante === 'friend_family' ? 'Friend and Family' : 'Externo'}
                    </Button>
                  </div>
                </div>

                {/* Estado de agendamiento */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Estado de Agendamiento
                  </Typography>
                  <Select
                    value={formData.estadoAgendamiento}
                    onChange={(value) => setFormData(prev => ({ ...prev, estadoAgendamiento: value as any }))}
                    options={[
                      { value: 'pendiente', label: 'Pendiente' },
                      { value: 'en_progreso', label: 'En Progreso' },
                      { value: 'agendado', label: 'Agendado' },
                      { value: 'completado', label: 'Completado' },
                      { value: 'cancelado', label: 'Cancelado' }
                    ]}
                    disabled={loading}
                    fullWidth
                  />
                </div>
              </div>
            </Card>

            {/* Formulario para crear participante externo */}
            {mostrarFormularioExterno && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <UsersIcon className="w-5 h-5 text-primary" />
                  <Typography variant="h4">Crear Participante Externo</Typography>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre *"
                    value={nuevoParticipanteExterno.nombre}
                    onChange={(e) => setNuevoParticipanteExterno(prev => ({
                      ...prev,
                      nombre: e.target.value
                    }))}
                    placeholder="Nombre del participante"
                    disabled={loading}
                    required
                  />
                  
                  <Input
                    label="Rol en la Empresa *"
                    value={nuevoParticipanteExterno.rolEmpresaId}
                    onChange={(e) => setNuevoParticipanteExterno(prev => ({
                      ...prev,
                      rolEmpresaId: e.target.value
                    }))}
                    placeholder="Ej: Gerente de Producto"
                    disabled={loading}
                    required
                  />
                  
                  <div className="md:col-span-2">
                    <Textarea
                      label="Dolores y Necesidades"
                      value={nuevoParticipanteExterno.doleresNecesidades}
                      onChange={(e) => setNuevoParticipanteExterno(prev => ({
                        ...prev,
                        doleresNecesidades: e.target.value
                      }))}
                      placeholder="Describe los principales dolores y necesidades del participante"
                      rows={4}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Textarea
                      label="Descripción"
                      value={nuevoParticipanteExterno.descripcion}
                      onChange={(e) => setNuevoParticipanteExterno(prev => ({
                        ...prev,
                        descripcion: e.target.value
                      }))}
                      placeholder="Descripción adicional del participante"
                      rows={4}
                      disabled={loading}
                    />
                  </div>
                  
                  <Input
                    label="KAM"
                    value={nuevoParticipanteExterno.kamId}
                    onChange={(e) => setNuevoParticipanteExterno(prev => ({
                      ...prev,
                      kamId: e.target.value
                    }))}
                    placeholder="Key Account Manager"
                    disabled={loading}
                  />
                  
                  <Input
                    label="Empresa"
                    value={nuevoParticipanteExterno.empresaId}
                    onChange={(e) => setNuevoParticipanteExterno(prev => ({
                      ...prev,
                      empresaId: e.target.value
                    }))}
                    placeholder="Empresa del participante"
                    disabled={loading}
                  />
                  
                  <Input
                    label="Productos Relacionados"
                    value={nuevoParticipanteExterno.productosRelacionados}
                    onChange={(e) => setNuevoParticipanteExterno(prev => ({
                      ...prev,
                      productosRelacionados: e.target.value
                    }))}
                    placeholder="Productos que utiliza el participante"
                    disabled={loading}
                  />
                  
                  <Input
                    label="Estado del Participante"
                    value={nuevoParticipanteExterno.estadoParticipante}
                    onChange={(e) => setNuevoParticipanteExterno(prev => ({
                      ...prev,
                      estadoParticipante: e.target.value
                    }))}
                    placeholder="Estado actual del participante"
                    disabled={loading}
                  />
                  
                  <Input
                    label="Fecha Última Participación"
                    type="text"
                    value={nuevoParticipanteExterno.fechaUltimaParticipacion}
                    onChange={(e) => setNuevoParticipanteExterno(prev => ({
                      ...prev,
                      fechaUltimaParticipacion: e.target.value
                    }))}
                    disabled={loading}
                  />
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMostrarFormularioExterno(false);
                      setNuevoParticipanteExterno({
                        nombre: '',
                        rolEmpresaId: '',
                        doleresNecesidades: '',
                        descripcion: '',
                        kamId: '',
                        empresaId: '',
                        productosRelacionados: '',
                        estadoParticipante: '',
                        fechaUltimaParticipacion: ''
                      });
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCrearParticipanteExterno}
                    loading={loading}
                    disabled={loading || !nuevoParticipanteExterno.nombre || !nuevoParticipanteExterno.rolEmpresaId}
                  >
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Crear Participante
                  </Button>
                </div>
              </Card>
            )}

            {/* Formulario para crear participante interno */}
            {mostrarFormularioInterno && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <UsersIcon className="w-5 h-5 text-primary" />
                  <Typography variant="h4">Crear Participante Interno</Typography>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre *"
                    value={nuevoParticipanteInterno.nombre}
                    onChange={(e) => setNuevoParticipanteInterno(prev => ({
                      ...prev,
                      nombre: e.target.value
                    }))}
                    placeholder="Nombre del participante"
                    disabled={loading}
                    required
                  />
                  
                  <Input
                    label="Email *"
                    type="email"
                    value={nuevoParticipanteInterno.email}
                    onChange={(e) => setNuevoParticipanteInterno(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    placeholder="email@empresa.com"
                    disabled={loading}
                    required
                  />
                  
                  <Input
                    label="Rol en la Empresa"
                    value={nuevoParticipanteInterno.rolEmpresaId}
                    onChange={(e) => setNuevoParticipanteInterno(prev => ({
                      ...prev,
                      rolEmpresaId: e.target.value
                    }))}
                    placeholder="Ej: Gerente de Producto"
                    disabled={loading}
                  />
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMostrarFormularioInterno(false);
                      setNuevoParticipanteInterno({
                        nombre: '',
                        email: '',
                        rolEmpresaId: '',
                        departamentoId: ''
                      });
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCrearParticipanteInterno}
                    loading={loading}
                    disabled={loading || !nuevoParticipanteInterno.nombre || !nuevoParticipanteInterno.email}
                  >
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Crear Participante
                  </Button>
                </div>
              </Card>
            )}

            {/* Formulario para crear participante Friend and Family */}
            {mostrarFormularioFriendFamily && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <UsersIcon className="w-5 h-5 text-primary" />
                  <Typography variant="h4">Crear Participante Friend and Family</Typography>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre *"
                    value={nuevoParticipanteFriendFamily.nombre}
                    onChange={(e) => setNuevoParticipanteFriendFamily(prev => ({
                      ...prev,
                      nombre: e.target.value
                    }))}
                    placeholder="Nombre del participante"
                    disabled={loading}
                    required
                  />
                  
                  <Input
                    label="Email *"
                    type="email"
                    value={nuevoParticipanteFriendFamily.email}
                    onChange={(e) => setNuevoParticipanteFriendFamily(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    placeholder="email@amigo.com"
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMostrarFormularioFriendFamily(false);
                      setNuevoParticipanteFriendFamily({
                        nombre: '',
                        email: '',
                        departamentoId: ''
                      });
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCrearParticipanteFriendFamily}
                    loading={loading}
                    disabled={loading || !nuevoParticipanteFriendFamily.nombre || !nuevoParticipanteFriendFamily.email}
                  >
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Crear Participante
                  </Button>
                </div>
              </Card>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CrearReclutamientoPage; 