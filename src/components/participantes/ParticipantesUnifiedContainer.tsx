import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import DataTable from '../ui/DataTable';
import FilterDrawer from '../ui/FilterDrawer';
import Tabs from '../ui/Tabs';
import { Subtitle } from '../ui/Subtitle';
import { SearchIcon, FilterIcon } from '../icons';
import { SeguimientosTab } from './SeguimientosTab';

interface ParticipantesUnifiedContainerProps {
  // Datos
  participantes: any[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Filtros
  filters: any;
  setFilters: (filters: any) => void;
  showFilterDrawer: boolean;
  setShowFilterDrawer: (show: boolean) => void;
  getActiveFiltersCount: () => number;
  
  // Configuración de tabla
  columns: any[];
  onRowClick: (row: any) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
  bulkActions?: any[];
  
  // Tabs
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: Array<{value: string, label: string, count?: number}>;
  
  // Opciones de filtros
  filterOptions: {
    estados: Array<{value: string, label: string}>;
    roles: Array<{value: string, label: string}>;
    empresas: Array<{value: string, label: string}>;
    departamentos: Array<{value: string, label: string}>;
    responsables?: Array<{value: string, label: string}>;
    investigaciones?: Array<{value: string, label: string}>;
  };

  // Acciones de la tabla
  actions?: any[];
  
  // Props para seguimientos
  showCrearSeguimientoModal?: boolean;
  onCloseCrearSeguimientoModal?: () => void;
  seguimientos?: any[];
  seguimientosLoading?: boolean;
  onRefreshSeguimientos?: () => void;
}

export default function ParticipantesUnifiedContainer({
  participantes,
  loading,
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  showFilterDrawer,
  setShowFilterDrawer,
  getActiveFiltersCount,
  columns,
  onRowClick,
  onSelectionChange,
  bulkActions,
  activeTab,
  setActiveTab,
  tabs,
  filterOptions,
  actions,
  showCrearSeguimientoModal,
  onCloseCrearSeguimientoModal,
  seguimientos,
  seguimientosLoading,
  onRefreshSeguimientos
}: ParticipantesUnifiedContainerProps) {
  const router = useRouter();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Efecto para cerrar la búsqueda con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchExpanded) {
        setIsSearchExpanded(false);
      }
    };

    if (isSearchExpanded) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSearchExpanded]);
  // Callbacks para manejar el estado del buscador
  const handleExpandSearch = useCallback(() => {
    setIsSearchExpanded(true);
  }, []);

  const handleCollapseSearch = useCallback(() => {
    setIsSearchExpanded(false);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);

  // Filtrar participantes basado en searchTerm, filters y activeTab
  const participantesFiltradas = useMemo(() => {
    
    let filtradas = [...participantes];
    
    // Filtrar por tipo de participante (tab activo)
    if (activeTab !== 'todos') {
      const tipoMap = {
        'externos': 'externo',
        'internos': 'interno',
        'friend_family': 'friend_family'
      };
      const tipo = tipoMap[activeTab as keyof typeof tipoMap];
      if (tipo) {
        filtradas = filtradas.filter(p => p.tipo === tipo);
      }
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase();
      filtradas = filtradas.filter(p => 
        p?.nombre?.toLowerCase().includes(termino) ||
        p?.email?.toLowerCase().includes(termino) ||
        p?.empresa_nombre?.toLowerCase().includes(termino) ||
        p?.departamento_nombre?.toLowerCase().includes(termino)
      );
    }
    
    // Aplicar filtros avanzados específicos de participantes
    if (filters.estado_participante && filters.estado_participante !== 'todos') {
      
      // Solo aplicar filtro de estado a participantes externos
      filtradas = filtradas.filter(p => {
        if (p?.tipo === 'externo') {
          const coincide = p?.estado_participante === filters.estado_participante;
          return coincide;
        }
        return true; // Mantener participantes internos y friend & family
      });
      
    }
    
    if (filters.rol_empresa && filters.rol_empresa !== 'todos') {
      filtradas = filtradas.filter(p => p?.rol_empresa === filters.rol_empresa);
    }
    
    if (filters.empresa && filters.empresa !== 'todos') {
      filtradas = filtradas.filter(p => p?.empresa_nombre === filters.empresa);
    }
    
    if (filters.departamento && filters.departamento !== 'todos') {
      filtradas = filtradas.filter(p => p?.departamento_nombre === filters.departamento);
    }
    

    
    if (filters.fecha_ultima_participacion_desde) {
      filtradas = filtradas.filter(p => p?.fecha_ultima_participacion >= filters.fecha_ultima_participacion_desde);
    }
    
    if (filters.fecha_ultima_participacion_hasta) {
      filtradas = filtradas.filter(p => p?.fecha_ultima_participacion <= filters.fecha_ultima_participacion_hasta);
    }
    
    if (filters.total_participaciones_min) {
      filtradas = filtradas.filter(p => (p?.total_participaciones || 0) >= parseInt(filters.total_participaciones_min));
    }
    
    if (filters.total_participaciones_max) {
      filtradas = filtradas.filter(p => (p?.total_participaciones || 0) <= parseInt(filters.total_participaciones_max));
    }
    
    if (filters.tiene_email && filters.tiene_email !== 'todos') {
      filtradas = filtradas.filter(p => {
        const tieneEmail = !!p?.email;
        return filters.tiene_email === 'con_email' ? tieneEmail : !tieneEmail;
      });
    }
    
    if (filters.tiene_productos && filters.tiene_productos !== 'todos') {
      filtradas = filtradas.filter(p => {
        const tieneProductos = p?.productos_relacionados && p.productos_relacionados.length > 0;
        return filters.tiene_productos === 'con_productos' ? tieneProductos : !tieneProductos;
      });
    }
    
    return filtradas;
  }, [participantes, activeTab, searchTerm, filters]);

  // Filtrar seguimientos basado en searchTerm y filtros
  const seguimientosFiltrados = useMemo(() => {
    if (!seguimientos) return [];
    
    let filtered = seguimientos;

    // Aplicar filtros de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(seguimiento => 
        seguimiento.participante_externo?.nombre?.toLowerCase().includes(term) ||
        seguimiento.investigacion_nombre?.toLowerCase().includes(term) ||
        seguimiento.responsable_nombre?.toLowerCase().includes(term) ||
        seguimiento.estado?.toLowerCase().includes(term)
      );
    }

    // Aplicar filtros específicos de seguimientos
    if (filters.estado_seguimiento && filters.estado_seguimiento !== 'todos') {
      filtered = filtered.filter(s => s.estado === filters.estado_seguimiento);
    }

    if (filters.responsable_seguimiento && filters.responsable_seguimiento !== 'todos') {
      filtered = filtered.filter(s => s.responsable_id === filters.responsable_seguimiento);
    }

    if (filters.investigacion_seguimiento && filters.investigacion_seguimiento !== 'todos') {
      filtered = filtered.filter(s => s.investigacion_nombre === filters.investigacion_seguimiento);
    }

    if (filters.fecha_seguimiento && filters.fecha_seguimiento !== 'todos') {
      const hoy = new Date();
      const fechaFiltro = new Date(filters.fecha_seguimiento);
      
      filtered = filtered.filter(s => {
        const fechaSeguimiento = new Date(s.fecha_seguimiento);
        
        switch (filters.fecha_seguimiento) {
          case 'hoy':
            return fechaSeguimiento.toDateString() === hoy.toDateString();
          case 'esta_semana':
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - hoy.getDay());
            return fechaSeguimiento >= inicioSemana;
          case 'este_mes':
            return fechaSeguimiento.getMonth() === hoy.getMonth() && 
                   fechaSeguimiento.getFullYear() === hoy.getFullYear();
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [seguimientos, searchTerm, filters]);

  const handleOpenFilters = () => {
    setShowFilterDrawer(true);
  };

  const handleCloseFilters = () => {
    setShowFilterDrawer(false);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <Card variant="elevated" padding="lg" className="space-y-4">
      {/* Header del contenedor con iconos integrados */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Subtitle>
            Lista de Participantes
          </Subtitle>
          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
            {participantesFiltradas.length} de {participantes.length}
          </span>
        </div>
        
        {/* Iconos de búsqueda y filtro en la misma línea */}
        <div className="flex items-center gap-2">
          {/* Icono de búsqueda que se expande */}
          <div className="relative">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder={activeTab === 'seguimientos' ? "Buscar seguimientos..." : "Buscar participantes..."}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="!w-[700px] pl-10 pr-10 py-2"
                  icon={<SearchIcon className="w-5 h-5 text-gray-400" />}
                  iconPosition="left"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCollapseSearch}
                  className="text-gray-500 hover:text-gray-700 border-0"
                >
                  ✕
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={handleExpandSearch}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full border-0"
                iconOnly
                icon={<SearchIcon className="w-5 h-5" />}
              />
            )}
          </div>
          
          {/* Icono de filtro */}
          <Button
            variant={getActiveFiltersCount() > 0 ? "primary" : "ghost"}
            onClick={handleOpenFilters}
            className="relative p-2 border-0"
            iconOnly
            icon={<FilterIcon />}
          >
            {getActiveFiltersCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-primary text-xs font-medium px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs de tipos de participantes */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        items={tabs}
        className="w-full"
      />

      {/* Contenido según el tab activo */}
      {activeTab === 'seguimientos' ? (
        <SeguimientosTab 
          showCrearModal={showCrearSeguimientoModal}
          onCloseCrearModal={onCloseCrearSeguimientoModal}
          seguimientos={seguimientosFiltrados}
          loading={seguimientosLoading}
          onRefresh={onRefreshSeguimientos}
        />
      ) : (
        <DataTable
          data={participantesFiltradas}
          columns={columns}
          loading={loading}
          searchable={false}
          filterable={false}
          selectable={!!onSelectionChange}
          onSelectionChange={onSelectionChange}
          onRowClick={onRowClick}
          emptyMessage={activeTab === 'seguimientos' ? "No se encontraron seguimientos que coincidan con los criterios de búsqueda" : "No se encontraron participantes que coincidan con los criterios de búsqueda"}
          loadingMessage={activeTab === 'seguimientos' ? "Cargando seguimientos..." : "Cargando participantes..."}
          rowKey="id"
          bulkActions={bulkActions}
          actions={actions}
        />
      )}

      {/* Drawer de filtros avanzados */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={handleCloseFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        type="participante"
        participanteType={activeTab as 'externos' | 'internos' | 'friend_family'}
        options={activeTab === 'seguimientos' ? {
          // Opciones de filtros para seguimientos usando campos existentes
          estados: [
            { value: 'todos', label: 'Todos' },
            { value: 'pendiente', label: 'Pendiente' },
            { value: 'en_progreso', label: 'En Progreso' },
            { value: 'completado', label: 'Completado' },
            { value: 'convertido', label: 'Convertido' }
          ],
          responsables: filterOptions.responsables || [],
          usuarios: filterOptions.responsables?.map(r => ({
            id: r.value,
            full_name: r.label
          })) || []
        } : {
          // Opciones de filtros para participantes
          estados: filterOptions.estados,
          roles: filterOptions.roles,
          empresas: filterOptions.empresas,
          departamentos: filterOptions.departamentos,
          tieneEmail: [
            { value: 'todos', label: 'Todos' },
            { value: 'con_email', label: 'Con email' },
            { value: 'sin_email', label: 'Sin email' }
          ],
          tieneProductos: [
            { value: 'todos', label: 'Todos' },
            { value: 'con_productos', label: 'Con productos' },
            { value: 'sin_productos', label: 'Sin productos' }
          ]
        }}
      />
    </Card>
  );
}
