# Chip

El componente `Chip` es un elemento visual compacto para mostrar información categorizada, estados, etiquetas o acciones. Proporciona una manera consistente de representar datos discretos con diferentes variantes, tamaños y comportamientos.

## Características

- **Múltiples variantes**: Default, primary, success, warning, danger, info, secondary y accent colors
- **Tamaños flexibles**: sm, md, lg
- **Estilos configurables**: Filled, outlined, rounded
- **Interactividad**: Clickable, removable, disabled states
- **Iconos**: Soporte para iconos y botones de eliminación
- **Accesibilidad**: Roles apropiados y estados para tecnologías asistivas

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Contenido del chip |
| `variant` | `ChipVariant` | `'default'` | Variante visual del chip |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del chip |
| `outlined` | `boolean` | `false` | Estilo con borde |
| `rounded` | `boolean` | `false` | Bordes completamente redondeados |
| `removable` | `boolean` | `false` | Mostrar botón de eliminación |
| `onRemove` | `() => void` | - | Función de eliminación |
| `icon` | `React.ReactNode` | - | Icono del chip |
| `className` | `string` | `''` | Clases CSS adicionales |
| `onClick` | `() => void` | - | Función de click |
| `disabled` | `boolean` | `false` | Estado deshabilitado |

## Variantes

### Default
```tsx
<Chip variant="default">Etiqueta</Chip>
```
- **Uso**: Etiquetas generales y neutrales
- **Color**: Fondo muted con texto muted-foreground

### Primary
```tsx
<Chip variant="primary">Importante</Chip>
```
- **Uso**: Información principal y destacada
- **Color**: Fondo primary/10 con texto primary

### Success
```tsx
<Chip variant="success">Completado</Chip>
```
- **Uso**: Estados exitosos y positivos
- **Color**: Fondo success/10 con texto success

### Warning
```tsx
<Chip variant="warning">Advertencia</Chip>
```
- **Uso**: Estados de precaución y advertencia
- **Color**: Fondo warning/10 con texto warning-foreground

### Danger
```tsx
<Chip variant="danger">Error</Chip>
```
- **Uso**: Estados de error y peligro
- **Color**: Fondo destructive/10 con texto destructive

### Info
```tsx
<Chip variant="info">Información</Chip>
```
- **Uso**: Información general y notas
- **Color**: Fondo info/10 con texto info

### Secondary
```tsx
<Chip variant="secondary">Secundario</Chip>
```
- **Uso**: Información secundaria y complementaria
- **Color**: Fondo secondary/20 con texto secondary-foreground

### Accent Colors
```tsx
<Chip variant="accent-blue">Azul</Chip>
<Chip variant="accent-purple">Púrpura</Chip>
<Chip variant="accent-orange">Naranja</Chip>
<Chip variant="accent-teal">Verde azulado</Chip>
<Chip variant="accent-indigo">Índigo</Chip>
<Chip variant="accent-pink">Rosa</Chip>
<Chip variant="accent-cyan">Cian</Chip>
<Chip variant="accent-emerald">Esmeralda</Chip>
<Chip variant="accent-violet">Violeta</Chip>
```

### Agrupaciones Lógicas (Nuevas)

#### Pendiente
```tsx
<Chip variant="pendiente">Pendiente</Chip>
<Chip variant="pendiente">Por Agendar</Chip>
<Chip variant="pendiente">En Borrador</Chip>
<Chip variant="pendiente">En Enfriamiento</Chip>
```
- **Uso**: Estados pendientes (pendiente, por agendar, en borrador, en enfriamiento)
- **Color**: Fondo azul con texto azul oscuro

#### Transitoria
```tsx
<Chip variant="transitoria">En Progreso</Chip>
<Chip variant="transitoria">Pausado</Chip>
<Chip variant="transitoria">Medio</Chip>
```
- **Uso**: Estados transitorios (en progreso, pausado, medio)
- **Color**: Fondo amarillo fuerte con texto amarillo oscuro

#### Terminada
```tsx
<Chip variant="terminada">Finalizado</Chip>
<Chip variant="terminada">Completado</Chip>
<Chip variant="terminada">Agendada</Chip>
<Chip variant="terminada">Activo</Chip>
<Chip variant="terminada">Disponible</Chip>
```
- **Uso**: Estados terminados exitosamente (agendada, finalizado, completado, convertido, bajo, activo, disponible)
- **Color**: Fondo verde con texto verde oscuro

#### Fallo
```tsx
<Chip variant="fallo">Cancelado</Chip>
<Chip variant="fallo">Alto</Chip>
<Chip variant="fallo">Crítico</Chip>
<Chip variant="fallo">Inactivo</Chip>
<Chip variant="fallo">No Disponible</Chip>
```
- **Uso**: Estados de fallo o problemas (cancelado, alto, crítico, inactivo, no disponible)
- **Color**: Fondo rojo con texto rojo oscuro

## Tamaños

### Small (sm)
```tsx
<Chip size="sm">Pequeño</Chip>
```
- **Padding**: 10px horizontal, 4px vertical
- **Texto**: xs
- **Icono**: 12x12px

### Medium (md)
```tsx
<Chip size="md">Mediano</Chip>
```
- **Padding**: 12px horizontal, 6px vertical
- **Texto**: sm
- **Icono**: 16x16px

### Large (lg)
```tsx
<Chip size="lg">Grande</Chip>
```
- **Padding**: 16px horizontal, 8px vertical
- **Texto**: base
- **Icono**: 20x20px

## Estilos

### Filled (default)
```tsx
<Chip variant="primary">Filled</Chip>
```
- **Estilo**: Fondo con color y texto contrastante
- **Uso**: Estados activos y destacados

### Outlined
```tsx
<Chip variant="primary" outlined>Outlined</Chip>
```
- **Estilo**: Borde con color y fondo transparente
- **Uso**: Estados sutiles y elegantes

### Rounded
```tsx
<Chip variant="primary" rounded>Rounded</Chip>
```
- **Estilo**: Bordes completamente redondeados
- **Uso**: Diseños más suaves y modernos

## Iconos

### Con icono
```tsx
<Chip icon={<CheckIcon />} variant="success">
  Verificado
</Chip>
```

### Con icono y outlined
```tsx
<Chip 
  icon={<AlertIcon />} 
  variant="warning" 
  outlined
>
  Pendiente
</Chip>
```

## Interactividad

### Clickeable
```tsx
<Chip 
  variant="primary" 
  onClick={() => handleChipClick()}
>
  Clickeable
</Chip>
```

### Removable
```tsx
<Chip 
  variant="default" 
  removable 
  onRemove={() => handleRemove()}
>
  Removible
</Chip>
```

### Con icono y removable
```tsx
<Chip 
  icon={<TagIcon />}
  variant="info"
  removable
  onRemove={() => handleRemove()}
>
  Etiqueta
</Chip>
```

## Estados

### Disabled
```tsx
<Chip variant="default" disabled>
  Deshabilitado
</Chip>
```

### Con todos los elementos
```tsx
<Chip 
  icon={<UserIcon />}
  variant="primary"
  removable
  onClick={() => handleClick()}
  onRemove={() => handleRemove()}
  disabled={isDisabled}
>
  Usuario Activo
</Chip>
```

## Ejemplos de Uso

### Estados de investigación
```tsx
<div className="flex gap-2">
  <Chip variant="success" icon={<CheckIcon />}>
    Completada
  </Chip>
  <Chip variant="warning" icon={<ClockIcon />}>
    En Progreso
  </Chip>
  <Chip variant="danger" icon={<XIcon />}>
    Cancelada
  </Chip>
  <Chip variant="info" icon={<PauseIcon />}>
    Pausada
  </Chip>
</div>
```

### Etiquetas de categorías
```tsx
<div className="flex flex-wrap gap-2">
  <Chip variant="accent-blue">Mercado</Chip>
  <Chip variant="accent-purple">Tecnología</Chip>
  <Chip variant="accent-orange">Salud</Chip>
  <Chip variant="accent-teal">Educación</Chip>
  <Chip variant="accent-indigo">Finanzas</Chip>
</div>
```

### Filtros removibles
```tsx
<div className="flex flex-wrap gap-2">
  {activeFilters.map((filter) => (
    <Chip
      key={filter.id}
      variant="primary"
      removable
      onRemove={() => removeFilter(filter.id)}
    >
      {filter.label}
    </Chip>
  ))}
</div>
```

### Estados de usuario
```tsx
<div className="flex gap-2">
  <Chip 
    variant="success" 
    icon={<UserIcon />}
    outlined
  >
    Activo
  </Chip>
  <Chip 
    variant="warning" 
    icon={<ClockIcon />}
    outlined
  >
    Pendiente
  </Chip>
  <Chip 
    variant="danger" 
    icon={<XIcon />}
    outlined
  >
    Inactivo
  </Chip>
</div>
```

### Estados de participantes (Nuevos)
```tsx
<div className="flex gap-2">
  <Chip variant="terminada">Activo</Chip>
  <Chip variant="terminada">Disponible</Chip>
  <Chip variant="pendiente">En Enfriamiento</Chip>
  <Chip variant="fallo">Inactivo</Chip>
  <Chip variant="fallo">No Disponible</Chip>
</div>
```

### Niveles de prioridad
```tsx
<div className="flex gap-2">
  <Chip variant="danger" size="sm">Alta</Chip>
  <Chip variant="warning" size="sm">Media</Chip>
  <Chip variant="success" size="sm">Baja</Chip>
</div>
```

### Etiquetas de archivo
```tsx
<div className="flex flex-wrap gap-2">
  <Chip variant="accent-blue" icon={<FileIcon />}>
    PDF
  </Chip>
  <Chip variant="accent-green" icon={<FileIcon />}>
    Excel
  </Chip>
  <Chip variant="accent-orange" icon={<FileIcon />}>
    Word
  </Chip>
</div>
```

## Micro-interacciones

El componente incluye las siguientes animaciones:

- **Hover**: Escala ligeramente (scale-105) cuando es clickeable
- **Active**: Escala hacia abajo (scale-95) al hacer click
- **Remove button**: Hover con fondo semitransparente
- **Transiciones**: Suaves en todos los cambios de estado

## Accesibilidad

- **Roles**: `button` cuando es clickeable
- **Tab index**: Navegación con teclado cuando es clickeable
- **ARIA labels**: Para botones de eliminación
- **Focus management**: Estados apropiados para tecnologías asistivas
- **Screen readers**: Anuncios apropiados para cambios de estado

## CSS Variables

El componente utiliza las siguientes variables CSS del tema:

```css
--color-primary
--color-success
--color-warning
--color-warning-foreground
--color-destructive
--color-info
--color-secondary
--color-secondary-foreground
--color-muted
--color-muted-foreground
--color-accent-blue
--color-accent-purple
--color-accent-orange
--color-accent-teal
--color-accent-indigo
--color-accent-pink
--color-accent-cyan
--color-accent-emerald
--color-accent-violet
```

## Mejores Prácticas

1. **Consistencia**: Usa las mismas variantes para estados similares
2. **Jerarquía visual**: Usa primary para información importante
3. **Iconos**: Incluye iconos relevantes para mejorar la comprensión
4. **Interactividad**: Usa onClick solo cuando sea necesario
5. **Removibles**: Proporciona feedback claro al eliminar
6. **Accesibilidad**: Siempre incluye contexto apropiado

## Utilidades de Chips

### chipUtils
Para facilitar el uso de chips con agrupaciones lógicas, se proporcionan utilidades:

```tsx
import { 
  getChipVariant, 
  getChipText,
  ESTADOS_TRANSITORIOS,
  ESTADOS_TERMINADOS,
  ESTADOS_FALLO,
  TIPOS_PARTICIPANTE
} from '../utils/chipUtils';

// Uso automático de agrupaciones
<Chip variant={getChipVariant('pendiente')}>
  {getChipText('pendiente')}
</Chip>

// Verificar categorías
if (isEstadoTransitorio(estado)) {
  // Lógica para estados transitorios
}
```

### Agrupaciones Automáticas
- **Pendientes**: pendiente, por agendar, en borrador, en enfriamiento
- **Transitorios**: en progreso, pausado, medio
- **Terminados**: agendada, finalizado, completado, convertido, bajo, activo, disponible
- **Fallo**: cancelado, alto, crítico, inactivo, no disponible
- **Participantes**: externo (cian), interno (azul), friend & family (violeta)

## Integración con otros componentes

### Con DataTable
```tsx
<DataTable
  columns={[
    {
      key: 'status',
      header: 'Estado',
      cell: (item) => (
        <Chip variant={getChipVariant(item.status)}>
          {getChipText(item.status)}
        </Chip>
      )
    }
  ]}
/>
```

### Con FilterBar
```tsx
<FilterBar>
  <div className="flex flex-wrap gap-2">
    {selectedFilters.map((filter) => (
      <Chip
        key={filter.id}
        variant="primary"
        removable
        onRemove={() => removeFilter(filter.id)}
      >
        {filter.label}
      </Chip>
    ))}
  </div>
</FilterBar>
```

### Con FormContainer
```tsx
<FormContainer>
  <FormItem>
    <Typography variant="label">Categorías</Typography>
    <div className="flex flex-wrap gap-2 mt-2">
      {categories.map((category) => (
        <Chip
          key={category.id}
          variant={selectedCategories.includes(category.id) ? 'primary' : 'default'}
          onClick={() => toggleCategory(category.id)}
        >
          {category.name}
        </Chip>
      ))}
    </div>
  </FormItem>
</FormContainer>
```
