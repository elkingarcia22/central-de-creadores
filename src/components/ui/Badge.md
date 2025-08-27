# Badge

Componente de insignia (badge) con soporte para diferentes variantes, tamaños y temas oscuro/claro.

## Props

### `children: React.ReactNode`
Contenido del badge.

### `variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'`
Variante de color del badge. Por defecto: `'default'`.

### `size?: 'sm' | 'md' | 'lg'`
Tamaño del badge. Por defecto: `'md'`.

### `className?: string`
Clases CSS adicionales.

## Tamaños

### Small (sm)
```tsx
<Badge size="sm" variant="primary">
  Nuevo
</Badge>
```

### Medium (md) - Por defecto
```tsx
<Badge size="md" variant="primary">
  Nuevo
</Badge>
```

### Large (lg)
```tsx
<Badge size="lg" variant="primary">
  Nuevo
</Badge>
```

## Variantes

### Default
```tsx
<Badge variant="default">
  Etiqueta
</Badge>
```

### Primary
```tsx
<Badge variant="primary">
  Importante
</Badge>
```

### Success
```tsx
<Badge variant="success">
  Completado
</Badge>
```

### Warning
```tsx
<Badge variant="warning">
  Advertencia
</Badge>
```

### Danger
```tsx
<Badge variant="danger">
  Crítico
</Badge>
```

### Info
```tsx
<Badge variant="info">
  Información
</Badge>
```

### Secondary
```tsx
<Badge variant="secondary">
  Secundario
</Badge>
```

## Estados

### Badge Básico
```tsx
<Badge>Etiqueta</Badge>
```

### Con Variante
```tsx
<Badge variant="success">Activo</Badge>
```

### Con Tamaño Personalizado
```tsx
<Badge size="lg" variant="primary">Destacado</Badge>
```

### Con Clases Personalizadas
```tsx
<Badge variant="warning" className="ml-2">
  Pendiente
</Badge>
```

## Integración con Otros Componentes

### Con Typography
```tsx
<Typography variant="h4">
  Título <Badge variant="primary">Nuevo</Badge>
</Typography>
```

### Con Button
```tsx
<Button>
  Notificaciones <Badge variant="danger" size="sm">3</Badge>
</Button>
```

### Con Card
```tsx
<Card>
  <div className="flex items-center justify-between">
    <Typography variant="h6">Proyecto Alpha</Typography>
    <Badge variant="success">En Progreso</Badge>
  </div>
</Card>
```

## Ejemplos de Uso Común

### Estados de Investigación
```tsx
<Badge variant="primary">Pendiente</Badge>
<Badge variant="warning">En Progreso</Badge>
<Badge variant="success">Completada</Badge>
<Badge variant="danger">Cancelada</Badge>
```

### Niveles de Riesgo
```tsx
<Badge variant="success">Bajo</Badge>
<Badge variant="warning">Medio</Badge>
<Badge variant="danger">Alto</Badge>
```

### Tipos de Usuario
```tsx
<Badge variant="primary">Administrador</Badge>
<Badge variant="secondary">Usuario</Badge>
<Badge variant="info">Invitado</Badge>
```

### Estados de Participante
```tsx
<Badge variant="success">Activo</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="danger">Inactivo</Badge>
```

### Contadores
```tsx
<Badge variant="danger" size="sm">5</Badge>
<Badge variant="info" size="sm">12</Badge>
<Badge variant="success" size="sm">25</Badge>
```

### Etiquetas de Categoría
```tsx
<Badge variant="secondary">Tecnología</Badge>
<Badge variant="info">Investigación</Badge>
<Badge variant="primary">Urgente</Badge>
```

## Accesibilidad

- Contraste adecuado en todos los temas
- Compatible con lectores de pantalla
- Estados visuales claros
- Texto legible en todos los tamaños

## Micro-interacciones

- Transiciones suaves en cambios de estado
- Feedback visual consistente
- Indicadores de estado claros

## CSS Variables Utilizadas

```css
--color-gray-100
--color-gray-800
--color-gray-700
--color-gray-200
--color-blue-100
--color-blue-800
--color-blue-900
--color-blue-200
--color-blue-700
--color-green-100
--color-green-800
--color-green-900
--color-green-200
--color-green-700
--color-amber-100
--color-amber-800
--color-amber-900
--color-amber-200
--color-amber-700
--color-red-100
--color-red-800
--color-red-900
--color-red-200
--color-red-700
--color-cyan-100
--color-cyan-800
--color-cyan-900
--color-cyan-200
--color-cyan-700
--color-purple-100
--color-purple-800
--color-purple-900
--color-purple-200
--color-purple-700
```

## Mejores Prácticas

1. **Usa colores apropiados para el contexto**
2. **Mantén consistencia en el uso de variantes**
3. **Considera el tamaño según el contexto**
4. **Proporciona contraste adecuado**
5. **Usa texto descriptivo y claro**
6. **Considera la accesibilidad en todas las implementaciones**

## Casos de Uso Específicos

### Dashboard de Investigaciones
```tsx
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <Typography variant="body1">Investigación Alpha</Typography>
    <Badge variant="warning">En Progreso</Badge>
  </div>
  <div className="flex items-center gap-2">
    <Typography variant="body1">Investigación Beta</Typography>
    <Badge variant="success">Completada</Badge>
  </div>
  <div className="flex items-center gap-2">
    <Typography variant="body1">Investigación Gamma</Typography>
    <Badge variant="danger">Cancelada</Badge>
  </div>
</div>
```

### Lista de Usuarios
```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <Typography variant="body1">Juan Pérez</Typography>
    <Badge variant="primary">Administrador</Badge>
  </div>
  <div className="flex items-center justify-between">
    <Typography variant="body1">María García</Typography>
    <Badge variant="secondary">Usuario</Badge>
  </div>
  <div className="flex items-center justify-between">
    <Typography variant="body1">Carlos López</Typography>
    <Badge variant="info">Invitado</Badge>
  </div>
</div>
```

### Métricas de Proyecto
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="text-center">
    <Typography variant="h4">15</Typography>
    <Typography variant="body2" color="secondary">Total</Typography>
    <Badge variant="primary" size="sm">Proyectos</Badge>
  </div>
  <div className="text-center">
    <Typography variant="h4">8</Typography>
    <Typography variant="body2" color="secondary">Activos</Typography>
    <Badge variant="success" size="sm">En Curso</Badge>
  </div>
  <div className="text-center">
    <Typography variant="h4">3</Typography>
    <Typography variant="body2" color="secondary">Pendientes</Typography>
    <Badge variant="warning" size="sm">Por Iniciar</Badge>
  </div>
</div>
```

### Notificaciones
```tsx
<div className="flex items-center gap-2">
  <Typography variant="body1">Notificaciones</Typography>
  <Badge variant="danger" size="sm">5</Badge>
</div>
```
