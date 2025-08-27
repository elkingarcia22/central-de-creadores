import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import DataTable from '../ui/DataTable';
import { Subtitle } from '../ui/Subtitle';
import { ShieldIcon, SearchIcon } from '../icons';
import Typography from '../ui/Typography';

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  es_sistema: boolean;
}

interface RolesUnifiedContainerProps {
  // Datos
  roles: Rol[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Configuración de tabla
  columns: any[];
  
  // Acciones
  onEditarRol: (rol: Rol) => void;
  onEliminarRol: (rol: Rol) => void;
  onVerPermisos: (rol: Rol) => void;
  assigningPermissions: boolean;
}

export default function RolesUnifiedContainer({
  roles,
  loading,
  searchTerm,
  setSearchTerm,
  columns,
  onEditarRol,
  onEliminarRol,
  onVerPermisos,
  assigningPermissions
}: RolesUnifiedContainerProps) {
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

  // Filtrar roles basado en searchTerm
  const rolesFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return roles;
    
    const termino = searchTerm.toLowerCase();
    return roles.filter(rol => 
      rol?.nombre?.toLowerCase().includes(termino) ||
      rol?.descripcion?.toLowerCase().includes(termino)
    );
  }, [roles, searchTerm]);

  return (
    <Card variant="elevated" padding="lg" className="space-y-6">
      {/* Header del contenedor */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Subtitle>
            Lista de Roles y Permisos
          </Subtitle>
          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
            {rolesFiltrados.length} de {roles.length}
          </span>
        </div>
        
        {/* Iconos de búsqueda integrados en el header */}
        <div className="flex items-center gap-2">
          {/* Icono de búsqueda que se expande */}
          <div className="relative">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar roles..."
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
        </div>
      </div>



      {/* Tabla de roles */}
      <DataTable
        data={rolesFiltrados.filter(rol => rol && typeof rol === 'object')}
        columns={columns}
        loading={loading}
        searchable={false}
        filterable={false}
        selectable={false}
        emptyMessage={searchTerm ? 'No se encontraron roles que coincidan con la búsqueda.' : 'No hay roles configurados. Crea el primer rol o asigna permisos por defecto.'}
        loadingMessage="Cargando roles..."
        rowKey="id"
      />
    </Card>
  );
}
