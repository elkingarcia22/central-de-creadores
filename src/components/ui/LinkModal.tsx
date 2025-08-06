import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import Button from './Button';
import Input from './Input';
import Typography from './Typography';
import { useToast } from '../../contexts/ToastContext';
import { LinkIcon, TrashIcon, EditIcon, PlusIcon } from '../icons';

export interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentLink?: string | null;
  onSave: (link: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  placeholder?: string;
  description?: string;
  linkType: 'prueba' | 'resultados';
  initialMode?: 'view' | 'edit' | 'add';
}

const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  onClose,
  title,
  currentLink,
  onSave,
  onDelete,
  placeholder = 'https://ejemplo.com',
  description,
  linkType,
  initialMode = 'add'
}) => {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { showSuccess, showError } = useToast();

  // Determinar el modo: usar initialMode si se proporciona, sino la lógica anterior
  const hasExistingLink = currentLink && currentLink.trim() !== '';
  const mode = initialMode === 'edit' ? 'edit' 
    : initialMode === 'add' ? 'add'
    : hasExistingLink ? (isEditing ? 'edit' : 'view') 
    : 'add';

  useEffect(() => {
    if (isOpen) {
      setLink(currentLink || '');
      // Si el modo inicial es 'edit', activar edición inmediatamente
      setIsEditing(initialMode === 'edit');
    }
  }, [isOpen, currentLink, initialMode]);

  const handleSave = async () => {
    if (!link.trim()) {
      showError('El link no puede estar vacío');
      return;
    }

    // Validación básica de URL
    try {
      new URL(link);
    } catch {
      showError('Por favor ingresa una URL válida');
      return;
    }

    setLoading(true);
    try {
      await onSave(link.trim());
      showSuccess(`Link de ${linkType} ${hasExistingLink ? 'actualizado' : 'agregado'} correctamente`);
      onClose();
    } catch (error) {
      console.error('Error guardando link:', error);
      showError(`Error al ${hasExistingLink ? 'actualizar' : 'agregar'} el link`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setLoading(true);
    try {
      await onDelete();
      showSuccess(`Link de ${linkType} eliminado correctamente`);
      onClose();
    } catch (error) {
      console.error('Error eliminando link:', error);
      showError('Error al eliminar el link');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLink('');
    setIsEditing(false);
    onClose();
  };

  const getIcon = () => {
    if (linkType === 'prueba') {
      return <LinkIcon className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
    return <LinkIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
  };

  const getLinkColorClass = () => {
    return linkType === 'prueba' 
      ? 'text-green-600 dark:text-green-400 hover:underline'
      : 'text-purple-600 dark:text-purple-400 hover:underline';
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {getIcon()}
          <div>
            <Typography variant="h3">{title}</Typography>
            {description && (
              <Typography variant="body2" color="secondary" className="mt-1">
                {description}
              </Typography>
            )}
          </div>
        </div>

        {/* Contenido basado en el modo */}
        {mode === 'view' && (
          <div className="space-y-4">
            {/* Mostrar link actual */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Typography variant="body2" color="secondary" className="mb-2">
                Link actual:
              </Typography>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-gray-500" />
                <a
                  href={currentLink!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${getLinkColorClass()} truncate flex-1`}
                >
                  {currentLink}
                </a>
              </div>
            </div>

            {/* Acciones en modo vista */}
            <div className="flex items-center gap-2 pt-4">
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
                className="flex-1"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Editar Link
              </Button>
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  loading={loading}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {(mode === 'add' || mode === 'edit') && (
          <div className="space-y-4">
            {/* Formulario */}
            <Input
              label={`Link de ${linkType}`}
              placeholder={placeholder}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
              fullWidth
            />

            {/* Acciones en modo formulario */}
            <div className="flex items-center gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={mode === 'edit' ? () => setIsEditing(false) : handleClose}
                disabled={loading}
                className="flex-1"
              >
                {mode === 'edit' ? 'Cancelar' : 'Cancelar'}
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={loading}
                className="flex-1"
              >
                {mode === 'edit' ? (
                  <>
                    <EditIcon className="w-4 h-4 mr-2" />
                    Actualizar
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Agregar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LinkModal; 