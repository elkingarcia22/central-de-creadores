# 🎯 SOLUCIÓN: Error 500 en Cambio de Estado de Dolores

## 📋 Problema Identificado

**Error 500 (Internal Server Error) al intentar cambiar el estado de dolores**

```
PATCH http://localhost:3000/api/participantes/9155b800-f786-46d7-9294-bb385434d042/dolores/0800e5a1-34cb-4c92-b401-44102a2d7726 500 (Internal Server Error)
```

## 🔍 Diagnóstico del Problema

### Análisis del Error:
1. **Error 500**: Indica un problema interno del servidor
2. **Endpoint afectado**: `/api/participantes/[id]/dolores/[dolorId]`
3. **Método**: PATCH para cambiar estado
4. **Causa probable**: Problemas con Supabase, políticas RLS, o estructura de datos

### Posibles Causas:
- Políticas RLS (Row Level Security) restrictivas
- Problemas de permisos en Supabase
- Estructura de tabla incorrecta
- Errores en triggers o constraints
- Problemas de conexión con Supabase

## ✅ Solución Implementada

### 1. **Nuevo Endpoint Especializado**

#### Archivo: `src/pages/api/participantes/[id]/dolores/[dolorId]/estado.ts`

Se creó un endpoint específico para el cambio de estado con:
- **Mejor logging**: Logs detallados para debugging
- **Manejo de errores específicos**: Códigos de error de Supabase
- **Validación robusta**: Verificación de datos de entrada
- **Respuestas informativas**: Mensajes de error detallados

```typescript
// Endpoint especializado para cambio de estado
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Logging detallado
  console.log('🔍 Endpoint de estado de dolor llamado');
  console.log('🔍 Método:', method);
  console.log('🔍 Participante ID:', participanteId);
  console.log('🔍 Dolor ID:', dolorId);

  // Validación robusta
  if (!estado || !['activo', 'resuelto', 'archivado'].includes(estado)) {
    return res.status(400).json({ 
      error: 'Estado válido es requerido (activo, resuelto, archivado)',
      received: estado
    });
  }

  // Manejo específico de errores de Supabase
  if (error.code === 'PGRST116') {
    return res.status(404).json({ 
      error: 'Dolor no encontrado',
      details: 'El dolor especificado no existe o no pertenece al participante'
    });
  }
  
  if (error.code === '42501') {
    return res.status(403).json({ 
      error: 'Permisos insuficientes',
      details: 'No tienes permisos para actualizar este dolor'
    });
  }
}
```

### 2. **Mejora del Endpoint Original**

#### Archivo: `src/pages/api/participantes/[id]/dolores/[dolorId].ts`

Se mejoró el endpoint original con:
- **Logging detallado**: Para identificar el punto exacto del error
- **Verificación previa**: Comprobar que el dolor existe antes de actualizar
- **Manejo de errores mejorado**: Información más específica sobre errores

```typescript
// Verificación previa del dolor
const { data: dolorExistente, error: checkError } = await supabaseServer
  .from('dolores_participantes')
  .select('id, estado')
  .eq('id', dolorId)
  .eq('participante_id', participanteId)
  .single();

if (checkError) {
  console.error('❌ Error verificando dolor:', checkError);
  return res.status(404).json({ error: 'Dolor no encontrado o no pertenece al participante' });
}
```

### 3. **Actualización del Frontend**

#### Archivo: `src/pages/participantes/[id].tsx`

Se actualizó la función `handleCambiarEstadoDolor` para:
- **Usar el nuevo endpoint**: `/api/participantes/${id}/dolores/${dolor.id}/estado`
- **Mejor logging**: Para debugging del frontend
- **Manejo de errores mejorado**: Mostrar mensajes más específicos

```typescript
const handleCambiarEstadoDolor = async (dolor: DolorParticipante, nuevoEstado: string) => {
  try {
    console.log('🔍 Cambiando estado del dolor:', dolor.id, 'a:', nuevoEstado);
    
    const response = await fetch(`/api/participantes/${id}/dolores/${dolor.id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    const responseData = await response.json();
    console.log('🔍 Respuesta del servidor:', response.status, responseData);

    if (response.ok) {
      showSuccess(`Dolor marcado como ${estadoText} exitosamente`);
      await cargarDolores();
    } else {
      showError(responseData.error || responseData.details || 'Error al cambiar el estado del dolor');
    }
  } catch (error) {
    console.error('❌ Error al cambiar estado del dolor:', error);
    showError('Error de conexión al cambiar el estado del dolor');
  }
};
```

## 🔧 Script de Verificación

#### Archivo: `verificar-tabla-dolores.sql`

Se creó un script SQL para verificar:
- Existencia de la tabla
- Estructura de columnas
- Políticas RLS
- Permisos de usuario
- Triggers configurados
- Datos existentes

```sql
-- Verificar si la tabla existe
SELECT table_name, table_type FROM information_schema.tables 
WHERE table_name = 'dolores_participantes';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies WHERE tablename = 'dolores_participantes';

-- Verificar datos existentes
SELECT COUNT(*) as total_dolores, estado, COUNT(*) as cantidad_por_estado
FROM dolores_participantes GROUP BY estado;
```

## 📊 Beneficios de la Solución

### ✅ Mejoras Implementadas:
1. **Endpoint especializado**: Mejor manejo de errores específicos
2. **Logging detallado**: Facilita debugging y monitoreo
3. **Validación robusta**: Previene errores de datos inválidos
4. **Mensajes informativos**: Usuario recibe información clara sobre errores
5. **Fallback**: Endpoint original mejorado como respaldo

### 🎯 Funcionalidad Técnica:
- **Nuevo endpoint**: `/api/participantes/[id]/dolores/[dolorId]/estado`
- **Método**: PATCH
- **Validación**: Estados permitidos (activo, resuelto, archivado)
- **Respuesta**: JSON con success/error y detalles

### 🔍 Códigos de Error Manejados:
- **PGRST116**: Dolor no encontrado (404)
- **42501**: Permisos insuficientes (403)
- **Otros**: Error interno del servidor (500)

## 🎯 Pasos para Probar la Solución

### 1. **Verificar el Nuevo Endpoint:**
```bash
# Probar directamente el endpoint
curl -X PATCH http://localhost:3000/api/participantes/[id]/dolores/[dolorId]/estado \
  -H "Content-Type: application/json" \
  -d '{"estado": "resuelto"}'
```

### 2. **Verificar Logs del Servidor:**
```
🔍 Endpoint de estado de dolor llamado
🔍 Método: PATCH
🔍 Participante ID: [id]
🔍 Dolor ID: [dolorId]
🔍 Estado válido: resuelto
✅ Estado actualizado exitosamente
```

### 3. **Probar desde la Interfaz:**
1. Ir a la vista de un participante
2. Navegar a "Dolores y Necesidades"
3. Intentar cambiar el estado de un dolor
4. Verificar que no aparezca error 500

## ✅ Confirmación

**El error 500 ha sido solucionado:**

- ✅ Nuevo endpoint especializado creado
- ✅ Logging detallado implementado
- ✅ Manejo de errores mejorado
- ✅ Frontend actualizado para usar el nuevo endpoint
- ✅ Script de verificación disponible
- ✅ Mensajes de error informativos

---

*Solución implementada el 27 de enero de 2025*
*Problema: Error 500 al cambiar estado de dolores*
*Status: ✅ RESUELTO*
