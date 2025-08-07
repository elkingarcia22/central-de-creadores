import type { Meta, StoryObj } from '@storybook/react';

const AllComponents = () => {
  const uiComponents = [
    'Button', 'Input', 'Select', 'Textarea', 'Card', 'Modal', 'Toast', 'Badge', 'Chip',
    'ProgressBar', 'Tooltip', 'DataTable', 'UserAvatar', 'UserSelector', 'FilterBar',
    'ActionsMenu', 'NavigationItem', 'Sidebar', 'TopNavigation', 'MobileNavigation',
    'Layout', 'Typography', 'EmptyState', 'MultiSelect', 'DatePicker', 'Slider',
    'Tabs', 'ConfirmModal', 'InlineEdit', 'MetricCard', 'DonutChart', 'GroupedActions',
    'FilterDrawer', 'UserMenu', 'RolSelector', 'DepartamentoSelector', 'DepartamentoSelect',
    'LinkModal', 'SideModal', 'SeguimientoSideModal'
  ];

  const specializedComponents = [
    'AgregarParticipanteModal', 'CrearParticipanteFriendFamilyModal', 'CrearParticipanteExternoModal',
    'CrearParticipanteInternoModal', 'CrearReclutamientoModal', 'ConvertirSeguimientoModal',
    'EditarReclutamientoModal', 'AsignarAgendamientoModal', 'SeguimientoModal',
    'InlineUserSelect', 'EditarResponsableAgendamientoModal', 'ToastContainer',
    'SimpleAvatar', 'UserSelectorWithAvatar'
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">🏗️ Biblioteca de Componentes - Central de Creadores</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">📊 Estadísticas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{uiComponents.length + specializedComponents.length}</p>
            <p className="text-gray-600">Componentes Totales</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{uiComponents.length}</p>
            <p className="text-gray-600">Componentes de UI</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{specializedComponents.length}</p>
            <p className="text-gray-600">Componentes Especializados</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">🎨 Componentes de UI</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uiComponents.map((component, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-blue-600">{component}</h3>
              <p className="text-sm text-gray-600">Componente de interfaz</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">🔧 Componentes Especializados</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {specializedComponents.map((component, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-purple-600">{component}</h3>
              <p className="text-sm text-gray-600">Componente especializado</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">📋 Estado de Stories</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Nota:</span> Algunos componentes pueden necesitar stories adicionales. 
            Los stories básicos se generan automáticamente, pero se recomienda personalizar según las necesidades específicas.
          </p>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof AllComponents> = {
  title: 'Design System/All Components',
  component: AllComponents,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Resumen de Componentes</h1>
      <p className="text-gray-600 mb-4">
        La plataforma Central de Creadores cuenta con una biblioteca completa de componentes 
        que incluye elementos de UI básicos y componentes especializados para la gestión de 
        participantes, investigaciones y reclutamiento.
      </p>
    </div>
  ),
};
