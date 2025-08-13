# Documentación: Implementación del Rol Agendador

## 📋 Resumen de Cambios

### 🎯 Objetivo
Implementar un nuevo rol "Agendador" que tiene acceso específico a reclutamientos donde es responsable del agendamiento, con permisos de solo lectura en otros módulos.

### 🔧 Cambios Realizados

## 1. Base de Datos (Supabase)

### Tablas Modificadas

#### `roles_plataforma`
- **Acción**: Agregado nuevo rol
- **UUID**: `7e329b4c-3716-4781-919e-54106b51ca99`
- **Nombre**: "Agendador"
- **Descripción**: Rol especializado en gestión de agendamientos

```sql
-- Rol creado
INSERT INTO roles_plataforma (id, nombre)
VALUES (
  gen_random_uuid(),
  'Agendador'
);
```

#### `reclutamientos`
- **Acción**: Agregado nuevo campo
- **Campo**: `responsable_agendamiento`
- **Tipo**: UUID REFERENCES auth.users(id)
- **Índice**: Creado para optimizar consultas

```sql
-- Campo agregado
ALTER TABLE reclutamientos 
ADD COLUMN responsable_agendamiento UUID REFERENCES auth.users(id);

-- Índice creado
CREATE INDEX IF NOT EXISTS idx_reclutamientos_responsable_agendamiento 
ON reclutamientos(responsable_agendamiento);
```

#### `user_roles`
- **Acción**: Asignación de rol a usuario
- **Usuario**: Elkin Garcia (e1d4eb8b-83ae-4acc-9d31-6cedc776b64d)
- **Rol**: Agendador (7e329b4c-3716-4781-919e-54106b51ca99)

```sql
-- Asignación realizada
INSERT INTO user_roles (user_id, role, created_at, updated_at)
VALUES (
  'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d',
  '7e329b4c-3716-4781-919e-54106b51ca99',
  NOW(),
  NOW()
);
```

## 2. Código Frontend

### Archivos Modificados

#### `src/utils/permisosUtils.ts`
- **Configuración de permisos**: Agregado rol agendador
- **Filtros específicos**: Lógica para filtrar por `responsable_agendamiento`
- **Funciones actualizadas**: `construirFiltroReclutamientos`, `elementoPerteneceAUsuario`

#### `src/components/ui/Layout.tsx`
- **Menú de navegación**: Agregado menú específico para agendador
- **Módulos accesibles**: Reclutamiento, Participantes, Empresas, Conocimiento

#### `src/components/ui/RolSelector.tsx`
- **Abreviación**: "Agend" para rol agendador
- **Módulo principal**: `/reclutamiento`

#### `src/components/SelectorRolModal.tsx`
- **Redirección**: Agendador → `/reclutamiento`
- **Icono**: Usa icono de reclutador temporalmente

#### `src/api/roles.ts`
- **ROLES_DEFAULT**: Agregado UUID real del rol agendador
- **UUID**: `7e329b4c-3716-4781-919e-54106b51ca99`

#### `src/pages/configuraciones/gestion-usuarios.tsx`
- **rolesMap**: Agregado mapeo UUID → "Agendador"

### APIs Modificadas

#### `src/pages/api/reclutamientos-filtrados.ts`
- **Parámetro**: Agregado `rol` en query
- **Lógica**: Filtro específico para agendador por `responsable_agendamiento`

#### `src/pages/api/metricas-reclutamientos.ts`
- **Parámetro**: Agregado `rol` en query
- **Lógica**: Filtro específico para agendador

## 3. Permisos del Rol Agendador

### Módulos y Permisos

| Módulo | Permisos | Filtro de Asignación |
|--------|----------|---------------------|
| **Investigaciones** | Solo ver | ❌ No aplica |
| **Reclutamientos** | Ver, Editar | ✅ Solo donde es `responsable_agendamiento` |
| **Participantes** | Solo ver | ❌ No aplica |
| **Empresas** | Solo ver | ❌ No aplica |
| **Sesiones** | Solo ver | ❌ No aplica |
| **Métricas** | Solo ver | ✅ Filtrado por asignación |
| **Conocimiento** | Solo ver | ❌ No aplica |

### Lógica de Filtrado

```typescript
// Para el rol agendador
if (rol === 'agendador') {
  return {
    responsable_agendamiento: { eq: usuarioId }
  };
}
```

## 4. Scripts SQL Creados

### Archivos Generados
1. `implementacion-agendador-correcta.sql` - Implementación completa
2. `obtener-uuid-agendador.sql` - Obtener UUID del rol
3. `asignar-rol-agendador-correcto.sql` - Asignar roles y reclutamientos
4. `verificar-datos-agendador.sql` - Verificar implementación

### Comandos Ejecutados
```sql
-- 1. Crear rol
INSERT INTO roles_plataforma (id, nombre) VALUES (gen_random_uuid(), 'Agendador');

-- 2. Agregar campo
ALTER TABLE reclutamientos ADD COLUMN responsable_agendamiento UUID REFERENCES auth.users(id);

-- 3. Crear índice
CREATE INDEX IF NOT EXISTS idx_reclutamientos_responsable_agendamiento ON reclutamientos(responsable_agendamiento);

-- 4. Asignar rol
INSERT INTO user_roles (user_id, role, created_at, updated_at) VALUES ('e1d4eb8b-83ae-4acc-9d31-6cedc776b64d', '7e329b4c-3716-4781-919e-54106b51ca99', NOW(), NOW());
```

## 5. Estado Actual

### ✅ Completado
- [x] Rol agendador creado en base de datos
- [x] Campo `responsable_agendamiento` agregado
- [x] Código frontend actualizado
- [x] Rol asignado a Elkin Garcia
- [x] APIs actualizadas para filtrado

### 🔄 Pendiente
- [ ] Asignar reclutamientos a agendadores
- [ ] Probar funcionalidad completa
- [ ] Verificar permisos en todos los módulos

## 6. Próximos Pasos

### Para Probar
1. Iniciar sesión como Elkin Garcia
2. Cambiar rol a "Agendador"
3. Verificar acceso solo a reclutamientos asignados
4. Probar permisos de solo lectura en otros módulos

### Para Asignar Reclutamientos
```sql
-- Asignar reclutamientos específicos a Elkin como agendador
UPDATE reclutamientos 
SET responsable_agendamiento = 'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d'
WHERE id IN ('uuid1', 'uuid2', 'uuid3');
```

## 7. Notas Técnicas

### UUIDs Importantes
- **Rol Agendador**: `7e329b4c-3716-4781-919e-54106b51ca99`
- **Elkin Garcia**: `e1d4eb8b-83ae-4acc-9d31-6cedc776b64d`

### Estructura de Base de Datos
- `roles_plataforma`: `id`, `nombre`
- `user_roles`: `user_id`, `role`, `created_at`, `updated_at`
- `reclutamientos`: `reclutador_id`, `responsable_agendamiento`, `estado_agendamiento`

### Dependencias
- Supabase Auth
- Row Level Security (RLS) configurado
- Índices para optimización de consultas
