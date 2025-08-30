import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Chip, IconButton, DataTable, DolorModal } from './index';
import { DolorParticipanteCompleto, CrearDolorRequest, ActualizarDolorRequest, EstadoDolor } from '../../types/dolores';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ListaDoloresProps {
  participanteId: string;
  participanteNombre: string;
}

export const ListaDolores: React.FC<ListaDoloresProps> = ({
  participanteId,
  participanteNombre
}) => {
  const [dolores, setDolores] = useState<DolorParticipanteCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [dolorEditando, setDolorEditando] = useState<DolorParticipanteCompleto | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarDolores();
  }, [participanteId]);

  const cargarDolores = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/participantes/${participanteId}/dolores`);
      if (response.ok) {
        const data = await response.json();
        setDolores(data);
      } else {
        console.error('Error cargando dolores:', response.statusText);
      }
    } catch (error) {
      console.error('Error cargando dolores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearDolor = () => {
    setDolorEditando(null);
    setModalOpen(true);
  };

  const handleEditarDolor = (dolor: DolorParticipanteCompleto) => {
    setDolorEditando(dolor);
    setModalOpen(true);
  };

  const handleEliminarDolor = async (dolorId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este dolor?')) {
      return;
    }

    try {
      const response = await fetch(`/api/participantes/${participanteId}/dolores?id=${dolorId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await cargarDolores();
      } else {
        console.error('Error eliminando dolor:', response.statusText);
      }
    } catch (error) {
      console.error('Error eliminando dolor:', error);
    }
  };

  const handleSaveDolor = async (dolorData: CrearDolorRequest | ActualizarDolorRequest) => {
    try {
      setSaving(true);
      
      const isEditing = 'id' in dolorData;
      const url = `/api/participantes/${participanteId}/dolores`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dolorData)
      });

      if (response.ok) {
        await cargarDolores();
        setModalOpen(false);
        setDolorEditando(null);
      } else {
        console.error('Error guardando dolor:', response.statusText);
      }
    } catch (error) {
      console.error('Error guardando dolor:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return fecha;
    }
  };

  const getSeveridadChip = (severidad: string) => {
    const variants = {
      baja: 'success' as const,
      media: 'warning' as const,
      alta: 'error' as const,
      critica: 'error' as const
    };
    
    return (
      <Chip variant={variants[severidad as keyof typeof variants] || 'default'} size="sm">
        {severidad.charAt(0).toUpperCase() + severidad.slice(1)}
      </Chip>
    );
  };

  const getEstadoChip = (estado: string) => {
    const variants = {
      activo: 'error' as const,
      resuelto: 'success' as const,
      archivado: 'default' as const
    };
    
    return (
      <Chip variant={variants[estado as keyof typeof variants] || 'default'} size="sm">
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Chip>
    );
  };

  const columns = [
    {
      key: 'categoria',
      label: 'Categoría',
      render: (value: any, row: DolorParticipanteCompleto) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: row.categoria_color }}
          />
          <Typography variant="body2" weight="medium">
            {row.categoria_nombre}
          </Typography>
        </div>
      )
    },
    {
      key: 'titulo',
      label: 'Título',
      render: (value: any, row: DolorParticipanteCompleto) => (
        <div>
          <Typography variant="body2" weight="medium" className="mb-1">
            {row.titulo}
          </Typography>
          {row.descripcion && (
            <Typography variant="caption" color="secondary" className="line-clamp-2">
              {row.descripcion}
            </Typography>
          )}
        </div>
      )
    },
    {
      key: 'severidad',
      label: 'Severidad',
      render: (value: any, row: DolorParticipanteCompleto) => getSeveridadChip(row.severidad)
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value: any, row: DolorParticipanteCompleto) => getEstadoChip(row.estado)
    },
    {
      key: 'fecha_creacion',
      label: 'Fecha',
      render: (value: any, row: DolorParticipanteCompleto) => (
        <Typography variant="body2">
          {formatearFecha(row.fecha_creacion)}
        </Typography>
      )
    }
  ];

  // Definir acciones para el DataTable
  const tableActions = [
    {
      label: 'Editar',
      onClick: (row: DolorParticipanteCompleto) => handleEditarDolor(row),
      title: 'Editar dolor'
    },
    {
      label: 'Eliminar',
      onClick: (row: DolorParticipanteCompleto) => handleEliminarDolor(row.id),
      title: 'Eliminar dolor',
      className: 'text-red-600 hover:text-red-700'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h4" weight="semibold">
            Dolores y Necesidades
          </Typography>
          <Typography variant="body2" color="secondary">
            Registro de dolores y necesidades de {participanteNombre}
          </Typography>
        </div>
        <Button onClick={handleCrearDolor}>
          Crear Dolor
        </Button>
      </div>

      {/* Lista de dolores */}
      {loading ? (
        <Card>
          <div className="p-6 text-center">
            <Typography>Cargando dolores...</Typography>
          </div>
        </Card>
      ) : dolores.length > 0 ? (
        <DataTable
          data={dolores}
          columns={columns}
          loading={false}
          searchable={true}
          filterable={true}
          selectable={false}
          emptyMessage="No se encontraron dolores"
          rowKey="id"
          actions={tableActions}
        />
      ) : (
        <Card>
          <div className="p-6 text-center">
            <Typography variant="body1" className="mb-2">
              No hay dolores registrados
            </Typography>
            <Typography variant="body2" color="secondary" className="mb-4">
              Comienza registrando el primer dolor o necesidad del participante
            </Typography>
            <Button onClick={handleCrearDolor}>
              Crear Primer Dolor
            </Button>
          </div>
        </Card>
      )}

      {/* Modal */}
      <DolorModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setDolorEditando(null);
        }}
        participanteId={participanteId}
        dolor={dolorEditando}
        onSave={handleSaveDolor}
        loading={saving}
      />
    </div>
  );
};
