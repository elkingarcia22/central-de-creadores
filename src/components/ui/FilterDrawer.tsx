import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';
import Select from './Select';
import DatePicker from '../../../mcp-system/mcp-design-system/src/components/composite/DatePicker';
import Typography from './Typography';
import Chip from './Chip';
import MultiSelect from './MultiSelect';
import Slider from './Slider';
import Input from './Input';
import UserSelect from './UserSelect';
import { PageHeader, FormContainer, FormItem, Subtitle, FilterLabel } from './';
import { CloseIcon, FilterIcon, TrashIcon } from '../icons';

// Interface específica para filtros de investigaciones
export interface FilterValuesInvestigacion {
  busqueda?: string;
  estado?: string | 'todos';
  tipo?: string | 'todos';
  periodo?: string | 'todos';
  responsable?: string | 'todos';
  implementador?: string | 'todos';
  creador?: string | 'todos';
  fecha_inicio_desde?: string;
  fecha_inicio_hasta?: string;
  fecha_fin_desde?: string;
  fecha_fin_hasta?: string;
  tieneLibreto?: string | 'todos'; // 'todos' | 'con_libreto' | 'sin_libreto'
  nivelRiesgo?: string[]; // Array de niveles de riesgo
  linkPrueba?: string | 'todos'; // 'todos' | 'con_link' | 'sin_link'
  linkResultados?: string | 'todos'; // 'todos' | 'con_link' | 'sin_link'
  seguimiento?: string | 'todos'; // 'todos' | 'con_seguimiento' | 'sin_seguimiento'
  estadoSeguimiento?: string[]; // Array de estados de seguimiento
}

// Interface específica para filtros de reclutamiento
export interface FilterValuesReclutamiento {
  estados: string[];
  responsables: string[];
  implementadores: string[];
  periodos: string[];
  tiposInvestigacion: string[];
  fechaInicioDe: string;
  fechaInicioHasta: string;
  fechaFinDe: string;
  fechaFinHasta: string;
  tieneLibreto: string;
  nivelRiesgo: string[];
  linkPrueba: string;
  linkResultados: string;
  seguimiento: string;
  estadoSeguimiento: string[];
  // Campos específicos para reclutamiento
  tipos?: string[];
  empresas?: string[];
  presupuestoMin?: string;
  presupuestoMax?: string;
  participantesMin?: string;
  participantesMax?: string;
  porcentajeAvance?: [number, number];
  numeroParticipantes?: [number, number];
}

// Interface unificada para compatibilidad (deprecated)
export interface FilterValues extends FilterValuesInvestigacion {
  // Campos específicos para reclutamiento
  tipos?: string[];
  empresas?: string[];
  presupuestoMin?: string;
  presupuestoMax?: string;
  participantesMin?: string;
  participantesMax?: string;
  porcentajeAvance?: [number, number];
  numeroParticipantes?: [number, number];
}

export interface FilterOptions {
  estados?: Array<{ value: string; label: string }>;
  tipos?: Array<{ value: string; label: string }>;
  periodos?: Array<{ value: string; label: string }>;
  responsables?: Array<{ value: string; label: string }>;
  implementadores?: Array<{ value: string; label: string }>;
  creadores?: Array<{ value: string; label: string }>;
  nivelRiesgo?: Array<{ value: string; label: string }>;
  seguimiento?: Array<{ value: string; label: string }>;
  estadoSeguimiento?: Array<{ value: string; label: string }>;
  // Campos específicos para reclutamiento
  tiposInvestigacion?: Array<{ value: string; label: string }>;
  presupuestoMin?: string;
  presupuestoMax?: string;
  participantesMin?: string;
  participantesMax?: string;
  porcentajeAvance?: [number, number];
  numeroParticipantes?: [number, number];
  // Campos específicos para participantes
  roles?: Array<{ value: string; label: string }>;
  empresas?: Array<{ value: string; label: string }>;
  departamentos?: Array<{ value: string; label: string }>;
  tieneEmail?: Array<{ value: string; label: string }>;
  tieneProductos?: Array<{ value: string; label: string }>;
  // Campos específicos para empresas
  sectores?: Array<{ value: string; label: string }>;
  tamanos?: Array<{ value: string; label: string }>;
  paises?: Array<{ value: string; label: string }>;
  kams?: Array<{ value: string; label: string }>;
  industrias?: Array<{ value: string; label: string }>;
  modalidades?: Array<{ value: string; label: string }>;
  relaciones?: Array<{ value: string; label: string }>;
  productos?: Array<{ value: string; label: string }>;
  usuarios?: Array<{ id: string; full_name?: string; nombre?: string; email?: string; correo?: string; avatar_url?: string }>;
}

// Interface específica para filtros de participantes
export interface FilterValuesParticipantes {
  busqueda?: string;
  tipo?: string | 'todos';
  estado_participante?: string | 'todos';
  rol_empresa?: string | 'todos';
  empresa?: string | 'todos';
  departamento?: string | 'todos';
  fecha_ultima_participacion_desde?: string;
  fecha_ultima_participacion_hasta?: string;
  total_participaciones_min?: string;
  total_participaciones_max?: string;
  tiene_email?: string | 'todos';
  tiene_productos?: string | 'todos';
}

// Interface específica para filtros de empresas
export interface FilterValuesEmpresa {
  busqueda?: string;
  estado?: string | 'todos';
  sector?: string | 'todos';
  tamano?: string | 'todos';
  pais?: string | 'todos';
  kam_id?: string | 'todos';
  activo?: boolean;
  industria?: string | 'todos';
  modalidad?: string | 'todos';
  relacion?: string | 'todos';
  producto?: string | 'todos';
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterValuesInvestigacion | FilterValuesReclutamiento | FilterValuesParticipantes | FilterValuesEmpresa;
  onFiltersChange: (filters: FilterValuesInvestigacion | FilterValuesReclutamiento | FilterValuesParticipantes | FilterValuesEmpresa) => void;
  options: FilterOptions;
  className?: string;
  type?: 'investigacion' | 'reclutamiento' | 'participante' | 'empresa';
  participanteType?: 'externos' | 'internos' | 'friend_family';
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  options,
  className = '',
  type = 'investigacion',
  participanteType = 'externos'
}) => {
  const { theme } = useTheme();



  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    if (type === 'investigacion') {
      onFiltersChange({
        busqueda: '',
        estado: 'todos',
        tipo: 'todos',
        periodo: 'todos',
        responsable: 'todos',
        implementador: 'todos',
        creador: 'todos',
        fecha_inicio_desde: '',
        fecha_inicio_hasta: '',
        fecha_fin_desde: '',
        fecha_fin_hasta: '',
        tieneLibreto: 'todos',
        nivelRiesgo: [],
        linkPrueba: 'todos',
        linkResultados: 'todos',
        seguimiento: 'todos',
        estadoSeguimiento: []
      } as FilterValuesInvestigacion);
    } else if (type === 'participante') {
      onFiltersChange({
        busqueda: '',
        tipo: 'todos',
        estado_participante: 'todos',
        rol_empresa: 'todos',
        empresa: 'todos',
        departamento: 'todos',
        fecha_ultima_participacion_desde: '',
        fecha_ultima_participacion_hasta: '',
        total_participaciones_min: '',
        total_participaciones_max: '',
        tiene_email: 'todos',
        tiene_productos: 'todos'
      } as FilterValuesParticipantes);
    } else if (type === 'empresa') {
      onFiltersChange({
        busqueda: '',
        estado: 'todos',
        tamano: 'todos',
        pais: 'todos',
        kam_id: 'todos',
        activo: undefined,
        relacion: 'todos',
        producto: 'todos'
      } as FilterValuesEmpresa);
    } else {
      onFiltersChange({
        estados: [],
        responsables: [],
        implementadores: [],
        periodos: [],
        tiposInvestigacion: [],
        fechaInicioDe: '',
        fechaInicioHasta: '',
        fechaFinDe: '',
        fechaFinHasta: '',
        tieneLibreto: 'todos',
        nivelRiesgo: [],
        linkPrueba: 'todos',
        linkResultados: 'todos',
        seguimiento: 'todos',
        estadoSeguimiento: [],
        tipos: [],
        empresas: [],
        presupuestoMin: '',
        presupuestoMax: '',
        participantesMin: '',
        participantesMax: '',
        porcentajeAvance: [0, 100],
        numeroParticipantes: [1, 50]
      } as FilterValuesReclutamiento);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    
    if (type === 'investigacion') {
      const invFilters = filters as FilterValuesInvestigacion;
      if (invFilters.estado && invFilters.estado !== 'todos') count++;
      if (invFilters.tipo && invFilters.tipo !== 'todos') count++;
      if (invFilters.periodo && invFilters.periodo !== 'todos') count++;
      if (invFilters.responsable && invFilters.responsable !== 'todos') count++;
      if (invFilters.implementador && invFilters.implementador !== 'todos') count++;
      if (invFilters.creador && invFilters.creador !== 'todos') count++;
      if (invFilters.fecha_inicio_desde) count++;
      if (invFilters.fecha_inicio_hasta) count++;
      if (invFilters.fecha_fin_desde) count++;
      if (invFilters.fecha_fin_hasta) count++;
      if (invFilters.tieneLibreto && invFilters.tieneLibreto !== 'todos') count++;
      if (invFilters.nivelRiesgo && invFilters.nivelRiesgo.length > 0) count++;
      if (invFilters.linkPrueba && invFilters.linkPrueba !== 'todos') count++;
      if (invFilters.linkResultados && invFilters.linkResultados !== 'todos') count++;
      if (invFilters.seguimiento && invFilters.seguimiento !== 'todos') count++;
      if (invFilters.estadoSeguimiento && invFilters.estadoSeguimiento.length > 0) count++;
    } else if (type === 'participante') {
      const partFilters = filters as FilterValuesParticipantes;
      if (partFilters.busqueda) count++;
      if (partFilters.estado_participante && partFilters.estado_participante !== 'todos') count++;
      if (partFilters.rol_empresa && partFilters.rol_empresa !== 'todos') count++;
      if (partFilters.empresa && partFilters.empresa !== 'todos') count++;
      if (partFilters.departamento && partFilters.departamento !== 'todos') count++;

      if (partFilters.fecha_ultima_participacion_desde) count++;
      if (partFilters.fecha_ultima_participacion_hasta) count++;
      if (partFilters.total_participaciones_min) count++;
      if (partFilters.total_participaciones_max) count++;
      if (partFilters.tiene_email && partFilters.tiene_email !== 'todos') count++;
      if (partFilters.tiene_productos && partFilters.tiene_productos !== 'todos') count++;
    } else if (type === 'empresa') {
      const empFilters = filters as FilterValuesEmpresa;
      if (empFilters.estado && empFilters.estado !== 'todos') count++;
      if (empFilters.sector && empFilters.sector !== 'todos') count++;
      if (empFilters.tamano && empFilters.tamano !== 'todos') count++;
      if (empFilters.pais && empFilters.pais !== 'todos') count++;
      if (empFilters.kam_id && empFilters.kam_id !== 'todos') count++;
      if (empFilters.activo !== undefined) count++;
      if (empFilters.industria && empFilters.industria !== 'todos') count++;
      if (empFilters.modalidad && empFilters.modalidad !== 'todos') count++;
      if (empFilters.relacion && empFilters.relacion !== 'todos') count++;
      if (empFilters.producto && empFilters.producto !== 'todos') count++;
    } else {
      const recFilters = filters as FilterValuesReclutamiento;
      if (recFilters.estados.length > 0) count++;
      if (recFilters.responsables.length > 0) count++;
      if (recFilters.implementadores.length > 0) count++;
      if (recFilters.periodos.length > 0) count++;
      if (recFilters.tiposInvestigacion.length > 0) count++;
      if (recFilters.fechaInicioDe) count++;
      if (recFilters.fechaInicioHasta) count++;
      if (recFilters.fechaFinDe) count++;
      if (recFilters.fechaFinHasta) count++;
      if (recFilters.tieneLibreto !== 'todos') count++;
      if (recFilters.nivelRiesgo.length > 0) count++;
      if (recFilters.linkPrueba !== 'todos') count++;
      if (recFilters.linkResultados !== 'todos') count++;
      if (recFilters.seguimiento !== 'todos') count++;
      if (recFilters.estadoSeguimiento.length > 0) count++;
      if (recFilters.tipos && recFilters.tipos.length > 0) count++;
      if (recFilters.empresas && recFilters.empresas.length > 0) count++;
      if (recFilters.presupuestoMin) count++;
      if (recFilters.presupuestoMax) count++;
      if (recFilters.participantesMin) count++;
      if (recFilters.participantesMax) count++;
      if (recFilters.porcentajeAvance && recFilters.porcentajeAvance[0] !== 0) count++;
      if (recFilters.numeroParticipantes && recFilters.numeroParticipantes[0] !== 1) count++;
    }
    
    return count;
  };

  // Opciones de nivel de riesgo sincronizadas con la tabla
  const opcionesNivelRiesgo = [
    { value: 'Alerta Alta', label: 'Alerta Alta' },
    { value: 'Atención', label: 'Atención' },
    { value: 'En Tiempo', label: 'En Tiempo' },
    { value: 'Sin Fecha', label: 'Sin Fecha' },
  ];

  // Agregar opción de filtro para seguimiento
  const opcionesSeguimiento = [
    { value: 'todos', label: 'Todos' },
    { value: 'con_seguimiento', label: 'Con seguimiento' },
    { value: 'sin_seguimiento', label: 'Sin seguimiento' },
  ];

  // Opciones de estado de seguimiento
  const opcionesEstadoSeguimiento = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En progreso' },
    { value: 'completado', label: 'Completado' },
    { value: 'convertido', label: 'Convertido' },
    { value: 'bloqueado', label: 'Bloqueado' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`
        absolute right-0 top-0 h-full w-full max-w-md
        bg-card border-l border-border
         transform transition-transform
        ${className}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <PageHeader
            title="Filtros Avanzados"
            variant="title-only"
            color="gray"
            icon={<FilterIcon className="w-5 h-5 text-foreground" />}
            onClose={onClose}
            chip={getActiveFiltersCount() > 0 ? {
              label: getActiveFiltersCount().toString(),
              variant: "primary",
              size: "sm"
            } : undefined}
          />

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-card">
            {type === 'investigacion' ? (
              // Filtros específicos para investigaciones
              <>
                {/* Estado */}
                <div>
                  <FilterLabel>Estado</FilterLabel>
                  <Select
                    placeholder="Seleccionar estado..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      ...(options.estados || [])
                    ]}
                    value={(filters as FilterValuesInvestigacion).estado || 'todos'}
                    onChange={(value) => handleFilterChange('estado', value)}
                    fullWidth
                  />
                </div>

                {/* Tipo */}
                <div>
                  <FilterLabel>Tipo</FilterLabel>
                  <Select
                    placeholder="Seleccionar tipo..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      ...(options.tipos || [])
                    ]}
                    value={(filters as FilterValuesInvestigacion).tipo || 'todos'}
                    onChange={(value) => handleFilterChange('tipo', value)}
                    fullWidth
                  />
                </div>

                {/* Período */}
                <div>
                  <FilterLabel>Período</FilterLabel>
                  <Select
                    placeholder="Seleccionar período..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      ...(options.periodos || [])
                    ]}
                    value={(filters as FilterValuesInvestigacion).periodo || 'todos'}
                    onChange={(value) => handleFilterChange('periodo', value)}
                    fullWidth
                  />
                </div>

                {/* Responsable */}
                <div>
                  <FilterLabel>Responsable</FilterLabel>
                  <Select
                    placeholder="Seleccionar responsable..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      ...(options.responsables || [])
                    ]}
                    value={(filters as FilterValuesInvestigacion).responsable || 'todos'}
                    onChange={(value) => handleFilterChange('responsable', value)}
                    fullWidth
                  />
                </div>

                {/* Implementador */}
                <div>
                  <FilterLabel>Implementador</FilterLabel>
                  <Select
                    placeholder="Seleccionar implementador..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      ...(options.implementadores || [])
                    ]}
                    value={(filters as FilterValuesInvestigacion).implementador || 'todos'}
                    onChange={(value) => handleFilterChange('implementador', value)}
                    fullWidth
                  />
                </div>

                {/* Creador */}
                <div>
                  <FilterLabel>Creador</FilterLabel>
                  <Select
                    placeholder="Seleccionar creador..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      ...(options.creadores || [])
                    ]}
                    value={(filters as FilterValuesInvestigacion).creador || 'todos'}
                    onChange={(value) => handleFilterChange('creador', value)}
                    fullWidth
                  />
                </div>

                {/* Libreto */}
                <div>
                  <FilterLabel>Libreto</FilterLabel>
                  <Select
                    placeholder="Seleccionar..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      { value: 'con_libreto', label: 'Con libreto' },
                      { value: 'sin_libreto', label: 'Sin libreto' }
                    ]}
                    value={(filters as FilterValuesInvestigacion).tieneLibreto || 'todos'}
                    onChange={(value) => handleFilterChange('tieneLibreto', value)}
                    fullWidth
                  />
                </div>

                {/* Nivel de Riesgo */}
                <div>
                  <FilterLabel>Nivel de Riesgo</FilterLabel>
                  <MultiSelect
                    placeholder="Seleccionar niveles..."
                    options={options.nivelRiesgo || []}
                    value={(filters as FilterValuesInvestigacion).nivelRiesgo || []}
                    onChange={(value) => handleFilterChange('nivelRiesgo', value)}
                    fullWidth
                  />
                </div>

                {/* Link de Prueba */}
                <div>
                  <FilterLabel>Link de Prueba</FilterLabel>
                  <Select
                    placeholder="Seleccionar..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      { value: 'con_link', label: 'Con link' },
                      { value: 'sin_link', label: 'Sin link' }
                    ]}
                    value={(filters as FilterValuesInvestigacion).linkPrueba || 'todos'}
                    onChange={(value) => handleFilterChange('linkPrueba', value)}
                    fullWidth
                  />
                </div>

                {/* Link de Resultados */}
                <div>
                  <FilterLabel>Link de Resultados</FilterLabel>
                  <Select
                    placeholder="Seleccionar..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      { value: 'con_link', label: 'Con link' },
                      { value: 'sin_link', label: 'Sin link' }
                    ]}
                    value={(filters as FilterValuesInvestigacion).linkResultados || 'todos'}
                    onChange={(value) => handleFilterChange('linkResultados', value)}
                    fullWidth
                  />
                </div>

                {/* Seguimiento */}
                <div>
                  <FilterLabel>Seguimiento</FilterLabel>
                  <Select
                    placeholder="Seleccionar..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      { value: 'con_seguimiento', label: 'Con seguimiento' },
                      { value: 'sin_seguimiento', label: 'Sin seguimiento' }
                    ]}
                    value={(filters as FilterValuesInvestigacion).seguimiento || 'todos'}
                    onChange={(value) => handleFilterChange('seguimiento', value)}
                    fullWidth
                  />
                </div>

                {/* Estado de Seguimiento */}
                <div>
                  <FilterLabel>Estado de Seguimiento</FilterLabel>
                  <MultiSelect
                    placeholder="Seleccionar estados..."
                    options={options.estadoSeguimiento || []}
                    value={(filters as FilterValuesInvestigacion).estadoSeguimiento || []}
                    onChange={(value) => handleFilterChange('estadoSeguimiento', value)}
                    fullWidth
                  />
                </div>

                {/* Fecha de Inicio */}
                <div>
                  <FilterLabel>Fecha de Inicio</FilterLabel>
                  <DatePicker
                    placeholder="Seleccionar fecha de inicio..."
                    value={(filters as FilterValuesInvestigacion).fecha_inicio_desde || ''}
                    onChange={(e) => handleFilterChange('fecha_inicio_desde', e.target.value)}
                    fullWidth
                  />
                </div>

                {/* Fecha de Fin */}
                <div>
                  <FilterLabel>Fecha de Fin</FilterLabel>
                  <DatePicker
                    placeholder="Seleccionar fecha de fin..."
                    value={(filters as FilterValuesInvestigacion).fecha_fin_desde || ''}
                    onChange={(e) => handleFilterChange('fecha_fin_desde', e.target.value)}
                    fullWidth
                  />
                </div>
              </>
            ) : type === 'reclutamiento' ? (
              // Filtros específicos para reclutamiento
              <>
                {/* Estados de Reclutamiento */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Estados de Reclutamiento
                  </Typography>
                  <MultiSelect
                    placeholder="Seleccionar estados..."
                    options={options.estados || []}
                    value={(filters as FilterValuesReclutamiento).estados || []}
                    onChange={(value) => handleFilterChange('estados', value)}
                    fullWidth
                  />
                </div>

                {/* Nivel de Riesgo */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Nivel de Riesgo
                  </Typography>
                  <MultiSelect
                    placeholder="Seleccionar niveles..."
                    options={options.nivelRiesgo || []}
                    value={(filters as FilterValuesReclutamiento).nivelRiesgo || []}
                    onChange={(value) => handleFilterChange('nivelRiesgo', value)}
                    fullWidth
                  />
                </div>

                {/* Responsables */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Responsables
                  </Typography>
                  <MultiSelect
                    placeholder="Seleccionar responsables..."
                    options={options.responsables || []}
                    value={(filters as FilterValuesReclutamiento).responsables || []}
                    onChange={(value) => handleFilterChange('responsables', value)}
                    fullWidth
                  />
                </div>

                {/* Implementadores */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Implementadores
                  </Typography>
                  <MultiSelect
                    placeholder="Seleccionar implementadores..."
                    options={options.implementadores || []}
                    value={(filters as FilterValuesReclutamiento).implementadores || []}
                    onChange={(value) => handleFilterChange('implementadores', value)}
                    fullWidth
                  />
                </div>

                {/* Porcentaje de Avance (para reclutamiento) */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Porcentaje de Avance
                  </Typography>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={(filters as FilterValuesReclutamiento).porcentajeAvance || [0, 100]}
                    onChange={(value) => handleFilterChange('porcentajeAvance', value)}
                    formatValue={(value) => `${value}%`}
                    showValues={true}
                  />
                </div>

                {/* Número de Participantes (para reclutamiento) */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Número de Participantes
                  </Typography>
                  <Slider
                    min={1}
                    max={50}
                    step={1}
                    value={(filters as FilterValuesReclutamiento).numeroParticipantes || [1, 50]}
                    onChange={(value) => handleFilterChange('numeroParticipantes', value)}
                    formatValue={(value) => `${value} participantes`}
                    showValues={true}
                  />
                </div>
              </>
            ) : type === 'participante' ? (
              // Filtros específicos para participantes
              <>
                {/* Estado del Participante - solo para participantes externos */}
                {participanteType === 'externos' && (
                  <div>
                    <Typography variant="subtitle2" weight="medium" className="mb-2">
                      Estado del Participante
                    </Typography>
                    <Select
                      placeholder="Seleccionar estado..."
                      options={options.estados || []}
                      value={(filters as FilterValuesParticipantes).estado_participante || 'todos'}
                      onChange={(value) => handleFilterChange('estado_participante', value)}
                      fullWidth
                    />
                  </div>
                )}

                {/* Rol en la Empresa - común para todos los tipos */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Rol en la Empresa
                  </Typography>
                  <Select
                    placeholder="Seleccionar rol..."
                    options={options.roles || []}
                    value={(filters as FilterValuesParticipantes).rol_empresa || 'todos'}
                    onChange={(value) => handleFilterChange('rol_empresa', value)}
                    fullWidth
                  />
                </div>

                {/* Empresa - solo para participantes externos */}
                {participanteType === 'externos' && (
                  <div>
                    <Typography variant="subtitle2" weight="medium" className="mb-2">
                      Empresa
                    </Typography>
                    <Select
                      placeholder="Seleccionar empresa..."
                      options={options.empresas || []}
                      value={(filters as FilterValuesParticipantes).empresa || 'todos'}
                      onChange={(value) => handleFilterChange('empresa', value)}
                      fullWidth
                    />
                  </div>
                )}

                {/* Departamento - solo para participantes internos y friend & family */}
                {(participanteType === 'internos' || participanteType === 'friend_family') && (
                  <div>
                    <Typography variant="subtitle2" weight="medium" className="mb-2">
                      Departamento
                    </Typography>
                    <Select
                      placeholder="Seleccionar departamento..."
                      options={options.departamentos || []}
                      value={(filters as FilterValuesParticipantes).departamento || 'todos'}
                      onChange={(value) => handleFilterChange('departamento', value)}
                      fullWidth
                    />
                  </div>
                )}

                {/* Fecha Última Participación - común para todos los tipos */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Fecha Última Participación
                  </Typography>
                  <div className="grid grid-cols-2 gap-2">
                    <DatePicker
                      placeholder="Desde..."
                      value={(filters as FilterValuesParticipantes).fecha_ultima_participacion_desde || ''}
                      onChange={(e) => handleFilterChange('fecha_ultima_participacion_desde', e.target.value)}
                    />
                    <DatePicker
                      placeholder="Hasta..."
                      value={(filters as FilterValuesParticipantes).fecha_ultima_participacion_hasta || ''}
                      onChange={(e) => handleFilterChange('fecha_ultima_participacion_hasta', e.target.value)}
                    />
                  </div>
                </div>

                {/* Total de Participaciones - común para todos los tipos */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Total de Participaciones
                  </Typography>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Mínimo"
                      value={(filters as FilterValuesParticipantes).total_participaciones_min || ''}
                      onChange={(e) => handleFilterChange('total_participaciones_min', e.target.value)}
                      type="number"
                    />
                    <Input
                      placeholder="Máximo"
                      value={(filters as FilterValuesParticipantes).total_participaciones_max || ''}
                      onChange={(e) => handleFilterChange('total_participaciones_max', e.target.value)}
                      type="number"
                    />
                  </div>
                </div>

                {/* Tiene Email - común para todos los tipos */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Tiene Email
                  </Typography>
                  <Select
                    placeholder="Seleccionar..."
                    options={options.tieneEmail || []}
                    value={(filters as FilterValuesParticipantes).tiene_email || 'todos'}
                    onChange={(value) => handleFilterChange('tiene_email', value)}
                    fullWidth
                  />
                </div>

                {/* Tiene Productos - solo para participantes externos */}
                {participanteType === 'externos' && (
                  <div>
                    <Typography variant="subtitle2" weight="medium" className="mb-2">
                      Tiene Productos
                    </Typography>
                    <Select
                      placeholder="Seleccionar..."
                      options={options.tieneProductos || []}
                      value={(filters as FilterValuesParticipantes).tiene_productos || 'todos'}
                      onChange={(value) => handleFilterChange('tiene_productos', value)}
                      fullWidth
                    />
                  </div>
                )}
              </>
            ) : type === 'empresa' ? (
              // Filtros específicos para empresas
              <>
                {/* Estado */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Estado
                  </Typography>
                  <Select
                    placeholder="Seleccionar estado..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      ...(options.estados || [])
                    ]}
                    value={(filters as FilterValuesEmpresa).estado || 'todos'}
                    onChange={(value) => handleFilterChange('estado', value)}
                    fullWidth
                  />
                </div>



                {/* Tamaño */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Tamaño
                  </Typography>
                  <Select
                    placeholder="Seleccionar tamaño..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      ...(options.tamanos || [])
                    ]}
                    value={(filters as FilterValuesEmpresa).tamano || 'todos'}
                    onChange={(value) => handleFilterChange('tamano', value)}
                    fullWidth
                  />
                </div>

                {/* País */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    País
                  </Typography>
                  <Select
                    placeholder="Seleccionar país..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      ...(options.paises || [])
                    ]}
                    value={(filters as FilterValuesEmpresa).pais || 'todos'}
                    onChange={(value) => handleFilterChange('pais', value)}
                    fullWidth
                  />
                </div>

                {/* KAM */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    KAM
                  </Typography>
                  <UserSelect
                    value={(filters as FilterValuesEmpresa).kam_id || 'todos'}
                    onChange={(value) => handleFilterChange('kam_id', value)}
                    users={options.usuarios || []}
                    placeholder="Seleccionar KAM..."
                    fullWidth
                  />
                </div>



                {/* Relación */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Relación
                  </Typography>
                  <Select
                    placeholder="Seleccionar relación..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      ...(options.relaciones || [])
                    ]}
                    value={(filters as FilterValuesEmpresa).relacion || 'todos'}
                    onChange={(value) => handleFilterChange('relacion', value)}
                    fullWidth
                  />
                </div>

                {/* Producto */}
                <div>
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Producto
                  </Typography>
                  <Select
                    placeholder="Seleccionar producto..."
                    options={[
                      { value: 'todos', label: 'Todos' },
                      ...(options.productos || [])
                    ]}
                    value={(filters as FilterValuesEmpresa).producto || 'todos'}
                    onChange={(value) => handleFilterChange('producto', value)}
                    fullWidth
                  />
                </div>
              </>
            ) : (
              // Filtros por defecto o para otros tipos
              <div className="p-4">
                <Typography variant="body2" className="text-muted-foreground">
                  No hay filtros disponibles para este tipo.
                </Typography>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-card">
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={clearAllFilters}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Limpiar Filtros
              </Button>
              <Button
                variant="primary"
                onClick={onClose}
                className="flex-1"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 

export default FilterDrawer; 