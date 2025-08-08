import React from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import Card from './Card';

interface FilterConfig {
  key: string;
  type: 'search' | 'select' | 'date' | 'number';
  label?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  onReset?: () => void;
  showReset?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function FilterBar({
  filters,
  onReset,
  showReset = true,
  className = '',
  children
}: FilterBarProps) {
  
  const hasActiveFilters = filters.some(filter => {
    if (filter.type === 'search') {
      return filter.value && filter.value.toString().trim() !== '';
    }
    if (filter.type === 'select') {
      return filter.value && filter.value !== 'todos' && filter.value !== '';
    }
    return filter.value !== '' && filter.value !== 0;
  });

  const renderFilter = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'search':
        return (
          <div key={filter.key} className="relative">
            <Input
              value={filter.value.toString()}
              onChange={(e) => filter.onChange(e.target.value)}
              placeholder={filter.placeholder || 'Buscar...'}
              className={filter.className}
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        );

      case 'select':
        return (
          <Select
            key={filter.key}
            value={filter.value.toString()}
            onChange={(value) => filter.onChange(value)}
            options={filter.options || []}
            placeholder={filter.placeholder}
            className={filter.className}
          />
        );

      case 'date':
        return (
          <Input
            key={filter.key}
            type="text"
            value={filter.value.toString()}
            onChange={(e) => filter.onChange(e.target.value)}
            placeholder={filter.placeholder}
            className={filter.className}
          />
        );

      case 'number':
        return (
          <Input
            key={filter.key}
            type="number"
            value={filter.value.toString()}
            onChange={(e) => filter.onChange(e.target.value)}
            placeholder={filter.placeholder}
            className={filter.className}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Filtros */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filters.map(renderFilter)}
        </div>

        {/* Controles adicionales */}
        <div className="flex items-center gap-2">
          {children}
          
          {showReset && hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="whitespace-nowrap"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            <span>
              {filters.filter(f => {
                if (f.type === 'search') return f.value && f.value.toString().trim() !== '';
                if (f.type === 'select') return f.value && f.value !== 'todos' && f.value !== '';
                return f.value !== '' && f.value !== 0;
              }).length} filtro(s) activo(s)
            </span>
          </div>
        </div>
      )}
    </Card>
  );
} 