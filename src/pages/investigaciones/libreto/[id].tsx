import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useRol } from '../../../contexts/RolContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../contexts/ToastContext';
import { Layout, Typography, Card, Button, Input, Select, Textarea, PageHeader, FormContainer, FormItem, Subtitle, EmptyState } from '../../../components/ui';
import MultiUserSelector from '../../../components/ui/MultiUserSelector';
import { 
  ArrowLeftIcon, 
  SaveIcon,
  TrashIcon,
  SettingsIcon,
  UserIcon,
  DocumentIcon
} from '../../../components/icons';
import { 
  obtenerLibretoPorInvestigacion,
  actualizarLibreto,
  eliminarLibreto,
  obtenerPlataformas,
  obtenerRolesEmpresa,
  obtenerIndustrias,
  obtenerModalidades,
  obtenerTamanosEmpresa
} from '../../../api/supabase-libretos';
import { obtenerInvestigacionPorId, obtenerUsuarios } from '../../../api/supabase-investigaciones';
import type { LibretoInvestigacion, LibretoFormData } from '../../../types/libretos';

const LibretoDetallePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [libreto, setLibreto] = useState<LibretoInvestigacion | null>(null);
  const [investigacion, setInvestigacion] = useState<any>(null);
  
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
  
  // Form data - siempre en modo edición
  const [formData, setFormData] = useState<LibretoFormData>({
    investigacion_id: typeof id === 'string' ? id : ''
  });

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      // Esperar a que el router esté listo
      if (!router.isReady) {
        console.log('⏳ Router no está listo, esperando...');
        return;
      }
      
      if (!id || typeof id !== 'string') return;
      
      try {
        setLoading(true);
        
        // Cargar investigación y libreto
        const [investigacionRes, libretoRes, plataformasRes, rolesRes, industriasRes, modalidadesRes, tamanosRes, usuariosRes] = await Promise.all([
          obtenerInvestigacionPorId(id),
          obtenerLibretoPorInvestigacion(id),
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
        
        setInvestigacion(investigacionRes.data);
        
        if (libretoRes.data) {
          setLibreto(libretoRes.data);
          setFormData({
            investigacion_id: id,
            problema_situacion: libretoRes.data.problema_situacion || '',
            hipotesis: libretoRes.data.hipotesis || '',
            objetivos: libretoRes.data.objetivos || '',
            resultado_esperado: libretoRes.data.resultado_esperado || '',
            plataforma_id: libretoRes.data.plataforma_id || '',
            tipo_prueba_id: libretoRes.data.tipo_prueba_id || '',
            rol_empresa_id: libretoRes.data.rol_empresa_id || '',
            industria_id: libretoRes.data.industria_id || '',
            pais_id: libretoRes.data.pais_id || '',
            modalidad_id: Array.isArray(libretoRes.data.modalidad_id) ? libretoRes.data.modalidad_id : [libretoRes.data.modalidad_id].filter(Boolean),
            tamano_empresa_id: Array.isArray(libretoRes.data.tamano_empresa_id) ? libretoRes.data.tamano_empresa_id : [libretoRes.data.tamano_empresa_id].filter(Boolean),
            numero_participantes: libretoRes.data.numero_participantes || undefined,
            nombre_sesion: libretoRes.data.nombre_sesion || '',
            usuarios_participantes: libretoRes.data.usuarios_participantes || [],
            duracion_estimada: libretoRes.data.duracion_estimada || undefined,
            descripcion_general: libretoRes.data.descripcion_general || '',
            link_prototipo: libretoRes.data.link_prototipo || ''
          });
        } else {
          showError('No se encontró el libreto');
          router.push('/investigaciones');
          return;
        }
        
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
        
      } catch (error) {
        console.error('Error cargando datos:', error);
        showError('Error inesperado al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, router.isReady]);

  const handleInputChange = (field: keyof LibretoFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!libreto) return;
    
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
      const response = await actualizarLibreto(libreto.id, formData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setLibreto(response.data);
      showSuccess('Libreto actualizado exitosamente');
      
      // Redirigir de vuelta a la vista de investigación después de guardar
      setTimeout(() => {
        router.push(`/investigaciones/ver/${id}`);
      }, 1000); // Pequeño delay para que el usuario vea el mensaje de éxito
      
    } catch (error: any) {
      console.error('Error guardando libreto:', error);
      showError(error.message || 'Error al guardar el libreto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!libreto) return;
    
    if (!confirm('¿Estás seguro de que deseas eliminar este libreto? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setSaving(true);
    try {
      const response = await eliminarLibreto(libreto.id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      showSuccess('Libreto eliminado exitosamente');
      
      // Redirigir de vuelta a la vista de investigación después de eliminar
      setTimeout(() => {
        router.push(`/investigaciones/ver/${id}`);
      }, 1000); // Pequeño delay para que el usuario vea el mensaje de éxito
      
    } catch (error: any) {
      console.error('Error eliminando libreto:', error);
      showError(error.message || 'Error al eliminar el libreto');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Redirigir de vuelta a la vista de investigación
    router.push(`/investigaciones/ver/${id}`);
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

  if (!libreto || !investigacion) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <EmptyState
            icon={<DocumentIcon className="w-8 h-8" />}
            title="Libreto no encontrado"
            description="No se pudo encontrar el libreto solicitado para editar."
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
            title="Editar Libreto"
            subtitle={investigacion.nombre}
            color="blue"
            className="mb-0 flex-1"
            primaryAction={{
              label: "Guardar",
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
              },
              {
                label: "Eliminar",
                onClick: handleDelete,
                variant: "secondary",
                icon: <TrashIcon className="w-4 h-4" />,
                disabled: saving,
                className: '!text-red-600 hover:!text-red-700'
              }
            ]}
          />
        </div>

        {/* Contenido - Siempre en modo edición */}
        <div className="space-y-8">
          {/* Problema y Objetivos */}
          <FormContainer>
            <div className="flex items-center gap-2 mb-6">
              <DocumentIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Subtitle>
                Problema y Objetivos
              </Subtitle>
            </div>
            
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
                <Select
                  options={catalogos.modalidades.map(m => ({
                    value: m.id,
                    label: m.nombre
                  }))}
                  value={Array.isArray(formData.modalidad_id) ? formData.modalidad_id[0] || '' : formData.modalidad_id || ''}
                  onChange={(value) => handleInputChange('modalidad_id', value)}
                  placeholder="Seleccionar modalidad"
                  disabled={saving}
                  fullWidth
                />
              </div>

              <div>
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Tamaño de Empresa
                </Typography>
                <Select
                  options={catalogos.tamanosEmpresa.map(t => ({
                    value: t.id,
                    label: t.nombre
                  }))}
                  value={Array.isArray(formData.tamano_empresa_id) ? formData.tamano_empresa_id[0] || '' : formData.tamano_empresa_id || ''}
                  onChange={(value) => handleInputChange('tamano_empresa_id', value)}
                  placeholder="Seleccionar tamaño"
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

export default LibretoDetallePage; 