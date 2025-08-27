# PageHeader Component

## Descripción

El componente `PageHeader` proporciona una estructura consistente y reutilizable para los títulos de página. Está diseñado para ser sutil y elegante, con títulos en semi-bold y colores grises medios (gray-600) que proporcionan buena legibilidad y una experiencia de usuario refinada.

## Características

- ✅ **Diseño sutil**: Títulos en semi-bold con colores grises medios (gray-600)
- ✅ **Iconos opcionales**: Soporte para iconos con colores temáticos (opcional)
- ✅ **Acciones flexibles**: Botones principales y secundarios
- ✅ **Colores temáticos**: 8 variantes de color para diferentes contextos
- ✅ **Alineación configurable**: Izquierda, centro y derecha
- ✅ **Responsive**: Adaptable a diferentes tamaños de pantalla
- ✅ **Accesible**: Estructura semántica correcta

## Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `title` | `string` | ✅ | - | Título principal de la página |
| `subtitle` | `string` | ❌ | - | Subtítulo descriptivo |
| `primaryAction` | `ActionConfig` | ❌ | - | Acción principal (botón) |
| `secondaryActions` | `ActionConfig[]` | ❌ | - | Acciones secundarias |
| `icon` | `ReactNode` | ❌ | - | Icono opcional para el header (no se usa en la implementación actual) |
| `disabled` | `boolean` | ❌ | `false` | Estado deshabilitado del botón |
| `color` | `ColorVariant` | ❌ | `'gray'` | Color del icono y fondo |
| `className` | `string` | ❌ | - | Clases CSS adicionales |
| `alignment` | `'left' \| 'center' \| 'right'` | ❌ | `'left'` | Alineación del contenido |
| `variant` | `'default' \| 'compact' \| 'small' \| 'title-only'` | ❌ | `'default'` | Variante del header - 'default' incluye subtítulo, 'compact' solo título, 'small' versión compacta para modales, 'title-only' solo título para modales |
| `chip` | `{ label: string, variant?: string, size?: string }` | ❌ | - | Chip opcional para mostrar al lado del título |
| `onClose` | `() => void` | ❌ | - | Función para cerrar el modal/side panel |

### ActionConfig

```typescript
interface ActionConfig {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}
```

### ColorVariant

```typescript
type ColorVariant = 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'red' | 'indigo' | 'gray';
```

## Uso Básico

```tsx
import { PageHeader } from '../components/ui';

function MiPagina() {
  return (
    <PageHeader
      title="Investigaciones"
      subtitle="Gestiona y organiza todas las investigaciones"
    />
  );
}
```

## Uso con Icono y Color

```tsx
import { PageHeader } from '../components/ui';
import { InvestigacionesIcon } from '../components/icons';

function MiPagina() {
  return (
    <PageHeader
      title="Investigaciones"
      subtitle="Gestiona y organiza todas las investigaciones"
      icon={<InvestigacionesIcon className="w-8 h-8" />}
      color="blue"
    />
  );
}
```

## Uso con Acciones

```tsx
import { PageHeader } from '../components/ui';
import { InvestigacionesIcon, PlusIcon } from '../components/icons';

function MiPagina() {
  const handleCrear = () => {
    console.log('Crear nueva investigación');
  };

  const handleExportar = () => {
    console.log('Exportar datos');
  };

  return (
    <PageHeader
      title="Investigaciones"
      subtitle="Gestiona y organiza todas las investigaciones"
      icon={<InvestigacionesIcon className="w-8 h-8" />}
      color="blue"
      primaryAction={{
        label: "Nueva Investigación",
        onClick: handleCrear,
        variant: "primary",
        icon: <PlusIcon className="w-4 h-4" />
      }}
      secondaryActions={[
        {
          label: "Exportar",
          onClick: handleExportar,
          variant: "secondary"
        }
      ]}
    />
  );
}
```

## Variantes de Color

### Esquema de Colores por Sección

| Sección | Color | Uso |
|---------|-------|-----|
| Investigaciones | `blue` | Gestión de estudios y proyectos |
| Participantes | `purple` | Administración de usuarios |
| Empresas | `green` | Gestión de organizaciones |
| Sesiones | `orange` | Organización de eventos |
| Reclutamiento | `teal` | Procesos de selección |
| Métricas | `red` | Análisis y reportes |
| Conocimiento | `indigo` | Gestión de información |
| General | `gray` | Casos genéricos |

### Ejemplo de Colores

```tsx
// Investigaciones
<PageHeader title="Investigaciones" color="blue" />

// Participantes  
<PageHeader title="Participantes" color="purple" />

// Empresas
<PageHeader title="Empresas" color="green" />

// Sesiones
<PageHeader title="Sesiones" color="orange" />
```

## Variantes

### Default (con subtítulo)
```tsx
<PageHeader
  title="Investigaciones"
  subtitle="Gestiona y organiza todas las investigaciones"
  variant="default"
/>
```

### Compact (solo título)
```tsx
<PageHeader
  title="Ver Investigación"
  variant="compact"
/>

// Con chip al lado del título
<PageHeader
  title="Ver Investigación"
  variant="compact"
  chip={{
    label: "En Progreso",
    variant: "info",
    size: "sm"
  }}
/>
```

### Small (para modales y side panels)
```tsx
<PageHeader
  title="Crear Empresa"
  subtitle="Completa la información para crear una nueva empresa"
  variant="small"
  color="green"
/>
```

// Con chip
```tsx
<PageHeader
  title="Editar Participante"
  subtitle="Modifica la información del participante"
  variant="small"
  color="purple"
  chip={{
    label: "Externo",
    variant: "secondary",
    size: "sm"
  }}
/>
```

### Title Only (solo título para modales)
```tsx
<PageHeader
  title="Crear Empresa"
  variant="title-only"
  color="green"
/>
```

// Con chip
```tsx
<PageHeader
  title="Editar Participante"
  variant="title-only"
  color="purple"
  chip={{
    label: "Externo",
    variant: "secondary",
    size: "sm"
  }}
/>
```

// Con botón de cerrar
```tsx
<PageHeader
  title="Crear Empresa"
  variant="title-only"
  color="green"
  onClose={() => setModalOpen(false)}
/>
```

## Alineaciones

### Izquierda (Default)
```tsx
<PageHeader
  title="Investigaciones"
  alignment="left"
/>
```

### Centro
```tsx
<PageHeader
  title="Investigaciones"
  alignment="center"
/>
```

### Derecha
```tsx
<PageHeader
  title="Investigaciones"
  alignment="right"
/>
```

## Estructura HTML

El componente genera la siguiente estructura HTML:

```html
<div class="mb-8">
  <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <!-- Contenido principal -->
    <div class="flex items-center gap-4">
      <!-- Icono (opcional) -->
      <div class="p-3 rounded-lg bg-[color]-50 dark:bg-[color]-900/20">
        <div class="w-8 h-8 text-[color]-600">
          <!-- Icono -->
        </div>
      </div>
      
      <!-- Texto -->
      <div>
        <h2 class="text-gray-600 dark:text-gray-300 font-semibold">
          <!-- Título -->
        </h2>
        <p class="text-gray-500 dark:text-gray-400">
          <!-- Subtítulo -->
        </p>
      </div>
    </div>

    <!-- Acciones (opcional) -->
    <div class="flex items-center gap-2">
      <!-- Botones -->
    </div>
  </div>
</div>
```

## Consideraciones de Accesibilidad

- ✅ Uso de elementos semánticos (`h2` para el título)
- ✅ Contraste de colores adecuado
- ✅ Estructura de navegación clara
- ✅ Soporte para lectores de pantalla
- ✅ Estados de foco visibles

## Consideraciones de Rendimiento

- ✅ Componente ligero sin dependencias pesadas
- ✅ Re-renderizado optimizado con React.memo
- ✅ Clases CSS optimizadas con Tailwind
- ✅ Lazy loading de iconos opcional

## Migración desde Headers Existentes

### Antes (Header manual)
```tsx
<div className="mb-8">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
    <div>
      <Typography variant="h2" color="title" weight="bold">
        Investigaciones
      </Typography>
      <Typography variant="subtitle1" color="secondary">
        Gestiona y organiza todas las investigaciones
      </Typography>
    </div>
    <Button variant="primary" size="md" onClick={handleCrear}>
      Nueva Investigación
    </Button>
  </div>
</div>
```

### Después (PageHeader)
```tsx
// Variante por defecto (con subtítulo)
<PageHeader
  title="Investigaciones"
  subtitle="Gestiona y organiza todas las investigaciones"
  color="blue"
  primaryAction={{
    label: "Nueva Investigación",
    onClick: handleCrear,
    variant: "primary"
  }}
/>

// Variante compacta (solo título)
<PageHeader
  title="Ver Investigación"
  variant="compact"
  color="blue"
/>

// Variante compacta con subtítulo (páginas de creación)
<PageHeader
  title="Crear nueva investigación"
  subtitle="Completa la información para crear una nueva investigación"
  variant="compact"
  color="blue"
/>
```

## Testing

### Casos de Prueba Recomendados

1. **Renderizado básico**
   - Verificar que el título se muestre correctamente
   - Verificar que el subtítulo sea opcional

2. **Iconos y colores**
   - Verificar que los iconos se muestren con el color correcto
   - Verificar que los colores de fondo sean apropiados

3. **Acciones**
   - Verificar que las acciones principales funcionen
   - Verificar que las acciones secundarias se rendericen
   - Verificar que los onClick se ejecuten

4. **Alineación**
   - Verificar que las alineaciones funcionen en diferentes tamaños
   - Verificar que sea responsive

5. **Accesibilidad**
   - Verificar que la estructura semántica sea correcta
   - Verificar que los contrastes sean adecuados

## Changelog

### v1.0.0
- ✅ Componente inicial con funcionalidad básica
- ✅ Soporte para iconos y colores temáticos
- ✅ Acciones principales y secundarias
- ✅ Alineaciones configurables
- ✅ Documentación completa
- ✅ Integración con sistema de diseño
