import React, { useState, useRef, useCallback } from 'react';
import { Typography, Card } from './index';
import { 
  UploadIcon, 
  FileIcon, 
  ImageIcon, 
  DocumentIcon,
  XIcon,
  CheckCircleIcon,
  AlertTriangleIcon
} from '../icons';

export interface DragDropFile {
  id: string;
  file: File;
  preview?: string;
  status: 'uploading' | 'success' | 'error' | 'pending';
  progress?: number;
  error?: string;
}

export interface DragDropZoneProps {
  /** Tipos de archivos aceptados */
  accept?: string[];
  /** Tamaño máximo de archivo en bytes */
  maxSize?: number;
  /** Número máximo de archivos */
  maxFiles?: number;
  /** Archivos actuales */
  files?: DragDropFile[];
  /** Callback cuando se agregan archivos */
  onFilesAdded?: (files: DragDropFile[]) => void;
  /** Callback cuando se elimina un archivo */
  onFileRemoved?: (fileId: string) => void;
  /** Callback cuando se hace click en un archivo */
  onFileClick?: (file: DragDropFile) => void;
  /** Texto personalizado para el área de drop */
  dropText?: string;
  /** Texto personalizado para el área de drag */
  dragText?: string;
  /** Mostrar preview de imágenes */
  showImagePreview?: boolean;
  /** Variante del componente */
  variant?: 'default' | 'compact' | 'detailed';
  /** Estado de carga */
  loading?: boolean;
  /** Mensaje de error */
  error?: string;
  /** Clases CSS adicionales */
  className?: string;
}

const DragDropZone: React.FC<DragDropZoneProps> = ({
  accept = ['*/*'],
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  files = [],
  onFilesAdded,
  onFileRemoved,
  onFileClick,
  dropText = "Suelta archivos aquí o haz clic para seleccionar",
  dragText = "Suelta los archivos aquí",
  showImagePreview = true,
  variant = 'default',
  loading = false,
  error,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const validateFile = (file: File): string | null => {
    // Validar tipo de archivo
    if (accept.length > 0 && accept[0] !== '*/*') {
      const isValidType = accept.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });
      
      if (!isValidType) {
        return `Tipo de archivo no permitido. Tipos aceptados: ${accept.join(', ')}`;
      }
    }

    // Validar tamaño
    if (file.size > maxSize) {
      return `Archivo demasiado grande. Tamaño máximo: ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }

    return null;
  };

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!showImagePreview || !file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const processFiles = useCallback(async (fileList: FileList) => {
    const newFiles: DragDropFile[] = [];
    const validFiles: File[] = [];

    // Validar archivos
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const error = validateFile(file);
      
      if (error) {
        newFiles.push({
          id: generateFileId(),
          file,
          status: 'error',
          error
        });
      } else {
        validFiles.push(file);
      }
    }

    // Verificar límite de archivos
    if (files.length + validFiles.length > maxFiles) {
      const remainingSlots = maxFiles - files.length;
      const filesToAdd = validFiles.slice(0, remainingSlots);
      const filesToReject = validFiles.slice(remainingSlots);
      
      filesToReject.forEach(file => {
        newFiles.push({
          id: generateFileId(),
          file,
          status: 'error',
          error: `Límite de archivos excedido. Máximo: ${maxFiles}`
        });
      });
      
      validFiles.splice(remainingSlots);
    }

    // Procesar archivos válidos
    for (const file of validFiles) {
      const preview = await createFilePreview(file);
      newFiles.push({
        id: generateFileId(),
        file,
        preview,
        status: 'pending'
      });
    }

    if (newFiles.length > 0 && onFilesAdded) {
      onFilesAdded(newFiles);
    }
  }, [accept, maxSize, maxFiles, files.length, showImagePreview, onFilesAdded]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 0) {
      setIsDragOver(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileClick = useCallback((file: DragDropFile) => {
    if (onFileClick) {
      onFileClick(file);
    }
  }, [onFileClick]);

  const handleFileRemove = useCallback((fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFileRemoved) {
      onFileRemoved(fileId);
    }
  }, [onFileRemoved]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type.startsWith('text/') || file.type.includes('document')) return DocumentIcon;
    return FileIcon;
  };

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: DragDropFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangleIcon className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  const baseClasses = `
    relative border-2 border-dashed rounded-lg transition-all duration-200 ease-in-out
    ${isDragOver 
      ? 'border-primary bg-primary/5 scale-105' 
      : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
    }
    ${error ? 'border-red-300 bg-red-50' : ''}
    ${loading ? 'opacity-50 pointer-events-none' : ''}
    ${className}
  `;

  const variantClasses = {
    default: 'p-8',
    compact: 'p-4',
    detailed: 'p-6'
  };

  return (
    <div className="space-y-4">
      {/* Área de Drop */}
      <div
        className={`${baseClasses} ${variantClasses[variant]} cursor-pointer`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className={`
              p-3 rounded-full
              ${isDragOver ? 'bg-primary/10' : 'bg-gray-100'}
              ${error ? 'bg-red-100' : ''}
            `}>
              <UploadIcon className={`
                w-8 h-8
                ${isDragOver ? 'text-primary' : 'text-gray-400'}
                ${error ? 'text-red-500' : ''}
              `} />
            </div>
          </div>
          
          <div>
            <Typography variant="body1" weight="medium" className="mb-1">
              {isDragOver ? dragText : dropText}
            </Typography>
            <Typography variant="caption" color="secondary">
              {accept[0] === '*/*' 
                ? 'Cualquier tipo de archivo' 
                : `Tipos aceptados: ${accept.join(', ')}`
              }
            </Typography>
          </div>
          
          {error && (
            <Typography variant="caption" color="error" className="block">
              {error}
            </Typography>
          )}
        </div>
      </div>

      {/* Lista de Archivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Typography variant="subtitle2" weight="medium">
            Archivos ({files.length}/{maxFiles})
          </Typography>
          
          <div className="grid gap-2">
            {files.map((file) => {
              const FileIconComponent = getFileIcon(file.file);
              
              return (
                <Card
                  key={file.id}
                  variant="outlined"
                  className={`
                    p-3 cursor-pointer transition-all duration-200
                    hover: hover:border-primary/30
                    ${file.status === 'error' ? 'border-red-200 bg-red-50' : ''}
                    ${file.status === 'success' ? 'border-green-200 bg-green-50' : ''}
                  `}
                  onClick={() => handleFileClick(file)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Icono o Preview */}
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.file.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                          <FileIconComponent className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      
                      {/* Información del archivo */}
                      <div className="flex-1 min-w-0">
                        <Typography variant="body2" weight="medium" className="truncate">
                          {file.file.name}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          {getFileSize(file.file.size)}
                        </Typography>
                      </div>
                      
                      {/* Estado */}
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(file.status)}
                        {file.status === 'uploading' && file.progress !== undefined && (
                          <Typography variant="caption" color="secondary">
                            {file.progress}%
                          </Typography>
                        )}
                      </div>
                    </div>
                    
                    {/* Botón de eliminar */}
                    <button
                      onClick={(e) => handleFileRemove(file.id, e)}
                      className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <XIcon className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                  
                  {/* Mensaje de error */}
                  {file.error && (
                    <Typography variant="caption" color="error" className="mt-2 block">
                      {file.error}
                    </Typography>
                  )}
                  
                  {/* Barra de progreso */}
                  {file.status === 'uploading' && file.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-primary h-1 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropZone;
