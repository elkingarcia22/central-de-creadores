# 📋 DOCUMENTACIÓN COMPLETA DEL MÓDULO DE EMPRESAS

## 🎯 **Descripción General**

El módulo de empresas es un sistema integral para la gestión de clientes externos y empresas participantes en el sistema de reclutamiento. Permite crear, gestionar y relacionar empresas con usuarios de la plataforma (KAMs), países, industrias, productos y otros parámetros de clasificación.

---

## 🗄️ **Estructura de Base de Datos**

### **Tabla Principal: `empresas`**

```sql
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    pais UUID NOT NULL REFERENCES paises(id),
    industria UUID NOT NULL REFERENCES industrias(id),
    kam_id UUID NOT NULL REFERENCES usuarios(id),
    descripcion TEXT,
    producto_id UUID REFERENCES productos(id),
    estado UUID REFERENCES estado_empresa(id),
    relacion UUID REFERENCES relacion_empresa(id),
    tamaño UUID REFERENCES tamano_empresa(id),
    modalidad UUID REFERENCES modalidades(id)
);
```

#### **Campos de la Tabla `empresas`:**
- **`id`**: Identificador único (UUID)
- **`nombre`**: Nombre de la empresa (obligatorio)
- **`pais`**: País de la empresa (FK a `paises.id`)
- **`industria`**: Industria de la empresa (FK a `industrias.id`)
- **`kam_id`**: Key Account Manager asignado (FK a `usuarios.id`)
- **`descripcion`**: Descripción opcional de la empresa
- **`producto_id`**: Producto asociado (FK a `productos.id`)
- **`estado`**: Estado de la empresa (FK a `estado_empresa.id`)
- **`relacion`**: Tipo de relación (FK a `relacion_empresa.id`)
- **`tamaño`**: Tamaño de la empresa (FK a `tamano_empresa.id`)
- **`modalidad`**: Modalidad de trabajo (FK a `modalidades.id`)

---

## 🔗 **Tablas Relacionadas**

### **1. Tabla `estado_empresa`**
**Propósito**: Define los estados posibles de una empresa.

```sql
CREATE TABLE estado_empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    activo BOOLEAN DEFAULT true
);
```

**Datos Actuales:**
- `activa` (id: `57c79982-e984-4c66-aefa-f12de72aafdc`)
- `inactiva` (id: `b58933e7-bf19-471b-8ab8-0940eddd7cde`)

### **2. Tabla `relacion_empresa`**
**Propósito**: Define los tipos de relación con la empresa.

```sql
CREATE TABLE relacion_empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL
);
```

**Datos Actuales:** (Por confirmar - se usa el primer valor disponible)

### **3. Tabla `tamano_empresa`**
**Propósito**: Define los tamaños de empresa disponibles.

```sql
CREATE TABLE tamano_empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL
);
```

**Datos Actuales:**
- `Enterprise` (id: `8fb1db95-5fa7-4074-89da-ec0e7c43581a`)
- `Mid Market` (id: `5f23cf6b-fb35-4d10-b836-b24baaab89b9`)
- `SMB` (id: `34201b79-9e36-4717-8bbf-d4e572dce4b3`)

### **4. Tabla `modalidades`**
**Propósito**: Define las modalidades de trabajo disponibles.

```sql
CREATE TABLE modalidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL
);
```

**Datos Actuales:**
- `hibrido` (id: `2c569742-edc4-47b8-938f-73a03c2dbcda`)
- `presencial` (id: `0738bd51-2cd7-4446-a8a1-c1cbcb66fc6c`)
- `remoto` (id: `b52b40d9-beff-4471-9983-6141daccaf35`)

### **5. Tabla `paises`**
**Propósito**: Catálogo de países disponibles.

```sql
CREATE TABLE paises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL
);
```

### **6. Tabla `industrias`**
**Propósito**: Catálogo de industrias disponibles.

```sql
CREATE TABLE industrias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL
);
```

### **7. Tabla `productos`**
**Propósito**: Catálogo de productos disponibles.

```sql
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL
);
```

### **8. Tabla `usuarios`**
**Propósito**: Usuarios de la plataforma que pueden ser asignados como KAM.

```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    apellido TEXT,
    correo TEXT NOT NULL,
    foto_url TEXT
);
```

---

## 🔄 **Relaciones y Foreign Keys**

### **Relaciones Principales:**
1. **`empresas.pais`** → `paises.id`
2. **`empresas.industria`** → `industrias.id`
3. **`empresas.kam_id`** → `usuarios.id` ⚠️ **Cambio importante**
4. **`empresas.producto_id`** → `productos.id`
5. **`empresas.estado`** → `estado_empresa.id`
6. **`empresas.relacion`** → `relacion_empresa.id`
7. **`empresas.tamaño`** → `tamano_empresa.id`
8. **`empresas.modalidad`** → `modalidades.id`

### **Cambio Importante Realizado:**
- **Antes**: `kam_id` apuntaba a `kams.id`
- **Ahora**: `kam_id` apunta a `usuarios.id` (usuarios de la plataforma)

```sql
-- Script para cambiar la relación
ALTER TABLE empresas 
DROP CONSTRAINT IF EXISTS empresas_kam_id_fkey;

ALTER TABLE empresas 
ADD CONSTRAINT empresas_kam_id_fkey 
FOREIGN KEY (kam_id) REFERENCES usuarios(id);
```

---

## 📊 **Datos de Ejemplo Configurados**

### **Empresas Creadas:**
1. **FinanceHub International**
   - País: (configurado)
   - Industria: (configurado)
   - KAM: (asignado)
   - Estado: `activa`
   - Relación: (primer valor disponible)
   - Tamaño: `Mid Market`
   - Modalidad: `remoto`

2. **HealthTech Innovations**
   - País: (configurado)
   - Industria: (configurado)
   - KAM: (asignado)
   - Estado: `activa`
   - Relación: (primer valor disponible)
   - Tamaño: `Mid Market`
   - Modalidad: `remoto`

3. **TechCorp Solutions**
   - País: (configurado)
   - Industria: (configurado)
   - KAM: (asignado)
   - Estado: `activa`
   - Relación: (primer valor disponible)
   - Tamaño: `Mid Market`
   - Modalidad: `remoto`

---

## 🎨 **Componentes de Frontend**

### **Modal de Crear Cliente Externo**
**Archivo**: `src/components/ui/CrearParticipanteExternoModal.tsx`

#### **Campos del Formulario:**
1. **Nombre de la Empresa** (`Input`)
2. **País** (`Select` con datos de `paises`)
3. **Industria** (`Select` con datos de `industrias`)
4. **KAM** (`UserSelectorWithAvatar` con datos de `usuarios`)
5. **Descripción** (`Textarea`)
6. **Producto** (`Select` con datos de `productos`)
7. **Rol en la Empresa** (`Select` con datos de `roles_empresa`)
8. **Empresa** (`Select` con datos de `empresas`)
9. **Estado del Participante** (`Select` con datos de `estado_participante`)

#### **Componentes de Diseño Utilizados:**
- `SideModal`: Modal lateral
- `Typography`: Textos y títulos
- `Button`: Botones de acción
- `Input`: Campos de texto
- `Select`: Listas desplegables
- `Textarea`: Campo de descripción
- `UserSelectorWithAvatar`: Selector de usuario con avatar
- `Chip`: Etiquetas removibles

---

## 🔧 **APIs y Endpoints**

### **Endpoints Utilizados:**
1. **`/api/roles-empresa`**: Obtener roles de empresa
2. **`/api/empresas`**: Obtener empresas
3. **`/api/estados-participante`**: Obtener estados de participante
4. **`/api/paises`**: Obtener países
5. **`/api/industrias`**: Obtener industrias
6. **`/api/productos`**: Obtener productos
7. **`/api/usuarios`**: Obtener usuarios (para KAM)

### **Función Principal:**
```typescript
// En src/api/supabase-investigaciones.ts
export const obtenerUsuarios = async (): Promise<Usuario[]> => {
    // Obtiene usuarios para el selector de KAM
}
```

---

## 🎯 **Casos de Uso**

### **1. Crear Cliente Externo**
1. Usuario abre modal "Crear Cliente Externo"
2. Completa formulario con datos de empresa
3. Selecciona KAM de la lista de usuarios
4. Guarda y crea registro en `empresas`

### **2. Asignar KAM a Empresa**
1. Seleccionar empresa existente
2. Asignar usuario de la plataforma como KAM
3. Actualizar campo `kam_id` en `empresas`

### **3. Gestionar Estados de Empresa**
1. Cambiar estado entre "activa" e "inactiva"
2. Actualizar campo `estado` en `empresas`

### **4. Clasificar Empresas**
1. Asignar tamaño (Enterprise, Mid Market, SMB)
2. Asignar modalidad (remoto, presencial, híbrido)
3. Asignar relación (cliente, prospecto, etc.)

---

## ⚠️ **Consideraciones Importantes**

### **1. Cambio de Relación KAM**
- **Antes**: Relación con tabla `kams` (inexistente)
- **Ahora**: Relación con tabla `usuarios` (usuarios de la plataforma)
- **Impacto**: Permite asignar cualquier usuario como KAM

### **2. Estados de Empresa**
- **Valores**: "activa" e "inactiva"
- **Uso**: Controlar si la empresa está activa en el sistema
- **Campo adicional**: `activo` (boolean) en `estado_empresa`

### **3. Datos de Catálogo**
- Todas las tablas de catálogo deben estar pobladas
- Los IDs son UUIDs generados automáticamente
- Los nombres deben ser únicos en cada catálogo

### **4. Validaciones**
- `nombre` es obligatorio en `empresas`
- `pais`, `industria`, `kam_id` son obligatorios
- Los campos de catálogo pueden ser NULL

---

## 🚀 **Scripts de Configuración**

### **Scripts Creados:**
1. **`cambiar-kam-por-usuarios.sql`**: Cambiar FK de kams a usuarios
2. **`poblar-empresas-final.sql`**: Poblar tabla empresas
3. **`actualizar-empresas-estado-final.sql`**: Actualizar estados y relaciones
4. **`diagnostico-campos-vacios-empresas.sql`**: Diagnosticar campos vacíos

### **Orden de Ejecución:**
1. Ejecutar cambio de FK (si no se ha hecho)
2. Poblar tablas de catálogo
3. Poblar tabla empresas
4. Actualizar campos faltantes

---

## 📝 **Notas de Desarrollo**

### **Problemas Resueltos:**
1. **Confusión de tablas**: `estado_empresa` vs otras tablas de evaluación
2. **FK incorrecta**: `kams` → `usuarios`
3. **Campos vacíos**: Estados y relaciones no se llenaban
4. **Datos de catálogo**: Tablas relacionadas sin datos

### **Lecciones Aprendidas:**
1. Siempre verificar datos reales en las tablas
2. No asumir nombres de campos o valores
3. Usar scripts de diagnóstico antes de actualizar
4. Documentar cambios de FK importantes

---

## 🔮 **Próximos Pasos Sugeridos**

### **1. Completar Datos de Catálogo**
- Verificar y poblar `relacion_empresa`
- Completar datos de `paises`, `industrias`, `productos`

### **2. Implementar Validaciones**
- Validar que KAM existe en `usuarios`
- Validar que catálogos tienen datos
- Validar formatos de datos

### **3. Agregar Funcionalidades**
- CRUD completo de empresas
- Gestión de estados
- Reportes de empresas por KAM
- Filtros y búsquedas avanzadas

### **4. Mejorar UI/UX**
- Confirmar que todos los Select usan el diseño correcto
- Agregar validaciones en tiempo real
- Mejorar mensajes de error
- Agregar confirmaciones de acciones

---

## 📞 **Contacto y Soporte**

Para dudas sobre el módulo de empresas:
- Revisar esta documentación
- Verificar scripts de configuración
- Consultar estructura de base de datos
- Revisar componentes de frontend

---

*Documentación creada el: [Fecha actual]*
*Última actualización: [Fecha actual]*
*Versión: 1.0* 