import React, { useState } from 'react';
import { Typography, Card, Button, Badge } from '../ui';
import { 
  useMicroInteractions, 
  useStaggeredAnimation, 
  usePageAnimation,
  useNotificationAnimation,
  useModalAnimation 
} from '../../hooks/useMicroInteractions';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  PlusIcon,
  MenuIcon,
  EditIcon,
  BoxIcon,
  GridIcon,
  PaletteIcon,
  TypeIcon,
  DesignSystemIcon,
  ElevationIcon
} from '../icons';

const MicroInteractionsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);

  // Hooks de micro-interacciones para demostración
  const fadeInRef = useMicroInteractions({ type: 'fade-in', trigger: 'onMount' });
  const slideInRef = useMicroInteractions({ type: 'slide-in-left', trigger: 'onScroll' });
  const bounceRef = useMicroInteractions({ type: 'bounce', trigger: 'onClick' });
  const pulseRef = useMicroInteractions({ type: 'pulse', trigger: 'onHover', repeat: true });
  
  const { triggerAll: triggerStaggered } = useStaggeredAnimation(items);
  const { className: pageClassName } = usePageAnimation();
  const { show: showNotif, hide: hideNotif, className: notifClassName } = useNotificationAnimation();
  const { backdropClassName, contentClassName } = useModalAnimation(isModalOpen);

  const handleShowNotification = () => {
    showNotif();
    setShowNotification(true);
    setTimeout(() => {
      hideNotif();
      setShowNotification(false);
    }, 3000);
  };

  const microInteractionsCategories = [
    {
      id: "overview",
      name: "Visión General",
      icon: DesignSystemIcon,
      sections: [
        { id: "overview", name: "Visión General" }
      ]
    },
    {
      id: "animations",
      name: "Animaciones",
      icon: PaletteIcon,
      sections: [
        { id: "entry-animations", name: "Animaciones de Entrada" },
        { id: "hover-effects", name: "Efectos Hover" },
        { id: "loading-states", name: "Estados de Carga" },
        { id: "counter-animations", name: "Animaciones de Contadores" },
        { id: "chart-animations", name: "Animaciones de Charts" }
      ]
    },
    {
      id: "interactions",
      name: "Interacciones",
      icon: EditIcon,
      sections: [
        { id: "notifications", name: "Notificaciones" },
        { id: "modals", name: "Modales" },
        { id: "forms", name: "Formularios" }
      ]
    },
    {
      id: "hooks",
      name: "Hooks React",
      icon: BoxIcon,
      sections: [
        { id: "use-micro-interactions", name: "useMicroInteractions" },
        { id: "use-staggered-animation", name: "useStaggeredAnimation" },
        { id: "use-page-animation", name: "usePageAnimation" }
      ]
    },
    {
      id: "implementation",
      name: "Implementación",
      icon: GridIcon,
      sections: [
        { id: "best-practices", name: "Mejores Prácticas" },
        { id: "accessibility", name: "Accesibilidad" }
      ]
    }
  ];

  const renderSectionContent = () => {
    if (!activeSection) {
      return (
        <Card className="p-6 text-center">
          <Typography variant="body1" color="secondary">
            Selecciona una sección del menú para ver su contenido.
          </Typography>
        </Card>
      );
    }

    // Visión General
    if (activeSection === 'overview') {
      return (
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Sistema de Micro-Interacciones
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              El sistema de micro-interacciones de Central de Creadores está diseñado para proporcionar 
              feedback visual rico y crear una experiencia de usuario dinámica y moderna. Incluye más de 
              60 animaciones y efectos organizados en categorías específicas.
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Typography variant="h4" weight="bold" color="primary" className="mb-2">60+</Typography>
                <Typography variant="body2" color="secondary">Animaciones CSS</Typography>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Typography variant="h4" weight="bold" color="success" className="mb-2">8</Typography>
                <Typography variant="body2" color="secondary">Hooks React</Typography>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Typography variant="h4" weight="bold" color="warning" className="mb-2">12</Typography>
                <Typography variant="body2" color="secondary">Categorías</Typography>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Typography variant="h4" weight="bold" color="info" className="mb-2">100%</Typography>
                <Typography variant="body2" color="secondary">Accesible</Typography>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Animaciones de Entrada
    if (activeSection === 'entry-animations') {
      return (
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Animaciones de Entrada
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Animaciones que se ejecutan cuando los elementos aparecen en pantalla.
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                ref={fadeInRef.ref}
                className={`p-4 text-center border rounded-lg bg-white ${fadeInRef.className}`}
              >
                <Typography variant="h5" weight="semibold" className="mb-2">
                  Fade In
                </Typography>
                <Typography variant="body2" color="secondary">
                  Aparece suavemente al cargar
                </Typography>
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono">
                  .fade-in
                </div>
              </div>

              <div 
                ref={slideInRef.ref}
                className={`p-4 text-center border rounded-lg bg-white ${slideInRef.className}`}
              >
                <Typography variant="h5" weight="semibold" className="mb-2">
                  Slide In
                </Typography>
                <Typography variant="body2" color="secondary">
                  Se desliza desde la izquierda
                </Typography>
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono">
                  .slide-in-left
                </div>
              </div>

              <div 
                ref={bounceRef.ref}
                className={`p-4 text-center cursor-pointer border rounded-lg bg-white ${bounceRef.className}`}
              >
                <Typography variant="h5" weight="semibold" className="mb-2">
                  Bounce
                </Typography>
                <Typography variant="body2" color="secondary">
                  Haz clic para ver el efecto
                </Typography>
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono">
                  .bounce
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Efectos Hover
    if (activeSection === 'hover-effects') {
      return (
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Efectos Hover
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Efectos que se activan al pasar el mouse sobre los elementos.
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-4 text-center card-hover">
                <Typography variant="h5" weight="semibold" className="mb-2">
                  Card Hover
                </Typography>
                <Typography variant="body2" color="secondary">
                  Elevación y sombra
                </Typography>
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono">
                  .card-hover
                </div>
              </Card>

              <Button className="btn-hover">
                Button Hover
              </Button>

              <div className="p-4 border rounded input-focus">
                <Typography variant="body2" color="secondary">
                  Input Focus
                </Typography>
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono">
                  .input-focus
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Estados de Carga
    if (activeSection === 'loading-states') {
      return (
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Estados de Carga
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Animaciones para indicar estados de carga y procesamiento.
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="spinner w-8 h-8 mx-auto mb-2"></div>
                <Typography variant="body2" color="secondary">Spinner</Typography>
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono">
                  .spinner
                </div>
              </div>

              <div className="text-center p-4">
                <div className="pulse w-8 h-8 bg-primary rounded mx-auto mb-2"></div>
                <Typography variant="body2" color="secondary">Pulse</Typography>
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono">
                  .pulse
                </div>
              </div>

              <div className="text-center p-4">
                <div className="bounce w-8 h-8 bg-primary rounded mx-auto mb-2"></div>
                <Typography variant="body2" color="secondary">Bounce</Typography>
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono">
                  .bounce
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Notificaciones
    if (activeSection === 'notifications') {
      return (
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Notificaciones
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Animaciones para notificaciones y alertas.
            </Typography>
            
            <div className="space-y-4">
              <Button onClick={handleShowNotification}>
                Mostrar Notificación
              </Button>
              
              {showNotification && (
                <div className={`p-4 bg-green-100 border border-green-300 rounded ${notifClassName}`}>
                  <Typography variant="body1" color="success">
                    ¡Notificación mostrada exitosamente!
                  </Typography>
                </div>
              )}
            </div>
          </Card>
        </div>
      );
    }

    // Modales
    if (activeSection === 'modals') {
      return (
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Modales
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Animaciones para modales y overlays.
            </Typography>
            
            <Button onClick={() => setIsModalOpen(true)}>
              Abrir Modal
            </Button>
            
            {isModalOpen && (
              <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${backdropClassName}`}>
                <div className={`bg-white p-6 rounded-lg max-w-md w-full mx-4 ${contentClassName}`}>
                  <Typography variant="h4" weight="bold" className="mb-4">
                    Modal Animado
                  </Typography>
                  <Typography variant="body1" color="secondary" className="mb-4">
                    Este modal tiene animaciones de entrada y salida.
                  </Typography>
                  <Button onClick={() => setIsModalOpen(false)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      );
    }

    // Formularios
    if (activeSection === 'forms') {
      return (
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Formularios
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Animaciones para campos de formulario y validaciones.
            </Typography>
            
            <div className="space-y-4 max-w-md">
              <div className="form-field">
                <label className="form-label block text-sm font-medium mb-1">
                  Campo de Texto
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Escribe algo..."
                />
              </div>
              
              <div className="form-field valid">
                <label className="form-label block text-sm font-medium mb-1">
                  Campo Válido
                </label>
                <input 
                  type="email" 
                  className="w-full p-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  value="usuario@ejemplo.com"
                  readOnly
                />
              </div>
              
              <div className="form-field error">
                <label className="form-label block text-sm font-medium mb-1">
                  Campo con Error
                </label>
                <input 
                  type="email" 
                  className="w-full p-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  value="email-invalido"
                  readOnly
                />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Hooks React
    if (activeSection === 'use-micro-interactions') {
      return (
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              useMicroInteractions
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Hook principal para gestionar animaciones individuales.
            </Typography>
            
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded">
                <Typography variant="body2" className="font-mono">
                  {`const fadeInRef = useMicroInteractions({
  type: 'fade-in',
  trigger: 'onMount',
  delay: 100,
  duration: 300
});`}
                </Typography>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="h5" weight="semibold" className="mb-2">Props</Typography>
                  <ul className="space-y-1 text-sm">
                    <li><strong>type:</strong> fade-in, slide-in-left, bounce, pulse</li>
                    <li><strong>trigger:</strong> onMount, onScroll, onClick, onHover</li>
                    <li><strong>delay:</strong> Retraso en milisegundos</li>
                    <li><strong>duration:</strong> Duración de la animación</li>
                  </ul>
                </div>
                <div>
                  <Typography variant="h5" weight="semibold" className="mb-2">Returns</Typography>
                  <ul className="space-y-1 text-sm">
                    <li><strong>ref:</strong> React ref para el elemento</li>
                    <li><strong>className:</strong> Clases CSS aplicadas</li>
                    <li><strong>isAnimating:</strong> Estado de animación</li>
                    <li><strong>trigger:</strong> Función para activar manualmente</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Mejores Prácticas
    if (activeSection === 'best-practices') {
      return (
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Mejores Prácticas
            </Typography>
            
            <div className="space-y-6">
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Performance
                </Typography>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <Typography variant="body2">Usar transform y opacity para animaciones fluidas</Typography>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <Typography variant="body2">Evitar animar propiedades que causan reflow</Typography>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <Typography variant="body2">Usar will-change para elementos que se animan frecuentemente</Typography>
                  </li>
                </ul>
              </div>
              
              <div>
                <Typography variant="h4" weight="semibold" className="mb-3">
                  UX
                </Typography>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <Typography variant="body2">Mantener animaciones cortas (150-400ms)</Typography>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <Typography variant="body2">Usar curvas de bezier apropiadas</Typography>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <Typography variant="body2">Proporcionar feedback inmediato</Typography>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Accesibilidad
    if (activeSection === 'accessibility') {
      return (
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h3" weight="bold" className="mb-4">
              Accesibilidad
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              El sistema respeta las preferencias de accesibilidad del usuario.
            </Typography>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded">
                <Typography variant="h5" weight="semibold" className="mb-2">
                  prefers-reduced-motion
                </Typography>
                <Typography variant="body2" color="secondary">
                  Las animaciones se desactivan automáticamente cuando el usuario prefiere movimiento reducido.
                </Typography>
              </div>
              
              <div className="bg-green-50 p-4 rounded">
                <Typography variant="h5" weight="semibold" className="mb-2">
                  prefers-contrast: high
                </Typography>
                <Typography variant="body2" color="secondary">
                  Los efectos visuales se ajustan para mayor contraste cuando es necesario.
                </Typography>
              </div>
              
              <div className="bg-purple-50 p-4 rounded">
                <Typography variant="h5" weight="semibold" className="mb-2">
                  Modo Oscuro/Claro
                </Typography>
                <Typography variant="body2" color="secondary">
                  Las sombras y efectos se adaptan automáticamente al tema del sistema.
                </Typography>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <Card className="p-6 text-center">
        <Typography variant="body1" color="secondary">
          Contenido en desarrollo para: {activeSection}
        </Typography>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h2" weight="bold" className="mb-2">
          Micro-Interacciones
        </Typography>
        <Typography variant="body1" color="secondary">
          Sistema completo de animaciones y micro-interacciones para crear experiencias dinámicas
        </Typography>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Menú de Categorías */}
        <div className="lg:w-64 flex-shrink-0">
          <Card className="p-4 space-y-2">
            {microInteractionsCategories.map((category) => (
              <div key={category.id}>
                <button
                  onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <category.icon className="w-4 h-4" />
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
                    {category.sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full px-3 py-2.5 rounded-md transition-colors text-left focus:outline-none ${
                          activeSection === section.id
                            ? 'bg-muted text-foreground border-r-2 border-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Typography variant="h5" weight="semibold">
                          {section.name}
                        </Typography>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Card>
        </div>

        {/* Contenido de la Sección Seleccionada */}
        <div className="flex-1">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
};

export default MicroInteractionsSection;
