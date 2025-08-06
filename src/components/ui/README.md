# Componentes UI - Sistema de Diseño

## Descripción

Este directorio contiene todos los componentes reutilizables del sistema de diseño. Todos los componentes siguen las mejores prácticas de accesibilidad, diseño responsivo y consistencia visual.

## Componentes Disponibles

### 🎨 Componentes de Color y Estado

#### Chip
Componente para etiquetas y badges con colores semánticos.

```tsx
import { Chip } from '../components/ui';

// Uso básico
<Chip variant="success" size="sm">
  Completado
</Chip>

// Con icono
<Chip variant="danger" size="sm" icon={<AlertIcon />}>
  Alerta Alta
</Chip>
```

**Variantes disponibles:**
- `default` - Gris neutro
- `primary` - Azul principal
- `success` - Verde de éxito
- `warning` - Ámbar de advertencia
- `danger` - Rojo de error
- `info` - Cyan informativo
- `secondary` - Púrpura secundario

**Tamaños:**
- `sm` - Pequeño (px-2.5 py-1 text-xs)
- `md` - Mediano (px-3 py-1.5 text-sm) - Por defecto
- `lg` - Grande (px-4 py-2 text-base)

#### Badge
Componente para indicadores de estado simples.

```tsx
import { Badge } from '../components/ui';

<Badge variant="success">Activo</Badge>
<Badge variant="warning" size="sm">Pendiente</Badge>
```

### 🎨 Colores Pasteles en Modo Oscuro

Los componentes `Chip` y `Badge` implementan colores pasteles automáticamente en modo oscuro para mejor legibilidad:

#### Modo Claro
```css
bg-{color}-100 text-{color}-800
```

#### Modo Oscuro (Pasteles)
```css
bg-{color}-900/30 text-{color}-200 border border-{color}-700/50
```

**Colores implementados:**
- **Success**: `bg-green-900/30 text-green-200`
- **Danger**: `bg-red-900/30 text-red-200`
- **Warning**: `bg-amber-900/30 text-amber-200`
- **Info**: `bg-cyan-900/30 text-cyan-200`
- **Primary**: `bg-blue-900/30 text-blue-200`
- **Secondary**: `bg-purple-900/30 text-purple-200`

### 📝 Guía de Implementación

#### Para Nuevos Componentes

1. **Usar colores semánticos:**
```tsx
// ✅ Correcto
<div className="bg-card text-foreground">
<div className="bg-muted text-muted-foreground">

// ❌ Incorrecto
<div className="bg-white text-black">
<div className="bg-gray-100 text-gray-800">
```

2. **Implementar colores pasteles para modo oscuro:**
```tsx
// Para componentes de estado
const variantClasses = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 dark:border dark:border-green-700/50',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 dark:border dark:border-red-700/50',
  // ... otros colores
};
```

3. **Usar el patrón consistente:**
```tsx
// Estructura recomendada
const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200';
const sizeClasses = { sm: 'px-2.5 py-1 text-xs', md: 'px-3 py-1.5 text-sm', lg: 'px-4 py-2 text-base' };
const variantClasses = { /* colores semánticos */ };
```

#### Para Componentes Existentes

Si necesitas actualizar un componente existente para usar colores pasteles:

1. **Identificar el componente**
2. **Reemplazar colores hardcodeados** con el patrón de colores pasteles
3. **Mantener consistencia** con Chip y Badge
4. **Probar en ambos modos** (claro y oscuro)

### 🔧 Componentes de Navegación

#### Layout
Componente principal de layout con sidebar y navegación.

```tsx
import { Layout } from '../components/ui';

<Layout rol={rolSeleccionado}>
  {/* Contenido de la página */}
</Layout>
```

#### Sidebar
Barra lateral de navegación.

```tsx
import { Sidebar } from '../components/ui';

<Sidebar rol={rolSeleccionado} />
```

### 📊 Componentes de Datos

#### DataTable
Tabla de datos con funcionalidades avanzadas.

```tsx
import { DataTable } from '../components/ui';

<DataTable
  data={data}
  columns={columns}
  loading={loading}
  searchable={true}
  filterable={true}
/>
```

#### MetricCard
Tarjeta para mostrar métricas y estadísticas.

```tsx
import { MetricCard } from '../components/ui';

<MetricCard
  title="Usuarios Activos"
  value="1,234"
  change="+12%"
  trend="up"
/>
```

### 🎯 Componentes de Formularios

#### Input
Campo de entrada con soporte para iconos.

```tsx
import { Input } from '../components/ui';

<Input
  placeholder="Buscar..."
  icon={<SearchIcon />}
  iconPosition="left"
/>
```

#### Select
Selector con opciones múltiples.

```tsx
import { Select } from '../components/ui';

<Select
  options={options}
  value={value}
  onChange={handleChange}
  placeholder="Seleccionar..."
/>
```

### 🎨 Componentes de Feedback

#### Toast
Notificaciones temporales.

```tsx
import { Toast } from '../components/ui';

<Toast
  type="success"
  title="Operación exitosa"
  message="Los datos se han guardado correctamente"
/>
```

#### ConfirmModal
Modal de confirmación.

```tsx
import { ConfirmModal } from '../components/ui';

<ConfirmModal
  isOpen={showModal}
  title="Confirmar eliminación"
  message="¿Estás seguro de que quieres eliminar este elemento?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

## Mejores Prácticas

### ✅ Recomendado
- Usar colores semánticos del sistema
- Implementar colores pasteles para modo oscuro
- Mantener consistencia en espaciado y tipografía
- Usar iconos del sistema de iconos
- Implementar estados hover y focus
- Seguir el patrón de props establecido

### ❌ Evitar
- Usar colores hardcodeados
- Crear variantes innecesarias
- Ignorar la accesibilidad
- Mezclar sistemas de diseño
- Usar colores muy intensos en modo oscuro

## Accesibilidad

Todos los componentes incluyen:
- Soporte para lectores de pantalla
- Navegación por teclado
- Estados de foco visibles
- Contraste adecuado en ambos modos
- Textos alternativos para iconos

## Testing

Para probar componentes:

1. **Modo claro y oscuro**
2. **Diferentes tamaños de pantalla**
3. **Navegación por teclado**
4. **Estados hover y focus**
5. **Contenido dinámico**

## Contribución

Al agregar nuevos componentes:

1. Seguir el patrón establecido
2. Implementar colores pasteles si es necesario
3. Documentar props y ejemplos
4. Probar en ambos modos
5. Verificar accesibilidad 