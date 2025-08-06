# Componentes de Navegación - Sistema de Diseño

Este documento describe los componentes de navegación que forman parte del sistema de diseño global de la aplicación.

## Componentes Disponibles

### 1. NavigationItem
Componente base para elementos de navegación individuales.

```tsx
import { NavigationItem } from '../components/ui';

<NavigationItem
  label="Dashboard"
  href="/dashboard"
  icon={<DashboardIcon />}
  isCollapsed={false}
  onClick={() => console.log('clicked')}
/>
```

**Props:**
- `label`: Texto del elemento de navegación
- `href`: URL de destino
- `icon`: Icono del elemento (ReactNode)
- `subMenu`: Array de elementos de submenú (opcional)
- `isCollapsed`: Si el sidebar está colapsado
- `onClick`: Función callback al hacer clic
- `className`: Clases CSS adicionales

### 2. Sidebar
Componente de navegación lateral para desktop.

```tsx
import { Sidebar } from '../components/ui';

<Sidebar
  title="Central de creadores"
  items={menuItems}
  isCollapsed={false}
  onToggleCollapse={() => setCollapsed(!collapsed)}
  onItemClick={() => console.log('item clicked')}
/>
```

**Props:**
- `title`: Título del sidebar
- `items`: Array de elementos de navegación
- `isCollapsed`: Estado de colapso
- `onToggleCollapse`: Función para alternar colapso
- `onItemClick`: Callback al hacer clic en elementos
- `className`: Clases CSS adicionales

### 3. TopNavigation
Componente de navegación superior.

```tsx
import { TopNavigation } from '../components/ui';

<TopNavigation title="Dashboard">
  <UserMenu user={userData} />
</TopNavigation>
```

**Props:**
- `title`: Título de la página actual
- `children`: Elementos adicionales (ej: UserMenu)
- `className`: Clases CSS adicionales

### 4. UserMenu
Componente del menú de usuario con avatar y opciones.

```tsx
import { UserMenu } from '../components/ui';

<UserMenu
  user={{
    name: "Juan Pérez",
    email: "juan@example.com",
    avatar: "/avatar.jpg",
    role: "administrador"
  }}
  onLogout={() => handleLogout()}
  onSettings={() => router.push('/configuraciones')}
/>
```

**Props:**
- `user`: Objeto con información del usuario
- `onLogout`: Función de cierre de sesión
- `onSettings`: Función para ir a configuraciones
- `className`: Clases CSS adicionales

### 5. MobileNavigation
Componente de navegación para dispositivos móviles.

```tsx
import { MobileNavigation } from '../components/ui';

<MobileNavigation
  title="Central de creadores"
  items={menuItems}
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  onItemClick={() => setSidebarOpen(false)}
/>
```

**Props:**
- `title`: Título del menú móvil
- `items`: Array de elementos de navegación
- `isOpen`: Estado de apertura del menú
- `onClose`: Función para cerrar el menú
- `onItemClick`: Callback al hacer clic en elementos
- `className`: Clases CSS adicionales

### 6. Layout
Componente principal que integra toda la navegación.

```tsx
import { Layout } from '../components/ui';

<Layout rol="administrador">
  <div>Contenido de la página</div>
</Layout>
```

**Props:**
- `children`: Contenido de la página
- `rol`: Rol del usuario actual
- `className`: Clases CSS adicionales

## Configuración de Menús por Rol

El sistema incluye configuraciones predefinidas de menús para diferentes roles:

### Administrador
- Dashboard
- Investigaciones
- Reclutamiento
- Sesiones
- Métricas
- Participantes
- Empresas
- Configuraciones (con submenú: Gestión de Usuarios)
- Conocimiento

### Investigador
- Dashboard
- Investigaciones
- Sesiones
- Métricas
- Participantes
- Empresas
- Configuraciones
- Conocimiento

### Reclutador
- Dashboard
- Reclutamiento
- Participantes
- Empresas
- Configuraciones
- Conocimiento

## Características del Sistema

### Modo Oscuro/Claro
Todos los componentes soportan automáticamente el modo oscuro y claro a través del contexto de tema.

### Responsive Design
- **Desktop**: Sidebar colapsable + TopNavigation
- **Móvil**: MobileNavigation con overlay

### Accesibilidad
- Navegación por teclado
- Screen readers
- ARIA labels
- Focus management

### Iconos Centralizados
Todos los iconos se importan desde el sistema centralizado de iconos.

### Estado Persistente
El estado de colapso del sidebar se mantiene durante la sesión.

## Migración desde DashboardLayout

Para migrar desde el `DashboardLayout` existente al nuevo sistema:

```tsx
// Antes
import DashboardLayout from '../components/DashboardLayout';

<DashboardLayout rol="administrador">
  <div>Contenido</div>
</DashboardLayout>

// Después
import { Layout } from '../components/ui';

<Layout rol="administrador">
  <div>Contenido</div>
</Layout>
```

## Personalización

Los componentes pueden personalizarse a través de:

1. **Props**: Configuración específica por instancia
2. **CSS Classes**: Clases adicionales para estilos personalizados
3. **Theme Context**: Configuración global de tema
4. **Icon System**: Reemplazo de iconos por defecto

## Mejores Prácticas

1. **Usar Layout**: Para páginas principales, usar el componente `Layout`
2. **Componentes Individuales**: Para casos específicos, usar componentes individuales
3. **Consistencia**: Mantener consistencia en la navegación entre páginas
4. **Accesibilidad**: Asegurar que la navegación sea accesible
5. **Performance**: Los componentes están optimizados para rendimiento 