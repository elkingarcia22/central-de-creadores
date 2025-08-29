import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import DataTable from '../ui/DataTable';
import FilterDrawer from '../ui/FilterDrawer';
import { Subtitle } from '../ui/Subtitle';
import { SearchIcon, FilterIcon } from '../icons';

interface ReclutamientoUnifiedContainerProps {
  // Datos
  reclutamientos: any[];
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
  
  // Opciones de filtros
  filterOptions: {
    estados: Array<{value: string, label: string}>;
    tipos?: Array<{value: string, label: string}>;
    modalidades?: Array<{value: string, label: string}>;
    responsables: Array<{value: string, label: string}>;
    empresas?: Array<{value: string, label: string}>;
    implementadores?: Array<{value: string, label: string}>;
  };
}

export default function ReclutamientoUnifiedContainer({
  reclutamientos,
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
  filterOptions
}: ReclutamientoUnifiedContainerProps) {
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

  // Filtrar reclutamientos basado en searchTerm y filters
  const reclutamientosFiltradas = useMemo(() => {
    let filtradas = [...reclutamientos];
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase();
      filtradas = filtradas.filter(rec => 
        rec?.investigacion_nombre?.toLowerCase().includes(termino) ||
        rec?.libreto_titulo?.toLowerCase().includes(termino) ||
        rec?.responsable_nombre?.toLowerCase().includes(termino) ||
        rec?.implementador_nombre?.toLowerCase().includes(termino) ||
        rec?.estado_reclutamiento_nombre?.toLowerCase().includes(termino)
      );
    }
    
    // Aplicar filtros avanzados específicos de reclutamiento
    if (filters.estados && filters.estados.length > 0) {
      filtradas = filtradas.filter(rec => 
        rec.estado_reclutamiento_nombre && filters.estados.includes(rec.estado_reclutamiento_nombre)
      );
    }
    
    if (filters.nivelRiesgo && filters.nivelRiesgo.length > 0) {
      filtradas = filtradas.filter(rec => {
        const riesgo = rec.riesgo_reclutamiento || 'bajo';
        return filters.nivelRiesgo.includes(riesgo.toLowerCase());
      });
    }
    
    if (filters.porcentajeAvance && (filters.porcentajeAvance[0] > 0 || filters.porcentajeAvance[1] < 100)) {
      filtradas = filtradas.filter(rec => {
        const porcentaje = rec.porcentaje_completitud || 0;
        return porcentaje >= filters.porcentajeAvance![0] && porcentaje <= filters.porcentajeAvance![1];
      });
    }
    
    if (filters.numeroParticipantes && (filters.numeroParticipantes[0] > 1 || filters.numeroParticipantes[1] < 50)) {
      filtradas = filtradas.filter(rec => {
        const participantes = rec.libreto_numero_participantes || 0;
        return participantes >= filters.numeroParticipantes![0] && participantes <= filters.numeroParticipantes![1];
      });
    }
    
    if (filters.responsables && filters.responsables.length > 0) {
      filtradas = filtradas.filter(rec => 
        rec.responsable_nombre && 
        filters.responsables.includes(rec.responsable_nombre)
      );
    }
    
    if (filters.implementadores && filters.implementadores.length > 0) {
      filtradas = filtradas.filter(rec => 
        rec.implementador_nombre && 
        filters.implementadores.includes(rec.implementador_nombre)
      );
    }
    
    return filtradas;
  }, [reclutamientos, searchTerm, filters]);

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
    <Card variant="elevated" padding="lg" className="space-y-6">
      {/* Header del contenedor con iconos integrados */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Subtitle>
            Lista de Reclutamientos
          </Subtitle>
          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
            {reclutamientosFiltradas.length} de {reclutamientos.length}
          </span>
        </div>
        
        {/* Iconos de búsqueda y filtro en la misma línea */}
        <div className="flex items-center gap-2">
          {/* Icono de búsqueda que se expande */}
          <div className="relative">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar reclutamientos..."
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

      {/* Tabla de reclutamientos */}
      <DataTable
        data={reclutamientosFiltradas}
        columns={columns}
        loading={loading}
        searchable={false}
        filterable={false}
        selectable={false}
        onRowClick={onRowClick}
        emptyMessage="No se encontraron reclutamientos que coincidan con los criterios de búsqueda"
        loadingMessage="Cargando reclutamientos..."
        rowKey="id"
      />

      {/* Drawer de filtros avanzados */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={handleCloseFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        type="reclutamiento"
        options={{
          estados: filterOptions.estados,
          responsables: filterOptions.responsables,
          implementadores: filterOptions.implementadores || [],
          periodos: filterOptions.empresas || [], // Usando empresas como periodos temporalmente
          tiposInvestigacion: filterOptions.tipos || [],
          seguimiento: [
            { value: 'todos', label: 'Todos' },
            { value: 'con_seguimiento', label: 'Con seguimiento' },
            { value: 'sin_seguimiento', label: 'Sin seguimiento' },
          ],
          estadoSeguimiento: [
            { value: 'pendiente', label: 'Pendiente' },
            { value: 'en_progreso', label: 'En progreso' },
            { value: 'completado', label: 'Completado' },
            { value: 'convertido', label: 'Convertido' },
            { value: 'bloqueado', label: 'Bloqueado' },
            { value: 'cancelado', label: 'Cancelado' },
          ],
          nivelRiesgo: [
            { value: 'alto', label: 'Alto' },
            { value: 'medio', label: 'Medio' },
            { value: 'bajo', label: 'Bajo' },
          ],
        }}
      />
    </Card>
  );
}
