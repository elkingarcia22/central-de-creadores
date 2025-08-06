import React, { useState } from 'react';
import { Layout, Card, Input, Select, Typography, Button } from '../components/ui';
import { FileTextIcon, SaveIcon } from '../components/icons';

const TestEspaciadoMejorado = () => {
  const [formData, setFormData] = useState({
    nombre_sesion: '',
    duracion_estimada: '',
    numero_participantes: '',
    plataforma_id: '',
    rol_empresa_id: '',
    industria_id: '',
    pais: '',
    tamano_empresa_id: ''
  });

  const plataformas = [
    { id: '1', nombre: 'Zoom' },
    { id: '2', nombre: 'Google Meet' },
    { id: '3', nombre: 'Microsoft Teams' },
    { id: '4', nombre: 'Skype' },
    { id: '5', nombre: 'Discord' }
  ];

  const rolesEmpresa = [
    { id: '1', nombre: 'CEO' },
    { id: '2', nombre: 'CTO' },
    { id: '3', nombre: 'Desarrollador' },
    { id: '4', nombre: 'Diseñador UX/UI' },
    { id: '5', nombre: 'Product Manager' },
    { id: '6', nombre: 'QA Tester' }
  ];

  const industrias = [
    { id: '1', nombre: 'Tecnología' },
    { id: '2', nombre: 'Finanzas' },
    { id: '3', nombre: 'Salud' },
    { id: '4', nombre: 'Educación' },
    { id: '5', nombre: 'E-commerce' }
  ];

  const paises = ['Colombia', 'México', 'España', 'Argentina', 'Chile', 'Perú', 'Ecuador', 'Venezuela'];

  const tamanosEmpresa = [
    { id: '1', nombre: 'Pequeña (1-50 empleados)' },
    { id: '2', nombre: 'Mediana (51-200 empleados)' },
    { id: '3', nombre: 'Grande (201-1000 empleados)' },
    { id: '4', nombre: 'Empresa (1000+ empleados)' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout rol="administrador">
      <div className="py-8">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="h2">
            Test - Espaciado Mejorado en Formularios
          </Typography>
          <Button variant="primary">
            <SaveIcon className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>

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
                value={formData.nombre_sesion}
                onChange={(e) => handleInputChange('nombre_sesion', e.target.value)}
                fullWidth
              />
              
              <Input
                label="Duración estimada (minutos)"
                type="number"
                placeholder="60"
                value={formData.duracion_estimada}
                onChange={(e) => handleInputChange('duracion_estimada', e.target.value)}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número de participantes"
                type="number"
                placeholder="5"
                value={formData.numero_participantes}
                onChange={(e) => handleInputChange('numero_participantes', e.target.value)}
                fullWidth
              />

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
                value={formData.rol_empresa_id}
                onChange={(value) => handleInputChange('rol_empresa_id', value.toString())}
                options={rolesEmpresa.map(r => ({
                  value: r.id,
                  label: r.nombre
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

              <Select
                label="Tamaño de empresa"
                placeholder="Seleccionar tamaño"
                value={formData.tamano_empresa_id}
                onChange={(value) => handleInputChange('tamano_empresa_id', value.toString())}
                options={tamanosEmpresa.map(t => ({
                  value: t.id,
                  label: t.nombre
                }))}
                fullWidth
              />
            </div>
          </div>
        </Card>

        {/* Comparación visual */}
        <Card className="p-6 mt-6">
          <Typography variant="h4" className="mb-4">Comparación Visual</Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Typography variant="h6" className="mb-3 text-muted-foreground">Input de Texto</Typography>
              <Input
                label="Campo de texto"
                placeholder="Escribe aquí"
                value=""
                onChange={() => {}}
                fullWidth
              />
            </div>

            <div>
              <Typography variant="h6" className="mb-3 text-muted-foreground">Lista Desplegable</Typography>
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

            <div>
              <Typography variant="h6" className="mb-3 text-muted-foreground">Input Numérico</Typography>
              <Input
                label="Campo numérico"
                type="number"
                placeholder="123"
                value=""
                onChange={() => {}}
                fullWidth
              />
            </div>
          </div>
        </Card>

        {/* Información sobre los cambios */}
        <Card className="p-6 mt-6 bg-accent/10">
          <Typography variant="h4" className="mb-3">Cambios Realizados</Typography>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Eliminado <code className="bg-accent px-1 rounded">space-y-1</code> del contenedor principal</p>
            <p>• Agregado <code className="bg-accent px-1 rounded">mb-1</code> directamente al label</p>
            <p>• Cambiado spacing del helper text a <code className="bg-accent px-1 rounded">mt-1</code></p>
            <p>• Aplicado tanto a Input como Select para mantener consistencia</p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default TestEspaciadoMejorado; 