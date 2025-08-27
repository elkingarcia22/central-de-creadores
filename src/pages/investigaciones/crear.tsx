import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { usePermisos } from '../../utils/permisosUtils';
import { Layout, Typography, Card, Button, Input, Select, DatePicker, UserSelectorWithAvatar, ConfirmModal, PageHeader, FormContainer, FormItem } from '../../components/ui';
import { 
  ArrowLeftIcon,
  InfoIcon,
  UserIcon,
  SesionesIcon,
  ConfiguracionesIcon,
  EmpresasIcon
} from '../../components/icons';
import { 
  crearInvestigacion,
  obtenerInvestigacionPorId,
  obtenerProductos,
  obtenerPeriodos,
  obtenerTiposInvestigacion,
  obtenerUsuarios
} from '../../api/supabase-investigaciones';
import { 
  obtenerLibretoPorInvestigacion, 
  crearLibreto,
  obtenerLibretosDisponibles
} from '../../api/supabase-libretos';
import { 
  OPCIONES_ESTADO_INVESTIGACION,
  OPCIONES_TIPO_SESION
} from '../../types/supabase-investigaciones';
import { 
  EstadoAgendamiento
} from '../../types/investigaciones';
// Tipos de Supabase para catálogos reales
import type {
  Producto,
  Periodo,
  TipoInvestigacion,
  Usuario,
  EstadoInvestigacion
} from '../../types/supabase-investigaciones';

const rolesPermitidos = ['administrador', 'investigador'];

const CrearInvestigacionPage: NextPage = () => {
  const { rolSeleccionado, rolesDisponibles, loading } = useRol();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { userProfile: usuarioLogueado } = useUser();
  const { tienePermiso } = usePermisos();
  const router = useRouter();
  const { duplicate } = router.query; // Detectar parámetro de duplicación

  // Verificar permisos de creación
  if (!tienePermiso('investigaciones', 'crear')) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <Card className="p-8 text-center">
            <Typography variant="h4" className="mb-4">Acceso denegado</Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              No tienes permisos para crear investigaciones
            </Typography>
            <Button variant="primary" onClick={() => router.push('/investigaciones')}>
              Volver a Investigaciones
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }
  
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
  
  const [loadingForm, setLoadingForm] = useState(false);
  const [esDuplicacion, setEsDuplicacion] = useState(false);
  const [investigacionOriginal, setInvestigacionOriginal] = useState<any>(null);
  const [loadingDuplicacion, setLoadingDuplicacion] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [tiposInvestigacion, setTiposInvestigacion] = useState<TipoInvestigacion[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [loadingPeriodos, setLoadingPeriodos] = useState(true);
  const [loadingTiposInvestigacion, setLoadingTiposInvestigacion] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  
  // Estados para manejo de duplicación de libreto
  const [tieneLibretoOriginal, setTieneLibretoOriginal] = useState(false);
  const [libretoOriginal, setLibretoOriginal] = useState<any>(null);
  const [showModalDuplicarLibreto, setShowModalDuplicarLibreto] = useState(false);
  const [duplicarLibreto, setDuplicarLibreto] = useState(false);
  const [investigacionCreada, setInvestigacionCreada] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    producto: '',
    periodo: '',
    fecha_inicio: '',
    fecha_fin: '',
    responsable_id: '',
    implementador_id: '',
    tipo_investigacion_id: ''
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

  // Establecer usuario logueado como responsable por defecto
  useEffect(() => {
    // Solo establecer el responsable por defecto cuando:
    // 1. El usuario logueado esté disponible
    // 2. La lista de usuarios esté cargada
    // 3. No haya un responsable ya seleccionado
    // 4. El usuario logueado exista en la lista de usuarios
    // 5. No estemos duplicando (en cuyo caso se precompletará con los datos originales)
    if (usuarioLogueado?.id && 
        !loadingUsuarios && 
        usuarios.length > 0 && 
        !formData.responsable_id &&
        !esDuplicacion) {
      
      // Verificar que el usuario logueado esté en la lista de usuarios
      const usuarioEnLista = usuarios.find(u => u.id === usuarioLogueado.id);
      
      if (usuarioEnLista) {
        console.log('✅ Estableciendo usuario logueado como responsable por defecto:', usuarioLogueado.full_name);
        setFormData(prev => ({
          ...prev,
          responsable_id: usuarioLogueado.id
        }));
      } else {
        console.log('⚠️ Usuario logueado no encontrado en la lista de usuarios disponibles');
      }
    }
  }, [usuarioLogueado, usuarios, loadingUsuarios, formData.responsable_id, esDuplicacion]);

  // Efecto para manejar la duplicación
  useEffect(() => {
    const manejarDuplicacion = async () => {
      if (duplicate && typeof duplicate === 'string') {
        console.log('🔄 Detectado parámetro de duplicación:', duplicate);
        setEsDuplicacion(true);
        setLoadingDuplicacion(true);
        
        try {
          const resultado = await obtenerInvestigacionPorId(duplicate);
          
          if (resultado.error) {
            showError('Error cargando investigación a duplicar', resultado.error);
            router.push('/investigaciones');
            return;
          }
          
          const inv = resultado.data;
          setInvestigacionOriginal(inv);
          
          // Verificar si la investigación original tiene libreto
          console.log('📋 Verificando si la investigación tiene libreto...');
          const libretoResult = await obtenerLibretoPorInvestigacion(duplicate);
          
          if (libretoResult.data && !libretoResult.error) {
            console.log('📋 ¡Investigación original tiene libreto!');
            setTieneLibretoOriginal(true);
            setLibretoOriginal(libretoResult.data);
          } else {
            console.log('📋 Investigación original no tiene libreto');
            setTieneLibretoOriginal(false);
          }
          
          // Precompletar formulario con datos de la investigación original
          // Agregar " - Copia" al nombre
          setFormData({
            nombre: `${inv.nombre} - Copia`,
            producto: inv.producto_id || '',
            periodo: inv.periodo_id || '',
            fecha_inicio: '', // Limpiar fechas para que el usuario las configure
            fecha_fin: '',
            responsable_id: inv.responsable_id || '',
            implementador_id: inv.implementador_id || '',
            tipo_investigacion_id: inv.tipo_investigacion_id || ''
          });
          
          console.log('✅ Datos de investigación original cargados para duplicación');
          
        } catch (error) {
          console.error('Error cargando investigación para duplicar:', error);
          showError('Error cargando investigación a duplicar');
          router.push('/investigaciones');
        } finally {
          setLoadingDuplicacion(false);
        }
      }
    };

    manejarDuplicacion();
  }, [duplicate, router, showError]);

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      console.log('🚀 Iniciando carga de catálogos...');
      
      // CARGAR DIRECTAMENTE DESDE SUPABASE (ya que funciona)
      try {
        console.log('📦 Cargando productos desde Supabase...');
        const respuestaProductos = await obtenerProductos();
        if (respuestaProductos.data && respuestaProductos.data.length > 0) {
          console.log('✅ Productos de Supabase cargados:', respuestaProductos.data.length);
          setProductos(respuestaProductos.data);
        } else {
          console.log('⚠️ No se pudieron cargar productos, usando fallbacks');
          setProductos(IDS_FALLBACK.productos);
        }
        setLoadingProductos(false);
        
        console.log('🔬 Cargando tipos de investigación desde Supabase...');
        const respuestaTipos = await obtenerTiposInvestigacion();
        if (respuestaTipos.data && respuestaTipos.data.length > 0) {
          console.log('✅ Tipos de Supabase cargados:', respuestaTipos.data.length);
          setTiposInvestigacion(respuestaTipos.data);
        } else {
          console.log('⚠️ No se pudieron cargar tipos, usando fallbacks');
          setTiposInvestigacion(IDS_FALLBACK.tipos_investigacion);
        }
        setLoadingTiposInvestigacion(false);
        
        console.log('👥 Cargando usuarios desde Supabase...');
        const respuestaUsuarios = await obtenerUsuarios();
        if (respuestaUsuarios.data && respuestaUsuarios.data.length > 0) {
          console.log('✅ Usuarios de Supabase cargados:', respuestaUsuarios.data.length);
          setUsuarios(respuestaUsuarios.data);
        } else {
          console.log('⚠️ No se pudieron cargar usuarios, usando fallbacks');
          setUsuarios(IDS_FALLBACK.usuarios);
        }
        setLoadingUsuarios(false);
        
        console.log('📅 Cargando períodos desde Supabase...');
        const respuestaPeriodos = await obtenerPeriodos();
        if (respuestaPeriodos.data && respuestaPeriodos.data.length > 0) {
          console.log('✅ Períodos de Supabase cargados:', respuestaPeriodos.data.length);
          setPeriodos(respuestaPeriodos.data);
        } else {
          console.log('⚠️ No se pudieron cargar períodos, usando fallbacks');
          setPeriodos(IDS_FALLBACK.periodos);
        }
        setLoadingPeriodos(false);
        
      } catch (error) {
        console.log('⚠️ Error cargando desde Supabase, usando fallbacks:', error);
        setProductos(IDS_FALLBACK.productos);
        setTiposInvestigacion(IDS_FALLBACK.tipos_investigacion);
        setUsuarios(IDS_FALLBACK.usuarios);
        setPeriodos(IDS_FALLBACK.periodos);
        setLoadingProductos(false);
        setLoadingTiposInvestigacion(false);
        setLoadingUsuarios(false);
        setLoadingPeriodos(false);
      }
      
      console.log('✅ Carga de catálogos completada');
    };

    cargarDatos();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);

    try {
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
      const datosParaCrear = {
        nombre: formData.nombre.trim(),
        tipo_investigacion_id: formData.tipo_investigacion_id,
        producto_id: formData.producto,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        periodo_id: formData.periodo || null,
        responsable_id: formData.responsable_id || null,
        implementador_id: formData.implementador_id || null,
        estado: 'en_borrador' as EstadoInvestigacion,
        libreto_id: null // Incluir el campo libreto
      };

      console.log('📝 Datos para crear investigación:', datosParaCrear);

      const resultado = await crearInvestigacion(datosParaCrear);
      
      if (resultado.error) {
        showError('Error al crear investigación', resultado.error);
        return;
      }

      console.log('✅ Investigación creada exitosamente:', resultado.data);
      setInvestigacionCreada(resultado.data);

      // Si es duplicación y la investigación original tiene libreto, preguntar si quiere duplicarlo
      if (esDuplicacion && tieneLibretoOriginal) {
        console.log('🤔 Investigación duplicada y original tiene libreto, preguntando al usuario...');
        setShowModalDuplicarLibreto(true);
        return; // No redirigir aún, esperar respuesta del usuario
      }

      // Si no es duplicación o no tiene libreto, mostrar éxito y redirigir
      if (esDuplicacion) {
        showSuccess('¡Investigación duplicada exitosamente!');
      } else {
        showSuccess('¡Investigación creada exitosamente!');
      }
      
      // Redirigir a la lista de investigaciones
      router.push('/investigaciones');

    } catch (error: any) {
      console.error('Error en handleSubmit:', error);
      showError('Error inesperado', error.message || 'Error al crear la investigación');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleVolver = () => {
    router.push('/investigaciones');
  };

  // Funciones para manejar la duplicación de libreto
  const handleConfirmarDuplicarLibreto = async () => {
    setShowModalDuplicarLibreto(false);
    setLoadingForm(true);

    try {
      if (!investigacionCreada || !libretoOriginal) {
        showError('Error: No se encontraron los datos necesarios para duplicar el libreto');
        return;
      }

      console.log('📋 Duplicando libreto para la nueva investigación...');
      
      // Preparar datos del libreto para duplicar
      const datosLibreto = {
        ...libretoOriginal,
        investigacion_id: investigacionCreada.id, // Nueva investigación
        id: undefined, // Para que se genere un nuevo ID
        creado_el: undefined, // Para que se genere nueva fecha
        actualizado_el: undefined, // Para que se genere nueva fecha
      };

      const resultadoLibreto = await crearLibreto(datosLibreto);
      
      if (resultadoLibreto.error) {
        showError('Error al duplicar libreto', resultadoLibreto.error);
        showSuccess('¡Investigación duplicada exitosamente!');
      } else {
        showSuccess('¡Investigación y libreto duplicados exitosamente!');
      }

    } catch (error: any) {
      console.error('Error duplicando libreto:', error);
      showError('Error al duplicar libreto', error.message);
      showSuccess('¡Investigación duplicada exitosamente!');
    } finally {
      setLoadingForm(false);
      router.push('/investigaciones');
    }
  };

  const handleCancelarDuplicarLibreto = () => {
    setShowModalDuplicarLibreto(false);
    showSuccess('¡Investigación duplicada exitosamente!');
    router.push('/investigaciones');
  };



  // Mostrar loading mientras se carga la investigación para duplicar
  if (loadingDuplicacion) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted-solid rounded w-1/3"></div>
            <div className="h-64 bg-muted-solid rounded"></div>
            <div className="text-center text-gray-500 mt-4">
              Cargando datos de investigación para duplicar...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-8">
        {/* Header */}
        <PageHeader
          title={esDuplicacion ? 'Duplicar Investigación' : 'Crear Investigación'}
          subtitle={esDuplicacion 
            ? `Duplicando: ${investigacionOriginal?.nombre}` 
            : 'Crea una nueva investigación con toda la información necesaria'
          }
          color="blue"
          primaryAction={{
            label: esDuplicacion ? 'Duplicar Investigación' : 'Crear Investigación',
            onClick: () => {
              // Crear un evento de submit sintético
              const form = document.getElementById('crear-investigacion-form');
              if (form) {
                const submitEvent = new Event('submit', { 
                  cancelable: true, 
                  bubbles: true 
                });
                form.dispatchEvent(submitEvent);
              } else {
                // Si no encuentra el formulario, llamar directamente a handleSubmit
                handleSubmit({ preventDefault: () => {} } as React.FormEvent);
              }
            },
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

        {/* Formulario */}
        <form id="crear-investigacion-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <FormContainer
            title="Información Básica"
            icon={<InfoIcon className="w-5 h-5" />}
            spacing="md"
          >
            <FormItem layout="full">
              <Input
                label="Nombre de la investigación"
                placeholder="Ej: Investigación de usabilidad del dashboard"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                required
                fullWidth
              />
            </FormItem>
            
            <FormItem layout="half">
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
          </FormContainer>

          {/* Fechas */}
          <FormContainer
            title="Fechas"
            icon={<SesionesIcon className="w-5 h-5" />}
            spacing="md"
          >
            <FormItem layout="third">
              <DatePicker
                label="Fecha de inicio"
                value={formData.fecha_inicio}
                onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                required
                fullWidth
              />
              
              <DatePicker
                label="Fecha de fin"
                value={formData.fecha_fin}
                onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                required
                fullWidth
              />

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
          </FormContainer>

          {/* Equipo */}
          <FormContainer
            title="Equipo"
            icon={<UserIcon className="w-5 h-5" />}
            spacing="md"
          >
            <FormItem layout="half">
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
          </FormContainer>
        </form>
      </div>

      {/* Modal de confirmación para duplicar libreto */}
      <ConfirmModal
        isOpen={showModalDuplicarLibreto}
        onClose={handleCancelarDuplicarLibreto}
        onConfirm={handleConfirmarDuplicarLibreto}
        title="¿Duplicar también el libreto?"
        message={`La investigación "${investigacionOriginal?.nombre}" tiene un libreto asociado. ¿Deseas duplicar también el libreto para la nueva investigación?`}
        confirmText="Sí, duplicar libreto"
        cancelText="No, solo la investigación"
        type="info"
        loading={loadingForm}
      />
    </Layout>
  );
};

export default CrearInvestigacionPage; 