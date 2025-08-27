import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import DataTable from '../ui/DataTable';
import { Subtitle } from '../ui/Subtitle';
import { UserIcon, SearchIcon } from '../icons';

interface UsuariosUnifiedContainerProps {
  // Datos
  usuarios: any[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Filtros
  filtroRol: string;
  setFiltroRol: (rol: string) => void;
  rolesUnicos: Array<{value: string, label: string}>;
  
  // Configuración de tabla
  columns: any[];
  onRowEdit?: (row: any) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
  bulkActions?: any[];
  clearSelection?: boolean;
  
  // Acciones
  rowActions?: any[];
}

export default function UsuariosUnifiedContainer({
  usuarios,
  loading,
  searchTerm,
  setSearchTerm,
  filtroRol,
  setFiltroRol,
  rolesUnicos,
  columns,
  onRowEdit,
  onSelectionChange,
  bulkActions,
  clearSelection,
  rowActions
}: UsuariosUnifiedContainerProps) {
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

  // Función para convertir UUID de rol a nombre legible
  const convertirRolUUIDaNombre = (rolUUID: string): string => {
    const rolesMap = {
      'bcc17f6a-d751-4c39-a479-412abddde0fa': 'Administrador',
      'e1fb53e3-3d1c-4ff5-bdac-9a1285dd99d7': 'Investigador',
      'fcf6ffc7-e8d3-407b-8c72-b4a7e8db6c9c': 'Reclutador',
      '7e329b4c-3716-4781-919e-54106b51ca99': 'Agendador'
    };
    return rolesMap[rolUUID as keyof typeof rolesMap] || rolUUID;
  };

  // Filtrar usuarios basado en searchTerm y filtroRol
  const usuariosFiltrados = useMemo(() => {
    const filtrados = usuarios.filter((u) => {
      const matchSearch = !searchTerm || 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRol = !filtroRol || (u.roles && u.roles.some(rol => 
        convertirRolUUIDaNombre(rol) === filtroRol
      ));
      return matchSearch && matchRol;
    });
    
    return filtrados;
  }, [usuarios, searchTerm, filtroRol]);

  return (
    <Card variant="elevated" padding="lg" className="space-y-6">
      {/* Header del contenedor con iconos integrados */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Subtitle>
            Lista de Usuarios
          </Subtitle>
          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
            {usuariosFiltrados.length} de {usuarios.length}
          </span>
        </div>
        
        {/* Iconos de búsqueda y filtro en la misma línea */}
        <div className="flex items-center gap-2">
          {/* Icono de búsqueda que se expande */}
          <div className="relative">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar usuarios..."
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
          
          {/* Filtro de roles */}
          <Select
            options={[
              { value: '', label: 'Todos los roles' },
              ...rolesUnicos
            ]}
            value={filtroRol}
            onChange={value => setFiltroRol(value.toString())}
            size="md"
            variant="default"
            fullWidth={false}
          />
        </div>
      </div>

      {/* Tabla de usuarios */}
      <DataTable
        data={usuariosFiltrados}
        columns={columns}
        loading={loading}
        searchable={false}
        filterable={false}
        selectable={!!onSelectionChange}
        onSelectionChange={onSelectionChange}
        onRowEdit={onRowEdit}
        actions={rowActions}
        bulkActions={bulkActions}
        emptyMessage="No se encontraron usuarios"
        loadingMessage="Cargando usuarios..."
        rowKey="id"
        clearSelection={clearSelection}
      />
    </Card>
  );
}
