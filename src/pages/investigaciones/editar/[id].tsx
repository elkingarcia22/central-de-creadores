import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useRol } from '../../../contexts/RolContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../contexts/ToastContext';
import { useUser } from '../../../contexts/UserContext';
import { usePermisos } from '../../../utils/permisosUtils';
import { Layout, Typography, Card, Button, Input, Select, DatePicker, UserSelectorWithAvatar, Chip, PageHeader, FormContainer, FormItem, Subtitle, EmptyState } from '../../../components/ui';
import { 
  ArrowLeftIcon,
  InfoIcon,
  UserIcon,
  SesionesIcon,
  ConfiguracionesIcon,
  EmpresasIcon
} from '../../../components/icons';
import { 
  obtenerInvestigacionPorId,
  actualizarInvestigacion,
  obtenerProductos,
  obtenerPeriodos,
  obtenerTiposInvestigacion,
  obtenerUsuarios
} from '../../../api/supabase-investigaciones';
import { 
  OPCIONES_ESTADO_INVESTIGACION,
  OPCIONES_TIPO_SESION
} from '../../../types/supabase-investigaciones';
import { 
  EstadoAgendamiento
} from '../../../types/investigaciones';
import { formatearFechaParaInput } from '../../../utils/fechas';
import { getChipVariant, getChipText } from '../../../utils/chipUtils';
// Tipos de Supabase para catálogos reales
import type {
  Producto,
  Periodo,
  TipoInvestigacion,
  Usuario,
  EstadoInvestigacion,
  Investigacion
} from '../../../types/supabase-investigaciones';

const rolesPermitidos = ['administrador', 'investigador'];

const EditarInvestigacionPage: NextPage = () => {
  const { rolSeleccionado, loading } = useRol();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { userProfile: usuarioLogueado } = useUser();
  const { tienePermisoSobreElemento, esAdministrador } = usePermisos();
  const router = useRouter();
  const { id } = router.query;
  
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [investigacion, setInvestigacion] = useState<Investigacion | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [tiposInvestigacion, setTiposInvestigacion] = useState<TipoInvestigacion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    producto: '',
    periodo: '',
    fecha_inicio: '',
    fecha_fin: '',
    responsable_id: '',
    implementador_id: '',
    tipo_investigacion_id: '',
    estado: 'en_borrador' as EstadoInvestigacion
  });

  // IDs REALES como fallback (extraídos de Supabase)
  const IDS_FALLBACK = {
    productos: [
      { id: '01acf3dd-d883-410b-aa5e-3f8c8fec1670', nombre: 'Design system' },
      { id: '07baf27d-5273-46c6-b2bc-8829d7f3b573', nombre: 'Comunicaciones' },
      { id: '08e6b770-b69e-4e4e-aeef-aec8c5c247b1', nombre: 'Analytics' },
      { id: '0b513a20-60dd-4541-b464-4fd0ca74feac', nombre: 'Objetivos' }
    ],
    tipos_investigacion: [
      { id: 'b8ebc601-e349-470c-ba4c-ff28491f36dd', nombre: 'Usabilidad' },
      { id: '11a4b1cc-24dc-4955-a3e7-c87ab228546a', nombre: 'A/B Testing' },
      { id: '1f7e32e9-b47c-4328-af98-bf957f786e6f', nombre: 'Focus group' },
      { id: '2408eebd-07e1-4967-a831-fc77d29e7ea4', nombre: 'First Click Testing' }
    ],
    periodos: [
      { id: '04352043-59d9-46ba-9ffa-26920349de9c', nombre: '2027-Q4', etiqueta: '2027-Q4' },
      { id: '12a79d96-c875-4641-a8cb-8e487ba1b62', nombre: 'Q2 2024', etiqueta: 'Q2 2024' },
      { id: '157b6094-f606-46f1-9f1a-f6bb4abf0fbf', nombre: '2028-Q3', etiqueta: '2028-Q3' }
    ],
    usuarios: [
      { id: 'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d', full_name: 'Usuario Chacal', email: 'oficialchacal@gmail.com' },
      { id: 'bea59fc5-812f-4b71-8228-a50ffc85c2e8', full_name: 'Eduardo García', email: 'egarcia@ubits.co' },
      { id: 'a0f5c515-0b4b-4113-829b-22fa44d18273', full_name: 'Stefani Rojas', email: 'stefani.rojas.acosta@gmail.com' }
    ]
  };

  // Función para obtener el color del badge según el estado
  const obtenerColorEstado = (estado: EstadoInvestigacion): any => {
    return getChipVariant(estado);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const cargarDatos = async () => {
      console.log('🚀 Iniciando carga de datos para edición...');
      setLoadingData(true);
      
      try {
        // Cargar investigación y catálogos en paralelo
        const [
          respuestaInvestigacion,
          respuestaProductos,
          respuestaTipos,
          respuestaUsuarios,
          respuestaPeriodos
        ] = await Promise.all([
          obtenerInvestigacionPorId(id),
          obtenerProductos(),
          obtenerTiposInvestigacion(),
          obtenerUsuarios(),
          obtenerPeriodos()
        ]);

        // Manejar investigación
        if (respuestaInvestigacion.error) {
          showError('Error cargando investigación', respuestaInvestigacion.error);
          router.push('/investigaciones');
          return;
        }

        const inv = respuestaInvestigacion.data;
        setInvestigacion(inv);
        
        // Llenar formulario con datos existentes
        setFormData({
          nombre: inv.nombre || '',
          producto: inv.producto_id || '',
          periodo: inv.periodo_id || '',
          fecha_inicio: formatearFechaParaInput(inv.fecha_inicio),
          fecha_fin: formatearFechaParaInput(inv.fecha_fin),
          responsable_id: inv.responsable_id || '',
          implementador_id: inv.implementador_id || '',
          tipo_investigacion_id: inv.tipo_investigacion_id || '',
          estado: inv.estado || 'en_borrador'
        });

        console.log('✅ Investigación cargada:', inv.nombre);
        console.log('📋 Datos del formulario:', {
          nombre: inv.nombre,
          producto_id: inv.producto_id,
          responsable_id: inv.responsable_id,
          estado: inv.estado
        });

        // Manejar catálogos con fallbacks
        if (respuestaProductos.data && respuestaProductos.data.length > 0) {
          setProductos(respuestaProductos.data);
        } else {
          console.log('⚠️ Usando productos fallback');
          setProductos(IDS_FALLBACK.productos);
        }
        
        if (respuestaTipos.data && respuestaTipos.data.length > 0) {
          setTiposInvestigacion(respuestaTipos.data);
        } else {
          console.log('⚠️ Usando tipos fallback');
          setTiposInvestigacion(IDS_FALLBACK.tipos_investigacion);
        }
        
        if (respuestaUsuarios.data && respuestaUsuarios.data.length > 0) {
          setUsuarios(respuestaUsuarios.data);
        } else {
          console.log('⚠️ Usando usuarios fallback');
          setUsuarios(IDS_FALLBACK.usuarios);
        }
        
        if (respuestaPeriodos.data && respuestaPeriodos.data.length > 0) {
          setPeriodos(respuestaPeriodos.data);
        } else {
          console.log('⚠️ Usando períodos fallback');
          setPeriodos(IDS_FALLBACK.periodos);
        }
        
      } catch (error) {
        console.error('⚠️ Error cargando datos:', error);
        showError('Error cargando datos', 'No se pudieron cargar los datos necesarios');
        router.push('/investigaciones');
      } finally {
        setLoadingData(false);
      }
    };

    cargarDatos();
  }, [id, router, showError]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);

    try {
      if (!id || typeof id !== 'string') {
        showError('ID de investigación no válido');
        return;
      }

      // Validar campos requeridos
      if (!formData.nombre.trim()) {
        showError('El nombre de la investigación es requerido');
        return;
      }

      if (!formData.tipo_investigacion_id) {
        showError('El tipo de investigación es requerido');
        return;
      }

      if (!formData.producto) {
        showError('El producto es requerido');
        return;
      }

      if (!formData.fecha_inicio) {
        showError('La fecha de inicio es requerida');
        return;
      }

      if (!formData.fecha_fin) {
        showError('La fecha de fin es requerida');
        return;
      }

      // Convertir formData al formato esperado por la API
      const datosParaActualizar = {
        nombre: formData.nombre.trim(),
        tipo_investigacion_id: formData.tipo_investigacion_id,
        producto_id: formData.producto,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        periodo_id: formData.periodo || null,
        responsable_id: formData.responsable_id || null,
        implementador_id: formData.implementador_id || null,
        estado: formData.estado
      };

      console.log('📝 Datos para actualizar investigación:', datosParaActualizar);

      const resultado = await actualizarInvestigacion(id, datosParaActualizar);
      
      if (resultado.error) {
        showError('Error al actualizar investigación', resultado.error);
        return;
      }

      showSuccess('¡Investigación actualizada exitosamente!');
      
      // Redirigir a la vista de la investigación
      router.push(`/investigaciones/ver/${id}`);

    } catch (error: any) {
      console.error('Error en handleSubmit:', error);
      showError('Error inesperado', error.message || 'Error al actualizar la investigación');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleVolver = () => {
    router.push('/investigaciones');
  };

  // Verificar permisos
  if (loading) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted-solid rounded w-1/3"></div>
            <div className="h-64 bg-muted-solid rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Verificar permisos de edición cuando la investigación esté cargada
  if (investigacion && !tienePermisoSobreElemento(investigacion, 'investigaciones', 'editar')) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <EmptyState
            icon={<ConfiguracionesIcon className="w-8 h-8" />}
            title="Acceso denegado"
            description="No tienes permisos para editar esta investigación."
            actionText="Volver a Investigaciones"
            onAction={() => router.push('/investigaciones')}
          />
        </div>
      </Layout>
    );
  }

  // Loading de datos
  if (loadingData) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-muted-solid rounded"></div>
              <div className="h-8 bg-muted-solid rounded w-1/3"></div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="h-64 bg-muted-solid rounded"></div>
              <div className="h-48 bg-muted-solid rounded"></div>
              <div className="h-48 bg-muted-solid rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!investigacion) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <EmptyState
            icon={<InfoIcon className="w-8 h-8" />}
            title="Investigación no encontrada"
            description="La investigación que buscas no existe o no tienes permisos para verla."
            actionText="Volver a Investigaciones"
            onAction={() => router.push('/investigaciones')}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <PageHeader
            title={investigacion.nombre}
            subtitle="Edita la información de la investigación"
            variant="compact"
            color="blue"
            className="mb-0 flex-1"
            chip={{
              label: investigacion.estado?.replace('_', ' ') || '',
              variant: obtenerColorEstado(investigacion.estado),
              size: 'sm'
            }}
            primaryAction={{
              label: "Guardar Cambios",
              onClick: handleSubmit,
              variant: "primary",
              disabled: loadingForm
            }}
            secondaryActions={[
              {
                label: "Cancelar",
                onClick: handleVolver,
                variant: "secondary"
              }
            ]}
          />
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <FormContainer>
            <div className="flex items-center gap-2 mb-6">
              <InfoIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Subtitle>Información Básica</Subtitle>
            </div>
            
            <div className="space-y-4">
              <FormItem>
                <Input
                  label="Nombre de la investigación"
                  placeholder="Ej: Investigación de usabilidad del dashboard"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  required
                  fullWidth
                />
              </FormItem>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormItem>
                  <Select
                    label="Tipo de investigación"
                    placeholder="Seleccionar tipo"
                    value={formData.tipo_investigacion_id}
                    onChange={(value) => handleInputChange('tipo_investigacion_id', value.toString())}
                    options={tiposInvestigacion.map(tipo => ({
                      value: tipo.id,
                      label: tipo.nombre
                    }))}
                    required
                    fullWidth
                  />
                </FormItem>
                
                <FormItem>
                  <Select
                    label="Producto"
                    placeholder="Seleccionar producto"
                    value={formData.producto}
                    onChange={(value) => handleInputChange('producto', value.toString())}
                    options={productos.map(producto => ({
                      value: producto.id,
                      label: producto.nombre
                    }))}
                    required
                    fullWidth
                  />
                </FormItem>

                <FormItem>
                  <Select
                    label="Estado"
                    placeholder="Seleccionar estado"
                    value={formData.estado}
                    onChange={(value) => handleInputChange('estado', value.toString())}
                    options={OPCIONES_ESTADO_INVESTIGACION.map(opcion => ({
                      value: opcion.value,
                      label: opcion.label
                    }))}
                    required
                    fullWidth
                  />
                </FormItem>
              </div>
            </div>
          </FormContainer>

          {/* Fechas */}
          <FormContainer>
            <div className="flex items-center gap-2 mb-6">
              <SesionesIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Subtitle>Fechas</Subtitle>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormItem>
                <DatePicker
                  label="Fecha de inicio"
                  value={formData.fecha_inicio}
                  onChange={(date) => handleInputChange('fecha_inicio', date ? date.toISOString().split('T')[0] : '')}
                  required
                />
              </FormItem>
              
              <FormItem>
                <DatePicker
                  label="Fecha de fin"
                  value={formData.fecha_fin}
                  onChange={(date) => handleInputChange('fecha_fin', date ? date.toISOString().split('T')[0] : '')}
                  required
                />
              </FormItem>

              <FormItem>
                <Select
                  label="Período"
                  placeholder="Seleccionar período (opcional)"
                  value={formData.periodo}
                  onChange={(value) => handleInputChange('periodo', value.toString())}
                  options={periodos.map(periodo => ({
                    value: periodo.id,
                    label: periodo.nombre || periodo.etiqueta || 'Sin nombre'
                  }))}
                  fullWidth
                />
              </FormItem>
            </div>
          </FormContainer>

          {/* Equipo */}
          <FormContainer>
            <div className="flex items-center gap-2 mb-6">
              <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Subtitle>Equipo</Subtitle>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem>
                <UserSelectorWithAvatar
                  label="Responsable"
                  placeholder="Seleccionar responsable"
                  users={usuarios.map(usuario => ({
                    id: usuario.id,
                    full_name: usuario.full_name,
                    email: usuario.email,
                    avatar_url: usuario.avatar_url
                  }))}
                  value={formData.responsable_id}
                  onChange={(userId) => handleInputChange('responsable_id', userId)}
                />
              </FormItem>
              
              <FormItem>
                <UserSelectorWithAvatar
                  label="Implementador"
                  placeholder="Seleccionar implementador"
                  users={usuarios.map(usuario => ({
                    id: usuario.id,
                    full_name: usuario.full_name,
                    email: usuario.email,
                    avatar_url: usuario.avatar_url
                  }))}
                  value={formData.implementador_id}
                  onChange={(userId) => handleInputChange('implementador_id', userId)}
                />
              </FormItem>
            </div>
          </FormContainer>
        </form>
      </div>
    </Layout>
  );
};

export default EditarInvestigacionPage; 