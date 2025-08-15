import React from 'react';
import { Typography, Card } from '../ui';
import * as Icons from '../icons';

const IconsSection: React.FC = () => {
  // Obtener todos los iconos disponibles
  const iconNames = Object.keys(Icons).filter(key => 
    key.endsWith('Icon') && typeof Icons[key as keyof typeof Icons] === 'function'
  );

  const iconCategories = {
    'Navegación': [
      'ArrowLeftIcon', 'ArrowRightIcon', 'ArrowUpIcon', 'ArrowDownIcon',
      'ChevronDownIcon', 'ChevronRightIcon', 'ChevronLeftIcon'
    ],
    'Acciones': [
      'PlusIcon', 'MinusIcon', 'EditIcon', 'DeleteIcon', 'TrashIcon', 
      'CopyIcon', 'SaveIcon', 'CloseIcon', 'XIcon', 'CheckIcon', 'CheckmarkIcon'
    ],
    'Usuarios y Roles': [
      'UserIcon', 'UsersIcon', 'AdminIcon', 'AdministradorIcon', 
      'InvestigadorIcon', 'ReclutadorIcon'
    ],
    'Estado y Notificaciones': [
      'CheckCircleIcon', 'AlertTriangleIcon', 'WarningIcon', 'ErrorIcon',
      'InfoIcon', 'AlertCircleIcon', 'SuccessIcon', 'BellIcon'
    ],
    'Navegación UI': [
      'HomeIcon', 'SettingsIcon', 'MenuIcon', 'SearchIcon', 'FilterIcon',
      'DashboardIcon', 'ConfiguracionesIcon'
    ],
    'Comunicación': [
      'MessageIcon', 'PhoneIcon', 'EmailIcon', 'ShareIcon', 'NetworkIcon'
    ],
    'Datos y Análisis': [
      'DatabaseIcon', 'ChartIcon', 'BarChartIcon', 'MetricasIcon',
      'ClipboardListIcon'
    ],
    'Archivos y Documentos': [
      'FileIcon', 'FileTextIcon', 'DocumentIcon', 'FolderIcon',
      'DownloadIcon', 'UploadIcon', 'LinkIcon'
    ],
    'Tiempo y Fechas': [
      'TimeIcon', 'ClockIcon', 'CalendarIcon', 'CalendarDaysIcon',
      'SesionesIcon'
    ],
    'Seguridad y Permisos': [
      'ShieldIcon', 'LockIcon', 'UnlockIcon', 'PasswordIcon',
      'EyeIcon', 'EyeOffIcon'
    ],
    'Módulos del Sistema': [
      'InvestigacionesIcon', 'ReclutamientoIcon', 'ParticipantesIcon',
      'EmpresasIcon', 'ConocimientoIcon', 'UsuariosIcon'
    ],
    'Herramientas y Configuración': [
      'ToolIcon', 'RefreshIcon', 'MoreVerticalIcon', 'SortIcon',
      'SortAscIcon', 'SortDescIcon'
    ],
    'Tema y Diseño': [
      'SunIcon', 'MoonIcon', 'PaletteIcon', 'TypeIcon', 'BoxIcon',
      'GridIcon', 'DesignSystemIcon', 'ElevationIcon'
    ],
    'Otros': iconNames.filter(name => 
      ![
        'ArrowLeftIcon', 'ArrowRightIcon', 'ArrowUpIcon', 'ArrowDownIcon',
        'ChevronDownIcon', 'ChevronRightIcon', 'ChevronLeftIcon',
        'PlusIcon', 'MinusIcon', 'EditIcon', 'DeleteIcon', 'TrashIcon', 
        'CopyIcon', 'SaveIcon', 'CloseIcon', 'XIcon', 'CheckIcon', 'CheckmarkIcon',
        'UserIcon', 'UsersIcon', 'AdminIcon', 'AdministradorIcon', 
        'InvestigadorIcon', 'ReclutadorIcon',
        'CheckCircleIcon', 'AlertTriangleIcon', 'WarningIcon', 'ErrorIcon',
        'InfoIcon', 'AlertCircleIcon', 'SuccessIcon', 'BellIcon',
        'HomeIcon', 'SettingsIcon', 'MenuIcon', 'SearchIcon', 'FilterIcon',
        'DashboardIcon', 'ConfiguracionesIcon',
        'MessageIcon', 'PhoneIcon', 'EmailIcon', 'ShareIcon', 'NetworkIcon',
        'DatabaseIcon', 'ChartIcon', 'BarChartIcon', 'MetricasIcon',
        'ClipboardListIcon',
        'FileIcon', 'FileTextIcon', 'DocumentIcon', 'FolderIcon',
        'DownloadIcon', 'UploadIcon', 'LinkIcon',
        'TimeIcon', 'ClockIcon', 'CalendarIcon', 'CalendarDaysIcon',
        'SesionesIcon',
        'ShieldIcon', 'LockIcon', 'UnlockIcon', 'PasswordIcon',
        'EyeIcon', 'EyeOffIcon',
        'InvestigacionesIcon', 'ReclutamientoIcon', 'ParticipantesIcon',
        'EmpresasIcon', 'ConocimientoIcon', 'UsuariosIcon',
        'ToolIcon', 'RefreshIcon', 'MoreVerticalIcon', 'SortIcon',
        'SortAscIcon', 'SortDescIcon',
        'SunIcon', 'MoonIcon', 'PaletteIcon', 'TypeIcon', 'BoxIcon',
        'GridIcon', 'DesignSystemIcon', 'ElevationIcon'
      ].includes(name)
    )
  };

  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h2" weight="bold" className="mb-2">
          Iconografía
        </Typography>
        <Typography variant="body1" color="secondary">
          Biblioteca completa de iconos SVG del sistema de diseño ({iconNames.length} iconos disponibles)
        </Typography>
      </div>

      {Object.entries(iconCategories).map(([category, iconList]) => (
        <Card key={category} className="p-6">
          <Typography variant="h3" weight="semibold" className="mb-4">
            {category} ({iconList.length})
          </Typography>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {iconList.map((iconName) => {
              const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
              if (!IconComponent) return null;
              
              return (
                <div key={iconName} className="flex flex-col items-center p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                  <IconComponent className="w-6 h-6 mb-2" />
                  <Typography variant="caption" className="text-center text-xs">
                    {iconName.replace('Icon', '')}
                  </Typography>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {/* Tamaños de Iconos */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Tamaños de Iconos
        </Typography>
        
        <div className="space-y-4">
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Escala de Tamaños
            </Typography>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-4 h-4" />
                <Typography variant="caption">xs (16px)</Typography>
              </div>
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-5 h-5" />
                <Typography variant="caption">sm (20px)</Typography>
              </div>
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-6 h-6" />
                <Typography variant="caption">md (24px)</Typography>
              </div>
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-8 h-8" />
                <Typography variant="caption">lg (32px)</Typography>
              </div>
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-10 h-10" />
                <Typography variant="caption">xl (40px)</Typography>
              </div>
            </div>
          </div>
          
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Colores de Iconos
            </Typography>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-6 h-6 text-primary" />
                <Typography variant="caption">Primary</Typography>
              </div>
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-6 h-6 text-secondary" />
                <Typography variant="caption">Secondary</Typography>
              </div>
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-6 h-6 text-success" />
                <Typography variant="caption">Success</Typography>
              </div>
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-6 h-6 text-warning" />
                <Typography variant="caption">Warning</Typography>
              </div>
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-6 h-6 text-destructive" />
                <Typography variant="caption">Destructive</Typography>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Guía de Uso */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Guía de Uso
        </Typography>
        
        <div className="space-y-4">
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Importación
            </Typography>
            <div className="bg-gray-100 p-3 rounded-lg">
              <Typography variant="code" className="text-sm">
                import {'{'} UserIcon, SettingsIcon {'}'} from '../components/icons';
              </Typography>
            </div>
          </div>
          
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Uso Básico
            </Typography>
            <div className="bg-gray-100 p-3 rounded-lg">
              <Typography variant="code" className="text-sm">
                {'<'}UserIcon className="w-6 h-6" /{'>'}
              </Typography>
            </div>
          </div>
          
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Con Colores
            </Typography>
            <div className="bg-gray-100 p-3 rounded-lg">
              <Typography variant="code" className="text-sm">
                {'<'}SettingsIcon className="w-6 h-6 text-primary" /{'>'}
              </Typography>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IconsSection;
