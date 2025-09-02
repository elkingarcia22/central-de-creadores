// =====================================================
// TAB DE PERFILAMIENTOS DE PARTICIPANTES
// =====================================================

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';
import Chip from '../ui/Chip';
import { EmptyState } from '../ui/EmptyState';
import DataTable from '../ui/DataTable';
import {
  MessageIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  UserIcon,
  InfoIcon
} from '../icons';
import { SeleccionarCategoriaPerfilamientoModal } from './SeleccionarCategoriaPerfilamientoModal';
import { CrearPerfilamientoModal } from './CrearPerfilamientoModal';
import { PerfilamientosService } from '../../api/supabase-perfilamientos';
import { 
  PerfilamientoParticipante, 
  CategoriaPerfilamiento,
  obtenerNombreCategoria,
  obtenerColorCategoria
} from '../../types/perfilamientos';

interface PerfilamientosTabProps {
  participanteId: string;
  participanteNombre: string;
}

export const PerfilamientosTab: React.FC<PerfilamientosTabProps> = ({
  participanteId,
  participanteNombre
}) => {
  const [perfilamientos, setPerfilamientos] = useState<PerfilamientoParticipante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaPerfilamiento | null>(null);
  
  // Estados para modales
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaPerfilamiento | null>(null);

  // Definir columnas para la tabla
  const columns = [
    {
      key: 'categoria_perfilamiento',
      label: 'Categoría',
      sortable: true,
      render: (value: any, row: PerfilamientoParticipante) => (
        <Chip 
          variant="outline" 
          size="sm"
          className={`border-${obtenerColorCategoria(row.categoria_perfilamiento)}-200 text-${obtenerColorCategoria(row.categoria_perfilamiento)}-700`}
        >
          {obtenerNombreCategoria(row.categoria_perfilamiento)}
        </Chip>
      )
    },
    {
      key: 'valor_principal',
      label: 'Valor Principal',
      sortable: true,
      render: (value: any, row: PerfilamientoParticipante) => (
        <Typography variant="body2" weight="semibold">
          {row.valor_principal}
        </Typography>
      )
    },
    {
      key: 'observaciones',
      label: 'Observaciones',
      render: (value: any, row: PerfilamientoParticipante) => (
        <Typography variant="body2" className="max-w-xs truncate">
          {row.observaciones || '-'}
        </Typography>
      )
    },
    {
      key: 'etiquetas',
      label: 'Etiquetas',
      render: (value: any, row: PerfilamientoParticipante) => (
        <div className="flex flex-wrap gap-1">
          {row.etiquetas && row.etiquetas.length > 0 ? (
            row.etiquetas.map((etiqueta, index) => (
              <Chip key={index} variant="outline" size="sm" className="text-xs">
                {etiqueta.replace('_', ' ')}
              </Chip>
            ))
          ) : (
            <Typography variant="caption" color="secondary">-</Typography>
          )}
        </div>
      )
    },
    {
      key: 'confianza_observacion',
      label: 'Confianza',
      sortable: true,
      render: (value: any, row: PerfilamientoParticipante) => {
        const getColorConfianza = (confianza: number) => {
          if (confianza >= 4) return 'success';
          if (confianza >= 3) return 'warning';
          return 'destructive';
        };
        
        const getTextoConfianza = (confianza: number) => {
          if (confianza === 5) return 'Muy alta';
          if (confianza === 4) return 'Alta';
          if (confianza === 3) return 'Media';
          if (confianza === 2) return 'Baja';
          return 'Muy baja';
        };

        return (
          <Chip variant={getColorConfianza(row.confianza_observacion) as any} size="sm">
            {getTextoConfianza(row.confianza_observacion)}
          </Chip>
        );
      }
    },
    {
      key: 'usuario_perfilador_nombre',
      label: 'Perfilado por',
      render: (value: any, row: PerfilamientoParticipante) => (
        <Typography variant="body2" color="secondary">
          {row.usuario_perfilador_nombre || '-'}
        </Typography>
      )
    },
    {
      key: 'fecha_perfilamiento',
      label: 'Fecha',
      sortable: true,
      render: (value: any, row: PerfilamientoParticipante) => (
        <Typography variant="caption">
          {formatearFecha(row.fecha_perfilamiento)}
        </Typography>
      )
    }
  ];

  // Cargar perfilamientos
  const cargarPerfilamientos = async () => {
    setLoading(true);
    try {
      const { data, error } = await PerfilamientosService.obtenerPerfilamientosPorParticipante(participanteId);
      
      if (error) {
        console.error('Error cargando perfilamientos:', error);
        return;
      }
      
      setPerfilamientos(data || []);
    } catch (error) {
      console.error('Error inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPerfilamientos();
  }, [participanteId]);

  // Filtrar perfilamientos
  const perfilamientosFiltrados = perfilamientos.filter(perfilamiento => {
    const matchesSearch = searchTerm === '' || 
      perfilamiento.valor_principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perfilamiento.observaciones?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perfilamiento.contexto_interaccion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = !selectedCategoria || perfilamiento.categoria_perfilamiento === selectedCategoria;
    
    return matchesSearch && matchesCategoria;
  });

  // Manejar selección de categoría
  const handleCategoriaSeleccionada = (categoria: CategoriaPerfilamiento) => {
    setCategoriaSeleccionada(categoria);
    setShowCrearModal(true);
  };

  // Manejar éxito en creación
  const handlePerfilamientoCreado = () => {
    cargarPerfilamientos();
  };

  // Definir acciones para la tabla
  const actions = [
    {
      label: 'Editar',
      icon: <MessageIcon className="w-4 h-4" />,
      onClick: (perfilamiento: PerfilamientoParticipante) => {
        // TODO: Implementar edición
        console.log('Editar perfilamiento:', perfilamiento);
      },
      title: 'Editar perfilamiento'
    },
    {
      label: 'Eliminar',
      icon: <MessageIcon className="w-4 h-4" />,
      onClick: (perfilamiento: PerfilamientoParticipante) => {
        // TODO: Implementar eliminación
        console.log('Eliminar perfilamiento:', perfilamiento);
      },
      className: 'text-red-600 hover:text-red-700',
      title: 'Eliminar perfilamiento'
    }
  ];

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color de confianza
  const getColorConfianza = (confianza: number) => {
    if (confianza >= 4) return 'success';
    if (confianza >= 3) return 'warning';
    return 'destructive';
  };

  // Obtener texto de confianza
  const getTextoConfianza = (confianza: number) => {
    if (confianza === 5) return 'Muy alta';
    if (confianza === 4) return 'Alta';
    if (confianza === 3) return 'Media';
    if (confianza === 2) return 'Baja';
    return 'Muy baja';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <InfoIcon className="w-5 h-5 text-gray-500" />
            <Typography variant="h3" weight="semibold">
              Perfilamiento del Participante
            </Typography>
          </div>
          <Chip variant="outline" size="sm">
            {perfilamientos.length} perfilamiento{perfilamientos.length !== 1 ? 's' : ''}
          </Chip>
        </div>
        
        <Button
          variant="primary"
          onClick={() => setShowCategoriaModal(true)}
          icon={<PlusIcon className="w-4 h-4" />}
        >
          Crear Perfilamiento
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar en perfilamientos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<SearchIcon className="w-4 h-4" />}
            fullWidth
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedCategoria ? "primary" : "outline"}
            onClick={() => setSelectedCategoria(null)}
            size="sm"
          >
            Todas
          </Button>
          {(['comunicacion', 'decisiones', 'proveedores', 'cultura', 'comportamiento', 'motivaciones'] as CategoriaPerfilamiento[]).map((categoria) => (
            <Button
              key={categoria}
              variant={selectedCategoria === categoria ? "primary" : "outline"}
              onClick={() => setSelectedCategoria(categoria)}
              size="sm"
            >
              {obtenerNombreCategoria(categoria).split(' ')[0]}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de perfilamientos */}
      {loading ? (
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <Typography variant="body2" className="mt-2 text-muted-foreground">
              Cargando perfilamientos...
            </Typography>
          </div>
        </Card>
      ) : perfilamientosFiltrados.length === 0 ? (
        <EmptyState
          icon={<InfoIcon className="w-12 h-12 text-gray-400" />}
          title="No hay perfilamientos"
          description={
            searchTerm || selectedCategoria
              ? "No se encontraron perfilamientos con los filtros aplicados."
              : "Este participante no tiene perfilamientos registrados. Comienza creando el primero."
          }
          actionText="Crear Primer Perfilamiento"
          onAction={() => setShowCategoriaModal(true)}
        />
      ) : (
        <DataTable
          data={perfilamientosFiltrados}
          columns={columns}
          loading={false}
          searchable={false}
          filterable={false}
          selectable={false}
          actions={actions}
          emptyMessage="No se encontraron perfilamientos que coincidan con los criterios de búsqueda"
          rowKey="id"
        />
      )}

      {/* Modal de selección de categoría */}
      <SeleccionarCategoriaPerfilamientoModal
        isOpen={showCategoriaModal}
        onClose={() => setShowCategoriaModal(false)}
        participanteId={participanteId}
        participanteNombre={participanteNombre}
        onCategoriaSeleccionada={handleCategoriaSeleccionada}
      />

      {/* Modal de crear perfilamiento */}
      {categoriaSeleccionada && (
        <CrearPerfilamientoModal
          isOpen={showCrearModal}
          onClose={() => {
            setShowCrearModal(false);
            setCategoriaSeleccionada(null);
          }}
          participanteId={participanteId}
          participanteNombre={participanteNombre}
          categoria={categoriaSeleccionada}
          onSuccess={handlePerfilamientoCreado}
        />
      )}
    </div>
  );
};
