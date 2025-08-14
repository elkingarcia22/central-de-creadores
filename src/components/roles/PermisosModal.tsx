import { useState, useEffect } from 'react';
import { Typography, Button, Switch, Card, Modal } from '../ui';

interface Modulo {
  id: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

interface Funcionalidad {
  id: string;
  modulo_id: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  es_sistema: boolean;
}

interface PermisoRol {
  id: string;
  rol_id: string;
  funcionalidad_id: string;
  permitido: boolean;
}

interface PermisosModalProps {
  isOpen: boolean;
  onClose: () => void;
  rol: Rol | null;
  modulos: Modulo[];
  funcionalidades: Funcionalidad[];
  permisosActuales: PermisoRol[];
  onSavePermisos: (permisos: PermisoRol[]) => Promise<void>;
}

export default function PermisosModal({ 
  isOpen, 
  onClose, 
  rol, 
  modulos, 
  funcionalidades, 
  permisosActuales,
  onSavePermisos 
}: PermisosModalProps) {
  const [permisos, setPermisos] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [expandedModulos, setExpandedModulos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (rol && permisosActuales) {
      const permisosMap: Record<string, boolean> = {};
      permisosActuales.forEach(permiso => {
        permisosMap[permiso.funcionalidad_id] = permiso.permitido;
      });
      setPermisos(permisosMap);
    }
  }, [rol, permisosActuales]);

  const handlePermisoChange = (funcionalidadId: string, permitido: boolean) => {
    setPermisos(prev => ({
      ...prev,
      [funcionalidadId]: permitido
    }));
  };

  const handleModuloToggle = (moduloId: string) => {
    setExpandedModulos(prev => ({
      ...prev,
      [moduloId]: !prev[moduloId]
    }));
  };

  const handleSelectAllModulo = (moduloId: string, select: boolean) => {
    const funcionalidadesModulo = funcionalidades.filter(f => f.modulo_id === moduloId);
    const newPermisos = { ...permisos };
    
    funcionalidadesModulo.forEach(func => {
      newPermisos[func.id] = select;
    });
    
    setPermisos(newPermisos);
  };

  const handleSelectAll = (select: boolean) => {
    const newPermisos: Record<string, boolean> = {};
    funcionalidades.forEach(func => {
      newPermisos[func.id] = select;
    });
    setPermisos(newPermisos);
  };

  const handleSave = async () => {
    if (!rol) return;

    setLoading(true);
    try {
      const permisosArray: PermisoRol[] = funcionalidades.map(func => ({
        id: permisosActuales.find(p => p.funcionalidad_id === func.id)?.id || '',
        rol_id: rol.id,
        funcionalidad_id: func.id,
        permitido: permisos[func.id] || false
      }));

      await onSavePermisos(permisosArray);
      onClose();
    } catch (error) {
      console.error('Error guardando permisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFuncionalidadesPorModulo = (moduloId: string) => {
    return funcionalidades
      .filter(f => f.modulo_id === moduloId)
      .sort((a, b) => a.orden - b.orden);
  };

  const getPermisosModulo = (moduloId: string) => {
    const funcionalidadesModulo = getFuncionalidadesPorModulo(moduloId);
    const permisosHabilitados = funcionalidadesModulo.filter(f => permisos[f.id]);
    return {
      total: funcionalidadesModulo.length,
      habilitados: permisosHabilitados.length
    };
  };

  if (!isOpen || !rol) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Permisos del Rol: ${rol.nombre}`}
      size="xl"
      footer={
        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
            loading={loading}
          >
            Guardar Permisos
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Typography variant="body2" color="secondary">
          Configura los permisos específicos para este rol
        </Typography>

          {/* Controles globales */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <Typography variant="h3" weight="medium" className="text-gray-900">
                Controles Globales
              </Typography>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(true)}
                >
                  Seleccionar Todo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(false)}
                >
                  Deseleccionar Todo
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de módulos */}
          <div className="space-y-4">
            {modulos
              .sort((a, b) => a.orden - b.orden)
              .map((modulo) => {
                const funcionalidadesModulo = getFuncionalidadesPorModulo(modulo.id);
                const permisosModulo = getPermisosModulo(modulo.id);
                const isExpanded = expandedModulos[modulo.id];

                return (
                  <Card key={modulo.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleModuloToggle(modulo.id)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <svg 
                            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <div>
                          <Typography variant="h4" weight="medium" className="text-gray-900">
                            {modulo.nombre}
                          </Typography>
                          <Typography variant="body2" color="secondary">
                            {permisosModulo.habilitados} de {permisosModulo.total} funcionalidades habilitadas
                          </Typography>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAllModulo(modulo.id, true)}
                        >
                          Todo
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAllModulo(modulo.id, false)}
                        >
                          Ninguno
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="ml-8 space-y-3">
                        {funcionalidadesModulo.map((func) => (
                          <div key={func.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                              <Typography variant="body1" weight="medium" className="text-gray-900">
                                {func.nombre}
                              </Typography>
                              <Typography variant="body2" color="secondary">
                                {func.descripcion}
                              </Typography>
                            </div>
                            <Switch
                              checked={permisos[func.id] || false}
                              onCheckedChange={(checked) => handlePermisoChange(func.id, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
          </div>

      </div>
    </Modal>
  );
}
