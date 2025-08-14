# 🔍 ANÁLISIS DEL SISTEMA ACTUAL DE ROLES Y PERMISOS

## 📊 **ESTADO ACTUAL DEL SISTEMA**

### **Roles Existentes (4 total):**
1. **Administrador** (`bcc17f6a-d751-4c39-a479-412abddde0fa`)
2. **Agendador** (`7e329b4c-3716-4781-919e-54106b51ca99`)
3. **Investigador** (`e1fb53e3-3d1c-4ff5-bdac-9a1285dd99d7`)
4. **Reclutador** (`fcf6ffc7-e8d3-407b-8c72-b4a7e8db6c9c`)

### **Estructura de Base de Datos Actual:**

#### **Tabla `roles_plataforma`:**
```sql
- id: UUID (PK)
- nombre: TEXT
- descripcion: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### **Tabla `user_roles`:**
```sql
- id: UUID (PK)
- user_id: UUID (FK a profiles.id)
- role: UUID (FK a roles_plataforma.id)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### **Ejemplo de Usuario (Elkin Garcia):**
- **Usuario ID**: `e1d4eb8b-83ae-4acc-9d31-6cedc776b64d`
- **Roles asignados**: 4 roles (Administrador, Agendador, Investigador, Reclutador)

---

## 🎯 **PROPUESTA: SISTEMA DE ROLES Y PERMISOS GRANULAR**

### **1. NUEVA ESTRUCTURA DE BASE DE DATOS**

#### **Tabla `modulos` (Nueva):**
```sql
- id: UUID (PK)
- nombre: TEXT (ej: 'investigaciones', 'reclutamiento', 'usuarios', 'sistema')
- descripcion: TEXT
- activo: BOOLEAN
- orden: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### **Tabla `funcionalidades` (Nueva):**
```sql
- id: UUID (PK)
- modulo_id: UUID (FK a modulos.id)
- nombre: TEXT (ej: 'crear', 'leer', 'editar', 'eliminar')
- descripcion: TEXT
- activo: BOOLEAN
- orden: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### **Tabla `permisos_roles` (Nueva):**
```sql
- id: UUID (PK)
- rol_id: UUID (FK a roles_plataforma.id)
- funcionalidad_id: UUID (FK a funcionalidades.id)
- permitido: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- UNIQUE(rol_id, funcionalidad_id)
```

#### **Tabla `roles_plataforma` (Modificada):**
```sql
- id: UUID (PK)
- nombre: TEXT
- descripcion: TEXT
- activo: BOOLEAN
- es_sistema: BOOLEAN (para roles predefinidos)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

---

## 📋 **MÓDULOS Y FUNCIONALIDADES PROPUESTOS**

### **1. MÓDULO: INVESTIGACIONES**
```typescript
const moduloInvestigaciones = {
  nombre: 'investigaciones',
  descripcion: 'Gestión de investigaciones y estudios',
  funcionalidades: [
    { nombre: 'crear', descripcion: 'Crear nuevas investigaciones' },
    { nombre: 'leer', descripcion: 'Ver investigaciones existentes' },
    { nombre: 'editar', descripcion: 'Modificar investigaciones' },
    { nombre: 'eliminar', descripcion: 'Eliminar investigaciones' },
    { nombre: 'asignar_responsable', descripcion: 'Asignar responsable de investigación' },
    { nombre: 'gestionar_productos', descripcion: 'Gestionar productos asociados' },
    { nombre: 'gestionar_periodos', descripcion: 'Gestionar períodos de investigación' }
  ]
}
```

### **2. MÓDULO: RECLUTAMIENTO**
```typescript
const moduloReclutamiento = {
  nombre: 'reclutamiento',
  descripcion: 'Gestión de reclutamientos y participantes',
  funcionalidades: [
    { nombre: 'crear_reclutamiento', descripcion: 'Crear nuevos reclutamientos' },
    { nombre: 'leer_reclutamiento', descripcion: 'Ver reclutamientos existentes' },
    { nombre: 'editar_reclutamiento', descripcion: 'Modificar reclutamientos' },
    { nombre: 'eliminar_reclutamiento', descripcion: 'Eliminar reclutamientos' },
    { nombre: 'agregar_participantes', descripcion: 'Agregar participantes a reclutamientos' },
    { nombre: 'asignar_agendamiento', descripcion: 'Asignar agendamientos' },
    { nombre: 'gestionar_estados', descripcion: 'Gestionar estados de participantes' },
    { nombre: 'ver_informacion_investigacion', descripcion: 'Ver información de investigación asociada' },
    { nombre: 'ver_libretos', descripcion: 'Ver libretos de investigación' }
  ]
}
```

### **3. MÓDULO: USUARIOS**
```typescript
const moduloUsuarios = {
  nombre: 'usuarios',
  descripcion: 'Gestión de usuarios del sistema',
  funcionalidades: [
    { nombre: 'crear_usuario', descripcion: 'Crear nuevos usuarios' },
    { nombre: 'leer_usuarios', descripcion: 'Ver lista de usuarios' },
    { nombre: 'editar_usuario', descripcion: 'Modificar usuarios' },
    { nombre: 'eliminar_usuario', descripcion: 'Eliminar usuarios' },
    { nombre: 'asignar_roles', descripcion: 'Asignar roles a usuarios' },
    { nombre: 'gestionar_permisos', descripcion: 'Gestionar permisos de usuarios' },
    { nombre: 'ver_actividad', descripcion: 'Ver actividad de usuarios' }
  ]
}
```

### **4. MÓDULO: SISTEMA**
```typescript
const moduloSistema = {
  nombre: 'sistema',
  descripcion: 'Configuraciones del sistema',
  funcionalidades: [
    { nombre: 'gestionar_roles', descripcion: 'Crear y gestionar roles' },
    { nombre: 'gestionar_permisos', descripcion: 'Configurar permisos por rol' },
    { nombre: 'ver_logs', descripcion: 'Ver logs del sistema' },
    { nombre: 'configuraciones_generales', descripcion: 'Configuraciones generales' },
    { nombre: 'sistema_diseno', descripcion: 'Acceso al sistema de diseño' }
  ]
}
```

### **5. MÓDULO: LIBRETOS**
```typescript
const moduloLibretos = {
  nombre: 'libretos',
  descripcion: 'Gestión de libretos de investigación',
  funcionalidades: [
    { nombre: 'crear_libretos', descripcion: 'Crear nuevos libretos' },
    { nombre: 'leer_libretos', descripcion: 'Ver libretos existentes' },
    { nombre: 'editar_libretos', descripcion: 'Modificar libretos' },
    { nombre: 'eliminar_libretos', descripcion: 'Eliminar libretos' },
    { nombre: 'asignar_libretos', descripcion: 'Asignar libretos a investigaciones' }
  ]
}
```

### **6. MÓDULO: SEGUIMIENTOS**
```typescript
const moduloSeguimientos = {
  nombre: 'seguimientos',
  descripcion: 'Gestión de seguimientos y métricas',
  funcionalidades: [
    { nombre: 'crear_seguimiento', descripcion: 'Crear nuevos seguimientos' },
    { nombre: 'leer_seguimientos', descripcion: 'Ver seguimientos existentes' },
    { nombre: 'editar_seguimiento', descripcion: 'Modificar seguimientos' },
    { nombre: 'eliminar_seguimiento', descripcion: 'Eliminar seguimientos' },
    { nombre: 'ver_metricas', descripcion: 'Ver métricas y reportes' },
    { nombre: 'exportar_datos', descripcion: 'Exportar datos de seguimientos' }
  ]
}
```

---

## 🔧 **PERFILES DE ROLES PROPUESTOS**

### **1. ADMINISTRADOR (Sistema)**
```typescript
const permisosAdministrador = {
  rol: 'Administrador',
  descripcion: 'Acceso completo a todos los módulos y funcionalidades',
  permisos: {
    investigaciones: ['crear', 'leer', 'editar', 'eliminar', 'asignar_responsable', 'gestionar_productos', 'gestionar_periodos'],
    reclutamiento: ['crear_reclutamiento', 'leer_reclutamiento', 'editar_reclutamiento', 'eliminar_reclutamiento', 'agregar_participantes', 'asignar_agendamiento', 'gestionar_estados', 'ver_informacion_investigacion', 'ver_libretos'],
    usuarios: ['crear_usuario', 'leer_usuarios', 'editar_usuario', 'eliminar_usuario', 'asignar_roles', 'gestionar_permisos', 'ver_actividad'],
    sistema: ['gestionar_roles', 'gestionar_permisos', 'ver_logs', 'configuraciones_generales', 'sistema_diseno'],
    libretos: ['crear_libretos', 'leer_libretos', 'editar_libretos', 'eliminar_libretos', 'asignar_libretos'],
    seguimientos: ['crear_seguimiento', 'leer_seguimientos', 'editar_seguimiento', 'eliminar_seguimiento', 'ver_metricas', 'exportar_datos']
  }
}
```

### **2. INVESTIGADOR**
```typescript
const permisosInvestigador = {
  rol: 'Investigador',
  descripcion: 'Puede gestionar investigaciones y ver reclutamientos asociados',
  permisos: {
    investigaciones: ['crear', 'leer', 'editar', 'asignar_responsable', 'gestionar_productos', 'gestionar_periodos'],
    reclutamiento: ['leer_reclutamiento', 'ver_informacion_investigacion', 'ver_libretos'],
    usuarios: ['leer_usuarios'],
    sistema: [],
    libretos: ['leer_libretos', 'asignar_libretos'],
    seguimientos: ['leer_seguimientos', 'ver_metricas']
  }
}
```

### **3. RECLUTADOR**
```typescript
const permisosReclutador = {
  rol: 'Reclutador',
  descripcion: 'Puede gestionar reclutamientos y participantes',
  permisos: {
    investigaciones: ['leer'],
    reclutamiento: ['crear_reclutamiento', 'leer_reclutamiento', 'editar_reclutamiento', 'agregar_participantes', 'asignar_agendamiento', 'gestionar_estados', 'ver_informacion_investigacion', 'ver_libretos'],
    usuarios: ['leer_usuarios'],
    sistema: [],
    libretos: ['leer_libretos'],
    seguimientos: ['leer_seguimientos']
  }
}
```

### **4. AGENDADOR**
```typescript
const permisosAgendador = {
  rol: 'Agendador',
  descripcion: 'Especializado en gestión de agendamientos',
  permisos: {
    investigaciones: ['leer'],
    reclutamiento: ['leer_reclutamiento', 'asignar_agendamiento', 'gestionar_estados', 'ver_informacion_investigacion'],
    usuarios: ['leer_usuarios'],
    sistema: [],
    libretos: ['leer_libretos'],
    seguimientos: ['leer_seguimientos']
  }
}
```

### **5. ANALISTA (Nuevo)**
```typescript
const permisosAnalista = {
  rol: 'Analista',
  descripcion: 'Puede ver métricas y reportes',
  permisos: {
    investigaciones: ['leer'],
    reclutamiento: ['leer_reclutamiento'],
    usuarios: ['leer_usuarios'],
    sistema: [],
    libretos: ['leer_libretos'],
    seguimientos: ['leer_seguimientos', 'ver_metricas', 'exportar_datos']
  }
}
```

---

## 🎨 **INTERFAZ DE USUARIO PROPUESTA**

### **1. Página Principal: "Roles y Permisos"**
- **Ubicación**: `/configuraciones/roles-permisos`
- **Acceso**: Solo administradores
- **Funcionalidades**:
  - Lista de roles existentes
  - Botón "Crear Nuevo Rol"
  - Botón "Editar Rol" para cada rol
  - Botón "Eliminar Rol" (solo para roles no del sistema)

### **2. Modal: "Crear/Editar Rol"**
- **Campos**:
  - Nombre del rol
  - Descripción
  - Checkbox "Es rol del sistema" (solo para edición)
- **Sección de permisos**:
  - Acordeón por módulos
  - Checkboxes para cada funcionalidad
  - Botón "Seleccionar todo" por módulo
  - Botón "Seleccionar todo" global

### **3. Vista: "Permisos por Rol"**
- **Tabla con columnas**:
  - Módulo
  - Funcionalidad
  - Descripción
  - Estado (Permitido/Denegado)
  - Acciones (Editar)

---

## 🔄 **MIGRACIÓN PROPUESTA**

### **Fase 1: Preparación**
1. Crear nuevas tablas (`modulos`, `funcionalidades`, `permisos_roles`)
2. Insertar datos base de módulos y funcionalidades
3. Crear APIs para gestionar la nueva estructura

### **Fase 2: Migración de Roles Existentes**
1. Mapear roles actuales a nuevos permisos
2. Migrar usuarios existentes
3. Probar funcionalidad

### **Fase 3: Implementación de UI**
1. Crear página de gestión de roles
2. Implementar modales de creación/edición
3. Integrar con sistema de navegación

### **Fase 4: Integración**
1. Actualizar middleware de permisos
2. Integrar con componentes existentes
3. Pruebas completas

---

## 📝 **PRÓXIMOS PASOS**

### **Inmediatos:**
1. **Confirmar estructura** de módulos y funcionalidades
2. **Validar permisos** propuestos para cada rol
3. **Definir prioridades** de implementación

### **Técnicos:**
1. **Crear scripts SQL** para nuevas tablas
2. **Desarrollar APIs** para gestión de permisos
3. **Implementar UI** siguiendo el sistema de diseño

### **Validación:**
1. **Revisar con equipo** los permisos propuestos
2. **Probar casos de uso** reales
3. **Validar seguridad** del sistema

---

## ❓ **PREGUNTAS PARA VALIDACIÓN**

1. **¿Los módulos propuestos cubren todas las funcionalidades actuales?**
2. **¿Los permisos por rol son correctos según el negocio?**
3. **¿Necesitamos agregar más roles específicos?**
4. **¿Hay funcionalidades que no están consideradas?**
5. **¿El nivel de granularidad es apropiado?**

**¿Te parece bien esta propuesta? ¿Quieres que ajuste algo antes de empezar la implementación?**
