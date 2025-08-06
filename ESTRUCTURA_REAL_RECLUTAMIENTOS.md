# 📋 ESTRUCTURA REAL - TABLA RECLUTAMIENTOS

## 📅 Fecha: 2025-01-25
## 🎯 Objetivo: Documentar la estructura real de la tabla reclutamientos

---

## 🏗️ ESTRUCTURA REAL DE LA TABLA `reclutamientos`

### Columnas de la tabla:
```sql
{
  "id": "uuid (PK)",
  "investigacion_id": "uuid (FK -> investigaciones)",
  "participantes_id": "uuid (FK -> participantes)",
  "fecha_asignado": "timestamp with time zone",
  "fecha_sesion": "timestamp with time zone", 
  "reclutador_id": "uuid (FK -> usuarios)",
  "creado_por": "uuid (FK -> usuarios)",
  "estado_agendamiento": "uuid (FK -> estado_agendamiento_cat)",
  "updated_at": "timestamp with time zone",
  "duracion_sesion": "integer"
}
```

### Foreign Keys:
```sql
{
  "creado_por": "FK -> usuarios",
  "estado_agendamiento": "FK -> estado_agendamiento_cat", 
  "participantes_id": "FK -> participantes",
  "reclutador_id": "FK -> usuarios"
}
```

---

## 🔍 ANÁLISIS DEL PROBLEMA ACTUAL

### Error que está ocurriendo:
```
Key (participantes_id)=(af4eb891-2a6e-44e0-84d3-b00592775c08) is not present in table "participantes"
```

### Causa:
- El frontend está enviando un `participantes_id` que no existe en la tabla `participantes`
- La tabla `reclutamientos` usa `participantes_id` (no `participante_externo_id` ni `participante_interno_id`)
- Solo hay una columna para participantes, no separa internos/externos

---

## 🎯 IMPLICACIONES DEL DISEÑO

### 1. **Un solo tipo de participante**
- La tabla `reclutamientos` solo tiene `participantes_id`
- NO separa entre participantes internos y externos
- Todos los participantes van en la tabla `participantes`

### 2. **Flujo de trabajo**
- Los participantes internos también deben estar en la tabla `participantes`
- El frontend debe manejar la lógica de tipo (interno/externo)
- La base de datos no distingue entre tipos

### 3. **Estructura de datos**
- `participantes` = participantes externos + internos
- `participantes_internos` = tabla separada (¿para qué?)
- `reclutamientos` = usa solo `participantes_id`

---

## 🚨 PROBLEMAS IDENTIFICADOS

### 1. **Inconsistencia en el diseño**
- Documentación dice que hay separación interno/externo
- Estructura real solo tiene `participantes_id`
- Tabla `participantes_internos` existe pero no se usa en reclutamientos

### 2. **Frontend enviando ID inválido**
- El ID `af4eb891-2a6e-44e0-84d3-b00592775c08` no existe en `participantes`
- Posiblemente viene de `participantes_internos` pero debería estar en `participantes`

### 3. **Confusión en el modelo de datos**
- ¿Los participantes internos van en `participantes` o `participantes_internos`?
- ¿Cómo se distingue el tipo en la tabla `participantes`?

---

## 🔧 SOLUCIONES POSIBLES

### Opción 1: Usar solo tabla `participantes`
- Mover todos los participantes internos a `participantes`
- Agregar campo `tipo` en `participantes` ('interno'/'externo')
- Eliminar tabla `participantes_internos`

### Opción 2: Mantener separación
- Modificar tabla `reclutamientos` para tener `participante_interno_id` y `participante_externo_id`
- Actualizar frontend para usar la columna correcta según el tipo

### Opción 3: Vista unificada
- Crear vista que combine `participantes` y `participantes_internos`
- Mantener tablas separadas pero unificar en la vista

---

## 📋 PRÓXIMOS PASOS

1. **Decidir el modelo de datos** (Opción 1, 2 o 3)
2. **Crear script de migración** según la decisión
3. **Actualizar frontend** para usar la estructura correcta
4. **Limpiar datos corruptos** existentes

---

*Documentación creada para referencia futura y evitar pérdida de contexto.* 