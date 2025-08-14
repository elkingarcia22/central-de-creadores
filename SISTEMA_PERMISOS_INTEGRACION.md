# Sistema de Permisos Granular - Guía de Integración

## 📋 Resumen

El sistema de permisos granular permite controlar el acceso a funcionalidades específicas de la aplicación de manera precisa. Se compone de:

- **Módulos**: Categorías principales (investigaciones, reclutamiento, usuarios, etc.)
- **Funcionalidades**: Acciones específicas dentro de cada módulo (crear, leer, editar, eliminar)
- **Permisos**: Asignación de funcionalidades a roles específicos

## 🏗️ Arquitectura

### Base de Datos
```sql
-- Tablas principales
modulos (id, nombre, descripcion, orden, activo)
funcionalidades (id, modulo_id, nombre, descripcion, orden, activo)
permisos_roles (id, rol_id, funcionalidad_id, permitido)
roles_plataforma (id, nombre, descripcion, activo, es_sistema)
```

### Componentes React
- `usePermisos()` - Hook para verificar permisos
- `PermisoGuard` - Protege páginas completas
- `PermisoRender` - Muestra/oculta elementos específicos

## 🚀 Cómo Usar

### 1. Hook usePermisos

```tsx
import { usePermisos } from '../hooks/usePermisos';

function MiComponente() {
  const { tienePermiso, tienePermisoModulo, loading } = usePermisos();

  if (loading) {
    return <div>Cargando permisos...</div>;
  }

  // Verificar permiso específico
  if (tienePermiso('crear_usuario')) {
    // Mostrar botón de crear usuario
  }

  // Verificar acceso a módulo
  if (tienePermisoModulo('usuarios')) {
    // Mostrar sección de usuarios
  }
}
```

### 2. PermisoGuard - Protección de Páginas

```tsx
import PermisoGuard from '../components/auth/PermisoGuard';

function MiPagina() {
  return (
    <PermisoGuard funcionalidad="leer_usuarios">
      <Layout>
        {/* Contenido de la página */}
      </Layout>
    </PermisoGuard>
  );
}
```

**Opciones disponibles:**
- `funcionalidad="nombre_funcionalidad"` - Requiere permiso específico
- `modulo="nombre_modulo"` - Requiere acceso al módulo
- `redirectTo="/dashboard"` - Redirige si no tiene acceso
- `fallback={<ComponenteAlternativo />}` - Muestra componente alternativo

### 3. PermisoRender - Protección de Elementos

```tsx
import PermisoRender from '../components/auth/PermisoRender';

function MiComponente() {
  return (
    <div>
      <h1>Lista de Usuarios</h1>
      
      <PermisoRender funcionalidad="crear_usuario">
        <Button onClick={crearUsuario}>Crear Usuario</Button>
      </PermisoRender>

      <PermisoRender funcionalidad="editar_usuario">
        <Button onClick={editarUsuario}>Editar</Button>
      </PermisoRender>

      <PermisoRender 
        funcionalidad="eliminar_usuario"
        fallback={<span>No tienes permisos para eliminar</span>}
      >
        <Button onClick={eliminarUsuario}>Eliminar</Button>
      </PermisoRender>
    </div>
  );
}
```

## 📝 Ejemplos Prácticos

### Ejemplo 1: Página de Gestión de Usuarios

```tsx
import PermisoGuard from '../components/auth/PermisoGuard';
import PermisoRender from '../components/auth/PermisoRender';

export default function GestionUsuariosPage() {
  return (
    <PermisoGuard funcionalidad="leer_usuarios">
      <Layout>
        <div className="header">
          <h1>Gestión de Usuarios</h1>
          
          <PermisoRender funcionalidad="crear_usuario">
            <Button onClick={crearUsuario}>Crear Usuario</Button>
          </PermisoRender>
        </div>

        <DataTable
          data={usuarios}
          actions={[
            {
              label: 'Editar',
              render: () => (
                <PermisoRender funcionalidad="editar_usuario">
                  <span>Editar</span>
                </PermisoRender>
              )
            },
            {
              label: 'Eliminar',
              render: () => (
                <PermisoRender funcionalidad="eliminar_usuario">
                  <span>Eliminar</span>
                </PermisoRender>
              )
            }
          ]}
        />
      </Layout>
    </PermisoGuard>
  );
}
```

### Ejemplo 2: Navegación Condicional

```tsx
import { usePermisos } from '../hooks/usePermisos';

function Navigation() {
  const { tienePermisoModulo } = usePermisos();

  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      
      {tienePermisoModulo('investigaciones') && (
        <Link href="/investigaciones">Investigaciones</Link>
      )}
      
      {tienePermisoModulo('reclutamiento') && (
        <Link href="/reclutamiento">Reclutamiento</Link>
      )}
      
      {tienePermisoModulo('usuarios') && (
        <Link href="/configuraciones/gestion-usuarios">Usuarios</Link>
      )}
      
      {tienePermisoModulo('sistema') && (
        <Link href="/configuraciones/roles-permisos">Roles y Permisos</Link>
      )}
    </nav>
  );
}
```

### Ejemplo 3: Formularios Condicionales

```tsx
function UsuarioForm({ usuario }) {
  const { tienePermiso } = usePermisos();

  return (
    <form>
      <Input label="Nombre" name="nombre" />
      <Input label="Email" name="email" />
      
      {tienePermiso('asignar_roles') && (
        <Select label="Roles" name="roles" options={roles} />
      )}
      
      {tienePermiso('gestionar_permisos') && (
        <div>
          <h3>Permisos Específicos</h3>
          {/* Campos de permisos */}
        </div>
      )}
      
      <div className="actions">
        <Button type="submit">Guardar</Button>
        
        {usuario && tienePermiso('eliminar_usuario') && (
          <Button variant="danger" onClick={eliminarUsuario}>
            Eliminar
          </Button>
        )}
      </div>
    </form>
  );
}
```

## 🔧 Configuración

### 1. Funcionalidades Disponibles

```typescript
// Módulo: Usuarios
const FUNCIONALIDADES_USUARIOS = {
  crear_usuario: 'Crear nuevos usuarios',
  leer_usuarios: 'Ver lista de usuarios',
  editar_usuario: 'Modificar usuarios',
  eliminar_usuario: 'Eliminar usuarios',
  asignar_roles: 'Asignar roles a usuarios',
  gestionar_permisos: 'Gestionar permisos de usuarios',
  ver_actividad: 'Ver actividad de usuarios'
};

// Módulo: Investigaciones
const FUNCIONALIDADES_INVESTIGACIONES = {
  crear: 'Crear nuevas investigaciones',
  leer: 'Ver investigaciones existentes',
  editar: 'Modificar investigaciones',
  eliminar: 'Eliminar investigaciones',
  asignar_responsable: 'Asignar responsable de investigación',
  gestionar_productos: 'Gestionar productos asociados',
  gestionar_periodos: 'Gestionar períodos de investigación'
};

// Módulo: Reclutamiento
const FUNCIONALIDADES_RECLUTAMIENTO = {
  crear_reclutamiento: 'Crear nuevos reclutamientos',
  leer_reclutamiento: 'Ver reclutamientos existentes',
  editar_reclutamiento: 'Modificar reclutamientos',
  eliminar_reclutamiento: 'Eliminar reclutamientos',
  agregar_participantes: 'Agregar participantes a reclutamientos',
  asignar_agendamiento: 'Asignar agendamientos',
  gestionar_estados: 'Gestionar estados de participantes',
  ver_informacion_investigacion: 'Ver información de investigación asociada',
  ver_libretos: 'Ver libretos de investigación'
};
```

### 2. Roles del Sistema

```typescript
const ROLES_SISTEMA = {
  ADMINISTRADOR: {
    nombre: 'Administrador',
    descripcion: 'Acceso completo a todas las funcionalidades',
    permisos: ['*'] // Todos los permisos
  },
  INVESTIGADOR: {
    nombre: 'Investigador',
    descripcion: 'Gestión de investigaciones y análisis',
    permisos: [
      'leer', 'editar', 'gestionar_productos', 'gestionar_periodos',
      'leer_reclutamiento', 'ver_informacion_investigacion', 'ver_libretos'
    ]
  },
  RECLUTADOR: {
    nombre: 'Reclutador',
    descripcion: 'Gestión de reclutamientos y participantes',
    permisos: [
      'crear_reclutamiento', 'leer_reclutamiento', 'editar_reclutamiento',
      'agregar_participantes', 'asignar_agendamiento', 'gestionar_estados'
    ]
  },
  AGENDADOR: {
    nombre: 'Agendador',
    descripcion: 'Gestión de agendamientos y seguimientos',
    permisos: [
      'leer_reclutamiento', 'asignar_agendamiento', 'gestionar_estados',
      'leer_seguimientos', 'editar_seguimiento'
    ]
  }
};
```

## 🛡️ Seguridad

### 1. Verificación en Frontend
- Los componentes `PermisoGuard` y `PermisoRender` verifican permisos en tiempo real
- Los elementos se ocultan automáticamente si el usuario no tiene permisos
- Estados de carga para evitar parpadeos

### 2. Verificación en Backend
- Todas las APIs verifican permisos antes de ejecutar acciones
- Los permisos se validan contra la base de datos
- Logs de auditoría para acciones sensibles

### 3. Fallbacks de Seguridad
- Si no hay permisos configurados, se deniega el acceso por defecto
- Los administradores tienen acceso completo automáticamente
- Mensajes de error claros para usuarios sin permisos

## 🔄 Migración

### 1. Migración Gradual
```tsx
// Antes
if (rolSeleccionado === 'administrador') {
  return <Button>Crear Usuario</Button>;
}

// Después
<PermisoRender funcionalidad="crear_usuario">
  <Button>Crear Usuario</Button>
</PermisoRender>
```

### 2. Compatibilidad
- El sistema es compatible con el sistema de roles existente
- Los usuarios existentes mantienen sus permisos
- Migración automática de roles básicos a permisos granulares

## 📊 Monitoreo

### 1. Logs de Permisos
```typescript
// Los permisos se registran automáticamente
console.log('🔒 Verificando permiso:', funcionalidad, 'para usuario:', userId);
console.log('✅ Permiso concedido:', funcionalidad);
console.log('❌ Permiso denegado:', funcionalidad);
```

### 2. Métricas
- Tasa de acceso denegado por funcionalidad
- Uso de permisos por rol
- Páginas más accedidas por nivel de permiso

## 🚨 Troubleshooting

### Problema: Permisos no se cargan
```typescript
// Verificar que el usuario esté autenticado
const { user } = useUser();
if (!user?.id) {
  console.log('Usuario no autenticado');
  return;
}

// Verificar que los roles estén asignados
const { permisos, loading, error } = usePermisos();
if (error) {
  console.error('Error cargando permisos:', error);
}
```

### Problema: Elementos no se muestran
```typescript
// Verificar el nombre exacto de la funcionalidad
<PermisoRender funcionalidad="crear_usuario"> // ✅ Correcto
<PermisoRender funcionalidad="crearUsuario">  // ❌ Incorrecto

// Verificar que el permiso esté asignado al rol
// Ir a Configuraciones > Roles y Permisos
```

### Problema: Página no carga
```typescript
// Verificar que el PermisoGuard esté configurado correctamente
<PermisoGuard 
  funcionalidad="leer_usuarios"
  redirectTo="/dashboard"
  fallback={<div>Acceso denegado</div>}
>
  {/* Contenido */}
</PermisoGuard>
```

## 📚 Recursos Adicionales

- [Script SQL de creación](./crear-sistema-permisos-granular.sql)
- [Página de gestión de roles](./src/pages/configuraciones/roles-permisos.tsx)
- [Ejemplo de página protegida](./src/pages/configuraciones/usuarios-protegida.tsx)
- [Hook usePermisos](./src/hooks/usePermisos.ts)
- [Componente PermisoGuard](./src/components/auth/PermisoGuard.tsx)
- [Componente PermisoRender](./src/components/auth/PermisoRender.tsx)
