import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout, Typography, Card, Button, Tabs } from '../../../components/ui';
import { InfoIcon, FileTextIcon, ClipboardListIcon } from '../../../components/icons';

const TestSimplePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [activeTab, setActiveTab] = useState('informacion');
  const [renderCount, setRenderCount] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Contador de renderizados
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log('🔄 RENDERIZADO #', renderCount + 1, 'Timestamp:', new Date().toISOString());
  });

  // Cargar datos una sola vez
  useEffect(() => {
    if (id && !data) {
      console.log('🚀 CARGANDO DATOS - ID:', id);
      setLoading(true);
      
      // Simular carga de datos
      setTimeout(() => {
        setData({
          id: id,
          nombre: 'Test Reclutamiento',
          participantes: [
            { id: 1, nombre: 'Participante 1' },
            { id: 2, nombre: 'Participante 2' },
            { id: 3, nombre: 'Participante 3' }
          ],
          libreto: {
            id: 'lib-1',
            titulo: 'Libreto de Prueba',
            contenido: 'Contenido del libreto'
          }
        });
        setLoading(false);
        console.log('✅ DATOS CARGADOS');
      }, 1000);
    }
  }, [id, data]);

  // Componentes de contenido simples
  const InformacionTab = () => {
    console.log('📄 RENDERIZANDO TAB INFORMACIÓN');
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <Typography variant="h4">Información General</Typography>
          <Typography variant="body1">ID: {id}</Typography>
          <Typography variant="body1">Nombre: {data?.nombre || 'Cargando...'}</Typography>
          <Typography variant="body1">Renderizado #: {renderCount}</Typography>
        </Card>
      </div>
    );
  };

  const LibretoTab = () => {
    console.log('📄 RENDERIZANDO TAB LIBRETO');
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <Typography variant="h4">Libreto</Typography>
          <Typography variant="body1">Título: {data?.libreto?.titulo || 'Cargando...'}</Typography>
          <Typography variant="body1">Contenido: {data?.libreto?.contenido || 'Cargando...'}</Typography>
          <Typography variant="body1">Renderizado #: {renderCount}</Typography>
        </Card>
      </div>
    );
  };

  const ParticipantesTab = () => {
    console.log('📄 RENDERIZANDO TAB PARTICIPANTES');
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <Typography variant="h4">Participantes</Typography>
          {data?.participantes?.map((p: any) => (
            <div key={p.id} className="p-2 border rounded mb-2">
              <Typography variant="body1">{p.nombre}</Typography>
            </div>
          ))}
          <Typography variant="body1">Renderizado #: {renderCount}</Typography>
        </Card>
      </div>
    );
  };

  // Tabs simples
  const tabs = [
    {
      id: 'informacion',
      label: 'Información',
      icon: <InfoIcon className="w-4 h-4" />,
      content: <InformacionTab />
    },
    {
      id: 'libreto',
      label: 'Libreto',
      icon: <FileTextIcon className="w-4 h-4" />,
      content: <LibretoTab />
    },
    {
      id: 'participantes',
      label: 'Participantes',
      icon: <ClipboardListIcon className="w-4 h-4" />,
      content: <ParticipantesTab />
    }
  ];

  if (loading) {
    return (
      <Layout rol="administrador">
        <div className="py-8">
          <Typography variant="h3">Cargando...</Typography>
        </div>
      </Layout>
    );
  }

  return (
    <Layout rol="administrador">
      <div className="py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Typography variant="h2">Test Simple - Reclutamiento</Typography>
            <Typography variant="body1" color="secondary">
              ID: {id} | Renderizados: {renderCount}
            </Typography>
          </div>

          {/* Tabs */}
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="default"
            fullWidth={true}
          />

          {/* Debug Info */}
          <Card className="mt-6 p-4">
            <Typography variant="h5">Debug Info</Typography>
            <Typography variant="body2">Total Renderizados: {renderCount}</Typography>
            <Typography variant="body2">Tab Activo: {activeTab}</Typography>
            <Typography variant="body2">Datos Cargados: {data ? 'Sí' : 'No'}</Typography>
            <Typography variant="body2">Timestamp: {new Date().toISOString()}</Typography>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TestSimplePage;
