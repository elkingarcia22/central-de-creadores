# Card

El componente `Card` es el contenedor visual principal de la plataforma. Proporciona una manera consistente de agrupar y presentar contenido relacionado con diferentes estilos y niveles de elevación.

## Características

- **Múltiples variantes**: Default, elevated, outlined
- **Padding flexible**: none, sm, md, lg
- **Interactivo**: Soporte para click con animaciones
- **Responsive**: Adaptación automática a diferentes pantallas
- **Accesibilidad**: Estados apropiados para interacciones
- **Animaciones**: Micro-interacciones suaves

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Contenido de la tarjeta |
| `variant` | `'default' \| 'elevated' \| 'outlined'` | `'default'` | Estilo visual de la tarjeta |
| `className` | `string` | `''` | Clases CSS adicionales |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Espaciado interno |
| `onClick` | `() => void` | - | Función de click |

## Variantes

### Default
```tsx
<Card variant="default">
  <Typography variant="h4">Título de la Tarjeta</Typography>
  <Typography variant="body1">Contenido de la tarjeta</Typography>
</Card>
```
- **Uso**: Contenido principal y general
- **Estilo**: Fondo de tarjeta con borde sutil
- **Color**: Fondo card con texto card-foreground

### Elevated
```tsx
<Card variant="elevated">
  <Typography variant="h4">Tarjeta Elevada</Typography>
  <Typography variant="body1">Contenido con mayor prominencia</Typography>
</Card>
```
- **Uso**: Contenido que necesita mayor prominencia
- **Estilo**: Similar a default pero con mayor énfasis visual
- **Color**: Fondo card con texto card-foreground

### Outlined
```tsx
<Card variant="outlined">
  <Typography variant="h4">Tarjeta con Borde</Typography>
  <Typography variant="body1">Contenido con borde prominente</Typography>
</Card>
```
- **Uso**: Contenido que necesita separación visual clara
- **Estilo**: Fondo transparente con borde visible
- **Color**: Fondo background con texto foreground

## Padding

### None
```tsx
<Card padding="none">
  <img src="/image.jpg" alt="Imagen" className="w-full h-48 object-cover rounded-lg" />
</Card>
```
- **Uso**: Contenido que necesita control total del espaciado
- **Aplicación**: Imágenes, contenido personalizado

### Small (sm)
```tsx
<Card padding="sm">
  <Typography variant="h5">Título Compacto</Typography>
  <Typography variant="body2">Contenido con espaciado reducido</Typography>
</Card>
```
- **Espaciado**: 12px (p-3)
- **Uso**: Contenido compacto y denso

### Medium (md)
```tsx
<Card padding="md">
  <Typography variant="h4">Título Normal</Typography>
  <Typography variant="body1">Contenido con espaciado estándar</Typography>
</Card>
```
- **Espaciado**: 16px (p-4)
- **Uso**: Contenido estándar y general

### Large (lg)
```tsx
<Card padding="lg">
  <Typography variant="h3">Título Espacioso</Typography>
  <Typography variant="body1">Contenido con espaciado generoso</Typography>
</Card>
```
- **Espaciado**: 24px (p-6)
- **Uso**: Contenido que necesita respiración visual

## Interactividad

### Tarjeta Clickeable
```tsx
<Card onClick={() => handleCardClick()}>
  <Typography variant="h4">Tarjeta Interactiva</Typography>
  <Typography variant="body2">Haz click para ver más detalles</Typography>
</Card>
```

### Con hover y animaciones
```tsx
<Card 
  variant="elevated" 
  onClick={() => navigate('/details')}
  className="transition-all duration-300"
>
  <Typography variant="h4">Navegación</Typography>
  <Typography variant="body2">Click para navegar</Typography>
</Card>
```

## Ejemplos de Uso

### Tarjeta de información
```tsx
<Card variant="default" padding="md">
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
      <UserIcon className="w-5 h-5 text-white" />
    </div>
    <div>
      <Typography variant="h5" weight="semibold">Juan Pérez</Typography>
      <Typography variant="body2" color="secondary">Investigador Principal</Typography>
    </div>
  </div>
  <Typography variant="body1">
    Experto en metodologías de investigación cualitativa
    con más de 10 años de experiencia en el campo.
  </Typography>
</Card>
```

### Tarjeta de estadísticas
```tsx
<Card variant="elevated" padding="lg">
  <div className="text-center">
    <Typography variant="h2" color="primary" weight="bold">156</Typography>
    <Typography variant="subtitle1" color="secondary">Investigaciones Activas</Typography>
    <div className="mt-4 p-3 bg-success/10 rounded-lg">
      <Typography variant="body2" color="success">
        +12% desde el mes pasado
      </Typography>
    </div>
  </div>
</Card>
```

### Tarjeta de formulario
```tsx
<Card variant="outlined" padding="lg">
  <Typography variant="h4" className="mb-6">Crear Nueva Investigación</Typography>
  <form className="space-y-4">
    <div>
      <Typography variant="label" color="muted" className="mb-2 block">
        Nombre de la Investigación
      </Typography>
      <Input placeholder="Ingresa el nombre..." />
    </div>
    <div>
      <Typography variant="label" color="muted" className="mb-2 block">
        Descripción
      </Typography>
      <Textarea placeholder="Describe la investigación..." />
    </div>
    <div className="flex gap-3 pt-4">
      <Button variant="secondary">Cancelar</Button>
      <Button variant="primary">Crear</Button>
    </div>
  </form>
</Card>
```

### Tarjeta de lista
```tsx
<Card padding="none">
  <div className="p-4 border-b border-border">
    <Typography variant="h5">Participantes</Typography>
  </div>
  <div className="divide-y divide-border">
    {participants.map((participant) => (
      <div key={participant.id} className="p-4 hover:bg-muted/50">
        <Typography variant="body1" weight="medium">
          {participant.name}
        </Typography>
        <Typography variant="body2" color="secondary">
          {participant.role}
        </Typography>
      </div>
    ))}
  </div>
</Card>
```

### Tarjeta con imagen
```tsx
<Card padding="none" className="overflow-hidden">
  <img 
    src="/investigation-image.jpg" 
    alt="Investigación" 
    className="w-full h-48 object-cover"
  />
  <div className="p-4">
    <Typography variant="h5" className="mb-2">
      Metodología de Investigación
    </Typography>
    <Typography variant="body2" color="secondary" className="mb-4">
      Explorando nuevas técnicas para recolección de datos
    </Typography>
    <Button variant="primary" size="sm">
      Ver Detalles
    </Button>
  </div>
</Card>
```

## Micro-interacciones

Cuando la tarjeta es clickeable (`onClick` presente), incluye:

- **Hover**: Cambio sutil de fondo y escala (scale-[1.01])
- **Active**: Escala hacia abajo (scale-[0.99])
- **Transiciones**: Suaves en todos los cambios de estado

## Accesibilidad

- **Focus**: Manejo apropiado del foco cuando es clickeable
- **Keyboard**: Soporte para navegación con teclado
- **Screen readers**: Estados apropiados para tecnologías asistivas
- **Semantic**: Uso de elementos semánticos apropiados

## CSS Variables

El componente utiliza las siguientes variables CSS del tema:

```css
--color-card
--color-card-foreground
--color-background
--color-foreground
--color-border
--color-accent
--color-muted
```

## Mejores Prácticas

1. **Jerarquía visual**: Usa elevated para contenido importante
2. **Consistencia**: Mantén el mismo padding para tarjetas relacionadas
3. **Contenido**: Agrupa contenido relacionado lógicamente
4. **Interactividad**: Usa onClick solo cuando sea necesario
5. **Responsive**: El componente se adapta automáticamente
6. **Accesibilidad**: Proporciona contexto apropiado para tarjetas clickeables

## Integración con otros componentes

### Con Typography
```tsx
<Card>
  <Typography variant="h4" className="mb-4">Título</Typography>
  <Typography variant="body1">Contenido</Typography>
</Card>
```

### Con Button
```tsx
<Card>
  <Typography variant="h5" className="mb-4">Acción</Typography>
  <Button variant="primary">Ejecutar</Button>
</Card>
```

### Con FormContainer
```tsx
<Card>
  <FormContainer>
    <FormItem>
      <Typography variant="label">Campo</Typography>
      <Input />
    </FormItem>
  </FormContainer>
</Card>
```
