import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Layout, PageHeader } from '../../components/ui';
import Typography from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import { SideModal, Input, Textarea, Select } from '../../components/ui';
import { ArrowLeftIcon, EditIcon, BuildingIcon, UsersIcon, UserIcon, EmailIcon, CalendarIcon, PlusIcon, MessageIcon, AlertTriangleIcon } from '../../components/icons';
import { formatearFecha } from '../../utils/fechas';
import { getEstadoParticipanteVariant } from '../../utils/estadoUtils';

interface Participante {
  id: string;
  nombre: string;
  email: string;
  tipo: 'externo' | 'interno' | 'friend_family';
  empresa_nombre?: string;
  rol_empresa?: string;
  departamento_nombre?: string;
  estado_participante: string;
  fecha_ultima_participacion: string;
  total_participaciones: number;
  comentarios?: string;
  doleres_necesidades?: string;
  created_at: string;
  updated_at: string;
}

interface InvestigacionParticipante {
  id: string;
  nombre: string;
  fecha_participacion: string;
  estado: string;
  tipo_investigacion: string;
  responsable: string;
}

interface DolorParticipante {
  id: string;
  descripcion: string;
  sesion_relacionada?: string;
  fecha_creacion: string;
  creado_por: string;
}

interface ComentarioParticipante {
  id: string;
  contenido: string;
  sesion_relacionada?: string;
  fecha_creacion: string;
  creado_por: string;
}

export default function DetalleParticipante() {
  const router = useRouter();
  const { id } = router.query;
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showError } = useToast();

  const [participante, setParticipante] = useState<Participante | null>(null);
  const [investigaciones, setInvestigaciones] = useState<InvestigacionParticipante[]>([]);
  const [dolores, setDolores] = useState<DolorParticipante[]>([]);
  const [comentarios, setComentarios] = useState<ComentarioParticipante[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('informacion');
  
  // Estados para modales
  const [showCrearDolorModal, setShowCrearDolorModal] = useState(false);
  const [showCrearComentarioModal, setShowCrearComentarioModal] = useState(false);

  useEffect(() => {
    if (id) {
      cargarParticipante();
      cargarInvestigaciones();
      cargarDolores();
      cargarComentarios();
    }
  }, [id]);

  // Manejar el tab desde la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl && ['informacion', 'historial', 'dolores', 'comentarios'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, []);

  const cargarParticipante = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/participantes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setParticipante(data);
      } else {
        showError('Error al cargar el participante');
        router.push('/participantes');
      }
    } catch (error) {
      console.error('Error cargando participante:', error);
      showError('Error al cargar el participante');
      router.push('/participantes');
    } finally {
      setLoading(false);
    }
  };

  const cargarInvestigaciones = async () => {
    try {
      const response = await fetch(`/api/participantes/${id}/investigaciones`);
      if (response.ok) {
        const data = await response.json();
        setInvestigaciones(data.investigaciones || []);
      }
    } catch (error) {
      console.error('Error cargando investigaciones:', error);
    }
  };

  const cargarDolores = async () => {
    try {
      const response = await fetch(`/api/participantes/${id}/dolores`);
      if (response.ok) {
        const data = await response.json();
        setDolores(data.dolores || []);
      }
    } catch (error) {
      console.error('Error cargando dolores:', error);
    }
  };

  const cargarComentarios = async () => {
    try {
      const response = await fetch(`/api/participantes/${id}/comentarios`);
      if (response.ok) {
        const data = await response.json();
        setComentarios(data.comentarios || []);
      }
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'externo': return 'Cliente Externo';
      case 'interno': return 'Cliente Interno';
      case 'friend_family': return 'Friend and Family';
      default: return tipo;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'externo': return <BuildingIcon className="w-5 h-5" />;
      case 'interno': return <UsersIcon className="w-5 h-5" />;
      case 'friend_family': return <UserIcon className="w-5 h-5" />;
      default: return <UserIcon className="w-5 h-5" />;
    }
  };

  const getEstadoVariant = (estado: string) => {
    return getEstadoParticipanteVariant(estado);
  };

  const columnsInvestigaciones = [
    {
      key: 'nombre',
      label: 'Investigación',
      render: (row: InvestigacionParticipante) => (
        <div>
          <Typography variant="subtitle2" weight="medium">
            {row.nombre}
          </Typography>
          <Typography variant="caption" color="secondary">
            {row.tipo_investigacion}
          </Typography>
        </div>
      )
    },
    {
      key: 'fecha_participacion',
      label: 'Fecha de Participación',
      render: (row: InvestigacionParticipante) => (
        <Typography variant="body2">
          {formatearFecha(row.fecha_participacion)}
        </Typography>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row: InvestigacionParticipante) => (
        <Badge variant={getEstadoVariant(row.estado)}>
          {row.estado}
        </Badge>
      )
    },
    {
      key: 'responsable',
      label: 'Responsable',
      render: (row: InvestigacionParticipante) => (
        <Typography variant="body2">
          {row.responsable}
        </Typography>
      )
    }
  ];

  const columnsDolores = [
    {
      key: 'descripcion',
      label: 'Descripción del Dolor',
      render: (row: DolorParticipante) => (
        <Typography variant="body2">
          {row.descripcion}
        </Typography>
      )
    },
    {
      key: 'sesion_relacionada',
      label: 'Sesión Relacionada',
      render: (row: DolorParticipante) => (
        <Typography variant="caption" color="secondary">
          {row.sesion_relacionada || 'General'}
        </Typography>
      )
    },
    {
      key: 'fecha_creacion',
      label: 'Fecha de Creación',
      render: (row: DolorParticipante) => (
        <Typography variant="caption">
          {formatearFecha(row.fecha_creacion)}
        </Typography>
      )
    },
    {
      key: 'creado_por',
      label: 'Creado por',
      render: (row: DolorParticipante) => (
        <Typography variant="caption" color="secondary">
          {row.creado_por}
        </Typography>
      )
    }
  ];

  const columnsComentarios = [
    {
      key: 'contenido',
      label: 'Comentario',
      render: (row: ComentarioParticipante) => (
        <Typography variant="body2">
          {row.contenido}
        </Typography>
      )
    },
    {
      key: 'sesion_relacionada',
      label: 'Sesión Relacionada',
      render: (row: ComentarioParticipante) => (
        <Typography variant="caption" color="secondary">
          {row.sesion_relacionada || 'General'}
        </Typography>
      )
    },
    {
      key: 'fecha_creacion',
      label: 'Fecha de Creación',
      render: (row: ComentarioParticipante) => (
        <Typography variant="caption">
          {formatearFecha(row.fecha_creacion)}
        </Typography>
      )
    },
    {
      key: 'creado_por',
      label: 'Creado por',
      render: (row: ComentarioParticipante) => (
        <Typography variant="caption" color="secondary">
          {row.creado_por}
        </Typography>
      )
    }
  ];

  if (loading) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!participante) {
    return null;
  }

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/participantes')}
              className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <PageHeader
              title={participante.nombre}
              variant="compact"
              color="purple"
              className="mb-0"
              chip={{
                label: participante.estado_participante || 'Sin estado',
                variant: getEstadoVariant(participante.estado_participante || 'default'),
                size: 'sm'
              }}
            />
          </div>

          {/* Acciones principales */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => {
                setParticipanteParaEditar(participante);
                setShowModalEditar(true);
              }}
            >
              <EditIcon className="w-4 h-4" />
              Editar Participante
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={[
              {
                id: 'informacion',
                label: 'Información',
                content: (
                  <div className="space-y-6">
                    {/* Información básica */}
                    <Card className="p-6">
                      <div className="mb-4">
                        <Typography variant="h3" className="mb-2">{participante.nombre}</Typography>
                        <div className="flex items-center gap-3">
                          {participante.estado_participante && (
                            <Badge variant={getEstadoVariant(participante.estado_participante)}>
                              {participante.estado_participante}
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            {getTipoLabel(participante.tipo)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Typography variant="caption" color="secondary">Email</Typography>
                          <Typography variant="body2">{participante.email || 'No especificado'}</Typography>
                        </div>

                        {participante.rol_empresa && (
                          <div>
                            <Typography variant="caption" color="secondary">Rol en la Empresa</Typography>
                            <Typography variant="body2">{participante.rol_empresa}</Typography>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Detalles organizacionales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Información de la organización */}
                      <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <BuildingIcon className="w-5 h-5 text-primary" />
                          <Typography variant="h5">
                            {participante.tipo === 'externo' ? 'Empresa' : 'Organización'}
                          </Typography>
                        </div>
                        
                        <div className="space-y-3">
                          {participante.tipo === 'externo' && participante.empresa_nombre && (
                            <div>
                              <Typography variant="caption" color="secondary">Empresa</Typography>
                              <Typography variant="body2">{participante.empresa_nombre}</Typography>
                            </div>
                          )}
                          
                          {(participante.tipo === 'interno' || participante.tipo === 'friend_family') && participante.departamento_nombre && (
                            <div>
                              <Typography variant="caption" color="secondary">Departamento</Typography>
                              <Typography variant="body2">{participante.departamento_nombre}</Typography>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Estadísticas de participación */}
                      <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <UserIcon className="w-5 h-5 text-primary" />
                          <Typography variant="h5">Participación</Typography>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Typography variant="caption" color="secondary">Total de Participaciones</Typography>
                            <Typography variant="h3" className="text-primary">
                              {participante.total_participaciones}
                            </Typography>
                          </div>
                          
                          <div>
                            <Typography variant="caption" color="secondary">Última Participación</Typography>
                            <Typography variant="body2">
                              {participante.fecha_ultima_participacion ? 
                                formatearFecha(participante.fecha_ultima_participacion) : 
                                'Sin participaciones'
                              }
                            </Typography>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Fechas del sistema */}
                    <Card className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        <Typography variant="h5">Información del Sistema</Typography>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Typography variant="caption" color="secondary">Fecha de Registro</Typography>
                          <Typography variant="body2">{formatearFecha(participante.created_at)}</Typography>
                        </div>
                        
                        <div>
                          <Typography variant="caption" color="secondary">Última Actualización</Typography>
                          <Typography variant="body2">{formatearFecha(participante.updated_at)}</Typography>
                        </div>
                      </div>
                    </Card>
                  </div>
                )
              },
              {
                id: 'historial',
                label: 'Historial de Investigaciones',
                content: (
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <UserIcon className="w-5 h-5 text-primary" />
                      <Typography variant="h4">Historial de Participación</Typography>
                    </div>
                    
                    {investigaciones.length > 0 ? (
                      <>
                        <div className="mb-4">
                          <Typography variant="body2" color="secondary">
                            {investigaciones.length} participación{investigaciones.length !== 1 ? 'es' : ''} registrada{investigaciones.length !== 1 ? 's' : ''}
                          </Typography>
                        </div>
                        <DataTable
                          data={investigaciones}
                          columns={columnsInvestigaciones}
                          loading={false}
                          searchable={false}
                          filterable={false}
                          selectable={false}
                          emptyMessage="No se encontraron investigaciones"
                          rowKey="id"
                        />
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="h5" color="secondary" className="mb-2">
                          Sin participaciones
                        </Typography>
                        <Typography variant="body2" color="secondary">
                          Este participante aún no ha participado en ninguna investigación.
                        </Typography>
                      </div>
                    )}
                  </Card>
                )
              },
              {
                id: 'dolores',
                label: 'Dolores',
                content: (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <AlertTriangleIcon className="w-5 h-5 text-primary" />
                        <Typography variant="h4">Dolores y Necesidades</Typography>
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => setShowCrearDolorModal(true)}
                        className="flex items-center gap-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Registrar Dolor
                      </Button>
                    </div>
                    
                    {dolores.length > 0 ? (
                      <>
                        <div className="mb-4">
                          <Typography variant="body2" color="secondary">
                            {dolores.length} dolor{dolores.length !== 1 ? 'es' : ''} registrado{dolores.length !== 1 ? 's' : ''}
                          </Typography>
                        </div>
                        <DataTable
                          data={dolores}
                          columns={columnsDolores}
                          loading={false}
                          searchable={false}
                          filterable={false}
                          selectable={false}
                          emptyMessage="No se encontraron dolores registrados"
                          rowKey="id"
                        />
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <AlertTriangleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="h5" color="secondary" className="mb-2">
                          Sin dolores registrados
                        </Typography>
                        <Typography variant="body2" color="secondary" className="mb-4">
                          Este participante no tiene dolores o necesidades registradas.
                        </Typography>
                        <Button
                          variant="primary"
                          onClick={() => setShowCrearDolorModal(true)}
                          className="flex items-center gap-2"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Registrar Primer Dolor
                        </Button>
                      </div>
                    )}
                  </Card>
                )
              },
              {
                id: 'comentarios',
                label: 'Comentarios',
                content: (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <MessageIcon className="w-5 h-5 text-primary" />
                        <Typography variant="h4">Comentarios</Typography>
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => setShowCrearComentarioModal(true)}
                        className="flex items-center gap-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Nuevo Comentario
                      </Button>
                    </div>
                    
                    {comentarios.length > 0 ? (
                      <>
                        <div className="mb-4">
                          <Typography variant="body2" color="secondary">
                            {comentarios.length} comentario{comentarios.length !== 1 ? 's' : ''} registrado{comentarios.length !== 1 ? 's' : ''}
                          </Typography>
                        </div>
                        <DataTable
                          data={comentarios}
                          columns={columnsComentarios}
                          loading={false}
                          searchable={false}
                          filterable={false}
                          selectable={false}
                          emptyMessage="No se encontraron comentarios"
                          rowKey="id"
                        />
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <MessageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="h5" color="secondary" className="mb-2">
                          Sin comentarios
                        </Typography>
                        <Typography variant="body2" color="secondary" className="mb-4">
                          Este participante no tiene comentarios registrados.
                        </Typography>
                        <Button
                          variant="primary"
                          onClick={() => setShowCrearComentarioModal(true)}
                          className="flex items-center gap-2"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Crear Primer Comentario
                        </Button>
                      </div>
                    )}
                  </Card>
                )
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="default"
            fullWidth={true}
          />
      </div>
      
      {/* Modal para crear dolores */}
      <CrearDolorModal
        isOpen={showCrearDolorModal}
        onClose={() => setShowCrearDolorModal(false)}
        onSuccess={() => {
          cargarDolores();
          setShowCrearDolorModal(false);
        }}
        participanteId={id as string}
      />
      
      {/* Modal para crear comentarios */}
      <CrearComentarioModal
        isOpen={showCrearComentarioModal}
        onClose={() => setShowCrearComentarioModal(false)}
        onSuccess={() => {
          cargarComentarios();
          setShowCrearComentarioModal(false);
        }}
        participanteId={id as string}
      />
    </Layout>
  );
}

// Componente para crear dolores
function CrearDolorModal({ isOpen, onClose, onSuccess, participanteId }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  participanteId: string;
}) {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    descripcion: '',
    sesion_relacionada: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descripcion.trim()) {
      showError('La descripción del dolor es obligatoria');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/participantes/${participanteId}/dolores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccess('Dolor registrado exitosamente');
        setFormData({ descripcion: '', sesion_relacionada: '' });
        onSuccess();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al registrar dolor');
      }
    } catch (error) {
      console.error('Error registrando dolor:', error);
      showError('Error al registrar dolor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Dolor o Necesidad"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Descripción del Dolor/Necesidad *
          </Typography>
          <Textarea
            value={formData.descripcion}
            onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Describe el dolor o necesidad identificada..."
            rows={4}
            disabled={loading}
            fullWidth
          />
        </div>

        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Sesión Relacionada (Opcional)
          </Typography>
          <Input
            value={formData.sesion_relacionada}
            onChange={(e) => setFormData(prev => ({ ...prev, sesion_relacionada: e.target.value }))}
            placeholder="Ej: Sesión de Usabilidad 1, Entrevista inicial..."
            disabled={loading}
            fullWidth
          />
        </div>

        <div className="flex gap-4 pt-6 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Registrando...' : 'Registrar Dolor'}
          </Button>
        </div>
      </form>
    </SideModal>
  );
}

// Componente para crear comentarios
function CrearComentarioModal({ isOpen, onClose, onSuccess, participanteId }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  participanteId: string;
}) {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contenido: '',
    sesion_relacionada: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contenido.trim()) {
      showError('El contenido del comentario es obligatorio');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/participantes/${participanteId}/comentarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccess('Comentario creado exitosamente');
        setFormData({ contenido: '', sesion_relacionada: '' });
        onSuccess();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al crear comentario');
      }
    } catch (error) {
      console.error('Error creando comentario:', error);
      showError('Error al crear comentario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Comentario"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Contenido del Comentario *
          </Typography>
          <Textarea
            value={formData.contenido}
            onChange={(e) => setFormData(prev => ({ ...prev, contenido: e.target.value }))}
            placeholder="Escribe tu comentario aquí..."
            rows={4}
            disabled={loading}
            fullWidth
          />
        </div>

        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Sesión Relacionada (Opcional)
          </Typography>
          <Input
            value={formData.sesion_relacionada}
            onChange={(e) => setFormData(prev => ({ ...prev, sesion_relacionada: e.target.value }))}
            placeholder="Ej: Sesión de Usabilidad 1, Entrevista inicial..."
            disabled={loading}
            fullWidth
          />
        </div>

        <div className="flex gap-4 pt-6 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Creando...' : 'Crear Comentario'}
          </Button>
        </div>
      </form>
    </SideModal>
  );
}
