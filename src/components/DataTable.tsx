import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SortIcon, SortAscIcon, SortDescIcon } from './icons';

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
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
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: any) => void;
    className?: string;
    title?: string;
  }[];
  emptyMessage?: string;
  loadingMessage?: string;
  className?: string;
}

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
  sortable = true,
  pagination = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  actions = [],
  emptyMessage = "No hay datos para mostrar",
  loadingMessage = "Cargando...",
  className = ""
}) => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filtrar datos
  const filteredData = data.filter(item => {
    const matchesSearch = !search || searchKeys.some(key => {
      const value = item[key];
      return value && value.toString().toLowerCase().includes(search.toLowerCase());
    });
    
    const matchesFilter = !filter || !filterKey || item[filterKey] === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Ordenar datos
  const sortedData = sortable && sortBy ? 
    [...filteredData].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    }) : filteredData;

  // Paginar datos
  const paginatedData = pagination ? 
    sortedData.slice((page - 1) * pageSize, page * pageSize) : 
    sortedData;

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Resetear página cuando cambien filtros
  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (key: string) => {
    if (sortBy !== key) return <SortIcon className="ml-1 w-4 h-4 text-gray-400" />;
    return sortOrder === 'asc' ? 
      <SortAscIcon className="ml-1 w-4 h-4 text-primary" /> : 
      <SortDescIcon className="ml-1 w-4 h-4 text-primary" />;
  };

  const getValue = (item: any, key: string) => {
    return key.split('.').reduce((obj, k) => obj?.[k], item);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filtros */}
      {(searchable || filterable) && (
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {searchable && (
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 rounded border bg-input border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
          {filterable && (
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-4 py-2 rounded border bg-input border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todos</option>
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto scrollbar-horizontal">
        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}>
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 ${column.sortable && sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-100' : ''} ${column.width || ''}`}
                  onClick={() => column.sortable && sortable ? handleSort(column.key) : undefined}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {loadingMessage}
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr key={item.id || index} className={theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}>
                  {columns.map(column => (
                    <td key={column.key} className={`px-4 py-2 text-foreground`}>
                      {column.render ? 
                        column.render(getValue(item, column.key), item) : 
                        getValue(item, column.key) || '-'
                      }
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(item)}
                            title={action.title || action.label}
                            className={`p-1 rounded transition-colors ${action.className || (theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')}`}
                          >
                            {action.icon || action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && sortedData.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded font-semibold transition-colors ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100'} disabled:opacity-50`}
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded font-semibold transition-colors ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100'} disabled:opacity-50`}
            >
              Siguiente
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Página</span>
            <span className={`text-sm font-bold text-foreground`}>{page}</span>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>| Mostrar</span>
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className={`px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>por página</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable; 