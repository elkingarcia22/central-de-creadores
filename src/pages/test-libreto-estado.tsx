import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Layout, Typography, Card, Button, Input } from '../components/ui';
import { obtenerInvestigacionPorId } from '../api/supabase-investigaciones';
import { crearLibreto } from '../api/supabase-libretos';
import { useToast } from '../contexts/ToastContext';

const TestLibretoEstadoPage: NextPage = () => {
  const { showSuccess, showError } = useToast();
  const [investigacionId, setInvestigacionId] = useState('');
  const [investigacion, setInvestigacion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [creandoLibreto, setCreandoLibreto] = useState(false);

  const verificarInvestigacion = async () => {
    if (!investigacionId.trim()) {
      showError('Ingresa un ID de investigación');
      return;
    }

    setLoading(true);
    try {
      const response = await obtenerInvestigacionPorId(investigacionId.trim());
      
      if (response.error) {
        throw new Error(response.error);
      }

      setInvestigacion(response.data);
      showSuccess('Investigación encontrada');
      console.log('📊 Investigación cargada:', response.data);
    } catch (error: any) {
      console.error('Error verificando investigación:', error);
      showError(error.message || 'Error al verificar la investigación');
      setInvestigacion(null);
    } finally {
      setLoading(false);
    }
  };

  const probarCrearLibreto = async () => {
    if (!investigacion) {
      showError('Primero verifica una investigación');
      return;
    }

    setCreandoLibreto(true);
    try {
      const datosLibreto = {
        investigacion_id: investigacion.id,
        problema_situacion: 'Problema de prueba para debug',
        objetivos: 'Objetivos de prueba para debug',
        hipotesis: 'Hipótesis de prueba',
        resultado_esperado: 'Resultado esperado de prueba'
      };

      console.log('📝 Creando libreto con datos:', datosLibreto);
      
      const response = await crearLibreto(datosLibreto);
      
      if (response.error) {
        throw new Error(response.error);
      }

      showSuccess('Libreto creado exitosamente');
      console.log('✅ Respuesta de crearLibreto:', response);
      
      // Recargar la investigación para ver el cambio de estado
      await verificarInvestigacion();
      
    } catch (error: any) {
      console.error('Error creando libreto:', error);
      showError(error.message || 'Error al crear el libreto');
    } finally {
      setCreandoLibreto(false);
    }
  };

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Typography variant="h1">Test: Cambio de Estado al Crear Libreto</Typography>
          
          {/* Verificar Investigación */}
          <Card className="p-6">
            <Typography variant="h3" className="mb-4">1. Verificar Investigación</Typography>
            
            <div className="flex gap-4 mb-4">
              <Input
                value={investigacionId}
                onChange={(e) => setInvestigacionId(e.target.value)}
                placeholder="ID de la investigación"
                className="flex-1"
              />
              <Button 
                onClick={verificarInvestigacion}
                loading={loading}
                disabled={!investigacionId.trim()}
              >
                Verificar
              </Button>
            </div>

            {investigacion && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <Typography variant="h4" className="mb-2">Investigación Encontrada</Typography>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {investigacion.id}</div>
                  <div><strong>Nombre:</strong> {investigacion.nombre}</div>
                  <div><strong>Estado:</strong> <span className="font-mono bg-yellow-100 px-2 py-1 rounded">{investigacion.estado}</span></div>
                  <div><strong>Tiene Libreto:</strong> {investigacion.libreto ? 'Sí' : 'No'}</div>
                  <div><strong>Creado:</strong> {new Date(investigacion.creado_el).toLocaleString()}</div>
                </div>
              </div>
            )}
          </Card>

          {/* Probar Crear Libreto */}
          {investigacion && (
            <Card className="p-6">
              <Typography variant="h3" className="mb-4">2. Probar Crear Libreto</Typography>
              
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <Typography variant="body2">
                    <strong>Nota:</strong> Esta acción creará un libreto de prueba y debería cambiar el estado de la investigación de "en_borrador" a "por_agendar".
                  </Typography>
                </div>

                <Button 
                  onClick={probarCrearLibreto}
                  loading={creandoLibreto}
                  disabled={!investigacion || investigacion.estado !== 'en_borrador'}
                  variant="primary"
                >
                  {creandoLibreto ? 'Creando Libreto...' : 'Crear Libreto de Prueba'}
                </Button>

                {investigacion.estado !== 'en_borrador' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                    <Typography variant="body2">
                      <strong>Advertencia:</strong> La investigación no está en estado "en_borrador" ({investigacion.estado}). 
                      El cambio de estado solo funciona si está en "en_borrador".
                    </Typography>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Instrucciones */}
          <Card className="p-6">
            <Typography variant="h3" className="mb-4">Instrucciones</Typography>
            <div className="space-y-2 text-sm">
              <div>1. Ingresa el ID de una investigación que esté en estado "en_borrador"</div>
              <div>2. Haz clic en "Verificar" para cargar los datos</div>
              <div>3. Haz clic en "Crear Libreto de Prueba"</div>
              <div>4. Revisa la consola del navegador para ver los logs detallados</div>
              <div>5. Verifica que el estado cambie a "por_agendar"</div>
            </div>
          </Card>

          {/* Logs */}
          <Card className="p-6">
            <Typography variant="h3" className="mb-4">Logs de Debug</Typography>
            <Typography variant="body2" color="secondary">
              Abre la consola del navegador (F12) para ver los logs detallados de la función crearLibreto.
            </Typography>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TestLibretoEstadoPage; 