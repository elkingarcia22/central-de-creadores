import React from 'react';
import { Layout, Card, Input, Select, Typography } from '../components/ui';
import { FileTextIcon } from '../components/icons';

const TestLibretoEspaciado = () => {
  const plataformas = [
    { id: '1', nombre: 'Zoom' },
    { id: '2', nombre: 'Google Meet' },
    { id: '3', nombre: 'Microsoft Teams' }
  ];

  const paises = ['Colombia', 'México', 'España', 'Argentina'];

  return (
    <Layout rol="administrador">
      <div className="py-8">
        <Typography variant="h2" className="mb-6">
          Test - Espaciado en Formulario de Libreto
        </Typography>

        {/* Configuración de la sesión */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <FileTextIcon className="w-5 h-5 text-primary" />
            <Typography variant="h4">Configuración de la Sesión</Typography>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre de la sesión"
                placeholder="Ej: Evaluación de usabilidad"
                value=""
                onChange={() => {}}
                fullWidth
              />
              
              <Input
                label="Duración estimada (minutos)"
                type="number"
                placeholder="60"
                value=""
                onChange={() => {}}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número de participantes"
                type="number"
                placeholder="5"
                value=""
                onChange={() => {}}
                fullWidth
              />

              <Select
                label="Plataforma"
                placeholder="Seleccionar plataforma"
                value=""
                onChange={() => {}}
                options={plataformas.map(p => ({
                  value: p.id,
                  label: p.nombre
                }))}
                fullWidth
              />
            </div>
          </div>
        </Card>

        {/* Perfil de participantes */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileTextIcon className="w-5 h-5 text-primary" />
            <Typography variant="h4">Perfil de Participantes</Typography>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Rol en empresa"
                placeholder="Seleccionar rol"
                value=""
                onChange={() => {}}
                options={[
                  { value: '1', label: 'CEO' },
                  { value: '2', label: 'CTO' },
                  { value: '3', label: 'Desarrollador' }
                ]}
                fullWidth
              />

              <Select
                label="Industria"
                placeholder="Seleccionar industria"
                value=""
                onChange={() => {}}
                options={[
                  { value: '1', label: 'Tecnología' },
                  { value: '2', label: 'Finanzas' },
                  { value: '3', label: 'Salud' }
                ]}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="País"
                placeholder="Seleccionar país"
                value=""
                onChange={() => {}}
                options={paises.map(p => ({
                  value: p,
                  label: p
                }))}
                fullWidth
              />

              <Select
                label="Tamaño de empresa"
                placeholder="Seleccionar tamaño"
                value=""
                onChange={() => {}}
                options={[
                  { value: '1', label: 'Pequeña (1-50)' },
                  { value: '2', label: 'Mediana (51-200)' },
                  { value: '3', label: 'Grande (200+)' }
                ]}
                fullWidth
              />
            </div>
          </div>
        </Card>

        {/* Comparación con Input normal */}
        <Card className="p-6 mt-6">
          <Typography variant="h4" className="mb-4">Comparación Input vs Select</Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Typography variant="h6" className="mb-2">Input Normal</Typography>
              <Input
                label="Campo de texto"
                placeholder="Escribe aquí"
                value=""
                onChange={() => {}}
                fullWidth
              />
            </div>

            <div>
              <Typography variant="h6" className="mb-2">Select Dropdown</Typography>
              <Select
                label="Lista desplegable"
                placeholder="Selecciona una opción"
                value=""
                onChange={() => {}}
                options={[
                  { value: '1', label: 'Opción 1' },
                  { value: '2', label: 'Opción 2' },
                  { value: '3', label: 'Opción 3' }
                ]}
                fullWidth
              />
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default TestLibretoEspaciado; 