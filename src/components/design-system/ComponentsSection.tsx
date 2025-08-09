import React, { useState } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Chip, 
  Input, 
  Select, 
  Modal,
  SideModal,
  Tabs,
  ProgressBar,
  UserAvatar,
  SimpleAvatar,
  ActionsMenu
} from '../ui';
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  UserIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  EyeIcon,
  DownloadIcon
} from '../icons';

const ComponentsSection: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showSideModal, setShowSideModal] = useState(false);

  // Acciones de ejemplo para ActionsMenu
  const menuActions = [
    {
      label: 'Ver detalles',
      icon: <EyeIcon className="w-4 h-4" />,
      onClick: () => console.log('Ver detalles'),
      className: 'text-blue-600 hover:text-blue-700'
    },
    {
      label: 'Editar',
      icon: <EditIcon className="w-4 h-4" />,
      onClick: () => console.log('Editar'),
      className: 'text-green-600 hover:text-green-700'
    },
    {
      label: 'Descargar',
      icon: <DownloadIcon className="w-4 h-4" />,
      onClick: () => console.log('Descargar'),
      className: 'text-purple-600 hover:text-purple-700'
    },
    {
      label: 'Eliminar',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: () => console.log('Eliminar'),
      className: 'text-red-600 hover:text-red-700'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h2" weight="bold" className="mb-2">
          Componentes
        </Typography>
        <Typography variant="body1" color="secondary">
          Biblioteca de componentes reutilizables del sistema de diseño
        </Typography>
      </div>

      {/* Botones */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Botones
        </Typography>
        
        <div className="space-y-4">
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Variantes
            </Typography>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primario</Button>
              <Button variant="secondary">Secundario</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </div>
          
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Estados
            </Typography>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" loading>Guardando...</Button>
              <Button variant="secondary" disabled>Deshabilitado</Button>
            </div>
          </div>
          
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Tamaños
            </Typography>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Pequeño</Button>
              <Button size="md">Mediano</Button>
              <Button size="lg">Grande</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Chips */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Chips
        </Typography>
        
        <div className="space-y-4">
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Variantes
            </Typography>
            <div className="flex flex-wrap gap-2">
              <Chip variant="default">Default</Chip>
              <Chip variant="primary">Primario</Chip>
              <Chip variant="secondary">Secundario</Chip>
              <Chip variant="success">Éxito</Chip>
              <Chip variant="warning">Advertencia</Chip>
              <Chip variant="danger">Error</Chip>
              <Chip variant="info">Info</Chip>
            </div>
          </div>
          
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Tamaños
            </Typography>
            <div className="flex flex-wrap gap-2">
              <Chip size="sm">Pequeño</Chip>
              <Chip size="md">Mediano</Chip>
              <Chip size="lg">Grande</Chip>
            </div>
          </div>
        </div>
      </Card>

      {/* Formularios */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Formularios
        </Typography>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Campo de texto"
              placeholder="Escribe algo..."
              fullWidth
            />
            
            <Select
              label="Selector"
              placeholder="Selecciona una opción"
              options={[
                { value: '1', label: 'Opción 1' },
                { value: '2', label: 'Opción 2' },
                { value: '3', label: 'Opción 3' },
              ]}
              fullWidth
            />
          </div>
        </div>
      </Card>

      {/* Avatares */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Avatares
        </Typography>
        
        <div className="space-y-4">
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Tipos
            </Typography>
            <div className="flex flex-wrap gap-4">
              <div className="text-center">
                <UserAvatar
                  user={{
                    id: '1',
                    full_name: 'Juan Pérez',
                    email: 'juan@ejemplo.com',
                    avatar_url: null
                  }}
                  size="lg"
                />
                <Typography variant="caption" className="mt-1">Usuario con avatar</Typography>
              </div>
              
              <div className="text-center">
                <SimpleAvatar
                  name="María García"
                  size="lg"
                />
                <Typography variant="caption" className="mt-1">Usuario sin avatar</Typography>
              </div>
              
              <div className="text-center">
                <UserAvatar
                  user={{
                    id: '1',
                    full_name: 'Ana López',
                    email: 'ana@ejemplo.com',
                    avatar_url: null
                  }}
                  size="md"
                />
                <Typography variant="caption" className="mt-1">Tamaño mediano</Typography>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Progreso */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Barras de Progreso
        </Typography>
        
        <div className="space-y-4">
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Estados
            </Typography>
            <div className="space-y-2">
              <ProgressBar value={25} max={100} />
              <ProgressBar value={50} max={100} />
              <ProgressBar value={75} max={100} />
              <ProgressBar value={100} max={100} />
            </div>
          </div>
        </div>
      </Card>

      {/* Modales */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Modales
        </Typography>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowModal(true)}>
            Abrir Modal
          </Button>
          <Button onClick={() => setShowSideModal(true)}>
            Abrir Side Modal
          </Button>
        </div>

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Ejemplo de Modal"
          size="md"
        >
          <Typography variant="body1">
            Este es un ejemplo de modal del sistema de diseño.
          </Typography>
        </Modal>

        {/* Side Modal */}
        <SideModal
          isOpen={showSideModal}
          onClose={() => setShowSideModal(false)}
          title="Ejemplo de Side Modal"
          width="lg"
        >
          <Typography variant="body1">
            Este es un ejemplo de side modal del sistema de diseño.
          </Typography>
        </SideModal>
      </Card>

      {/* Tabs */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Pestañas
        </Typography>
        
        <Tabs
          value="tab1"
          onChange={() => {}}
          items={[
            { value: 'tab1', label: 'Pestaña 1' },
            { value: 'tab2', label: 'Pestaña 2' },
            { value: 'tab3', label: 'Pestaña 3' },
          ]}
        />
      </Card>
    </div>
  );
};

export default ComponentsSection;
