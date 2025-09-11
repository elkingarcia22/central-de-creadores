# AIButton

Un botón especializado con efectos futuristas para acciones relacionadas con IA.

## Características

- **Efectos visuales avanzados**: Brillo animado, partículas sutiles y efectos de hover
- **Consistente con el sistema**: Usa los mismos tamaños y estilos base que otros botones
- **Accesible**: Soporte completo para estados de carga y deshabilitado
- **Personalizable**: Múltiples tamaños y contenido personalizable

## Uso básico

```tsx
import { AIButton } from '@/components/ui/AIButton';

// Uso básico
<AIButton onClick={handleSaveAndAnalyze} />

// Con texto personalizado
<AIButton onClick={handleAction}>
  Analizar con IA
</AIButton>
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | `"Guardar y Analizar con IA"` | Contenido del botón |
| `onClick` | `() => void` | - | Función a ejecutar al hacer click |
| `disabled` | `boolean` | `false` | Estado deshabilitado |
| `loading` | `boolean` | `false` | Estado de carga (muestra spinner) |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Tamaño del botón |
| `className` | `string` | `""` | Clases CSS adicionales |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Tipo de botón HTML |

## Tamaños

### Small (`sm`)
- Padding: `px-3 py-1.5`
- Texto: `text-sm`
- Icono: `w-3 h-3`
- Gap: `gap-1.5`

### Medium (`md`) - Default
- Padding: `px-4 py-2`
- Texto: `text-base`
- Icono: `w-4 h-4`
- Gap: `gap-2`

### Large (`lg`)
- Padding: `px-6 py-3`
- Texto: `text-lg`
- Icono: `w-5 h-5`
- Gap: `gap-2.5`

## Estados

### Normal
- Borde azul sólido
- Texto azul
- Efectos de hover activos

### Hover
- Borde azul más oscuro
- Texto azul más oscuro
- Efectos de brillo y partículas
- Escala ligeramente mayor

### Loading
- Spinner en lugar del icono de IA
- Botón deshabilitado
- Sin efectos de hover

### Disabled
- Opacidad reducida
- Sin efectos de hover
- Cursor no permitido

## Efectos visuales

### Efecto de brillo animado
- Brillo que se desliza de izquierda a derecha en hover
- Duración: 1000ms
- Color: azul con transparencia

### Partículas sutiles
- Pequeños puntos que aparecen en hover
- Animación de pulso
- Colores: azul y púrpura

### Efecto de escala
- Escala al 105% en hover
- Escala al 95% en click activo
- Transición suave

### Borde brillante
- Resplandor sutil en hover
- Gradiente azul-púrpura
- Efecto blur

## Ejemplos de uso

### Botón de análisis
```tsx
<AIButton 
  onClick={handleAnalyze}
  loading={isAnalyzing}
>
  Analizar datos con IA
</AIButton>
```

### Botón de guardado
```tsx
<AIButton 
  onClick={handleSave}
  size="lg"
  disabled={!hasChanges}
>
  Guardar y procesar
</AIButton>
```

### Botón pequeño
```tsx
<AIButton 
  onClick={handleQuickAction}
  size="sm"
>
  IA
</AIButton>
```

## Accesibilidad

- Soporte completo para navegación por teclado
- Estados de focus visibles
- Texto alternativo para lectores de pantalla
- Respeta preferencias de movimiento reducido

## Consideraciones de rendimiento

- Efectos CSS optimizados para GPU
- Transiciones suaves sin bloqueo
- Animaciones que respetan `prefers-reduced-motion`
- Uso eficiente de recursos

## Integración con el sistema

El `AIButton` está diseñado para integrarse perfectamente con el sistema de diseño existente:

- Usa las mismas clases base que `Button`
- Respeta la paleta de colores del sistema
- Mantiene consistencia en tamaños y espaciado
- Compatible con el sistema de tokens de diseño
