import React from 'react';
import Typography from '../ui/Typography';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ActionsMenu from '../ui/ActionsMenu';
import { 
  BuildingIcon, 
  UserIcon, 
  EditIcon, 
  CopyIcon, 
  TrashIcon, 
  EyeIcon 
} from '../icons';
import { formatearFecha } from '../../utils/fechas';

interface Empresa {
  id: string;
  nombre: string;
  descripcion?: string;
  // Información del KAM
  kam_id?: string;
  kam_nombre?: string;
  kam_email?: string;
  // Información del país
  pais_id?: string;
  pais_nombre?: string;
  // Información de la industria
  industria_id?: string;
  industria_nombre?: string;
  // Información del estado
  estado_id?: string;
  estado_nombre?: string;
  // Información del tamaño
  tamano_id?: string;
  tamano_nombre?: string;
  // Información de la modalidad
  modalidad_id?: string;
  modalidad_nombre?: string;
  // Información de la relación
  relacion_id?: string;
  relacion_nombre?: string;
  // Información del producto
  producto_id?: string;
  producto_nombre?: string;
  // Campos adicionales para compatibilidad
  sector?: string;
  tamano?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface EmpresasTableProps {
  empresas: Empresa[];
  loading: boolean;
  onView: (empresa: Empresa) => void;
  onEdit: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
  onDuplicate: (empresa: Empresa) => void;
}

export default function EmpresasTable({ 
  empresas, 
  loading, 
  onView, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: EmpresasTableProps) {
  const getSectorColor = (sector: string) => {
    switch (sector.toLowerCase()) {
      case 'tecnología':
      case 'tech':
        return 'primary';
      case 'fintech':
      case 'finanzas':
        return 'success';
      case 'salud':
      case 'healthcare':
        return 'warning';
      case 'gobierno':
      case 'government':
        return 'secondary';
      case 'educación':
      case 'education':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTamanoColor = (tamano: string) => {
    switch (tamano.toLowerCase()) {
      case 'pequeña':
      case 'small':
        return 'success';
      case 'mediana':
      case 'medium':
        return 'warning';
      case 'grande':
      case 'large':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (empresas.length === 0) {
    return (
      <div className="text-center py-12">
        <BuildingIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <Typography variant="h4" color="secondary" weight="medium">
          No se encontraron empresas
        </Typography>
        <Typography variant="body1" color="secondary">
          Comienza registrando tu primera empresa
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {empresas.map((empresa) => (
        <div 
          key={empresa.id}
          className="border border-border rounded-lg p-6 hover: transition-colors duration-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BuildingIcon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <Typography variant="h4" weight="semibold">
                    {empresa.nombre}
                  </Typography>
                  {empresa.descripcion && (
                    <Typography variant="body2" color="secondary" className="line-clamp-1">
                      {empresa.descripcion}
                    </Typography>
                  )}
                </div>
              </div>
            </div>

            <ActionsMenu
              actions={[
                {
                  label: 'Ver detalles',
                  icon: <EyeIcon className="w-4 h-4" />,
                  onClick: () => onView(empresa)
                },
                {
                  label: 'Editar',
                  icon: <EditIcon className="w-4 h-4" />,
                  onClick: () => onEdit(empresa)
                },
                {
                  label: 'Duplicar',
                  icon: <CopyIcon className="w-4 h-4" />,
                  onClick: () => onDuplicate(empresa)
                },
                {
                  label: 'Eliminar',
                  icon: <TrashIcon className="w-4 h-4" />,
                  onClick: () => onDelete(empresa),
                  variant: 'destructive'
                }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Typography variant="caption" color="secondary">Sector</Typography>
              {empresa.sector ? (
                <Badge variant={getSectorColor(empresa.sector)} size="sm">
                  {empresa.sector}
                </Badge>
              ) : (
                <Typography variant="body2" color="secondary">-</Typography>
              )}
            </div>

            <div>
              <Typography variant="caption" color="secondary">Tamaño</Typography>
              {empresa.tamano ? (
                <Badge variant={getTamanoColor(empresa.tamano)} size="sm">
                  {empresa.tamano}
                </Badge>
              ) : (
                <Typography variant="body2" color="secondary">-</Typography>
              )}
            </div>

            <div>
              <Typography variant="caption" color="secondary">KAM</Typography>
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                <Typography variant="body2" weight="medium">
                  {empresa.kam_nombre || 'Sin asignar'}
                </Typography>
              </div>
            </div>

            <div>
              <Typography variant="caption" color="secondary">Estado</Typography>
              <Badge variant={empresa.activo ? 'success' : 'warning'} size="sm">
                {empresa.activo ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Typography variant="caption" color="secondary">Ubicación</Typography>
              <Typography variant="body2">
                {empresa.pais_nombre || 'Sin especificar'}
              </Typography>
            </div>

            <div>
              <Typography variant="caption" color="secondary">Registro</Typography>
              <Typography variant="body2" color="secondary">
                {formatearFecha(empresa.created_at)}
              </Typography>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
