import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import SelectSimple from './SelectSimple';
import Typography from './Typography';
import ActionsMenu from './ActionsMenu';
import { ChevronDownIcon, ChevronRightIcon, EditIcon, CheckIcon, CloseIcon } from '../icons';

// Tipos de datos
export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  editable?: boolean;
  hidden?: boolean;
  width?: string;
  render?: (value: any, row: any, isEditing: boolean, onSave: (value: any) => void) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  sortFn?: (a: any, b: any) => number; // Función de ordenamiento personalizada
}

export interface DataTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  filterable?: boolean;
  filterOptions?: { value: string; label: string }[];
  filterKey?: string;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowEdit?: (rowId: string, field: string, value: any) => void;
  onRowDelete?: (rowId: string) => void;
  onRowClick?: (row: any) => void;
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: any) => void;
    className?: string;
    title?: string;
  }[];
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedIds: string[]) => void;
    className?: string;
  }[];
  emptyMessage?: string;
  loadingMessage?: string;
  className?: string;
  rowKey?: string;
  clearSelection?: boolean;
}

// Función helper para obtener valores anidados
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Componente principal DataTable
const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Buscar...",
  searchKeys = [],
  filterable = false,
  filterOptions = [],
  filterKey = '',
  selectable = false,
  onSelectionChange,
  onRowEdit,
  onRowDelete,
  onRowClick,
  actions = [],
  bulkActions = [],
  emptyMessage = "No hay datos para mostrar",
  loadingMessage = "Cargando...",
  className = "",
  rowKey = "id",
  clearSelection = false
}) => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Filtrar datos
  const filteredData = useMemo(() => {
    // Si no hay datos, retornar array vacío
    if (data.length === 0) {
      return [];
    }
    
    return data.filter(item => {
      const matchesSearch = !search || searchKeys.some(key => {
        const value = getNestedValue(item, key);
        return value && value.toString().toLowerCase().includes(search.toLowerCase());
      });
      
      const matchesFilter = !filter || !filterKey || getNestedValue(item, filterKey) === filter;
      
      return matchesSearch && matchesFilter;
    });
  }, [data, search, filter, searchKeys, filterKey, rowKey]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      // Buscar la columna que se está ordenando
      const column = columns.find(col => col.key === sortBy);
      
      // Si la columna tiene una función de ordenamiento personalizada, usarla
      if (column?.sortFn) {
        const result = column.sortFn(a, b);
        return sortOrder === 'asc' ? result : -result;
      }
      
      // Ordenamiento estándar por valor de la columna
      const aVal = getNestedValue(a, sortBy);
      const bVal = getNestedValue(b, sortBy);
      
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortBy, sortOrder, columns]);

  const handleSort = useCallback((key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  const handleRowSelect = useCallback((rowId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
  }, [selectedRows]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(sortedData.map(row => row[rowKey] || row.id || row._id)));
    } else {
      setSelectedRows(new Set());
    }
  }, [sortedData, rowKey]);

  // Notificar cambios de selección
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedRows));
    }
  }, [selectedRows]); // Removemos onSelectionChange de las dependencias

  // Limpiar selección cuando cambia la data (por ejemplo, después de eliminar usuarios)
  useEffect(() => {
    const currentDataIds = new Set(data.map(row => row[rowKey] || row.id || row._id));
    const validSelections = new Set(Array.from(selectedRows).filter(id => currentDataIds.has(id)));
    
    if (validSelections.size !== selectedRows.size) {
      setSelectedRows(validSelections);
    }
  }, [data, selectedRows, rowKey]);

  // Forzar limpieza de selección cuando se active clearSelection
  useEffect(() => {
    if (clearSelection) {
      setSelectedRows(new Set());
    }
  }, [clearSelection]);

  // Renderizar icono de ordenamiento
  const renderSortIcon = (key: string) => {
    if (sortBy !== key) {
      return <ChevronDownIcon className="ml-1 w-4 h-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? 
      <ChevronDownIcon className="ml-1 w-4 h-4 text-primary" /> : 
      <ChevronRightIcon className="ml-1 w-4 h-4 text-primary" />;
  };

  return (
    <div className={`space-y-4 relative ${className}`}>
      {/* Toolbar - Solo para búsqueda y filtros */}
      {(searchable || filterable) && (
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Búsqueda y filtros */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {searchable && (
                <Input
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="min-w-[200px]"
                />
              )}
              {filterable && (
                <div className="relative">
                  {(() => {
                    const allOptions = [
                      { value: '', label: 'Todos' },
                      ...filterOptions
                    ];
                    return (
                      <SelectSimple
                        options={allOptions}
                        value={filter}
                        onChange={(value) => {
                          setFilter(value.toString());
                        }}
                        placeholder="Filtrar..."
                      />
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Tabla */}
      <Card className="overflow-x-auto overflow-y-visible bg-background dark:bg-gray-900">
        {/* Barra de acciones masivas integrada */}
        {selectable && selectedRows.size > 0 && bulkActions.length > 0 && (
          <div className="px-4 py-3 bg-muted/50 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Typography variant="body2" color="title" weight="medium">
                  {selectedRows.size} usuario{selectedRows.size !== 1 ? 's' : ''} seleccionado{selectedRows.size !== 1 ? 's' : ''}
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                {bulkActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => action.onClick(Array.from(selectedRows))}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-border transition-colors duration-200 ${action.className || ''}`}
                    style={action.className?.includes('text-red') ? {
                      color: '#dc2626',
                      backgroundColor: 'transparent',
                      borderColor: '#dc2626'
                    } : undefined}
                    onMouseEnter={action.className?.includes('text-red') ? (e) => {
                      e.currentTarget.style.color = '#b91c1c';
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                      e.currentTarget.style.borderColor = '#b91c1c';
                    } : undefined}
                    onMouseLeave={action.className?.includes('text-red') ? (e) => {
                      e.currentTarget.style.color = '#dc2626';
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = '#dc2626';
                    } : undefined}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRows(new Set())}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto scrollbar-horizontal">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                {/* Checkbox de selección */}
                {selectable && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-ring"
                    />
                  </th>
                )}

                {/* Headers de columnas */}
                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground ${column.sortable ? 'cursor-pointer hover:text-foreground' : ''} ${column.width || ''}`}
                    onClick={() => column.sortable ? handleSort(column.key) : undefined}
                  >
                    <div className="flex items-center">
                      {column.renderHeader ? column.renderHeader() : column.label}
                      {column.sortable && renderSortIcon(column.key)}
                    </div>
                  </th>
                ))}

                {/* Columna de acciones */}
                {actions.length > 0 && (
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
                          <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td 
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} 
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    {loadingMessage}
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} 
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((row, index) => {
                  const rowId = row[rowKey] || row.id || row._id || index;
                  
                  return (
                    <tr 
                      key={rowId} 
                      className={`group hover:bg-muted/50 transition-all duration-200 ease-in-out ${onRowClick ? 'cursor-pointer' : ''}`}
                      onClick={(e) => {
                        // Solo ejecutar onRowClick si no se hizo clic en un elemento editable
                        if (onRowClick) {
                          const target = e.target as HTMLElement;
                          
                          // Verificar si el clic fue en un elemento que debe ser excluido
                          const isExcluded = target.closest('button') || 
                                           target.closest('input') || 
                                           target.closest('select') || 
                                           target.closest('textarea') ||
                                           target.closest('[data-inline-edit]') ||
                                           target.closest('[role="button"]') ||
                                           target.hasAttribute('contenteditable');
                          
                          if (!isExcluded) {
                            onRowClick(row);
                          }
                        }
                      }}
                    >
                      {/* Checkbox de selección */}
                      {selectable && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(rowId)}
                            onChange={(e) => handleRowSelect(rowId, e.target.checked)}
                            className="rounded border-border text-primary focus:ring-ring"
                          />
                        </td>
                      )}

                      {/* Celdas de datos */}
                      {columns.map(column => {
                        const value = getNestedValue(row, column.key);
                        
                        return (
                          <td key={column.key} className={`px-4 py-3 text-sm text-foreground ${column.width || ''}`}>
                            {column.render ? 
                              column.render(value, row, false, () => {}) :
                              value || '-'
                            }
                          </td>
                        );
                      })}

                      {/* Acciones por fila */}
                      {actions.length > 0 && (
                        <td className="px-4 py-3 text-center">
                          <ActionsMenu
                            actions={actions.map(action => ({
                              label: action.label,
                              icon: action.icon || <EditIcon className="w-4 h-4" />,
                              onClick: () => action.onClick(row),
                              className: action.className
                            }))}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DataTable;
