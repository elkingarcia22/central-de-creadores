import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useRol } from '../../../contexts/RolContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../contexts/ToastContext';
import { useFastUser } from '../../../contexts/FastUserContext';
import { Layout, Typography, Card, Button, Tabs, Chip, ActionsMenu, LinkModal, PageHeader, InfoContainer, InfoItem, EmptyState, Subtitle } from '../../../components/ui';
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
  ClipboardListIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon
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

import { getChipVariant, getChipText } from '../../../utils/chipUtils';
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
  const { userId } = useFastUser();
  
  const [investigacion, setInvestigacion] = useState<InvestigacionDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('informacion');
  const [libreto, setLibreto] = useState<any>(null);
  const [loadingLibreto, setLoadingLibreto] = useState(false);
  
  // Estados para seguimientos
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [tiposInvestigacion, setTiposInvestigacion] = useState<any[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [todasLasInvestigaciones, setTodasLasInvestigaciones] = useState<any[]>([]);
  
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
          await cargarTodasLasInvestigaciones();
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

  // Cargar todas las investigaciones para el modal de seguimiento
  const cargarTodasLasInvestigaciones = async () => {
    try {
      console.log('🔍 Cargando todas las investigaciones para modal de seguimiento...');
      const response = await fetch('/api/investigaciones');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setTodasLasInvestigaciones(data);
        console.log('✅ Todas las investigaciones cargadas:', data.length);
      } else {
        console.log('⚠️ Respuesta de investigaciones no es un array:', data);
        setTodasLasInvestigaciones([]);
      }
    } catch (error) {
      console.error('Error cargando todas las investigaciones:', error);
      setTodasLasInvestigaciones([]);
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
      className: 'text-popover-foreground hover:text-popover-foreground/80'
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
  const getEstadoBadgeVariant = (estado: string): any => {
    return getChipVariant(estado);
  };

  // Formatear el estado para mostrar (usando funciones centralizadas)
  const formatearEstado = (estado: string) => {
    return getChipText(estado);
  };



  // Componente de Información General
  const InformacionGeneral: React.FC = () => (
    <div className="space-y-6">
      {/* Información básica */}
      {investigacion?.objetivo && (
        <InfoContainer title="Objetivo" icon={<CheckCircleIcon className="w-4 h-4" />}>
          <InfoItem 
            label="Descripción del objetivo" 
            value={investigacion.objetivo}
            size="lg"
          />
        </InfoContainer>
      )}

      {/* Detalles del proyecto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fechas */}
        <InfoContainer 
          title="Fechas"
          icon={<ClockIcon className="w-4 h-4" />}
        >
          {investigacion?.fecha_inicio && (
            <InfoItem 
              label="Fecha de inicio" 
              value={formatearFecha(investigacion.fecha_inicio)}
            />
          )}
          {investigacion?.fecha_fin && (
            <InfoItem 
              label="Fecha de fin" 
              value={formatearFecha(investigacion.fecha_fin)}
            />
          )}
          <InfoItem 
            label="Creada" 
            value={formatearFecha(investigacion?.creado_el || '')}
          />
        </InfoContainer>

        {/* Equipo */}
        <InfoContainer 
          title="Equipo"
          icon={<UsersIcon className="w-4 h-4" />}
        >
          {investigacion?.responsable_nombre && (
            <InfoItem 
              label="Responsable" 
              value={
                <div>
                  <div>{investigacion.responsable_nombre}</div>
                  {investigacion.responsable_email && (
                    <div className="text-sm text-gray-500">{investigacion.responsable_email}</div>
                  )}
                </div>
              }
            />
          )}
          {investigacion?.implementador_nombre && (
            <InfoItem 
              label="Implementador" 
              value={
                <div>
                  <div>{investigacion.implementador_nombre}</div>
                  {investigacion.implementador_email && (
                    <div className="text-sm text-gray-500">{investigacion.implementador_email}</div>
                  )}
                </div>
              }
            />
          )}
        </InfoContainer>

        {/* Links */}
        <InfoContainer 
          title="Enlaces"
          icon={<LinkIcon className="w-4 h-4" />}
        >
          <div>
            <InfoItem 
              label="Link de prueba"
              value={
                investigacion?.link_prueba ? (
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
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentLinkType('prueba');
                      setCurrentLink('');
                      setShowLinkModal(true);
                    }}
                  >
                    Agregar link
                  </Button>
                )
              }
            />
          </div>

          <div>
            <InfoItem 
              label="Link de resultados"
              value={
                investigacion?.link_resultados ? (
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
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentLinkType('resultados');
                      setCurrentLink('');
                      setShowLinkModal(true);
                    }}
                  >
                    Agregar link
                  </Button>
                )
              }
            />
          </div>
        </InfoContainer>

        {/* Configuración */}
        <InfoContainer 
          title="Configuración"
          icon={<SettingsIcon className="w-4 h-4" />}
        >
          {investigacion?.producto_nombre && (
            <InfoItem 
              label="Producto" 
              value={investigacion.producto_nombre}
            />
          )}
          {investigacion?.periodo_nombre && (
            <InfoItem 
              label="Período" 
              value={investigacion.periodo_nombre}
            />
          )}
          {investigacion?.tipo_sesion && (
            <InfoItem 
              label="Tipo de sesión" 
              value={investigacion.tipo_sesion}
            />
          )}
        </InfoContainer>
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
          <div className="flex items-center justify-between mb-6">
            <Subtitle>
              Libreto de la Investigación
            </Subtitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/investigaciones/libreto/${id}`)}
            >
              <EditIcon className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>

          {/* Contenido del Libreto */}
          <div className="space-y-8">
            {/* Problema y Objetivos */}
            <InfoContainer 
              title="Problema y Objetivos"
              icon={<CheckCircleIcon className="w-4 h-4" />}
            >
              <InfoItem 
                label="Problema o Situación"
                value={
                  <div className="p-4 bg-muted rounded-lg">
                    <Typography variant="body2">
                      {libreto.problema_situacion || 'No especificado'}
                    </Typography>
                  </div>
                }
              />
              
              <InfoItem 
                label="Hipótesis"
                value={
                  <div className="p-4 bg-muted rounded-lg">
                    <Typography variant="body2">
                      {libreto.hipotesis || 'No especificado'}
                    </Typography>
                  </div>
                }
              />
              
              <InfoItem 
                label="Objetivos"
                value={
                  <div className="p-4 bg-muted rounded-lg">
                    <Typography variant="body2">
                      {libreto.objetivos || 'No especificado'}
                    </Typography>
                  </div>
                }
              />
              
              <InfoItem 
                label="Resultado Esperado"
                value={
                  <div className="p-4 bg-muted rounded-lg">
                    <Typography variant="body2">
                      {libreto.resultado_esperado || 'No especificado'}
                    </Typography>
                  </div>
                }
              />
            </InfoContainer>

            {/* Configuración de la Sesión */}
            <InfoContainer 
              title="Configuración de la Sesión"
              icon={<SettingsIcon className="w-4 h-4" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem 
                  label="Nombre de la Sesión"
                  value={libreto.nombre_sesion || 'No especificado'}
                />

                <InfoItem 
                  label="Duración Estimada (minutos)"
                  value={libreto.duracion_estimada ? `${libreto.duracion_estimada} minutos` : 'No especificado'}
                />

                <InfoItem 
                  label="Número de Participantes"
                  value={libreto.numero_participantes || 'No especificado'}
                />

                <InfoItem 
                  label="Plataforma"
                  value={catalogosLibreto.plataformas.find(p => p.id === libreto.plataforma_id)?.nombre || 'No especificado'}
                />

                <div className="md:col-span-2">
                  <InfoItem 
                    label="Link del Prototipo"
                    value={
                      libreto.link_prototipo ? (
                        <a href={libreto.link_prototipo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {libreto.link_prototipo}
                        </a>
                      ) : (
                        'No especificado'
                      )
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <InfoItem 
                    label="Descripción General"
                    value={
                      <div className="p-4 bg-muted rounded-lg">
                        <Typography variant="body2">
                          {libreto.descripcion_general || 'No especificado'}
                        </Typography>
                      </div>
                    }
                  />
                </div>
              </div>
            </InfoContainer>

            {/* Perfil de Participantes */}
            <InfoContainer 
              title="Perfil de Participantes"
              icon={<UsersIcon className="w-4 h-4" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem 
                  label="Rol en Empresa"
                  value={catalogosLibreto.rolesEmpresa.find(r => r.id === libreto.rol_empresa_id)?.nombre || 'No especificado'}
                />

                <InfoItem 
                  label="Industria"
                  value={catalogosLibreto.industrias.find(i => i.id === libreto.industria_id)?.nombre || 'No especificado'}
                />

                <InfoItem 
                  label="Modalidad"
                  value={(() => {
                    if (!libreto.modalidad_id) return 'No especificado';
                    
                    const modalidadIds = Array.isArray(libreto.modalidad_id) ? libreto.modalidad_id : [libreto.modalidad_id];
                    
                    // Usar catálogos reales
                    const nombres = modalidadIds
                      .filter(id => id)
                      .map(id => catalogosLibreto.modalidades.find(m => m.id === id)?.nombre || id)
                      .filter(Boolean);
                    
                    return nombres.length > 0 ? nombres.join(', ') : 'No especificado';
                  })()}
                />

                <InfoItem 
                  label="Tamaño de Empresa"
                  value={(() => {
                    if (!libreto.tamano_empresa_id) return 'No especificado';
                    
                    const tamanoIds = Array.isArray(libreto.tamano_empresa_id) ? libreto.tamano_empresa_id : [libreto.tamano_empresa_id];
                    
                    // Usar catálogos reales
                    const nombres = tamanoIds
                      .filter(id => id)
                      .map(id => catalogosLibreto.tamanosEmpresa.find(t => t.id === id)?.nombre || id)
                      .filter(Boolean);
                    
                    return nombres.length > 0 ? nombres.join(', ') : 'No especificado';
                  })()}
                />
              </div>
            </InfoContainer>
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
          investigacionNombre={investigacion.nombre}
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
            <button
              onClick={() => router.push('/investigaciones')}
              className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <PageHeader
              title={investigacion?.nombre || 'Investigación'}
              variant="compact"
              color="blue"
              className="mb-0"
              chip={{
                label: formatearEstado(investigacion?.estado || ''),
                variant: getEstadoBadgeVariant(investigacion?.estado || ''),
                size: 'sm'
              }}
            />
          </div>

          {/* Acciones principales */}
          <div className="flex flex-wrap gap-3">
            {/* Botón Crear Seguimiento - Solo mostrar si la investigación está en progreso */}
            {investigacion.estado?.toLowerCase().trim() === 'en_progreso' && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  // Abrir directamente el modal de seguimiento
                  console.log('🔍 [VerInvestigacion] Abriendo modal de crear seguimiento');
                  console.log('🔍 [VerInvestigacion] Investigación:', investigacion);
                  console.log('🔍 [VerInvestigacion] Usuarios disponibles:', usuarios.length);
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
        responsablePorDefecto={userId}
        investigaciones={todasLasInvestigaciones}
      />
    </Layout>
  );
};

export default VerInvestigacion; 