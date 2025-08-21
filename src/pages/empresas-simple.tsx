import React, { useState, useEffect } from 'react';
import { Layout } from '../components/ui';
import Typography from '../components/ui/Typography';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import { PlusIcon } from '../components/icons';

interface Empresa {
  id: string;
  nombre: string;
  descripcion?: string;
  kam_id?: string;
  kam_nombre?: string;
  kam_email?: string;
  pais_id?: string;
  pais_nombre?: string;
  industria_id?: string;
  industria_nombre?: string;
  estado_id?: string;
  estado_nombre?: string;
  tamano_id?: string;
  tamano_nombre?: string;
  modalidad_id?: string;
  modalidad_nombre?: string;
  relacion_id?: string;
  relacion_nombre?: string;
  producto_id?: string;
  producto_nombre?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export default function EmpresasSimplePage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useEffect ejecutándose');
    cargarEmpresas();
  }, []);

  const cargarEmpresas = async () => {
    try {
      console.log('🚀 Cargando empresas...');
      setLoading(true);
      
      const response = await fetch('/api/empresas');
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Datos recibidos:', data);
        console.log('📊 Número de empresas:', data?.length || 0);
        setEmpresas(data || []);
      } else {
        const errorData = await response.json();
        console.error('❌ Error cargando empresas:', response.status, errorData);
        setError('Error al cargar empresas');
      }
    } catch (error) {
      console.error('❌ Error cargando empresas:', error);
      setError('Error al cargar empresas');
    } finally {
      setLoading(false);
      console.log('🏁 Carga completada');
    }
  };

  const columns = [
    {
      key: 'nombre',
      label: 'Empresa',
      sortable: true,
      width: 'w-80',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.nombre || 'Sin nombre'}
            </div>
            <div className="text-sm text-gray-500">
              {row.descripcion || 'Sin descripción'}
            </div>
          </div>
        );
      }
    },
    {
      key: 'kam',
      label: 'KAM',
      sortable: false,
      width: 'w-64',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm">
            {row.kam_nombre || 'Sin asignar'}
          </div>
        );
      }
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      width: 'min-w-[120px]',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm">
            {row.estado_nombre || 'Sin estado'}
          </div>
        );
      }
    },
    {
      key: 'pais',
      label: 'País',
      sortable: false,
      width: 'min-w-[140px]',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm">
            {row.pais_nombre || 'Sin país'}
          </div>
        );
      }
    },
    {
      key: 'industria',
      label: 'Industria',
      sortable: false,
      width: 'min-w-[140px]',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm">
            {row.industria_nombre || 'Sin industria'}
          </div>
        );
      }
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h2" weight="bold">
              Empresas (Versión Simple)
            </Typography>
            <Typography variant="body1" color="secondary">
              Gestiona las empresas de tu portafolio
            </Typography>
          </div>
          
          <Button
            variant="primary"
            onClick={() => console.log('Crear empresa')}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Crear Empresa
          </Button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold">
                  {empresas.length}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Total Empresas
                </Typography>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabla de empresas */}
        <DataTable
          data={empresas}
          columns={columns}
          loading={loading}
          searchable={false}
          filterable={false}
          selectable={false}
          emptyMessage="No se encontraron empresas"
          loadingMessage="Cargando empresas..."
          rowKey="id"
        />

        {/* Debug info */}
        <Card variant="elevated" padding="md">
          <Typography variant="h4" weight="semibold" className="mb-4">
            Información de Debug
          </Typography>
          <div className="space-y-2">
            <div>
              <strong>Loading:</strong> {loading ? 'true' : 'false'}
            </div>
            <div>
              <strong>Error:</strong> {error || 'null'}
            </div>
            <div>
              <strong>Empresas cargadas:</strong> {empresas.length}
            </div>
            <div>
              <strong>Primera empresa:</strong> {empresas[0]?.nombre || 'N/A'}
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
