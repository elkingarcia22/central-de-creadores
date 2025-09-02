import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import DataTable from '../ui/DataTable';
import FilterDrawer from '../ui/FilterDrawer';
import { Subtitle } from '../ui/Subtitle';
import { SearchIcon, FilterIcon } from '../icons';
import type { FilterValuesParticipaciones } from '../ui/FilterDrawer';

interface ParticipacionesUnifiedContainerProps {
  // Datos
  participaciones: any[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Filtros
  filters: FilterValuesParticipaciones;
  setFilters: (filters: FilterValuesParticipaciones) => void;
  showFilterDrawer: boolean;
  setShowFilterDrawer: (show: boolean) => void;
  getActiveFiltersCount: () => number;
  
  // Configuración de tabla
  columns: any[];
  
  // Opciones de filtros
  filterOptions: {
    estados_agendamiento: Array<{value: string, label: string}>;
    tipos_investigacion: Array<{value: string, label: string}>;
    responsables_participaciones: Array<{value: string, label: string}>;
  };
}

export default function ParticipacionesUnifiedContainer({
  participaciones,
  loading,
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  showFilterDrawer,
  setShowFilterDrawer,
  getActiveFiltersCount,
  columns,
  filterOptions
}: ParticipacionesUnifiedContainerProps) {
  
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

  // Filtrar participaciones basado en searchTerm y filters
  const participacionesFiltradas = useMemo(() => {
    let filtradas = participaciones;

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase();
      filtradas = filtradas.filter(p => 
        p?.nombre?.toLowerCase().includes(termino) ||
        p?.tipo_investigacion?.toLowerCase().includes(termino) ||
        p?.responsable?.toLowerCase().includes(termino)
      );
    }

    // Filtrar por estado de agendamiento
    if (filters.estado_agendamiento && filters.estado_agendamiento !== 'todos') {
      filtradas = filtradas.filter(p => p.estado_agendamiento === filters.estado_agendamiento);
    }

    // Filtrar por tipo de investigación
    if (filters.tipo_investigacion && filters.tipo_investigacion !== 'todos') {
      filtradas = filtradas.filter(p => p.tipo_investigacion === filters.tipo_investigacion);
    }

    // Filtrar por responsable
    if (filters.responsable && filters.responsable !== 'todos') {
      filtradas = filtradas.filter(p => p.responsable === filters.responsable);
    }

    // Filtrar por fecha de participación
    if (filters.fecha_participacion_desde) {
      filtradas = filtradas.filter(p => {
        const fechaInv = new Date(p.fecha_participacion);
        const fechaDesde = new Date(filters.fecha_participacion_desde!);
        return fechaInv >= fechaDesde;
      });
    }

    if (filters.fecha_participacion_hasta) {
      filtradas = filtradas.filter(p => {
        const fechaInv = new Date(p.fecha_participacion);
        const fechaHasta = new Date(filters.fecha_participacion_hasta!);
        return fechaInv <= fechaHasta;
      });
    }

    // Filtrar por duración de sesión
    if (filters.duracion_sesion_min) {
      filtradas = filtradas.filter(p => {
        const duracion = parseInt(p.duracion_sesion || '0');
        return duracion >= parseInt(filters.duracion_sesion_min!);
      });
    }

    if (filters.duracion_sesion_max) {
      filtradas = filtradas.filter(p => {
        const duracion = parseInt(p.duracion_sesion || '0');
        return duracion <= parseInt(filters.duracion_sesion_max!);
      });
    }

    return filtradas;
  }, [participaciones, searchTerm, filters]);

  const handleFiltersChange = useCallback((newFilters: FilterValuesParticipaciones) => {
    setFilters(newFilters);
  }, [setFilters]);

  return (
    <Card variant="elevated" padding="lg" className="space-y-6">
      {/* Header del contenedor con iconos integrados */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Subtitle>
            Lista de Participaciones
          </Subtitle>
          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
            {participacionesFiltradas.length} de {participaciones.length}
          </span>
        </div>
        
        {/* Iconos de búsqueda y filtro en la misma línea */}
        <div className="flex items-center gap-2">
          {/* Icono de búsqueda que se expande */}
          <div className="relative">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar participaciones..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="!w-[700px] pl-10 pr-10 py-2"
                  icon={<SearchIcon className="w-5 h-5 text-gray-400" />}
                  iconPosition="left"
                  autoFocus
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
            onClick={() => setShowFilterDrawer(true)}
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

      {/* Tabla de participaciones */}
      {participaciones.length > 0 ? (
        participacionesFiltradas.length > 0 ? (
          <DataTable
            data={participacionesFiltradas}
            columns={columns}
            loading={loading}
            searchable={false}
            filterable={false}
            selectable={false}
            emptyMessage="No se encontraron participaciones que coincidan con los criterios de búsqueda"
            rowKey="id"
          />
        ) : (
          <div className="text-center py-12">
            <FilterIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              Sin resultados
            </div>
            <div className="text-gray-500 mb-4">
              No se encontraron participaciones que coincidan con los filtros aplicados.
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  busqueda: '',
                  estado_agendamiento: 'todos',
                  tipo_investigacion: 'todos',
                  responsable: 'todos',
                  fecha_participacion_desde: '',
                  fecha_participacion_hasta: '',
                  duracion_sesion_min: '',
                  duracion_sesion_max: ''
                });
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <div className="w-12 h-12 text-gray-300 mx-auto mb-4">
            👤
          </div>
          <div className="text-lg font-medium text-gray-900 mb-2">
            Sin participaciones
          </div>
          <div className="text-gray-500">
            Este participante aún no ha participado en ninguna investigación.
          </div>
        </div>
      )}

      {/* Drawer de filtros avanzados */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        type="participaciones"
        options={filterOptions}
      />
    </Card>
  );
}
