import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useRol } from '../../../contexts/RolContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../contexts/ToastContext';
import { Layout, Typography, Card, Button, Input, Select, DatePicker, UserSelectorWithAvatar, Chip, PageHeader, FormContainer, FormItem } from '../../../components/ui';
import { 
  ArrowLeftIcon,
  InfoIcon,
  UserIcon,
  SesionesIcon,
  ConfiguracionesIcon,
  EmpresasIcon,
  CopyIcon,
  FileTextIcon
} from '../../../components/icons';
import { 
  obtenerSeguimientoPorId,
  crearInvestigacionDesdeSeguimiento
} from '../../../api/supabase-seguimientos';
import { 
  obtenerTiposInvestigacion,
  obtenerPeriodos,
  obtenerUsuarios,
  obtenerProductos
} from '../../../api/supabase-investigaciones';
import { formatearFecha } from '../../../utils/fechas';
import type { SeguimientoInvestigacion } from '../../../types/seguimientos';

interface InvestigacionFormData {
  nombre: string;
  descripcion: string;
  responsable_id: string;
  implementador_id: string;
  tipo_investigacion_id: string;
  periodo_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  producto_id: string;
}

const ConvertirSeguimientoPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  
  const [seguimiento, setSeguimiento] = useState<SeguimientoInvestigacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  
  // Estados para catálogos
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [tiposInvestigacion, setTiposInvestigacion] = useState<any[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<InvestigacionFormData>({
    nombre: '',
    descripcion: '',
    responsable_id: '',
    implementador_id: '',
    tipo_investigacion_id: '',
    periodo_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    producto_id: ''
  });

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      if (!id || typeof id !== 'string') {
        showError('ID de seguimiento requerido');
        router.push('/investigaciones');
        return;
      }
      
      try {
        setLoading(true);
        
        // Cargar seguimiento y catálogos
        const [seguimientoRes, usuariosRes, tiposRes, periodosRes, productosRes] = await Promise.all([
          obtenerSeguimientoPorId(id),
          obtenerUsuarios(),
          obtenerTiposInvestigacion(),
          obtenerPeriodos(),
          obtenerProductos()
        ]);
        
        if (seguimientoRes.error) {
          showError('Error cargando seguimiento');
          router.push('/investigaciones');
          return;
        }
        
        setSeguimiento(seguimientoRes.data);
        
        // Cargar catálogos
        console.log('📊 Catálogos cargados:', {
          usuarios: usuariosRes.data?.length || 0,
          tipos: tiposRes.data?.length || 0,
          periodos: periodosRes.data?.length || 0,
          productos: productosRes.data?.length || 0
        });
        
        setUsuarios(usuariosRes.data || []);
        setTiposInvestigacion(tiposRes.data || []);
        setPeriodos(periodosRes.data || []);
        setProductos(productosRes.data || []);
        
        // Inicializar form data con datos del seguimiento
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextMonthStr = nextMonth.toISOString().split('T')[0];

        setFormData({
          nombre: `Investigación derivada: ${seguimientoRes.data.notas.substring(0, 50)}...`,
          descripcion: seguimientoRes.data.notas,
          responsable_id: seguimientoRes.data.responsable_id,
          implementador_id: seguimientoRes.data.responsable_id,
          tipo_investigacion_id: '',
          periodo_id: '',
          fecha_inicio: today,
          fecha_fin: nextMonthStr,
          producto_id: ''
        });
        
      } catch (error) {
        console.error('Error cargando datos:', error);
        showError('Error inesperado al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  const handleInputChange = (field: keyof InvestigacionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre.trim()) {
      showError('El nombre de la investigación es requerido');
      return;
    }
    
    if (!formData.responsable_id) {
      showError('El responsable es requerido');
      return;
    }
    
    if (!formData.implementador_id) {
      showError('El implementador es requerido');
      return;
    }

    if (!formData.tipo_investigacion_id) {
      showError('El tipo de investigación es requerido');
      return;
    }

    if (!formData.producto_id) {
      showError('El producto es requerido');
      return;
    }

    setConverting(true);
    try {
      console.log('🔍 Datos del formulario antes de enviar:', formData);
      console.log('🔍 IDs específicos:', {
        tipo_investigacion_id: formData.tipo_investigacion_id,
        producto_id: formData.producto_id,
        periodo_id: formData.periodo_id,
        responsable_id: formData.responsable_id,
        implementador_id: formData.implementador_id
      });
      
      const response = await crearInvestigacionDesdeSeguimiento(id as string, formData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      showSuccess('Investigación creada exitosamente desde el seguimiento');
      
      // Esperar un poco para mostrar el toast y luego navegar
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/investigaciones');
      
    } catch (error: any) {
      console.error('Error convirtiendo seguimiento:', error);
      showError(error.message || 'Error al crear la investigación');
    } finally {
      setConverting(false);
    }
  };

  const handleCancel = () => {
    router.push('/investigaciones');
  };

  // Obtener nombre del usuario
  const obtenerNombreUsuario = (userId: string) => {
    if (!userId) return 'Usuario desconocido';
    const usuario = usuarios.find(u => u.id === userId);
    return usuario?.full_name || usuario?.email || 'Usuario desconocido';
  };

  if (loading) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!seguimiento) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <Card className="p-8 text-center">
            <Typography variant="h4" className="mb-4">Seguimiento no encontrado</Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              No se pudo encontrar el seguimiento solicitado
            </Typography>
            <Button variant="primary" onClick={() => router.push('/investigaciones')}>
              Volver a Investigaciones
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-8">
        {/* Header */}
        <PageHeader
          title="Convertir Seguimiento en Investigación"
          subtitle="Crear una nueva investigación basada en este seguimiento"
          color="blue"
          primaryAction={{
            label: "Convertir en Investigación",
            onClick: handleSubmit,
            variant: "primary",
            disabled: converting,
            loading: converting,
            icon: <CopyIcon className="w-4 h-4" />
          }}
          secondaryActions={[
            {
              label: "Cancelar",
              onClick: handleCancel,
              variant: "secondary"
            }
          ]}
        />

        {/* Contenido */}
        <div className="space-y-6">
          {/* Seguimiento Base */}
          <FormContainer
            title="Seguimiento Base"
            icon={<FileTextIcon className="w-5 h-5" />}
            spacing="md"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Chip variant="info">
                  {formatearFecha(seguimiento.fecha_seguimiento)}
                </Chip>
                <Chip variant="default">
                  {seguimiento.estado}
                </Chip>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <Typography variant="body2" color="secondary">
                  {seguimiento.notas}
                </Typography>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Responsable: {obtenerNombreUsuario(seguimiento.responsable_id)}
              </div>
            </div>
          </FormContainer>

          {/* Formulario de Investigación */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <FormContainer
              title="Información de la Investigación"
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
              
              <FormItem layout="full">
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Descripción
                  </Typography>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    placeholder="Descripción detallada de la investigación"
                    rows={4}
                    disabled={converting}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
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
                  onChange={(date) => handleInputChange('fecha_inicio', date ? date.toISOString().split('T')[0] : '')}
                  required
                  fullWidth
                />
                
                <DatePicker
                  label="Fecha de fin"
                  value={formData.fecha_fin}
                  onChange={(date) => handleInputChange('fecha_fin', date ? date.toISOString().split('T')[0] : '')}
                  required
                  fullWidth
                />

                <Select
                  label="Período"
                  placeholder="Seleccionar período (opcional)"
                  value={formData.periodo_id}
                  onChange={(value) => handleInputChange('periodo_id', value.toString())}
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
                  value={formData.responsable_id}
                  onChange={(value) => handleInputChange('responsable_id', value)}
                  users={usuarios}
                  placeholder="Seleccionar responsable"
                  disabled={converting}
                  required
                  fullWidth
                />
                
                <UserSelectorWithAvatar
                  label="Implementador"
                  value={formData.implementador_id}
                  onChange={(value) => handleInputChange('implementador_id', value)}
                  users={usuarios}
                  placeholder="Seleccionar implementador"
                  disabled={converting}
                  required
                  fullWidth
                />
              </FormItem>
            </FormContainer>

            {/* Configuración */}
            <FormContainer
              title="Configuración"
              icon={<ConfiguracionesIcon className="w-5 h-5" />}
              spacing="md"
            >
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
                  value={formData.producto_id}
                  onChange={(value) => handleInputChange('producto_id', value.toString())}
                  options={productos.map(producto => ({
                    value: producto.id,
                    label: producto.nombre
                  }))}
                  required
                  fullWidth
                />
              </FormItem>
            </FormContainer>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ConvertirSeguimientoPage; 