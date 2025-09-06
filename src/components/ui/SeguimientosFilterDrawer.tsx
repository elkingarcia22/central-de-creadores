import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';
import Select from './Select';
import DatePicker from './DatePicker';
import Typography from './Typography';
import Chip from './Chip';
import { PageHeader, FormContainer, FormItem, Subtitle, FilterLabel } from './';
import { CloseIcon, FilterIcon, TrashIcon } from '../icons';

// Interface específica para filtros de seguimientos
export interface FilterValuesSeguimientos {
  busqueda?: string;
  estado_seguimiento?: string | 'todos';
  responsable_seguimiento?: string | 'todos';
  participante_seguimiento?: string | 'todos';
  investigacion_seguimiento?: string | 'todos';
  fecha_seguimiento_desde?: string;
  fecha_seguimiento_hasta?: string;
}

export interface SeguimientosFilterOptions {
  estados?: Array<{ value: string; label: string }>;
  responsables?: Array<{ value: string; label: string }>;
  participantes?: Array<{ value: string; label: string }>;
  investigaciones?: Array<{ value: string; label: string }>;
}

interface SeguimientosFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterValuesSeguimientos;
  onFiltersChange: (filters: FilterValuesSeguimientos) => void;
  options: SeguimientosFilterOptions;
  className?: string;
}

const SeguimientosFilterDrawer: React.FC<SeguimientosFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  options,
  className = ''
}) => {
  const { theme } = useTheme();

  const handleFilterChange = (key: keyof FilterValuesSeguimientos, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterValuesSeguimientos = {
      busqueda: '',
      estado_seguimiento: 'todos',
      responsable_seguimiento: 'todos',
      participante_seguimiento: 'todos',
      investigacion_seguimiento: 'todos',
      fecha_seguimiento_desde: '',
      fecha_seguimiento_hasta: ''
    };
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.estado_seguimiento && filters.estado_seguimiento !== 'todos') count++;
    if (filters.responsable_seguimiento && filters.responsable_seguimiento !== 'todos') count++;
    if (filters.participante_seguimiento && filters.participante_seguimiento !== 'todos') count++;
    if (filters.investigacion_seguimiento && filters.investigacion_seguimiento !== 'todos') count++;
    if (filters.fecha_seguimiento_desde) count++;
    if (filters.fecha_seguimiento_hasta) count++;
    return count;
  };

  if (!isOpen) return null;

  const drawerContent = (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`
          absolute right-0 top-0 h-full w-full max-w-md
          bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700
          transform transition-transform
          ${className}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <PageHeader
            title="Filtros de Seguimientos"
            variant="title-only"
            onClose={onClose}
            icon={<FilterIcon className="w-5 h-5" />}
            className="mb-0"
            chip={
              getActiveFiltersCount() > 0 ? {
                label: getActiveFiltersCount().toString(),
                variant: 'primary',
                size: 'sm'
              } : undefined
            }
          />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Estado */}
          <div>
            <FilterLabel>Estado</FilterLabel>
            <Select
              placeholder="Seleccionar estado..."
              options={[
                { value: 'todos', label: 'Todos' },
                ...(options.estados || [])
              ]}
              value={filters.estado_seguimiento || 'todos'}
              onChange={(value) => handleFilterChange('estado_seguimiento', value)}
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
              value={filters.responsable_seguimiento || 'todos'}
              onChange={(value) => handleFilterChange('responsable_seguimiento', value)}
              fullWidth
            />
          </div>

          {/* Participante */}
          <div>
            <FilterLabel>Participante</FilterLabel>
            <Select
              placeholder="Seleccionar participante..."
              options={[
                { value: 'todos', label: 'Todos' },
                ...(options.participantes || [])
              ]}
              value={filters.participante_seguimiento || 'todos'}
              onChange={(value) => handleFilterChange('participante_seguimiento', value)}
              fullWidth
            />
          </div>

          {/* Investigación */}
          <div>
            <FilterLabel>Investigación</FilterLabel>
            <Select
              placeholder="Seleccionar investigación..."
              options={[
                { value: 'todos', label: 'Todos' },
                ...(options.investigaciones || [])
              ]}
              value={filters.investigacion_seguimiento || 'todos'}
              onChange={(value) => handleFilterChange('investigacion_seguimiento', value)}
              fullWidth
            />
          </div>

          {/* Rango de Fechas */}
          <div>
            <FilterLabel>Rango de Fechas</FilterLabel>
            <div className="space-y-2">
              <DatePicker
                placeholder="Fecha desde..."
                value={filters.fecha_seguimiento_desde || ''}
                onChange={(e) => handleFilterChange('fecha_seguimiento_desde', e.target.value)}
                fullWidth
              />
              <DatePicker
                placeholder="Fecha hasta..."
                value={filters.fecha_seguimiento_hasta || ''}
                onChange={(e) => handleFilterChange('fecha_seguimiento_hasta', e.target.value)}
                fullWidth
              />
            </div>
          </div>
        </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <Button
                variant="outline"
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
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Usar Portal para renderizar fuera del DOM normal
  return createPortal(drawerContent, document.body);
};

export default SeguimientosFilterDrawer;
