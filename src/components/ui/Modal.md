# Modal

El componente `Modal` es el contenedor de diálogos principal de la plataforma. Proporciona una manera consistente y accesible de mostrar contenido superpuesto con diferentes tamaños, posiciones y comportamientos.

## Características

- **Múltiples tamaños**: sm, md, lg, xl, full
- **Posiciones flexibles**: center, top, bottom, left, right
- **Accesibilidad completa**: Focus management, ARIA labels, keyboard navigation
- **Comportamientos configurables**: Overlay click, escape key, close button
- **Portal rendering**: Renderizado fuera del DOM normal
- **Responsive**: Adaptación automática a diferentes pantallas

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Estado de apertura del modal |
| `onClose` | `() => void` | - | Función para cerrar el modal |
| `title` | `string` | - | Título del modal |
| `children` | `React.ReactNode` | - | Contenido del modal |
| `size` | `ModalSize` | `'md'` | Tamaño del modal |
| `position` | `ModalPosition` | `'center'` | Posición del modal |
| `showCloseButton` | `boolean` | `true` | Mostrar botón de cerrar |
| `closeOnOverlayClick` | `boolean` | `true` | Cerrar al hacer click en overlay |
| `closeOnEscape` | `boolean` | `true` | Cerrar con tecla Escape |
| `className` | `string` | `''` | Clases CSS adicionales |
| `footer` | `React.ReactNode` | - | Contenido del footer |

## Tamaños

### Small (sm)
```tsx
<Modal size="sm" title="Confirmación">
  <Typography variant="body1">
    ¿Estás seguro de que deseas continuar?
  </Typography>
</Modal>
```
- **Ancho máximo**: 384px (max-w-sm)
- **Uso**: Confirmaciones simples, alertas

### Medium (md)
```tsx
<Modal size="md" title="Editar Usuario">
  <form className="space-y-4">
    <Input label="Nombre" placeholder="Ingresa el nombre" />
    <Input label="Email" type="email" placeholder="usuario@ejemplo.com" />
  </form>
</Modal>
```
- **Ancho máximo**: 448px (max-w-md)
- **Uso**: Formularios simples, información básica

### Large (lg)
```tsx
<Modal size="lg" title="Detalles de la Investigación">
  <div className="space-y-6">
    <InfoContainer>
      <InfoItem label="Título" value="Investigación de Mercado" />
      <InfoItem label="Estado" value="En Progreso" />
      <InfoItem label="Responsable" value="Juan Pérez" />
    </InfoContainer>
  </div>
</Modal>
```
- **Ancho máximo**: 512px (max-w-lg)
- **Uso**: Contenido detallado, formularios complejos

### Extra Large (xl)
```tsx
<Modal size="xl" title="Configuración Avanzada">
  <div className="grid grid-cols-2 gap-6">
    <div>Panel izquierdo</div>
    <div>Panel derecho</div>
  </div>
</Modal>
```
- **Ancho máximo**: 576px (max-w-xl)
- **Uso**: Configuraciones complejas, dashboards

### Full (full)
```tsx
<Modal size="full" title="Editor Completo">
  <div className="h-96">
    <Textarea 
      placeholder="Escribe tu contenido aquí..."
      className="h-full"
    />
  </div>
</Modal>
```
- **Ancho máximo**: 100% del viewport
- **Uso**: Editores, visualizaciones grandes

## Posiciones

### Center (default)
```tsx
<Modal position="center" title="Modal Centrado">
  Contenido centrado
</Modal>
```
- **Posición**: Centrado vertical y horizontal
- **Uso**: Diálogos estándar

### Top
```tsx
<Modal position="top" title="Notificación">
  Notificación en la parte superior
</Modal>
```
- **Posición**: Parte superior, centrado horizontal
- **Uso**: Notificaciones, alertas

### Bottom
```tsx
<Modal position="bottom" title="Acciones">
  Acciones en la parte inferior
</Modal>
```
- **Posición**: Parte inferior, centrado horizontal
- **Uso**: Acciones rápidas, confirmaciones

### Left
```tsx
<Modal position="left" title="Panel Izquierdo">
  Panel lateral izquierdo
</Modal>
```
- **Posición**: Lado izquierdo, centrado vertical
- **Uso**: Paneles laterales, navegación

### Right
```tsx
<Modal position="right" title="Panel Derecho">
  Panel lateral derecho
</Modal>
```
- **Posición**: Lado derecho, centrado vertical
- **Uso**: Paneles laterales, detalles

## Comportamientos

### Sin botón de cerrar
```tsx
<Modal 
  showCloseButton={false}
  closeOnOverlayClick={false}
  closeOnEscape={false}
  title="Modal Bloqueado"
>
  Este modal no se puede cerrar fácilmente
</Modal>
```

### Solo con Escape
```tsx
<Modal 
  closeOnOverlayClick={false}
  title="Confirmación Importante"
>
  Presiona Escape para cerrar
</Modal>
```

### Solo con botón
```tsx
<Modal 
  closeOnOverlayClick={false}
  closeOnEscape={false}
  title="Acción Requerida"
>
  Usa el botón X para cerrar
</Modal>
```

## Ejemplos de Uso

### Modal de confirmación
```tsx
const [showConfirm, setShowConfirm] = useState(false);

<Modal 
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  size="sm"
  title="Confirmar Eliminación"
>
  <div className="space-y-4">
    <Typography variant="body1">
      ¿Estás seguro de que deseas eliminar este elemento?
      Esta acción no se puede deshacer.
    </Typography>
    <div className="flex gap-3 justify-end">
      <Button variant="secondary" onClick={() => setShowConfirm(false)}>
        Cancelar
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Eliminar
      </Button>
    </div>
  </div>
</Modal>
```

### Modal con formulario
```tsx
<Modal 
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  size="lg"
  title="Crear Nueva Investigación"
>
  <form onSubmit={handleSubmit} className="space-y-4">
    <Input 
      label="Nombre de la Investigación"
      placeholder="Ingresa el nombre..."
      required
    />
    <Textarea 
      label="Descripción"
      placeholder="Describe la investigación..."
      rows={4}
    />
    <div className="flex gap-3 justify-end pt-4">
      <Button variant="secondary" onClick={() => setShowForm(false)}>
        Cancelar
      </Button>
      <Button type="submit" loading={isSubmitting}>
        Crear
      </Button>
    </div>
  </form>
</Modal>
```

### Modal con footer personalizado
```tsx
<Modal 
  isOpen={showDetails}
  onClose={() => setShowDetails(false)}
  size="xl"
  title="Detalles Completos"
  footer={
    <div className="flex gap-3">
      <Button variant="outline" icon={<DownloadIcon />}>
        Exportar
      </Button>
      <Button variant="secondary" icon={<EditIcon />}>
        Editar
      </Button>
      <Button variant="primary">
        Aplicar Cambios
      </Button>
    </div>
  }
>
  <div className="space-y-6">
    <InfoContainer>
      <InfoItem label="ID" value="INV-2024-001" />
      <InfoItem label="Título" value="Investigación de Mercado Q1" />
      <InfoItem label="Estado" value="En Progreso" />
      <InfoItem label="Responsable" value="María García" />
      <InfoItem label="Fecha de Inicio" value="15/01/2024" />
      <InfoItem label="Fecha de Fin" value="15/04/2024" />
    </InfoContainer>
    
    <div>
      <Typography variant="h5" className="mb-3">Descripción</Typography>
      <Typography variant="body1">
        Investigación completa del mercado para el primer trimestre
        del año 2024, enfocada en tendencias de consumo y preferencias
        de los usuarios.
      </Typography>
    </div>
  </div>
</Modal>
```

### Modal de carga
```tsx
<Modal 
  isOpen={isLoading}
  onClose={() => {}} // No permitir cerrar durante carga
  showCloseButton={false}
  closeOnOverlayClick={false}
  closeOnEscape={false}
  size="sm"
  title="Procesando..."
>
  <div className="text-center py-8">
    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
    <Typography variant="body1" color="secondary">
      Por favor espera mientras procesamos tu solicitud...
    </Typography>
  </div>
</Modal>
```

## Accesibilidad

### Focus Management
- **Auto-focus**: El primer elemento focusable recibe el foco automáticamente
- **Trap focus**: El foco se mantiene dentro del modal
- **Return focus**: Al cerrar, el foco regresa al elemento que abrió el modal

### ARIA Attributes
```tsx
<div 
  role="dialog"
  aria-modal="true"
  aria-labelledby={title ? 'modal-title' : undefined}
>
```

### Keyboard Navigation
- **Escape**: Cierra el modal (configurable)
- **Tab**: Navegación entre elementos focusables
- **Shift+Tab**: Navegación inversa

### Screen Readers
- **Announcement**: El modal se anuncia como diálogo
- **Title**: El título se asocia correctamente
- **State**: Los cambios de estado se anuncian

## CSS Variables

El componente utiliza las siguientes variables CSS del tema:

```css
--color-card
--color-card-foreground
--color-border
--color-muted-foreground
--color-foreground
```

## Mejores Prácticas

1. **Tamaño apropiado**: Usa el tamaño más pequeño que contenga el contenido
2. **Títulos descriptivos**: Siempre incluye títulos claros y descriptivos
3. **Contenido enfocado**: Mantén el contenido relevante y conciso
4. **Acciones claras**: Proporciona acciones claras en el footer
5. **Responsive**: Considera cómo se ve en dispositivos móviles
6. **Accesibilidad**: Siempre incluye títulos y manejo apropiado del foco

## Integración con otros componentes

### Con PageHeader
```tsx
<Modal size="lg" title="Configuración">
  <PageHeader 
    title="Configuración Avanzada"
    subtitle="Personaliza los ajustes del sistema"
    variant="title-only"
  />
  <div className="mt-6">
    {/* Contenido del modal */}
  </div>
</Modal>
```

### Con FormContainer
```tsx
<Modal size="xl" title="Crear Usuario">
  <FormContainer>
    <FormItem>
      <Input label="Nombre" required />
    </FormItem>
    <FormItem>
      <Input label="Email" type="email" required />
    </FormItem>
  </FormContainer>
</Modal>
```

### Con ConfirmModal
```tsx
// ConfirmModal usa Modal internamente
<ConfirmModal
  isOpen={showDeleteConfirm}
  onClose={() => setShowDeleteConfirm(false)}
  onConfirm={handleDelete}
  title="Eliminar Elemento"
  message="¿Estás seguro de que deseas eliminar este elemento?"
  type="error"
/>
```
