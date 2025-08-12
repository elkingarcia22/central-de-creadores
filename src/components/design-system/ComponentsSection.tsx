import React, { useState } from 'react';
import { Typography, Card, Button, Input, Textarea } from '../ui';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, EditIcon, SaveIcon } from '../icons';

const ComponentsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const componentCategories = [
    {
      id: "buttons",
      name: "Buttons",
      components: [
        { id: "button", name: "Button" }
      ]
    },
    {
      id: "inputs",
      name: "Inputs",
      components: [
        { id: "text-input", name: "Text Input" },
        { id: "textarea", name: "Textarea" },
        { id: "select", name: "Select" }
      ]
    }
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
            El componente Button es la base para todas las acciones interactivas en la interfaz. 
            Proporciona múltiples variantes, tamaños y estados para diferentes contextos de uso.
          </Typography>
          <div className="bg-muted p-4 rounded-lg">
            <Typography variant="body2" weight="medium" className="mb-2">
              Props disponibles:
            </Typography>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <code className="bg-background px-1 rounded">variant</code>: primary, secondary, outline, ghost, destructive</li>
              <li>• <code className="bg-background px-1 rounded">size</code>: sm, md, lg</li>
              <li>• <code className="bg-background px-1 rounded">icon</code>: ReactNode para mostrar iconos</li>
              <li>• <code className="bg-background px-1 rounded">iconPosition</code>: left, right</li>
              <li>• <code className="bg-background px-1 rounded">iconOnly</code>: boolean para botones solo con icono</li>
              <li>• <code className="bg-background px-1 rounded">loading</code>: boolean para estado de carga</li>
              <li>• <code className="bg-background px-1 rounded">disabled</code>: boolean para estado deshabilitado</li>
            </ul>
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
          
          <div className="space-y-6">
            {/* Primary */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Primary
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Botón principal para acciones importantes y llamadas a la acción.
              </Typography>
              <div className="flex flex-wrap gap-2">
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
              <div className="flex flex-wrap gap-2">
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
              <div className="flex flex-wrap gap-2">
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
              <div className="flex flex-wrap gap-2">
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
              <div className="flex flex-wrap gap-2">
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
              <div className="flex flex-wrap gap-2">
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
              <div className="flex flex-wrap gap-2">
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

        {/* Ejemplos de Uso */}
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Ejemplos de Uso
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Casos de uso comunes y patrones recomendados.
          </Typography>
          
          <div className="space-y-6">
            {/* Formularios */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Formularios
              </Typography>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Guardar</Button>
                <Button variant="outline">Cancelar</Button>
                <Button variant="ghost">Resetear</Button>
              </div>
            </div>

            {/* Acciones de Lista */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Acciones de Lista
              </Typography>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" icon={<EditIcon className="w-4 h-4" />}>
                  Editar
                </Button>
                <Button variant="destructive" size="sm" icon={<PlusIcon className="w-4 h-4" />}>
                  Eliminar
                </Button>
                <Button variant="ghost" size="sm" icon={<SaveIcon className="w-4 h-4" />} iconOnly />
              </div>
            </div>

            {/* Navegación */}
            <div>
              <Typography variant="h4" weight="semibold" className="mb-3">
                Navegación
              </Typography>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="lg">
                  Continuar
                </Button>
                <Button variant="secondary" size="lg">
                  Volver
                </Button>
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
              <Typography variant="body2" weight="medium" className="mb-2">
                Props disponibles:
              </Typography>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <code className="bg-background px-1 rounded">type</code>: text, email, password, number, tel, url</li>
                <li>• <code className="bg-background px-1 rounded">size</code>: sm, md, lg</li>
                <li>• <code className="bg-background px-1 rounded">placeholder</code>: texto de placeholder</li>
                <li>• <code className="bg-background px-1 rounded">disabled</code>: boolean para estado deshabilitado</li>
                <li>• <code className="bg-background px-1 rounded">error</code>: boolean para estado de error</li>
                <li>• <code className="bg-background px-1 rounded">icon</code>: ReactNode para mostrar iconos</li>
              </ul>
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
                    <Input placeholder="Campo con error" error />
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
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Textarea Component
          </Typography>
          <Typography variant="body1" color="secondary">
            Componente de área de texto multilínea para formularios.
          <div className="space-y-4 mt-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tamaños</Typography>
              <div className="space-y-2">
                <Textarea size="sm" placeholder="Small..." rows={2} />
                <Textarea placeholder="Medium..." rows={3} />
                <Textarea size="lg" placeholder="Large..." rows={5} />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Estados</Typography>
              <div className="space-y-2">
                <Textarea label="Con Label" placeholder="Con etiqueta..." helperText="Texto de ayuda" rows={3} />
                <Textarea placeholder="Con error..." error="Campo requerido" rows={3} />
                <Textarea placeholder="Deshabilitado..." disabled rows={3} />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Redimensionamiento</Typography>
              <div className="space-y-2">
                <Textarea placeholder="Vertical..." resize="vertical" rows={3} />
                <Textarea placeholder="Horizontal..." resize="horizontal" rows={3} />
                <Textarea placeholder="Ambas..." resize="both" rows={3} />
                <Textarea placeholder="Ninguna..." resize="none" rows={3} />
              </div>
            </div>
          </div>
          </Typography>
        </Card>
      );
    }
    
    if (activeComponent === 'select') {
      return (
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Select Component
          </Typography>
          <Typography variant="body1" color="secondary">
            Componente de selección de opciones para formularios.
          <div className="space-y-4 mt-4">
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Tamaños</Typography>
              <div className="space-y-2">
                <Select 
                  options={[
                    { value: "colombia", label: "Colombia" },
                    { value: "mexico", label: "México" },
                    { value: "argentina", label: "Argentina" }
                  ]}
                  placeholder="Small..."
                  size="sm"
                />
                <Select 
                  options={[
                    { value: "active", label: "Activo" },
                    { value: "inactive", label: "Inactivo" },
                    { value: "pending", label: "Pendiente" }
                  ]}
                  placeholder="Medium..."
                />
                <Select 
                  options={[
                    { value: "technology", label: "Tecnología" },
                    { value: "design", label: "Diseño" },
                    { value: "marketing", label: "Marketing" }
                  ]}
                  placeholder="Large..."
                  size="lg"
                />
              </div>
            </div>
            <div>
              <Typography variant="h4" weight="semibold" className="mb-2">Estados</Typography>
              <div className="space-y-2">
                <Select 
                  options={[
                    { value: "colombia", label: "Colombia" },
                    { value: "mexico", label: "México" }
                  ]}
                  label="Con Label"
                  placeholder="Con etiqueta..."
                  helperText="Texto de ayuda"
                />
                <Select 
                  options={[
                    { value: "active", label: "Activo" },
                    { value: "inactive", label: "Inactivo" }
                  ]}
                  placeholder="Con error..."
                  error="Campo requerido"
                />
                <Select 
                  options={[
                    { value: "technology", label: "Tecnología" },
                    { value: "design", label: "Diseño" }
                  ]}
                  placeholder="Deshabilitado..."
                  disabled
                />
              </div>
            </div>
          </div>
          </Typography>
        </Card>
      );
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
                  className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    {category.id === 'inputs' && <PlusIcon className="w-4 h-4" />}
                    {category.id === 'buttons' && <EditIcon className="w-4 h-4" />}
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
                        className={`w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors text-left focus:outline-none ${
                          activeComponent === component.id
                            ? 'bg-muted text-foreground border-r-2 border-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Typography variant="body2" weight="medium">
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
