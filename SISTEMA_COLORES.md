# Sistema de Colores - Design System

## Descripción General

Este sistema de colores está diseñado siguiendo las mejores prácticas de design systems modernos. Utiliza variables CSS que cambian automáticamente entre modo claro y oscuro, proporcionando una experiencia consistente y profesional.

## Estructura del Sistema

### 🎨 Colores Primarios
Azul principal para botones primarios, enlaces y elementos principales.
```css
/* Disponible en tonos 50-950 */
bg-primary-500    /* Color principal */
bg-primary-600    /* Hover states */
bg-primary-700    /* Active states */
text-primary-600  /* Texto principal */
```

### 🎨 Colores Secundarios  
Púrpura para elementos secundarios y acentos.
```css
bg-secondary-500
bg-secondary-600
text-secondary-600
```

### 🎨 Colores de Estado

#### ✅ Success (Verde)
```css
/* Modo Claro */
bg-success-100     /* Fondos sutiles */
text-success-800   /* Texto de éxito */
border-success-500 /* Bordes */

/* Modo Oscuro - Colores Pasteles */
bg-green-900/30    /* Fondo verde suave translúcido */
text-green-200     /* Texto verde claro */
border-green-700/50 /* Borde verde suave */
```

#### ❌ Error/Danger (Rojo)
```css
/* Modo Claro */
bg-error-100       /* Fondos sutiles */
text-error-800     /* Texto de error */
border-error-500   /* Bordes */

/* Modo Oscuro - Colores Pasteles */
bg-red-900/30      /* Fondo rojo suave translúcido */
text-red-200       /* Texto rojo claro */
border-red-700/50  /* Borde rojo suave */
```

#### ⚠️ Warning (Amarillo/Ámbar)
```css
/* Modo Claro */
bg-warning-100     /* Fondos sutiles */
text-warning-800   /* Texto de advertencia */
border-warning-500 /* Bordes */

/* Modo Oscuro - Colores Pasteles */
bg-amber-900/30    /* Fondo ámbar suave translúcido */
text-amber-200     /* Texto ámbar claro */
border-amber-700/50 /* Borde ámbar suave */
```

#### ℹ️ Info (Cian)
```css
/* Modo Claro */
bg-info-100        /* Fondos sutiles */
text-info-800      /* Texto informativo */
border-info-500    /* Bordes */

/* Modo Oscuro - Colores Pasteles */
bg-cyan-900/30     /* Fondo cyan suave translúcido */
text-cyan-200      /* Texto cyan claro */
border-cyan-700/50 /* Borde cyan suave */
```

#### 🔵 Primary (Azul)
```css
/* Modo Claro */
bg-primary-100     /* Fondos sutiles */
text-primary-800   /* Texto primario */
border-primary-500 /* Bordes */

/* Modo Oscuro - Colores Pasteles */
bg-blue-900/30     /* Fondo azul suave translúcido */
text-blue-200      /* Texto azul claro */
border-blue-700/50 /* Borde azul suave */
```

#### 🟣 Secondary (Púrpura)
```css
/* Modo Claro */
bg-secondary-100   /* Fondos sutiles */
text-secondary-800 /* Texto secundario */
border-secondary-500 /* Bordes */

/* Modo Oscuro - Colores Pasteles */
bg-purple-900/30   /* Fondo púrpura suave translúcido */
text-purple-200    /* Texto púrpura claro */
border-purple-700/50 /* Borde púrpura suave */
```

### 🎨 Colores Semánticos (Recomendados)

Estos colores se adaptan automáticamente al tema:

```css
/* Fondos principales */
bg-background      /* Fondo principal de la app */
bg-card           /* Fondo de tarjetas */
bg-elevated       /* Superficies elevadas */
bg-sunken         /* Superficies hundidas */
bg-muted          /* Fondos sutiles */

/* Texto */
text-foreground        /* Texto principal */
text-card-foreground   /* Texto en tarjetas */
text-muted-foreground  /* Texto secundario */

/* Bordes */
border-gray-200 dark:border-gray-800   /* Bordes principales */
border-input      /* Bordes de inputs */

/* Estados de foco */
ring-ring         /* Anillos de foco */
```

## Componentes con Colores Pasteles

### Chip Component
El componente Chip implementa los colores pasteles para modo oscuro:

```tsx
// Ejemplo de uso
<Chip variant="danger" size="sm" icon={<AlertIcon />}>
  Alerta Alta
</Chip>

<Chip variant="warning" size="sm" icon={<InfoIcon />}>
  Atención
</Chip>

<Chip variant="success" size="sm" icon={<CheckIcon />}>
  En Tiempo
</Chip>
```

**Variantes disponibles:**
- `danger` - Rojo pastel en modo oscuro
- `warning` - Ámbar pastel en modo oscuro  
- `success` - Verde pastel en modo oscuro
- `info` - Cyan pastel en modo oscuro
- `primary` - Azul pastel en modo oscuro
- `secondary` - Púrpura pastel en modo oscuro

## Ejemplos de Uso

### Botones
```tsx
// Botón primario
<Button variant="primary">Guardar</Button>

// Botón de error
<Button variant="error">Eliminar</Button>

// Botón secundario
<Button variant="secondary">Cancelar</Button>
```

### Tarjetas
```tsx
// Tarjeta estándar
<Card variant="default">Contenido</Card>

// Tarjeta elevada
<Card variant="elevated" shadow="lg">Contenido</Card>

// Tarjeta hundida
<Card variant="sunken">Contenido</Card>
```

### Mensajes de Estado
```tsx
// Mensaje de éxito
<div className="bg-success-100 border border-success-300 text-success-700 p-4 rounded">
  ✅ Operación exitosa
</div>

// Mensaje de error
<div className="bg-error-100 border border-error-300 text-error-700 p-4 rounded">
  ❌ Error en la operación
</div>

// Mensaje de advertencia
<div className="bg-warning-100 border border-warning-300 text-warning-700 p-4 rounded">
  ⚠️ Advertencia importante
</div>
```

### Elementos Interactivos
```tsx
// Hover states automáticos
<div className="bg-card hover:bg-muted p-4 rounded cursor-pointer transition-colors">
  Elemento clickeable
</div>

// Estados de foco
<input className="bg-input border-gray-200 dark:border-gray-800 focus:ring-ring focus:border-primary-500" />
```

## Modo Oscuro

El sistema cambia automáticamente todos los colores cuando se aplica la clase `dark` al elemento `html`:

```tsx
// En tu ThemeContext o similar
const toggleTheme = () => {
  document.documentElement.classList.toggle('dark');
};
```

### Colores Pasteles en Modo Oscuro

Los componentes que implementan colores pasteles en modo oscuro:

1. **Chip** - Para badges y etiquetas
2. **Badge** - Para indicadores de estado
3. **Alert** - Para mensajes de sistema
4. **Status Indicators** - Para indicadores de estado

**Patrón de implementación:**
```css
/* Modo claro */
bg-{color}-100 text-{color}-800

/* Modo oscuro - Pasteles */
bg-{color}-900/30 text-{color}-200 border border-{color}-700/50
```

## Personalización

Para cambiar los colores del sistema, modifica las variables CSS en `src/styles/globals.css`:

```css
:root {
  /* Cambiar el color primario */
  --color-primary-500: 59 130 246;  /* Azul actual */
  /* --color-primary-500: 34 197 94;  Verde */
  /* --color-primary-500: 168 85 247; Púrpura */
}
```

## Mejores Prácticas

### ✅ Recomendado
- Usar colores semánticos (`bg-card`, `text-foreground`)
- Usar colores de estado para feedback (`success`, `error`, `warning`)
- Mantener consistencia en la jerarquía de colores
- Usar `bg-primary-600` para botones y `bg-primary-700` para hover
- **Usar colores pasteles en modo oscuro para mejor legibilidad**

### ❌ Evitar
- Usar colores hardcodeados (`bg-blue-500`)
- Mezclar sistemas de colores
- Usar demasiados colores primarios diferentes
- Ignorar los estados hover/active
- **Usar colores muy intensos en modo oscuro**

## Accesibilidad

- Todos los colores cumplen con WCAG 2.1 AA para contraste
- Los colores de estado son distinguibles para personas con daltonismo
- Los estados de foco son claramente visibles
- El modo oscuro mantiene el mismo nivel de accesibilidad
- **Los colores pasteles mejoran la legibilidad en modo oscuro**

## Migración desde el Sistema Anterior

1. Reemplaza `bg-blue-*` con `bg-primary-*`
2. Reemplaza `bg-gray-*` con colores semánticos apropiados
3. Usa `bg-card` en lugar de `bg-white/bg-gray-800`
4. Usa `text-foreground` en lugar de `text-black/text-white`
5. Remueve lógica condicional de tema en componentes
6. **Implementa colores pasteles para componentes en modo oscuro** 