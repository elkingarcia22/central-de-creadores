# Subtitle

## Descripción

El componente `Subtitle` proporciona un subtítulo consistente con el mismo color que los títulos principales pero con un tamaño más pequeño para crear jerarquía visual. Está diseñado para ser usado como subtítulos en secciones, listas y contenido secundario.

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Contenido del subtítulo (requerido) |
| `className` | `string` | - | Clases CSS adicionales |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del subtítulo |
| `alignment` | `'left' \| 'center' \| 'right'` | `'left'` | Alineación del texto |
| `weight` | `'normal' \| 'medium' \| 'semibold' \| 'bold'` | `'semibold'` | Peso de la fuente |

## Ejemplos

### Subtítulo básico
```tsx
<Subtitle>Actividades (5)</Subtitle>
```

### Subtítulo con tamaño personalizado
```tsx
<Subtitle size="lg" weight="bold">Sección importante</Subtitle>
```

### Subtítulo centrado
```tsx
<Subtitle alignment="center">Título centrado</Subtitle>
```

### Subtítulo pequeño
```tsx
<Subtitle size="sm" weight="normal">Información adicional</Subtitle>
```

## Tamaños disponibles

### `sm` (h6)
- Tamaño más pequeño
- Ideal para información secundaria
- Usar con `weight="normal"` para texto descriptivo

### `md` (h5) - Default
- Tamaño estándar para subtítulos
- Perfecto para títulos de secciones
- Usar con `weight="semibold"` para mejor jerarquía

### `lg` (h4)
- Tamaño más grande
- Para subtítulos importantes
- Usar con `weight="bold"` para mayor énfasis

## Colores

El componente usa el mismo color que los títulos principales:
- **Claro**: `text-gray-600`
- **Oscuro**: `text-gray-300`

Esto asegura consistencia visual con el sistema de diseño.

## Casos de uso

### 1. Títulos de secciones
```tsx
<Subtitle>Actividades (5)</Subtitle>
<Subtitle>Información del proyecto</Subtitle>
<Subtitle>Equipo asignado</Subtitle>
```

### 2. Subtítulos de listas
```tsx
<Subtitle size="sm">Participantes registrados</Subtitle>
<Subtitle size="sm">Tareas pendientes</Subtitle>
```

### 3. Información contextual
```tsx
<Subtitle size="sm" weight="normal">
  Última actualización: hace 2 horas
</Subtitle>
```

## Reglas de uso

### 1. Jerarquía visual
- Usar para crear niveles de información
- Mantener consistencia en el mismo contexto
- No usar para títulos principales (usar `PageHeader` o `Typography`)

### 2. Tamaños
- `sm`: Para información secundaria y descriptiva
- `md`: Para títulos de secciones (default)
- `lg`: Para subtítulos importantes

### 3. Pesos
- `normal`: Para texto descriptivo
- `medium`: Para información importante
- `semibold`: Para títulos de secciones (default)
- `bold`: Para énfasis especial

### 4. Alineación
- `left`: Para la mayoría de casos (default)
- `center`: Para títulos centrados
- `right`: Para información alineada a la derecha

## Migración desde Typography

### Antes
```tsx
<Typography variant="h5" color="secondary" weight="semibold">
  Actividades (5)
</Typography>
```

### Después
```tsx
<Subtitle>Actividades (5)</Subtitle>
```

## Diferencias con otros componentes

| Componente | Propósito | Color | Tamaño |
|------------|-----------|-------|--------|
| `PageHeader` | Títulos de página | Gris medio | Grande |
| `Typography` | Texto general | Variable | Variable |
| `Subtitle` | Subtítulos | Gris medio | Pequeño |
| `ContainerTitle` | Títulos de contenedores | Gris medio | Variable |
