import React, { useState, useEffect } from 'react';
import { Typography, Input, Button, MultiSelect } from '../ui';
import { obtenerRolesDesdeCache, obtenerRolesParaSelect, ROLES_DEFAULT } from '../../api/roles';
import { useToast } from '../../contexts/ToastContext';

interface Usuario {
  id?: string;
  full_name: string;
  email: string;
  roles: string[];
  avatar_url?: string;
}

interface UsuarioFormProps {
  usuario?: Usuario;
  onSubmit: (data?: any) => void;
  onClose: () => void;
  loading?: boolean;
  isEditing?: boolean;
  hideButtons?: boolean;
}

export default function UsuarioForm({ usuario, onSubmit, onClose, loading = false, isEditing = false, hideButtons = false }: UsuarioFormProps) {
  const { showSuccess, showError, showWarning } = useToast();
  
  const [formData, setFormData] = useState<Usuario>({
    full_name: '',
    email: '',
    roles: []
  });

  const [rolesDisponibles, setRolesDisponibles] = useState<{ value: string; label: string }[]>(ROLES_DEFAULT);
  const [rolesLoading, setRolesLoading] = useState(false);
  
  // Log cuando cambie rolesLoading
  useEffect(() => {
    console.log('🔄 rolesLoading cambió a:', rolesLoading);
  }, [rolesLoading]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(usuario?.avatar_url || null);

  // Función para mapear nombres de roles a UUIDs (para cuando la vista devuelve nombres)
  const mapearNombresaRolesUUID = (rolesNombres: string[]): string[] => {
    const mapeoRoles = {
      'Administrador': 'bcc17f6a-d751-4c39-a479-412abddde0fa',
      'Investigador': 'e1fb53e3-3d1c-4ff5-bdac-9a1285dd99d7',
      'Reclutador': 'fcf6ffc7-e8d3-407b-8c72-b4a7e8db6c9c',
      'Agendador': '7e329b4c-3716-4781-919e-54106b51ca99'
    };
    
    const rolesUUID = rolesNombres.map(nombre => mapeoRoles[nombre as keyof typeof mapeoRoles] || nombre);
    console.log('🔄 Mapeando nombres de roles a UUIDs:', { nombres: rolesNombres, uuids: rolesUUID });
    return rolesUUID;
  };

  // Función para mapear UUIDs de roles a valores de opciones (mantener UUIDs)
  const mapearRolesUUIDaValores = (rolesUUID: string[]): string[] => {
    // Verificar si son UUIDs o nombres
    const esUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    
    if (rolesUUID.length > 0 && !esUUID(rolesUUID[0])) {
      // Si no son UUIDs, convertirlos
      console.log('🔄 Detectados nombres de roles, convirtiendo a UUIDs:', rolesUUID);
      return mapearNombresaRolesUUID(rolesUUID);
    }
    
    // Si ya son UUIDs, mantenerlos
    console.log('🔄 Roles ya son UUIDs, manteniendo:', rolesUUID);
    return rolesUUID;
  };

  // Función para mapear valores de opciones a UUIDs de roles (mantener UUIDs)
  const mapearValoresaRolesUUID = (valores: string[]): string[] => {
    // No mapear, mantener los UUIDs como valores
    console.log('🔄 Mapeando valores a roles UUID (manteniendo UUIDs):', valores);
    return valores;
  };

  // Actualizar formulario cuando cambie el usuario (para modo edición)
  useEffect(() => {
    console.log('🔄 UsuarioForm: Usuario recibido:', usuario);
    if (usuario) {
      console.log('📝 UsuarioForm: Estableciendo datos del formulario:', {
        full_name: usuario.full_name,
        email: usuario.email,
        roles: usuario.roles,
        rolesType: typeof usuario.roles,
        rolesLength: usuario.roles?.length,
        avatar_url: usuario.avatar_url
      });
      
      // Mapear roles UUID a valores de opciones
      const rolesMapeados = mapearRolesUUIDaValores(usuario.roles || []);
      console.log('🔄 Roles mapeados:', rolesMapeados);
      
      setFormData({
        full_name: usuario.full_name || '',
        email: usuario.email || '',
        roles: rolesMapeados
      });
      setCurrentAvatarUrl(usuario.avatar_url || null);
      setAvatarFile(null); // Limpiar archivo seleccionado cuando cambie el usuario
    }
  }, [usuario]);

  // Cargar roles desde cache o base de datos
  useEffect(() => {
    const cargarRoles = async () => {
      try {
        // Primero intentar usar cache
        const rolesEnCache = obtenerRolesDesdeCache();
        if (rolesEnCache) {
          console.log('UsuarioForm: Usando roles desde cache:', rolesEnCache);
          console.log('🔍 Formato de opciones de roles:', rolesEnCache.map(r => ({ value: r.value, label: r.label })));
          setRolesDisponibles(rolesEnCache);
          return;
        }

        // Si no hay cache, mostrar loading y cargar desde BD
        console.log('UsuarioForm: Cargando roles desde BD');
        setRolesLoading(true);
        const roles = await obtenerRolesParaSelect();
        setRolesDisponibles(roles);
      } catch (error) {
        console.error('Error cargando roles:', error);
        // Ya tenemos ROLES_DEFAULT como fallback
        setRolesDisponibles(ROLES_DEFAULT);
      } finally {
        setRolesLoading(false);
      }
    };

    cargarRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('🚀 handleSubmit llamado con formData:', formData);

    console.log('🔍 Validando formulario:', {
      full_name: formData.full_name,
      email: formData.email,
      roles: formData.roles,
      rolesLength: formData.roles.length
    });
    
    if (!formData.full_name || !formData.email || formData.roles.length === 0) {
      console.log('❌ Validación fallida - campos faltantes');
      setError('Todos los campos son obligatorios y debe seleccionar al menos un rol');
      return;
    }

    // Mapear valores de vuelta a UUIDs para guardar
    const rolesParaGuardar = mapearValoresaRolesUUID(formData.roles);
    console.log('💾 Roles para guardar (UUIDs):', rolesParaGuardar);
    
    const datosParaGuardar = {
      ...formData,
      roles: rolesParaGuardar
    };

    setSubmitting(true);

    try {
      if (isEditing) {
        // Modo edición
        console.log('Editando usuario:', datosParaGuardar);
        
        let finalAvatarUrl = currentAvatarUrl; // Por defecto mantener el avatar actual
        
        // Si hay un nuevo archivo de avatar, subirlo primero
        if (avatarFile && usuario?.id) {
          console.log('Subiendo nuevo avatar...');
          try {
            const fileReader = new FileReader();
            const avatarBase64 = await new Promise<string>((resolve, reject) => {
              fileReader.onload = () => resolve(fileReader.result as string);
              fileReader.onerror = () => reject('Error leyendo archivo');
              fileReader.readAsDataURL(avatarFile);
            });

            const avatarResponse = await fetch('/api/actualizar-avatar', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                avatarBase64,
                userId: usuario.id
              }),
            });

            const avatarResult = await avatarResponse.json();
            
            if (!avatarResponse.ok) {
              throw new Error(avatarResult.error || 'Error subiendo avatar');
            }

            finalAvatarUrl = avatarResult.avatarUrl;
            console.log('Avatar subido exitosamente:', finalAvatarUrl);
          } catch (avatarError) {
            console.error('Error subiendo avatar:', avatarError);
            // Continuar con la actualización del perfil sin el avatar
            showWarning(
              'Avatar no actualizado',
              'Error subiendo avatar, pero se guardaron los otros cambios'
            );
          }
        }
        
        const dataWithAvatar = {
          ...formData,
          avatar_url: finalAvatarUrl
        };
        
        // Mostrar toast de éxito para edición
        showSuccess(
          'Usuario actualizado',
          `Los datos de ${formData.full_name} han sido actualizados correctamente`
        );
        
        // Esperar un poco para que el usuario vea el toast antes de cerrar el modal
        setTimeout(() => {
          onSubmit(dataWithAvatar);
        }, 1500);
      } else {
        // Modo creación - llamar API
        console.log('Creando usuario:', formData);
        
        // Convertir avatar a base64 si hay archivo
        let avatarBase64 = '';
        if (avatarFile) {
          const fileReader = new FileReader();
          avatarBase64 = await new Promise<string>((resolve, reject) => {
            fileReader.onload = () => resolve(fileReader.result as string);
            fileReader.onerror = () => reject('Error leyendo archivo');
            fileReader.readAsDataURL(avatarFile);
          });
        }
        
        const response = await fetch('/api/crear-usuario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: formData.full_name,
            email: formData.email,
            roles: formData.roles,
            avatarBase64: avatarBase64
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Error desconocido');
        }

        console.log('Usuario creado exitosamente:', result);
        
        // Mostrar toast de éxito
        showSuccess(
          'Usuario creado exitosamente',
          `El usuario ${formData.full_name} ha sido agregado al sistema`
        );
        
        // Limpiar formulario solo en modo creación
        setFormData({
          full_name: '',
          email: '',
          roles: []
        });
        setAvatarFile(null);
        
        // Esperar un poco para que el usuario vea el toast antes de cerrar el modal
        setTimeout(() => {
          console.log('📞 Llamando onSubmit para recargar tabla...');
          onSubmit();
          console.log('📞 onSubmit ejecutado');
        }, 1500); // 1.5 segundos para ver el toast
      }
      
    } catch (error) {
      console.error(`Error ${isEditing ? 'editando' : 'creando'} usuario:`, error);
      const errorMessage = error instanceof Error ? error.message : `Error inesperado al ${isEditing ? 'editar' : 'crear'} usuario`;
      
      // Mostrar toast de error
      showError(
        `Error al ${isEditing ? 'actualizar' : 'crear'} usuario`,
        errorMessage
      );
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Usuario, value: any) => {
    console.log('📝 handleInputChange:', field, value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('📊 Nuevo formData:', newData);
      return newData;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
  };

  function getInitials(nombre: string, email: string) {
    if (nombre) {
      return nombre.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  }



  return (
    <div className="p-6 space-y-6">

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="text-center">
          <Typography variant="body2" weight="medium" className="mb-3">
            Foto de perfil (opcional)
          </Typography>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground border-2 border-border">
                {avatarFile ? (
                  <img 
                    src={URL.createObjectURL(avatarFile)} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : currentAvatarUrl ? (
                  <img 
                    src={currentAvatarUrl} 
                    alt="Avatar actual" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  getInitials(formData.full_name, formData.email)
                )}
              </div>
              {(avatarFile || currentAvatarUrl) && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarFile(null);
                    if (isEditing) {
                      setCurrentAvatarUrl(null); // En edición, permitir eliminar avatar existente
                    }
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200"
                  title="Eliminar avatar"
                >
                  ×
                </button>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="avatar-upload"
              />
              <Button 
                variant="secondary" 
                size="sm" 
                type="button"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                Seleccionar imagen
              </Button>
              {avatarFile && (
                <Typography variant="caption" color="secondary">
                  {avatarFile.name}
                </Typography>
              )}
            </div>
          </div>
        </div>

        {/* Nombre completo */}
        <Input
          label="Nombre completo"
          value={formData.full_name}
          onChange={(e) => handleInputChange('full_name', e.target.value)}
          placeholder="Ingresa el nombre completo"
          required
          disabled={submitting}
          fullWidth
        />

        {/* Email */}
        <Input
          label="Correo electrónico"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="correo@ejemplo.com"
          required
          disabled={submitting}
          fullWidth
        />

        {/* Roles */}
        <MultiSelect
          label="Roles"
          placeholder={rolesLoading ? "Cargando roles..." : "Selecciona uno o más roles"}
          options={rolesDisponibles}
          value={formData.roles}
          onChange={(selectedRoles) => handleInputChange('roles', selectedRoles)}
          required
          disabled={rolesLoading || submitting}
        />


        {/* Error */}
        {error && (
          <div className="p-4 bg-destructive-hover border border-destructive rounded-lg">
            <Typography variant="body2" color="danger">
              {error}
            </Typography>
          </div>
        )}

        {/* Botones - solo mostrar si no están ocultos */}
        {!hideButtons && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              disabled={submitting || rolesLoading || !formData.full_name || !formData.email || formData.roles.length === 0}
              onClick={() => console.log('🔘 Botón submit clickeado - rolesLoading:', rolesLoading, 'submitting:', submitting, 'roles:', formData.roles.length)}
            >
              {submitting 
                ? (isEditing ? 'Guardando...' : 'Creando...') 
                : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')
              }
            </Button>
          </div>
        )}
      </form>
    </div>
  );
} 