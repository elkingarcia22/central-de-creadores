# ActivityCard

## Descripción

El componente `ActivityCard` proporciona una tarjeta de actividad con timeline que sigue el lineamiento establecido del sistema de diseño: textos más claros, iconos del sistema de diseño de un solo color, y componentes internos consistentes.

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `id` | `string` | - | ID único de la actividad (requerido) |
| `tipo` | `string` | - | Tipo de actividad (requerido) |
| `label` | `string` | - | Etiqueta de la actividad (requerido) |
| `color` | `'success' \| 'info' \| 'warning' \| 'danger' \| 'default'` | - | Color del chip (requerido) |
| `icon` | `React.ReactNode` | - | Icono de la actividad (requerido) |
| `userName` | `string` | - | Nombre del usuario (requerido) |
| `userAvatar` | `string` | - | Avatar del usuario (opcional) |
| `fechaCreacion` | `string` | - | Fecha de creación (requerido) |
| `resumen` | `string` | - | Resumen de la actividad (requerido) |
| `isLast` | `boolean` | `false` | Si es el último elemento del timeline |
| `className` | `string` | - | Clases CSS adicionales |

## Ejemplos

### Actividad básica
```tsx
<ActivityCard
  id="1"
  tipo="creacion"
  label="Creación"
  color="success"
  icon={<PlusIcon className="w-4 h-4" />}
  userName="Juan Pérez"
  userAvatar="https://example.com/avatar.jpg"
  fechaCreacion="2024-01-01T10:00:00Z"
  resumen="Investigación creada exitosamente"
/>
```

### Actividad de edición
```tsx
<ActivityCard
  id="2"
  tipo="edicion"
  label="Edición"
  color="info"
  icon={<EditIcon className="w-4 h-4" />}
  userName="María García"
  fechaCreacion="2024-01-02T15:30:00Z"
  resumen="Se actualizó la información del proyecto"
/>
```

### Actividad de cambio de estado
```tsx
<ActivityCard
  id="3"
  tipo="cambio_estado"
  label="Cambio de Estado"
  color="warning"
  icon={<RefreshIcon className="w-4 h-4" />}
  userName="Carlos López"
  fechaCreacion="2024-01-03T09:15:00Z"
  resumen="Estado cambiado de 'En progreso' a 'Completado'"
  isLast={true}
/>
```

## Colores disponibles

### `success`
- Para actividades de creación
- Color verde
- Iconos: PlusIcon, CheckIcon

### `info`
- Para actividades de edición y cambios menores
- Color azul
- Iconos: EditIcon, InfoIcon

### `warning`
- Para cambios de estado y alertas
- Color naranja/amarillo
- Iconos: RefreshIcon, AlertIcon

### `danger`
- Para eliminaciones y errores
- Color rojo
- Iconos: TrashIcon, XIcon

### `default`
- Para actividades genéricas
- Color gris
- Iconos: DocumentIcon, ClockIcon

## Estructura visual

### Timeline
- Línea vertical que conecta las actividades
- Se oculta en el último elemento (`isLast={true}`)
- Color sutil (`bg-muted/60`)

### Punto del timeline
- Círculo con fondo gris claro
- Icono centrado en color gris medio
- Borde blanco para contraste

### Contenido de la tarjeta
- Chip con el tipo de actividad
- Nombre del usuario en gris medio
- Avatar del usuario
- Fecha relativa y absoluta
- Resumen de la actividad

## Colores de texto

### Nombres de usuario
- `text-gray-600 dark:text-gray-300`
- Peso medio para destacar

### Fechas
- `text-gray-500 dark:text-gray-400`
- Fecha absoluta más sutil

### Resumen
- `text-gray-700 dark:text-gray-200`
- Color principal para el contenido

## Iconos del sistema de diseño

### Tamaño estándar
- `w-4 h-4` para iconos en el timeline
- Color: `text-gray-600 dark:text-gray-400`

### Iconos recomendados
- **Creación**: PlusIcon, FileIcon
- **Edición**: EditIcon, PencilIcon
- **Estado**: RefreshIcon, CheckIcon
- **Eliminación**: TrashIcon, XIcon
- **Información**: InfoIcon, AlertIcon

## Casos de uso

### 1. Timeline de actividades
```tsx
<div className="space-y-4">
  {actividades.map((actividad, index) => (
    <ActivityCard
      key={actividad.id}
      {...actividad}
      isLast={index === actividades.length - 1}
    />
  ))}
</div>
```

### 2. Actividad individual
```tsx
<ActivityCard
  id="unique-id"
  tipo="notificacion"
  label="Notificación"
  color="info"
  icon={<BellIcon className="w-4 h-4" />}
  userName="Sistema"
  fechaCreacion={new Date().toISOString()}
  resumen="Nueva notificación recibida"
/>
```

## Reglas de uso

### 1. Iconos
- Usar iconos del sistema de diseño
- Mantener tamaño consistente (`w-4 h-4`)
- Color gris medio para consistencia

### 2. Colores
- Usar colores semánticos para los chips
- Textos en grises para mejor legibilidad
- Mantener contraste en modo oscuro

### 3. Timeline
- Siempre usar `isLast={true}` en el último elemento
- Mantener espaciado consistente
- Línea vertical sutil

### 4. Fechas
- Mostrar fecha relativa y absoluta
- Formato consistente: `dd/MM/yyyy HH:mm`
- Locale en español

## Migración desde Card manual

### Antes
```tsx
<div className="flex items-start gap-3 relative group">
  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted/60" />
  <div className="z-10 w-8 flex flex-col items-center">
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl bg-muted border-2 border-white shadow">
      {icon}
    </div>
  </div>
  <Card className="flex-1 p-4 mb-2">
    <div className="flex items-center gap-2 mb-1">
      <Chip variant={color} size="sm">{label}</Chip>
      <Typography variant="body2" className="font-medium">
        {userName}
      </Typography>
      {/* ... más contenido */}
    </div>
  </Card>
</div>
```

### Después
```tsx
<ActivityCard
  id={actividad.id}
  tipo={actividad.tipo}
  label={actividad.label}
  color={actividad.color}
  icon={actividad.icon}
  userName={actividad.userName}
  userAvatar={actividad.userAvatar}
  fechaCreacion={actividad.fechaCreacion}
  resumen={actividad.resumen}
  isLast={isLast}
/>
```
