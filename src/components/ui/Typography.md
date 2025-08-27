# Typography

El componente `Typography` es la base del sistema tipográfico de la plataforma. Proporciona una manera consistente y escalable de manejar todos los textos en la aplicación.

## Características

- **Escala tipográfica optimizada**: Variantes desde display hasta caption
- **Colores semánticos**: Sistema de colores coherente con el diseño
- **Responsive**: Adaptación automática a diferentes tamaños de pantalla
- **Accesibilidad**: Elementos HTML semánticos apropiados
- **Flexibilidad**: Soporte para personalización avanzada

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Contenido del texto |
| `variant` | `TypographyVariant` | `'body1'` | Variante tipográfica |
| `color` | `TypographyColor` | `'default'` | Color del texto |
| `weight` | `TypographyWeight` | - | Peso de la fuente |
| `align` | `'left' \| 'center' \| 'right' \| 'justify'` | `'left'` | Alineación del texto |
| `className` | `string` | `''` | Clases CSS adicionales |
| `as` | `keyof JSX.IntrinsicElements` | - | Elemento HTML a renderizar |
| `maxWidth` | `string` | - | Ancho máximo del texto |
| `truncate` | `boolean` | `false` | Truncar texto con ellipsis |

## Variantes

### Display
```tsx
<Typography variant="display">Título Principal</Typography>
```
- **Uso**: Títulos principales de páginas
- **Tamaño**: 3xl → 6xl (responsive)
- **Peso**: extrabold

### H1 - H6
```tsx
<Typography variant="h1">Título de Sección</Typography>
<Typography variant="h2">Subtítulo</Typography>
<Typography variant="h3">Título de Subsección</Typography>
```
- **Uso**: Jerarquía de títulos
- **Tamaños**: h1 (2xl → 4xl), h2 (xl → 3xl), h3 (lg → 2xl), etc.

### Subtitle1 & Subtitle2
```tsx
<Typography variant="subtitle1">Descripción principal</Typography>
<Typography variant="subtitle2">Descripción secundaria</Typography>
```
- **Uso**: Textos descriptivos y explicativos
- **Tamaños**: subtitle1 (base → lg), subtitle2 (sm → base)

### Body1 & Body2
```tsx
<Typography variant="body1">Texto principal del contenido</Typography>
<Typography variant="body2">Texto secundario o notas</Typography>
```
- **Uso**: Contenido principal y secundario
- **Tamaños**: body1 (base), body2 (sm)

### Caption, Overline, Label, Button
```tsx
<Typography variant="caption">Texto pequeño informativo</Typography>
<Typography variant="overline">TEXTO EN MAYÚSCULAS</Typography>
<Typography variant="label">Etiqueta de campo</Typography>
<Typography variant="button">Texto de botón</Typography>
```

## Colores

| Color | Descripción | Uso |
|-------|-------------|-----|
| `primary` | Color primario | Enlaces, acciones principales |
| `secondary` | Color secundario | Texto secundario |
| `success` | Verde de éxito | Estados positivos |
| `warning` | Amarillo de advertencia | Estados de precaución |
| `danger` | Rojo de error | Estados negativos |
| `info` | Azul informativo | Información |
| `default` | Color por defecto | Texto principal |
| `title` | Color de títulos | Títulos y encabezados |
| `muted` | Color atenuado | Texto menos importante |

## Pesos

| Peso | Descripción |
|------|-------------|
| `thin` | Muy fino |
| `light` | Fino |
| `normal` | Normal |
| `medium` | Medio |
| `semibold` | Semi-negrita |
| `bold` | Negrita |
| `extrabold` | Extra negrita |
| `black` | Muy negrita |

## Ejemplos de Uso

### Título de página
```tsx
<Typography variant="h1" color="title" weight="bold">
  Gestión de Investigaciones
</Typography>
```

### Descripción
```tsx
<Typography variant="subtitle1" color="secondary">
  Administra y supervisa todas las investigaciones activas
</Typography>
```

### Texto de contenido
```tsx
<Typography variant="body1" color="default">
  Este es el contenido principal de la página que explica
  los detalles de la funcionalidad.
</Typography>
```

### Etiqueta de campo
```tsx
<Typography variant="label" color="muted" weight="medium">
  Nombre de la Investigación *
</Typography>
```

### Texto truncado
```tsx
<Typography variant="body2" color="secondary" truncate>
  Este es un texto muy largo que se truncará automáticamente
  cuando exceda el ancho del contenedor
</Typography>
```

### Texto con ancho máximo
```tsx
<Typography variant="body1" maxWidth="400px">
  Texto con ancho máximo de 400px para mejor legibilidad
</Typography>
```

## Componentes Específicos

Para mayor conveniencia, se exportan componentes específicos:

```tsx
import { H1, H2, H3, Body1, Body2, Caption } from '@/components/ui/Typography';

// Equivalente a <Typography variant="h1">
<H1>Mi Título</H1>

// Equivalente a <Typography variant="body1">
<Body1>Mi contenido</Body1>
```

## Responsive Design

El componente se adapta automáticamente a diferentes tamaños de pantalla:

- **Mobile**: Tamaños base
- **Tablet (sm)**: Tamaños incrementados
- **Desktop (lg)**: Tamaños máximos
- **Large Desktop (xl)**: Tamaños extra grandes (solo display y h1)

## Accesibilidad

- **Elementos semánticos**: Los títulos (h1-h6) renderizan automáticamente como elementos `<h1>`-`<h6>`
- **Contraste**: Los colores están optimizados para cumplir con estándares de accesibilidad
- **Navegación**: Los títulos incluyen `scroll-m-20` para mejor navegación con teclado

## Mejores Prácticas

1. **Jerarquía**: Usa las variantes de título en orden (h1 → h2 → h3)
2. **Consistencia**: Mantén el mismo color y peso para elementos similares
3. **Legibilidad**: Usa `body1` para texto principal y `body2` para secundario
4. **Responsive**: Confía en el responsive automático, evita clases personalizadas
5. **Accesibilidad**: Usa elementos semánticos apropiados con la prop `as`

## CSS Variables

El componente utiliza las siguientes variables CSS del tema:

```css
--color-primary
--color-secondary
--color-success
--color-warning
--color-danger
--color-info
--color-foreground
--color-muted-foreground
```
