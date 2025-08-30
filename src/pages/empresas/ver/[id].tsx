import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useRol } from '../../../contexts/RolContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../contexts/ToastContext';
import { useUser } from '../../../contexts/UserContext';
import { usePermisos } from '../../../utils/permisosUtils';
import { Empresa } from '../../../types/empresas';

import { Layout, PageHeader, InfoContainer, InfoItem, CompanyParticipantCard } from '../../../components/ui';
import TestParticipantCard from '../../../components/ui/TestParticipantCard';
import Typography from '../../../components/ui/Typography';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Chip from '../../../components/ui/Chip';
import Tabs from '../../../components/ui/Tabs';
import SimpleAvatar from '../../../components/ui/SimpleAvatar';
import AnimatedCounter from '../../../components/ui/AnimatedCounter';
import EmpresaSideModal from '../../../components/empresas/EmpresaSideModal';
import { 
  BuildingIcon, 
  UserIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon, 
  TrendingUpIcon,
  UsersIcon,
  FileTextIcon,
  ExternalLinkIcon,
  StarIcon,
  ArrowLeftIcon,
  EditIcon,
  BarChartIcon,
  HistoryIcon,
  InfoIcon,
  ConfiguracionesIcon
} from '../../../components/icons';
import { formatearFecha } from '../../../utils/fechas';

import { getChipVariant, getChipText } from '../../../utils/chipUtils';

// Funciones de utilidad para colores
const getEstadoColor = (estado: string): any => {
  return getChipVariant(estado);
};

const getRiesgoColor = (riesgo: string): any => {
  return getChipVariant(riesgo);
};

const getRelacionColor = (relacion: string): string => {
  const relacionLower = relacion.toLowerCase();
  if (relacionLower.includes('excelente')) return 'success';
  if (relacionLower.includes('buena')) return 'success';
  if (relacionLower.includes('regular')) return 'warning';
  if (relacionLower.includes('mala') || relacionLower.includes('pobre')) return 'danger';
  return 'default';
};

interface EstadisticasEmpresa {
  totalParticipaciones: number;
  totalParticipantes: number;
  fechaUltimaParticipacion: string | null;
  investigacionesParticipadas: number;
  duracionTotalSesiones: number;
  participacionesPorMes: { [key: string]: number };
  investigaciones: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    tipo_sesion: string;
    riesgo_automatico: string;
    responsable: { id: string; full_name: string; email: string } | null;
    implementador: { id: string; full_name: string; email: string } | null;
    participaciones: number;
  }>;
}

interface Participante {
  id: string;
  nombre: string;
  rol_empresa_id: string;
  fecha_ultima_participacion: string | null;
  total_participaciones: number;
}

interface EmpresaDetallada extends Empresa {
  estadisticas?: EstadisticasEmpresa;
  participantes?: Participante[];
  productos_nombres?: string[];
}

interface EmpresaVerPageProps {
  empresa: EmpresaDetallada;
}

export default function EmpresaVerPage({ empresa }: EmpresaVerPageProps) {
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { userProfile } = useUser();
  const { tienePermiso } = usePermisos();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresaData, setEmpresaData] = useState<EmpresaDetallada>(empresa);
  const [activeTab, setActiveTab] = useState('informacion');

  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState({
    estados: [],
    tamanos: [],
    paises: [],
    kams: [],
    relaciones: [],
    productos: []
  });

  // Detectar cambios de ruta para debuggear
  useEffect(() => {
    console.log('🔍 EmpresaVerPage - Ruta actual:', router.asPath);
    console.log('🔍 EmpresaVerPage - Router ready:', router.isReady);
    console.log('🔍 EmpresaVerPage - Empresa ID:', empresa.id);
  }, [router.asPath, router.isReady, empresa.id]);

  useEffect(() => {
    if (empresa.id) {
      cargarEstadisticas(empresa.id);
    }
    cargarDatosModal();
  }, [empresa.id]);

  const cargarDatosModal = async () => {
    try {
      // Cargar usuarios
      const usuariosRes = await fetch('/api/usuarios');
      const usuariosData = usuariosRes.ok ? await usuariosRes.json() : [];
      
      // Extraer usuarios del objeto si es necesario
      let usuariosArray = [];
      if (Array.isArray(usuariosData)) {
        usuariosArray = usuariosData;
      } else if (usuariosData && usuariosData.usuarios && Array.isArray(usuariosData.usuarios)) {
        usuariosArray = usuariosData.usuarios;
      }
      
      // Cargar catálogos - usar APIs correctas
      const estadosRes = await fetch('/api/estados-empresa');
      const estados = estadosRes.ok ? await estadosRes.json() : [];
      
      const tamanosRes = await fetch('/api/tamanos-empresa');
      const tamanos = tamanosRes.ok ? await tamanosRes.json() : [];
      
      const paisesRes = await fetch('/api/paises');
      const paises = paisesRes.ok ? await paisesRes.json() : [];
      
      const relacionesRes = await fetch('/api/relaciones-empresa');
      const relaciones = relacionesRes.ok ? await relacionesRes.json() : [];
      
      const productosRes = await fetch('/api/productos');
      const productos = productosRes.ok ? await productosRes.json() : [];

      const kamsMapped = usuariosArray.map((u: any) => ({ 
        value: u.id, 
        label: u.full_name || u.nombre || u.email || u.correo || 'Sin nombre' 
      }));

      const productosMapped = productos.map((p: any) => ({ 
        value: p.id, 
        label: p.nombre 
      }));

      // Cargar industrias y modalidades
      const industriasRes = await fetch('/api/industrias');
      const industrias = industriasRes.ok ? await industriasRes.json() : [];
      
      const modalidadesRes = await fetch('/api/modalidades');
      const modalidades = modalidadesRes.ok ? await modalidadesRes.json() : [];

      const filterOptionsData = {
        estados: estados.map((e: any) => ({ value: e.id, label: e.nombre })),
        tamanos: tamanos.map((t: any) => ({ value: t.id, label: t.nombre })),
        paises: paises.map((p: any) => ({ value: p.id, label: p.nombre })),
        kams: kamsMapped,
        relaciones: relaciones.map((r: any) => ({ value: r.id, label: r.nombre })),
        productos: productosMapped,
        industrias: industrias.map((i: any) => ({ value: i.id, label: i.nombre })),
        modalidades: modalidades.map((m: any) => ({ value: m.id, label: m.nombre }))
      };

      setUsuarios(usuariosArray);
      setFilterOptions(filterOptionsData);
    } catch (error) {
    }
  };

  const cargarEstadisticas = async (empresaId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/empresas/${empresaId}/estadisticas`);

      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }

      const data = await response.json();

      setEmpresaData({
        ...empresa,
        estadisticas: data.estadisticas,
        participantes: data.participantes
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmpresa = async (empresaActualizada: any) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/empresas/${empresaActualizada.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(empresaActualizada),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar empresa');
      }

      const data = await response.json();
      setEmpresaData(data);
      setShowEditModal(false);
      showSuccess('Empresa actualizada exitosamente');
    } catch (error) {
      showError('Error al actualizar empresa');
    } finally {
      setSaving(false);
    }
  };

  const abrirInvestigacion = (investigacionId: string) => {
    router.push(`/investigaciones/ver/${investigacionId}`);
  };

  // Componente de contenido de información
  const InformacionContent = () => (
    <div className="space-y-6">
      {/* Descripción */}
      {empresaData.descripcion && (
        <InfoContainer 
          title="Descripción"
          icon={<FileTextIcon className="w-4 h-4" />}
        >
          <InfoItem 
            label="Descripción" 
            value={empresaData.descripcion}
          />
        </InfoContainer>
      )}

      {/* Información básica */}
      <InfoContainer 
        title="Información Básica"
        icon={<BuildingIcon className="w-4 h-4" />}
      >
        <InfoItem 
          label="Nombre" 
          value={empresaData.nombre}
        />
        <InfoItem 
          label="Estado" 
          value={
            <Chip 
              variant={getChipVariant(empresaData.estado_nombre || '') as any}
              size="sm"
            >
              {getChipText(empresaData.estado_nombre || '')}
            </Chip>
          }
        />
        <InfoItem 
          label="País" 
          value={empresaData.pais_nombre}
        />
        <InfoItem 
          label="Industria" 
          value={empresaData.industria_nombre}
        />
        <InfoItem 
          label="Modalidad" 
          value={empresaData.modalidad_nombre}
        />
        <InfoItem 
          label="Tamaño" 
          value={empresaData.tamano_nombre}
        />
        <InfoItem 
          label="Relación" 
          value={
            <Chip 
              variant={getChipVariant(empresaData.relacion_nombre || '') as any}
              size="sm"
            >
              {getChipText(empresaData.relacion_nombre || '')}
            </Chip>
          }
        />
        <InfoItem 
          label="Productos" 
          value={empresaData.productos_nombres?.join(', ')}
        />
        <InfoItem 
          label="KAM Asignado" 
          value={
            empresaData.kam_nombre ? (
              <div className="flex items-center gap-2">
                <SimpleAvatar 
                  fallbackText={empresaData.kam_nombre}
                  size="sm"
                />
                <span>{empresaData.kam_nombre}</span>
              </div>
            ) : 'No asignado'
          }
        />
      </InfoContainer>

      {/* Fechas */}
      <InfoContainer 
        title="Fechas"
        icon={<ClockIcon className="w-4 h-4" />}
      >
        <InfoItem 
          label="Fecha de Creación" 
          value={empresaData.created_at ? formatearFecha(empresaData.created_at) : 'No disponible'}
        />
        <InfoItem 
          label="Última Actualización" 
          value={empresaData.updated_at ? formatearFecha(empresaData.updated_at) : 'No disponible'}
        />
      </InfoContainer>
    </div>
  );

  // Componente de contenido de estadísticas
  const EstadisticasContent = () => {
    return (
      <div className="space-y-6">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <Typography variant="body1" className="ml-3">
              Cargando estadísticas...
            </Typography>
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <Typography variant="body1" color="danger">
              Error: {error}
            </Typography>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => empresaData.id && cargarEstadisticas(empresaData.id)}
            >
              Reintentar
            </Button>
          </Card>
        )}

        {/* Estadísticas principales */}
        {empresaData.estadisticas && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Participaciones */}
              <Card variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                      <AnimatedCounter
                        value={empresaData.estadisticas.totalParticipaciones}
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
                        value={empresaData.estadisticas.totalParticipantes}
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
                        value={empresaData.estadisticas.investigacionesParticipadas}
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
                        value={Math.round(empresaData.estadisticas.duracionTotalSesiones / 60)} 
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
              title="Última Participación"
              icon={<ClockIcon className="w-4 h-4" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {empresaData.estadisticas.fechaUltimaParticipacion && (
                  <InfoItem 
                    label="Fecha de Última Participación" 
                    value={formatearFecha(empresaData.estadisticas.fechaUltimaParticipacion)}
                  />
                )}
                
                {/* Resumen del mes actual */}
                <InfoItem 
                  label="Participaciones del Mes" 
                  value={
                    (() => {
                      const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
                      const participacionesMesActual = empresaData.estadisticas.participacionesPorMes[mesActual] || 0;
                      const nombreMes = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                      return `${participacionesMesActual} en ${nombreMes}`;
                    })()
                  }
                />
              </div>
            </InfoContainer>

            {/* Participaciones por mes */}
            {Object.keys(empresaData.estadisticas.participacionesPorMes).length > 0 && (
              <InfoContainer 
                title="Participaciones por Mes"
                icon={<TrendingUpIcon className="w-4 h-4" />}
              >
                <div className="space-y-3">
                  {Object.entries(empresaData.estadisticas.participacionesPorMes)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 6)
                    .map(([mes, cantidad]) => {
                      const fecha = new Date(mes + '-01');
                      const esMesActual = fecha.getMonth() === new Date().getMonth() && fecha.getFullYear() === new Date().getFullYear();
                      const maxCantidad = Math.max(...Object.values(empresaData.estadisticas.participacionesPorMes));
                      
                      return (
                        <div key={mes} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                          esMesActual 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                            : 'bg-gray-50 dark:bg-gray-800/50'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <Typography variant="body2" color="secondary">
                              {fecha.toLocaleDateString('es-ES', { 
                                year: 'numeric', 
                                month: 'long' 
                              })}
                            </Typography>
                            {esMesActual && (
                              <Chip variant="primary" size="sm">
                                Actual
                              </Chip>
                            )}
                          </div>
                                                  <div className="flex items-center space-x-6">
                          <div className="w-40 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                esMesActual ? 'bg-blue-500' : 'bg-primary'
                              }`}
                              style={{ 
                                width: `${Math.min((cantidad / maxCantidad) * 100, 100)}%` 
                              }}
                            />
                          </div>
                          <Typography variant="body2" weight="medium" className="w-12 text-right">
                            {cantidad}
                          </Typography>
                        </div>
                        </div>
                      );
                    })}
                </div>
              </InfoContainer>
            )}
          </>
        )}
      </div>
    );
  };

  // Componente de contenido de historial
  const HistorialContent = () => (
    <div className="space-y-6">
      {/* Investigaciones participadas */}
      <div>
        <Typography variant="h4" weight="semibold" className="mb-4">
          Investigaciones Participadas
        </Typography>
        
        {empresaData.estadisticas?.investigaciones && empresaData.estadisticas.investigaciones.length > 0 ? (
          <div className="space-y-4">
            {empresaData.estadisticas.investigaciones.map((investigacion) => (
              <Card key={investigacion.id} className="p-6 hover: transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Typography variant="body1" weight="semibold">
                        {investigacion.nombre}
                      </Typography>
                      <Chip variant={getEstadoColor(investigacion.estado)}>
                        {getChipText(investigacion.estado)}
                      </Chip>
                    </div>
                    
                    {investigacion.descripcion && (
                      <Typography variant="body2" color="secondary" className="mb-3">
                        {investigacion.descripcion}
                      </Typography>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatearFecha(investigacion.fecha_inicio)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <UsersIcon className="w-4 h-4" />
                        <span>{investigacion.participaciones} participaciones</span>
                      </div>
                      
                      {investigacion.responsable && (
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-4 h-4" />
                          <span>{investigacion.responsable.full_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirInvestigacion(investigacion.id)}
                    className="ml-4"
                  >
                    <ExternalLinkIcon className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <HistoryIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <Typography variant="h5" weight="medium" className="mb-2">
              Sin investigaciones
            </Typography>
            <Typography variant="body2" color="secondary">
              Esta empresa no ha participado en investigaciones
            </Typography>
          </Card>
        )}
      </div>

      {/* Participantes de la empresa */}
      <div>
        <Typography variant="h4" weight="semibold" className="mb-4">
          Participantes de la Empresa
        </Typography>
        
        {empresaData.participantes && empresaData.participantes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {empresaData.participantes.map((participante) => (
              <CompanyParticipantCard
                key={participante.id}
                participant={participante}
                onViewDetails={(id) => {
                  // Navegar a la vista del participante en nueva pestaña
                  window.open(`/participantes/${id}`, '_blank');
                }}
                showActions={true}
                showExtendedInfo={false}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <HistoryIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <Typography variant="h5" weight="medium" className="mb-2">
              Sin participantes
            </Typography>
            <Typography variant="body2" color="secondary">
              Esta empresa no tiene participantes registrados
            </Typography>
          </Card>
        )}
      </div>

      {/* Estado vacío solo si no hay investigaciones ni participantes */}
      {(!empresaData.estadisticas?.investigaciones || empresaData.estadisticas.investigaciones.length === 0) &&
       (!empresaData.participantes || empresaData.participantes.length === 0) && (
        <Card className="text-center py-12">
          <HistoryIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <Typography variant="h5" weight="medium" className="mb-2">
            Sin historial de participaciones
          </Typography>
          <Typography variant="body2" color="secondary">
            Esta empresa aún no ha participado en investigaciones
          </Typography>
        </Card>
      )}
    </div>
  );



  const tabs = [
    {
      id: 'informacion',
      label: 'Información',
      icon: <InfoIcon className="w-4 h-4" />,
      content: <InformacionContent />
    },
    {
      id: 'estadisticas',
      label: 'Estadísticas',
      icon: <BarChartIcon className="w-4 h-4" />,
      content: <EstadisticasContent />
    },
    {
      id: 'historial',
      label: 'Historial de Participaciones',
      icon: <HistoryIcon className="w-4 h-4" />,
      content: <HistorialContent />
    },

  ];

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-6 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/empresas')}
                className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <PageHeader
                title={empresaData.nombre || 'Empresa'}
                variant="compact"
                color="green"
                className="mb-0"
                chip={{
                  label: empresaData.estado_nombre || 'Sin estado',
                  variant: getEstadoColor(empresaData.estado_nombre || ''),
                  size: 'sm'
                }}
              />
            </div>

            {/* Acciones principales */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setShowEditModal(true)}
              >
                <EditIcon className="w-4 h-4" />
                Editar
              </Button>
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

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <Typography variant="body1" className="ml-3">
                Cargando estadísticas...
              </Typography>
            </div>
          )}

          {/* Error state */}
          {error && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <Typography variant="body1" color="danger">
                Error: {error}
              </Typography>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => empresaData.id && cargarEstadisticas(empresaData.id)}
              >
                Reintentar
              </Button>
            </Card>
          )}

        </div>
      </div>

      {/* Modal de edición */}
      <EmpresaSideModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEmpresa}
        empresa={empresaData}
        usuarios={usuarios}
        loading={saving}
      />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};

  if (!id || typeof id !== 'string') {
    return {
      notFound: true
    };
  }

  try {
    // Importar directamente la función de la API
    const { supabaseServer } = require('../../../api/supabase');

    // Obtener información básica de la empresa
    const { data: empresa, error: errorEmpresa } = await supabaseServer
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();

    if (errorEmpresa || !empresa) {
      return {
        notFound: true
      };
    }

    // Obtener datos relacionados por separado
    let kamData = null;
    let paisData = null;
    let estadoData = null;
    let tamanoData = null;
    let relacionData = null;
    let modalidadData = null;
    let industriaData = null;
    let productoData = null;

    if (empresa.kam_id) {
      const { data: kam } = await supabaseServer
        .from('usuarios')
        .select('id, nombre, correo')
        .eq('id', empresa.kam_id)
        .single();
      kamData = kam;
    }

    if (empresa.pais) {
      const { data: pais } = await supabaseServer
        .from('paises')
        .select('id, nombre')
        .eq('id', empresa.pais)
        .single();
      paisData = pais;
    }

    if (empresa.estado) {
      const { data: estado } = await supabaseServer
        .from('estado_empresa')
        .select('id, nombre')
        .eq('id', empresa.estado)
        .single();
      estadoData = estado;
    }

    if (empresa.tamaño) {
      const { data: tamano } = await supabaseServer
        .from('tamano_empresa')
        .select('id, nombre')
        .eq('id', empresa.tamaño)
        .single();
      tamanoData = tamano;
    }

    if (empresa.relacion) {
      const { data: relacion } = await supabaseServer
        .from('relacion_empresa')
        .select('id, nombre')
        .eq('id', empresa.relacion)
        .single();
      relacionData = relacion;
    }

    if (empresa.modalidad) {
      const { data: modalidad } = await supabaseServer
        .from('modalidades')
        .select('id, nombre')
        .eq('id', empresa.modalidad)
        .single();
      modalidadData = modalidad;
    }

    if (empresa.industria) {
      const { data: industria } = await supabaseServer
        .from('industrias')
        .select('id, nombre')
        .eq('id', empresa.industria)
        .single();
      industriaData = industria;
    }

    // Obtener productos de la empresa
    const { data: productos } = await supabaseServer
      .from('empresa_productos')
      .select(`
        productos (
          id,
          nombre
        )
      `)
      .eq('empresa_id', empresa.id);

    const productosNombres = productos?.map((p: any) => p.productos?.nombre).filter(Boolean) || [];

    // Obtener participantes de la empresa
    const { data: participantes, error: errorParticipantes } = await supabaseServer
      .from('participantes')
      .select('id, nombre, rol_empresa_id, fecha_ultima_participacion, total_participaciones')
      .eq('empresa_id', empresa.id);

    if (errorParticipantes) {
      console.error('Error obteniendo participantes:', errorParticipantes);
    }

    // Calcular participaciones reales por participante
    let participantesData = participantes || [];
    
    // Calcular participaciones reales por participante
    if (participantesData.length > 0) {
      const participanteIds = participantesData.map(p => p.id);
      
      // Obtener solo el estado "Finalizado"
      const { data: estadoFinalizado, error: errorEstado } = await supabaseServer
        .from('estado_agendamiento_cat')
        .select('id, nombre')
        .eq('nombre', 'Finalizado')
        .single();

      if (errorEstado || !estadoFinalizado) {
        console.error('Error obteniendo estado Finalizado:', errorEstado);
      } else {
        // Obtener solo reclutamientos finalizados para estos participantes
        const { data: reclutamientos, error: errorReclutamientos } = await supabaseServer
          .from('reclutamientos')
          .select('id, participantes_id, fecha_sesion, estado_agendamiento')
          .eq('estado_agendamiento', estadoFinalizado.id)
          .in('participantes_id', participanteIds);

        if (errorReclutamientos) {
          console.error('Error obteniendo reclutamientos:', errorReclutamientos);
        } else if (reclutamientos) {
          // Calcular participaciones por participante
          const participacionesPorParticipante: { [key: string]: number } = {};
          const fechaUltimaPorParticipante: { [key: string]: string } = {};

          reclutamientos.forEach(reclutamiento => {
            const participanteId = reclutamiento.participantes_id;
            
            // Contar participaciones
            if (!participacionesPorParticipante[participanteId]) {
              participacionesPorParticipante[participanteId] = 0;
            }
            participacionesPorParticipante[participanteId]++;
            
            // Actualizar fecha de última participación
            if (!fechaUltimaPorParticipante[participanteId] || 
                new Date(reclutamiento.fecha_sesion) > new Date(fechaUltimaPorParticipante[participanteId])) {
              fechaUltimaPorParticipante[participanteId] = reclutamiento.fecha_sesion;
            }
          });
          
          // Actualizar datos de participantes con información real
          participantesData = participantesData.map(participante => ({
            ...participante,
            total_participaciones: participacionesPorParticipante[participante.id] || 0,
            fecha_ultima_participacion: fechaUltimaPorParticipante[participante.id] || null
          }));
        }
      }
    }

    // Construir objeto de empresa con datos relacionados
    const empresaCompleta = {
      ...empresa,
      kam_nombre: kamData?.nombre || kamData?.correo || null,
      pais_nombre: paisData?.nombre || null,
      estado_nombre: estadoData?.nombre || null,
      tamano_nombre: tamanoData?.nombre || null,
      relacion_nombre: relacionData?.nombre || null,
      modalidad_nombre: modalidadData?.nombre || null,
      industria_nombre: industriaData?.nombre || null,
      productos_nombres: productosNombres,
      estadisticas: {
        totalParticipaciones: 0,
        totalParticipantes: 0,
        fechaUltimaParticipacion: null,
        investigacionesParticipadas: 0,
        duracionTotalSesiones: 0,
        participacionesPorMes: {},
        investigaciones: []
      },
      participantes: participantesData
    };

    return {
      props: {
        empresa: empresaCompleta
      }
    };
  } catch (error) {
    console.error('Error en getServerSideProps:', error);
    return {
      notFound: true
    };
  }
};
