import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, Switch } from '../ui';
import SideModal from '../ui/SideModal';

interface Modulo {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Funcionalidad {
  id: string;
  nombre: string;
  descripcion: string;
  modulo_id: string;
  modulo?: Modulo;
}

interface PermisoRol {
  id: string;
  rol_id: string;
  funcionalidad_id: string;
  permitido: boolean;
  funcionalidad?: Funcionalidad;
}

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  es_sistema: boolean;
}

interface PermisosModalProps {
  isOpen: boolean;
  onClose: () => void;
  rol: Rol | null;
  onSave: (permisos: PermisoRol[]) => Promise<void>;
}

const PermisosModal: React.FC<PermisosModalProps> = ({ isOpen, onClose, rol, onSave }) => {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [funcionalidades, setFuncionalidades] = useState<Funcionalidad[]>([]);
  const [permisosActuales, setPermisosActuales] = useState<PermisoRol[]>([]);
  const [permisosEditados, setPermisosEditados] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cargar módulos y funcionalidades
  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar módulos
      const modulosResponse = await fetch('/api/modulos');
      const modulosData = await modulosResponse.json();
      setModulos(modulosData.modulos || []);

      // Cargar funcionalidades
      const funcionalidadesResponse = await fetch('/api/funcionalidades');
      const funcionalidadesData = await funcionalidadesResponse.json();
      setFuncionalidades(funcionalidadesData.funcionalidades || []);

      // Cargar permisos actuales del rol
      if (rol) {
        const permisosResponse = await fetch(`/api/permisos-roles?rol_id=${rol.id}`);
        const permisosData = await permisosResponse.json();
        setPermisosActuales(permisosData.permisos || []);
        
        // Inicializar permisos editados con los valores actuales
        const permisosIniciales: Record<string, boolean> = {};
        permisosData.permisos?.forEach((permiso: PermisoRol) => {
          permisosIniciales[permiso.funcionalidad_id] = permiso.permitido;
        });
        setPermisosEditados(permisosIniciales);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && rol) {
      cargarDatos();
    }
  }, [isOpen, rol]);

  const handlePermisoChange = (funcionalidadId: string, permitido: boolean) => {
    setPermisosEditados(prev => ({
      ...prev,
      [funcionalidadId]: permitido
    }));
  };

  const handleSave = async () => {
    if (!rol) return;

    setSaving(true);
    try {
      // Preparar permisos para guardar
      const permisosParaGuardar = Object.entries(permisosEditados).map(([funcionalidadId, permitido]) => ({
        rol_id: rol.id,
        funcionalidad_id: funcionalidadId,
        permitido
      }));

      await onSave(permisosParaGuardar);
      onClose();
    } catch (error) {
      console.error('Error guardando permisos:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAllModule = (moduloId: string, permitido: boolean) => {
    const funcionalidadesDelModulo = funcionalidades.filter(f => f.modulo_id === moduloId);
    const nuevosPermisos = { ...permisosEditados };
    
    funcionalidadesDelModulo.forEach(funcionalidad => {
      nuevosPermisos[funcionalidad.id] = permitido;
    });
    
    setPermisosEditados(nuevosPermisos);
  };

  const getFuncionalidadesPorModulo = (moduloId: string) => {
    return funcionalidades.filter(f => f.modulo_id === moduloId);
  };

  const getPermisoActual = (funcionalidadId: string) => {
    return permisosEditados[funcionalidadId] || false;
  };

  const getModuloPermisos = (moduloId: string) => {
    const funcionalidadesDelModulo = getFuncionalidadesPorModulo(moduloId);
    const permisosHabilitados = funcionalidadesDelModulo.filter(f => 
      getPermisoActual(f.id)
    ).length;
    
    return {
      total: funcionalidadesDelModulo.length,
      habilitados: permisosHabilitados,
      todosHabilitados: permisosHabilitados === funcionalidadesDelModulo.length,
      algunosHabilitados: permisosHabilitados > 0 && permisosHabilitados < funcionalidadesDelModulo.length
    };
  };

  if (!isOpen || !rol) return null;

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Permisos del Rol: ${rol.nombre}`}
      width="xl"
      position="right"
      footer={
        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Permisos'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Información del rol */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Typography variant="body2" weight="semibold" className="text-blue-800 mb-2">
            Configurando Permisos
          </Typography>
          <Typography variant="caption" color="secondary" className="text-blue-700">
            Activa o desactiva los permisos específicos para este rol. Los permisos determinan qué funcionalidades 
            podrán usar los usuarios con este rol asignado.
          </Typography>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <Typography variant="body2" color="secondary" className="ml-3">
              Cargando permisos...
            </Typography>
          </div>
        ) : (
          <div className="space-y-6">
            {modulos.map((modulo) => {
              const moduloPermisos = getModuloPermisos(modulo.id);
              const funcionalidadesDelModulo = getFuncionalidadesPorModulo(modulo.id);

              return (
                <Card key={modulo.id} variant="elevated" padding="md">
                  {/* Header del módulo */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Typography variant="h4" weight="semibold" className="capitalize">
                        {modulo.nombre}
                      </Typography>
                      <Typography variant="body2" color="secondary">
                        {moduloPermisos.habilitados} de {moduloPermisos.total} permisos habilitados
                      </Typography>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAllModule(modulo.id, true)}
                        disabled={moduloPermisos.todosHabilitados}
                      >
                        Habilitar Todo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAllModule(modulo.id, false)}
                        disabled={moduloPermisos.habilitados === 0}
                      >
                        Deshabilitar Todo
                      </Button>
                    </div>
                  </div>

                  {/* Funcionalidades del módulo */}
                  <div className="space-y-3">
                    {funcionalidadesDelModulo.map((funcionalidad) => (
                      <div
                        key={funcionalidad.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <Typography variant="body2" weight="medium">
                            {funcionalidad.nombre.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                          <Typography variant="caption" color="secondary">
                            {funcionalidad.descripcion}
                          </Typography>
                        </div>
                        <Switch
                          checked={getPermisoActual(funcionalidad.id)}
                          onChange={(checked) => handlePermisoChange(funcionalidad.id, checked)}
                        />
                      </div>
                    ))}
                  </div>

                  {funcionalidadesDelModulo.length === 0 && (
                    <div className="text-center py-4">
                      <Typography variant="body2" color="secondary">
                        No hay funcionalidades configuradas para este módulo
                      </Typography>
                    </div>
                  )}
                </Card>
              );
            })}

            {modulos.length === 0 && (
              <div className="text-center py-8">
                <Typography variant="body1" color="secondary">
                  No hay módulos configurados en el sistema
                </Typography>
              </div>
            )}
          </div>
        )}
      </div>
    </SideModal>
  );
};

export default PermisosModal;
