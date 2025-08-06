import React, { useState } from 'react';
import { SortIcon, SortAscIcon, SortDescIcon, DeleteIcon } from '../icons';

function getInitials(nombre: string, email: string) {
  if (nombre) {
    return nombre.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return 'U';
}

interface UsuariosTableProps {
  usuarios: any[];
  loading?: boolean;
  onEdit: (usuario: any) => void;
  onDelete: (usuario: any) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (col: string) => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  // Filtros, buscador, paginación, etc. pueden agregarse como props
}

const ROLES = [
  { id: 'Administrador', nombre: 'Administrador' },
  { id: 'Editor', nombre: 'Editor' },
  { id: 'Usuario', nombre: 'Usuario' }
];

const UsuariosTable: React.FC<UsuariosTableProps> = ({ usuarios, loading, onEdit, onDelete, sortBy, sortOrder, onSort }) => {
  const [search, setSearch] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');

  // Filtrado interno: por nombre/correo y por rol
  const usuariosFiltrados = usuarios.filter((usuario: any) => {
    const texto = `${usuario.nombre_completo || usuario.full_name || ''} ${usuario.email || ''}`.toLowerCase();
    const coincideBusqueda = texto.includes(search.toLowerCase());
    const coincideRol = rolFiltro
      ? usuario.roles && usuario.roles.includes(rolFiltro)
      : true;
    return coincideBusqueda && coincideRol;
  });

  const renderSortIcon = (col: string) => {
    if (sortBy !== col) return <SortIcon className="ml-1 w-4 h-4 text-muted-foreground" />;
    return sortOrder === 'asc' ? <SortAscIcon className="ml-1 w-4 h-4 text-primary" /> : <SortDescIcon className="ml-1 w-4 h-4 text-primary" />;
  };

  return (
    <div className="space-y-4">
      {/* Buscador único y filtro de rol */}
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          className="border border-border rounded-md p-2 w-64 max-w-xs bg-input text-foreground"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-border rounded-md p-2 bg-input text-foreground"
          value={rolFiltro}
          onChange={e => setRolFiltro(e.target.value)}
        >
          <option value="">Todos los roles</option>
          {ROLES.map(rol => (
            <option key={rol.id} value={rol.id}>{rol.nombre}</option>
          ))}
        </select>
      </div>
      {/* Tabla */}
      <div className="overflow-x-auto scrollbar-horizontal">
        <table className="min-w-full divide-y divide-input">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2">Foto</th>
              <th className="px-4 py-2 cursor-pointer select-none" onClick={() => onSort('nombre')}>
                Nombre completo {renderSortIcon('nombre')}
              </th>
              <th className="px-4 py-2 cursor-pointer select-none" onClick={() => onSort('email')}>
                Correo electrónico {renderSortIcon('email')}
              </th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2 cursor-pointer select-none" onClick={() => onSort('created_at')}>
                Fecha de creación {renderSortIcon('created_at')}
              </th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-input">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8">Cargando...</td></tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Sin usuarios</td></tr>
            ) : (
              usuariosFiltrados.map((usuario: any, idx: number) => (
                <tr key={usuario.email || idx}>
                  <td className="px-4 py-2">
                    {usuario.avatar_url ? (
                      <img 
                        src={usuario.avatar_url} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className={`inline-flex items-center justify-center w-8 h-8 bg-muted rounded-full text-muted-foreground text-sm ${usuario.avatar_url ? 'hidden' : ''}`}>
                      {getInitials(usuario.nombre_completo || usuario.full_name, usuario.email)}
                    </span>
                  </td>
                  <td className="px-4 py-2">{usuario.nombre_completo || usuario.full_name || <span className="text-muted-foreground">Sin nombre</span>}</td>
                  <td className="px-4 py-2">{usuario.email || <span className="text-muted-foreground">Sin correo</span>}</td>
                  <td className="px-4 py-2">
                    {usuario.roles && usuario.roles.length > 0
                      ? usuario.roles.map((rol: string, idx: number) => (
                          <span key={rol} className="inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded mr-1">
                            {rol}
                          </span>
                        ))
                      : <span className="text-muted-foreground">Sin rol</span>
                    }
                  </td>
                  <td className="px-4 py-2">
                    {usuario.created_at 
                      ? new Date(usuario.created_at).toLocaleDateString() 
                      : usuario.id ? 'Sin fecha' : ''}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button 
                      title="Editar" 
                      className="text-primary hover:text-primary/80 p-1 rounded transition-colors" 
                      onClick={() => onEdit(usuario)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0H7v2a2 2 0 002 2h2v-2a2 2 0 00-2-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(usuario)}
                      className="p-1 rounded transition-colors duration-200"
                      style={{
                        color: '#dc2626',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#b91c1c';
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#dc2626';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Eliminar usuario"
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Paginación eliminada, ahora está fuera de la tabla */}
    </div>
  );
};

export default UsuariosTable; 