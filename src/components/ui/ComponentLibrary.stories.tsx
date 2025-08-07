import type { Meta, StoryObj } from '@storybook/react';

const ComponentLibrary = () => {
  const components = [
    // UI Components
    { name: 'Button', category: 'UI', description: 'Botón con variantes', status: '✅' },
    { name: 'Input', category: 'UI', description: 'Campo de entrada', status: '✅' },
    { name: 'Select', category: 'UI', description: 'Selector desplegable', status: '🔄' },
    { name: 'Textarea', category: 'UI', description: 'Área de texto', status: '🔄' },
    { name: 'Card', category: 'UI', description: 'Tarjeta contenedora', status: '✅' },
    { name: 'Modal', category: 'UI', description: 'Ventana modal', status: '✅' },
    { name: 'Toast', category: 'UI', description: 'Notificación toast', status: '🔄' },
    { name: 'Badge', category: 'UI', description: 'Etiqueta pequeña', status: '🔄' },
    { name: 'Chip', category: 'UI', description: 'Chip seleccionable', status: '🔄' },
    { name: 'ProgressBar', category: 'UI', description: 'Barra de progreso', status: '🔄' },
    { name: 'Tooltip', category: 'UI', description: 'Información emergente', status: '🔄' },
    { name: 'DataTable', category: 'UI', description: 'Tabla de datos', status: '🔄' },
    { name: 'UserAvatar', category: 'UI', description: 'Avatar de usuario', status: '🔄' },
    { name: 'UserSelector', category: 'UI', description: 'Selector de usuario', status: '🔄' },
    { name: 'FilterBar', category: 'UI', description: 'Barra de filtros', status: '🔄' },
    { name: 'ActionsMenu', category: 'UI', description: 'Menú de acciones', status: '🔄' },
    { name: 'NavigationItem', category: 'UI', description: 'Elemento de navegación', status: '🔄' },
    { name: 'Sidebar', category: 'UI', description: 'Barra lateral', status: '🔄' },
    { name: 'TopNavigation', category: 'UI', description: 'Navegación superior', status: '🔄' },
    { name: 'MobileNavigation', category: 'UI', description: 'Navegación móvil', status: '🔄' },
    { name: 'Layout', category: 'UI', description: 'Layout principal', status: '🔄' },
    { name: 'Typography', category: 'UI', description: 'Tipografía', status: '🔄' },
    { name: 'EmptyState', category: 'UI', description: 'Estado vacío', status: '🔄' },
    { name: 'MultiSelect', category: 'UI', description: 'Selección múltiple', status: '🔄' },
    { name: 'DatePicker', category: 'UI', description: 'Selector de fecha', status: '🔄' },
    { name: 'Slider', category: 'UI', description: 'Control deslizante', status: '🔄' },
    { name: 'Tabs', category: 'UI', description: 'Pestañas', status: '🔄' },
    { name: 'ConfirmModal', category: 'UI', description: 'Modal de confirmación', status: '🔄' },
    { name: 'InlineEdit', category: 'UI', description: 'Edición en línea', status: '🔄' },
    { name: 'MetricCard', category: 'UI', description: 'Tarjeta de métricas', status: '🔄' },
    { name: 'DonutChart', category: 'UI', description: 'Gráfico de dona', status: '🔄' },
    { name: 'GroupedActions', category: 'UI', description: 'Acciones agrupadas', status: '🔄' },
    { name: 'FilterDrawer', category: 'UI', description: 'Cajón de filtros', status: '🔄' },
    { name: 'UserMenu', category: 'UI', description: 'Menú de usuario', status: '🔄' },
    { name: 'RolSelector', category: 'UI', description: 'Selector de rol', status: '🔄' },
    { name: 'DepartamentoSelector', category: 'UI', description: 'Selector de departamento', status: '🔄' },
    { name: 'DepartamentoSelect', category: 'UI', description: 'Select de departamento', status: '🔄' },
    { name: 'LinkModal', category: 'UI', description: 'Modal de enlaces', status: '🔄' },
    { name: 'SideModal', category: 'UI', description: 'Modal lateral', status: '🔄' },
    { name: 'SeguimientoSideModal', category: 'UI', description: 'Modal de seguimiento', status: '��' },
    
    // Specialized Components
    { name: 'AgregarParticipanteModal', category: 'Specialized', description: 'Modal para agregar participante', status: '🔄' },
    { name: 'CrearParticipanteFriendFamilyModal', category: 'Specialized', description: 'Modal para crear participante familiar', status: '🔄' },
    { name: 'CrearParticipanteExternoModal', category: 'Specialized', description: 'Modal para crear participante externo', status: '��' },
    { name: 'CrearParticipanteInternoModal', category: 'Specialized', description: 'Modal para crear participante interno', status: '🔄' },
    { name: 'CrearReclutamientoModal', category: 'Specialized', description: 'Modal para crear reclutamiento', status: '🔄' },
    { name: 'ConvertirSeguimientoModal', category: 'Specialized', description: 'Modal para convertir seguimiento', status: '🔄' },
    { name: 'EditarReclutamientoModal', category: 'Specialized', description: 'Modal para editar reclutamiento', status: '🔄' },
    { name: 'AsignarAgendamientoModal', category: 'Specialized', description: 'Modal para asignar agendamiento', status: '🔄' },
    { name: 'SeguimientoModal', category: 'Specialized', description: 'Modal de seguimiento', status: '🔄' },
    { name: 'InlineUserSelect', category: 'Specialized', description: 'Selector de usuario en línea', status: '🔄' },
    { name: 'EditarResponsableAgendamientoModal', category: 'Specialized', description: 'Modal para editar responsable', status: '🔄' },
    { name: 'ToastContainer', category: 'Specialized', description: 'Contenedor de toasts', status: '🔄' },
    { name: 'SimpleAvatar', category: 'Specialized', description: 'Avatar simple', status: '🔄' },
    { name: 'UserSelectorWithAvatar', category: 'Specialized', description: 'Selector con avatar', status: '🔄' },
  ];

  const uiComponents = components.filter(c => c.category === 'UI');
  const specializedComponents = components.filter(c => c.category === 'Specialized');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">🧩 Biblioteca de Componentes</h1>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="p-6 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{components.length}</div>
          <div className="text-gray-600">Componentes Totales</div>
        </div>
        <div className="p-6 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">{uiComponents.length}</div>
          <div className="text-gray-600">Componentes de UI</div>
        </div>
        <div className="p-6 bg-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">{specializedComponents.length}</div>
          <div className="text-gray-600">Componentes Especializados</div>
        </div>
        <div className="p-6 bg-orange-50 rounded-lg">
          <div className="text-3xl font-bold text-orange-600">{components.filter(c => c.status === '✅').length}</div>
          <div className="text-gray-600">Con Stories</div>
        </div>
      </div>

      {/* Componentes de UI */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">🎨 Componentes de UI</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {uiComponents.map((component, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{component.name}</h3>
                <span className="text-2xl">{component.status}</span>
              </div>
              <p className="text-gray-600 text-sm">{component.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Componentes Especializados */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">🔧 Componentes Especializados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {specializedComponents.map((component, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{component.name}</h3>
                <span className="text-2xl">{component.status}</span>
              </div>
              <p className="text-gray-600 text-sm">{component.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leyenda */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">📋 Leyenda</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <span className="text-2xl mr-2">✅</span>
            <span>Con stories implementados</span>
          </div>
          <div className="flex items-center">
            <span className="text-2xl mr-2">🔄</span>
            <span>Pendiente de implementar</span>
          </div>
          <div className="flex items-center">
            <span className="text-2xl mr-2">📝</span>
            <span>Necesita documentación</span>
          </div>
        </div>
      </section>
    </div>
  );
};

const meta: Meta<typeof ComponentLibrary> = {
  title: 'Design System/Component Library',
  component: ComponentLibrary,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const UIComponents: Story = {
  render: () => (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">🎨 Componentes de UI</h2>
      <p className="text-gray-600 mb-4">
        Estos son los componentes básicos de interfaz que forman la base del sistema de diseño.
      </p>
    </div>
  ),
};

export const SpecializedComponents: Story = {
  render: () => (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">🔧 Componentes Especializados</h2>
      <p className="text-gray-600 mb-4">
        Estos componentes están diseñados específicamente para las funcionalidades de la plataforma Central de Creadores.
      </p>
    </div>
  ),
};
