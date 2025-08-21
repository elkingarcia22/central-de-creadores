import React, { useState } from 'react';
import { Typography, Card, Button, Badge } from '../ui';
import { 
  useMicroInteractions, 
  useStaggeredAnimation, 
  usePageAnimation,
  useNotificationAnimation,
  useModalAnimation 
} from '../../hooks/useMicroInteractions';

const MicroInteractionsDemo: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);

  // Hooks de micro-interacciones
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

  return (
    <div className={`space-y-8 ${pageClassName}`}>
      <div className="text-center">
        <Typography variant="h2" weight="bold" className="mb-4">
          Micro-Interacciones
        </Typography>
        <Typography variant="body1" color="secondary">
          Demostración de animaciones y micro-interacciones para hacer la plataforma más dinámica
        </Typography>
      </div>

      {/* Animaciones de Entrada */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Animaciones de Entrada
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            ref={fadeInRef.ref}
            className={`p-4 text-center ${fadeInRef.className}`}
          >
            <Typography variant="h5" weight="semibold" className="mb-2">
              Fade In
            </Typography>
            <Typography variant="body2" color="secondary">
              Aparece suavemente al cargar
            </Typography>
          </Card>

          <Card 
            ref={slideInRef.ref}
            className={`p-4 text-center ${slideInRef.className}`}
          >
            <Typography variant="h5" weight="semibold" className="mb-2">
              Slide In
            </Typography>
            <Typography variant="body2" color="secondary">
              Se desliza desde la izquierda al hacer scroll
            </Typography>
          </Card>

          <Card 
            ref={bounceRef.ref}
            className={`p-4 text-center cursor-pointer ${bounceRef.className}`}
          >
            <Typography variant="h5" weight="semibold" className="mb-2">
              Bounce
            </Typography>
            <Typography variant="body2" color="secondary">
              Haz clic para ver el efecto bounce
            </Typography>
          </Card>

          <Card 
            ref={pulseRef.ref}
            className={`p-4 text-center ${pulseRef.className}`}
          >
            <Typography variant="h5" weight="semibold" className="mb-2">
              Pulse
            </Typography>
            <Typography variant="body2" color="secondary">
              Pasa el mouse para ver el pulso
            </Typography>
          </Card>
        </div>
      </Card>

      {/* Animaciones Escalonadas */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Animaciones Escalonadas
        </Typography>
        
        <div className="mb-4">
          <Button onClick={triggerStaggered}>
            Activar Animaciones Escalonadas
          </Button>
        </div>
        
        <div className="space-y-2">
          {items.map((item, index) => (
            <Card 
              key={index}
              className="p-3 stagger-children"
            >
              <Typography variant="body1">
                {item}
              </Typography>
            </Card>
          ))}
        </div>
      </Card>

      {/* Efectos Hover */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Efectos Hover
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center card-hover">
            <Typography variant="h5" weight="semibold" className="mb-2">
              Card Hover
            </Typography>
            <Typography variant="body2" color="secondary">
              Pasa el mouse para ver el efecto
            </Typography>
          </Card>

          <Button className="btn-hover">
            Button Hover
          </Button>

          <div className="p-4 border rounded-lg input-focus">
            <input 
              type="text" 
              placeholder="Input con focus effect"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </Card>

      {/* Notificaciones */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Notificaciones
        </Typography>
        
        <div className="space-y-4">
          <Button onClick={handleShowNotification}>
            Mostrar Notificación
          </Button>
          
          {showNotification && (
            <div className={`p-4 bg-green-100 border border-green-300 rounded-lg ${notifClassName}`}>
              <Typography variant="body1" color="success">
                ¡Notificación mostrada exitosamente!
              </Typography>
            </div>
          )}
        </div>
      </Card>

      {/* Modal Animado */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Modal Animado
        </Typography>
        
        <Button onClick={() => setIsModalOpen(true)}>
          Abrir Modal
        </Button>
        
        {isModalOpen && (
          <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${backdropClassName}`}>
            <Card className={`p-6 max-w-md w-full mx-4 ${contentClassName}`}>
              <Typography variant="h4" weight="bold" className="mb-4">
                Modal Animado
              </Typography>
              <Typography variant="body1" color="secondary" className="mb-6">
                Este modal tiene animaciones de entrada y salida suaves.
              </Typography>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>
                  Aceptar
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Card>

      {/* Estados de Carga */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Estados de Carga
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full spinner mx-auto mb-2"></div>
            <Typography variant="body2" color="secondary">
              Spinner
            </Typography>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full pulse mx-auto mb-2"></div>
            <Typography variant="body2" color="secondary">
              Pulse
            </Typography>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-green-500 rounded-full bounce mx-auto mb-2"></div>
            <Typography variant="body2" color="secondary">
              Bounce
            </Typography>
          </div>
        </div>
      </Card>

      {/* Validación de Formularios */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Validación de Formularios
        </Typography>
        
        <div className="space-y-4">
          <div className="form-field">
            <label className="form-label block text-sm font-medium mb-1">
              Campo Válido
            </label>
            <input 
              type="text" 
              className="w-full p-2 border border-green-300 rounded valid"
              placeholder="Campo con validación exitosa"
            />
          </div>
          
          <div className="form-field">
            <label className="form-label block text-sm font-medium mb-1">
              Campo con Error
            </label>
            <input 
              type="text" 
              className="w-full p-2 border border-red-300 rounded error"
              placeholder="Campo con error de validación"
            />
          </div>
        </div>
      </Card>

      {/* Navegación */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Efectos de Navegación
        </Typography>
        
        <div className="flex space-x-4">
          <button className="menu-item px-4 py-2 rounded">
            Inicio
          </button>
          <button className="menu-item px-4 py-2 rounded">
            Productos
          </button>
          <button className="menu-item px-4 py-2 rounded">
            Contacto
          </button>
        </div>
      </Card>

      {/* Tablas Interactivas */}
      <Card className="p-6">
        <Typography variant="h3" weight="bold" className="mb-4">
          Tablas Interactivas
        </Typography>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2">Nombre</th>
                <th className="text-left p-2">Estado</th>
                <th className="text-left p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-row">
                <td className="p-2">Usuario 1</td>
                <td className="p-2">
                  <Badge variant="success">Activo</Badge>
                </td>
                <td className="p-2">
                  <Button size="sm">Editar</Button>
                </td>
              </tr>
              <tr className="table-row">
                <td className="p-2">Usuario 2</td>
                <td className="p-2">
                  <Badge variant="warning">Pendiente</Badge>
                </td>
                <td className="p-2">
                  <Button size="sm">Editar</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MicroInteractionsDemo;
