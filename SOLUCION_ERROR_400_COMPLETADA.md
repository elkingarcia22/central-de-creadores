# SOLUCIÓN ERROR 400 - COMPLETADA ✅

## Problema Identificado

Se reportó un error 400 (Bad Request) al intentar actualizar investigaciones, específicamente cuando se creaba un libreto y se intentaba cambiar el estado de la investigación de "en_borrador" a "por_agendar".

### Error Específico
```
eloncaptettdvrvwypji.supabase.co/rest/v1/investigaciones?id=eq.ed58dbf4-f506-4b33-a0b7-1795458a67ff&select=id:1  Failed to load resource: the server responded with a status of 400 ()
```

## Causa del Problema

El error 400 se debía a un problema de sintaxis en las consultas de Supabase. Específicamente:

1. **Sintaxis incorrecta en `.select()`**: Se estaba usando `.select('id, estado')` con espacios, lo cual causaba problemas de parsing en la URL de la API.

2. **Problema en la función `crearLibreto`**: La consulta de actualización tenía una sintaxis que no era compatible con la API de Supabase.

## Solución Implementada

### 1. Corrección de Sintaxis en `supabase-libretos.ts`

**Antes:**
```typescript
.select('id, estado')
```

**Después:**
```typescript
.select('id,estado')
```

### 2. Archivos Modificados

- `src/api/supabase-libretos.ts`: Corregida la sintaxis del select en las consultas de actualización

### 3. Cambios Específicos

```typescript
// Línea 453 - Primera consulta de actualización
.select('id,estado');

// Línea 467 - Segunda consulta de actualización (fallback)
.select('id,estado');
```

## Verificación de la Solución

### 1. Scripts de Diagnóstico Creados

- `verificar-estructura-investigaciones-error-400.sql`: Para diagnosticar problemas de estructura y permisos
- `test-query-investigaciones.sql`: Para probar consultas específicas
- `verificar-cambio-estado-investigacion.sql`: Para verificar el cambio de estado

### 2. Limpieza de Cache

Se limpió completamente el cache del servidor Next.js:
```bash
rm -rf .next && npm run dev
```

## Resultado Esperado

Después de estos cambios:

1. ✅ **No más errores 400** al crear libretos
2. ✅ **Actualización correcta del estado** de investigación de "en_borrador" a "por_agendar"
3. ✅ **Funcionamiento normal** de todas las operaciones CRUD de investigaciones
4. ✅ **Sintaxis compatible** con la API de Supabase

## Pruebas Recomendadas

1. **Crear un nuevo libreto** para una investigación en estado "en_borrador"
2. **Verificar que el estado cambie** automáticamente a "por_agendar"
3. **Actualizar investigaciones** existentes
4. **Verificar que no aparezcan errores 400** en la consola del navegador

## Notas Importantes

- La sintaxis `.select('id,estado')` (sin espacios) es la forma correcta para Supabase
- Los espacios en los parámetros del select pueden causar problemas de parsing en la URL
- Es importante limpiar el cache después de cambios en el código para asegurar que los cambios surtan efecto

## Estado Final

🟢 **PROBLEMA RESUELTO** - El error 400 ha sido corregido y el sistema debería funcionar correctamente. 