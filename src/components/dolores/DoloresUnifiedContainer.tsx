import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import DataTable from '../ui/DataTable';
import FilterDrawer from '../ui/FilterDrawer';
import { Subtitle } from '../ui/Subtitle';
import { SearchIcon, FilterIcon } from '../icons';
import type { FilterValuesDolores } from '../ui/FilterDrawer';

interface DoloresUnifiedContainerProps {
  // Datos
  dolores: any[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Filtros
  filters: FilterValuesDolores;
  setFilters: (filters: FilterValuesDolores) => void;
  showFilterDrawer: boolean;
  setShowFilterDrawer: (show: boolean) => void;
  getActiveFiltersCount: () => number;
  
  // Configuración de tabla
  columns: any[];
  actions: any[];
  
  // Opciones de filtros
  filterOptions: {
    estados: Array<{value: string, label: string}>;
    severidades: Array<{value: string, label: string}>;
    categorias: Array<{value: string, label: string}>;
  };
}

export default function DoloresUnifiedContainer({
  dolores,
  loading,
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  showFilterDrawer,
  setShowFilterDrawer,
  getActiveFiltersCount,
  columns,
  actions,
  filterOptions
}: DoloresUnifiedContainerProps) {
  
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

  // Filtrar dolores basado en searchTerm y filters
  const doloresFiltradas = useMemo(() => {
    let filtradas = dolores;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtradas = filtradas.filter(dolor => 
        dolor.titulo?.toLowerCase().includes(term) ||
        dolor.descripcion?.toLowerCase().includes(term) ||
        dolor.categoria_nombre?.toLowerCase().includes(term)
      );
    }

    // Filtrar por estado
    if (filters.estado && filters.estado !== 'todos') {
      filtradas = filtradas.filter(dolor => dolor.estado === filters.estado);
    }

    // Filtrar por severidad
    if (filters.severidad && filters.severidad !== 'todos') {
      filtradas = filtradas.filter(dolor => dolor.severidad === filters.severidad);
    }

    // Filtrar por categoría
    if (filters.categoria && filters.categoria !== 'todos') {
      filtradas = filtradas.filter(dolor => dolor.categoria_id === filters.categoria);
    }

    return filtradas;
  }, [dolores, searchTerm, filters]);

  // Callbacks para manejar filtros
  const handleOpenFilters = useCallback(() => {
    setShowFilterDrawer(true);
  }, [setShowFilterDrawer]);

  const handleCloseFilters = useCallback(() => {
    setShowFilterDrawer(false);
  }, [setShowFilterDrawer]);

  const handleFiltersChange = useCallback((newFilters: FilterValuesDolores) => {
    setFilters(newFilters);
  }, [setFilters]);

  return (
    <Card variant="elevated" padding="lg" className="space-y-6">
      {/* Header del contenedor con iconos integrados */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Subtitle>
            Lista de Dolores
          </Subtitle>
          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
            {doloresFiltradas.length} de {dolores.length}
          </span>
        </div>
        
        {/* Iconos de búsqueda y filtro en la misma línea */}
        <div className="flex items-center gap-2">
          {/* Icono de búsqueda que se expande */}
          <div className="relative">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar dolores..."
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

      {/* Tabla de dolores */}
      <DataTable
        data={doloresFiltradas}
        columns={columns}
        loading={loading}
        searchable={false}
        filterable={false}
        selectable={false}
        actions={actions}
        emptyMessage="No se encontraron dolores que coincidan con los criterios de búsqueda"
        loadingMessage="Cargando dolores..."
        rowKey="id"
      />

      {/* Drawer de filtros avanzados */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={handleCloseFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        type="dolores"
        options={filterOptions}
      />
    </Card>
  );
}
