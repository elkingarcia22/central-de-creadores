# FilterLabel

Componente específico para los labels de los filtros en la plataforma. Diseñado para ser más pequeño y claro que el componente `Subtitle`, ideal para formularios de filtros y campos de entrada.

## Uso

```tsx
import { FilterLabel } from '../ui';

<FilterLabel>Estado</FilterLabel>
<Select
  placeholder="Seleccionar estado..."
  options={options}
  value={value}
  onChange={onChange}
/>
```

## Props

| Prop | Tipo | Descripción | Por defecto |
|------|------|-------------|-------------|
| `children` | `React.ReactNode` | Contenido del label | - |
| `className` | `string` | Clases CSS adicionales | - |

## Características

- **Tamaño**: `text-sm` (más pequeño que Subtitle)
- **Peso**: `font-medium` (semi-bold)
- **Color**: `text-gray-600 dark:text-gray-400` (gris claro consistente)
- **Espaciado**: `mb-2` (margen inferior)
- **Display**: `block` (elemento de bloque)

## Ejemplos

### Label básico
```tsx
<FilterLabel>Nombre del Campo</FilterLabel>
```

### Con clases adicionales
```tsx
<FilterLabel className="text-red-500">Campo Requerido</FilterLabel>
```

## Diseño

El componente usa la paleta de colores del sistema de diseño:
- **Modo claro**: `text-gray-600`
- **Modo oscuro**: `text-gray-400`

Esto asegura que el texto sea legible pero no tan prominente como los títulos principales, perfecto para labels de formularios y filtros.
