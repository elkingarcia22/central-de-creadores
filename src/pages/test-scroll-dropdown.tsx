import React, { useState } from 'react';
import { Layout, Card, Select, Typography, Button } from '../components/ui';
import { FileTextIcon } from '../components/icons';

const TestScrollDropdown = () => {
  const [formData, setFormData] = useState({
    plataforma1: '',
    plataforma2: '',
    plataforma3: '',
    industria1: '',
    industria2: '',
    industria3: '',
    pais1: '',
    pais2: '',
    pais3: ''
  });

  const plataformas = [
    { id: '1', nombre: 'Zoom' },
    { id: '2', nombre: 'Google Meet' },
    { id: '3', nombre: 'Microsoft Teams' },
    { id: '4', nombre: 'Skype' },
    { id: '5', nombre: 'Discord' },
    { id: '6', nombre: 'Webex' },
    { id: '7', nombre: 'GoToMeeting' },
    { id: '8', nombre: 'Jitsi Meet' },
    { id: '9', nombre: 'BigBlueButton' },
    { id: '10', nombre: 'Adobe Connect' }
  ];

  const industrias = [
    { id: '1', nombre: 'Tecnología' },
    { id: '2', nombre: 'Finanzas' },
    { id: '3', nombre: 'Salud' },
    { id: '4', nombre: 'Educación' },
    { id: '5', nombre: 'E-commerce' },
    { id: '6', nombre: 'Marketing' },
    { id: '7', nombre: 'Consultoría' },
    { id: '8', nombre: 'Manufactura' },
    { id: '9', nombre: 'Entretenimiento' },
    { id: '10', nombre: 'Logística' }
  ];

  const paises = [
    'Colombia', 'México', 'España', 'Argentina', 'Chile', 'Perú', 
    'Ecuador', 'Venezuela', 'Uruguay', 'Paraguay', 'Bolivia', 
    'Estados Unidos', 'Canadá', 'Brasil', 'Francia', 'Alemania'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout rol="administrador">
      <div className="py-8">
        <Typography variant="h2" className="mb-6">
          Test - Posicionamiento de Dropdowns con Scroll
        </Typography>

        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <Typography variant="h6" className="text-yellow-800 dark:text-yellow-200 mb-2">
            📋 Instrucciones de Prueba
          </Typography>
          <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <p>• Haz scroll hacia abajo en esta página</p>
            <p>• Abre cualquier dropdown de los formularios</p>
            <p>• Verifica que el dropdown aparece siempre junto al campo correspondiente</p>
            <p>• Intenta hacer scroll mientras un dropdown está abierto</p>
            <p>• El dropdown debería seguir el campo y reposicionarse automáticamente</p>
          </div>
        </div>

        {/* Formularios distribuidos en la página para probar scroll */}
        <div className="space-y-8">
          {/* Formulario 1 - Parte superior */}
          <Card className="p-6 form-compact">
            <div className="flex items-center gap-2 mb-6">
              <FileTextIcon className="w-5 h-5 text-primary" />
              <Typography variant="h4">Formulario Superior</Typography>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Plataforma 1"
                  placeholder="Seleccionar plataforma"
                  value={formData.plataforma1}
                  onChange={(value) => handleInputChange('plataforma1', value.toString())}
                  options={plataformas.map(p => ({
                    value: p.id,
                    label: p.nombre
                  }))}
                  fullWidth
                />

                <Select
                  label="Industria 1"
                  placeholder="Seleccionar industria"
                  value={formData.industria1}
                  onChange={(value) => handleInputChange('industria1', value.toString())}
                  options={industrias.map(i => ({
                    value: i.id,
                    label: i.nombre
                  }))}
                  fullWidth
                />

                <Select
                  label="País 1"
                  placeholder="Seleccionar país"
                  value={formData.pais1}
                  onChange={(value) => handleInputChange('pais1', value.toString())}
                  options={paises.map(p => ({
                    value: p,
                    label: p
                  }))}
                  fullWidth
                />
              </div>
            </div>
          </Card>

          {/* Espaciado para forzar scroll */}
          <div className="h-96 flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
            <Typography variant="h6" className="text-muted-foreground">
              ⬇️ Haz scroll hacia abajo para probar más dropdowns ⬇️
            </Typography>
          </div>

          {/* Formulario 2 - Parte media */}
          <Card className="p-6 form-compact">
            <div className="flex items-center gap-2 mb-6">
              <FileTextIcon className="w-5 h-5 text-primary" />
              <Typography variant="h4">Formulario Medio</Typography>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Plataforma 2"
                  placeholder="Seleccionar plataforma"
                  value={formData.plataforma2}
                  onChange={(value) => handleInputChange('plataforma2', value.toString())}
                  options={plataformas.map(p => ({
                    value: p.id,
                    label: p.nombre
                  }))}
                  fullWidth
                />

                <Select
                  label="Industria 2"
                  placeholder="Seleccionar industria"
                  value={formData.industria2}
                  onChange={(value) => handleInputChange('industria2', value.toString())}
                  options={industrias.map(i => ({
                    value: i.id,
                    label: i.nombre
                  }))}
                  fullWidth
                />

                <Select
                  label="País 2"
                  placeholder="Seleccionar país"
                  value={formData.pais2}
                  onChange={(value) => handleInputChange('pais2', value.toString())}
                  options={paises.map(p => ({
                    value: p,
                    label: p
                  }))}
                  fullWidth
                />
              </div>
            </div>
          </Card>

          {/* Más espaciado */}
          <div className="h-96 flex items-center justify-center bg-gradient-to-b from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg">
            <Typography variant="h6" className="text-muted-foreground">
              ⬇️ Continúa hacia abajo para más pruebas ⬇️
            </Typography>
          </div>

          {/* Formulario 3 - Parte inferior */}
          <Card className="p-6 form-compact">
            <div className="flex items-center gap-2 mb-6">
              <FileTextIcon className="w-5 h-5 text-primary" />
              <Typography variant="h4">Formulario Inferior</Typography>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Plataforma 3"
                  placeholder="Seleccionar plataforma"
                  value={formData.plataforma3}
                  onChange={(value) => handleInputChange('plataforma3', value.toString())}
                  options={plataformas.map(p => ({
                    value: p.id,
                    label: p.nombre
                  }))}
                  fullWidth
                />

                <Select
                  label="Industria 3"
                  placeholder="Seleccionar industria"
                  value={formData.industria3}
                  onChange={(value) => handleInputChange('industria3', value.toString())}
                  options={industrias.map(i => ({
                    value: i.id,
                    label: i.nombre
                  }))}
                  fullWidth
                />

                <Select
                  label="País 3"
                  placeholder="Seleccionar país"
                  value={formData.pais3}
                  onChange={(value) => handleInputChange('pais3', value.toString())}
                  options={paises.map(p => ({
                    value: p,
                    label: p
                  }))}
                  fullWidth
                />
              </div>
            </div>
          </Card>

          {/* Información técnica */}
          <Card className="p-6 bg-accent/10">
            <Typography variant="h4" className="mb-3">✅ Solución Implementada</Typography>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Estado de posición:</strong> <code className="bg-accent px-1 rounded">dropdownPosition</code> que se actualiza dinámicamente</p>
              <p>• <strong>Listener de scroll:</strong> <code className="bg-accent px-1 rounded">window.addEventListener('scroll', handleScroll, true)</code></p>
              <p>• <strong>Listener de resize:</strong> Para ajustar en cambios de ventana</p>
              <p>• <strong>Cálculo de posición:</strong> Función <code className="bg-accent px-1 rounded">calculateDropdownPosition()</code> que usa <code className="bg-accent px-1 rounded">getBoundingClientRect()</code></p>
              <p>• <strong>Portal rendering:</strong> El dropdown siempre se renderiza en <code className="bg-accent px-1 rounded">document.body</code> con posición absoluta</p>
            </div>
          </Card>

          {/* Espaciado final */}
          <div className="h-64 flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
            <Typography variant="h6" className="text-muted-foreground">
              🎉 ¡Prueba completada! Los dropdowns deberían seguir a sus campos al hacer scroll
            </Typography>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestScrollDropdown; 