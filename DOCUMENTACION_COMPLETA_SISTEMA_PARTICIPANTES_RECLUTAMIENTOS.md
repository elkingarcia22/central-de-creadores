# DOCUMENTACIÓN COMPLETA - SISTEMA DE PARTICIPANTES Y RECLUTAMIENTOS

## 📋 ESTADO ACTUAL DEL SISTEMA (27 de Julio 2025)

### ✅ PROBLEMAS RESUELTOS RECIENTEMENTE

#### 1. **Problema de IDs vs Nombres en Modal "Ver más"**
- **Problema**: El modal mostraba IDs en lugar de nombres para `estado_participante`, `productos_relacionados`, `rol_empresa`, etc.
- **Causa**: La tabla se llamaba `estado_participante_cat` (no `estados_participante`)
- **Solución**: Corregir el nombre de la tabla en `src/pages/api/participantes-reclutamiento.ts`
- **Resultado**: ✅ Todos los campos ahora muestran nombres correctamente

#### 2. **Estructura de Datos Enriquecida**
- **API Mejorada**: `/api/participantes-reclutamiento` ahora incluye:
  - Información completa de empresa (tamaño, país, industria, sector, descripción)
  - Datos de KAM asignado
  - Productos relacionados con nombres (no IDs)
  - Estados de participantes con nombres
  - Comentarios y dolores/necesidades
  - Historial de participaciones

#### 3. **Separación de Participantes Internos vs Externos**
- **Tabla `participantes_internos`**: Para empleados de la empresa
- **Tabla `participantes`**: Para clientes externos
- **Lógica**: El sistema determina automáticamente el tipo basado en `participantes_id` vs `participantes_internos_id`

### 🗄️ ESTRUCTURA DE BASE DE DATOS

#### Tablas Principales:
1. **`reclutamientos`**: Tabla principal que vincula participantes con investigaciones
2. **`participantes`**: Clientes externos
3. **`participantes_internos`**: Empleados internos
4. **`empresas`**: Información de empresas de clientes externos
5. **`departamentos`**: Departamentos para participantes internos
6. **`estado_participante_cat`**: Estados de participantes (Disponible, No disponible, etc.)
7. **`estado_agendamiento_cat`**: Estados de agendamiento (Pendiente, Finalizado, etc.)
8. **`productos`**: Productos relacionados con participantes
9. **`roles_empresa`**: Roles en empresas para participantes externos

#### Campos Críticos:
- **`reclutamientos.participantes_id`**: ID del participante externo (NULL para internos)
- **`reclutamientos.participantes_internos_id`**: ID del participante interno (NULL para externos)
- **`participantes.estado_participante`**: ID que referencia `estado_participante_cat`
- **`participantes.productos_relacionados`**: Array de IDs que referencia `productos`

### 🔧 ARCHIVOS CLAVE MODIFICADOS

#### 1. **`src/pages/api/participantes-reclutamiento.ts`** (PRINCIPAL)
```typescript
// Funcionalidades implementadas:
- ✅ Mapeo de IDs a nombres para todos los campos
- ✅ Consulta dinámica de estados_participante_cat
- ✅ Consulta dinámica de productos
- ✅ Consulta dinámica de empresas con KAM
- ✅ Separación lógica interno/externo
- ✅ Enriquecimiento de datos con información completa
```

#### 2. **`src/pages/reclutamiento/ver/[id].tsx`** (FRONTEND)
```typescript
// Funcionalidades implementadas:
- ✅ Badge de tipo de cliente (Interno/Externo)
- ✅ Renderizado condicional por tipo
- ✅ Modal "Ver más" con información completa
- ✅ Manejo de objetos vs strings para departamentos
- ✅ Información de empresa solo para externos
```

#### 3. **`src/api/supabase-server.ts`** (NUEVO)
```typescript
// Cliente Supabase para servidor (sin RLS)
// Usado en todas las APIs para bypass de RLS
```

### 🎯 FUNCIONALIDADES ACTUALES

#### Modal "Ver más" - Información Mostrada:
- ✅ **Nombre del participante**
- ✅ **Tipo de cliente** (Badge)
- ✅ **Rol en la empresa** (nombre, no ID)
- ✅ **Estado del participante** (nombre, no ID)
- ✅ **Comentarios**
- ✅ **Dolores y necesidades**
- ✅ **Cantidad de participaciones**
- ✅ **Productos relacionados** (nombres, no IDs)
- ✅ **Responsable del agendamiento** (nombre, no ID)
- ✅ **Estado del agendamiento** (nombre, no ID)
- ✅ **Información de empresa** (solo externos)
- ✅ **Departamento** (solo internos)

### 🚨 PUNTOS CRÍTICOS A CONSERVAR

#### 1. **Separación de Tablas**
- **NO MEZCLAR**: `participantes` y `participantes_internos` deben permanecer separadas
- **Lógica**: El sistema determina automáticamente el tipo basado en qué campo está poblado

#### 2. **Mapeo de IDs a Nombres**
- **Tabla correcta**: `estado_participante_cat` (NO `estados_participante`)
- **Lógica**: Siempre mapear IDs a nombres antes de mostrar en frontend

#### 3. **API Cliente Supabase**
- **Usar**: `supabaseServer` de `src/api/supabase-server.ts` para APIs
- **NO usar**: Cliente público para operaciones que requieren bypass RLS

#### 4. **Estructura de Respuesta API**
```typescript
// Formato actual de respuesta:
{
  participantes: [{
    id: string,
    nombre: string,
    tipo: 'interno' | 'externo',
    estado_participante: string, // nombre, no ID
    productos_relacionados: string[], // nombres, no IDs
    empresa: object | string,
    rol_empresa: string, // nombre, no ID
    // ... más campos
  }]
}
```

### 🔍 DEBUGGING Y LOGS

#### Logs Útiles para Debugging:
```typescript
console.log('🔍 Estados participante IDs:', estadosParticipanteIds);
console.log('🔍 Estados participante consulta:', { data, error });
console.log('🔍 Estados participante mapeados:', estadosParticipanteData);
```

#### Endpoints de Debug (ya eliminados):
- `src/pages/api/debug-estados-participante.ts` ✅ ELIMINADO
- `src/pages/api/debug-participantes.ts` ✅ ELIMINADO

### 📊 ESTADO ACTUAL DE DATOS

#### Ejemplo de Respuesta API Funcionando:
```json
{
  "nombre": "prueba 12344",
  "tipo": "externo",
  "rol_empresa": "Abogado/a Corporativo/a",
  "estado_participante": "Disponible",
  "productos_relacionados": [
    {"id": "...", "nombre": "Analytics"},
    {"id": "...", "nombre": "API"}
  ],
  "comentarios": "sadfasdfas",
  "doleres_necesidades": "sfadfasdfsa"
}
```

### 🎯 PRÓXIMOS PASOS RECOMENDADOS

#### 1. **Crear Nuevos Tipos de Cliente**
- Seguir la misma lógica de separación interno/externo
- Mantener las tablas separadas
- Usar el mismo patrón de mapeo de IDs a nombres

#### 2. **Mejorar Información de Empresa**
- Agregar más campos si es necesario
- Mantener la lógica de mostrar solo para externos

#### 3. **Optimizar Consultas**
- Considerar índices en la base de datos
- Evaluar si se necesitan más consultas optimizadas

### ⚠️ ADVERTENCIAS IMPORTANTES

#### 1. **NO CAMBIAR NOMBRES DE TABLAS**
- `estado_participante_cat` es el nombre correcto
- `estados_participante` NO existe

#### 2. **NO MEZCLAR LÓGICA DE TIPOS**
- Internos: usar `participantes_internos_id`
- Externos: usar `participantes_id`
- El sistema determina automáticamente el tipo

#### 3. **SIEMPRE MAPEAR IDs A NOMBRES**
- Antes de mostrar en frontend
- Usar las tablas de catálogo correspondientes

### 🔧 COMANDOS ÚTILES

#### Verificar API:
```bash
curl -s "http://localhost:3000/api/participantes-reclutamiento?reclutamiento_id=ID" | jq '.participantes[0]'
```

#### Reiniciar Servidor:
```bash
npm run dev
```

### 📝 NOTAS DE IMPLEMENTACIÓN

#### Cambios Recientes (27 Julio 2025):
1. ✅ Corregido nombre de tabla `estado_participante_cat`
2. ✅ Implementado mapeo completo de IDs a nombres
3. ✅ Enriquecido modal "Ver más" con información completa
4. ✅ Separado lógica interno/externo correctamente
5. ✅ Eliminado archivos de debug temporales

#### Estado Final:
- ✅ Modal "Ver más" funciona correctamente
- ✅ Todos los IDs se mapean a nombres
- ✅ Información completa se muestra
- ✅ Separación interno/externo funciona
- ✅ API responde con datos enriquecidos

---

**ÚLTIMA ACTUALIZACIÓN**: 27 de Julio 2025  
**ESTADO**: ✅ FUNCIONANDO CORRECTAMENTE  
**PRÓXIMO PASO**: Crear nuevos tipos de cliente siguiendo esta misma lógica 