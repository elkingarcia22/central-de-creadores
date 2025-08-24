import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useRol } from '../../../contexts/RolContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../contexts/ToastContext';
import { Layout, Typography, Card, Button, Tabs, Chip, ActionsMenu, LinkModal } from '../../../components/ui';
import { SeguimientosSection } from '../../../components/investigaciones/SeguimientosSection';
import { TrazabilidadSection } from '../../../components/investigaciones/TrazabilidadSection';
import ActividadesTab from '../../../components/investigaciones/ActividadesTab';
import { 
  ArrowLeftIcon, 
  FileTextIcon, 
  DocumentIcon,
  EyeIcon,
  InfoIcon,
  UserIcon,
  SesionesIcon,
  ConfiguracionesIcon,
  EmpresasIcon,
  LinkIcon,
  BarChartIcon,
  EditIcon,
  CopyIcon,
  TrashIcon,
  MoreVerticalIcon,
  PlusIcon,
  SettingsIcon,
  ClipboardListIcon
} from '../../../components/icons';
import { 
  obtenerInvestigacionPorId,
  actualizarLinkPrueba,
  eliminarLinkPrueba,
  actualizarLinkResultados,
  eliminarLinkResultados,
  eliminarInvestigacion,
  obtenerTiposInvestigacion,
  obtenerPeriodos,
  obtenerUsuarios
} from '../../../api/supabase-investigaciones';
import { 
  obtenerLibretoPorInvestigacion,
  obtenerPlataformas,
  obtenerRolesEmpresa,
  obtenerIndustrias,
  obtenerModalidades,
  obtenerTamanosEmpresa,
  obtenerTiposPrueba,
  obtenerPaises
} from '../../../api/supabase-libretos';
import { formatearFecha } from '../../../utils/fechas';
import { getEstadoInvestigacionVariant, getEstadoInvestigacionText } from '../../../utils/estadoUtils';
import { 
  obtenerSeguimientosPorInvestigacion, 
  obtenerTrazabilidadCompleta,
  crearSeguimiento
} from '../../../api/supabase-seguimientos';
import SeguimientoSideModal from '../../../components/ui/SeguimientoSideModal';

interface InvestigacionDetalle {
  id: string;
  nombre: string;
  descripcion?: string;
  objetivo?: string;
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  responsable_id?: string;
  responsable_nombre?: string;
  responsable_email?: string;
  implementador_id?: string;
  implementador_nombre?: string;
  implementador_email?: string;
  tipo_investigacion?: string;
  tipo_investigacion_nombre?: string;
  tipo_sesion?: string;
  producto_id?: string;
  producto_nombre?: string;
  periodo_id?: string;
  periodo_nombre?: string;
  link_prueba?: string;
  link_resultados?: string;
  creado_el?: string;
  actualizado_el?: string;
  libreto?: string;
}

const VerInvestigacion: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showError, showSuccess, showWarning, showInfo } = useToast();
  
  const [investigacion, setInvestigacion] = useState<InvestigacionDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('informacion');
  const [libreto, setLibreto] = useState<any>(null);
  const [loadingLibreto, setLoadingLibreto] = useState(false);
  
  // Estados para seguimientos
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [tiposInvestigacion, setTiposInvestigacion] = useState<any[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
  
  // Estados para catálogos de libretos
  const [catalogosLibreto, setCatalogosLibreto] = useState({
    plataformas: [],
    rolesEmpresa: [],
    industrias: [],
    modalidades: [],
    tamanosEmpresa: [],
    tiposPrueba: [],
    paises: []
  });
  
  // Estados para modales y menús
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [currentLinkType, setCurrentLinkType] = useState<'prueba' | 'resultados'>('prueba');
  const [currentLink, setCurrentLink] = useState('');
  const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
  
  // Estados para mostrar u ocultar tabs
  const [haySeguimientos, setHaySeguimientos] = useState(false);
  const [hayTrazabilidad, setHayTrazabilidad] = useState(false);
  const [seguimientosKey, setSeguimientosKey] = useState(0);

  // Cargar seguimientos para saber si hay
  const cargarSeguimientos = async (investigacionId: string) => {
    try {
      const response = await obtenerSeguimientosPorInvestigacion(investigacionId);
      const tieneSeguimientos = !!response.data && response.data.length > 0;
      setHaySeguimientos(tieneSeguimientos);
      console.log('📊 Seguimientos cargados:', response.data?.length || 0, 'Hay seguimientos:', tieneSeguimientos);
    } catch (error) {
      console.error('Error cargando seguimientos:', error);
      setHaySeguimientos(false);
    }
  };

  // Función para actualizar el estado de seguimientos después de crear uno
  const actualizarEstadoSeguimientos = async () => {
    if (investigacion?.id) {
      await cargarSeguimientos(investigacion.id);
    }
  };

  // Callback para que SeguimientosSection notifique cambios
  const handleSeguimientosChange = async () => {
    console.log('🔄 === SEGUIMIENTOSECTION NOTIFICÓ CAMBIO ===');
    console.log('🔄 Investigación ID:', investigacion?.id);
    console.log('🔄 Estado actual haySeguimientos:', haySeguimientos);
    await actualizarEstadoSeguimientos();
    console.log('🔄 Estado actualizado haySeguimientos:', haySeguimientos);
    // Forzar remount del componente incrementando la key
    setSeguimientosKey(prev => prev + 1);
    console.log('🔄 Key de seguimientos incrementada para forzar remount');
    console.log('🔄 === FIN NOTIFICACIÓN CAMBIO ===');
  };

  // Cargar trazabilidad para saber si hay
  const cargarTrazabilidad = async (investigacionId: string) => {
    try {
      const response = await obtenerTrazabilidadCompleta(investigacionId);
      if (response.data) {
        const t = response.data;
        const hay = (
          (t.origen && ((t.origen.seguimientos && t.origen.seguimientos.length > 0) || (t.origen.investigaciones && t.origen.investigaciones.length > 0))) ||
          (t.derivadas && ((t.derivadas.investigaciones && t.derivadas.investigaciones.length > 0) || (t.derivadas.seguimientos && t.derivadas.seguimientos.length > 0)))
        );
        setHayTrazabilidad(hay);
      } else {
        setHayTrazabilidad(false);
      }
    } catch (error) {
      setHayTrazabilidad(false);
    }
  };

  // Cargar los datos de la investigación
  useEffect(() => {
    const cargarInvestigacion = async () => {
      if (!id || typeof id !== 'string') return;
      try {
        setLoading(true);
        const resultado = await obtenerInvestigacionPorId(id);
        if (!resultado.error && resultado.data) {
          setInvestigacion(resultado.data);
          await cargarDatosAdicionales();
          await cargarSeguimientos(id);
          await cargarTrazabilidad(id);
        } else {
          showError('No se pudo cargar la investigación', resultado.error || 'Error desconocido');
        }
      } catch (error) {
        console.error('Error cargando investigación:', error);
        showError('Error inesperado al cargar la investigación');
      } finally {
        setLoading(false);
      }
    };
    cargarInvestigacion();
  }, [id, showError]);

  // Cargar el libreto en un useEffect separado
  useEffect(() => {
    if (id && typeof id === 'string' && !loading) {
      cargarLibreto(id);
    }
  }, [id, loading]);
  
  // Cargar datos adicionales necesarios para seguimientos
  const cargarDatosAdicionales = async () => {
    try {
      console.log('🔍 Cargando datos adicionales para seguimientos...');
      const [usuariosResponse, tiposResponse, periodosResponse] = await Promise.all([
        obtenerUsuarios(),
        obtenerTiposInvestigacion(),
        obtenerPeriodos()
      ]);
      
      console.log('📊 Respuesta de usuarios:', usuariosResponse);
      console.log('📊 Respuesta de tipos:', tiposResponse);
      console.log('📊 Respuesta de períodos:', periodosResponse);
      
      if (usuariosResponse.data) {
        setUsuarios(usuariosResponse.data);
        console.log('✅ Usuarios cargados:', usuariosResponse.data.length);
      }
      
      if (tiposResponse.data) {
        const tiposFormateados = tiposResponse.data.map(tipo => ({
          value: tipo.id,
          label: tipo.nombre
        }));
        setTiposInvestigacion(tiposFormateados);
        console.log('✅ Tipos de investigación cargados:', tiposFormateados.length);
      }
      
      if (periodosResponse.data) {
        const periodosFormateados = periodosResponse.data.map(periodo => ({
          value: periodo.id,
          label: periodo.etiqueta || periodo.nombre || 'Sin nombre'
        }));
        setPeriodos(periodosFormateados);
        console.log('✅ Períodos cargados:', periodosFormateados.length);
      } else {
        console.log('⚠️ No se pudieron cargar períodos:', periodosResponse.error);
      }
    } catch (error) {
      console.error('Error cargando datos adicionales:', error);
    }
  };

  // Manejar el parámetro URL del tab activo
  useEffect(() => {
    if (router.query.tab && typeof router.query.tab === 'string') {
      setActiveTab(router.query.tab);
    }
  }, [router.query.tab]);

  // Efecto para cambiar al tab de seguimientos cuando se crea el primer seguimiento
  useEffect(() => {
    if (haySeguimientos && activeTab !== 'seguimientos') {
      // Si hay seguimientos y no estamos en el tab de seguimientos, cambiar automáticamente
      // Solo si es la primera vez que se crea un seguimiento
      const hasVisitedSeguimientos = sessionStorage.getItem(`seguimientos-visited-${id}`);
      if (!hasVisitedSeguimientos) {
        setActiveTab('seguimientos');
        sessionStorage.setItem(`seguimientos-visited-${id}`, 'true');
      }
    }
  }, [haySeguimientos, activeTab, id]);

  // Función para cargar el libreto y catálogos
  const cargarLibreto = async (investigacionId: string) => {
    try {
      setLoadingLibreto(true);
      
      // Cargar libreto y catálogos en paralelo
      const [
        libretoResponse,
        plataformasResponse,
        rolesResponse,
        industriasResponse,
        modalidadesResponse,
        tamanosResponse,
        tiposResponse,
        paisesResponse
      ] = await Promise.all([
        obtenerLibretoPorInvestigacion(investigacionId),
        obtenerPlataformas(),
        obtenerRolesEmpresa(),
        obtenerIndustrias(),
        obtenerModalidades(),
        obtenerTamanosEmpresa(),
        obtenerTiposPrueba(),
        obtenerPaises()
      ]);
      
      // Establecer el libreto
      if (libretoResponse.data) {
        setLibreto(libretoResponse.data);
      } else {
        setLibreto(null);
      }

      // Establecer los catálogos
      setCatalogosLibreto({
        plataformas: plataformasResponse.data || [],
        rolesEmpresa: rolesResponse.data || [],
        industrias: industriasResponse.data || [],
        modalidades: modalidadesResponse.data || [],
        tamanosEmpresa: tamanosResponse.data || [],
        tiposPrueba: tiposResponse.data || [],
        paises: paisesResponse.data || []
      });

    } catch (error) {
      console.error('Error cargando libreto y catálogos:', error);
      setLibreto(null);
    } finally {
      setLoadingLibreto(false);
    }
  };

  // ====================================
  // FUNCIONES PARA GESTIONAR LINKS
  // ====================================

  const handleSaveLinkPrueba = async (link: string) => {
    if (!investigacion?.id) return;
    
    try {
      const response = await actualizarLinkPrueba(investigacion.id, link);
      if (response.error) {
        throw new Error(response.error);
      }
      
      setInvestigacion(prev => prev ? { ...prev, link_prueba: link } : null);
      showSuccess('Link de prueba actualizado correctamente');
    } catch (error: any) {
      console.error('Error guardando link de prueba:', error);
      showError(error.message || 'Error al actualizar el link de prueba');
      throw error;
    }
  };

  const handleDeleteLinkPrueba = async () => {
    if (!investigacion?.id) return;
    
    try {
      const response = await eliminarLinkPrueba(investigacion.id);
      if (response.error) {
        throw new Error(response.error);
      }
      
      setInvestigacion(prev => prev ? { ...prev, link_prueba: null } : null);
      showSuccess('Link de prueba eliminado correctamente');
    } catch (error: any) {
      console.error('Error eliminando link de prueba:', error);
      showError(error.message || 'Error al eliminar el link de prueba');
      throw error;
    }
  };

  const handleSaveLinkResultados = async (link: string) => {
    if (!investigacion?.id) return;
    
    try {
      const response = await actualizarLinkResultados(investigacion.id, link);
      if (response.error) {
        throw new Error(response.error);
      }
      
      setInvestigacion(prev => prev ? { ...prev, link_resultados: link } : null);
      showSuccess('Link de resultados actualizado correctamente');
    } catch (error: any) {
      console.error('Error guardando link de resultados:', error);
      showError(error.message || 'Error al actualizar el link de resultados');
      throw error;
    }
  };

  const handleDeleteLinkResultados = async () => {
    if (!investigacion?.id) return;
    
    try {
      const response = await eliminarLinkResultados(investigacion.id);
      if (response.error) {
        throw new Error(response.error);
      }
      
      setInvestigacion(prev => prev ? { ...prev, link_resultados: null } : null);
      showSuccess('Link de resultados eliminado correctamente');
    } catch (error: any) {
      console.error('Error eliminando link de resultados:', error);
      showError(error.message || 'Error al eliminar el link de resultados');
      throw error;
    }
  };

  // ====================================
  // FUNCIONES PARA ACCIONES
  // ====================================

  const handleEliminarInvestigacion = async () => {
    if (!investigacion?.id) return;
    
    try {
      const response = await eliminarInvestigacion(investigacion.id);
      if (response.error) {
        throw new Error(response.error);
      }
      
      showSuccess('Investigación eliminada correctamente');
      router.push('/investigaciones');
    } catch (error: any) {
      console.error('Error eliminando investigación:', error);
      showError(error.message || 'Error al eliminar la investigación');
    }
  };

  // Funciones para manejar seguimientos
  const handleCrearSeguimiento = async (data: any) => {
    console.log('🔄 === INICIO CREAR SEGUIMIENTO ===');
    console.log('🔄 Datos del seguimiento:', data);
    console.log('🔄 Investigación ID:', investigacion?.id);
    
    try {
      const response = await crearSeguimiento({
        ...data,
        investigacion_id: investigacion?.id || ''
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log('✅ Seguimiento creado exitosamente:', response.data);
      showSuccess('Seguimiento creado exitosamente');
      setShowSeguimientoModal(false);
      
      // Actualizar inmediatamente el estado haySeguimientos si es el primer seguimiento
      if (!haySeguimientos) {
        console.log('🔄 Es el primer seguimiento, actualizando haySeguimientos a true');
        setHaySeguimientos(true);
        // Forzar remount del componente cuando aparece el tab por primera vez
        setSeguimientosKey(prev => prev + 1);
        console.log('🔄 Key de seguimientos incrementada para primer seguimiento');
      }
      
      // Recargar seguimientos para actualizar el estado haySeguimientos
      console.log('🔄 Recargando estado de seguimientos...');
      await actualizarEstadoSeguimientos();
      console.log('🔄 Estado de seguimientos actualizado');
      
      // Forzar remount del componente incrementando la key
      setSeguimientosKey(prev => prev + 1);
      console.log('🔄 Key de seguimientos incrementada desde handleCrearSeguimiento');
    } catch (error: any) {
      console.error('❌ Error creando seguimiento:', error);
      showError(error.message || 'Error al crear el seguimiento');
      throw error;
    }
    console.log('🔄 === FIN CREAR SEGUIMIENTO ===');
  };

  // Acciones del menú desplegable
  const menuActions = [
    // Solo mostrar "Crear Libreto" si NO existe libreto Y la investigación está en borrador
    ...(!libreto && investigacion?.estado?.toLowerCase().trim() === 'en_borrador' ? [{
      label: 'Crear Libreto',
      icon: <FileTextIcon className="w-4 h-4" />,
      onClick: () => {
        router.push(`/investigaciones/libreto/crear?investigacion=${id}`);
      },
      className: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
    }] : []),
    {
      label: 'Editar',
      icon: <EditIcon className="w-4 h-4" />,
      onClick: () => router.push(`/investigaciones/editar/${investigacion?.id}`),
      className: 'text-popover-foreground hover:text-popover-foreground/80'
    },
    {
      label: 'Duplicar',
      icon: <CopyIcon className="w-4 h-4" />,
      onClick: () => router.push(`/investigaciones/crear?duplicate=${investigacion?.id}`),
      className: 'text-popover-foreground hover:text-popover-foreground/80'
    },
    {
      label: 'Eliminar',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: handleEliminarInvestigacion,
      className: 'text-destructive hover:text-destructive/80'
    }
  ];

  // Estados para mostrar badges con colores (usando funciones centralizadas)
  const getEstadoBadgeVariant = (estado: string) => {
    return getEstadoInvestigacionVariant(estado);
  };

  // Formatear el estado para mostrar (usando funciones centralizadas)
  const formatearEstado = (estado: string) => {
    return getEstadoInvestigacionText(estado);
  };

  // Componente Empty State reutilizable
  const EmptyState: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    description: string; 
    actionText?: string;
    onAction?: () => void;
  }> = ({ icon, title, description, actionText, onAction }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-muted-solid flex items-center justify-center mb-4 text-muted-foreground">
        {icon}
      </div>
      <Typography variant="h4" className="mb-2 text-center">{title}</Typography>
      <Typography variant="body2" color="secondary" className="mb-6 text-center max-w-md">
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );

  // Componente de Información General
  const InformacionGeneral: React.FC = () => (
    <div className="space-y-6">
      {/* Información básica */}
      <Card className="p-6">
        <div className="mb-4">
          <Typography variant="h3" className="mb-2">Descripción</Typography>
        </div>
        
        {investigacion?.descripcion && (
          <div className="mb-4">
            <Typography variant="subtitle2" className="mb-2">Descripción</Typography>
            <Typography variant="body1" color="secondary">
              {investigacion.descripcion}
            </Typography>
          </div>
        )}

        {investigacion?.objetivo && (
          <div>
            <Typography variant="subtitle2" className="mb-2">Objetivo</Typography>
            <Typography variant="body1" color="secondary">
              {investigacion.objetivo}
            </Typography>
          </div>
        )}
      </Card>

      {/* Detalles del proyecto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fechas */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <SesionesIcon className="w-5 h-5 text-primary" />
            <Typography variant="h5">Fechas</Typography>
          </div>
          <div className="space-y-3">
            {investigacion?.fecha_inicio && (
              <div>
                <Typography variant="caption" color="secondary">Fecha de inicio</Typography>
                <Typography variant="body2">{formatearFecha(investigacion.fecha_inicio)}</Typography>
              </div>
            )}
            {investigacion?.fecha_fin && (
              <div>
                <Typography variant="caption" color="secondary">Fecha de fin</Typography>
                <Typography variant="body2">{formatearFecha(investigacion.fecha_fin)}</Typography>
              </div>
            )}
            <div>
              <Typography variant="caption" color="secondary">Creada</Typography>
              <Typography variant="body2">{formatearFecha(investigacion?.creado_el || '')}</Typography>
            </div>
          </div>
        </Card>

        {/* Equipo */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="w-5 h-5 text-primary" />
            <Typography variant="h5">Equipo</Typography>
          </div>
          <div className="space-y-3">
            {investigacion?.responsable_nombre && (
              <div>
                <Typography variant="caption" color="secondary">Responsable</Typography>
                <Typography variant="body2">{investigacion.responsable_nombre}</Typography>
                {investigacion.responsable_email && (
                  <Typography variant="caption" color="secondary" className="block">
                    {investigacion.responsable_email}
                  </Typography>
                )}
              </div>
            )}
            {investigacion?.implementador_nombre && (
              <div>
                <Typography variant="caption" color="secondary">Implementador</Typography>
                <Typography variant="body2">{investigacion.implementador_nombre}</Typography>
                {investigacion.implementador_email && (
                  <Typography variant="caption" color="secondary" className="block">
                    {investigacion.implementador_email}
                  </Typography>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Links */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="w-5 h-5 text-primary" />
            <Typography variant="h5">Enlaces</Typography>
          </div>
          <div className="space-y-3">
            <div>
              <Typography variant="caption" color="secondary">Link de prueba</Typography>
              {investigacion?.link_prueba ? (
                <div className="flex items-center gap-2">
                  <a 
                    href={investigacion.link_prueba} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm truncate"
                  >
                    {investigacion.link_prueba}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCurrentLinkType('prueba');
                      setCurrentLink(investigacion.link_prueba || '');
                      setShowLinkModal(true);
                    }}
                  >
                    <EditIcon className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setCurrentLinkType('prueba');
                    setCurrentLink('');
                    setShowLinkModal(true);
                  }}
                >
                  Agregar link
                </Button>
              )}
            </div>

            <div>
              <Typography variant="caption" color="secondary">Link de resultados</Typography>
              {investigacion?.link_resultados ? (
                <div className="flex items-center gap-2">
                  <a 
                    href={investigacion.link_resultados} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm truncate"
                  >
                    {investigacion.link_resultados}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCurrentLinkType('resultados');
                      setCurrentLink(investigacion.link_resultados || '');
                      setShowLinkModal(true);
                    }}
                  >
                    <EditIcon className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setCurrentLinkType('resultados');
                    setCurrentLink('');
                    setShowLinkModal(true);
                  }}
                >
                  Agregar link
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Configuración */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ConfiguracionesIcon className="w-5 h-5 text-primary" />
            <Typography variant="h5">Configuración</Typography>
          </div>
          <div className="space-y-3">
            {investigacion?.producto_nombre && (
              <div>
                <Typography variant="caption" color="secondary">Producto</Typography>
                <Typography variant="body2">{investigacion.producto_nombre}</Typography>
              </div>
            )}
            {investigacion?.periodo_nombre && (
              <div>
                <Typography variant="caption" color="secondary">Período</Typography>
                <Typography variant="body2">{investigacion.periodo_nombre}</Typography>
              </div>
            )}
            {investigacion?.tipo_sesion && (
              <div>
                <Typography variant="caption" color="secondary">Tipo de sesión</Typography>
                <Typography variant="body2">{investigacion.tipo_sesion}</Typography>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  // Contenido del tab Libreto
  const LibretoContent: React.FC = () => {
    if (typeof window !== 'undefined') {
      console.log('🔍 LIBRETOCONTENT RENDERIZANDO (CLIENTE) - libreto:', !!libreto, 'loadingLibreto:', loadingLibreto);
      console.log('🔍 Catálogos cargados:', {
        plataformas: catalogosLibreto.plataformas.length,
        rolesEmpresa: catalogosLibreto.rolesEmpresa.length,
        industrias: catalogosLibreto.industrias.length,
        modalidades: catalogosLibreto.modalidades.length,
        tamanosEmpresa: catalogosLibreto.tamanosEmpresa.length
      });
    }


    if (loadingLibreto) {
      return (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </Card>
        </div>
      );
    }

    if (libreto) {
      return (
        <div className="space-y-6">
          {/* Header del Libreto */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <FileTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <Typography variant="h3" className="text-lg font-semibold">
                    Libreto de la Investigación
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Guión y configuración completa para las sesiones
                  </Typography>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push(`/investigaciones/libreto/${id}`)}
                className="flex items-center gap-2"
              >
                <EditIcon className="w-4 h-4" />
                Editar
              </Button>
            </div>
            
            {/* Información básica de la sesión */}
            {(libreto.nombre_sesion || libreto.duracion_estimada || libreto.numero_participantes) && (
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 mb-6">
                {libreto.nombre_sesion && (
                  <Typography variant="h4" className="mb-2 text-blue-900 dark:text-blue-100">
                    {libreto.nombre_sesion}
                  </Typography>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-blue-700 dark:text-blue-300">
                  {libreto.duracion_estimada && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Duración:</span> {libreto.duracion_estimada} minutos
                    </div>
                  )}
                  {libreto.numero_participantes && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Participantes:</span> {libreto.numero_participantes}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Contenido del Libreto */}
          <div className="space-y-8">
            {/* Problema y Objetivos */}
            <Card variant="default" padding="lg">
              <div className="flex items-center gap-2 mb-6">
                <DocumentIcon className="w-5 h-5 text-primary" />
                <Typography variant="h3" weight="medium">
                  Problema y Objetivos
                </Typography>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Typography variant="caption" color="secondary" className="mb-2">
                    Problema o Situación
                  </Typography>
                  <div className="p-4 bg-muted rounded-lg">
                    <Typography variant="body2">
                      {libreto.problema_situacion || 'No especificado'}
                    </Typography>
                  </div>
                </div>

                <div>
                  <Typography variant="caption" color="secondary" className="mb-2">
                    Hipótesis
                  </Typography>
                  <div className="p-4 bg-muted rounded-lg">
                    <Typography variant="body2">
                      {libreto.hipotesis || 'No especificado'}
                    </Typography>
                  </div>
                </div>

                <div>
                  <Typography variant="caption" color="secondary" className="mb-2">
                    Objetivos
                  </Typography>
                  <div className="p-4 bg-muted rounded-lg">
                    <Typography variant="body2">
                      {libreto.objetivos || 'No especificado'}
                    </Typography>
                  </div>
                </div>

                <div>
                  <Typography variant="caption" color="secondary" className="mb-2">
                    Resultado Esperado
                  </Typography>
                  <div className="p-4 bg-muted rounded-lg">
                    <Typography variant="body2">
                      {libreto.resultado_esperado || 'No especificado'}
                    </Typography>
                  </div>
                </div>
              </div>
            </Card>

            {/* Configuración de la Sesión */}
            <Card variant="default" padding="lg">
              <div className="flex items-center gap-2 mb-6">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <Typography variant="h3" weight="medium">
                  Configuración de la Sesión
                </Typography>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="caption" color="secondary" className="mb-2">
                    Nombre de la Sesión
                  </Typography>
                  <Typography variant="body2">
                    {libreto.nombre_sesion || 'No especificado'}
                  </Typography>
                </div>

                <div>
                  <Typography variant="caption" color="secondary" className="mb-2">
                    Duración Estimada (minutos)
                  </Typography>
                  <Typography variant="body2">
                    {libreto.duracion_estimada ? `${libreto.duracion_estimada} minutos` : 'No especificado'}
                  </Typography>
                </div>

                <div>
                  <Typography variant="caption" color="secondary" className="mb-2">
                    Número de Participantes
                  </Typography>
                  <Typography variant="body2">
                    {libreto.numero_participantes || 'No especificado'}
                  </Typography>
                </div>

                <div>
                  <Typography variant="caption" color="secondary" className="mb-2">
                    Plataforma
                  </Typography>
                  <Typography variant="body2">
                    {catalogosLibreto.plataformas.find(p => p.id === libreto.plataforma_id)?.nombre || 'No especificado'}
                  </Typography>
                </div>

                <div className="md:col-span-2">
                  <Typography variant="caption" color="secondary" className="mb-2">
                    Link del Prototipo
                  </Typography>
                  <Typography variant="body2">
                    {libreto.link_prototipo ? (
                      <a href={libreto.link_prototipo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {libreto.link_prototipo}
                      </a>
                    ) : (
                      'No especificado'
                    )}
                  </Typography>
                </div>

                <div className="md:col-span-2">
                  <Typography variant="caption" color="secondary" className="mb-2">
                    Descripción General
                  </Typography>
                  <div className="p-4 bg-muted rounded-lg">
                    <Typography variant="body2">
                      {libreto.descripcion_general || 'No especificado'}
                    </Typography>
                  </div>
                </div>
              </div>
            </Card>

            {/* Perfil de Participantes */}
            <Card variant="default" padding="lg">
              <div className="flex items-center gap-2 mb-6">
                <UserIcon className="w-5 h-5 text-primary" />
                <Typography variant="h3" weight="medium">
                  Perfil de Participantes
                </Typography>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="caption" color="secondary" className="mb-2">
                    Rol en Empresa
                  </Typography>
                  <Typography variant="body2">
                    {catalogosLibreto.rolesEmpresa.find(r => r.id === libreto.rol_empresa_id)?.nombre || 'No especificado'}
                  </Typography>
                </div>

                <div>
                  <Typography variant="caption" color="secondary" className="mb-2">
                    Industria
                  </Typography>
                  <Typography variant="body2">
                    {catalogosLibreto.industrias.find(i => i.id === libreto.industria_id)?.nombre || 'No especificado'}
                  </Typography>
                </div>

                <div>
                  <Typography variant="caption" color="secondary" className="mb-2">
                    Modalidad
                  </Typography>
                  <Typography variant="body2">
                    {(() => {
                      if (!libreto.modalidad_id) return 'No especificado';
                      
                      const modalidadIds = Array.isArray(libreto.modalidad_id) ? libreto.modalidad_id : [libreto.modalidad_id];
                      
                      // Usar catálogos reales
                      const nombres = modalidadIds
                        .filter(id => id)
                        .map(id => catalogosLibreto.modalidades.find(m => m.id === id)?.nombre || id)
                        .filter(Boolean);
                      
                      return nombres.length > 0 ? nombres.join(', ') : 'No especificado';
                    })()}
                  </Typography>
                </div>

                <div>
                  <Typography variant="caption" color="secondary" className="mb-2">
                    Tamaño de Empresa
                  </Typography>
                  <Typography variant="body2">
                    {(() => {
                      if (!libreto.tamano_empresa_id) return 'No especificado';
                      
                      const tamanoIds = Array.isArray(libreto.tamano_empresa_id) ? libreto.tamano_empresa_id : [libreto.tamano_empresa_id];
                      
                      // Usar catálogos reales
                      const nombres = tamanoIds
                        .filter(id => id)
                        .map(id => catalogosLibreto.tamanosEmpresa.find(t => t.id === id)?.nombre || id)
                        .filter(Boolean);
                      
                      return nombres.length > 0 ? nombres.join(', ') : 'No especificado';
                    })()}
                  </Typography>
                </div>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    // Estado vacío para libreto
    return (
      <EmptyState
        icon={<FileTextIcon className="w-8 h-8" />}
        title="Sin Libreto"
        description="Esta investigación aún no tiene un libreto configurado. Crea uno para definir el guión y configuración de las sesiones."
        actionText="Crear Libreto"
        onAction={() => router.push(`/investigaciones/libreto/crear?investigacion=${id}`)}
      />
    );
  };



  // Tabs dinámicos
  const tabs = [
    {
      id: 'informacion',
      label: 'Información',
      icon: <InfoIcon className="w-4 h-4" />, 
      content: <InformacionGeneral />
    },
    {
      id: 'libreto',
      label: 'Libreto',
      icon: <FileTextIcon className="w-4 h-4" />, 
      content: <LibretoContent />
    },
    // Mostrar tab de seguimientos solo si hay seguimientos existentes
    ...(haySeguimientos ? [{
      id: 'seguimientos',
      label: 'Seguimientos',
      icon: <ClipboardListIcon className="w-4 h-4" />, 
      content: investigacion ? (
        <SeguimientosSection
          key={`${investigacion.id}-seguimientos-${haySeguimientos}-${seguimientosKey}`}
          investigacionId={investigacion.id}
          investigacionEstado={investigacion.estado || ''}
          usuarios={usuarios}
          tiposInvestigacion={tiposInvestigacion}
          periodos={periodos}
          onSeguimientoChange={handleSeguimientosChange}
        />
      ) : null
    }] : []),
    ...(hayTrazabilidad ? [{
      id: 'trazabilidad',
      label: 'Trazabilidad',
      icon: <BarChartIcon className="w-4 h-4" />, 
      content: investigacion ? (
        <TrazabilidadSection
          investigacionId={investigacion.id}
          investigacionNombre={investigacion.nombre}
          usuarios={usuarios}
        />
      ) : null
    }] : []),
    // Tab de log de actividades - siempre visible
    {
      id: 'actividades',
      label: 'Actividades',
      icon: <InfoIcon className="w-4 h-4" />, 
      content: investigacion ? (
        <ActividadesTab investigacionId={investigacion.id} />
      ) : null
    }
  ];

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

  if (!investigacion) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <Card className="p-8 text-center">
            <Typography variant="h4" className="mb-4">Investigación no encontrada</Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              No se pudo encontrar la investigación solicitada
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/investigaciones')}
              className="p-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4">
              <Typography variant="h2">{investigacion?.nombre}</Typography>
              <div className="flex items-center gap-3">
                <Chip variant={getEstadoBadgeVariant(investigacion?.estado || '')}>
                  {formatearEstado(investigacion?.estado || '')}
                </Chip>
              </div>
            </div>
          </div>

          {/* Acciones principales */}
          <div className="flex flex-wrap gap-3">
            {/* Botón Crear Seguimiento - Solo mostrar si la investigación está en progreso */}
            {investigacion.estado?.toLowerCase().trim() === 'en_progreso' && (
              <Button
                variant="secondary"
                className="flex items-center gap-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900"
                onClick={() => {
                  // Abrir directamente el modal de seguimiento
                  setShowSeguimientoModal(true);
                }}
              >
                <PlusIcon className="w-4 h-4" />
                Crear Seguimiento
              </Button>
            )}

            {/* Menú de Acciones */}
            <ActionsMenu actions={menuActions} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="default"
          fullWidth={true}
        />
      </div>

      {/* Modal unificado para gestionar links */}
      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title={currentLinkType === 'prueba' ? 'Gestionar Link de Prueba' : 'Gestionar Link de Resultados'}
        description={currentLinkType === 'prueba' 
          ? 'Configura el enlace donde los participantes realizarán las pruebas de usabilidad'
          : 'Configura el enlace donde se pueden consultar los resultados y hallazgos'
        }
        placeholder={currentLinkType === 'prueba' 
          ? 'https://prototipo.ejemplo.com'
          : 'https://resultados.ejemplo.com'
        }
        currentLink={currentLink}
        onSave={currentLinkType === 'prueba' ? handleSaveLinkPrueba : handleSaveLinkResultados}
        onDelete={currentLink ? (currentLinkType === 'prueba' ? handleDeleteLinkPrueba : handleDeleteLinkResultados) : undefined}
        linkType={currentLinkType}
        initialMode={currentLink ? 'edit' : 'add'}
      />

      {/* Modal de seguimiento */}
      <SeguimientoSideModal
        isOpen={showSeguimientoModal}
        onClose={() => setShowSeguimientoModal(false)}
        onSave={handleCrearSeguimiento}
        investigacionId={investigacion?.id || ''}
        usuarios={usuarios}
      />
    </Layout>
  );
};

export default VerInvestigacion; 