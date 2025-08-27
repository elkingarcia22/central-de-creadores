# EmptyState

## Descripción

El componente `EmptyState` proporciona un estado vacío con icono, título, descripción y opcionalmente un botón de acción, siguiendo el lineamiento del sistema de diseño: textos más claros, iconos del sistema de diseño de un solo color, y componentes internos consistentes.

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `icon` | `React.ReactNode` | - | Icono del empty state (opcional) |
| `title` | `string` | - | Título del empty state (requerido) |
| `description` | `string` | - | Descripción del empty state (requerido) |
| `actionText` | `string` | - | Texto del botón de acción (opcional) |
| `onAction` | `() => void` | - | Función que se ejecuta al hacer clic en el botón (opcional) |
| `variant` | `'default' \| 'compact' \| 'large'` | `'default'` | Variante del empty state |
| `className` | `string` | - | Clases CSS adicionales |

## Variantes

### `default`
- Padding: `py-12 px-4`
- Icono: `w-16 h-16`
- Título: `h4`
- Descripción: `body2`
- Ancho máximo: `max-w-md`

### `compact`
- Padding: `py-8 px-4`
- Icono: `w-12 h-12`
- Título: `h5`
- Descripción: `body2`
- Ancho máximo: `max-w-sm`

### `large`
- Padding: `py-16 px-6`
- Icono: `w-20 h-20`
- Título: `h3`
- Descripción: `body1`
- Ancho máximo: `max-w-lg`

## Ejemplos

### Empty state básico
```tsx
<EmptyState
  icon={<FileTextIcon className="w-8 h-8" />}
  title="Sin Libreto"
  description="Esta investigación aún no tiene un libreto configurado. Crea uno para definir el guión y configuración de las sesiones."
/>
```

### Empty state con acción
```tsx
<EmptyState
  icon={<PlusIcon className="w-8 h-8" />}
  title="Sin Investigaciones"
  description="Aún no has creado ninguna investigación. Comienza creando tu primera investigación."
  actionText="Crear Investigación"
  onAction={() => router.push('/investigaciones/crear')}
/>
```

### Empty state compacto
```tsx
<EmptyState
  icon={<UsersIcon className="w-6 h-6" />}
  title="Sin Participantes"
  description="No hay participantes registrados en este reclutamiento."
  variant="compact"
  actionText="Agregar Participante"
  onAction={() => setShowModal(true)}
/>
```

### Empty state grande
```tsx
<EmptyState
  icon={<BarChartIcon className="w-10 h-10" />}
  title="Sin Datos de Trazabilidad"
  description="Esta investigación aún no tiene datos de trazabilidad. Los datos se mostrarán aquí una vez que se complete la investigación."
  variant="large"
/>
```

## Colores de texto

### Títulos
- `text-gray-700 dark:text-gray-200`
- Color principal para el título

### Descripciones
- `text-gray-500 dark:text-gray-400`
- Color secundario para la descripción

### Iconos
- `text-gray-600 dark:text-gray-400`
- Color gris medio para consistencia

## Iconos del sistema de diseño

### Tamaños recomendados
- **Default**: `w-8 h-8`
- **Compact**: `w-6 h-6`
- **Large**: `w-10 h-10`

### Iconos recomendados por contexto
- **Documentos**: `FileTextIcon`, `DocumentIcon`
- **Creación**: `PlusIcon`, `CreateIcon`
- **Usuarios**: `UsersIcon`, `UserIcon`
- **Datos**: `BarChartIcon`, `DataIcon`
- **Configuración**: `SettingsIcon`, `ConfigIcon`
- **Información**: `InfoIcon`, `AlertIcon`

## Casos de uso

### 1. Sin contenido
```tsx
<EmptyState
  icon={<FileTextIcon className="w-8 h-8" />}
  title="Sin Documentos"
  description="No hay documentos disponibles en este momento."
/>
```

### 2. Con acción primaria
```tsx
<EmptyState
  icon={<PlusIcon className="w-8 h-8" />}
  title="Crear Nuevo Proyecto"
  description="Comienza creando tu primer proyecto para organizar tu trabajo."
  actionText="Crear Proyecto"
  onAction={() => router.push('/proyectos/crear')}
/>
```

### 3. Estado de carga vacío
```tsx
<EmptyState
  icon={<SearchIcon className="w-8 h-8" />}
  title="Sin Resultados"
  description="No se encontraron resultados para tu búsqueda. Intenta con otros términos."
  variant="compact"
/>
```

## Estructura visual

### Contenedor principal
- Centrado vertical y horizontalmente
- Padding configurable según variante
- Flexbox para alineación

### Icono
- Círculo con fondo gris claro (`bg-muted`)
- Icono centrado en color gris medio
- Tamaño configurable según variante

### Contenido
- Título centrado con peso semibold
- Descripción centrada con ancho máximo
- Botón de acción opcional

## Reglas de uso

### 1. Iconos
- Usar iconos del sistema de diseño
- Mantener tamaño consistente según variante
- Color gris medio para consistencia

### 2. Textos
- Títulos en gris oscuro para legibilidad
- Descripciones en gris medio para jerarquía
- Texto centrado para mejor presentación

### 3. Acciones
- Botón primario para acciones principales
- Texto descriptivo y claro
- Función de callback requerida

### 4. Variantes
- `default` para la mayoría de casos
- `compact` para espacios reducidos
- `large` para estados importantes

## Migración desde estructura manual

### Antes
```tsx
<div className="flex flex-col items-center justify-center py-12 px-4">
  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
    <FileTextIcon className="w-8 h-8" />
  </div>
  <Typography variant="h4" className="mb-2 text-center">
    Sin Libreto
  </Typography>
  <Typography variant="body2" color="secondary" className="mb-6 text-center max-w-md">
    Esta investigación aún no tiene un libreto configurado.
  </Typography>
  <Button variant="primary" onClick={() => router.push('/crear-libreto')}>
    Crear Libreto
  </Button>
</div>
```

### Después
```tsx
<EmptyState
  icon={<FileTextIcon className="w-8 h-8" />}
  title="Sin Libreto"
  description="Esta investigación aún no tiene un libreto configurado."
  actionText="Crear Libreto"
  onAction={() => router.push('/crear-libreto')}
/>
```
