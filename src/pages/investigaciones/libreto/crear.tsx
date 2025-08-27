import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useRol } from '../../../contexts/RolContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../contexts/ToastContext';
import { Layout, Typography, Card, Button, Input, Select, Textarea, MultiSelect, PageHeader, EmptyState, FormContainer, FormItem, Subtitle } from '../../../components/ui';
import { 
  ArrowLeftIcon, 
  FileTextIcon, 
  SaveIcon,
  SettingsIcon,
  UserIcon,
  DocumentIcon
} from '../../../components/icons';
import { 
  crearLibreto,
  obtenerPlataformas,
  obtenerRolesEmpresa,
  obtenerIndustrias,
  obtenerModalidades,
  obtenerTamanosEmpresa
} from '../../../api/supabase-libretos';
import { obtenerInvestigacionPorId } from '../../../api/supabase-investigaciones';
import type { LibretoFormData } from '../../../types/libretos';

const CrearLibretoPage: NextPage = () => {
  const router = useRouter();
  const { investigacion } = router.query;
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [investigacionData, setInvestigacionData] = useState<any>(null);
  
  // Catálogos
  const [catalogos, setCatalogos] = useState({
    plataformas: [],
    rolesEmpresa: [],
    industrias: [],
    modalidades: [],
    tamanosEmpresa: []
  });
  
  // Form data
  const [formData, setFormData] = useState<LibretoFormData>({
    investigacion_id: typeof investigacion === 'string' ? investigacion : ''
  });

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      if (!investigacion || typeof investigacion !== 'string') {
        showError('ID de investigación requerido');
        router.push('/investigaciones');
        return;
      }
      
      try {
        setLoading(true);
        
        // Cargar investigación y catálogos
        const [investigacionRes, plataformasRes, rolesRes, industriasRes, modalidadesRes, tamanosRes] = await Promise.all([
          obtenerInvestigacionPorId(investigacion),
          obtenerPlataformas(),
          obtenerRolesEmpresa(),
          obtenerIndustrias(),
          obtenerModalidades(),
          obtenerTamanosEmpresa()
        ]);
        
        if (investigacionRes.error) {
          showError('Error cargando investigación');
          router.push('/investigaciones');
          return;
        }
        
        setInvestigacionData(investigacionRes.data);
        
        // Cargar catálogos
        setCatalogos({
          plataformas: plataformasRes.data || [],
          rolesEmpresa: rolesRes.data || [],
          industrias: industriasRes.data || [],
          modalidades: modalidadesRes.data || [],
          tamanosEmpresa: tamanosRes.data || []
        });
        
        // Inicializar form data
        setFormData({
          investigacion_id: investigacion,
          problema_situacion: '',
          hipotesis: '',
          objetivos: '',
          resultado_esperado: '',
          productos_recomendaciones: '',
          plataforma_id: '',
          tipo_prueba_id: '',
          rol_empresa_id: '',
          industria_id: '',
          pais_id: '',
          modalidad_id: [],
          tamano_empresa_id: [],
          numero_participantes: undefined,
          nombre_sesion: '',
          usuarios_participantes: [],
          duracion_estimada: undefined,
          descripcion_general: '',
          link_prototipo: ''
        });
        
      } catch (error) {
        console.error('Error cargando datos:', error);
        showError('Error inesperado al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [investigacion]);

  const handleInputChange = (field: keyof LibretoFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Validaciones básicas
    if (!formData.problema_situacion?.trim()) {
      showError('El problema o situación es requerido');
      return;
    }
    
    if (!formData.objetivos?.trim()) {
      showError('Los objetivos son requeridos');
      return;
    }
    
    setSaving(true);
    try {
      const response = await crearLibreto(formData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      showSuccess('Libreto creado exitosamente');
      
      // Esperar un poco para mostrar el toast y luego redirigir
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push(`/investigaciones/ver/${investigacion}`);
    } catch (error: any) {
      console.error('Error creando libreto:', error);
      showError(error.message || 'Error al crear el libreto');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/investigaciones');
  };

  if (loading) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!investigacionData) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <EmptyState
            icon={<FileTextIcon className="w-8 h-8" />}
            title="Investigación no encontrada"
            description="No se pudo encontrar la investigación solicitada para crear el libreto."
            actionText="Volver a Investigaciones"
            onAction={() => router.push('/investigaciones')}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <PageHeader
            title="Crear Libreto"
            subtitle={investigacionData.nombre}
            color="blue"
            className="mb-0 flex-1"
            primaryAction={{
              label: "Crear Libreto",
              onClick: handleSave,
              variant: "primary",
              icon: <SaveIcon className="w-4 h-4" />,
              disabled: saving
            }}
            secondaryActions={[
              {
                label: "Cancelar",
                onClick: handleCancel,
                variant: "secondary",
                disabled: saving
              }
            ]}
          />
        </div>

        {/* Contenido */}
        <div className="space-y-8">
          {/* Problema y Objetivos */}
          <FormContainer>
            <div className="flex items-center gap-2 mb-6">
              <DocumentIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Subtitle>
                Problema y Objetivos
              </Subtitle>
            </div>
            
            <div className="space-y-6">
              <FormItem>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Problema o Situación *
                </Typography>
                <Textarea
                  value={formData.problema_situacion || ''}
                  onChange={(e) => handleInputChange('problema_situacion', e.target.value)}
                  placeholder="Describe el problema o situación que se quiere investigar"
                  rows={4}
                  disabled={saving}
                  required
                  fullWidth
                />
              </FormItem>

              <FormItem>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Hipótesis
                </Typography>
                <Textarea
                  value={formData.hipotesis || ''}
                  onChange={(e) => handleInputChange('hipotesis', e.target.value)}
                  placeholder="Describe la hipótesis que se quiere validar"
                  rows={3}
                  disabled={saving}
                  fullWidth
                />
              </FormItem>

              <FormItem>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Objetivos *
                </Typography>
                <Textarea
                  value={formData.objetivos || ''}
                  onChange={(e) => handleInputChange('objetivos', e.target.value)}
                  placeholder="Define los objetivos específicos de la investigación"
                  rows={4}
                  disabled={saving}
                  required
                  fullWidth
                />
              </FormItem>

              <FormItem>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Resultado Esperado
                </Typography>
                <Textarea
                  value={formData.resultado_esperado || ''}
                  onChange={(e) => handleInputChange('resultado_esperado', e.target.value)}
                  placeholder="Describe qué resultado se espera obtener"
                  rows={3}
                  disabled={saving}
                  fullWidth
                />
              </FormItem>
            </div>
          </FormContainer>

          {/* Configuración de la Sesión */}
          <FormContainer>
            <div className="flex items-center gap-2 mb-6">
              <SettingsIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Subtitle>
                Configuración de la Sesión
              </Subtitle>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormItem>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Nombre de la Sesión
                </Typography>
                <Input
                  value={formData.nombre_sesion || ''}
                  onChange={(e) => handleInputChange('nombre_sesion', e.target.value)}
                  placeholder="Nombre descriptivo de la sesión"
                  disabled={saving}
                  fullWidth
                />
              </FormItem>

              <FormItem>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Duración Estimada (minutos)
                </Typography>
                <Input
                  type="number"
                  value={formData.duracion_estimada || ''}
                  onChange={(e) => handleInputChange('duracion_estimada', parseInt(e.target.value) || undefined)}
                  placeholder="60"
                  disabled={saving}
                  fullWidth
                />
              </FormItem>

              <FormItem>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Número de Participantes
                </Typography>
                <Input
                  type="number"
                  value={formData.numero_participantes || ''}
                  onChange={(e) => handleInputChange('numero_participantes', parseInt(e.target.value) || undefined)}
                  placeholder="5"
                  disabled={saving}
                  fullWidth
                />
              </FormItem>

              <FormItem>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Plataforma
                </Typography>
                <Select
                  options={catalogos.plataformas.map(p => ({
                    value: p.id,
                    label: p.nombre
                  }))}
                  value={formData.plataforma_id || ''}
                  onChange={(value) => handleInputChange('plataforma_id', value)}
                  placeholder="Seleccionar plataforma"
                  disabled={saving}
                  fullWidth
                />
              </FormItem>

              <FormItem className="md:col-span-2">
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Link del Prototipo
                </Typography>
                <Input
                  value={formData.link_prototipo || ''}
                  onChange={(e) => handleInputChange('link_prototipo', e.target.value)}
                  placeholder="https://prototipo.ejemplo.com"
                  disabled={saving}
                  fullWidth
                />
              </FormItem>

              <FormItem className="md:col-span-2">
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Descripción General
                </Typography>
                <Textarea
                  value={formData.descripcion_general || ''}
                  onChange={(e) => handleInputChange('descripcion_general', e.target.value)}
                  placeholder="Descripción general de la sesión y metodología"
                  rows={4}
                  disabled={saving}
                  fullWidth
                />
              </FormItem>
            </div>
          </FormContainer>

          {/* Perfil de Participantes */}
          <FormContainer>
            <div className="flex items-center gap-2 mb-6">
              <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Subtitle>
                Perfil de Participantes
              </Subtitle>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormItem>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Rol en Empresa
                </Typography>
                <Select
                  options={catalogos.rolesEmpresa.map(r => ({
                    value: r.id,
                    label: r.nombre
                  }))}
                  value={formData.rol_empresa_id || ''}
                  onChange={(value) => handleInputChange('rol_empresa_id', value)}
                  placeholder="Seleccionar rol"
                  disabled={saving}
                  fullWidth
                />
              </FormItem>

              <FormItem>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Industria
                </Typography>
                <Select
                  options={catalogos.industrias.map(i => ({
                    value: i.id,
                    label: i.nombre
                  }))}
                  value={formData.industria_id || ''}
                  onChange={(value) => handleInputChange('industria_id', value)}
                  placeholder="Seleccionar industria"
                  disabled={saving}
                  fullWidth
                />
              </FormItem>

              <FormItem>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Modalidad
                </Typography>
                <MultiSelect
                  options={catalogos.modalidades.map(m => ({
                    value: m.id,
                    label: m.nombre
                  }))}
                  value={formData.modalidad_id || []}
                  onChange={(value) => handleInputChange('modalidad_id', value)}
                  placeholder="Seleccionar modalidades"
                  disabled={saving}
                  fullWidth
                />
              </FormItem>

              <FormItem>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Tamaño de Empresa
                </Typography>
                <MultiSelect
                  options={catalogos.tamanosEmpresa.map(t => ({
                    value: t.id,
                    label: t.nombre
                  }))}
                  value={formData.tamano_empresa_id || []}
                  onChange={(value) => handleInputChange('tamano_empresa_id', value)}
                  placeholder="Seleccionar tamaños"
                  disabled={saving}
                  fullWidth
                />
              </FormItem>
            </div>
          </FormContainer>
        </div>
      </div>
    </Layout>
  );
};

export default CrearLibretoPage; 