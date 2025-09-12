import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useRol } from '../../../contexts/RolContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../contexts/ToastContext';
import { Layout, Typography, Card, Button, Input, Select, Textarea, MultiSelect, PageHeader, EmptyState, FormContainer, FormItem, Subtitle } from '../../../components/ui';
import MultiUserSelector from '../../../components/ui/MultiUserSelector';
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
import { obtenerInvestigacionPorId, obtenerUsuarios } from '../../../api/supabase-investigaciones';
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
  
  // Usuarios del equipo
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<LibretoFormData>({
    investigacion_id: ''
  });

  // Actualizar investigacion_id cuando el router esté listo
  useEffect(() => {
    if (router.isReady && investigacion && typeof investigacion === 'string') {
      setFormData(prev => ({
        ...prev,
        investigacion_id: investigacion
      }));
    }
  }, [router.isReady, investigacion]);

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      console.log('🔍 Parámetro investigacion:', investigacion);
      console.log('🔍 Tipo de investigacion:', typeof investigacion);
      console.log('🔍 Ancho de ventana:', window.innerWidth);
      console.log('🔍 Breakpoint md (768px):', window.innerWidth >= 768);
      
      // Esperar a que el router esté listo
      if (!router.isReady) {
        console.log('⏳ Router no está listo, esperando...');
        return;
      }
      
      if (!investigacion || typeof investigacion !== 'string') {
        console.error('❌ ID de investigación no válido:', investigacion);
        showError('ID de investigación requerido');
        router.push('/investigaciones');
        return;
      }
      
      try {
        setLoading(true);
        
        // Cargar investigación y catálogos
        const [investigacionRes, plataformasRes, rolesRes, industriasRes, modalidadesRes, tamanosRes, usuariosRes] = await Promise.all([
          obtenerInvestigacionPorId(investigacion),
          obtenerPlataformas(),
          obtenerRolesEmpresa(),
          obtenerIndustrias(),
          obtenerModalidades(),
          obtenerTamanosEmpresa(),
          obtenerUsuarios()
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
        
        // Cargar usuarios
        setUsuarios(usuariosRes.data || []);
        
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
  }, [investigacion, router.isReady]);

  // Monitorear cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      console.log('🔍 Ventana redimensionada - Ancho:', window.innerWidth);
      console.log('🔍 Breakpoint md (768px):', window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (field: keyof LibretoFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    console.log('🔍 === INICIANDO GUARDAR LIBRETO ===');
    console.log('🔍 formData completo:', formData);
    console.log('🔍 investigacion_id:', formData.investigacion_id);
    
    // Validaciones básicas
    if (!formData.investigacion_id) {
      showError('ID de investigación es requerido');
      return;
    }
    
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
        
        {/* Debug info */}
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
          <Typography variant="caption" className="text-yellow-800">
            🔍 Debug: Ancho ventana: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}px | 
            Breakpoint md: {typeof window !== 'undefined' ? (window.innerWidth >= 768 ? 'SÍ' : 'NO') : 'N/A'}
          </Typography>
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
            
            {(() => {
              console.log('🔍 Renderizando sección Problema y Objetivos con FormItem layout="half"');
              return null;
            })()}
            
            <FormItem layout="half">
              <div>
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
              </div>
              
              <div>
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
              </div>
            </FormItem>

            <FormItem layout="half">
              <div>
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
              </div>
              
              <div>
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
              </div>
            </FormItem>
          </FormContainer>

          {/* Configuración de la Sesión */}
          <FormContainer>
            <div className="flex items-center gap-2 mb-6">
              <SettingsIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Subtitle>
                Configuración de la Sesión
              </Subtitle>
            </div>
            
            <FormItem layout="half">
              <div>
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
              </div>

              <div>
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
              </div>
            </FormItem>

            <FormItem layout="half">
              <div>
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
              </div>

              <div>
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
              </div>
            </FormItem>

            <FormItem layout="full">
              <div>
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
              </div>
            </FormItem>

            <FormItem layout="full">
              <div>
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
              </div>
            </FormItem>
          </FormContainer>

          {/* Usuarios en la Sesión */}
          <FormContainer>
            <div className="flex items-center gap-2 mb-6">
              <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Subtitle>
                Usuarios en la Sesión
              </Subtitle>
            </div>
            
            {(() => {
              console.log('🔍 Renderizando sección Usuarios en la Sesión con FormItem layout="full"');
              return null;
            })()}
            
            <FormItem layout="full">
              <MultiUserSelector
                label="Equipo que participará en las sesiones"
                placeholder="Seleccionar usuarios del equipo"
                value={formData.usuarios_participantes || []}
                onChange={(userIds) => handleInputChange('usuarios_participantes', userIds)}
                users={usuarios.map(usuario => ({
                  id: usuario.id,
                  full_name: usuario.full_name,
                  email: usuario.email || undefined,
                  avatar_url: usuario.avatar_url
                }))}
                loading={loadingUsuarios}
                disabled={saving}
              />
              <Typography variant="caption" color="secondary" className="mt-2">
                Selecciona los miembros del equipo que participarán en las sesiones de esta investigación (moderadores, observadores, etc.)
              </Typography>
            </FormItem>
          </FormContainer>

          {/* Perfil de Participantes */}
          <FormContainer>
            <div className="flex items-center gap-2 mb-6">
              <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Subtitle>
                Perfil de Participantes
              </Subtitle>
            </div>
            
            <FormItem layout="half">
              <div>
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
              </div>

              <div>
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
              </div>
            </FormItem>

            <FormItem layout="half">
              <div>
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
              </div>

              <div>
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
              </div>
            </FormItem>
          </FormContainer>
        </div>
      </div>
    </Layout>
  );
};

export default CrearLibretoPage; 