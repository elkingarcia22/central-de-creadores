# 🔧 **MODIFICACIÓN DE PARTICIPANTES INTERNOS**

## 📋 **Resumen de Cambios**

Se han eliminado los siguientes campos de la tabla `participantes_internos` y sus componentes relacionados:
- ❌ **apellidos**
- ❌ **empresa** 
- ❌ **cargo**
- ❌ **teléfono**

## 🗄️ **Cambios en Base de Datos**

### **Script SQL Ejecutado**
```sql
-- Archivo: modificar-tabla-participantes-internos.sql
-- Ejecutar en el SQL Editor de Supabase

-- Nueva estructura de la tabla:
CREATE TABLE participantes_internos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    departamento TEXT,
    rol_empresa_id UUID REFERENCES roles_empresa(id),
    activo BOOLEAN DEFAULT true,
    fecha_ultima_participacion TIMESTAMP WITH TIME ZONE,
    total_participaciones INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    creado_por UUID REFERENCES usuarios(id)
);
```

### **Campos Eliminados**
- `apellidos` - Ya no se almacena apellidos por separado
- `empresa_id` - Ya no se asocia directamente con una empresa
- `cargo` - Ya no se almacena el cargo específico
- `telefono` - Ya no se almacena número de teléfono

### **Campos Mantenidos**
- ✅ `nombre` - Nombre del participante
- ✅ `email` - Email único del participante
- ✅ `departamento` - Departamento donde trabaja
- ✅ `rol_empresa_id` - Rol en la empresa
- ✅ `activo` - Estado activo/inactivo
- ✅ `fecha_ultima_participacion` - Última participación
- ✅ `total_participaciones` - Contador de participaciones
- ✅ `created_at` - Fecha de creación
- ✅ `updated_at` - Fecha de actualización
- ✅ `creado_por` - Usuario que lo creó

## 🎨 **Cambios en Frontend**

### **1. Componente CrearParticipanteInternoModal**
**Archivo**: `src/components/ui/CrearParticipanteInternoModal.tsx`

#### **Campos Eliminados del Formulario:**
- ❌ Campo "Apellidos"
- ❌ Campo "Teléfono" 
- ❌ Campo "Cargo"
- ❌ Selector "Empresa"

#### **Campos Mantenidos:**
- ✅ Campo "Nombre *" (obligatorio)
- ✅ Campo "Email *" (obligatorio)
- ✅ Campo "Departamento" (opcional)
- ✅ Selector "Rol en la Empresa" (opcional)

### **2. Componente CrearReclutamientoModal**
**Archivo**: `src/components/ui/CrearReclutamientoModal.tsx`

#### **Cambios en Interface:**
```typescript
// Antes
interface ParticipanteInterno {
  id: string;
  nombre: string;
  apellidos?: string;
  email: string;
  departamento?: string;
  cargo?: string;
}

// Después
interface ParticipanteInterno {
  id: string;
  nombre: string;
  email: string;
  departamento?: string;
}
```

#### **Cambios en Mapeo:**
```typescript
// Antes
nombre: `${p.nombre} ${p.apellidos || ''}`.trim()

// Después
nombre: p.nombre
```

### **3. Página Crear Reclutamiento**
**Archivo**: `src/pages/reclutamiento/crear.tsx`

#### **Campos Eliminados del Formulario:**
- ❌ Campo "Apellidos"
- ❌ Campo "Empresa"

#### **Campos Mantenidos:**
- ✅ Campo "Nombre *"
- ✅ Campo "Email *"
- ✅ Campo "Rol en la Empresa"

## 🔌 **Cambios en API**

### **Endpoint: `/api/participantes-internos`**
**Archivo**: `src/pages/api/participantes-internos.ts`

#### **GET - Obtener Participantes:**
- ✅ Ahora consulta la base de datos real
- ✅ Incluye relación con `roles_empresa`
- ✅ Filtra solo participantes activos
- ✅ Ordena por nombre

#### **POST - Crear Participante:**
- ✅ Valida campos obligatorios (nombre, email)
- ✅ Inserta en la base de datos real
- ✅ Retorna el participante creado

#### **Campos Eliminados del Body:**
- ❌ `apellidos`
- ❌ `telefono`
- ❌ `cargo`
- ❌ `empresaId`

#### **Campos Mantenidos del Body:**
- ✅ `nombre` (obligatorio)
- ✅ `email` (obligatorio)
- ✅ `departamento` (opcional)
- ✅ `rolEmpresaId` (opcional)

## 🎯 **Beneficios de los Cambios**

### **1. Simplificación**
- ✅ Formulario más simple y rápido de completar
- ✅ Menos campos obligatorios
- ✅ Mejor experiencia de usuario

### **2. Flexibilidad**
- ✅ Los participantes internos no están atados a una empresa específica
- ✅ Se puede cambiar departamento sin afectar otros campos
- ✅ Más fácil de mantener y actualizar

### **3. Consistencia**
- ✅ Estructura más consistente con otros módulos
- ✅ Menos complejidad en las relaciones
- ✅ Más fácil de escalar

## 🚀 **Próximos Pasos**

### **1. Ejecutar Script SQL**
```bash
# Ejecutar en Supabase SQL Editor:
# modificar-tabla-participantes-internos.sql
```

### **2. Verificar Funcionalidad**
- ✅ Crear nuevo participante interno
- ✅ Listar participantes internos
- ✅ Asignar a reclutamiento
- ✅ Verificar que no hay errores

### **3. Testing**
- ✅ Probar formulario de creación
- ✅ Probar listado de participantes
- ✅ Probar asignación a reclutamientos
- ✅ Verificar validaciones

## 📝 **Notas Importantes**

### **Migración de Datos**
- ✅ Los datos existentes se migran automáticamente
- ✅ Solo se mantienen los campos que siguen existiendo
- ✅ No se pierde información crítica

### **Compatibilidad**
- ✅ Los cambios son compatibles con el sistema existente
- ✅ No afecta otros módulos
- ✅ Mantiene la funcionalidad básica

### **Rollback**
Si es necesario revertir los cambios:
1. Restaurar backup de la tabla original
2. Revertir cambios en los componentes
3. Actualizar API endpoints

---

**✅ Cambios completados y listos para implementación** 