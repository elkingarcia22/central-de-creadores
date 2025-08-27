import React, { useState } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Input, 
  Textarea, 
  Select, 
  Tabs, 
  Sidebar, 
  TopNavigation, 
  UserMenu, 
  MobileNavigation, 
  NavigationItem,
  Badge,
  Chip,
  ProgressBar,
  Toast,
  ToastContainer,
  Tooltip,
  DataTable,
  MetricCard,
  EmptyState,
  DonutChart,
  Modal,
  SideModal,
  ConfirmModal,
  LinkModal,
  SimpleAvatar,
  UserAvatar,
  RobustAvatar,
  UserSelector,
  ActionsMenu,
  GroupedActions,
  Slider,
  DatePicker,
  TimePicker,
  MultiSelect,
  Switch,
  DragDropZone,
  Calendar,
  KanbanBoard,
  Timeline,
  KanbanBoardTest,
  TimelineTest,
  KanbanBoardSimple,
  Alert,
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  Divider,
  List,
  Checkbox,
  CheckboxGroup,
  RadioButton,
  RadioGroup,
  Accordion,
  LineChart,
  BarChart,
  Counter,
  CounterGroup,
  PageHeader,
  FormContainer,
  FormItem,
  InfoContainer,
  InfoItem,
  Subtitle,
  ContainerTitle,
  FilterLabel,
  ParticipantCard
} from '../ui';
import MicroInteractionsDemo from './MicroInteractionsDemo';
import { 
  getEstadoReclutamientoVariant, 
  getEstadoReclutamientoText,
  getEstadoInvestigacionVariant, 
  getEstadoInvestigacionText 
} from '../../utils/estadoUtils';
import { 
  getRiesgoBadgeVariant, 
  getRiesgoText 
} from '../../utils/riesgoUtils';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  PlusIcon, 
  EditIcon, 
  TrashIcon,
  SaveIcon, 
  MenuIcon,
  InfoIcon,
  ConfiguracionesIcon,
  DashboardIcon,
  UsuariosIcon,
  InvestigacionesIcon,
  ReclutamientoIcon,
  SesionesIcon,
  MetricasIcon,
  ParticipantesIcon,
  EmpresasIcon,
  ConocimientoIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  XIcon,
  MoreVerticalIcon,
  ClockIcon,
  FileIcon,
  UserIcon,
  SettingsIcon,
  // Iconos para las categorías del menú
  PaletteIcon,
  TypeIcon,
  BoxIcon,
  GridIcon,
  BarChartIcon,
  DatabaseIcon,
  ChartIcon,
  FolderIcon,
  CalendarIcon,
  MessageIcon,
  BellIcon,
  ShieldIcon,
  ToolIcon,
  LayoutIcon,
  FormIcon,
  FeedbackIcon,
  DataIcon,
  OverlayIcon,
  InterfaceIcon
} from '../icons';

const ComponentsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  
  // Estados para los modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  
  // Estados para los side modales
  const [isSideModalOpen, setIsSideModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  
  // Estados para los confirm modales
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  
  // Estados para los link modales
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
  const [isReferencesModalOpen, setIsReferencesModalOpen] = useState(false);
  
  // Estados para el TimePicker
  const [timeValue, setTimeValue] = useState('06:46 PM');
  const [timeValue24h, setTimeValue24h] = useState('14:30');
  const [timeValueStep, setTimeValueStep] = useState('09:30 AM');

  const componentCategories = [
    {
      id: "buttons",
      name: "Buttons",
      icon: <PaletteIcon className="w-5 h-5" />,
      components: [
        { id: "button", name: "Button" }
      ]
    },
    {
      id: "navigation",
      name: "Navegación",
      icon: <MenuIcon className="w-5 h-5" />,
      components: [
        { id: "tabs", name: "Tabs" },
        { id: "sidebar", name: "Sidebar" },
        { id: "top-navigation", name: "Top Navigation" },
        { id: "mobile-navigation", name: "Mobile Navigation" },
        { id: "user-menu", name: "User Menu" },
        { id: "navigation-item", name: "Navigation Item" }
      ]
    },
    {
      id: "inputs",
      name: "Inputs",
      icon: <TypeIcon className="w-5 h-5" />,
      components: [
        { id: "text-input", name: "Text Input" },
        { id: "textarea", name: "Textarea" },
        { id: "select", name: "Select" },
        { id: "switch", name: "Switch" },
        { id: "checkbox", name: "Checkbox" },
        { id: "radio-button", name: "Radio Button" },
        { id: "date-picker", name: "Date Picker" },
        { id: "time-picker", name: "Time Picker" },
        { id: "multi-select", name: "Multi Select" }
      ]
    },
    {
      id: "feedback",
      name: "Feedback",
      icon: <FeedbackIcon className="w-5 h-5" />,
      components: [
        { id: "badge", name: "Badge" },
        { id: "chip", name: "Chip" },
        { id: "progress-bar", name: "Progress Bar" },
        { id: "toast", name: "Toast" },
        { id: "tooltip", name: "Tooltip" },
        { id: "alert", name: "Alert" },
        { id: "skeleton", name: "Skeleton" },
        { id: "divider", name: "Divider" }
      ]
    },
    {
      id: "data-display",
      name: "Data Display",
      icon: <DataIcon className="w-5 h-5" />,
      components: [
        { id: "card", name: "Card" },
        { id: "data-table", name: "Data Table" },
        { id: "metric-card", name: "Metric Card" },
        { id: "empty-state", name: "Empty State" },
        { id: "list", name: "List" },
        { id: "counter", name: "Counter" },
        { id: "participant-card", name: "Participant Card" }
      ]
    },
    {
      id: "charts",
      name: "Charts",
      icon: <BarChartIcon className="w-5 h-5" />,
      components: [
        { id: "donut-chart", name: "Donut Chart" },
        { id: "line-chart", name: "Line Chart" },
        { id: "bar-chart", name: "Bar Chart" }
      ]
    },
    {
      id: "navigation-2",
      name: "Navegación",
      icon: <MenuIcon className="w-5 h-5" />,
      components: [
        { id: "tabs", name: "Tabs" },
        { id: "sidebar", name: "Sidebar" },
        { id: "top-navigation", name: "Top Navigation" },
        { id: "mobile-navigation", name: "Mobile Navigation" },
        { id: "user-menu", name: "User Menu" },
        { id: "navigation-item", name: "Navigation Item" },
        { id: "accordion", name: "Accordion" }
      ]
    },
    {
      id: "data-management",
      name: "Gestión de Datos",
      icon: <DatabaseIcon className="w-5 h-5" />,
      components: [
        { id: "drag-drop-zone", name: "Drag & Drop Zone" },
        { id: "calendar", name: "Calendar" },
        { id: "kanban-board", name: "Kanban Board" },
        { id: "timeline", name: "Timeline" }
      ]
    },
    {
      id: "overlays",
      name: "Overlays",
      icon: <OverlayIcon className="w-5 h-5" />,
      components: [
        { id: "modal", name: "Modal" },
        { id: "side-modal", name: "Side Modal" },
        { id: "confirm-modal", name: "Confirm Modal" },
        { id: "link-modal", name: "Link Modal" }
      ]
    },
    {
      id: "user-interface",
      name: "User Interface",
      icon: <InterfaceIcon className="w-5 h-5" />,
      components: [
        { id: "avatar", name: "Avatar" },
        { id: "user-selector", name: "User Selector" },
        { id: "actions-menu", name: "Actions Menu" },
        { id: "grouped-actions", name: "Grouped Actions" },
        { id: "slider", name: "Slider" }
      ]
    },
    {
      id: "layout-forms",
      name: "Layout y Formularios",
      icon: <FormIcon className="w-5 h-5" />,
      components: [
        { id: "page-header", name: "Page Header" },
        { id: "form-container", name: "Form Container" },
        { id: "form-item", name: "Form Item" },
        { id: "info-container", name: "Info Container" },
        { id: "info-item", name: "Info Item" },
        { id: "subtitle", name: "Subtitle" },
        { id: "container-title", name: "Container Title" },
        { id: "filter-label", name: "Filter Label" }
      ]
    },

  ];

  const renderButtonComponent = () => {
    return (
      <div className="space-y-8">
        {/* Descripción */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Button Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Button es la base para las interacciones de usuario. 
            Proporciona múltiples variantes, tamaños y estados para diferentes tipos de acciones.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">variant</code>
                <span>: primary, secondary, outline, ghost, destructive</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">size</code>
                <span>: sm, md, lg</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">icon</code>
                <span>: ReactNode para mostrar iconos</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">iconPosition</code>
                <span>: left, right</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">iconOnly</code>
                <span>: boolean para botones solo con icono</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">loading</code>
                <span>: boolean para estado de carga</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">disabled</code>
                <span>: boolean para estado deshabilitado</span>
              </Typography>
            </div>
          </div>
        </Card>

        {/* Variantes de Botón */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Variantes de Botón
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Diferentes estilos visuales para distintos contextos de uso.
          </Typography>
          
          <div className="space-y-6">
            {/* Primary */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Primary
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Botón principal para acciones importantes y llamadas a la acción.
              </Typography>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
            </div>

            {/* Secondary */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Secondary
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Botón secundario para acciones complementarias.
              </Typography>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" size="sm">Small</Button>
                <Button variant="secondary">Medium</Button>
                <Button variant="secondary" size="lg">Large</Button>
              </div>
            </div>

            {/* Outline */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Outline
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Botón con borde para acciones menos prominentes.
              </Typography>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" size="sm">Small</Button>
                <Button variant="outline">Medium</Button>
                <Button variant="outline" size="lg">Large</Button>
              </div>
            </div>

            {/* Ghost */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Ghost
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Botón transparente para acciones sutiles.
              </Typography>
              <div className="flex flex-wrap gap-4">
                <Button variant="ghost" size="sm">Small</Button>
                <Button variant="ghost">Medium</Button>
                <Button variant="ghost" size="lg">Large</Button>
              </div>
            </div>

            {/* Destructive */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Destructive
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Botón para acciones destructivas como eliminar.
              </Typography>
              <div className="flex flex-wrap gap-4">
                <Button variant="destructive" size="sm">Small</Button>
                <Button variant="destructive">Medium</Button>
                <Button variant="destructive" size="lg">Large</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Estados */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Diferentes estados del botón para feedback visual.
          </Typography>
          
          <div className="space-y-6">
            {/* Con Iconos */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Con Iconos
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Botones con iconos para mejorar la comprensión visual.
              </Typography>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" icon={<PlusIcon className="w-4 h-4" />}>
                  Agregar
                </Button>
                <Button variant="outline" icon={<EditIcon className="w-4 h-4" />} iconPosition="right">
                  Editar
                </Button>
                <Button variant="ghost" icon={<SaveIcon className="w-4 h-4" />} iconOnly />
              </div>
            </div>

            {/* Loading y Disabled */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Loading y Disabled
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Estados para indicar carga o deshabilitación.
              </Typography>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" loading>
                  Cargando
                </Button>
                <Button variant="primary" disabled>
                  Deshabilitado
                </Button>
                <Button variant="outline" loading>
                  Cargando
                </Button>
                <Button variant="outline" disabled>
                  Deshabilitado
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderSelectComponent = () => {
    return (
      <div className="space-y-8">
        {/* Descripción */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Select Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Select es la base para la selección de opciones en formularios. 
            Proporciona múltiples tamaños, estados y opciones para diferentes contextos de uso.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">options</code>
                <span>: array de objetos con value y label</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">placeholder</code>
                <span>: texto de placeholder</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">size</code>
                <span>: sm, md, lg</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">label</code>
                <span>: etiqueta del campo</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">helperText</code>
                <span>: texto de ayuda</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">error</code>
                <span>: mensaje de error</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">disabled</code>
                <span>: boolean para estado deshabilitado</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">value</code>
                <span>: valor seleccionado</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onChange</code>
                <span>: función callback cuando cambia la selección</span>
              </Typography>
            </div>
          </div>
        </Card>

        {/* Tamaños */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tamaños
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Diferentes tamaños para adaptarse a distintos contextos de uso.
          </Typography>
          
          <div className="space-y-6">
            {/* Small */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Small
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Tamaño pequeño para formularios compactos o espacios limitados.
              </Typography>
              <div className="space-y-2">
                <Select 
                  options={[
                    { value: "colombia", label: "Colombia" },
                    { value: "mexico", label: "México" },
                    { value: "argentina", label: "Argentina" },
                    { value: "chile", label: "Chile" },
                    { value: "peru", label: "Perú" }
                  ]}
                  placeholder="Selecciona un país..."
                  size="sm"
                />
                <Select 
                  options={[
                    { value: "active", label: "Activo" },
                    { value: "inactive", label: "Inactivo" },
                    { value: "pending", label: "Pendiente" }
                  ]}
                  placeholder="Estado..."
                  size="sm"
                />
              </div>
            </div>

            {/* Medium */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Medium
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Tamaño estándar para la mayoría de casos de uso.
              </Typography>
              <div className="space-y-2">
                <Select 
                  options={[
                    { value: "technology", label: "Tecnología" },
                    { value: "design", label: "Diseño" },
                    { value: "marketing", label: "Marketing" },
                    { value: "finance", label: "Finanzas" },
                    { value: "healthcare", label: "Salud" }
                  ]}
                  placeholder="Selecciona una industria..."
                />
                <Select 
                  options={[
                    { value: "beginner", label: "Principiante" },
                    { value: "intermediate", label: "Intermedio" },
                    { value: "advanced", label: "Avanzado" },
                    { value: "expert", label: "Experto" }
                  ]}
                  placeholder="Nivel de experiencia..."
                />
              </div>
            </div>

            {/* Large */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Large
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Tamaño grande para formularios prominentes o de alta prioridad.
              </Typography>
              <div className="space-y-2">
                <Select 
                  options={[
                    { value: "full-time", label: "Tiempo Completo" },
                    { value: "part-time", label: "Medio Tiempo" },
                    { value: "contract", label: "Contrato" },
                    { value: "freelance", label: "Freelance" },
                    { value: "internship", label: "Pasantía" }
                  ]}
                  placeholder="Tipo de empleo..."
                  size="lg"
                />
                <Select 
                  options={[
                    { value: "remote", label: "Remoto" },
                    { value: "hybrid", label: "Híbrido" },
                    { value: "onsite", label: "Presencial" }
                  ]}
                  placeholder="Modalidad de trabajo..."
                  size="lg"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Estados */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Diferentes estados del select para feedback visual.
          </Typography>
          
          <div className="space-y-6">
            {/* Con Label y Helper Text */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Con Label y Helper Text
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Select con etiqueta y texto de ayuda para mejor comprensión.
              </Typography>
              <div className="space-y-2">
                <Select 
                  options={[
                    { value: "colombia", label: "Colombia" },
                    { value: "mexico", label: "México" },
                    { value: "argentina", label: "Argentina" },
                    { value: "chile", label: "Chile" },
                    { value: "peru", label: "Perú" }
                  ]}
                  label="País de Residencia"
                  placeholder="Selecciona tu país..."
                  helperText="Selecciona el país donde resides actualmente"
                />
                <Select 
                  options={[
                    { value: "spanish", label: "Español" },
                    { value: "english", label: "Inglés" },
                    { value: "portuguese", label: "Portugués" },
                    { value: "french", label: "Francés" }
                  ]}
                  label="Idioma Preferido"
                  placeholder="Selecciona tu idioma..."
                  helperText="Elige el idioma en el que prefieres recibir las comunicaciones"
                />
              </div>
            </div>

            {/* Con Error */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Con Error
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Estados de error para indicar problemas de validación.
              </Typography>
              <div className="space-y-2">
                <Select 
                  options={[
                    { value: "active", label: "Activo" },
                    { value: "inactive", label: "Inactivo" },
                    { value: "pending", label: "Pendiente" }
                  ]}
                  placeholder="Selecciona un estado..."
                  error="Debes seleccionar un estado válido"
                />
                <Select 
                  options={[
                    { value: "admin", label: "Administrador" },
                    { value: "user", label: "Usuario" },
                    { value: "moderator", label: "Moderador" }
                  ]}
                  placeholder="Selecciona un rol..."
                  error="El rol seleccionado no está disponible para tu cuenta"
                />
              </div>
            </div>

            {/* Deshabilitado */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Deshabilitado
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Estado deshabilitado para campos no editables.
              </Typography>
              <div className="space-y-2">
                <Select 
                  options={[
                    { value: "premium", label: "Premium" },
                    { value: "basic", label: "Básico" },
                    { value: "enterprise", label: "Empresarial" }
                  ]}
                  placeholder="Plan de suscripción..."
                  disabled
                />
                <Select 
                  options={[
                    { value: "verified", label: "Verificado" },
                    { value: "unverified", label: "No Verificado" }
                  ]}
                  placeholder="Estado de verificación..."
                  disabled
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Tipos de Opciones */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Opciones
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Diferentes tipos de opciones para distintos contextos de uso.
          </Typography>
          
          <div className="space-y-6">
            {/* Opciones Simples */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Opciones Simples
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Lista básica de opciones sin agrupación.
              </Typography>
              <Select 
                options={[
                  { value: "red", label: "Rojo" },
                  { value: "blue", label: "Azul" },
                  { value: "green", label: "Verde" },
                  { value: "yellow", label: "Amarillo" },
                  { value: "purple", label: "Púrpura" }
                ]}
                placeholder="Selecciona un color..."
              />
            </div>

            {/* Opciones con Categorías */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Opciones con Categorías
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Opciones organizadas por categorías para mejor navegación.
              </Typography>
              <Select 
                options={[
                  { value: "frontend", label: "Frontend Development" },
                  { value: "backend", label: "Backend Development" },
                  { value: "fullstack", label: "Full Stack Development" },
                  { value: "mobile", label: "Mobile Development" },
                  { value: "devops", label: "DevOps" },
                  { value: "data", label: "Data Science" },
                  { value: "ai", label: "Artificial Intelligence" },
                  { value: "cybersecurity", label: "Cybersecurity" }
                ]}
                placeholder="Selecciona tu especialidad..."
              />
            </div>

            {/* Opciones con Iconos */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Opciones con Iconos
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Opciones que incluyen iconos para mejor identificación visual.
              </Typography>
              <Select 
                options={[
                  { value: "email", label: "Email" },
                  { value: "phone", label: "Teléfono" },
                  { value: "sms", label: "SMS" },
                  { value: "push", label: "Notificación Push" },
                  { value: "in-app", label: "En la Aplicación" }
                ]}
                placeholder="Método de contacto preferido..."
              />
            </div>
          </div>
        </Card>

        {/* Ejemplos de Uso */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Casos de uso comunes y patrones recomendados.
          </Typography>
          
          <div className="space-y-6">
            {/* Formulario de Registro */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Formulario de Registro
              </Typography>
              <div className="space-y-4 max-w-2xl">
                <Select 
                  options={[
                    { value: "colombia", label: "Colombia" },
                    { value: "mexico", label: "México" },
                    { value: "argentina", label: "Argentina" },
                    { value: "chile", label: "Chile" },
                    { value: "peru", label: "Perú" },
                    { value: "ecuador", label: "Ecuador" },
                    { value: "venezuela", label: "Venezuela" },
                    { value: "bolivia", label: "Bolivia" }
                  ]}
                  label="País"
                  placeholder="Selecciona tu país..."
                  helperText="Selecciona el país donde resides"
                />
                <Select 
                  options={[
                    { value: "spanish", label: "Español" },
                    { value: "english", label: "Inglés" },
                    { value: "portuguese", label: "Portugués" },
                    { value: "french", label: "Francés" },
                    { value: "german", label: "Alemán" }
                  ]}
                  label="Idioma Preferido"
                  placeholder="Selecciona tu idioma..."
                  helperText="Elige el idioma para las comunicaciones"
                />
                <Select 
                  options={[
                    { value: "student", label: "Estudiante" },
                    { value: "professional", label: "Profesional" },
                    { value: "entrepreneur", label: "Emprendedor" },
                    { value: "freelancer", label: "Freelancer" },
                    { value: "other", label: "Otro" }
                  ]}
                  label="Tipo de Usuario"
                  placeholder="Selecciona tu tipo de usuario..."
                  helperText="Ayúdanos a personalizar tu experiencia"
                />
              </div>
            </div>

            {/* Configuración de Perfil */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Configuración de Perfil
              </Typography>
              <div className="space-y-4 max-w-2xl">
                <Select 
                  options={[
                    { value: "light", label: "Claro" },
                    { value: "dark", label: "Oscuro" },
                    { value: "auto", label: "Automático" }
                  ]}
                  label="Tema de la Aplicación"
                  placeholder="Selecciona un tema..."
                  helperText="Elige entre tema claro, oscuro o automático"
                />
                <Select 
                  options={[
                    { value: "immediate", label: "Inmediatas" },
                    { value: "daily", label: "Diarias" },
                    { value: "weekly", label: "Semanales" },
                    { value: "monthly", label: "Mensuales" },
                    { value: "never", label: "Nunca" }
                  ]}
                  label="Frecuencia de Notificaciones"
                  placeholder="Selecciona la frecuencia..."
                  helperText="Define con qué frecuencia quieres recibir notificaciones"
                />
                <Select 
                  options={[
                    { value: "public", label: "Público" },
                    { value: "private", label: "Privado" },
                    { value: "friends", label: "Solo Amigos" }
                  ]}
                  label="Visibilidad del Perfil"
                  placeholder="Selecciona la visibilidad..."
                  helperText="Controla quién puede ver tu perfil"
                />
              </div>
            </div>

            {/* Filtros de Búsqueda */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Filtros de Búsqueda
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
                <Select 
                  options={[
                    { value: "all", label: "Todas las Categorías" },
                    { value: "technology", label: "Tecnología" },
                    { value: "design", label: "Diseño" },
                    { value: "marketing", label: "Marketing" },
                    { value: "finance", label: "Finanzas" },
                    { value: "healthcare", label: "Salud" }
                  ]}
                  placeholder="Categoría..."
                  size="sm"
                />
                <Select 
                  options={[
                    { value: "all", label: "Todos los Niveles" },
                    { value: "beginner", label: "Principiante" },
                    { value: "intermediate", label: "Intermedio" },
                    { value: "advanced", label: "Avanzado" },
                    { value: "expert", label: "Experto" }
                  ]}
                  placeholder="Nivel..."
                  size="sm"
                />
                <Select 
                  options={[
                    { value: "all", label: "Todas las Ubicaciones" },
                    { value: "remote", label: "Remoto" },
                    { value: "hybrid", label: "Híbrido" },
                    { value: "onsite", label: "Presencial" }
                  ]}
                  placeholder="Ubicación..."
                  size="sm"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderSwitchComponent = () => {
    return (
      <div className="space-y-8">
        {/* Descripción */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Switch Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Switch se utiliza para alternar entre estados activo/inactivo en formularios y configuraciones. 
            Proporciona feedback visual claro y es accesible por teclado.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">checked</code>
                <span>: estado activo/inactivo</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onChange</code>
                <span>: función callback cuando cambia el estado</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">disabled</code>
                <span>: boolean para estado deshabilitado</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">size</code>
                <span>: sm, md, lg</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">label</code>
                <span>: etiqueta opcional</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">description</code>
                <span>: descripción opcional</span>
              </Typography>
            </div>
          </div>
        </Card>

        {/* Tamaños */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tamaños
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Diferentes tamaños para adaptarse a distintos contextos de uso.
          </Typography>
          
          <div className="space-y-6">
            {/* Small */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Small
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Tamaño pequeño para formularios compactos o espacios limitados.
              </Typography>
              <div className="space-y-2">
                <Switch size="sm" checked={true} onChange={() => {}} />
                <Switch size="sm" checked={false} onChange={() => {}} />
              </div>
            </div>

            {/* Medium */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Medium
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Tamaño estándar para la mayoría de casos de uso.
              </Typography>
              <div className="space-y-2">
                <Switch size="md" checked={true} onChange={() => {}} />
                <Switch size="md" checked={false} onChange={() => {}} />
              </div>
            </div>

            {/* Large */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Large
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Tamaño grande para formularios prominentes o de alta prioridad.
              </Typography>
              <div className="space-y-2">
                <Switch size="lg" checked={true} onChange={() => {}} />
                <Switch size="lg" checked={false} onChange={() => {}} />
              </div>
            </div>
          </div>
        </Card>

        {/* Estados */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Diferentes estados del switch para feedback visual.
          </Typography>
          
          <div className="space-y-6">
            {/* Activo/Inactivo */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Activo/Inactivo
              </Typography>
              <div className="space-y-2">
                <Switch checked={true} onChange={() => {}} />
                <Switch checked={false} onChange={() => {}} />
              </div>
            </div>

            {/* Deshabilitado */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Deshabilitado
              </Typography>
              <div className="space-y-2">
                <Switch checked={true} onChange={() => {}} disabled />
                <Switch checked={false} onChange={() => {}} disabled />
              </div>
            </div>
          </div>
        </Card>

        {/* Con Label y Descripción */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Con Label y Descripción
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Switch con etiqueta y descripción para mejor comprensión.
          </Typography>
          
          <div className="space-y-6">
            <Switch 
              checked={true} 
              onChange={() => {}} 
              label="Notificaciones por email"
              description="Recibe notificaciones cuando se actualice tu proyecto"
            />
            
            <Switch 
              checked={false} 
              onChange={() => {}} 
              label="Modo oscuro"
              description="Cambia el tema de la aplicación"
            />
            
            <Switch 
              checked={true} 
              onChange={() => {}} 
              label="Sincronización automática"
              description="Sincroniza automáticamente los cambios"
            />
          </div>
        </Card>

        {/* Ejemplo de Uso */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplo de Uso
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Configuración de preferencias de usuario con múltiples switches.
          </Typography>
          
          <div className="space-y-4 p-6 bg-muted rounded-lg">
            <Typography variant="h4" weight="semibold" className="mb-4">
              Configuración de Notificaciones
            </Typography>
            
            <div className="space-y-4">
              <Switch 
                checked={true} 
                onChange={() => {}} 
                label="Notificaciones push"
                description="Recibe notificaciones en tiempo real"
              />
              
              <Switch 
                checked={false} 
                onChange={() => {}} 
                label="Notificaciones por email"
                description="Recibe un resumen diario por email"
              />
              
              <Switch 
                checked={true} 
                onChange={() => {}} 
                label="Sonidos de notificación"
                description="Reproduce sonidos al recibir notificaciones"
              />
              
              <Switch 
                checked={false} 
                onChange={() => {}} 
                label="Vibración"
                description="Vibra el dispositivo al recibir notificaciones"
              />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderSidebarComponent = () => {
    const menuItems = [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <DashboardIcon className="w-6 h-6" />
      },
      {
        label: 'Investigaciones',
        href: '/investigaciones',
        icon: <InvestigacionesIcon className="w-6 h-6" />
      },
      {
        label: 'Reclutamiento',
        href: '/reclutamiento',
        icon: <ReclutamientoIcon className="w-6 h-6" />
      },
      {
        label: 'Sesiones',
        href: '/sesiones',
        icon: <SesionesIcon className="w-6 h-6" />
      },
      {
        label: 'Métricas',
        href: '/metricas',
        icon: <MetricasIcon className="w-6 h-6" />
      },
      {
        label: 'Participantes',
        href: '/participantes',
        icon: <ParticipantesIcon className="w-6 h-6" />
      },
      {
        label: 'Empresas',
        href: '/empresas',
        icon: <EmpresasIcon className="w-6 h-6" />
      },
      {
        label: 'Configuraciones',
        href: '/configuraciones',
        icon: <ConfiguracionesIcon className="w-6 h-6" />,
        subMenu: [
          {
            label: 'Gestión de Usuarios',
            href: '/configuraciones/gestion-usuarios',
            icon: <UsuariosIcon className="w-6 h-6" />
          }
        ]
      },
      {
        label: 'Conocimiento',
        href: '/conocimiento',
        icon: <ConocimientoIcon className="w-6 h-6" />
      }
    ];

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Sidebar Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            Componente de navegación lateral para desktop con soporte para colapso y submenús.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">title</code>
                <span>: título del sidebar</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">items</code>
                <span>: array de elementos de navegación</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">isCollapsed</code>
                <span>: estado de colapso</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplo de Sidebar
          </Typography>
          <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <Sidebar
              title="Central de Creadores"
              items={menuItems}
              isCollapsed={false}
              onToggleCollapse={() => {}}
              onItemClick={() => {}}
            />
          </div>
        </Card>
      </div>
    );
  };

  const renderTopNavigationComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Top Navigation Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            Componente de navegación superior con título de página y elementos adicionales.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">title</code>
                <span>: título de la página actual</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">children</code>
                <span>: elementos adicionales (ej: UserMenu)</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplo de Top Navigation
          </Typography>
          <div className="border rounded-lg overflow-hidden">
            <TopNavigation title="Dashboard">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">Notificaciones</Button>
                <UserMenu
                  user={{
                    name: "Juan Pérez",
                    email: "juan@example.com",
                    avatar: "",
                    role: "administrador"
                  }}
                  onLogout={() => {}}
                  onSettings={() => {}}
                />
              </div>
            </TopNavigation>
          </div>
        </Card>
      </div>
    );
  };

  const renderUserMenuComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            User Menu Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            Componente del menú de usuario con avatar y opciones de configuración.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">user</code>
                <span>: objeto con información del usuario</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onLogout</code>
                <span>: función de cierre de sesión</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onSettings</code>
                <span>: función para ir a configuraciones</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplo de User Menu
          </Typography>
          <div className="flex justify-center">
            <UserMenu
              user={{
                name: "María García",
                email: "maria@example.com",
                avatar: "",
                role: "investigador"
              }}
              onLogout={() => {}}
              onSettings={() => {}}
            />
          </div>
        </Card>
      </div>
    );
  };

  const renderMobileNavigationComponent = () => {
    const menuItems = [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <DashboardIcon className="w-6 h-6" />
      },
      {
        label: 'Investigaciones',
        href: '/investigaciones',
        icon: <InvestigacionesIcon className="w-6 h-6" />
      },
      {
        label: 'Reclutamiento',
        href: '/reclutamiento',
        icon: <ReclutamientoIcon className="w-6 h-6" />
      }
    ];

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Mobile Navigation Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            Componente de navegación para dispositivos móviles con menú deslizable.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">items</code>
                <span>: array de elementos de navegación</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">user</code>
                <span>: información del usuario</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onItemClick</code>
                <span>: callback al hacer clic en elementos</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplo de Mobile Navigation
          </Typography>
          <Typography variant="body2" color="secondary" className="mb-4">
            El componente MobileNavigation requiere contextos específicos (ThemeContext, RolContext) que no están disponibles en el sistema de diseño. 
            En una aplicación real, este componente se renderiza automáticamente en dispositivos móviles.
          </Typography>
          <div className="border rounded-lg p-6 bg-muted">
            <div className="flex items-center justify-between">
              <Typography variant="h6" weight="semibold">
                Central de Creadores
              </Typography>
              <Button variant="ghost" size="sm">
                <MenuIcon className="w-5 h-5" />
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {menuItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-background">
                  <span className="w-6 h-6 flex items-center justify-center">
                    {item.icon}
                  </span>
                  <Typography variant="body2">{item.label}</Typography>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderNavigationItemComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Navigation Item Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            Componente base para elementos de navegación individuales con soporte para submenús.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">label</code>
                <span>: texto del elemento de navegación</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">href</code>
                <span>: URL de destino</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">icon</code>
                <span>: icono del elemento</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">subMenu</code>
                <span>: array de elementos de submenú</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Navigation Items
          </Typography>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <Typography variant="h4" weight="semibold" className="mb-3">
                Item Simple
              </Typography>
              <NavigationItem
                label="Dashboard"
                href="/dashboard"
                icon={<DashboardIcon className="w-6 h-6" />}
              />
            </div>
            
            <div className="border rounded-lg p-4">
              <Typography variant="h4" weight="semibold" className="mb-3">
                Item con Submenú
              </Typography>
              <NavigationItem
                label="Configuraciones"
                href="/configuraciones"
                icon={<ConfiguracionesIcon className="w-6 h-6" />}
                subMenu={[
                  {
                    label: 'Gestión de Usuarios',
                    href: '/configuraciones/gestion-usuarios',
                    icon: <UsuariosIcon className="w-6 h-6" />
                  },
                  {
                    label: 'Configuración del Sistema',
                    href: '/configuraciones/sistema',
                    icon: <ConfiguracionesIcon className="w-6 h-6" />
                  }
                ]}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderBadgeComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Badge Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Badge se utiliza para mostrar información adicional, notificaciones, estados o contadores de manera visual y compacta.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">variant</code>
                <span>: default, primary, secondary, success, warning, danger, info</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">size</code>
                <span>: sm, md, lg</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">children</code>
                <span>: contenido del badge</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Variantes
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Badges Básicos</Typography>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Error</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tamaños
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Diferentes Tamaños</Typography>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Typography variant="body2" color="secondary">Small</Typography>
                  <Badge variant="primary" size="sm">12</Badge>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Typography variant="body2" color="secondary">Medium</Typography>
                  <Badge variant="primary" size="md">12</Badge>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Typography variant="body2" color="secondary">Large</Typography>
                  <Badge variant="primary" size="lg">12</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Badges con Iconos</Typography>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Activo
                </Badge>
                <Badge variant="warning">
                  <AlertTriangleIcon className="w-3 h-3 mr-1" />
                  Pendiente
                </Badge>
                <Badge variant="danger">
                  <XIcon className="w-3 h-3 mr-1" />
                  Inactivo
                </Badge>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Badges de Notificación</Typography>
              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <Button variant="outline">
                    Notificaciones
                    <Badge variant="danger" size="sm" className="absolute -top-2 -right-2">3</Badge>
                  </Button>
                </div>
                <div className="relative">
                  <Button variant="outline">
                    Mensajes
                    <Badge variant="primary" size="sm" className="absolute -top-2 -right-2">12</Badge>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Estados de Usuario</Typography>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <SimpleAvatar src="/api/placeholder/32/32" />
                  <div>
                    <Typography variant="body1" weight="medium">Juan Pérez</Typography>
                    <Typography variant="body2" color="secondary">juan@example.com</Typography>
                  </div>
                  <Badge variant="success">Activo</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <SimpleAvatar src="/api/placeholder/32/32" />
                  <div>
                    <Typography variant="body1" weight="medium">María García</Typography>
                    <Typography variant="body2" color="secondary">maria@example.com</Typography>
                  </div>
                  <Badge variant="warning">Pendiente</Badge>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Estados de Proyecto</Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h5" weight="semibold">Proyecto A</Typography>
                    <Badge variant="success">Completado</Badge>
                  </div>
                  <Typography variant="body2" color="secondary">Proyecto finalizado exitosamente</Typography>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h5" weight="semibold">Proyecto B</Typography>
                    <Badge variant="warning">En Progreso</Badge>
                  </div>
                  <Typography variant="body2" color="secondary">Proyecto en desarrollo</Typography>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h5" weight="semibold">Proyecto C</Typography>
                    <Badge variant="danger">Bloqueado</Badge>
                  </div>
                  <Typography variant="body2" color="secondary">Proyecto con problemas</Typography>
                </Card>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderChipComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Chip Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Chip se utiliza para mostrar etiquetas, filtros, categorías o información compacta de manera visual y clara.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">variant</code>
                <span>: default, primary, secondary, success, warning, danger, info</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">size</code>
                <span>: sm, md, lg</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onClick</code>
                <span>: función callback cuando se hace clic</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onRemove</code>
                <span>: función callback para remover el chip</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Variantes
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Chips Básicos</Typography>
              <div className="flex flex-wrap gap-2">
                <Chip variant="default">Default</Chip>
                <Chip variant="primary">Primary</Chip>
                <Chip variant="secondary">Secondary</Chip>
                <Chip variant="success">Success</Chip>
                <Chip variant="warning">Warning</Chip>
                <Chip variant="danger">Danger</Chip>
                <Chip variant="info">Info</Chip>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Chips de Acento (Estados)</Typography>
              <div className="flex flex-wrap gap-2">
                <Chip variant="accent-purple">Accent Purple</Chip>
                <Chip variant="accent-orange">Accent Orange</Chip>
                <Chip variant="accent-indigo">Accent Indigo</Chip>
                <Chip variant="accent-teal">Accent Teal</Chip>
                <Chip variant="accent-pink">Accent Pink</Chip>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tamaños
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Diferentes Tamaños</Typography>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Typography variant="body2" color="secondary">Small</Typography>
                  <Chip variant="primary" size="sm">React</Chip>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Typography variant="body2" color="secondary">Medium</Typography>
                  <Chip variant="primary" size="md">React</Chip>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Typography variant="body2" color="secondary">Large</Typography>
                  <Chip variant="primary" size="lg">React</Chip>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Chips Interactivos</Typography>
              <div className="flex flex-wrap gap-2">
                <Chip variant="primary" onClick={() => {}}>Clickeable</Chip>
                <Chip variant="secondary" onRemove={() => {}}>Removible</Chip>
                <Chip variant="success" onClick={() => {}} onRemove={() => {}}>Completo</Chip>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Chips con Iconos</Typography>
              <div className="flex flex-wrap gap-2">
                <Chip variant="success">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Verificado
                </Chip>
                <Chip variant="warning">
                  <AlertTriangleIcon className="w-3 h-3 mr-1" />
                  Pendiente
                </Chip>
                <Chip variant="danger">
                  <XIcon className="w-3 h-3 mr-1" />
                  Rechazado
                </Chip>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Filtros de Tecnología</Typography>
              <div className="space-y-3">
                <Typography variant="body2" color="secondary">Tecnologías seleccionadas:</Typography>
                <div className="flex flex-wrap gap-2">
                  <Chip variant="primary" onRemove={() => {}}>React</Chip>
                  <Chip variant="primary" onRemove={() => {}}>TypeScript</Chip>
                  <Chip variant="primary" onRemove={() => {}}>Tailwind CSS</Chip>
                  <Chip variant="primary" onRemove={() => {}}>Node.js</Chip>
                </div>
                <Button variant="outline" size="sm">Limpiar filtros</Button>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Estados de Tarea</Typography>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Typography variant="body2" color="secondary">Tarea 1:</Typography>
                  <Chip variant="terminada">Completada</Chip>
                </div>
                <div className="flex items-center gap-2">
                  <Typography variant="body2" color="secondary">Tarea 2:</Typography>
                  <Chip variant="transitoria">En Progreso</Chip>
                </div>
                <div className="flex items-center gap-2">
                  <Typography variant="body2" color="secondary">Tarea 3:</Typography>
                  <Chip variant="fallo">Bloqueada</Chip>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Manejo de Estados</Typography>
              <div className="space-y-4">
                <div>
                  <Typography variant="body2" color="secondary" className="mb-2">Estados Terminados (Verde)</Typography>
                  <div className="flex flex-wrap gap-2">
                    <Chip variant="terminada">Buena</Chip>
                    <Chip variant="terminada">Excelente</Chip>
                    <Chip variant="terminada">Creación</Chip>
                    <Chip variant="terminada">Activo</Chip>
                  </div>
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-2">Estados Transitorios (Amarillo)</Typography>
                  <div className="flex flex-wrap gap-2">
                    <Chip variant="transitoria">Regular</Chip>
                    <Chip variant="transitoria">Edición</Chip>
                    <Chip variant="transitoria">En Progreso</Chip>
                    <Chip variant="transitoria">Pendiente</Chip>
                  </div>
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-2">Estados de Fallo (Rojo)</Typography>
                  <div className="flex flex-wrap gap-2">
                    <Chip variant="fallo">Mal</Chip>
                    <Chip variant="fallo">Muy Mala</Chip>
                    <Chip variant="fallo">Inactivo</Chip>
                    <Chip variant="fallo">Cancelado</Chip>
                  </div>
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-2">Estados Pendientes (Azul)</Typography>
                  <div className="flex flex-wrap gap-2">
                    <Chip variant="pendiente">Por Agendar</Chip>
                    <Chip variant="pendiente">En Borrador</Chip>
                    <Chip variant="pendiente">En Enfriamiento</Chip>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Categorías de Contenido</Typography>
              <div className="flex flex-wrap gap-2">
                <Chip variant="info" onClick={() => {}}>Tutorial</Chip>
                <Chip variant="info" onClick={() => {}}>Documentación</Chip>
                <Chip variant="info" onClick={() => {}}>Ejemplo</Chip>
                <Chip variant="info" onClick={() => {}}>Mejores Prácticas</Chip>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderProgressBarComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Progress Bar Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Progress Bar se utiliza para mostrar el progreso de una tarea o proceso de manera visual e intuitiva.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">value</code>
                <span>: valor del progreso (0-100)</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">variant</code>
                <span>: default, primary, success, warning, danger</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">size</code>
                <span>: sm, md, lg</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">showLabel</code>
                <span>: mostrar etiqueta con el porcentaje</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Variantes
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Diferentes Variantes</Typography>
              <div className="space-y-3">
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Default (25%)</Typography>
                  <ProgressBar value={25} />
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Primary (50%)</Typography>
                  <ProgressBar value={50} variant="primary" />
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Success (75%)</Typography>
                  <ProgressBar value={75} variant="success" />
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Warning (90%)</Typography>
                  <ProgressBar value={90} variant="warning" />
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Danger (100%)</Typography>
                  <ProgressBar value={100} variant="danger" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tamaños
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Diferentes Tamaños</Typography>
              <div className="space-y-3">
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Small</Typography>
                  <ProgressBar value={60} size="sm" />
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Medium</Typography>
                  <ProgressBar value={60} size="md" />
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Large</Typography>
                  <ProgressBar value={60} size="lg" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Con Etiqueta</Typography>
              <div className="space-y-3">
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Progreso con porcentaje</Typography>
                  <ProgressBar value={45} showLabel={true} />
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Progreso completo</Typography>
                  <ProgressBar value={100} variant="success" showLabel={true} />
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Progreso Indeterminado</Typography>
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
                </div>
                <Typography variant="body2" color="secondary">Cargando...</Typography>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Progreso de Carga de Archivo</Typography>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Typography variant="body2" color="secondary">documento.pdf</Typography>
                  <Typography variant="body2" color="secondary">75%</Typography>
                </div>
                <ProgressBar value={75} variant="primary" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Cancelar</Button>
                  <Button variant="primary" size="sm">Pausar</Button>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Progreso de Proyecto</Typography>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="body1" weight="medium">Fase 1: Investigación</Typography>
                    <Badge variant="success">Completada</Badge>
                  </div>
                  <ProgressBar value={100} variant="success" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="body1" weight="medium">Fase 2: Desarrollo</Typography>
                    <Badge variant="warning">En Progreso</Badge>
                  </div>
                  <ProgressBar value={65} variant="warning" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="body1" weight="medium">Fase 3: Testing</Typography>
                    <Badge variant="secondary">Pendiente</Badge>
                  </div>
                  <ProgressBar value={0} variant="secondary" />
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Progreso de Formulario</Typography>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Typography variant="body2" color="secondary">Paso 3 de 5</Typography>
                  <Typography variant="body2" color="secondary">60%</Typography>
                </div>
                <ProgressBar value={60} variant="primary" showLabel={true} />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Anterior</Button>
                  <Button variant="primary" size="sm">Siguiente</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderEmptyStateComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Empty State Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Empty State se utiliza para mostrar un estado vacío cuando no hay datos disponibles, proporcionando una experiencia de usuario clara y orientada a la acción.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">icon</code>
                <span>: icono del estado vacío</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">title</code>
                <span>: título del estado vacío</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">description</code>
                <span>: descripción del estado vacío</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">actionText</code>
                <span>: texto del botón de acción</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onAction</code>
                <span>: función callback para la acción</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Empty State
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Empty State Básico</Typography>
              <EmptyState
                icon={<PlusIcon className="w-8 h-8" />}
                title="No hay datos"
                description="No se encontraron resultados para tu búsqueda."
              />
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Empty State con Acción</Typography>
              <EmptyState
                icon={<EditIcon className="w-8 h-8" />}
                title="Sin contenido"
                description="Aún no has creado ningún elemento."
                actionText="Crear nuevo"
                onAction={() => {}}
              />
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Empty State Informativo</Typography>
              <EmptyState
                icon={<InfoIcon className="w-8 h-8" />}
                title="Sin resultados"
                description="Intenta ajustar tus filtros o criterios de búsqueda."
                actionText="Limpiar filtros"
                onAction={() => {}}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Empty State de Carga</Typography>
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <Typography variant="h5" weight="semibold" className="mb-2">Cargando datos...</Typography>
                <Typography variant="body2" color="secondary">Por favor espera mientras se cargan los resultados.</Typography>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Empty State de Error</Typography>
              <EmptyState
                icon={<AlertTriangleIcon className="w-8 h-8" />}
                title="Error al cargar"
                description="Hubo un problema al cargar los datos. Intenta nuevamente."
                actionText="Reintentar"
                onAction={() => {}}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Lista de Usuarios Vacía</Typography>
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h5" weight="semibold">Usuarios</Typography>
                  <Button variant="primary" size="sm">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Agregar Usuario
                  </Button>
                </div>
                <EmptyState
                  icon={<UsuariosIcon className="w-8 h-8" />}
                  title="No hay usuarios"
                  description="Aún no se han agregado usuarios al sistema."
                  actionText="Crear primer usuario"
                  onAction={() => {}}
                />
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Búsqueda sin Resultados</Typography>
              <Card className="p-6">
                <div className="mb-4">
                  <Input placeholder="Buscar proyectos..." />
                </div>
                <EmptyState
                  icon={<InvestigacionesIcon className="w-8 h-8" />}
                  title="No se encontraron proyectos"
                  description="No hay proyectos que coincidan con tu búsqueda."
                  actionText="Ver todos los proyectos"
                  onAction={() => {}}
                />
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Dashboard Vacío</Typography>
              <Card className="p-6">
                <Typography variant="h5" weight="semibold" className="mb-4">Métricas del Proyecto</Typography>
                <EmptyState
                  icon={<MetricasIcon className="w-8 h-8" />}
                  title="Sin métricas disponibles"
                  description="Las métricas aparecerán aquí una vez que tengas datos en tu proyecto."
                  actionText="Configurar métricas"
                  onAction={() => {}}
                />
              </Card>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderDatePickerComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Date Picker Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Date Picker se utiliza para seleccionar fechas en formularios con una interfaz intuitiva y accesible.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">value</code>
                <span>: fecha seleccionada (Date)</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onChange</code>
                <span>: función callback cuando cambia la fecha</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">placeholder</code>
                <span>: texto de placeholder</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">disabled</code>
                <span>: estado deshabilitado</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Date Picker Normal</Typography>
              <div className="max-w-xs">
                <DatePicker
                  value={new Date()}
                  onChange={() => {}}
                  placeholder="Seleccionar fecha"
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Date Picker Deshabilitado</Typography>
              <div className="max-w-xs">
                <DatePicker
                  value={new Date()}
                  onChange={() => {}}
                  placeholder="Seleccionar fecha"
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Formulario de Evento</Typography>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Typography variant="body2" color="secondary" className="mb-1">Fecha de inicio</Typography>
                    <DatePicker
                      value={new Date()}
                      onChange={() => {}}
                      placeholder="Fecha de inicio"
                    />
                  </div>
                  <div className="flex-1">
                    <Typography variant="body2" color="secondary" className="mb-1">Fecha de fin</Typography>
                    <DatePicker
                      value={new Date()}
                      onChange={() => {}}
                      placeholder="Fecha de fin"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Filtro de Fechas</Typography>
              <div className="flex gap-2 items-end">
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Desde</Typography>
                  <DatePicker
                    value={new Date()}
                    onChange={() => {}}
                    placeholder="Desde"
                  />
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Hasta</Typography>
                  <DatePicker
                    value={new Date()}
                    onChange={() => {}}
                    placeholder="Hasta"
                  />
                </div>
                <Button variant="outline" size="sm">Aplicar</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderMultiSelectComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Multi Select Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Multi Select permite seleccionar múltiples opciones de una lista con una interfaz intuitiva y accesible.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">options</code>
                <span>: array de opciones disponibles</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">value</code>
                <span>: valores seleccionados (array)</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onChange</code>
                <span>: función callback cuando cambian las selecciones</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">placeholder</code>
                <span>: texto de placeholder</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">disabled</code>
                <span>: estado deshabilitado</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Multi Select Normal</Typography>
              <div className="max-w-md">
                <MultiSelect
                  options={[
                    { value: "react", label: "React" },
                    { value: "vue", label: "Vue" },
                    { value: "angular", label: "Angular" }
                  ]}
                  value={[]}
                  onChange={() => {}}
                  placeholder="Seleccionar tecnologías"
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Multi Select Deshabilitado</Typography>
              <div className="max-w-md">
                <MultiSelect
                  options={[
                    { value: "react", label: "React" },
                    { value: "vue", label: "Vue" },
                    { value: "angular", label: "Angular" }
                  ]}
                  value={[]}
                  onChange={() => {}}
                  placeholder="Seleccionar tecnologías"
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Opciones
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Opciones Simples</Typography>
              <div className="max-w-md">
                <MultiSelect
                  options={[
                    { value: "opcion1", label: "Opción 1" },
                    { value: "opcion2", label: "Opción 2" },
                    { value: "opcion3", label: "Opción 3" }
                  ]}
                  value={[]}
                  onChange={() => {}}
                  placeholder="Seleccionar opciones"
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Opciones con Categorías</Typography>
              <div className="max-w-md">
                <MultiSelect
                  options={[
                    { value: "frontend", label: "Frontend", group: "Tecnologías" },
                    { value: "backend", label: "Backend", group: "Tecnologías" },
                    { value: "database", label: "Database", group: "Tecnologías" },
                    { value: "design", label: "Design", group: "Roles" },
                    { value: "development", label: "Development", group: "Roles" }
                  ]}
                  value={[]}
                  onChange={() => {}}
                  placeholder="Seleccionar por categoría"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Filtro de Tecnologías</Typography>
              <div className="space-y-3">
                <MultiSelect
                  options={[
                    { value: "javascript", label: "JavaScript" },
                    { value: "typescript", label: "TypeScript" },
                    { value: "python", label: "Python" },
                    { value: "java", label: "Java" },
                    { value: "csharp", label: "C#" }
                  ]}
                  value={[]}
                  onChange={() => {}}
                  placeholder="Filtrar por tecnologías"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Aplicar filtros</Button>
                  <Button variant="ghost" size="sm">Limpiar</Button>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Asignación de Roles</Typography>
              <div className="space-y-3">
                <MultiSelect
                  options={[
                    { value: "admin", label: "Administrador" },
                    { value: "editor", label: "Editor" },
                    { value: "viewer", label: "Visualizador" },
                    { value: "contributor", label: "Contribuidor" }
                  ]}
                  value={[]}
                  onChange={() => {}}
                  placeholder="Asignar roles al usuario"
                />
                <Button variant="primary" size="sm">Guardar cambios</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderTimePickerComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Time Picker Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Time Picker se utiliza para seleccionar horas y minutos en formularios con una interfaz intuitiva y accesible, siguiendo los estilos del sistema de diseño.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">value</code>
                <span>: hora seleccionada (string en formato HH:MM AM/PM)</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onChange</code>
                <span>: función callback cuando cambia la hora</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">placeholder</code>
                <span>: texto de placeholder</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">disabled</code>
                <span>: estado deshabilitado</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">format</code>
                <span>: formato de hora (12h, 24h)</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">step</code>
                <span>: incremento de minutos (15, 30, 60)</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Time Picker
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Time Picker Básico (12h)</Typography>
              <div className="max-w-xs">
                <TimePicker
                  value={timeValue}
                  onChange={setTimeValue}
                  placeholder="--:-- --"
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Time Picker con Pasos (5 minutos)</Typography>
              <div className="max-w-xs">
                <TimePicker
                  value={timeValueStep}
                  onChange={setTimeValueStep}
                  placeholder="--:-- --"
                  step={5}
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Time Picker 24h</Typography>
              <div className="max-w-xs">
                <TimePicker
                  value={timeValue24h}
                  onChange={setTimeValue24h}
                  placeholder="--:--"
                  format="24h"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Time Picker Normal</Typography>
              <div className="max-w-xs">
                <TimePicker
                  value="06:46 PM"
                  onChange={() => {}}
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Time Picker Deshabilitado</Typography>
              <div className="max-w-xs">
                <TimePicker
                  value="06:46 PM"
                  onChange={() => {}}
                  disabled={true}
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Time Picker con Error</Typography>
              <div className="max-w-xs">
                <div className="relative">
                  <Input 
                    placeholder="--:-- --" 
                    className="pr-10 border-error"
                    readOnly
                    error="Hora requerida"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <ClockIcon className="w-4 h-4 text-error" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Variantes
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tamaño Pequeño</Typography>
              <div className="max-w-xs">
                <TimePicker
                  placeholder="--:-- --"
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tamaño Grande</Typography>
              <div className="max-w-xs">
                <TimePicker
                  placeholder="--:-- --"
                  className="text-lg"
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Con Label</Typography>
              <div className="max-w-xs space-y-2">
                <Typography variant="body2" color="secondary">Hora de la Sesión *</Typography>
                <TimePicker
                  placeholder="--:-- --"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Formulario de Sesión</Typography>
              <div className="space-y-4">
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Hora de la Sesión *</Typography>
                  <TimePicker
                    value="06:46 PM"
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Duración (mínimo 15, máximo 8 horas) *</Typography>
                  <Input placeholder="Ingresa la duración" />
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Participante</Typography>
                  <div className="relative">
                    <Input placeholder="Seleccionar participante" className="pr-10" readOnly />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <ChevronDownIcon className="w-4 h-4 text-muted" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Configuración de Horarios</Typography>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Hora de Inicio</Typography>
                  <TimePicker
                    value="09:00 AM"
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Hora de Fin</Typography>
                  <TimePicker
                    value="05:00 PM"
                    onChange={() => {}}
                  />
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Reserva de Citas</Typography>
              <div className="space-y-4">
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Fecha</Typography>
                  <Input placeholder="Seleccionar fecha" className="pr-10" readOnly />
                </div>
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">Hora Disponible</Typography>
                  <TimePicker
                    value="02:30 PM"
                    onChange={() => {}}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Cancelar</Button>
                  <Button variant="primary" size="sm">Confirmar Cita</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderToastComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Toast Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Toast se utiliza para mostrar notificaciones temporales al usuario con diferentes tipos y estilos.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">id</code>
                <span>: identificador único del toast</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">title</code>
                <span>: título del toast</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">message</code>
                <span>: mensaje del toast</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">type</code>
                <span>: success, error, warning, info</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onClose</code>
                <span>: función para cerrar el toast</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Toast
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Toast de Éxito</Typography>
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <Typography variant="body1" color="success" className="font-medium">Operación completada exitosamente</Typography>
                <Typography variant="body2" color="secondary">Los cambios se han guardado correctamente.</Typography>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Toast de Error</Typography>
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <Typography variant="body1" color="error" className="font-medium">Ha ocurrido un error</Typography>
                <Typography variant="body2" color="secondary">No se pudo completar la operación.</Typography>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Toast de Advertencia</Typography>
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <Typography variant="body1" color="warning" className="font-medium">Advertencia importante</Typography>
                <Typography variant="body2" color="secondary">Revisa los datos antes de continuar.</Typography>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Toast Informativo</Typography>
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <Typography variant="body1" color="info" className="font-medium">Información del sistema</Typography>
                <Typography variant="body2" color="secondary">Nueva actualización disponible.</Typography>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Notificaciones de Formulario</Typography>
              <div className="space-y-3">
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <Typography variant="body1" color="success" className="font-medium">Formulario enviado</Typography>
                  <Typography variant="body2" color="secondary">Los datos se han guardado correctamente.</Typography>
                </div>
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <Typography variant="body1" color="error" className="font-medium">Error de validación</Typography>
                  <Typography variant="body2" color="secondary">Por favor, completa todos los campos requeridos.</Typography>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Notificaciones de Sistema</Typography>
              <div className="space-y-3">
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <Typography variant="body1" color="info" className="font-medium">Sistema actualizado</Typography>
                  <Typography variant="body2" color="secondary">Se han aplicado las últimas mejoras.</Typography>
                </div>
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <Typography variant="body1" color="warning" className="font-medium">Mantenimiento programado</Typography>
                  <Typography variant="body2" color="secondary">El sistema estará en mantenimiento mañana de 2:00 a 4:00 AM.</Typography>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderTooltipComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tooltip Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Tooltip se utiliza para mostrar información adicional, ayuda contextual o descripciones al hacer hover sobre un elemento.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">content</code>
                <span>: contenido del tooltip</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">position</code>
                <span>: top, bottom, left, right</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">children</code>
                <span>: elemento que activa el tooltip</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">delay</code>
                <span>: retraso antes de mostrar el tooltip</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Posiciones
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Diferentes Posiciones</Typography>
              <div className="flex flex-wrap gap-4">
                <Tooltip content="Tooltip en la parte superior">
                  <Button variant="outline">Top</Button>
                </Tooltip>
                <Tooltip content="Tooltip en la parte inferior" position="bottom">
                  <Button variant="outline">Bottom</Button>
                </Tooltip>
                <Tooltip content="Tooltip a la izquierda" position="left">
                  <Button variant="outline">Left</Button>
                </Tooltip>
                <Tooltip content="Tooltip a la derecha" position="right">
                  <Button variant="outline">Right</Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Contenido
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tooltips Simples</Typography>
              <div className="flex flex-wrap gap-4">
                <Tooltip content="Información adicional">
                  <Button>Hover me</Button>
                </Tooltip>
                <Tooltip content="Campo requerido">
                  <Input placeholder="Email" />
                </Tooltip>
                <Tooltip content="Más opciones">
                  <Button variant="ghost">
                    <MoreVerticalIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tooltips con Iconos</Typography>
              <div className="flex flex-wrap gap-4">
                <Tooltip content="Información del sistema">
                  <Button variant="ghost" size="sm">
                    <InfoIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Configuraciones avanzadas">
                  <Button variant="ghost" size="sm">
                    <ConfiguracionesIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Ayuda y documentación">
                  <Button variant="ghost" size="sm">
                    <ConocimientoIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tooltips en Diferentes Estados</Typography>
              <div className="flex flex-wrap gap-4">
                <Tooltip content="Elemento activo">
                  <Button variant="primary">Activo</Button>
                </Tooltip>
                <Tooltip content="Elemento deshabilitado">
                  <Button variant="outline" disabled>Deshabilitado</Button>
                </Tooltip>
                <Tooltip content="Elemento con error">
                  <Button variant="danger">Error</Button>
                </Tooltip>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tooltips en Formularios</Typography>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Typography variant="body2" color="secondary">Contraseña</Typography>
                  <Tooltip content="La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números">
                    <InfoIcon className="w-4 h-4 text-gray-400" />
                  </Tooltip>
                </div>
                <Input type="password" placeholder="Ingresa tu contraseña" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tabla de Datos</Typography>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Usuario</th>
                      <th className="px-4 py-2 text-left">Estado</th>
                      <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2">Juan Pérez</td>
                      <td className="px-4 py-2">
                        <Badge variant="success">Activo</Badge>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Tooltip content="Editar usuario">
                            <Button variant="ghost" size="sm">
                              <EditIcon className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Eliminar usuario">
                            <Button variant="ghost" size="sm">
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Dashboard con Métricas</Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="h5" weight="semibold">1,234</Typography>
                      <Typography variant="body2" color="secondary">Usuarios Activos</Typography>
                    </div>
                    <Tooltip content="Número total de usuarios que han iniciado sesión en los últimos 30 días">
                      <InfoIcon className="w-5 h-5 text-gray-400" />
                    </Tooltip>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="h5" weight="semibold">89%</Typography>
                      <Typography variant="body2" color="secondary">Tasa de Retención</Typography>
                    </div>
                    <Tooltip content="Porcentaje de usuarios que regresan después de su primera visita">
                      <InfoIcon className="w-5 h-5 text-gray-400" />
                    </Tooltip>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="h5" weight="semibold">56</Typography>
                      <Typography variant="body2" color="secondary">Proyectos Activos</Typography>
                    </div>
                    <Tooltip content="Proyectos que están actualmente en desarrollo o producción">
                      <InfoIcon className="w-5 h-5 text-gray-400" />
                    </Tooltip>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderDataTableComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Data Table Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Data Table se utiliza para mostrar datos tabulares con funcionalidades de ordenamiento, filtrado y paginación.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">data</code>
                <span>: array de datos a mostrar</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">columns</code>
                <span>: configuración de columnas</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">sortable</code>
                <span>: habilitar ordenamiento</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">pagination</code>
                <span>: habilitar paginación</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Columnas
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tabla Básica</Typography>
              <div className="overflow-x-auto">
                <DataTable
                  data={[
                    { id: 1, name: "Juan Pérez", email: "juan@example.com", role: "Admin" },
                    { id: 2, name: "María García", email: "maria@example.com", role: "User" },
                    { id: 3, name: "Carlos López", email: "carlos@example.com", role: "Editor" }
                  ]}
                  columns={[
                    { key: "name", label: "Nombre" },
                    { key: "email", label: "Email" },
                    { key: "role", label: "Rol" }
                  ]}
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tabla con Acciones</Typography>
              <div className="overflow-x-auto">
                <DataTable
                  data={[
                    { id: 1, name: "Juan Pérez", email: "juan@example.com", role: "Admin", status: "Activo" },
                    { id: 2, name: "María García", email: "maria@example.com", role: "User", status: "Pendiente" },
                    { id: 3, name: "Carlos López", email: "carlos@example.com", role: "Editor", status: "Inactivo" }
                  ]}
                  columns={[
                    { key: "name", label: "Nombre" },
                    { key: "email", label: "Email" },
                    { key: "role", label: "Rol" },
                    { key: "status", label: "Estado" },
                    { key: "actions", label: "Acciones" }
                  ]}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tabla Vacía</Typography>
              <div className="overflow-x-auto">
                <DataTable
                  data={[]}
                  columns={[
                    { key: "name", label: "Nombre" },
                    { key: "email", label: "Email" },
                    { key: "role", label: "Rol" }
                  ]}
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tabla Cargando</Typography>
              <div className="overflow-x-auto">
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Gestión de Usuarios</Typography>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Typography variant="body1" weight="medium">Lista de Usuarios</Typography>
                  <Button variant="primary" size="sm">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Agregar Usuario
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <DataTable
                    data={[
                      { id: 1, name: "Juan Pérez", email: "juan@example.com", role: "Admin", status: "Activo" },
                      { id: 2, name: "María García", email: "maria@example.com", role: "User", status: "Pendiente" },
                      { id: 3, name: "Carlos López", email: "carlos@example.com", role: "Editor", status: "Inactivo" }
                    ]}
                    columns={[
                      { key: "name", label: "Nombre" },
                      { key: "email", label: "Email" },
                      { key: "role", label: "Rol" },
                      { key: "status", label: "Estado" }
                    ]}
                  />
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Reporte de Proyectos</Typography>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Exportar</Button>
                  <Button variant="outline" size="sm">Filtrar</Button>
                </div>
                <div className="overflow-x-auto">
                  <DataTable
                    data={[
                      { id: 1, name: "Proyecto A", status: "En Progreso", progress: "75%", team: "Equipo 1" },
                      { id: 2, name: "Proyecto B", status: "Completado", progress: "100%", team: "Equipo 2" },
                      { id: 3, name: "Proyecto C", status: "Pendiente", progress: "0%", team: "Equipo 3" }
                    ]}
                    columns={[
                      { key: "name", label: "Proyecto" },
                      { key: "status", label: "Estado" },
                      { key: "progress", label: "Progreso" },
                      { key: "team", label: "Equipo" }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderMetricCardComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Metric Card Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Metric Card se utiliza para mostrar métricas, estadísticas y KPIs importantes de manera visual y clara.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">title</code>
                <span>: título de la métrica</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">value</code>
                <span>: valor de la métrica</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">icon</code>
                <span>: icono representativo</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">trend</code>
                <span>: tendencia (positiva/negativa)</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">change</code>
                <span>: porcentaje de cambio</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Métricas
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Métricas Básicas</Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="Usuarios Activos"
                  value="1,234"
                  icon={<UsuariosIcon className="w-6 h-6" />}
                />
                <MetricCard
                  title="Proyectos"
                  value="56"
                  icon={<InvestigacionesIcon className="w-6 h-6" />}
                />
                <MetricCard
                  title="Sesiones"
                  value="89"
                  icon={<SesionesIcon className="w-6 h-6" />}
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Métricas con Tendencia</Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="Ingresos"
                  value="$12,345"
                  icon={<MetricasIcon className="w-6 h-6" />}
                  trend="up"
                  change="+12%"
                />
                <MetricCard
                  title="Conversiones"
                  value="23.5%"
                  icon={<ParticipantesIcon className="w-6 h-6" />}
                  trend="up"
                  change="+5%"
                />
                <MetricCard
                  title="Tiempo Promedio"
                  value="2.3h"
                  icon={<ClockIcon className="w-6 h-6" />}
                  trend="down"
                  change="-8%"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Métricas con Diferentes Estados</Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="Rendimiento"
                  value="95%"
                  icon={<CheckCircleIcon className="w-6 h-6" />}
                  trend="up"
                  change="+15%"
                />
                <MetricCard
                  title="Errores"
                  value="12"
                  icon={<AlertTriangleIcon className="w-6 h-6" />}
                  trend="down"
                  change="-25%"
                />
                <MetricCard
                  title="Disponibilidad"
                  value="99.9%"
                  icon={<InfoIcon className="w-6 h-6" />}
                  trend="stable"
                  change="0%"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Dashboard Principal</Typography>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                  title="Usuarios Totales"
                  value="15,234"
                  icon={<UsuariosIcon className="w-6 h-6" />}
                  trend="up"
                  change="+8%"
                />
                <MetricCard
                  title="Proyectos Activos"
                  value="89"
                  icon={<InvestigacionesIcon className="w-6 h-6" />}
                  trend="up"
                  change="+12%"
                />
                <MetricCard
                  title="Tasa de Éxito"
                  value="94.2%"
                  icon={<CheckCircleIcon className="w-6 h-6" />}
                  trend="up"
                  change="+3%"
                />
                <MetricCard
                  title="Tiempo Promedio"
                  value="2.1h"
                  icon={<ClockIcon className="w-6 h-6" />}
                  trend="down"
                  change="-5%"
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Reporte de Ventas</Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="Ventas del Mes"
                  value="$45,678"
                  icon={<MetricasIcon className="w-6 h-6" />}
                  trend="up"
                  change="+18%"
                />
                <MetricCard
                  title="Nuevos Clientes"
                  value="156"
                  icon={<ParticipantesIcon className="w-6 h-6" />}
                  trend="up"
                  change="+22%"
                />
                <MetricCard
                  title="Ticket Promedio"
                  value="$293"
                  icon={<EmpresasIcon className="w-6 h-6" />}
                  trend="up"
                  change="+7%"
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Métricas de Rendimiento</Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricCard
                  title="Uptime del Sistema"
                  value="99.95%"
                  icon={<CheckCircleIcon className="w-6 h-6" />}
                  trend="stable"
                  change="0%"
                />
                <MetricCard
                  title="Tiempo de Respuesta"
                  value="245ms"
                  icon={<ClockIcon className="w-6 h-6" />}
                  trend="down"
                  change="-12%"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderDonutChartComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Donut Chart Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Donut Chart se utiliza para mostrar datos en formato de gráfico circular, ideal para representar proporciones y distribuciones.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">data</code>
                <span>: array de datos para el gráfico</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">width</code>
                <span>: ancho del gráfico</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">height</code>
                <span>: alto del gráfico</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">showLabels</code>
                <span>: mostrar etiquetas en el gráfico</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Datos
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Distribución de Tecnologías</Typography>
              <div className="flex justify-center">
                <DonutChart
                  data={[
                    { label: "React", value: 40, color: "#61DAFB" },
                    { label: "Vue", value: 30, color: "#42B883" },
                    { label: "Angular", value: 30, color: "#DD0031" }
                  ]}
                  width={200}
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Estados de Proyectos</Typography>
              <div className="flex justify-center">
                <DonutChart
                  data={[
                    { label: "Completados", value: 60, color: "#10B981" },
                    { label: "En Progreso", value: 25, color: "#F59E0B" },
                    { label: "Pendientes", value: 15, color: "#EF4444" }
                  ]}
                  width={200}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tamaños
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Gráfico Pequeño</Typography>
              <div className="flex justify-center">
                <DonutChart
                  data={[
                    { label: "A", value: 50, color: "#3B82F6" },
                    { label: "B", value: 50, color: "#EF4444" }
                  ]}
                  width={120}
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Gráfico Grande</Typography>
              <div className="flex justify-center">
                <DonutChart
                  data={[
                    { label: "Desktop", value: 45, color: "#8B5CF6" },
                    { label: "Mobile", value: 35, color: "#06B6D4" },
                    { label: "Tablet", value: 20, color: "#F97316" }
                  ]}
                  width={300}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Sin Datos</Typography>
              <div className="flex justify-center">
                <div className="w-48 h-48 rounded-full border-4 border-gray-200 flex items-center justify-center">
                  <Typography variant="body2" color="secondary">Sin datos</Typography>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Cargando</Typography>
              <div className="flex justify-center">
                <div className="w-48 h-48 rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Dashboard de Usuarios</Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <Typography variant="h5" weight="semibold" className="mb-3">Distribución por Rol</Typography>
                  <div className="flex justify-center">
                    <DonutChart
                      data={[
                        { label: "Admin", value: 15, color: "#EF4444" },
                        { label: "Editor", value: 25, color: "#F59E0B" },
                        { label: "Usuario", value: 60, color: "#10B981" }
                      ]}
                      width={180}
                    />
                  </div>
                </Card>
                <Card className="p-4">
                  <Typography variant="h5" weight="semibold" className="mb-3">Actividad por Mes</Typography>
                  <div className="flex justify-center">
                    <DonutChart
                      data={[
                        { label: "Enero", value: 20, color: "#3B82F6" },
                        { label: "Febrero", value: 30, color: "#8B5CF6" },
                        { label: "Marzo", value: 50, color: "#06B6D4" }
                      ]}
                      width={180}
                    />
                  </div>
                </Card>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Reporte de Ventas</Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <Typography variant="h5" weight="semibold" className="mb-3">Por Categoría</Typography>
                  <div className="flex justify-center">
                    <DonutChart
                      data={[
                        { label: "Electrónicos", value: 40, color: "#3B82F6" },
                        { label: "Ropa", value: 30, color: "#10B981" },
                        { label: "Hogar", value: 30, color: "#F59E0B" }
                      ]}
                      width={150}
                    />
                  </div>
                </Card>
                <Card className="p-4">
                  <Typography variant="h5" weight="semibold" className="mb-3">Por Región</Typography>
                  <div className="flex justify-center">
                    <DonutChart
                      data={[
                        { label: "Norte", value: 35, color: "#EF4444" },
                        { label: "Sur", value: 25, color: "#8B5CF6" },
                        { label: "Este", value: 20, color: "#06B6D4" },
                        { label: "Oeste", value: 20, color: "#F97316" }
                      ]}
                      width={150}
                    />
                  </div>
                </Card>
                <Card className="p-4">
                  <Typography variant="h5" weight="semibold" className="mb-3">Por Canal</Typography>
                  <div className="flex justify-center">
                    <DonutChart
                      data={[
                        { label: "Online", value: 60, color: "#10B981" },
                        { label: "Tienda", value: 25, color: "#3B82F6" },
                        { label: "Teléfono", value: 15, color: "#F59E0B" }
                      ]}
                      width={150}
                    />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderModalComponent = () => {

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Modal Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Modal se utiliza para mostrar contenido en una ventana superpuesta, ideal para formularios, confirmaciones y contenido que requiere atención del usuario.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">isOpen</code>
                <span>: estado de apertura del modal</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onClose</code>
                <span>: función para cerrar el modal</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">title</code>
                <span>: título del modal</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">children</code>
                <span>: contenido del modal</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">size</code>
                <span>: tamaño del modal (sm, md, lg, xl)</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Modal
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Modal Informativo</Typography>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Abrir Modal Informativo
              </Button>
              {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)} />
                  <div className="relative bg-white rounded-lg  max-w-md w-full">
                    <div className="flex items-center justify-between p-4 border-b">
                      <Typography variant="h5" weight="semibold">Información Importante</Typography>
                      <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <Typography variant="h5" weight="semibold" className="mb-2">
                        Actualización del Sistema
                      </Typography>
                      <Typography variant="body1" color="secondary" className="mb-4">
                        Se ha programado una actualización del sistema para el próximo lunes. 
                        Durante este tiempo, el servicio estará temporalmente no disponible.
                      </Typography>
                      <div className="flex gap-2">
                        <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                          Entendido
                        </Button>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                          Más tarde
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Modal de Confirmación</Typography>
              <Button variant="destructive" onClick={() => setIsConfirmModalOpen(true)}>
                Eliminar Elemento
              </Button>
              {isConfirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsConfirmModalOpen(false)} />
                  <div className="relative bg-white rounded-lg  max-w-sm w-full">
                    <div className="flex items-center justify-between p-4 border-b">
                      <Typography variant="h5" weight="semibold">Confirmar Eliminación</Typography>
                      <Button variant="ghost" size="sm" onClick={() => setIsConfirmModalOpen(false)}>
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <Typography variant="body1" color="secondary" className="mb-4">
                        ¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.
                      </Typography>
                      <div className="flex gap-2">
                        <Button variant="destructive" onClick={() => setIsConfirmModalOpen(false)}>
                          Eliminar
                        </Button>
                        <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Modal de Formulario</Typography>
              <Button variant="primary" onClick={() => setIsFormModalOpen(true)}>
                Crear Nuevo Usuario
              </Button>
              {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsFormModalOpen(false)} />
                  <div className="relative bg-white rounded-lg  max-w-lg w-full">
                    <div className="flex items-center justify-between p-4 border-b">
                      <Typography variant="h5" weight="semibold">Crear Nuevo Usuario</Typography>
                      <Button variant="ghost" size="sm" onClick={() => setIsFormModalOpen(false)}>
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <Typography variant="body2" weight="medium" className="mb-2">
                            Nombre completo
                          </Typography>
                          <Input placeholder="Ingresa el nombre completo" />
                        </div>
                        <div>
                          <Typography variant="body2" weight="medium" className="mb-2">
                            Email
                          </Typography>
                          <Input placeholder="usuario@ejemplo.com" type="email" />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button variant="primary" onClick={() => setIsFormModalOpen(false)}>
                            Crear Usuario
                          </Button>
                          <Button variant="secondary" onClick={() => setIsFormModalOpen(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tamaños
          </Typography>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Typography variant="body2" weight="medium" className="w-16">Pequeño:</Typography>
              <div className="w-32 h-20 bg-gray-200 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
                <Typography variant="body2" color="secondary">sm</Typography>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Typography variant="body2" weight="medium" className="w-16">Mediano:</Typography>
              <div className="w-48 h-24 bg-gray-200 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
                <Typography variant="body2" color="secondary">md</Typography>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Typography variant="body2" weight="medium" className="w-16">Grande:</Typography>
              <div className="w-64 h-32 bg-gray-200 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
                <Typography variant="body2" color="secondary">lg</Typography>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Typography variant="body2" weight="medium" className="w-16">Extra Grande:</Typography>
              <div className="w-80 h-40 bg-gray-200 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
                <Typography variant="body2" color="secondary">xl</Typography>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Modal con Scroll</Typography>
              <div className="bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300">
                <Typography variant="body2" color="secondary">
                  Cuando el contenido es muy largo, el modal muestra scroll automáticamente
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Modal con Backdrop</Typography>
              <div className="bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300">
                <Typography variant="body2" color="secondary">
                  El modal incluye un backdrop oscuro que se puede hacer clic para cerrar
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Modal con Escape</Typography>
              <div className="bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300">
                <Typography variant="body2" color="secondary">
                  Se puede cerrar presionando la tecla Escape
                </Typography>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Gestión de Usuarios</Typography>
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h5" weight="semibold">Lista de Usuarios</Typography>
                  <Button variant="primary" size="sm">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Agregar Usuario
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded text-center">
                  <Typography variant="body2" color="secondary">
                    Los modales se usan para formularios de creación y edición de usuarios
                  </Typography>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Configuración del Sistema</Typography>
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h5" weight="semibold">Configuraciones</Typography>
                  <Button variant="secondary" size="sm">
                    <ConfiguracionesIcon className="w-4 h-4 mr-1" />
                    Editar Configuración
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded text-center">
                  <Typography variant="body2" color="secondary">
                    Los modales se usan para editar configuraciones del sistema
                  </Typography>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Confirmaciones de Acciones</Typography>
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h5" weight="semibold">Acciones Destructivas</Typography>
                  <Button variant="destructive" size="sm">
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Eliminar Proyecto
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded text-center">
                  <Typography variant="body2" color="secondary">
                    Los modales se usan para confirmar acciones destructivas
                  </Typography>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderSideModalComponent = () => {

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Side Modal Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Side Modal se utiliza para mostrar contenido en un panel lateral deslizable, ideal para formularios largos, configuraciones y detalles que requieren más espacio.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">isOpen</code>
                <span>: estado de apertura del modal lateral</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onClose</code>
                <span>: función para cerrar el modal lateral</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">title</code>
                <span>: título del modal lateral</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">children</code>
                <span>: contenido del modal lateral</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">position</code>
                <span>: posición del modal (left, right)</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">width</code>
                <span>: ancho del modal lateral</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Side Modal
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Side Modal Básico</Typography>
              <Button variant="primary" onClick={() => setIsSideModalOpen(true)}>
                Abrir Side Modal
              </Button>
              {isSideModalOpen && (
                <div className="fixed inset-0 z-50 flex">
                  <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSideModalOpen(false)} />
                  <div className="relative bg-white  w-96 h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                      <Typography variant="h5" weight="semibold">Panel Lateral</Typography>
                      <Button variant="ghost" size="sm" onClick={() => setIsSideModalOpen(false)}>
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      <Typography variant="body1" color="secondary" className="mb-4">
                        Este es un ejemplo de un side modal básico que se desliza desde la izquierda.
                      </Typography>
                      <div className="space-y-4">
                        <div>
                          <Typography variant="body2" weight="medium" className="mb-2">
                            Campo de ejemplo
                          </Typography>
                          <Input placeholder="Ingresa texto aquí" />
                        </div>
                        <div>
                          <Typography variant="body2" weight="medium" className="mb-2">
                            Campo adicional
                          </Typography>
                          <Input placeholder="Otro campo" />
                        </div>
                        <div>
                          <Typography variant="body2" weight="medium" className="mb-2">
                            Área de texto
                          </Typography>
                          <Textarea placeholder="Escribe algo aquí..." rows={4} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 p-4 border-t bg-gray-50 flex-shrink-0">
                      <Button variant="primary" onClick={() => setIsSideModalOpen(false)}>
                        Guardar
                      </Button>
                      <Button variant="secondary" onClick={() => setIsSideModalOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Side Modal de Configuración</Typography>
              <Button variant="secondary" onClick={() => setIsSettingsModalOpen(true)}>
                <ConfiguracionesIcon className="w-4 h-4 mr-1" />
                Configuración
              </Button>
              {isSettingsModalOpen && (
                <div className="fixed inset-0 z-50 flex">
                  <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSettingsModalOpen(false)} />
                  <div className="relative bg-white  w-96 h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                      <Typography variant="h5" weight="semibold">Configuración del Sistema</Typography>
                      <Button variant="ghost" size="sm" onClick={() => setIsSettingsModalOpen(false)}>
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-6">
                        <div>
                          <Typography variant="h6" weight="semibold" className="mb-3">Notificaciones</Typography>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Typography variant="body2">Email notifications</Typography>
                              <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow"></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <Typography variant="body2">Push notifications</Typography>
                              <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <Typography variant="body2">SMS notifications</Typography>
                              <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Typography variant="h6" weight="semibold" className="mb-3">Tema</Typography>
                          <Select
                            placeholder="Selecciona un tema"
                            options={[
                              { value: "light", label: "Claro" },
                              { value: "dark", label: "Oscuro" },
                              { value: "auto", label: "Automático" }
                            ]}
                          />
                        </div>
                        <div>
                          <Typography variant="h6" weight="semibold" className="mb-3">Idioma</Typography>
                          <Select
                            placeholder="Selecciona un idioma"
                            options={[
                              { value: "es", label: "Español" },
                              { value: "en", label: "English" },
                              { value: "fr", label: "Français" }
                            ]}
                          />
                        </div>
                        <div>
                          <Typography variant="h6" weight="semibold" className="mb-3">Zona Horaria</Typography>
                          <Select
                            placeholder="Selecciona zona horaria"
                            options={[
                              { value: "utc-5", label: "UTC-5 (Colombia)" },
                              { value: "utc-6", label: "UTC-6 (Centro)" },
                              { value: "utc-8", label: "UTC-8 (Pacífico)" }
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 p-4 border-t bg-gray-50 flex-shrink-0">
                      <Button variant="primary" onClick={() => setIsSettingsModalOpen(false)}>
                        Guardar Cambios
                      </Button>
                      <Button variant="secondary" onClick={() => setIsSettingsModalOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Side Modal de Detalles</Typography>
              <Button variant="outline" onClick={() => setIsUserDetailsModalOpen(true)}>
                <UsuariosIcon className="w-4 h-4 mr-1" />
                Ver Detalles
              </Button>
              {isUserDetailsModalOpen && (
                <div className="fixed inset-0 z-50 flex">
                  <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsUserDetailsModalOpen(false)} />
                  <div className="relative bg-white  w-96 h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                      <Typography variant="h5" weight="semibold">Detalles del Usuario</Typography>
                      <Button variant="ghost" size="sm" onClick={() => setIsUserDetailsModalOpen(false)}>
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <UsuariosIcon className="w-8 h-8 text-gray-500" />
                          </div>
                          <Typography variant="h6" weight="semibold">Juan Pérez</Typography>
                          <Typography variant="body2" color="secondary">juan.perez@ejemplo.com</Typography>
                        </div>
                        <div>
                          <Typography variant="h6" weight="semibold" className="mb-3">Información Personal</Typography>
                          <div className="space-y-3">
                            <div>
                              <Typography variant="body2" color="secondary" className="mb-1">Rol</Typography>
                              <Typography variant="body1">Administrador</Typography>
                            </div>
                            <div>
                              <Typography variant="body2" color="secondary" className="mb-1">Departamento</Typography>
                              <Typography variant="body1">Tecnología</Typography>
                            </div>
                            <div>
                              <Typography variant="body2" color="secondary" className="mb-1">Fecha de registro</Typography>
                              <Typography variant="body1">15 de Marzo, 2024</Typography>
                            </div>
                            <div>
                              <Typography variant="body2" color="secondary" className="mb-1">Estado</Typography>
                              <Badge variant="primary">Activo</Badge>
                            </div>
                            <div>
                              <Typography variant="body2" color="secondary" className="mb-1">Último acceso</Typography>
                              <Typography variant="body1">Hace 2 horas</Typography>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Typography variant="h6" weight="semibold" className="mb-3">Permisos</Typography>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <Typography variant="body2">Gestionar usuarios</Typography>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <Typography variant="body2">Crear investigaciones</Typography>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <Typography variant="body2">Ver reportes</Typography>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 p-4 border-t bg-gray-50 flex-shrink-0">
                      <Button variant="primary" onClick={() => setIsUserDetailsModalOpen(false)}>
                        Editar
                      </Button>
                      <Button variant="secondary" onClick={() => setIsUserDetailsModalOpen(false)}>
                        Cerrar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Posiciones
          </Typography>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Typography variant="body2" weight="medium" className="w-16">Izquierda:</Typography>
              <div className="w-32 h-20 bg-gray-200 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
                <Typography variant="body2" color="secondary">Left</Typography>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Typography variant="body2" weight="medium" className="w-16">Derecha:</Typography>
              <div className="w-32 h-20 bg-gray-200 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
                <Typography variant="body2" color="secondary">Right</Typography>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Side Modal con Scroll</Typography>
              <div className="bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300">
                <Typography variant="body2" color="secondary">
                  Cuando el contenido es muy largo, el side modal muestra scroll automáticamente
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Side Modal con Backdrop</Typography>
              <div className="bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300">
                <Typography variant="body2" color="secondary">
                  El side modal incluye un backdrop oscuro que se puede hacer clic para cerrar
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Side Modal con Escape</Typography>
              <div className="bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300">
                <Typography variant="body2" color="secondary">
                  Se puede cerrar presionando la tecla Escape
                </Typography>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Formularios Largos</Typography>
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h5" weight="semibold">Crear Investigación</Typography>
                  <Button variant="primary" size="sm">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Nuevo Formulario
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded text-center">
                  <Typography variant="body2" color="secondary">
                    Los side modales se usan para formularios largos que requieren más espacio
                  </Typography>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Configuraciones Avanzadas</Typography>
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h5" weight="semibold">Configuración del Proyecto</Typography>
                  <Button variant="secondary" size="sm">
                    <ConfiguracionesIcon className="w-4 h-4 mr-1" />
                    Configuración Avanzada
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded text-center">
                  <Typography variant="body2" color="secondary">
                    Los side modales se usan para configuraciones complejas con múltiples secciones
                  </Typography>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Vistas Detalladas</Typography>
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h5" weight="semibold">Lista de Participantes</Typography>
                  <Button variant="outline" size="sm">
                    <UsuariosIcon className="w-4 h-4 mr-1" />
                    Ver Detalles Completos
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded text-center">
                  <Typography variant="body2" color="secondary">
                    Los side modales se usan para mostrar información detallada sin perder contexto
                  </Typography>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderConfirmModalComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Confirm Modal Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Confirm Modal se utiliza para confirmar acciones importantes del usuario, especialmente aquellas que son destructivas o irreversibles.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">isOpen</code>
                <span>: estado de apertura del modal</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onClose</code>
                <span>: función para cerrar el modal</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">title</code>
                <span>: título del modal de confirmación</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">message</code>
                <span>: mensaje de confirmación</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onConfirm</code>
                <span>: función a ejecutar al confirmar</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">confirmText</code>
                <span>: texto del botón de confirmación</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">cancelText</code>
                <span>: texto del botón de cancelación</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">variant</code>
                <span>: variante del modal (danger, warning, info)</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Confirm Modal
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Confirm Modal de Eliminación</Typography>
              <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
                <TrashIcon className="w-4 h-4 mr-1" />
                Eliminar Proyecto
              </Button>
              {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsDeleteModalOpen(false)} />
                  <div className="relative bg-white rounded-lg  max-w-md w-full">
                    <div className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <Typography variant="h5" weight="semibold" className="mb-2">
                            Eliminar Proyecto
                          </Typography>
                          <Typography variant="body1" color="secondary">
                            ¿Estás seguro de que deseas eliminar el proyecto "Investigación de Mercado"? Esta acción no se puede deshacer y se perderán todos los datos asociados.
                          </Typography>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button variant="destructive" onClick={() => setIsDeleteModalOpen(false)}>
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Confirm Modal de Archivo</Typography>
              <Button variant="outline" onClick={() => setIsArchiveModalOpen(true)}>
                <SaveIcon className="w-4 h-4 mr-1" />
                Archivar Investigación
              </Button>
              {isArchiveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsArchiveModalOpen(false)} />
                  <div className="relative bg-white rounded-lg  max-w-md w-full">
                    <div className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertTriangleIcon className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <Typography variant="h5" weight="semibold" className="mb-2">
                            Archivar Investigación
                          </Typography>
                          <Typography variant="body1" color="secondary">
                            ¿Estás seguro de que deseas archivar esta investigación? Se moverá a la carpeta de archivos y no será visible en la lista principal.
                          </Typography>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="secondary" onClick={() => setIsArchiveModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button variant="primary" onClick={() => setIsArchiveModalOpen(false)}>
                          Archivar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Confirm Modal de Publicación</Typography>
              <Button variant="primary" onClick={() => setIsPublishModalOpen(true)}>
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Publicar Resultados
              </Button>
              {isPublishModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsPublishModalOpen(false)} />
                  <div className="relative bg-white rounded-lg  max-w-md w-full">
                    <div className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <InfoIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <Typography variant="h5" weight="semibold" className="mb-2">
                            Publicar Resultados
                          </Typography>
                          <Typography variant="body1" color="secondary">
                            ¿Estás seguro de que deseas publicar los resultados de esta investigación? Una vez publicados, estarán disponibles para todos los usuarios autorizados.
                          </Typography>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="secondary" onClick={() => setIsPublishModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button variant="primary" onClick={() => setIsPublishModalOpen(false)}>
                          Publicar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderLinkModalComponent = () => {

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Link Modal Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Link Modal se utiliza para mostrar enlaces y URLs de manera organizada, ideal para compartir recursos, referencias y documentos relacionados.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">isOpen</code>
                <span>: estado de apertura del modal</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onClose</code>
                <span>: función para cerrar el modal</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">title</code>
                <span>: título del modal de enlaces</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">links</code>
                <span>: array de enlaces a mostrar</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">description</code>
                <span>: descripción opcional del modal</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">showCopyButton</code>
                <span>: mostrar botón de copiar enlaces</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Link Modal
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Link Modal Básico</Typography>
              <Button variant="primary" onClick={() => setIsLinksModalOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-1" />
                Ver Enlaces
              </Button>
              {isLinksModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsLinksModalOpen(false)} />
                  <div className="relative bg-white rounded-lg  max-w-lg w-full">
                    <div className="flex items-center justify-between p-4 border-b">
                      <Typography variant="h5" weight="semibold">Enlaces del Proyecto</Typography>
                      <Button variant="ghost" size="sm" onClick={() => setIsLinksModalOpen(false)}>
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <Typography variant="body1" color="secondary" className="mb-4">
                        Enlaces importantes relacionados con este proyecto de investigación.
                      </Typography>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <Typography variant="body2" weight="medium">Documento de Investigación</Typography>
                            <Typography variant="body2" color="secondary" className="text-sm">docs.google.com/document/123</Typography>
                          </div>
                          <Button variant="outline" size="sm">
                            <EditIcon className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <Typography variant="body2" weight="medium">Presentación de Resultados</Typography>
                            <Typography variant="body2" color="secondary" className="text-sm">slides.google.com/presentation/456</Typography>
                          </div>
                          <Button variant="outline" size="sm">
                            <EditIcon className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <Typography variant="body2" weight="medium">Repositorio de Datos</Typography>
                            <Typography variant="body2" color="secondary" className="text-sm">github.com/proyecto/datos</Typography>
                          </div>
                          <Button variant="outline" size="sm">
                            <EditIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end mt-4">
                        <Button variant="secondary" onClick={() => setIsLinksModalOpen(false)}>
                          Cerrar
                        </Button>
                        <Button variant="primary" onClick={() => setIsLinksModalOpen(false)}>
                          Copiar Todos
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Link Modal de Recursos</Typography>
              <Button variant="secondary" onClick={() => setIsResourcesModalOpen(true)}>
                <InfoIcon className="w-4 h-4 mr-1" />
                Recursos Adicionales
              </Button>
              {isResourcesModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsResourcesModalOpen(false)} />
                  <div className="relative bg-white rounded-lg  max-w-lg w-full">
                    <div className="flex items-center justify-between p-4 border-b">
                      <Typography variant="h5" weight="semibold">Recursos de Investigación</Typography>
                      <Button variant="ghost" size="sm" onClick={() => setIsResourcesModalOpen(false)}>
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <Typography variant="body1" color="secondary" className="mb-4">
                        Recursos útiles para complementar tu investigación.
                      </Typography>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              <Typography variant="body2" weight="bold" className="text-blue-600">📊</Typography>
                            </div>
                            <div>
                              <Typography variant="body2" weight="medium">Base de Datos Estadística</Typography>
                              <Typography variant="body2" color="secondary" className="text-sm">stats.gov.co/datos</Typography>
                            </div>
                          </div>
                          <Badge variant="primary">Oficial</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                              <Typography variant="body2" weight="bold" className="text-green-600">📚</Typography>
                            </div>
                            <div>
                              <Typography variant="body2" weight="medium">Biblioteca Digital</Typography>
                              <Typography variant="body2" color="secondary" className="text-sm">biblioteca.uniandes.edu.co</Typography>
                            </div>
                          </div>
                          <Badge variant="success">Académico</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                              <Typography variant="body2" weight="bold" className="text-purple-600">🔬</Typography>
                            </div>
                            <div>
                              <Typography variant="body2" weight="medium">Artículos Científicos</Typography>
                              <Typography variant="body2" color="secondary" className="text-sm">scholar.google.com</Typography>
                            </div>
                          </div>
                          <Badge variant="warning">Investigación</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end mt-4">
                        <Button variant="secondary" onClick={() => setIsResourcesModalOpen(false)}>
                          Cerrar
                        </Button>
                        <Button variant="primary" onClick={() => setIsResourcesModalOpen(false)}>
                          Agregar Recurso
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Link Modal de Referencias</Typography>
              <Button variant="outline" onClick={() => setIsReferencesModalOpen(true)}>
                <EditIcon className="w-4 h-4 mr-1" />
                Referencias Bibliográficas
              </Button>
              {isReferencesModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsReferencesModalOpen(false)} />
                  <div className="relative bg-white rounded-lg  max-w-lg w-full">
                    <div className="flex items-center justify-between p-4 border-b">
                      <Typography variant="h5" weight="semibold">Referencias Bibliográficas</Typography>
                      <Button variant="ghost" size="sm" onClick={() => setIsReferencesModalOpen(false)}>
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <Typography variant="body1" color="secondary" className="mb-4">
                        Referencias utilizadas en esta investigación.
                      </Typography>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Typography variant="body2" weight="medium" className="mb-1">
                            Smith, J. (2023). "Metodologías de Investigación Modernas"
                          </Typography>
                          <Typography variant="body2" color="secondary" className="text-sm mb-2">
                            Journal of Research Methods, 15(2), 45-67
                          </Typography>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <EditIcon className="w-3 h-3" />
                              Ver
                            </Button>
                            <Button variant="ghost" size="sm">
                              <SaveIcon className="w-3 h-3" />
                              Guardar
                            </Button>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Typography variant="body2" weight="medium" className="mb-1">
                            García, M. (2022). "Análisis de Datos en Ciencias Sociales"
                          </Typography>
                          <Typography variant="body2" color="secondary" className="text-sm mb-2">
                            Revista de Ciencias Sociales, 28(4), 123-145
                          </Typography>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <EditIcon className="w-3 h-3" />
                              Ver
                            </Button>
                            <Button variant="ghost" size="sm">
                              <SaveIcon className="w-3 h-3" />
                              Guardar
                            </Button>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Typography variant="body2" weight="medium" className="mb-1">
                            López, A. (2023). "Tendencias en Investigación de Mercado"
                          </Typography>
                          <Typography variant="body2" color="secondary" className="text-sm mb-2">
                            Market Research Quarterly, 12(1), 78-92
                          </Typography>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <EditIcon className="w-3 h-3" />
                              Ver
                            </Button>
                            <Button variant="ghost" size="sm">
                              <SaveIcon className="w-3 h-3" />
                              Guardar
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end mt-4">
                        <Button variant="secondary" onClick={() => setIsReferencesModalOpen(false)}>
                          Cerrar
                        </Button>
                        <Button variant="primary" onClick={() => setIsReferencesModalOpen(false)}>
                          Exportar APA
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Características
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Enlaces Organizados</Typography>
              <div className="bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300">
                <Typography variant="body2" color="secondary">
                  Los enlaces se muestran de manera organizada con títulos, URLs y acciones
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Categorización</Typography>
              <div className="bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300">
                <Typography variant="body2" color="secondary">
                  Los enlaces pueden categorizarse con badges y colores para mejor organización
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Acciones Rápidas</Typography>
              <div className="bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300">
                <Typography variant="body2" color="secondary">
                  Botones para copiar, editar y gestionar enlaces directamente desde el modal
                </Typography>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Gestión de Proyectos</Typography>
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h5" weight="semibold">Proyecto de Investigación</Typography>
                  <Button variant="primary" size="sm">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Gestionar Enlaces
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded text-center">
                  <Typography variant="body2" color="secondary">
                    Los link modales se usan para gestionar enlaces de documentos y recursos del proyecto
                  </Typography>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Compartir Recursos</Typography>
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h5" weight="semibold">Recursos Académicos</Typography>
                  <Button variant="secondary" size="sm">
                    <InfoIcon className="w-4 h-4 mr-1" />
                    Compartir Enlaces
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded text-center">
                  <Typography variant="body2" color="secondary">
                    Los link modales se usan para compartir recursos y referencias académicas
                  </Typography>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Bibliografía</Typography>
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h5" weight="semibold">Referencias Bibliográficas</Typography>
                  <Button variant="outline" size="sm">
                    <EditIcon className="w-4 h-4 mr-1" />
                    Ver Referencias
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded text-center">
                  <Typography variant="body2" color="secondary">
                    Los link modales se usan para mostrar y gestionar referencias bibliográficas
                  </Typography>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderAvatarComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Avatar Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Avatar se utiliza para mostrar imágenes de perfil de usuarios, con soporte para fallbacks, diferentes tamaños y estados.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">src</code>
                <span>: URL de la imagen del avatar</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">alt</code>
                <span>: texto alternativo para accesibilidad</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">size</code>
                <span>: tamaño del avatar (sm, md, lg, xl)</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">fallback</code>
                <span>: texto o icono de respaldo</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">status</code>
                <span>: estado del usuario (online, offline, away)</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onClick</code>
                <span>: función callback al hacer clic</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Avatar
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Avatar con Imagen</Typography>
              <div className="flex items-center gap-4">
                <SimpleAvatar src="/api/placeholder/40/40" />
                <SimpleAvatar src="/api/placeholder/60/60" />
                <SimpleAvatar src="/api/placeholder/80/80" />
                <SimpleAvatar src="/api/placeholder/100/100" />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Avatar con Fallback</Typography>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  JP
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                  MG
                </div>
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                  AL
                </div>
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white font-medium">
                  SM
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Avatar con Estado</Typography>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <SimpleAvatar src="/api/placeholder/40/40" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="relative">
                  <SimpleAvatar src="/api/placeholder/40/40" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="relative">
                  <SimpleAvatar src="/api/placeholder/40/40" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="relative">
                  <SimpleAvatar src="/api/placeholder/40/40" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tamaños
          </Typography>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Typography variant="body2" weight="medium" className="w-16">Pequeño:</Typography>
              <SimpleAvatar src="/api/placeholder/32/32" />
              <Typography variant="body2" color="secondary">32px</Typography>
            </div>
            <div className="flex items-center gap-4">
              <Typography variant="body2" weight="medium" className="w-16">Mediano:</Typography>
              <SimpleAvatar src="/api/placeholder/40/40" />
              <Typography variant="body2" color="secondary">40px</Typography>
            </div>
            <div className="flex items-center gap-4">
              <Typography variant="body2" weight="medium" className="w-16">Grande:</Typography>
              <SimpleAvatar src="/api/placeholder/60/60" />
              <Typography variant="body2" color="secondary">60px</Typography>
            </div>
            <div className="flex items-center gap-4">
              <Typography variant="body2" weight="medium" className="w-16">Extra Grande:</Typography>
              <SimpleAvatar src="/api/placeholder/80/80" />
              <Typography variant="body2" color="secondary">80px</Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Estados de Conexión</Typography>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                  <Typography variant="body2">Online</Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
                  <Typography variant="body2">Away</Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                  <Typography variant="body2">Busy</Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                  <Typography variant="body2">Offline</Typography>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Avatar Interactivo</Typography>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium cursor-pointer hover:bg-blue-600 transition-colors">
                  JP
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-medium cursor-pointer hover:bg-green-600 transition-colors">
                  MG
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium cursor-pointer hover:bg-purple-600 transition-colors">
                  AL
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Avatar con Badge</Typography>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <SimpleAvatar src="/api/placeholder/40/40" />
                  <Badge variant="primary" className="absolute -top-1 -right-1 text-xs">3</Badge>
                </div>
                <div className="relative">
                  <SimpleAvatar src="/api/placeholder/40/40" />
                  <Badge variant="success" className="absolute -top-1 -right-1 text-xs">Nuevo</Badge>
                </div>
                <div className="relative">
                  <SimpleAvatar src="/api/placeholder/40/40" />
                  <Badge variant="warning" className="absolute -top-1 -right-1 text-xs">!</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Variantes
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Simple Avatar</Typography>
              <div className="flex items-center gap-4">
                <SimpleAvatar src="/api/placeholder/40/40" />
                <div>
                  <Typography variant="body2" weight="medium">Simple Avatar</Typography>
                  <Typography variant="body2" color="secondary">Avatar básico con imagen</Typography>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">User Avatar</Typography>
              <div className="flex items-center gap-4">
                <UserAvatar src="/api/placeholder/40/40" />
                <div>
                  <Typography variant="body2" weight="medium">User Avatar</Typography>
                  <Typography variant="body2" color="secondary">Avatar con funcionalidades de usuario</Typography>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Robust Avatar</Typography>
              <div className="flex items-center gap-4">
                <RobustAvatar src="/api/placeholder/40/40" />
                <div>
                  <Typography variant="body2" weight="medium">Robust Avatar</Typography>
                  <Typography variant="body2" color="secondary">Avatar con características avanzadas</Typography>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Lista de Usuarios</Typography>
              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <SimpleAvatar src="/api/placeholder/40/40" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <Typography variant="body2" weight="medium">Juan Pérez</Typography>
                      <Typography variant="body2" color="secondary">Administrador</Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <SimpleAvatar src="/api/placeholder/40/40" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <Typography variant="body2" weight="medium">María García</Typography>
                      <Typography variant="body2" color="secondary">Editor</Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <SimpleAvatar src="/api/placeholder/40/40" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <Typography variant="body2" weight="medium">Carlos López</Typography>
                      <Typography variant="body2" color="secondary">Usuario</Typography>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Equipo de Proyecto</Typography>
              <Card className="p-4">
                <Typography variant="h5" weight="semibold" className="mb-3">Miembros del Equipo</Typography>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <SimpleAvatar src="/api/placeholder/32/32" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                  </div>
                  <div className="relative">
                    <SimpleAvatar src="/api/placeholder/32/32" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-500 rounded-full border border-white"></div>
                  </div>
                  <div className="relative">
                    <SimpleAvatar src="/api/placeholder/32/32" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                  </div>
                  <div className="relative">
                    <SimpleAvatar src="/api/placeholder/32/32" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-white"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Typography variant="body2" color="secondary" className="text-xs">+2</Typography>
                  </div>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Perfil de Usuario</Typography>
              <Card className="p-4">
                <div className="text-center">
                  <div className="relative mx-auto mb-3">
                    <SimpleAvatar src="/api/placeholder/80/80" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <Typography variant="h6" weight="semibold">Ana Martínez</Typography>
                  <Typography variant="body2" color="secondary">Investigadora Senior</Typography>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="primary">Activo</Badge>
                    <Badge variant="success">Verificado</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderUserSelectorComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            User Selector Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente User Selector se utiliza para seleccionar usuarios de una lista, con soporte para búsqueda, filtros y selección múltiple.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">users</code>
                <span>: array de usuarios disponibles</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onSelect</code>
                <span>: función callback cuando se selecciona un usuario</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">selectedUsers</code>
                <span>: array de usuarios seleccionados</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">multiple</code>
                <span>: permite selección múltiple</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">searchable</code>
                <span>: habilita búsqueda de usuarios</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">placeholder</code>
                <span>: texto de placeholder</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">disabled</code>
                <span>: deshabilita el selector</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Selector
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Selector Simple</Typography>
              <div className="max-w-md">
                <div className="border border-muted rounded-lg p-3">
                  <div className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                    <SimpleAvatar src="/api/placeholder/32/32" />
                    <div className="flex-1">
                      <Typography variant="body2" weight="medium">Juan Pérez</Typography>
                      <Typography variant="body2" color="secondary" className="text-xs">juan@example.com</Typography>
                    </div>
                    <div className="w-4 h-4 border-2 border-primary rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Selector con Búsqueda</Typography>
              <div className="max-w-md">
                <div className="border border-muted rounded-lg">
                  <div className="p-3 border-b border-muted">
                    <Input placeholder="Buscar usuarios..." className="w-full" />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <div className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                      <SimpleAvatar src="/api/placeholder/32/32" />
                      <div className="flex-1">
                        <Typography variant="body2" weight="medium">María García</Typography>
                        <Typography variant="body2" color="secondary" className="text-xs">maria@example.com</Typography>
                      </div>
                      <div className="w-4 h-4 border-2 border-primary rounded bg-primary"></div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                      <SimpleAvatar src="/api/placeholder/32/32" />
                      <div className="flex-1">
                        <Typography variant="body2" weight="medium">Carlos López</Typography>
                        <Typography variant="body2" color="secondary" className="text-xs">carlos@example.com</Typography>
                      </div>
                      <div className="w-4 h-4 border-2 border-muted rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Selector Múltiple</Typography>
              <div className="max-w-md">
                <div className="border border-muted rounded-lg p-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-full">
                      <SimpleAvatar src="/api/placeholder/24/24" />
                      <Typography variant="body2" className="text-xs">Juan Pérez</Typography>
                      <button className="w-4 h-4 rounded-full bg-primary text-white text-xs flex items-center justify-center">×</button>
                    </div>
                    <div className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-full">
                      <SimpleAvatar src="/api/placeholder/24/24" />
                      <Typography variant="body2" className="text-xs">María García</Typography>
                      <button className="w-4 h-4 rounded-full bg-primary text-white text-xs flex items-center justify-center">×</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                    <SimpleAvatar src="/api/placeholder/32/32" />
                    <div className="flex-1">
                      <Typography variant="body2" weight="medium">Carlos López</Typography>
                      <Typography variant="body2" color="secondary" className="text-xs">carlos@example.com</Typography>
                    </div>
                    <div className="w-4 h-4 border-2 border-muted rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Estados del Selector</Typography>
              <div className="space-y-3">
                <div className="max-w-md">
                  <Typography variant="body2" weight="medium" className="mb-2">Normal</Typography>
                  <div className="border border-muted rounded-lg p-3">
                    <div className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                      <SimpleAvatar src="/api/placeholder/32/32" />
                      <div className="flex-1">
                        <Typography variant="body2" weight="medium">Usuario Activo</Typography>
                        <Typography variant="body2" color="secondary" className="text-xs">usuario@example.com</Typography>
                      </div>
                      <div className="w-4 h-4 border-2 border-primary rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="max-w-md">
                  <Typography variant="body2" weight="medium" className="mb-2">Deshabilitado</Typography>
                  <div className="border border-muted rounded-lg p-3 bg-muted/50">
                    <div className="flex items-center gap-3 p-2 rounded opacity-50">
                      <SimpleAvatar src="/api/placeholder/32/32" />
                      <div className="flex-1">
                        <Typography variant="body2" weight="medium">Usuario Deshabilitado</Typography>
                        <Typography variant="body2" color="secondary" className="text-xs">usuario@example.com</Typography>
                      </div>
                      <div className="w-4 h-4 border-2 border-muted rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="max-w-md">
                  <Typography variant="body2" weight="medium" className="mb-2">Cargando</Typography>
                  <div className="border border-muted rounded-lg p-3">
                    <div className="flex items-center gap-3 p-2">
                      <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                      </div>
                      <div className="w-4 h-4 border-2 border-muted rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Estados de Usuario</Typography>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Typography variant="body2">Disponible</Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <Typography variant="body2">Ausente</Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <Typography variant="body2">Ocupado</Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <Typography variant="body2">Desconectado</Typography>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Variantes
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Selector Compacto</Typography>
              <div className="max-w-md">
                <div className="border border-muted rounded-lg p-2">
                  <div className="flex items-center gap-2 p-1 hover:bg-muted rounded cursor-pointer">
                    <SimpleAvatar src="/api/placeholder/24/24" />
                    <Typography variant="body2" weight="medium">Usuario Compacto</Typography>
                    <div className="w-3 h-3 border border-primary rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Selector con Roles</Typography>
              <div className="max-w-md">
                <div className="border border-muted rounded-lg p-3">
                  <div className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                    <SimpleAvatar src="/api/placeholder/32/32" />
                    <div className="flex-1">
                      <Typography variant="body2" weight="medium">Admin Usuario</Typography>
                      <div className="flex items-center gap-2">
                        <Typography variant="body2" color="secondary" className="text-xs">admin@example.com</Typography>
                        <Badge variant="primary" className="text-xs">Admin</Badge>
                      </div>
                    </div>
                    <div className="w-4 h-4 border-2 border-primary rounded bg-primary"></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Selector con Avatar Grande</Typography>
              <div className="max-w-md">
                <div className="border border-muted rounded-lg p-3">
                  <div className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                    <SimpleAvatar src="/api/placeholder/48/48" />
                    <div className="flex-1">
                      <Typography variant="body1" weight="medium">Usuario Grande</Typography>
                      <Typography variant="body2" color="secondary">usuario@example.com</Typography>
                    </div>
                    <div className="w-4 h-4 border-2 border-primary rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Asignación de Tareas</Typography>
              <Card className="p-4">
                <Typography variant="h5" weight="semibold" className="mb-3">Asignar Usuario</Typography>
                <div className="max-w-md">
                  <div className="border border-muted rounded-lg">
                    <div className="p-3 border-b border-muted">
                      <Input placeholder="Buscar usuarios para asignar..." className="w-full" />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <div className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                        <SimpleAvatar src="/api/placeholder/32/32" />
                        <div className="flex-1">
                          <Typography variant="body2" weight="medium">Juan Pérez</Typography>
                          <div className="flex items-center gap-2">
                            <Typography variant="body2" color="secondary" className="text-xs">juan@example.com</Typography>
                            <Badge variant="success" className="text-xs">Disponible</Badge>
                          </div>
                        </div>
                        <div className="w-4 h-4 border-2 border-primary rounded"></div>
                      </div>
                      <div className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                        <SimpleAvatar src="/api/placeholder/32/32" />
                        <div className="flex-1">
                          <Typography variant="body2" weight="medium">María García</Typography>
                          <div className="flex items-center gap-2">
                            <Typography variant="body2" color="secondary" className="text-xs">maria@example.com</Typography>
                            <Badge variant="warning" className="text-xs">Ocupada</Badge>
                          </div>
                        </div>
                        <div className="w-4 h-4 border-2 border-muted rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Equipo de Proyecto</Typography>
              <Card className="p-4">
                <Typography variant="h5" weight="semibold" className="mb-3">Seleccionar Miembros</Typography>
                <div className="max-w-md">
                  <div className="border border-muted rounded-lg p-3">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-full">
                        <SimpleAvatar src="/api/placeholder/24/24" />
                        <Typography variant="body2" className="text-xs">Juan Pérez</Typography>
                        <button className="w-4 h-4 rounded-full bg-primary text-white text-xs flex items-center justify-center">×</button>
                      </div>
                      <div className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-full">
                        <SimpleAvatar src="/api/placeholder/24/24" />
                        <Typography variant="body2" className="text-xs">María García</Typography>
                        <button className="w-4 h-4 rounded-full bg-primary text-white text-xs flex items-center justify-center">×</button>
                      </div>
                    </div>
                    <div className="text-center">
                      <Button variant="outline" size="sm">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Agregar Miembro
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Filtro de Usuarios</Typography>
              <Card className="p-4">
                <Typography variant="h5" weight="semibold" className="mb-3">Filtrar por Rol</Typography>
                <div className="flex gap-2 mb-3">
                  <Chip variant="primary">Todos</Chip>
                  <Chip variant="secondary">Administradores</Chip>
                  <Chip variant="secondary">Editores</Chip>
                  <Chip variant="secondary">Usuarios</Chip>
                </div>
                <div className="max-w-md">
                  <div className="border border-muted rounded-lg">
                    <div className="p-3 border-b border-muted">
                      <Input placeholder="Buscar usuarios..." className="w-full" />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <div className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                        <SimpleAvatar src="/api/placeholder/32/32" />
                        <div className="flex-1">
                          <Typography variant="body2" weight="medium">Admin Usuario</Typography>
                          <div className="flex items-center gap-2">
                            <Typography variant="body2" color="secondary" className="text-xs">admin@example.com</Typography>
                            <Badge variant="primary" className="text-xs">Admin</Badge>
                          </div>
                        </div>
                        <div className="w-4 h-4 border-2 border-primary rounded bg-primary"></div>
                      </div>
                      <div className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                        <SimpleAvatar src="/api/placeholder/32/32" />
                        <div className="flex-1">
                          <Typography variant="body2" weight="medium">Editor Usuario</Typography>
                          <div className="flex items-center gap-2">
                            <Typography variant="body2" color="secondary" className="text-xs">editor@example.com</Typography>
                            <Badge variant="success" className="text-xs">Editor</Badge>
                          </div>
                        </div>
                        <div className="w-4 h-4 border-2 border-muted rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderActionsMenuComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Actions Menu Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Actions Menu se utiliza para mostrar un menú de acciones disponibles, con soporte para iconos, estados y agrupación.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">actions</code>
                <span>: array de acciones disponibles</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onAction</code>
                <span>: función callback cuando se ejecuta una acción</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">trigger</code>
                <span>: elemento que activa el menú</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">placement</code>
                <span>: posición del menú (top, bottom, left, right)</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">disabled</code>
                <span>: deshabilita el menú</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">size</code>
                <span>: tamaño del menú (sm, md, lg)</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Menú
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Menú Básico</Typography>
              <div className="flex justify-center">
                <div className="relative">
                  <Button variant="ghost" size="sm">
                    <MoreVerticalIcon className="w-4 h-4" />
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-muted rounded-lg  z-50">
                    <div className="py-1">
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                        <EditIcon className="w-4 h-4" />
                        Editar
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                        <TrashIcon className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Menú con Divider</Typography>
              <div className="flex justify-center">
                <div className="relative">
                  <Button variant="ghost" size="sm">
                    <MoreVerticalIcon className="w-4 h-4" />
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-muted rounded-lg  z-50">
                    <div className="py-1">
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                        <EditIcon className="w-4 h-4" />
                        Editar
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                        <SaveIcon className="w-4 h-4" />
                        Guardar
                      </button>
                      <div className="border-t border-muted my-1"></div>
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-destructive">
                        <TrashIcon className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Menú con Estados</Typography>
              <div className="flex justify-center">
                <div className="relative">
                  <Button variant="ghost" size="sm">
                    <MoreVerticalIcon className="w-4 h-4" />
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-muted rounded-lg  z-50">
                    <div className="py-1">
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                        <EditIcon className="w-4 h-4" />
                        Editar
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" />
                        Aprobar
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 opacity-50 cursor-not-allowed">
                        <AlertTriangleIcon className="w-4 h-4" />
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Estados del Menú</Typography>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Button variant="ghost" size="sm">
                    <MoreVerticalIcon className="w-4 h-4" />
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-muted rounded-lg  z-50">
                    <div className="py-1">
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                        <EditIcon className="w-4 h-4" />
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Button variant="ghost" size="sm" disabled>
                    <MoreVerticalIcon className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Button variant="ghost" size="sm" className="opacity-50">
                    <MoreVerticalIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Estados de Acciones</Typography>
              <div className="flex justify-center">
                <div className="relative">
                  <Button variant="ghost" size="sm">
                    <MoreVerticalIcon className="w-4 h-4" />
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-muted rounded-lg  z-50">
                    <div className="py-1">
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                        <EditIcon className="w-4 h-4" />
                        Editar
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-success">
                        <CheckCircleIcon className="w-4 h-4" />
                        Aprobar
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-warning">
                        <AlertTriangleIcon className="w-4 h-4" />
                        Revisar
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-destructive">
                        <TrashIcon className="w-4 h-4" />
                        Eliminar
                      </button>
                      <button className="w-full px-4 py-2 text-left opacity-50 cursor-not-allowed flex items-center gap-2">
                        <SaveIcon className="w-4 h-4" />
                        Guardar (Deshabilitado)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Variantes
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Menú Compacto</Typography>
              <div className="flex justify-center">
                <div className="relative">
                  <Button variant="ghost" size="sm">
                    <MoreVerticalIcon className="w-3 h-3" />
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-40 bg-background border border-muted rounded-lg  z-50">
                    <div className="py-1">
                      <button className="w-full px-3 py-1.5 text-left hover:bg-muted flex items-center gap-2 text-sm">
                        <EditIcon className="w-3 h-3" />
                        Editar
                      </button>
                      <button className="w-full px-3 py-1.5 text-left hover:bg-muted flex items-center gap-2 text-sm">
                        <TrashIcon className="w-3 h-3" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Menú Grande</Typography>
              <div className="flex justify-center">
                <div className="relative">
                  <Button variant="ghost" size="lg">
                    <MoreVerticalIcon className="w-5 h-5" />
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-56 bg-background border border-muted rounded-lg  z-50">
                    <div className="py-2">
                      <button className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3">
                        <EditIcon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">Editar</div>
                          <div className="text-sm text-muted">Modificar el elemento</div>
                        </div>
                      </button>
                      <button className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3">
                        <TrashIcon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">Eliminar</div>
                          <div className="text-sm text-muted">Eliminar permanentemente</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Menú con Badges</Typography>
              <div className="flex justify-center">
                <div className="relative">
                  <Button variant="ghost" size="sm">
                    <MoreVerticalIcon className="w-4 h-4" />
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-muted rounded-lg  z-50">
                    <div className="py-1">
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <EditIcon className="w-4 h-4" />
                          Editar
                        </div>
                        <Badge variant="primary" className="text-xs">Nuevo</Badge>
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrashIcon className="w-4 h-4" />
                          Eliminar
                        </div>
                        <Badge variant="warning" className="text-xs">!</Badge>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tabla de Datos</Typography>
              <Card className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-muted">
                        <th className="text-left p-2">Usuario</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Rol</th>
                        <th className="text-left p-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-muted">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <SimpleAvatar src="/api/placeholder/32/32" />
                            <span>Juan Pérez</span>
                          </div>
                        </td>
                        <td className="p-2">juan@example.com</td>
                        <td className="p-2">
                          <Badge variant="primary">Admin</Badge>
                        </td>
                        <td className="p-2">
                          <div className="relative">
                            <Button variant="ghost" size="sm">
                              <MoreVerticalIcon className="w-4 h-4" />
                            </Button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-muted rounded-lg  z-50">
                              <div className="py-1">
                                <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                                  <EditIcon className="w-4 h-4" />
                                  Editar
                                </button>
                                <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                                  <SaveIcon className="w-4 h-4" />
                                  Duplicar
                                </button>
                                <div className="border-t border-muted my-1"></div>
                                <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-destructive">
                                  <TrashIcon className="w-4 h-4" />
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tarjeta de Proyecto</Typography>
              <Card className="p-4 max-w-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <Typography variant="h6" weight="semibold">Proyecto Alpha</Typography>
                    <Typography variant="body2" color="secondary">Desarrollo de aplicación web</Typography>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="success">En Progreso</Badge>
                      <Badge variant="primary">Alta Prioridad</Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <Button variant="ghost" size="sm">
                      <MoreVerticalIcon className="w-4 h-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-muted rounded-lg  z-50">
                      <div className="py-1">
                        <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                          <EditIcon className="w-4 h-4" />
                          Editar Proyecto
                        </button>
                        <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                          <SaveIcon className="w-4 h-4" />
                          Duplicar
                        </button>
                        <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4" />
                          Marcar Completado
                        </button>
                        <div className="border-t border-muted my-1"></div>
                        <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-destructive">
                          <TrashIcon className="w-4 h-4" />
                          Eliminar Proyecto
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Lista de Archivos</Typography>
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 hover:bg-muted rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-blue-600 font-medium">📄</span>
                      </div>
                      <div>
                        <Typography variant="body2" weight="medium">documento.pdf</Typography>
                        <Typography variant="body2" color="secondary" className="text-xs">2.5 MB • Hace 2 horas</Typography>
                      </div>
                    </div>
                    <div className="relative">
                      <Button variant="ghost" size="sm">
                        <MoreVerticalIcon className="w-4 h-4" />
                      </Button>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-muted rounded-lg  z-50">
                        <div className="py-1">
                          <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                            <EditIcon className="w-4 h-4" />
                            Renombrar
                          </button>
                          <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                            <SaveIcon className="w-4 h-4" />
                            Descargar
                          </button>
                          <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" />
                            Compartir
                          </button>
                          <div className="border-t border-muted my-1"></div>
                          <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-destructive">
                            <TrashIcon className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderGroupedActionsComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Grouped Actions Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Grouped Actions se utiliza para agrupar acciones relacionadas, combinando botones independientes con menús desplegables.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">independentActions</code>
                <span>: array de acciones independientes</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">menuActions</code>
                <span>: array de acciones del menú</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">className</code>
                <span>: clases CSS adicionales</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">disabled</code>
                <span>: deshabilita todas las acciones</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">size</code>
                <span>: tamaño de los botones (sm, md, lg)</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Agrupación
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Acciones Independientes</Typography>
              <div className="flex justify-center">
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Crear
                  </Button>
                  <Button variant="outline" size="sm">
                    <EditIcon className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Acciones con Menú</Typography>
              <div className="flex justify-center">
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Crear
                  </Button>
                  <Button variant="outline" size="sm">
                    <EditIcon className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <div className="relative">
                    <Button variant="outline" size="sm">
                      <MoreVerticalIcon className="w-4 h-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-muted rounded-lg  z-50">
                      <div className="py-1">
                        <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                          <SaveIcon className="w-4 h-4" />
                          Guardar
                        </button>
                        <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4" />
                          Aprobar
                        </button>
                        <div className="border-t border-muted my-1"></div>
                        <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-destructive">
                          <TrashIcon className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Acciones Mixtas</Typography>
              <div className="flex justify-center">
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Nuevo
                  </Button>
                  <Button variant="outline" size="sm">
                    <EditIcon className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                  <div className="relative">
                    <Button variant="outline" size="sm">
                      <MoreVerticalIcon className="w-4 h-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-muted rounded-lg  z-50">
                      <div className="py-1">
                        <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4" />
                          Aprobar
                        </button>
                        <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                          <AlertTriangleIcon className="w-4 h-4" />
                          Revisar
                        </button>
                        <div className="border-t border-muted my-1"></div>
                        <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-destructive">
                          <TrashIcon className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Estados de Acciones</Typography>
              <div className="space-y-3">
                <div className="flex justify-center">
                  <Typography variant="body2" weight="medium" className="mb-2">Normal</Typography>
                </div>
                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Crear
                    </Button>
                    <Button variant="outline" size="sm">
                      <EditIcon className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <div className="relative">
                      <Button variant="outline" size="sm">
                        <MoreVerticalIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Typography variant="body2" weight="medium" className="mb-2">Deshabilitado</Typography>
                </div>
                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" disabled>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Crear
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <EditIcon className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <div className="relative">
                      <Button variant="outline" size="sm" disabled>
                        <MoreVerticalIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Typography variant="body2" weight="medium" className="mb-2">Cargando</Typography>
                </div>
                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" disabled>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creando...
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <EditIcon className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <div className="relative">
                      <Button variant="outline" size="sm" disabled>
                        <MoreVerticalIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Variantes
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tamaño Pequeño</Typography>
              <div className="flex justify-center">
                <div className="flex items-center gap-1">
                  <Button variant="primary" size="sm">
                    <PlusIcon className="w-3 h-3 mr-1" />
                    Crear
                  </Button>
                  <Button variant="outline" size="sm">
                    <EditIcon className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <div className="relative">
                    <Button variant="outline" size="sm">
                      <MoreVerticalIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tamaño Grande</Typography>
              <div className="flex justify-center">
                <div className="flex items-center gap-3">
                  <Button variant="primary" size="lg">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Crear Nuevo
                  </Button>
                  <Button variant="outline" size="lg">
                    <EditIcon className="w-5 h-5 mr-2" />
                    Editar
                  </Button>
                  <div className="relative">
                    <Button variant="outline" size="lg">
                      <MoreVerticalIcon className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Con Badges</Typography>
              <div className="flex justify-center">
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Crear
                    <Badge variant="secondary" className="ml-2 text-xs">Nuevo</Badge>
                  </Button>
                  <Button variant="outline" size="sm">
                    <EditIcon className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <div className="relative">
                    <Button variant="outline" size="sm">
                      <MoreVerticalIcon className="w-4 h-4" />
                      <Badge variant="warning" className="absolute -top-1 -right-1 text-xs">3</Badge>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Gestión de Usuarios</Typography>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Typography variant="h5" weight="semibold">Lista de Usuarios</Typography>
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Nuevo Usuario
                    </Button>
                    <Button variant="outline" size="sm">
                      <EditIcon className="w-4 h-4 mr-2" />
                      Editar Seleccionados
                    </Button>
                    <div className="relative">
                      <Button variant="outline" size="sm">
                        <MoreVerticalIcon className="w-4 h-4" />
                      </Button>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-muted rounded-lg  z-50">
                        <div className="py-1">
                          <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                            <SaveIcon className="w-4 h-4" />
                            Exportar
                          </button>
                          <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" />
                            Activar Todos
                          </button>
                          <div className="border-t border-muted my-1"></div>
                          <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-destructive">
                            <TrashIcon className="w-4 h-4" />
                            Eliminar Seleccionados
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <Typography variant="body2" color="secondary">Tabla de usuarios aquí...</Typography>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Editor de Documentos</Typography>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Typography variant="h5" weight="semibold">Documento.docx</Typography>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <SaveIcon className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                    <Button variant="outline" size="sm">
                      <EditIcon className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <div className="relative">
                      <Button variant="outline" size="sm">
                        <MoreVerticalIcon className="w-4 h-4" />
                      </Button>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-muted rounded-lg  z-50">
                        <div className="py-1">
                          <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                            <SaveIcon className="w-4 h-4" />
                            Guardar Como
                          </button>
                          <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" />
                            Compartir
                          </button>
                          <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                            <AlertTriangleIcon className="w-4 h-4" />
                            Versión
                          </button>
                          <div className="border-t border-muted my-1"></div>
                          <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-destructive">
                            <TrashIcon className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <Typography variant="body2" color="secondary">Editor de texto aquí...</Typography>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Panel de Control</Typography>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Typography variant="h5" weight="semibold">Dashboard</Typography>
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Crear Widget
                    </Button>
                    <Button variant="outline" size="sm">
                      <EditIcon className="w-4 h-4 mr-2" />
                      Personalizar
                    </Button>
                    <div className="relative">
                      <Button variant="outline" size="sm">
                        <MoreVerticalIcon className="w-4 h-4" />
                      </Button>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-muted rounded-lg  z-50">
                        <div className="py-1">
                          <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                            <SaveIcon className="w-4 h-4" />
                            Guardar Layout
                          </button>
                          <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" />
                            Restaurar
                          </button>
                          <div className="border-t border-muted my-1"></div>
                          <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                            <AlertTriangleIcon className="w-4 h-4" />
                            Configuración
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <Typography variant="body2" color="secondary">Widget 1</Typography>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <Typography variant="body2" color="secondary">Widget 2</Typography>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <Typography variant="body2" color="secondary">Widget 3</Typography>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderSliderComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Slider Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Slider se utiliza para seleccionar valores en un rango específico, con soporte para rangos, pasos y diferentes variantes.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">min</code>
                <span>: valor mínimo del slider</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">max</code>
                <span>: valor máximo del slider</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">value</code>
                <span>: valor actual del slider</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">onChange</code>
                <span>: función callback cuando cambia el valor</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">step</code>
                <span>: incremento entre valores</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">disabled</code>
                <span>: deshabilita el slider</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">showValue</code>
                <span>: muestra el valor actual</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">variant</code>
                <span>: primary, secondary, success, warning, error</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tipos de Slider
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Slider Básico</Typography>
              <div className="max-w-md space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Typography variant="body2" color="secondary">0</Typography>
                    <Typography variant="body2" weight="medium">50</Typography>
                    <Typography variant="body2" color="secondary">100</Typography>
                  </div>
                  <div className="relative">
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-1/2 h-2 bg-primary rounded-full relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white "></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Slider con Pasos</Typography>
              <div className="max-w-md space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Typography variant="body2" color="secondary">0</Typography>
                    <Typography variant="body2" color="secondary">25</Typography>
                    <Typography variant="body2" weight="medium">50</Typography>
                    <Typography variant="body2" color="secondary">75</Typography>
                    <Typography variant="body2" color="secondary">100</Typography>
                  </div>
                  <div className="relative">
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-1/2 h-2 bg-success rounded-full relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-success rounded-full border-2 border-white "></div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <div className="w-1 h-1 bg-muted rounded-full"></div>
                      <div className="w-1 h-1 bg-muted rounded-full"></div>
                      <div className="w-1 h-1 bg-muted rounded-full"></div>
                      <div className="w-1 h-1 bg-muted rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Slider de Rango</Typography>
              <div className="max-w-md space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Typography variant="body2" color="secondary">0</Typography>
                    <Typography variant="body2" weight="medium">25 - 75</Typography>
                    <Typography variant="body2" color="secondary">100</Typography>
                  </div>
                  <div className="relative">
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-1/2 h-2 bg-warning rounded-full relative ml-1/4">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-warning rounded-full border-2 border-white "></div>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-warning rounded-full border-2 border-white "></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Estados del Slider</Typography>
              <div className="space-y-4">
                <div>
                  <Typography variant="body2" weight="medium" className="mb-2">Normal</Typography>
                  <div className="max-w-md">
                    <div className="flex justify-between mb-2">
                      <Typography variant="body2" color="secondary">0</Typography>
                      <Typography variant="body2" weight="medium">50</Typography>
                      <Typography variant="body2" color="secondary">100</Typography>
                    </div>
                    <div className="relative">
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div className="w-1/2 h-2 bg-primary rounded-full relative">
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white "></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Typography variant="body2" weight="medium" className="mb-2">Deshabilitado</Typography>
                  <div className="max-w-md">
                    <div className="flex justify-between mb-2">
                      <Typography variant="body2" color="secondary">0</Typography>
                      <Typography variant="body2" weight="medium">50</Typography>
                      <Typography variant="body2" color="secondary">100</Typography>
                    </div>
                    <div className="relative">
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div className="w-1/2 h-2 bg-muted rounded-full relative">
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-muted rounded-full border-2 border-white "></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Typography variant="body2" weight="medium" className="mb-2">Cargando</Typography>
                  <div className="max-w-md">
                    <div className="flex justify-between mb-2">
                      <Typography variant="body2" color="secondary">0</Typography>
                      <Typography variant="body2" weight="medium">Cargando...</Typography>
                      <Typography variant="body2" color="secondary">100</Typography>
                    </div>
                    <div className="relative">
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div className="w-1/2 h-2 bg-primary rounded-full relative animate-pulse">
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white "></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Variantes
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Variantes de Color</Typography>
              <div className="space-y-4">
                <div>
                  <Typography variant="body2" weight="medium" className="mb-2">Primary</Typography>
                  <div className="max-w-md">
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-3/4 h-2 bg-primary rounded-full relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white "></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Typography variant="body2" weight="medium" className="mb-2">Success</Typography>
                  <div className="max-w-md">
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-2/3 h-2 bg-success rounded-full relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-success rounded-full border-2 border-white "></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Typography variant="body2" weight="medium" className="mb-2">Warning</Typography>
                  <div className="max-w-md">
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-1/2 h-2 bg-warning rounded-full relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-warning rounded-full border-2 border-white "></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Typography variant="body2" weight="medium" className="mb-2">Error</Typography>
                  <div className="max-w-md">
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-1/4 h-2 bg-error rounded-full relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-error rounded-full border-2 border-white "></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tamaños</Typography>
              <div className="space-y-4">
                <div>
                  <Typography variant="body2" weight="medium" className="mb-2">Pequeño</Typography>
                  <div className="max-w-md">
                    <div className="w-full h-1 bg-muted rounded-full">
                      <div className="w-1/2 h-1 bg-primary rounded-full relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary rounded-full border border-white "></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Typography variant="body2" weight="medium" className="mb-2">Mediano</Typography>
                  <div className="max-w-md">
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-1/2 h-2 bg-primary rounded-full relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white "></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Typography variant="body2" weight="medium" className="mb-2">Grande</Typography>
                  <div className="max-w-md">
                    <div className="w-full h-3 bg-muted rounded-full">
                      <div className="w-1/2 h-3 bg-primary rounded-full relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-primary rounded-full border-2 border-white "></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Control de Volumen</Typography>
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                    <span className="text-lg">🔊</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <Typography variant="body2" color="secondary">0%</Typography>
                      <Typography variant="body2" weight="medium">75%</Typography>
                      <Typography variant="body2" color="secondary">100%</Typography>
                    </div>
                    <div className="relative">
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div className="w-3/4 h-2 bg-primary rounded-full relative">
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white "></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Filtro de Precio</Typography>
              <Card className="p-4">
                <Typography variant="h5" weight="semibold" className="mb-3">Rango de Precio</Typography>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Typography variant="body2" color="secondary">$0</Typography>
                      <Typography variant="body2" weight="medium">$25 - $75</Typography>
                      <Typography variant="body2" color="secondary">$100</Typography>
                    </div>
                    <div className="relative">
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div className="w-1/2 h-2 bg-success rounded-full relative ml-1/4">
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-success rounded-full border-2 border-white "></div>
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-success rounded-full border-2 border-white "></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Mínimo" className="flex-1" />
                    <Input placeholder="Máximo" className="flex-1" />
                  </div>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Configuración de Brillo</Typography>
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">☀️</span>
                      <Typography variant="body2" weight="medium">Brillo de Pantalla</Typography>
                    </div>
                    <Typography variant="body2" weight="medium">80%</Typography>
                  </div>
                  <div className="relative">
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-4/5 h-2 bg-warning rounded-full relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-warning rounded-full border-2 border-white "></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Progreso de Descarga</Typography>
              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Typography variant="body2" weight="medium">Descargando archivo.zip</Typography>
                    <Typography variant="body2" weight="medium">65%</Typography>
                  </div>
                  <div className="relative">
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div className="w-2/3 h-2 bg-primary rounded-full relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white "></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted">
                    <span>0 MB</span>
                    <span>650 MB / 1 GB</span>
                    <span>1 GB</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderCardComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Card Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente Card se utiliza para agrupar contenido relacionado en un contenedor visual con bordes y sombras.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Props disponibles:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">children</code>
                <span>: contenido del card</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">className</code>
                <span>: clases CSS adicionales</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <code className="bg-background px-1 rounded">variant</code>
                <span>: default, elevated, outlined</span>
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Variantes
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Card Básico</Typography>
              <Card className="p-4">
                <Typography variant="h5" weight="semibold" className="mb-2">Título del Card</Typography>
                <Typography variant="body1" color="secondary">
                  Este es un ejemplo de un card básico con contenido simple.
                </Typography>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Card con Acciones</Typography>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Typography variant="h5" weight="semibold">Card con Botones</Typography>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Cancelar</Button>
                    <Button variant="primary" size="sm">Guardar</Button>
                  </div>
                </div>
                <Typography variant="body1" color="secondary">
                  Este card incluye botones de acción en la parte superior.
                </Typography>
              </Card>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Tamaños y Espaciado
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Card Compacto</Typography>
              <Card className="p-3">
                <Typography variant="body2" color="secondary">
                  Card con padding reducido para contenido compacto.
                </Typography>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Card Espacioso</Typography>
              <Card className="p-8">
                <Typography variant="h5" weight="semibold" className="mb-4">Título Principal</Typography>
                <Typography variant="body1" color="secondary" className="mb-4">
                  Este card tiene más espacio interno para contenido extenso.
                </Typography>
                <div className="flex gap-3">
                  <Button variant="outline">Acción 1</Button>
                  <Button variant="primary">Acción 2</Button>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Estados
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Card Interactivo</Typography>
              <Card className="p-4 cursor-pointer hover: transition-colors">
                <Typography variant="h5" weight="semibold" className="mb-2">Card Clickeable</Typography>
                <Typography variant="body1" color="secondary">
                  Este card tiene efectos hover y es interactivo.
                </Typography>
              </Card>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Card Deshabilitado</Typography>
              <Card className="p-4 opacity-50 cursor-not-allowed">
                <Typography variant="h5" weight="semibold" className="mb-2">Card Deshabilitado</Typography>
                <Typography variant="body1" color="secondary">
                  Este card está deshabilitado y no es interactivo.
                </Typography>
              </Card>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <div className="space-y-6">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Dashboard de Métricas</Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h5" weight="semibold">1,234</Typography>
                    <Badge variant="success">+12%</Badge>
                  </div>
                  <Typography variant="body2" color="secondary">Usuarios Activos</Typography>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h5" weight="semibold">89%</Typography>
                    <Badge variant="primary">+5%</Badge>
                  </div>
                  <Typography variant="body2" color="secondary">Tasa de Retención</Typography>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h5" weight="semibold">56</Typography>
                    <Badge variant="warning">-2%</Badge>
                  </div>
                  <Typography variant="body2" color="secondary">Proyectos Activos</Typography>
                </Card>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Lista de Usuarios</Typography>
              <div className="space-y-3">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <SimpleAvatar src="/api/placeholder/40/40" />
                    <div className="flex-1">
                      <Typography variant="body1" weight="medium">Juan Pérez</Typography>
                      <Typography variant="body2" color="secondary">juan@example.com</Typography>
                    </div>
                    <Badge variant="success">Activo</Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <SimpleAvatar src="/api/placeholder/40/40" />
                    <div className="flex-1">
                      <Typography variant="body1" weight="medium">María García</Typography>
                      <Typography variant="body2" color="secondary">maria@example.com</Typography>
                    </div>
                    <Badge variant="warning">Pendiente</Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Formulario de Configuración</Typography>
              <Card className="p-6">
                <Typography variant="h5" weight="semibold" className="mb-4">Configuración de Perfil</Typography>
                <div className="space-y-4">
                  <div>
                    <Typography variant="body2" color="secondary" className="mb-2">Nombre</Typography>
                    <Input placeholder="Ingresa tu nombre" />
                  </div>
                  <div>
                    <Typography variant="body2" color="secondary" className="mb-2">Email</Typography>
                    <Input placeholder="Ingresa tu email" type="email" />
                  </div>
                  <div>
                    <Typography variant="body2" color="secondary" className="mb-2">Biografía</Typography>
                    <Textarea placeholder="Cuéntanos sobre ti" rows={3} />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline">Cancelar</Button>
                    <Button variant="primary">Guardar Cambios</Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Funciones de renderizado para componentes de Layout y Formularios
  const renderPageHeaderComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            PageHeader Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            El componente PageHeader proporciona una estructura consistente para los títulos de página.
            Incluye soporte para iconos, acciones y diferentes variantes de color.
          </Typography>
        </Card>

        <Card className="p-6">
          <Typography variant="h4" weight="semibold" className="mb-4">
            Ejemplos
          </Typography>
          
          <div className="space-y-6">
            {/* Header básico */}
            <div>
              <Typography variant="h5" weight="semibold" className="mb-2">
                Header Básico
              </Typography>
              <PageHeader
                title="Investigaciones"
                subtitle="Gestiona y organiza todas las investigaciones"
                icon={<InfoIcon className="w-5 h-5" />}
                color="blue"
              />
            </div>

            {/* Header con acciones */}
            <div>
              <Typography variant="h5" weight="semibold" className="mb-2">
                Header con Acciones
              </Typography>
              <PageHeader
                title="Usuarios"
                subtitle="Administra los usuarios del sistema"
                primaryAction={{
                  label: "Nuevo Usuario",
                  onClick: () => console.log('Crear usuario'),
                  variant: "primary"
                }}
                secondaryActions={[
                  {
                    label: "Importar",
                    onClick: () => console.log('Importar'),
                    variant: "outline"
                  }
                ]}
                color="green"
              />
            </div>

            {/* Header compacto */}
            <div>
              <Typography variant="h5" weight="semibold" className="mb-2">
                Header Compacto
              </Typography>
              <PageHeader
                title="Configuración"
                variant="compact"
                color="purple"
              />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderFormContainerComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            FormContainer Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            Contenedor flexible para formularios con elementos de entrada como Input, Select, DatePicker, etc.
          </Typography>
        </Card>

        <Card className="p-6">
          <Typography variant="h4" weight="semibold" className="mb-4">
            Ejemplos
          </Typography>
          
          <div className="space-y-6">
            {/* Formulario básico */}
            <div>
              <Typography variant="h5" weight="semibold" className="mb-2">
                Formulario Básico
              </Typography>
              <FormContainer
                title="Información Básica"
                icon={<UserIcon className="w-5 h-5" />}
                variant="default"
                padding="lg"
                spacing="md"
              >
                <FormItem layout="full">
                  <Input label="Nombre" placeholder="Ingrese nombre" />
                </FormItem>
                <FormItem layout="half">
                  <Input label="Email" type="email" placeholder="email@ejemplo.com" />
                  <Input label="Teléfono" type="tel" placeholder="+1234567890" />
                </FormItem>
              </FormContainer>
            </div>

            {/* Formulario compacto */}
            <div>
              <Typography variant="h5" weight="semibold" className="mb-2">
                Formulario Compacto
              </Typography>
              <FormContainer
                title="Configuración"
                icon={<SettingsIcon className="w-5 h-5" />}
                variant="compact"
                padding="md"
                spacing="sm"
              >
                <FormItem layout="full">
                  <Input label="API Key" placeholder="Ingrese API key" />
                </FormItem>
              </FormContainer>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderFormItemComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            FormItem Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            Elemento de formulario que proporciona layout flexible para diferentes tipos de entrada.
          </Typography>
        </Card>

        <Card className="p-6">
          <Typography variant="h4" weight="semibold" className="mb-4">
            Ejemplos
          </Typography>
          
          <div className="space-y-6">
                         <FormContainer title="Diferentes Layouts" icon={<SettingsIcon className="w-5 h-5" />}>
              <FormItem layout="full">
                <Input label="Campo Completo" placeholder="Ocupa todo el ancho" />
              </FormItem>
              <FormItem layout="half">
                <Input label="Campo 1" placeholder="Mitad del ancho" />
                <Input label="Campo 2" placeholder="Mitad del ancho" />
              </FormItem>
              <FormItem layout="third">
                <Input label="Campo 1" placeholder="Un tercio" />
                <Input label="Campo 2" placeholder="Un tercio" />
                <Input label="Campo 3" placeholder="Un tercio" />
              </FormItem>
            </FormContainer>
          </div>
        </Card>
      </div>
    );
  };

  const renderInfoContainerComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            InfoContainer Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            Contenedor para mostrar información de manera consistente en toda la plataforma.
          </Typography>
        </Card>

        <Card className="p-6">
          <Typography variant="h4" weight="semibold" className="mb-4">
            Ejemplos
          </Typography>
          
          <div className="space-y-6">
            {/* Información básica */}
            <div>
              <Typography variant="h5" weight="semibold" className="mb-2">
                Información Básica
              </Typography>
              <InfoContainer
                title="Información Personal"
                icon={<UserIcon className="w-5 h-5" />}
                variant="default"
                padding="lg"
              >
                <InfoItem label="Nombre completo" value="Juan Carlos Pérez" />
                <InfoItem label="Email" value="juan@ejemplo.com" />
                <InfoItem label="Teléfono" empty={true} />
                <InfoItem label="Departamento" value="Desarrollo" />
              </InfoContainer>
            </div>

            {/* Información de proyecto */}
            <div>
              <Typography variant="h5" weight="semibold" className="mb-2">
                Información de Proyecto
              </Typography>
              <InfoContainer
                title="Detalles del Proyecto"
                icon={<InfoIcon className="w-5 h-5" />}
                variant="elevated"
              >
                <InfoItem label="Estado" value={<Chip variant="success">Activo</Chip>} />
                <InfoItem label="Fecha de inicio" value="01/01/2024" />
                <InfoItem label="Responsable" value="María García" />
                <InfoItem label="Presupuesto" value="$50,000" />
              </InfoContainer>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderInfoItemComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            InfoItem Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            Elemento individual de información con título sutil y valor prominente.
          </Typography>
        </Card>

        <Card className="p-6">
          <Typography variant="h4" weight="semibold" className="mb-4">
            Ejemplos
          </Typography>
          
          <div className="space-y-6">
                         <InfoContainer title="Diferentes Variantes" icon={<InfoIcon className="w-5 h-5" />}>
              <InfoItem label="Básico" value="Valor normal" />
              <InfoItem label="Compacto" value="Valor compacto" variant="compact" />
              <InfoItem label="Stacked" value="Valor apilado" variant="stacked" />
              <InfoItem label="Inline" value="Valor en línea" variant="inline" />
              <InfoItem label="Vacío" empty={true} emptyMessage="Sin información" />
              <InfoItem label="Requerido" value="Valor requerido" required={true} />
            </InfoContainer>
          </div>
        </Card>
      </div>
    );
  };

  const renderSubtitleComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Subtitle Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            Componente para subtítulos con estilos consistentes.
          </Typography>
        </Card>

        <Card className="p-6">
          <Typography variant="h4" weight="semibold" className="mb-4">
            Ejemplos
          </Typography>
          
          <div className="space-y-4">
            <Subtitle>Subtítulo básico</Subtitle>
            <Subtitle size="lg">Subtítulo grande</Subtitle>
            <Subtitle size="sm">Subtítulo pequeño</Subtitle>
          </div>
        </Card>
      </div>
    );
  };

  const renderContainerTitleComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            ContainerTitle Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            Título consistente para contenedores de información con el mismo estilo sutil que PageHeader.
          </Typography>
        </Card>

        <Card className="p-6">
          <Typography variant="h4" weight="semibold" className="mb-4">
            Ejemplos
          </Typography>
          
          <div className="space-y-6">
            <ContainerTitle title="Información de Contacto" />
            <ContainerTitle 
              title="Detalles del Usuario"
              icon={<UserIcon className="w-5 h-5" />}
              size="lg"
            />
            <ContainerTitle 
              title="Resumen"
              alignment="center"
              size="sm"
            />
          </div>
        </Card>
      </div>
    );
  };

  const renderFilterLabelComponent = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            FilterLabel Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            Etiqueta para filtros con estilos consistentes.
          </Typography>
        </Card>

        <Card className="p-6">
          <Typography variant="h4" weight="semibold" className="mb-4">
            Ejemplos
          </Typography>
          
          <div className="space-y-4">
            <FilterLabel>Filtro básico</FilterLabel>
            <Input placeholder="Valor del filtro" />
            
            <FilterLabel>Filtro con clase personalizada</FilterLabel>
            <Input placeholder="Filtro personalizado" className="mt-2" />
          </div>
        </Card>
      </div>
    );
  };

  const renderParticipantCardComponent = () => {
    // Datos de ejemplo para las cards
    const participanteExterno = {
      id: '1',
      nombre: 'Juan Pérez',
      email: 'juan.perez@empresa.com',
      tipo: 'externo',
      empresa_nombre: 'TechCorp',
      rol_empresa: 'Desarrollador Senior',
      estado_agendamiento: 'Agendada',
      fecha_sesion: '2025-08-28T10:00:00Z',
      hora_sesion: '10:00:00',
      duracion_sesion: 60,
      responsable_agendamiento: {
        nombre: 'María García',
        full_name: 'María García'
      }
    };

    const participanteInterno = {
      id: '2',
      nombre: 'Ana López',
      email: 'ana.lopez@nuestraempresa.com',
      tipo: 'interno',
      empresa_nombre: 'Nuestra Empresa',
      rol_empresa: 'Product Manager',
      estado_agendamiento: 'En progreso',
      fecha_sesion: '2025-08-29T14:00:00Z',
      hora_sesion: '14:00:00',
      duracion_sesion: 90,
      responsable_agendamiento: {
        nombre: 'Carlos Ruiz',
        full_name: 'Carlos Ruiz'
      }
    };

    const participanteFriendFamily = {
      id: '3',
      nombre: 'Roberto Silva',
      email: 'roberto.silva@email.com',
      tipo: 'friend_family',
      estado_agendamiento: 'Pendiente de agendamiento',
      responsable_agendamiento: {
        nombre: 'Laura Martínez',
        full_name: 'Laura Martínez'
      }
    };

    return (
      <div className="space-y-8">
        {/* Descripción */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            ParticipantCard Component
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-4">
            Componente especializado para mostrar información de participantes en reclutamientos. 
            Maneja diferentes tipos de participantes (externo, interno, friend & family) y estados 
            especiales como "Pendiente de agendamiento".
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Características principales:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <span>Maneja 3 tipos de participantes: Externo, Interno, Friend & Family</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <span>Estado especial para "Pendiente de agendamiento"</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <span>Iconos específicos según el tipo de participante</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <span>Botones de acción consistentes (editar, eliminar)</span>
              </Typography>
              <Typography variant="body2" color="muted" className="flex items-center gap-2">
                <span>•</span>
                <span>Colores suaves siguiendo los lineamientos del sistema</span>
              </Typography>
            </div>
          </div>
        </Card>

        {/* Ejemplos */}
        <Card className="p-6">
          <Typography variant="h4" weight="semibold" className="mb-4">
            Ejemplos de Cards
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Diferentes variantes del componente según el tipo de participante y estado.
          </Typography>
          
          <div className="space-y-6">
            {/* Participante Externo */}
            <div>
              <Typography variant="h5" weight="semibold" className="mb-3">
                Participante Externo
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Participante de empresa externa con información completa.
              </Typography>
              <div className="max-w-2xl">
                <ParticipantCard
                  participante={participanteExterno}
                  onEdit={() => console.log('Editar participante externo')}
                  onDelete={() => console.log('Eliminar participante externo')}
                />
              </div>
            </div>

            {/* Participante Interno */}
            <div>
              <Typography variant="h5" weight="semibold" className="mb-3">
                Participante Interno
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Participante interno de la empresa con información de departamento.
              </Typography>
              <div className="max-w-2xl">
                <ParticipantCard
                  participante={participanteInterno}
                  onEdit={() => console.log('Editar participante interno')}
                  onDelete={() => console.log('Eliminar participante interno')}
                />
              </div>
            </div>

            {/* Participante Friend & Family */}
            <div>
              <Typography variant="h5" weight="semibold" className="mb-3">
                Participante Friend & Family
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Participante de tipo friend & family con información básica.
              </Typography>
              <div className="max-w-2xl">
                <ParticipantCard
                  participante={participanteFriendFamily}
                  onEdit={() => console.log('Editar participante friend & family')}
                  onDelete={() => console.log('Eliminar participante friend & family')}
                  onConvertAgendamiento={() => console.log('Convertir agendamiento')}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Props y Uso */}
        <Card className="p-6">
          <Typography variant="h4" weight="semibold" className="mb-4">
            Props y Uso
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="h5" weight="semibold" className="mb-2">
                Props disponibles:
              </Typography>
              <div className="space-y-1">
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">participante</code>
                  <span>: Objeto con datos del participante (requerido)</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">onEdit</code>
                  <span>: Función para editar participante (opcional)</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">onDelete</code>
                  <span>: Función para eliminar participante (opcional)</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">onConvertAgendamiento</code>
                  <span>: Función para convertir agendamiento pendiente (opcional)</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">onViewMore</code>
                  <span>: Función para ver más detalles del participante (opcional)</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">className</code>
                  <span>: Clases CSS adicionales (opcional)</span>
                </Typography>
              </div>
            </div>

            <div>
              <Typography variant="h5" weight="semibold" className="mb-2">
                Uso básico:
              </Typography>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
{`<ParticipantCard
  participante={participanteData}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onViewMore={handleViewMore}
/>`}
                </pre>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderComponentContent = () => {
    if (activeComponent === 'button') {
      return renderButtonComponent();
    }
    
    if (activeComponent === 'text-input') {
      return (
        <div className="space-y-8">
          {/* Descripción */}
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Input Component
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-4">
              El componente Input es la base para la entrada de texto en formularios. 
              Proporciona múltiples variantes, tamaños y estados para diferentes tipos de entrada.
            </Typography>
            <div className="bg-muted p-4 rounded-lg">
              <Typography variant="h5" weight="semibold" className="mb-2">
                Props disponibles:
              </Typography>
              <div className="space-y-1">
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">type</code>
                  <span>: text, email, password, number, tel, url</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">size</code>
                  <span>: sm, md, lg</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">placeholder</code>
                  <span>: texto de placeholder</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">disabled</code>
                  <span>: boolean para estado deshabilitado</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">error</code>
                  <span>: boolean para estado de error</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">icon</code>
                  <span>: ReactNode para mostrar iconos</span>
                </Typography>
              </div>
            </div>
          </Card>

          {/* Tipos de Input */}
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Tipos de Input
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Diferentes tipos de entrada para distintos contextos de uso.
            </Typography>
            
            <div className="space-y-6">
              {/* Text */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Text
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Entrada de texto básica para nombres, títulos, etc.
                </Typography>
                <div className="flex flex-wrap gap-4">
                  <div className="w-64">
                    <Input type="text" placeholder="Nombre completo" />
                  </div>
                  <div className="w-64">
                    <Input type="text" placeholder="Apellido" size="sm" />
                  </div>
                  <div className="w-64">
                    <Input type="text" placeholder="Título" size="lg" />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Email
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Entrada específica para direcciones de correo electrónico.
                </Typography>
                <div className="flex flex-wrap gap-4">
                  <div className="w-64">
                    <Input type="email" placeholder="correo@ejemplo.com" />
                  </div>
                  <div className="w-64">
                    <Input type="email" placeholder="correo@ejemplo.com" icon={<PlusIcon className="w-4 h-4" />} />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Password
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Entrada segura para contraseñas con ocultación automática.
                </Typography>
                <div className="flex flex-wrap gap-4">
                  <div className="w-64">
                    <Input type="password" placeholder="Contraseña" />
                  </div>
                  <div className="w-64">
                    <Input type="password" placeholder="Confirmar contraseña" />
                  </div>
                </div>
              </div>

              {/* Number */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Number
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Entrada numérica para cantidades, edades, etc.
                </Typography>
                <div className="flex flex-wrap gap-4">
                  <div className="w-64">
                    <Input type="number" placeholder="Edad" />
                  </div>
                  <div className="w-64">
                    <Input type="number" placeholder="Cantidad" />
                  </div>
                </div>
              </div>

              {/* Tel */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Teléfono
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Entrada para números de teléfono.
                </Typography>
                <div className="flex flex-wrap gap-4">
                  <div className="w-64">
                    <Input type="tel" placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
              </div>

              {/* URL */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  URL
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Entrada para direcciones web.
                </Typography>
                <div className="flex flex-wrap gap-4">
                  <div className="w-64">
                    <Input type="url" placeholder="https://ejemplo.com" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Estados */}
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Estados
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Diferentes estados del input para feedback visual.
            </Typography>
            
            <div className="space-y-6">
              {/* Con Iconos */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Con Iconos
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Inputs con iconos para mejorar la comprensión visual.
                </Typography>
                <div className="flex flex-wrap gap-4">
                  <div className="w-64">
                    <Input placeholder="Buscar..." icon={<PlusIcon className="w-4 h-4" />} />
                  </div>
                  <div className="w-64">
                    <Input placeholder="Correo electrónico" icon={<PlusIcon className="w-4 h-4" />} />
                  </div>
                </div>
              </div>

              {/* Error y Disabled */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Error y Disabled
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Estados para indicar errores o deshabilitación.
                </Typography>
                <div className="flex flex-wrap gap-4">
                  <div className="w-64">
                    <Input placeholder="Campo con error" error="Campo requerido" />
                  </div>
                  <div className="w-64">
                    <Input placeholder="Campo deshabilitado" disabled />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Ejemplos de Uso */}
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Ejemplos de Uso
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Casos de uso comunes y patrones recomendados.
            </Typography>
            
            <div className="space-y-6">
              {/* Formulario de Registro */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Formulario de Registro
                </Typography>
                <div className="space-y-4 max-w-md">
                  <Input placeholder="Nombre completo" />
                  <Input type="email" placeholder="Correo electrónico" />
                  <Input type="password" placeholder="Contraseña" />
                  <Input type="password" placeholder="Confirmar contraseña" />
                </div>
              </div>

              {/* Formulario de Contacto */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Formulario de Contacto
                </Typography>
                <div className="space-y-4 max-w-md">
                  <Input placeholder="Nombre" />
                  <Input type="email" placeholder="Email" />
                  <Input type="tel" placeholder="Teléfono" />
                  <Input placeholder="Asunto" />
                </div>
              </div>

              {/* Búsqueda */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Búsqueda
                </Typography>
                <div className="max-w-md">
                  <Input placeholder="Buscar..." icon={<PlusIcon className="w-4 h-4" />} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    }
    
    if (activeComponent === 'textarea') {
      return (
        <div className="space-y-8">
          {/* Descripción */}
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Textarea Component
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-4">
              El componente Textarea es la base para la entrada de texto multilínea en formularios. 
              Proporciona múltiples tamaños, estados y opciones de redimensionamiento.
            </Typography>
            <div className="bg-muted p-4 rounded-lg">
              <Typography variant="h5" weight="semibold" className="mb-2">
                Props disponibles:
              </Typography>
              <div className="space-y-1">
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">placeholder</code>
                  <span>: texto de placeholder</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">size</code>
                  <span>: sm, md, lg</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">rows</code>
                  <span>: número de filas iniciales</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">label</code>
                  <span>: etiqueta del campo</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">helperText</code>
                  <span>: texto de ayuda</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">error</code>
                  <span>: mensaje de error</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">disabled</code>
                  <span>: boolean para estado deshabilitado</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">resize</code>
                  <span>: vertical, horizontal, both, none</span>
                </Typography>
              </div>
            </div>
          </Card>

          {/* Tamaños */}
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Tamaños
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Diferentes tamaños para adaptarse a distintos contextos de uso.
            </Typography>
            
            <div className="space-y-6">
              {/* Small */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Small
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Tamaño pequeño para entradas de texto cortas.
                </Typography>
                <div className="space-y-2">
                  <Textarea size="sm" placeholder="Descripción corta..." rows={2} />
                  <Textarea size="sm" placeholder="Comentario breve..." rows={2} />
                </div>
              </div>

              {/* Medium */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Medium
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Tamaño estándar para la mayoría de casos de uso.
                </Typography>
                <div className="space-y-2">
                  <Textarea placeholder="Descripción del proyecto..." rows={3} />
                  <Textarea placeholder="Instrucciones detalladas..." rows={3} />
                </div>
              </div>

              {/* Large */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Large
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Tamaño grande para contenido extenso.
                </Typography>
                <div className="space-y-2">
                  <Textarea size="lg" placeholder="Contenido extenso..." rows={5} />
                  <Textarea size="lg" placeholder="Documentación completa..." rows={5} />
                </div>
              </div>
            </div>
          </Card>

          {/* Estados */}
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Estados
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Diferentes estados del textarea para feedback visual.
            </Typography>
            
            <div className="space-y-6">
              {/* Con Label y Helper Text */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Con Label y Helper Text
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Textarea con etiqueta y texto de ayuda para mejor comprensión.
                </Typography>
                <div className="space-y-2">
                  <Textarea 
                    label="Descripción del Proyecto" 
                    placeholder="Describe los objetivos y alcance del proyecto..." 
                    helperText="Proporciona una descripción clara y concisa del proyecto" 
                    rows={3} 
                  />
                  <Textarea 
                    label="Notas Adicionales" 
                    placeholder="Información adicional relevante..." 
                    helperText="Opcional: incluye cualquier información adicional que consideres importante" 
                    rows={2} 
                  />
                </div>
              </div>

              {/* Con Error */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Con Error
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Estados de error para indicar problemas de validación.
                </Typography>
                <div className="space-y-2">
                  <Textarea 
                    placeholder="Descripción requerida..." 
                    error="La descripción es obligatoria y debe tener al menos 10 caracteres" 
                    rows={3} 
                  />
                  <Textarea 
                    placeholder="Contenido con formato incorrecto..." 
                    error="El formato del contenido no es válido" 
                    rows={3} 
                  />
                </div>
              </div>

              {/* Deshabilitado */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Deshabilitado
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Estado deshabilitado para campos no editables.
                </Typography>
                <div className="space-y-2">
                  <Textarea 
                    placeholder="Campo deshabilitado..." 
                    disabled 
                    rows={3} 
                  />
                  <Textarea 
                    placeholder="Contenido de solo lectura..." 
                    disabled 
                    rows={3} 
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Redimensionamiento */}
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Redimensionamiento
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Diferentes opciones de redimensionamiento para adaptarse a las necesidades del usuario.
            </Typography>
            
            <div className="space-y-6">
              {/* Vertical */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Vertical
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Permite redimensionar solo verticalmente.
                </Typography>
                <Textarea 
                  placeholder="Redimensiona verticalmente..." 
                  resize="vertical" 
                  rows={3} 
                />
              </div>

              {/* Horizontal */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Horizontal
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Permite redimensionar solo horizontalmente.
                </Typography>
                <Textarea 
                  placeholder="Redimensiona horizontalmente..." 
                  resize="horizontal" 
                  rows={3} 
                />
              </div>

              {/* Ambas */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Ambas Direcciones
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Permite redimensionar tanto vertical como horizontalmente.
                </Typography>
                <Textarea 
                  placeholder="Redimensiona en ambas direcciones..." 
                  resize="both" 
                  rows={3} 
                />
              </div>

              {/* Ninguna */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Sin Redimensionamiento
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Tamaño fijo sin posibilidad de redimensionar.
                </Typography>
                <Textarea 
                  placeholder="Tamaño fijo..." 
                  resize="none" 
                  rows={3} 
                />
              </div>
            </div>
          </Card>

          {/* Ejemplos de Uso */}
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Ejemplos de Uso
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Casos de uso comunes y patrones recomendados.
            </Typography>
            
            <div className="space-y-6">
              {/* Formulario de Proyecto */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Formulario de Proyecto
                </Typography>
                <div className="space-y-4 max-w-2xl">
                  <Textarea 
                    label="Descripción del Proyecto" 
                    placeholder="Describe los objetivos, alcance y características principales del proyecto..." 
                    helperText="Proporciona una descripción clara y detallada" 
                    rows={4} 
                  />
                  <Textarea 
                    label="Requerimientos Técnicos" 
                    placeholder="Lista los requerimientos técnicos, tecnologías a utilizar, y especificaciones..." 
                    helperText="Incluye todos los detalles técnicos relevantes" 
                    rows={3} 
                  />
                  <Textarea 
                    label="Notas Adicionales" 
                    placeholder="Información adicional, consideraciones especiales, o notas importantes..." 
                    helperText="Opcional: cualquier información adicional relevante" 
                    rows={2} 
                  />
                </div>
              </div>

              {/* Formulario de Contacto */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Formulario de Contacto
                </Typography>
                <div className="space-y-4 max-w-2xl">
                  <Textarea 
                    label="Mensaje" 
                    placeholder="Escribe tu mensaje aquí..." 
                    helperText="Describe detalladamente tu consulta o solicitud" 
                    rows={4} 
                  />
                  <Textarea 
                    label="Información Adicional" 
                    placeholder="Información adicional que consideres relevante..." 
                    helperText="Opcional: información adicional que pueda ser útil" 
                    rows={2} 
                  />
                </div>
              </div>

              {/* Editor de Contenido */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Editor de Contenido
                </Typography>
                <div className="max-w-2xl">
                  <Textarea 
                    label="Contenido del Artículo" 
                    placeholder="Escribe el contenido de tu artículo aquí..." 
                    helperText="Utiliza el redimensionamiento para adaptar el área de escritura a tus necesidades" 
                    rows={8} 
                    resize="vertical"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    }
    
    if (activeComponent === 'sidebar') {
      return renderSidebarComponent();
    }
    
    if (activeComponent === 'top-navigation') {
      return renderTopNavigationComponent();
    }
    
    if (activeComponent === 'user-menu') {
      return renderUserMenuComponent();
    }
    
    if (activeComponent === 'mobile-navigation') {
      return renderMobileNavigationComponent();
    }
    
    if (activeComponent === 'navigation-item') {
      return renderNavigationItemComponent();
    }
    
    if (activeComponent === 'date-picker') {
      return renderDatePickerComponent();
    }
    
    if (activeComponent === 'time-picker') {
      return renderTimePickerComponent();
    }
    
    if (activeComponent === 'multi-select') {
      return renderMultiSelectComponent();
    }
    
    if (activeComponent === 'badge') {
      return renderBadgeComponent();
    }
    
    if (activeComponent === 'chip') {
      return renderChipComponent();
    }
    
    if (activeComponent === 'progress-bar') {
      return renderProgressBarComponent();
    }
    
    if (activeComponent === 'toast') {
      return renderToastComponent();
    }
    
    if (activeComponent === 'tooltip') {
      return renderTooltipComponent();
    }
    
    if (activeComponent === 'data-table') {
      return renderDataTableComponent();
    }
    
    if (activeComponent === 'card') {
      return renderCardComponent();
    }
    
    if (activeComponent === 'metric-card') {
      return renderMetricCardComponent();
    }
    
    if (activeComponent === 'empty-state') {
      return renderEmptyStateComponent();
    }
    
    if (activeComponent === 'donut-chart') {
      return renderDonutChartComponent();
    }
    
    if (activeComponent === 'modal') {
      return renderModalComponent();
    }
    
    if (activeComponent === 'side-modal') {
      return renderSideModalComponent();
    }
    
    if (activeComponent === 'confirm-modal') {
      return renderConfirmModalComponent();
    }
    
    if (activeComponent === 'link-modal') {
      return renderLinkModalComponent();
    }
    
    if (activeComponent === 'avatar') {
      return renderAvatarComponent();
    }
    
    if (activeComponent === 'user-selector') {
      return renderUserSelectorComponent();
    }
    
    if (activeComponent === 'actions-menu') {
      return renderActionsMenuComponent();
    }
    
    if (activeComponent === 'grouped-actions') {
      return renderGroupedActionsComponent();
    }
    
    if (activeComponent === 'slider') {
      return renderSliderComponent();
    }
    
    if (activeComponent === 'select') {
      return renderSelectComponent();
    }
    
          if (activeComponent === 'switch') {
        return renderSwitchComponent();
      }
      
      if (activeComponent === 'tabs') {
      return (
        <div className="space-y-8">
          {/* Descripción */}
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Tabs Component
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-4">
              El componente Tabs es la base para la navegación entre secciones de contenido. 
              Proporciona múltiples variantes, tamaños y estados para diferentes contextos de uso.
            </Typography>
            <div className="bg-muted p-4 rounded-lg">
              <Typography variant="h5" weight="semibold" className="mb-2">
                Props disponibles:
              </Typography>
              <div className="space-y-1">
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">tabs</code>
                  <span>: array de objetos con id, label, content, icon, disabled, badge</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">variant</code>
                  <span>: default, pills, underline</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">size</code>
                  <span>: sm, md, lg</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">defaultActiveTab</code>
                  <span>: id del tab activo por defecto</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">onTabChange</code>
                  <span>: función callback cuando cambia el tab</span>
                </Typography>
                <Typography variant="body2" color="muted" className="flex items-center gap-2">
                  <span>•</span>
                  <code className="bg-background px-1 rounded">fullWidth</code>
                  <span>: boolean para tabs de ancho completo</span>
                </Typography>
              </div>
            </div>
          </Card>

          {/* Variantes */}
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Variantes
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Diferentes estilos visuales para distintos contextos de uso.
            </Typography>
            
            <div className="space-y-8">
              {/* Default */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Default
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Variante estándar con borde inferior para navegación principal.
                </Typography>
                <Tabs 
                  tabs={[
                    {
                      id: 'overview',
                      label: 'Vista General',
                      icon: <InfoIcon className="w-4 h-4" />,
                      content: (
                        <div className="p-4">
                          <Typography variant="h5" weight="semibold" className="mb-2">
                            Vista General
                          </Typography>
                          <Typography variant="body2" color="secondary">
                            Esta es la vista general del contenido. Aquí puedes ver un resumen de toda la información importante.
                          </Typography>
                        </div>
                      )
                    },
                    {
                      id: 'details',
                      label: 'Detalles',
                      icon: <EditIcon className="w-4 h-4" />,
                      content: (
                        <div className="p-4">
                          <Typography variant="h5" weight="semibold" className="mb-2">
                            Detalles
                          </Typography>
                          <Typography variant="body2" color="secondary">
                            Aquí puedes ver todos los detalles específicos y configuraciones avanzadas.
                          </Typography>
                        </div>
                      )
                    },
                    {
                      id: 'settings',
                      label: 'Configuración',
                      icon: <ConfiguracionesIcon className="w-4 h-4" />,
                      content: (
                        <div className="p-4">
                          <Typography variant="h5" weight="semibold" className="mb-2">
                            Configuración
                          </Typography>
                          <Typography variant="body2" color="secondary">
                            Panel de configuración donde puedes ajustar todas las opciones disponibles.
                          </Typography>
                        </div>
                      )
                    }
                  ]}
                  variant="default"
                />
              </div>

              {/* Pills */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Pills
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Variante con estilo de píldoras para navegación secundaria o filtros.
                </Typography>
                <Tabs 
                  tabs={[
                    {
                      id: 'all',
                      label: 'Todos',
                      badge: '12',
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Mostrando todos los elementos (12 total)
                          </Typography>
                        </div>
                      )
                    },
                    {
                      id: 'active',
                      label: 'Activos',
                      badge: '8',
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Mostrando elementos activos (8 total)
                          </Typography>
                        </div>
                      )
                    },
                    {
                      id: 'inactive',
                      label: 'Inactivos',
                      badge: '4',
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Mostrando elementos inactivos (4 total)
                          </Typography>
                        </div>
                      )
                    }
                  ]}
                  variant="pills"
                />
              </div>

              {/* Underline */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Underline
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Variante con subrayado para navegación sutil.
                </Typography>
                <Tabs 
                  tabs={[
                    {
                      id: 'info',
                      label: 'Información',
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Información básica del elemento
                          </Typography>
                        </div>
                      )
                    },
                    {
                      id: 'history',
                      label: 'Historial',
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Historial de cambios y actividades
                          </Typography>
                        </div>
                      )
                    }
                  ]}
                  variant="underline"
                />
              </div>
            </div>
          </Card>

          {/* Tamaños */}
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Tamaños
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Diferentes tamaños para adaptarse a distintos contextos.
            </Typography>
            
            <div className="space-y-6">
              {/* Small */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Small
                </Typography>
                <Tabs 
                  tabs={[
                    {
                      id: 'tab1',
                      label: 'Tab 1',
                      content: <div className="p-4">Contenido del tab pequeño</div>
                    },
                    {
                      id: 'tab2',
                      label: 'Tab 2',
                      content: <div className="p-4">Otro contenido</div>
                    }
                  ]}
                  size="sm"
                />
              </div>

              {/* Medium */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Medium
                </Typography>
                <Tabs 
                  tabs={[
                    {
                      id: 'tab1',
                      label: 'Tab 1',
                      content: <div className="p-4">Contenido del tab mediano</div>
                    },
                    {
                      id: 'tab2',
                      label: 'Tab 2',
                      content: <div className="p-4">Otro contenido</div>
                    }
                  ]}
                  size="md"
                />
              </div>

              {/* Large */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Large
                </Typography>
                <Tabs 
                  tabs={[
                    {
                      id: 'tab1',
                      label: 'Tab 1',
                      content: <div className="p-4">Contenido del tab grande</div>
                    },
                    {
                      id: 'tab2',
                      label: 'Tab 2',
                      content: <div className="p-4">Otro contenido</div>
                    }
                  ]}
                  size="lg"
                />
              </div>
            </div>
          </Card>

          {/* Estados */}
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Estados
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Diferentes estados del componente para feedback visual.
            </Typography>
            
            <div className="space-y-6">
              {/* Con Iconos */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Con Iconos
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Tabs con iconos para mejorar la comprensión visual.
                </Typography>
                <Tabs 
                  tabs={[
                    {
                      id: 'dashboard',
                      label: 'Dashboard',
                      icon: <DashboardIcon className="w-4 h-4" />,
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Panel principal con métricas y resumen
                          </Typography>
                        </div>
                      )
                    },
                    {
                      id: 'users',
                      label: 'Usuarios',
                      icon: <UsuariosIcon className="w-4 h-4" />,
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Gestión de usuarios del sistema
                          </Typography>
                        </div>
                      )
                    },
                    {
                      id: 'settings',
                      label: 'Configuración',
                      icon: <ConfiguracionesIcon className="w-4 h-4" />,
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Configuraciones del sistema
                          </Typography>
                        </div>
                      )
                    }
                  ]}
                />
              </div>

              {/* Con Badges */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Con Badges
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Tabs con badges para mostrar contadores o notificaciones.
                </Typography>
                <Tabs 
                  tabs={[
                    {
                      id: 'inbox',
                      label: 'Bandeja',
                      badge: '3',
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Tienes 3 mensajes nuevos
                          </Typography>
                        </div>
                      )
                    },
                    {
                      id: 'sent',
                      label: 'Enviados',
                      badge: '12',
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Mensajes enviados recientemente
                          </Typography>
                        </div>
                      )
                    },
                    {
                      id: 'drafts',
                      label: 'Borradores',
                      badge: '2',
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Borradores guardados
                          </Typography>
                        </div>
                      )
                    }
                  ]}
                />
              </div>

              {/* Con Tabs Deshabilitados */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Con Tabs Deshabilitados
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Tabs que pueden estar deshabilitados según el contexto.
                </Typography>
                <Tabs 
                  tabs={[
                    {
                      id: 'active',
                      label: 'Activo',
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Este tab está activo y disponible
                          </Typography>
                        </div>
                      )
                    },
                    {
                      id: 'disabled',
                      label: 'Deshabilitado',
                      disabled: true,
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Este contenido no está disponible
                          </Typography>
                        </div>
                      )
                    },
                    {
                      id: 'locked',
                      label: 'Bloqueado',
                      disabled: true,
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Contenido bloqueado temporalmente
                          </Typography>
                        </div>
                      )
                    }
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* Ejemplos de Uso */}
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Ejemplos de Uso
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Casos de uso comunes y patrones recomendados.
            </Typography>
            
            <div className="space-y-6">
              {/* Navegación de Página */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Navegación de Página
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Tabs para navegar entre diferentes secciones de una página.
                </Typography>
                <Tabs 
                  tabs={[
                    {
                      id: 'overview',
                      label: 'Vista General',
                      icon: <InfoIcon className="w-4 h-4" />,
                      content: (
                        <div className="p-4">
                          <Typography variant="h5" weight="semibold" className="mb-2">
                            Vista General del Proyecto
                          </Typography>
                          <Typography variant="body2" color="secondary" className="mb-4">
                            Aquí puedes ver un resumen completo del proyecto con todas las métricas importantes.
                          </Typography>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-muted p-3 rounded-lg">
                              <Typography variant="h6" weight="semibold">Total Usuarios</Typography>
                              <Typography variant="h4" weight="bold" color="primary">1,234</Typography>
                            </div>
                            <div className="bg-muted p-3 rounded-lg">
                              <Typography variant="h6" weight="semibold">Activos</Typography>
                              <Typography variant="h4" weight="bold" color="primary">987</Typography>
                            </div>
                            <div className="bg-muted p-3 rounded-lg">
                              <Typography variant="h6" weight="semibold">Nuevos</Typography>
                              <Typography variant="h4" weight="bold" color="primary">56</Typography>
                            </div>
                          </div>
                        </div>
                      )
                    },
                    {
                      id: 'details',
                      label: 'Detalles',
                      icon: <EditIcon className="w-4 h-4" />,
                      content: (
                        <div className="p-4">
                          <Typography variant="h5" weight="semibold" className="mb-2">
                            Detalles del Proyecto
                          </Typography>
                          <Typography variant="body2" color="secondary" className="mb-4">
                            Información detallada sobre la configuración y parámetros del proyecto.
                          </Typography>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                              <Typography variant="body2" weight="medium">Nombre del Proyecto</Typography>
                              <Typography variant="body2" color="secondary">Proyecto Demo</Typography>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                              <Typography variant="body2" weight="medium">Fecha de Creación</Typography>
                              <Typography variant="body2" color="secondary">15 de Enero, 2024</Typography>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                              <Typography variant="body2" weight="medium">Estado</Typography>
                              <Typography variant="body2" color="primary">Activo</Typography>
                            </div>
                          </div>
                        </div>
                      )
                    },
                    {
                      id: 'settings',
                      label: 'Configuración',
                      icon: <ConfiguracionesIcon className="w-4 h-4" />,
                      content: (
                        <div className="p-4">
                          <Typography variant="h5" weight="semibold" className="mb-2">
                            Configuración del Proyecto
                          </Typography>
                          <Typography variant="body2" color="secondary" className="mb-4">
                            Ajusta los parámetros y configuraciones del proyecto según tus necesidades.
                          </Typography>
                          <div className="space-y-4">
                            <div>
                              <Typography variant="body2" weight="medium" className="mb-2">Notificaciones</Typography>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" id="email" className="rounded" />
                                  <label htmlFor="email" className="text-sm">Notificaciones por email</label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" id="push" className="rounded" />
                                  <label htmlFor="push" className="text-sm">Notificaciones push</label>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Typography variant="body2" weight="medium" className="mb-2">Privacidad</Typography>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <input type="radio" name="privacy" id="public" className="rounded" />
                                  <label htmlFor="public" className="text-sm">Público</label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input type="radio" name="privacy" id="private" className="rounded" />
                                  <label htmlFor="private" className="text-sm">Privado</label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  ]}
                  fullWidth
                />
              </div>

              {/* Filtros */}
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Filtros
                </Typography>
                <Typography variant="body2" color="secondary" className="mb-3">
                  Tabs para filtrar contenido o datos.
                </Typography>
                <Tabs 
                  tabs={[
                    {
                      id: 'all',
                      label: 'Todos',
                      badge: '156',
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Mostrando todos los elementos (156 total)
                          </Typography>
                        </div>
                      )
                    },
                    {
                      id: 'recent',
                      label: 'Recientes',
                      badge: '23',
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Elementos de los últimos 7 días (23 total)
                          </Typography>
                        </div>
                      )
                    },
                    {
                      id: 'favorites',
                      label: 'Favoritos',
                      badge: '8',
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Elementos marcados como favoritos (8 total)
                          </Typography>
                        </div>
                      )
                    },
                    {
                      id: 'archived',
                      label: 'Archivados',
                      badge: '45',
                      content: (
                        <div className="p-4">
                          <Typography variant="body2" color="secondary">
                            Elementos archivados (45 total)
                          </Typography>
                        </div>
                      )
                    }
                  ]}
                  variant="pills"
                />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Componentes Avanzados
    if (activeComponent === 'drag-drop-zone') {
      return (
        <div className="space-y-8">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Drag & Drop Zone
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Componente especializado para arrastrar y soltar archivos con validación, preview y estados de carga.
            </Typography>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Básico
                </Typography>
                <DragDropZone
                  accept={['image/*', 'application/pdf']}
                  maxSize={5 * 1024 * 1024}
                  maxFiles={5}
                  dropText="Arrastra archivos aquí o haz clic para seleccionar"
                  onFilesAdded={(files) => console.log('Archivos agregados:', files)}
                />
              </div>

              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Compacto
                </Typography>
                <DragDropZone
                  variant="compact"
                  accept={['*/*']}
                  maxFiles={3}
                  dropText="Sube archivos"
                />
              </div>

              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Con Error
                </Typography>
                <DragDropZone
                  error="Error al cargar archivos. Intenta de nuevo."
                  accept={['image/*']}
                />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    if (activeComponent === 'calendar') {
      return (
        <div className="space-y-8">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Calendar
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Componente de calendario tipo Google Calendar con múltiples vistas y gestión de eventos.
            </Typography>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Vista de Mes
                </Typography>
                <Calendar
                  events={[
                    {
                      id: '1',
                      title: 'Reunión de equipo',
                      start: new Date(2024, 0, 15, 10, 0),
                      end: new Date(2024, 0, 15, 11, 0),
                      color: 'primary'
                    },
                    {
                      id: '2',
                      title: 'Presentación cliente',
                      start: new Date(2024, 0, 16, 14, 0),
                      end: new Date(2024, 0, 16, 15, 30),
                      color: 'success'
                    }
                  ]}
                  view="month"
                  onEventClick={(event) => console.log('Evento clickeado:', event)}
                />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    if (activeComponent === 'kanban-board') {
      return (
        <div className="space-y-8">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Kanban Board
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Tablero Kanban para gestión de tareas con drag & drop, prioridades y estados.
            </Typography>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Tablero de Tareas
                </Typography>
                <KanbanBoardSimple
                  columns={[
                    {
                      id: 'todo',
                      title: 'Por Hacer',
                      color: '#3B82F6',
                      tasks: [
                        {
                          id: '1',
                          title: 'Diseñar mockups',
                          description: 'Crear mockups para la nueva funcionalidad',
                          status: 'todo',
                          priority: 'high',
                          assignee: { id: '1', name: 'Juan Pérez' },
                          dueDate: new Date(2024, 0, 20),
                          tags: ['diseño', 'UI'],
                          createdAt: new Date(),
                          updatedAt: new Date()
                        }
                      ]
                    },
                    {
                      id: 'in-progress',
                      title: 'En Progreso',
                      color: '#F59E0B',
                      tasks: [
                        {
                          id: '2',
                          title: 'Implementar API',
                          description: 'Desarrollar endpoints para el backend',
                          status: 'in-progress',
                          priority: 'urgent',
                          assignee: { id: '2', name: 'María García' },
                          dueDate: new Date(2024, 0, 18),
                          tags: ['backend', 'API'],
                          createdAt: new Date(),
                          updatedAt: new Date()
                        }
                      ]
                    },
                    {
                      id: 'done',
                      title: 'Completado',
                      color: '#10B981',
                      tasks: []
                    }
                  ]}
                  onTaskClick={(task) => console.log('Tarea clickeada:', task)}
                  onTaskMove={(taskId, fromStatus, toStatus) => console.log('Tarea movida:', taskId, fromStatus, toStatus)}
                />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    if (activeComponent === 'timeline') {
      return (
        <div className="space-y-8">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Timeline
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Componente de línea de tiempo para mostrar eventos cronológicos con estados y metadatos.
            </Typography>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Timeline de Eventos
                </Typography>
                <TimelineTest />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    if (activeComponent === 'micro-interactions-demo') {
      return (
        <Card className="p-6 text-center">
          <Typography variant="body1" color="secondary">
            Las micro-interacciones ahora tienen su propia pestaña dedicada en el sistema de diseño.
          </Typography>
        </Card>
      );
    }

    // Alert Component
    if (activeComponent === 'alert') {
      return (
        <div className="space-y-8">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Alert
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Componente para mostrar alertas y notificaciones con diferentes variantes y estados.
            </Typography>
            
            <div className="space-y-4">
              <Alert variant="info" title="Información">
                Esta es una alerta informativa con un título y contenido descriptivo.
              </Alert>
              
              <Alert variant="success" title="Éxito">
                La operación se completó exitosamente. Los cambios han sido guardados.
              </Alert>
              
              <Alert variant="warning" title="Advertencia">
                Ten cuidado con esta acción. Podría tener consecuencias inesperadas.
              </Alert>
              
              <Alert variant="error" title="Error">
                Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.
              </Alert>
              
              <Alert variant="info" closable onClose={() => console.log('Alert closed')}>
                Esta alerta se puede cerrar haciendo clic en el botón X.
              </Alert>
              
              <Alert 
                variant="success" 
                title="Con Acciones"
                actions={
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Cancelar</Button>
                    <Button size="sm">Confirmar</Button>
                  </div>
                }
              >
                Esta alerta incluye botones de acción personalizados.
              </Alert>
            </div>
          </Card>
        </div>
      );
    }

    // Skeleton Component
    if (activeComponent === 'skeleton') {
      return (
        <div className="space-y-8">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Skeleton
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Componentes para mostrar estados de carga con animaciones de skeleton.
            </Typography>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Variantes Básicas
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Typography variant="body2" color="secondary" className="mb-2">Text</Typography>
                    <Skeleton variant="text" width="100%" />
                  </div>
                  <div>
                    <Typography variant="body2" color="secondary" className="mb-2">Circular</Typography>
                    <Skeleton variant="circular" width={40} height={40} />
                  </div>
                  <div>
                    <Typography variant="body2" color="secondary" className="mb-2">Rectangular</Typography>
                    <Skeleton variant="rectangular" width={100} height={60} />
                  </div>
                  <div>
                    <Typography variant="body2" color="secondary" className="mb-2">Rounded</Typography>
                    <Skeleton variant="rounded" width={100} height={60} />
                  </div>
                </div>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Componentes Especializados
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Typography variant="body2" color="secondary" className="mb-2">SkeletonText</Typography>
                    <SkeletonText lines={3} />
                  </div>
                  <div>
                    <Typography variant="body2" color="secondary" className="mb-2">SkeletonAvatar</Typography>
                    <div className="flex space-x-2">
                      <SkeletonAvatar size="sm" />
                      <SkeletonAvatar size="md" />
                      <SkeletonAvatar size="lg" />
                      <SkeletonAvatar size="xl" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  SkeletonCard
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Divider Component
    if (activeComponent === 'divider') {
      return (
        <div className="space-y-8">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Divider
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Componente para separar contenido con diferentes estilos y orientaciones.
            </Typography>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Orientación Horizontal
                </Typography>
                <div className="space-y-4">
                  <div>Contenido arriba</div>
                  <Divider />
                  <div>Contenido abajo</div>
                </div>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Con Texto
                </Typography>
                <Divider>O</Divider>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Variantes
                </Typography>
                <div className="space-y-4">
                  <Divider variant="solid" />
                  <Divider variant="dashed" />
                  <Divider variant="dotted" />
                </div>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Colores
                </Typography>
                <div className="space-y-4">
                  <Divider color="default" />
                  <Divider color="primary" />
                  <Divider color="secondary" />
                  <Divider color="muted" />
                </div>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Espaciado
                </Typography>
                <div className="space-y-4">
                  <Divider spacing="none" />
                  <Divider spacing="sm" />
                  <Divider spacing="md" />
                  <Divider spacing="lg" />
                </div>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Orientación Vertical
                </Typography>
                <div className="flex items-center space-x-4 h-20">
                  <span>Izquierda</span>
                  <Divider orientation="vertical" />
                  <span>Derecha</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // List Component
    if (activeComponent === 'list') {
      return (
        <div className="space-y-8">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              List
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Componente para mostrar listas de elementos con avatares, badges y acciones.
            </Typography>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Lista Básica
                </Typography>
                <List
                  items={[
                    {
                      id: '1',
                      title: 'Juan Pérez',
                      subtitle: 'Desarrollador Frontend',
                      description: 'Especializado en React y TypeScript',
                      avatar: 'https://via.placeholder.com/40',
                      badge: 'Activo',
                      badgeVariant: 'success'
                    },
                    {
                      id: '2',
                      title: 'María García',
                      subtitle: 'Diseñadora UX',
                      description: 'Experiencia en diseño de interfaces',
                      avatar: 'https://via.placeholder.com/40',
                      badge: 'Ausente',
                      badgeVariant: 'warning'
                    },
                    {
                      id: '3',
                      title: 'Carlos López',
                      subtitle: 'Product Manager',
                      description: 'Gestión de productos digitales',
                      avatar: 'https://via.placeholder.com/40',
                      badge: 'Ocupado',
                      badgeVariant: 'danger'
                    }
                  ]}
                  title="Equipo de Desarrollo"
                  subtitle="Miembros activos del proyecto"
                />
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Lista con Acciones
                </Typography>
                <List
                  items={[
                    {
                      id: '1',
                      title: 'Proyecto Alpha',
                      subtitle: 'En desarrollo',
                      description: 'Aplicación web para gestión de tareas',
                      badge: 'En progreso',
                      badgeVariant: 'primary',
                      actions: (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Ver</Button>
                          <Button size="sm">Editar</Button>
                        </div>
                      )
                    },
                    {
                      id: '2',
                      title: 'Proyecto Beta',
                      subtitle: 'Completado',
                      description: 'Sistema de reportes y analytics',
                      badge: 'Completado',
                      badgeVariant: 'success',
                      actions: (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Ver</Button>
                          <Button size="sm">Descargar</Button>
                        </div>
                      )
                    }
                  ]}
                  variant="bordered"
                />
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Lista con Iconos
                </Typography>
                <List
                  items={[
                    {
                      id: '1',
                      title: 'Documento de Especificaciones',
                      subtitle: 'PDF • 2.3 MB',
                      icon: <FileIcon className="w-5 h-5" />,
                      actions: <Button size="sm" variant="outline">Descargar</Button>
                    },
                    {
                      id: '2',
                      title: 'Presentación del Proyecto',
                      subtitle: 'PPTX • 1.8 MB',
                      icon: <FileIcon className="w-5 h-5" />,
                      actions: <Button size="sm" variant="outline">Descargar</Button>
                    }
                  ]}
                  showAvatars={false}
                  showIcons={true}
                  variant="striped"
                />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Checkbox Component
    if (activeComponent === 'checkbox') {
      return (
        <div className="space-y-8">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Checkbox
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Componente para selecciones múltiples con diferentes estados y tamaños.
            </Typography>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Estados Básicos
                </Typography>
                <div className="space-y-3">
                  <Checkbox label="Checkbox normal" />
                  <Checkbox label="Checkbox marcado" checked />
                  <Checkbox label="Checkbox indeterminado" indeterminate />
                  <Checkbox label="Checkbox deshabilitado" disabled />
                  <Checkbox label="Checkbox deshabilitado marcado" checked disabled />
                </div>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Tamaños
                </Typography>
                <div className="space-y-3">
                  <Checkbox label="Checkbox pequeño" size="sm" />
                  <Checkbox label="Checkbox mediano" size="md" />
                  <Checkbox label="Checkbox grande" size="lg" />
                </div>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Con Descripción
                </Typography>
                <div className="space-y-3">
                  <Checkbox 
                    label="Acepto los términos y condiciones" 
                    description="Al marcar esta casilla, confirmas que has leído y aceptas nuestros términos de servicio."
                  />
                  <Checkbox 
                    label="Recibir notificaciones por email" 
                    description="Te enviaremos actualizaciones importantes sobre tu cuenta."
                  />
                </div>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Grupo de Checkboxes
                </Typography>
                <CheckboxGroup
                  options={[
                    { id: '1', label: 'React', value: 'react' },
                    { id: '2', label: 'Vue', value: 'vue' },
                    { id: '3', label: 'Angular', value: 'angular' },
                    { id: '4', label: 'Svelte', value: 'svelte' }
                  ]}
                  selectedValues={['react', 'vue']}
                  onChange={(values) => console.log('Seleccionados:', values)}
                />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Radio Button Component
    if (activeComponent === 'radio-button') {
      return (
        <div className="space-y-8">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Radio Button
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Componente para selección única con diferentes estados y tamaños.
            </Typography>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Estados Básicos
                </Typography>
                <div className="space-y-3">
                  <RadioButton label="Radio normal" />
                  <RadioButton label="Radio seleccionado" checked />
                  <RadioButton label="Radio deshabilitado" disabled />
                  <RadioButton label="Radio deshabilitado seleccionado" checked disabled />
                </div>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Tamaños
                </Typography>
                <div className="space-y-3">
                  <RadioButton label="Radio pequeño" size="sm" />
                  <RadioButton label="Radio mediano" size="md" />
                  <RadioButton label="Radio grande" size="lg" />
                </div>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Con Descripción
                </Typography>
                <div className="space-y-3">
                  <RadioButton 
                    label="Plan Básico" 
                    description="Perfecto para proyectos pequeños. Incluye 5GB de almacenamiento."
                  />
                  <RadioButton 
                    label="Plan Pro" 
                    description="Ideal para equipos. Incluye 50GB de almacenamiento y soporte prioritario."
                  />
                </div>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Grupo de Radio Buttons
                </Typography>
                <RadioGroup
                  options={[
                    { id: '1', label: 'Opción 1', value: 'option1' },
                    { id: '2', label: 'Opción 2', value: 'option2' },
                    { id: '3', label: 'Opción 3', value: 'option3' }
                  ]}
                  selectedValue="option2"
                  onChange={(value) => console.log('Seleccionado:', value)}
                />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Accordion Component
    if (activeComponent === 'accordion') {
      return (
        <div className="space-y-8">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Accordion
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Componente para organizar contenido en secciones colapsables.
            </Typography>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Accordion Básico
                </Typography>
                <Accordion
                  items={[
                    {
                      id: '1',
                      title: '¿Qué es Central de Creadores?',
                      content: 'Central de Creadores es una plataforma integral para la gestión de proyectos creativos, investigación de usuarios y reclutamiento de participantes.'
                    },
                    {
                      id: '2',
                      title: '¿Cómo funciona el sistema de reclutamiento?',
                      content: 'Nuestro sistema de reclutamiento te permite encontrar y gestionar participantes para tus investigaciones de manera eficiente y organizada.'
                    },
                    {
                      id: '3',
                      title: '¿Qué tipos de proyectos puedo crear?',
                      content: 'Puedes crear proyectos de investigación de usuarios, estudios de usabilidad, entrevistas, encuestas y más.'
                    }
                  ]}
                />
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Accordion con Múltiples Abiertos
                </Typography>
                <Accordion
                  items={[
                    {
                      id: '1',
                      title: 'Características Principales',
                      content: 'Gestión de proyectos, reclutamiento de participantes, análisis de datos, reportes automáticos.'
                    },
                    {
                      id: '2',
                      title: 'Integraciones',
                      content: 'Integración con herramientas populares como Figma, Notion, Slack y más.'
                    },
                    {
                      id: '3',
                      title: 'Soporte',
                      content: 'Soporte técnico 24/7, documentación completa y comunidad activa.'
                    }
                  ]}
                  allowMultiple
                  defaultOpen={['1']}
                />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Line Chart Component
    if (activeComponent === 'line-chart') {
      return (
        <div className="space-y-8">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Line Chart
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Gráfico de líneas con animaciones y micro-interacciones.
            </Typography>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Gráfico de Línea Básico
                </Typography>
                <LineChart
                  data={[
                    { x: 'Ene', y: 10 },
                    { x: 'Feb', y: 25 },
                    { x: 'Mar', y: 15 },
                    { x: 'Abr', y: 30 },
                    { x: 'May', y: 20 },
                    { x: 'Jun', y: 35 }
                  ]}
                  title="Ventas Mensuales"
                  subtitle="Evolución de ventas en el primer semestre"
                  width={500}
                  height={300}
                />
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Gráfico con Área
                </Typography>
                <LineChart
                  data={[
                    { x: 'Lun', y: 5 },
                    { x: 'Mar', y: 12 },
                    { x: 'Mié', y: 8 },
                    { x: 'Jue', y: 18 },
                    { x: 'Vie', y: 15 },
                    { x: 'Sáb', y: 22 },
                    { x: 'Dom', y: 10 }
                  ]}
                  title="Actividad Semanal"
                  showArea
                  color="#10B981"
                  width={500}
                  height={300}
                />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Bar Chart Component
    if (activeComponent === 'bar-chart') {
      return (
        <div className="space-y-8">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Bar Chart
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Gráfico de barras con animaciones y micro-interacciones.
            </Typography>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Gráfico de Barras Vertical
                </Typography>
                <BarChart
                  data={[
                    { label: 'React', value: 45 },
                    { label: 'Vue', value: 25 },
                    { label: 'Angular', value: 20 },
                    { label: 'Svelte', value: 10 }
                  ]}
                  title="Popularidad de Frameworks"
                  subtitle="Porcentaje de uso en 2024"
                  width={500}
                  height={300}
                />
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Gráfico de Barras Horizontal
                </Typography>
                <BarChart
                  data={[
                    { label: 'Diseño', value: 80, color: '#3B82F6' },
                    { label: 'Desarrollo', value: 90, color: '#10B981' },
                    { label: 'Testing', value: 70, color: '#F59E0B' },
                    { label: 'Deploy', value: 85, color: '#EF4444' }
                  ]}
                  title="Progreso del Proyecto"
                  orientation="horizontal"
                  width={500}
                  height={300}
                />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Counter Component
    if (activeComponent === 'counter') {
      return (
        <div className="space-y-8">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Counter
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Componente para mostrar números con animación de conteo.
            </Typography>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Contadores Individuales
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Counter
                    value={1234}
                    title="Usuarios Activos"
                    description="En los últimos 30 días"
                    color="primary"
                  />
                  <Counter
                    value={567}
                    title="Proyectos Creados"
                    description="Este año"
                    color="success"
                  />
                  <Counter
                    value={89}
                    title="Tasa de Éxito"
                    suffix="%"
                    description="Proyectos completados"
                    color="warning"
                  />
                </div>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Grupo de Contadores
                </Typography>
                <CounterGroup
                  counters={[
                    {
                      id: '1',
                      value: 1500000,
                      title: 'Ingresos',
                      prefix: '$',
                      color: 'success'
                    },
                    {
                      id: '2',
                      value: 2500,
                      title: 'Clientes',
                      color: 'primary'
                    },
                    {
                      id: '3',
                      value: 95,
                      title: 'Satisfacción',
                      suffix: '%',
                      color: 'info'
                    }
                  ]}
                />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Componentes de Layout y Formularios
    if (activeComponent === 'page-header') {
      return renderPageHeaderComponent();
    }
    
    if (activeComponent === 'form-container') {
      return renderFormContainerComponent();
    }
    
    if (activeComponent === 'form-item') {
      return renderFormItemComponent();
    }
    
    if (activeComponent === 'info-container') {
      return renderInfoContainerComponent();
    }
    
    if (activeComponent === 'info-item') {
      return renderInfoItemComponent();
    }
    
    if (activeComponent === 'subtitle') {
      return renderSubtitleComponent();
    }
    
    if (activeComponent === 'container-title') {
      return renderContainerTitleComponent();
    }
    
    if (activeComponent === 'filter-label') {
      return renderFilterLabelComponent();
    }
    
    if (activeComponent === 'participant-card') {
      return renderParticipantCardComponent();
    }

    return (
      <Card className="p-6 text-center">
        <Typography variant="body1" color="secondary">
          Selecciona un componente del menú para ver sus ejemplos.
        </Typography>
      </Card>
    );
  };

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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Menú de Categorías */}
        <div className="lg:w-64 flex-shrink-0">
          <Card className="p-4 space-y-2">
            {componentCategories.map((category) => (
              <div key={category.id}>
                <button
                  onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    {category.icon}
                    {category.name}
                  </span>
                  {activeCategory === category.id ? (
                    <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {activeCategory === category.id && (
                  <div className="ml-4 mt-2 space-y-1">
                    {category.components.map((component) => (
                      <button
                        key={component.id}
                        onClick={() => setActiveComponent(component.id)}
                        className={`w-full px-3 py-2.5 rounded-md transition-colors text-left focus:outline-none ${
                          activeComponent === component.id
                            ? 'bg-muted text-foreground border-r-2 border-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Typography variant="h5" weight="semibold">
                          {component.name}
                        </Typography>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Card>
        </div>

        {/* Contenido del Componente Seleccionado */}
        <div className="flex-1">
          {renderComponentContent()}
        </div>
      </div>
    </div>
  );
};

export default ComponentsSection;
