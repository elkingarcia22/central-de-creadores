// =====================================================
// TAB DE PERFILAMIENTOS DE PARTICIPANTES
// =====================================================

import React, { useState, useEffect, useCallback } from 'react';
import Card from '../ui/Card';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';
import Chip from '../ui/Chip';
import { EmptyState } from '../ui/EmptyState';
import DataTable from '../ui/DataTable';
import { Subtitle } from '../ui/Subtitle';
import Tabs from '../ui/Tabs';
import {
  MessageIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  UserIcon,
  InfoIcon,
  EditIcon,
  TrashIcon
} from '../icons';
import { SeleccionarCategoriaPerfilamientoModal } from './SeleccionarCategoriaPerfilamientoModal';
import { CrearPerfilamientoModal } from './CrearPerfilamientoModal';
import { PerfilamientosService } from '../../api/supabase-perfilamientos';
import ConfirmModal from '../ui/ConfirmModal';
import { useToast } from '../../contexts/ToastContext';
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
  const { showSuccess, showError } = useToast();
  const [perfilamientos, setPerfilamientos] = useState<PerfilamientoParticipante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaPerfilamiento | null>(null);
  const [activeTab, setActiveTab] = useState<string>('todas');
  
  // Estados para modales
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaPerfilamiento | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  // Estados para edición y eliminación
  const [perfilamientoParaEditar, setPerfilamientoParaEditar] = useState<PerfilamientoParticipante | null>(null);
  const [perfilamientoParaEliminar, setPerfilamientoParaEliminar] = useState<PerfilamientoParticipante | null>(null);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  
  // Estados para filtros adicionales
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filters, setFilters] = useState({
    confianza: 'todos',
    fechaDesde: '',
    fechaHasta: '',
    usuarioPerfilador: ''
  });

  // Definir columnas para la tabla
  const columns = [
    {
      key: 'categoria_perfilamiento',
      label: 'Categoría',
      sortable: true,
      render: (value: any, row: PerfilamientoParticipante) => (
        <Typography variant="body2" weight="medium">
          {obtenerNombreCategoria(row.categoria_perfilamiento)}
        </Typography>
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
              <Chip key={index} variant="default" size="sm" outlined={true}>
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
          return 'danger';
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

  // Callbacks para manejar el estado del buscador
  const handleExpandSearch = useCallback(() => {
    setIsSearchExpanded(true);
  }, []);

  const handleCollapseSearch = useCallback(() => {
    setIsSearchExpanded(false);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Contar filtros activos
  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.confianza !== 'todos') count++;
    if (filters.fechaDesde) count++;
    if (filters.fechaHasta) count++;
    if (filters.usuarioPerfilador) count++;
    return count;
  }, [filters]);

  // Definir tabs por categorías
  const tabs = [
    {
      value: 'todas',
      label: 'Todas',
      count: perfilamientos.length
    },
    {
      value: 'comunicacion',
      label: 'Estilo',
      count: perfilamientos.filter(p => p.categoria_perfilamiento === 'comunicacion').length
    },
    {
      value: 'decisiones',
      label: 'Toma',
      count: perfilamientos.filter(p => p.categoria_perfilamiento === 'decisiones').length
    },
    {
      value: 'proveedores',
      label: 'Relación',
      count: perfilamientos.filter(p => p.categoria_perfilamiento === 'proveedores').length
    },
    {
      value: 'cultura',
      label: 'Cultura',
      count: perfilamientos.filter(p => p.categoria_perfilamiento === 'cultura').length
    },
    {
      value: 'comportamiento',
      label: 'Comportamiento',
      count: perfilamientos.filter(p => p.categoria_perfilamiento === 'comportamiento').length
    },
    {
      value: 'motivaciones',
      label: 'Motivaciones',
      count: perfilamientos.filter(p => p.categoria_perfilamiento === 'motivaciones').length
    }
  ];

  // Filtrar perfilamientos
  const perfilamientosFiltrados = perfilamientos.filter(perfilamiento => {
    // Filtro de búsqueda
    const matchesSearch = searchTerm === '' || 
      perfilamiento.valor_principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perfilamiento.observaciones?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perfilamiento.contexto_interaccion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por tab activo (categoría)
    const matchesTab = activeTab === 'todas' || perfilamiento.categoria_perfilamiento === activeTab;
    
    // Filtro por confianza
    const matchesConfianza = filters.confianza === 'todos' || 
      perfilamiento.confianza_observacion.toString() === filters.confianza;
    
    // Filtro por fecha desde
    const matchesFechaDesde = !filters.fechaDesde || 
      new Date(perfilamiento.fecha_perfilamiento) >= new Date(filters.fechaDesde);
    
    // Filtro por fecha hasta
    const matchesFechaHasta = !filters.fechaHasta || 
      new Date(perfilamiento.fecha_perfilamiento) <= new Date(filters.fechaHasta);
    
    // Filtro por usuario perfilador
    const matchesUsuario = !filters.usuarioPerfilador || 
      perfilamiento.usuario_perfilador_nombre?.toLowerCase().includes(filters.usuarioPerfilador.toLowerCase());
    
    return matchesSearch && matchesTab && matchesConfianza && matchesFechaDesde && matchesFechaHasta && matchesUsuario;
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

  // Manejar edición
  const handleEditarPerfilamiento = (perfilamiento: PerfilamientoParticipante) => {
    setPerfilamientoParaEditar(perfilamiento);
    setShowModalEditar(true);
  };

  // Manejar eliminación
  const handleEliminarPerfilamiento = (perfilamiento: PerfilamientoParticipante) => {
    setPerfilamientoParaEliminar(perfilamiento);
    setShowModalEliminar(true);
  };

  // Confirmar eliminación
  const confirmarEliminacion = async () => {
    if (!perfilamientoParaEliminar) return;

    setEliminando(true);
    try {
      const { error } = await PerfilamientosService.eliminarPerfilamiento(perfilamientoParaEliminar.id);
      
      if (error) {
        console.error('Error eliminando perfilamiento:', error);
        showError('Error al eliminar el perfilamiento', error);
        return;
      }
      
      // Recargar la lista
      await cargarPerfilamientos();
      showSuccess('Perfilamiento eliminado exitosamente');
    } catch (error) {
      console.error('Error inesperado:', error);
      showError('Error inesperado al eliminar el perfilamiento');
    } finally {
      setEliminando(false);
      setPerfilamientoParaEliminar(null);
      setShowModalEliminar(false);
    }
  };

  // Manejar éxito en edición
  const handlePerfilamientoEditado = () => {
    cargarPerfilamientos();
    setShowModalEditar(false);
    setPerfilamientoParaEditar(null);
  };

  // Definir acciones para la tabla
  const actions = [
    {
      label: 'Editar',
      icon: <EditIcon className="w-4 h-4" />,
      onClick: (perfilamiento: PerfilamientoParticipante) => handleEditarPerfilamiento(perfilamiento),
      title: 'Editar perfilamiento'
    },
    {
      label: 'Eliminar',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: (perfilamiento: PerfilamientoParticipante) => handleEliminarPerfilamiento(perfilamiento),
      className: 'text-red-600 hover:text-red-700',
      title: 'Eliminar perfilamiento'
    }
  ];

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
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
    <Card variant="elevated" padding="lg" className="space-y-6">
      {/* Header del contenedor con iconos integrados */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Subtitle>
            Perfilamiento del Participante
          </Subtitle>
          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
            {perfilamientosFiltrados.length} de {perfilamientos.length}
          </span>
        </div>
        
        {/* Iconos de búsqueda y filtro en la misma línea */}
        <div className="flex items-center gap-2">
          {/* Icono de búsqueda que se expande */}
          <div className="relative">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar en perfilamientos..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="!w-[700px] pl-10 pr-10 py-2"
                  icon={<SearchIcon className="w-5 h-5 text-gray-400" />}
                  iconPosition="left"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCollapseSearch}
                  className="text-gray-500 hover:text-gray-700 border-0"
                >
                  ✕
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={handleExpandSearch}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full border-0"
                iconOnly
                icon={<SearchIcon className="w-5 h-4" />}
              />
            )}
          </div>
          
          {/* Icono de filtro */}
          <Button
            variant={getActiveFiltersCount() > 0 ? "primary" : "ghost"}
            onClick={() => setShowFilterDrawer(true)}
            className="relative p-2 border-0"
            iconOnly
            icon={<FilterIcon />}
          >
            {getActiveFiltersCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-primary text-xs font-medium px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>


        </div>
      </div>

      {/* Tabs por categorías */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        items={tabs}
        className="w-full"
      />

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
            searchTerm || activeTab !== 'todas'
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

      {/* Modal de editar perfilamiento */}
      {perfilamientoParaEditar && (
        <CrearPerfilamientoModal
          isOpen={showModalEditar}
          onClose={() => {
            setShowModalEditar(false);
            setPerfilamientoParaEditar(null);
          }}
          participanteId={participanteId}
          participanteNombre={participanteNombre}
          categoria={perfilamientoParaEditar.categoria_perfilamiento}
          perfilamientoExistente={perfilamientoParaEditar}
          onSuccess={handlePerfilamientoEditado}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showModalEliminar}
        onClose={() => {
          setShowModalEliminar(false);
          setPerfilamientoParaEliminar(null);
        }}
        onConfirm={confirmarEliminacion}
        title="Eliminar Perfilamiento"
        message={`¿Estás seguro de que quieres eliminar el perfilamiento "${perfilamientoParaEliminar?.valor_principal}"? Esta acción no se puede deshacer.`}
        type="error"
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={eliminando}
        size="md"
      />

      {/* Drawer de filtros */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilterDrawer(false)} />
          <div className="relative bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <Typography variant="h5" weight="semibold">Filtros Avanzados</Typography>
              <Button variant="ghost" size="sm" onClick={() => setShowFilterDrawer(false)}>
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Filtro por confianza */}
              <div>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Nivel de Confianza
                </Typography>
                <select
                  value={filters.confianza}
                  onChange={(e) => setFilters(prev => ({ ...prev, confianza: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="todos">Todos los niveles</option>
                  <option value="1">Muy baja</option>
                  <option value="2">Baja</option>
                  <option value="3">Media</option>
                  <option value="4">Alta</option>
                  <option value="5">Muy alta</option>
                </select>
              </div>

              {/* Filtro por fecha desde */}
              <div>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Fecha Desde
                </Typography>
                <input
                  type="date"
                  value={filters.fechaDesde}
                  onChange={(e) => setFilters(prev => ({ ...prev, fechaDesde: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Filtro por fecha hasta */}
              <div>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Fecha Hasta
                </Typography>
                <input
                  type="date"
                  value={filters.fechaHasta}
                  onChange={(e) => setFilters(prev => ({ ...prev, fechaHasta: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Filtro por usuario perfilador */}
              <div>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Usuario Perfilador
                </Typography>
                <input
                  type="text"
                  placeholder="Buscar por usuario..."
                  value={filters.usuarioPerfilador}
                  onChange={(e) => setFilters(prev => ({ ...prev, usuarioPerfilador: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setFilters({
                    confianza: 'todos',
                    fechaDesde: '',
                    fechaHasta: '',
                    usuarioPerfilador: ''
                  });
                }}
                className="flex-1"
              >
                Limpiar Filtros
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowFilterDrawer(false)}
                className="flex-1"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
