import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import DataTable from '../ui/DataTable';
import FilterDrawer from '../ui/FilterDrawer';
import { Subtitle } from '../ui/Subtitle';
import { SearchIcon, FilterIcon } from '../icons';
import type { FilterValuesInvestigacion } from '../ui/FilterDrawer';

interface InvestigacionesUnifiedContainerProps {
  // Datos
  investigaciones: any[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Filtros
  filters: FilterValuesInvestigacion;
  setFilters: (filters: FilterValuesInvestigacion) => void;
  showFilterDrawer: boolean;
  setShowFilterDrawer: (show: boolean) => void;
  getActiveFiltersCount: () => number;
  
  // Configuración de tabla
  columns: any[];
  onRowClick: (row: any) => void;
  
  // Funciones auxiliares
  tieneLibreto: (investigacionId: string) => boolean;
  calcularNivelRiesgo: (investigacion: any) => any;
  seguimientos: {[investigacionId: string]: any[]};
  
  // Opciones de filtros
  filterOptions: {
    estados: Array<{value: string, label: string}>;
    tipos: Array<{value: string, label: string}>;
    periodos: Array<{value: string, label: string}>;
    responsables: Array<{value: string, label: string, avatar_url?: string}>;
    implementadores: Array<{value: string, label: string, avatar_url?: string}>;
    creadores: Array<{value: string, label: string, avatar_url?: string}>;
    nivelRiesgo: Array<{value: string, label: string}>;
    seguimiento: Array<{value: string, label: string}>;
    estadoSeguimiento: Array<{value: string, label: string}>;
  };
}

export default function InvestigacionesUnifiedContainer({
  investigaciones,
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
  tieneLibreto,
  calcularNivelRiesgo,
  seguimientos,
  filterOptions
}: InvestigacionesUnifiedContainerProps) {
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

  // Filtrar investigaciones basado en searchTerm y filters
  const investigacionesFiltradas = useMemo(() => {
    let filtradas = [...investigaciones];
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase();
      filtradas = filtradas.filter(inv => 
        inv?.nombre?.toLowerCase().includes(termino) ||
        inv?.descripcion?.toLowerCase().includes(termino) ||
        inv?.investigador_principal?.toLowerCase().includes(termino)
      );
    }
    
    // Filtrar por estado (select simple)
    if (filters.estado && filters.estado !== 'todos') {
      filtradas = filtradas.filter(inv => inv?.estado === filters.estado);
    }
    
    // Filtrar por tipo de investigación
    if (filters.tipo && filters.tipo !== 'todos') {
      filtradas = filtradas.filter(inv => inv?.tipo_investigacion_id === filters.tipo);
    }
    
    // Filtrar por período
    if (filters.periodo && filters.periodo !== 'todos') {
      filtradas = filtradas.filter(inv => inv?.periodo_id === filters.periodo);
    }
    
    // Filtrar por responsable
    if (filters.responsable && filters.responsable !== 'todos') {
      filtradas = filtradas.filter(inv => inv?.responsable_id === filters.responsable);
    }
    
    // Filtrar por implementador
    if (filters.implementador && filters.implementador !== 'todos') {
      filtradas = filtradas.filter(inv => inv?.implementador_id === filters.implementador);
    }
    
    // Filtrar por creador
    if (filters.creador && filters.creador !== 'todos') {
      filtradas = filtradas.filter(inv => inv?.creado_por === filters.creador);
    }
    
    // Filtrar por fecha de inicio
    if (filters.fecha_inicio_desde) {
      filtradas = filtradas.filter(inv => inv?.fecha_inicio >= filters.fecha_inicio_desde);
    }
    if (filters.fecha_inicio_hasta) {
      filtradas = filtradas.filter(inv => inv?.fecha_inicio <= filters.fecha_inicio_hasta);
    }
    
    // Filtrar por fecha de fin
    if (filters.fecha_fin_desde) {
      filtradas = filtradas.filter(inv => inv?.fecha_fin >= filters.fecha_fin_desde);
    }
    if (filters.fecha_fin_hasta) {
      filtradas = filtradas.filter(inv => inv?.fecha_fin <= filters.fecha_fin_hasta);
    }
    
    // Filtrar por libreto
    if (filters.tieneLibreto && filters.tieneLibreto !== 'todos') {
      filtradas = filtradas.filter(inv => {
        const tieneLibretoInv = tieneLibreto(inv.id);
        return filters.tieneLibreto === 'con_libreto' ? tieneLibretoInv : !tieneLibretoInv;
      });
    }
    
    // Filtrar por nivel de riesgo
    if (filters.nivelRiesgo && filters.nivelRiesgo.length > 0) {
      filtradas = filtradas.filter(inv => {
        const nivelRiesgo = calcularNivelRiesgo(inv).nivel;
        return filters.nivelRiesgo!.includes(nivelRiesgo);
      });
    }
    
    // Filtrar por link de prueba
    if (filters.linkPrueba && filters.linkPrueba !== 'todos') {
      filtradas = filtradas.filter(inv => {
        const tieneLink = !!inv?.link_prueba;
        return filters.linkPrueba === 'con_link' ? tieneLink : !tieneLink;
      });
    }
    
    // Filtrar por link de resultados
    if (filters.linkResultados && filters.linkResultados !== 'todos') {
      filtradas = filtradas.filter(inv => {
        const tieneLink = !!inv?.link_resultados;
        return filters.linkResultados === 'con_link' ? tieneLink : !tieneLink;
      });
    }
    
    // Filtrar por seguimiento
    if (filters.seguimiento && filters.seguimiento !== 'todos') {
      filtradas = filtradas.filter(inv => {
        const tieneSeguimiento = seguimientos[inv.id] && seguimientos[inv.id].length > 0;
        return filters.seguimiento === 'con_seguimiento' ? tieneSeguimiento : !tieneSeguimiento;
      });
    }
    
    // Filtrar por estado de seguimiento
    if (filters.estadoSeguimiento && filters.estadoSeguimiento.length > 0) {
      filtradas = filtradas.filter(inv => {
        const seguimientosInv = seguimientos[inv.id] || [];
        return seguimientosInv.some(seg => filters.estadoSeguimiento!.includes(seg.estado));
      });
    }
    
    return filtradas;
  }, [investigaciones, searchTerm, filters, tieneLibreto, calcularNivelRiesgo, seguimientos]);

  const handleOpenFilters = () => {
    setShowFilterDrawer(true);
  };

  const handleCloseFilters = () => {
    setShowFilterDrawer(false);
  };

  const handleFiltersChange = (newFilters: FilterValuesInvestigacion) => {
    setFilters(newFilters);
  };

  return (
    <Card variant="elevated" padding="lg" className="space-y-6">
      {/* Header del contenedor con iconos integrados */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Subtitle>
            Lista de Investigaciones
          </Subtitle>
          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
            {investigacionesFiltradas.length} de {investigaciones.length}
          </span>
        </div>
        
        {/* Iconos de búsqueda y filtro en la misma línea */}
        <div className="flex items-center gap-2">
          {/* Icono de búsqueda que se expande */}
          <div className="relative">
                         {isSearchExpanded ? (
               <div className="flex items-center gap-2">
                 <Input
                   placeholder="Buscar investigaciones..."
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

      {/* Tabla de investigaciones */}
      <DataTable
        data={investigacionesFiltradas}
        columns={columns}
        loading={loading}
        searchable={false}
        filterable={false}
        selectable={false}
        onRowClick={onRowClick}
        emptyMessage="No se encontraron investigaciones que coincidan con los criterios de búsqueda"
        loadingMessage="Cargando investigaciones..."
        rowKey="id"
      />

      {/* Drawer de filtros avanzados */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={handleCloseFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        type="investigacion"
        options={filterOptions}
      />
    </Card>
  );
}
