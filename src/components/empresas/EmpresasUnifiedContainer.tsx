import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import DataTable from '../ui/DataTable';
import FilterDrawer from '../ui/FilterDrawer';
import { Subtitle } from '../ui/Subtitle';
import { SearchIcon, FilterIcon } from '../icons';

interface EmpresasUnifiedContainerProps {
  // Datos
  empresas: any[];
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
  clearSelection?: boolean;
  
  // Opciones de filtros
  filterOptions: {
    estados: Array<{value: string, label: string}>;
    tamanos: Array<{value: string, label: string}>;
    paises: Array<{value: string, label: string}>;
  };
}

export default function EmpresasUnifiedContainer({
  empresas,
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
  clearSelection,
  filterOptions
}: EmpresasUnifiedContainerProps) {
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

  // Filtrar empresas basado en searchTerm y filters
  const empresasFiltradas = useMemo(() => {
    let filtradas = [...empresas];
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase();
      filtradas = filtradas.filter(emp => 
        emp?.nombre?.toLowerCase().includes(termino) ||
        emp?.descripcion?.toLowerCase().includes(termino) ||
        emp?.industria_nombre?.toLowerCase().includes(termino) ||
        emp?.pais_nombre?.toLowerCase().includes(termino)
      );
    }
    
    // Aplicar filtros avanzados específicos de empresas
    if (filters.estado && filters.estado !== 'todos') {
      filtradas = filtradas.filter(emp => emp?.estado === filters.estado);
    }
    
    if (filters.tamano && filters.tamano !== 'todos') {
      filtradas = filtradas.filter(emp => emp?.tamano === filters.tamano);
    }
    
    if (filters.pais && filters.pais !== 'todos') {
      filtradas = filtradas.filter(emp => emp?.pais === filters.pais);
    }
    
    if (filters.kam_id && filters.kam_id !== 'todos') {
      filtradas = filtradas.filter(emp => emp?.kam_id === filters.kam_id);
    }
    
    if (filters.activo !== undefined) {
      filtradas = filtradas.filter(emp => emp?.activo === filters.activo);
    }
    
    if (filters.relacion && filters.relacion !== 'todos') {
      filtradas = filtradas.filter(emp => emp?.relacion === filters.relacion);
    }
    
    if (filters.producto && filters.producto !== 'todos') {
      filtradas = filtradas.filter(emp => emp?.producto === filters.producto);
    }
    
    return filtradas;
  }, [empresas, searchTerm, filters]);

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
            Lista de Empresas
          </Subtitle>
          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
            {empresasFiltradas.length} de {empresas.length}
          </span>
        </div>
        
        {/* Iconos de búsqueda y filtro en la misma línea */}
        <div className="flex items-center gap-2">
          {/* Icono de búsqueda que se expande */}
          <div className="relative">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-[500px] pl-10 pr-10 py-2"
                  icon={<SearchIcon className="w-5 h-5 text-gray-400" />}
                  iconPosition="left"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchExpanded(false)}
                  className="text-gray-500 hover:text-gray-700 border-0"
                >
                  ✕
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setIsSearchExpanded(true)}
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

      {/* Tabla de empresas */}
      <DataTable
        data={empresasFiltradas}
        columns={columns}
        loading={loading}
        searchable={false}
        filterable={false}
        selectable={!!onSelectionChange}
        onSelectionChange={onSelectionChange}
        onRowClick={onRowClick}
        emptyMessage="No se encontraron empresas que coincidan con los criterios de búsqueda"
        loadingMessage="Cargando empresas..."
        rowKey="id"
        bulkActions={bulkActions}
        clearSelection={clearSelection}
      />

      {/* Drawer de filtros avanzados */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={handleCloseFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        type="empresa"
        options={{
          estados: filterOptions.estados,
          tamanos: filterOptions.tamanos,
          paises: filterOptions.paises,
          kams: [], // Se puede agregar si es necesario
          relaciones: [], // Se puede agregar si es necesario
          productos: [], // Se puede agregar si es necesario
          usuarios: [], // Se puede agregar si es necesario
          industrias: filterOptions.industrias,
          modalidades: filterOptions.modalidades,
        }}
      />
    </Card>
  );
}
