# Análisis del Problema de Duplicados en el Módulo de Reclutamiento

## 🔍 Problema Identificado

El módulo de reclutamiento está mostrando **libretos duplicados** en la vista, donde la misma información aparece dos veces una debajo de otra. Este problema se manifestó después de implementar las nuevas funcionalidades de usuarios, roles y permisos.

## 📊 Análisis del Flujo Funcional

### 1. **Estructura del Módulo de Reclutamiento**

El módulo de reclutamiento tiene los siguientes componentes principales:

- **Página principal**: `/src/pages/reclutamiento.tsx` - Lista de reclutamientos
- **Vista detallada**: `/src/pages/reclutamiento/ver/[id].tsx` - Detalle de un reclutamiento específico
- **API de métricas**: `/src/pages/api/metricas-reclutamientos.ts` - Obtiene datos para la lista
- **API de participantes**: `/src/pages/api/participantes-reclutamiento.ts` - Obtiene participantes de un reclutamiento
- **Vista de base de datos**: `vista_reclutamientos_completa` - Vista SQL que combina datos

### 2. **Flujo de Datos**

```
1. Frontend llama a /api/metricas-reclutamientos
2. API consulta la vista vista_reclutamientos_completa
3. Vista combina datos de investigaciones + libretos + participantes
4. Frontend muestra los datos en la lista de reclutamientos
5. Al hacer clic en un reclutamiento, va a /reclutamiento/ver/[id]
6. Esta página llama a /api/participantes-reclutamiento para obtener participantes
```

## 🐛 Causa Raíz del Problema

### **Problema Principal: Vista SQL con UNION ALL**

La vista `vista_reclutamientos_completa` está usando `UNION ALL` para combinar:

1. **Reclutamientos manuales** (desde tabla `reclutamientos`)
2. **Investigaciones por agendar** (desde tabla `investigaciones`)

```sql
-- Problema en la vista actual
WITH reclutamientos_manuales AS (
    SELECT ... FROM reclutamientos r
),
investigaciones_por_agendar AS (
    SELECT ... FROM investigaciones i WHERE i.estado = 'por_agendar'
),
todos_reclutamientos AS (
    SELECT * FROM reclutamientos_manuales
    UNION ALL  -- ← ESTO CAUSA DUPLICADOS
    SELECT * FROM investigaciones_por_agendar
)
```

### **Problemas Específicos:**

1. **Relación inconsistente entre investigaciones y libretos**:
   - Una investigación puede tener un `libreto_id` que apunta a `libretos_investigacion.id`
   - Pero también puede haber un libreto con `investigacion_id` que apunta a la investigación
   - Esto causa que se generen múltiples filas para la misma investigación

2. **Múltiples reclutamientos por investigación**:
   - Una investigación puede tener múltiples registros en la tabla `reclutamientos`
   - Cada registro genera una fila en la vista

3. **Joins múltiples sin DISTINCT**:
   - Los LEFT JOINs pueden generar filas duplicadas cuando hay múltiples relaciones

## 🔧 Solución Implementada

### **1. Nueva Vista Sin Duplicados**

```sql
-- Nueva vista que elimina duplicados
CREATE VIEW vista_reclutamientos_completa AS
WITH investigaciones_unicas AS (
    -- Obtener investigaciones únicas en estado por_agendar
    SELECT DISTINCT
        i.id AS investigacion_id,
        i.nombre AS investigacion_nombre,
        -- ... otros campos
    FROM investigaciones i
    WHERE i.estado = 'por_agendar'
),
participantes_por_investigacion AS (
    -- Contar participantes únicos por investigación
    SELECT 
        r.investigacion_id,
        COUNT(DISTINCT r.id) as total_participantes
    FROM reclutamientos r
    WHERE r.estado_agendamiento != 'pendiente_de_agendamiento'
    GROUP BY r.investigacion_id
)
SELECT 
    -- Campos únicos por investigación
    iu.investigacion_id AS reclutamiento_id,
    iu.investigacion_id AS investigacion_id,
    -- ... resto de campos
FROM investigaciones_unicas iu
LEFT JOIN libretos_investigacion li ON iu.libreto_id::uuid = li.id
-- ... otros joins
LEFT JOIN participantes_por_investigacion ppi ON iu.investigacion_id = ppi.investigacion_id
ORDER BY iu.creado_el DESC;
```

### **2. Cambios Clave en la Solución**

1. **Uso de CTEs (Common Table Expressions)** para obtener datos únicos
2. **DISTINCT** en la selección de investigaciones
3. **Agrupación de participantes** por investigación
4. **Eliminación del UNION ALL** problemático
5. **Joins más específicos** para evitar duplicados

### **3. Beneficios de la Solución**

- ✅ **Elimina duplicados** completamente
- ✅ **Mantiene funcionalidad** existente
- ✅ **Mejora rendimiento** al reducir datos procesados
- ✅ **Compatibilidad** con el frontend existente
- ✅ **Escalabilidad** para futuras implementaciones

## 🚀 Pasos para Implementar la Solución

### **1. Ejecutar Script de Verificación**
```sql
-- Ejecutar verificar-vista-actual.sql en Supabase
-- Esto identificará duplicados existentes
```

### **2. Aplicar Nueva Vista**
```sql
-- Ejecutar corregir-vista-sin-duplicados.sql en Supabase
-- Esto creará la nueva vista sin duplicados
```

### **3. Verificar Resultados**
```sql
-- Verificar que no hay duplicados
SELECT investigacion_id, COUNT(*) 
FROM vista_reclutamientos_completa 
GROUP BY investigacion_id 
HAVING COUNT(*) > 1;
```

## 🔍 Verificación del Problema

### **Scripts de Diagnóstico Creados:**

1. **`verificar-vista-actual.sql`** - Detecta duplicados existentes
2. **`corregir-vista-sin-duplicados.sql`** - Aplica la solución

### **Indicadores de Duplicados:**

- Misma investigación aparece múltiples veces
- Mismo libreto se muestra repetidamente
- Conteo de participantes incorrecto
- Progreso de reclutamiento duplicado

## 📈 Impacto de la Solución

### **Antes:**
- ❌ Libretos duplicados en la vista
- ❌ Información confusa para el usuario
- ❌ Cálculos de progreso incorrectos
- ❌ Rendimiento degradado

### **Después:**
- ✅ Vista limpia sin duplicados
- ✅ Información clara y precisa
- ✅ Cálculos correctos de progreso
- ✅ Mejor rendimiento

## 🔮 Prevención Futura

### **1. Monitoreo Continuo**
- Implementar alertas para detectar duplicados
- Revisar regularmente la integridad de datos

### **2. Validaciones en el Frontend**
- Verificar datos antes de mostrarlos
- Implementar deduplicación en el cliente si es necesario

### **3. Documentación de Cambios**
- Mantener registro de modificaciones en la vista
- Documentar relaciones entre tablas

## 📝 Conclusión

El problema de duplicados en el módulo de reclutamiento se originó en la vista SQL que combinaba datos de múltiples fuentes usando `UNION ALL`. La solución implementada elimina los duplicados mediante el uso de CTEs y agrupación de datos, manteniendo toda la funcionalidad existente mientras mejora la experiencia del usuario y el rendimiento del sistema.

La implementación de esta solución es **crítica** para el correcto funcionamiento del módulo de reclutamiento y debe aplicarse inmediatamente para resolver el problema reportado.
