import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useRol } from '../../../contexts/RolContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../contexts/ToastContext';
import { Layout, Typography, Card, Button, Input, Select, Textarea } from '../../../components/ui';
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
import { obtenerInvestigacionPorId } from '../../../api/supabase-investigaciones';
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
  
  // Form data - siempre en modo edición
  const [formData, setFormData] = useState<LibretoFormData>({
    investigacion_id: typeof id === 'string' ? id : ''
  });

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      if (!id || typeof id !== 'string') return;
      
      try {
        setLoading(true);
        
        // Cargar investigación y libreto
        const [investigacionRes, libretoRes, plataformasRes, rolesRes, industriasRes, modalidadesRes, tamanosRes] = await Promise.all([
          obtenerInvestigacionPorId(id),
          obtenerLibretoPorInvestigacion(id),
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
        
      } catch (error) {
        console.error('Error cargando datos:', error);
        showError('Error inesperado al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

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
          <Card className="p-8 text-center">
            <Typography variant="h4" className="mb-4">Libreto no encontrado</Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              No se pudo encontrar el libreto solicitado
            </Typography>
            <Button variant="primary" onClick={() => router.push('/investigaciones')}>
              Volver a Investigaciones
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/investigaciones')}
              className="p-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <Typography variant="h2">Editar Libreto</Typography>
              <Typography variant="body2" color="secondary">
                {investigacion.nombre}
              </Typography>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
              className="flex items-center gap-2"
            >
              <SaveIcon className="w-4 h-4" />
              Guardar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={saving}
              className="flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Contenido - Siempre en modo edición */}
        <div className="space-y-8">
          {/* Problema y Objetivos */}
          <Card variant="default" padding="lg">
            <div className="flex items-center gap-2 mb-6">
              <DocumentIcon className="w-5 h-5 text-primary" />
              <Typography variant="h3" weight="medium">
                Problema y Objetivos
              </Typography>
            </div>
            
            <div className="space-y-6">
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
            </div>
          </Card>

          {/* Configuración de la Sesión */}
          <Card variant="default" padding="lg">
            <div className="flex items-center gap-2 mb-6">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <Typography variant="h3" weight="medium">
                Configuración de la Sesión
              </Typography>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="md:col-span-2">
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

              <div className="md:col-span-2">
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
            </div>
          </Card>

          {/* Perfil de Participantes */}
          <Card variant="default" padding="lg">
            <div className="flex items-center gap-2 mb-6">
              <UserIcon className="w-5 h-5 text-primary" />
              <Typography variant="h3" weight="medium">
                Perfil de Participantes
              </Typography>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default LibretoDetallePage; 