import React, { useState, useRef, useEffect } from 'react';
import SideModal from '../ui/SideModal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useToast } from '../../contexts/ToastContext';

interface Usuario {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

interface PerfilPersonalModalProps {
  usuario: Usuario | null;
  isOpen: boolean;
  onSave: (data: any) => void;
  onClose: () => void;
}

const PerfilPersonalModal: React.FC<PerfilPersonalModalProps> = ({
  usuario,
  isOpen,
  onSave,
  onClose
}) => {
  const { showSuccess, showError, showWarning } = useToast();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen && usuario) {
      console.log('Cargando datos del usuario en perfil personal:', usuario);
      setFormData({
        full_name: usuario.full_name || '',
        email: usuario.email || '',
      });
      setCurrentAvatarUrl(usuario.avatar_url || null);
      setAvatarPreview(null);
      setAvatarFile(null);
      setError('');
    }
  }, [isOpen, usuario]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!formData.full_name || !formData.email) {
      showError('Campos requeridos', 'Todos los campos son obligatorios');
      setError('Todos los campos son obligatorios');
      return;
    }

    setSubmitting(true);

    try {
      let finalAvatarUrl = currentAvatarUrl;

      // Si hay un nuevo archivo de avatar, subirlo primero
      if (avatarFile && usuario?.id) {
        console.log('Subiendo nuevo avatar...');
        try {
          const fileReader = new FileReader();
          const avatarBase64 = await new Promise<string>((resolve) => {
            fileReader.onload = () => resolve(fileReader.result as string);
            fileReader.readAsDataURL(avatarFile);
          });

          const response = await fetch('/api/actualizar-avatar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: usuario.id,
              avatarBase64: avatarBase64
            }),
          });

          if (response.ok) {
            const result = await response.json();
            finalAvatarUrl = result.avatarUrl;
            console.log('Avatar actualizado:', finalAvatarUrl);
          } else {
            console.error('Error subiendo avatar');
            showWarning('Avatar no actualizado', 'Hubo un problema al subir la nueva imagen de perfil');
          }
        } catch (avatarError) {
          console.error('Error procesando avatar:', avatarError);
          showWarning('Avatar no actualizado', 'Error procesando la imagen de perfil');
        }
      }

      // Preparar datos para guardar
      const dataToSave = {
        ...formData,
        avatar_url: finalAvatarUrl
      };

      console.log('Guardando perfil personal:', dataToSave);
      await onSave(dataToSave);
      
      // Mostrar toast de éxito
      showSuccess(
        'Perfil actualizado',
        `Tu perfil ha sido actualizado correctamente`
      );
      
      // Esperar un poco para que el usuario vea el toast antes de cerrar el modal
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error guardando perfil:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Mostrar toast de error
      showError(
        'Error al actualizar perfil',
        errorMessage
      );
      
      setError('Error guardando el perfil: ' + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const currentAvatar = avatarPreview || currentAvatarUrl;

  return (
    <SideModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Editar Perfil Personal"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            loading={submitting}
          >
            Guardar Cambios
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive-hover border border-destructive rounded-lg">
            <p className="text-error-600 dark:text-error-400 text-sm">{error}</p>
          </div>
        )}

        {/* Avatar */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Foto de Perfil
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {currentAvatar ? (
                <img 
                  src={currentAvatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl text-muted-foreground">
                  {formData.full_name.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAvatarSelect}
            >
              Seleccionar imagen
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Nombre completo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Nombre Completo *
          </label>
          <Input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Ingresa tu nombre completo"
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Correo Electrónico *
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Ingresa tu correo electrónico"
            required
          />
        </div>
      </div>
    </SideModal>
  );
};

export default PerfilPersonalModal; 