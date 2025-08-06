import React, { useState } from 'react';
import { Layout, Card, Input, Select, Typography, Button } from '../components/ui';
import { FileTextIcon, SaveIcon } from '../components/icons';

const TestEspaciadoFinal = () => {
  const [formData, setFormData] = useState({
    plataforma_id: '',
    rol_empresa_id: '',
    industria_id: '',
    pais: ''
  });

  const plataformas = [
    { id: '1', nombre: 'Zoom' },
    { id: '2', nombre: 'Google Meet' },
    { id: '3', nombre: 'Microsoft Teams' }
  ];

  const rolesEmpresa = [
    { id: '1', nombre: 'CEO' },
    { id: '2', nombre: 'CTO' },
    { id: '3', nombre: 'Desarrollador' }
  ];

  const industrias = [
    { id: '1', nombre: 'Tecnología' },
    { id: '2', nombre: 'Finanzas' },
    { id: '3', nombre: 'Salud' }
  ];

  const paises = ['Colombia', 'México', 'España', 'Argentina'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout rol="administrador">
      <div className="py-8">
        <Typography variant="h2" className="mb-6">
          Test - Espaciado Final (Antes vs Después)
        </Typography>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda - Espaciado normal */}
          <div>
            <Card className="p-6">
              <Typography variant="h4" className="mb-4 text-red-600">
                ❌ Espaciado Normal (Problema)
              </Typography>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Plataforma (espaciado normal)
                    </label>
                    <select className="w-full px-4 py-2 text-sm min-h-[44px] bg-input-solid border border-border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring">
                      <option>Seleccionar plataforma</option>
                      <option>Zoom</option>
                      <option>Google Meet</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Rol en empresa (espaciado normal)
                    </label>
                    <select className="w-full px-4 py-2 text-sm min-h-[44px] bg-input-solid border border-border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring">
                      <option>Seleccionar rol</option>
                      <option>CEO</option>
                      <option>CTO</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Columna derecha - Espaciado compacto */}
          <div>
            <Card className="p-6 form-compact">
              <Typography variant="h4" className="mb-4 text-green-600">
                ✅ Espaciado Compacto (Solución)
              </Typography>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Select
                    label="Plataforma (espaciado compacto)"
                    placeholder="Seleccionar plataforma"
                    value={formData.plataforma_id}
                    onChange={(value) => handleInputChange('plataforma_id', value.toString())}
                    options={plataformas.map(p => ({
                      value: p.id,
                      label: p.nombre
                    }))}
                    fullWidth
                  />

                  <Select
                    label="Rol en empresa (espaciado compacto)"
                    placeholder="Seleccionar rol"
                    value={formData.rol_empresa_id}
                    onChange={(value) => handleInputChange('rol_empresa_id', value.toString())}
                    options={rolesEmpresa.map(r => ({
                      value: r.id,
                      label: r.nombre
                    }))}
                    fullWidth
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Ejemplo completo con form-compact */}
        <Card className="p-6 mt-8 form-compact">
          <div className="flex items-center gap-2 mb-6">
            <FileTextIcon className="w-5 h-5 text-primary" />
            <Typography variant="h4">Formulario Completo con Espaciado Compacto</Typography>
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
              <Select
                label="Plataforma"
                placeholder="Seleccionar plataforma"
                value={formData.plataforma_id}
                onChange={(value) => handleInputChange('plataforma_id', value.toString())}
                options={plataformas.map(p => ({
                  value: p.id,
                  label: p.nombre
                }))}
                fullWidth
              />

              <Select
                label="Industria"
                placeholder="Seleccionar industria"
                value={formData.industria_id}
                onChange={(value) => handleInputChange('industria_id', value.toString())}
                options={industrias.map(i => ({
                  value: i.id,
                  label: i.nombre
                }))}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="País"
                placeholder="Seleccionar país"
                value={formData.pais}
                onChange={(value) => handleInputChange('pais', value.toString())}
                options={paises.map(p => ({
                  value: p,
                  label: p
                }))}
                fullWidth
              />

              <Input
                label="Número de participantes"
                type="number"
                placeholder="5"
                value=""
                onChange={() => {}}
                fullWidth
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <Button variant="primary" className="w-full md:w-auto">
              <SaveIcon className="w-4 h-4 mr-2" />
              Guardar Libreto
            </Button>
          </div>
        </Card>

        {/* Información técnica */}
        <Card className="p-6 mt-6 bg-accent/10">
          <Typography variant="h4" className="mb-3">Cambios Técnicos Implementados</Typography>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Componente Select:</strong> <code className="bg-accent px-1 rounded">mb-0.5</code> en lugar de <code className="bg-accent px-1 rounded">mb-1</code></p>
            <p>• <strong>Componente Input:</strong> <code className="bg-accent px-1 rounded">mb-0.5</code> en lugar de <code className="bg-accent px-1 rounded">mb-1</code></p>
            <p>• <strong>Clase CSS:</strong> <code className="bg-accent px-1 rounded">.form-compact</code> para reducir espaciado entre campos</p>
            <p>• <strong>Helper text:</strong> <code className="bg-accent px-1 rounded">mt-0.5</code> en lugar de <code className="bg-accent px-1 rounded">mt-1</code></p>
            <p>• <strong>Grid gap:</strong> Reducido a <code className="bg-accent px-1 rounded">0.75rem</code> en formularios compactos</p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default TestEspaciadoFinal; 