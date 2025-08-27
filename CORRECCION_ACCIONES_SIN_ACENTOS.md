# 🎯 CORRECCIÓN: ACCIONES DEL MENÚ CONTEXTUAL SIN ACENTOS

## ✅ CAMBIOS REALIZADOS

### Objetivo
Eliminar acentos de las acciones del menú contextual, manteniendo solo "Eliminar" con acento y en color rojo.

### Archivos Modificados

#### 1. `src/pages/investigaciones.tsx`
- **Línea 1140**: Cambió `'Crear seguimiento'` → `'Crear Seguimiento'`
- **Estado**: ✅ Sin acentos en todas las acciones del menú contextual

#### 2. `src/pages/participantes.tsx`
- **Línea 722**: Cambió `'Ver detalles'` → `'Ver Detalles'`
- **Estado**: ✅ Sin acentos en todas las acciones del menú contextual

### Acciones del Menú Contextual Verificadas

#### ✅ Investigaciones
- `'Ver'` - Sin acento ✅
- `'Crear Libreto'` - Sin acento ✅
- `'Crear Seguimiento'` - Sin acento ✅ (corregido)
- `'Editar'` - Sin acento ✅
- `'Duplicar'` - Sin acento ✅
- `'Eliminar'` - Con acento y rojo ✅ (mantenido)

#### ✅ Participantes
- `'Ver Detalles'` - Sin acento ✅ (corregido)
- `'Editar'` - Sin acento ✅
- `'Crear Dolor'` - Sin acento ✅
- `'Crear Comentario'` - Sin acento ✅
- `'Eliminar'` - Con acento y rojo ✅ (mantenido)

#### ✅ Empresas
- `'Ver'` - Sin acento ✅
- `'Editar'` - Sin acento ✅
- `'Eliminar'` - Con acento y rojo ✅ (mantenido)

#### ✅ Gestión de Usuarios
- `'Editar'` - Sin acento ✅
- `'Eliminar'` - Con acento y rojo ✅ (mantenido)

### Verificación Final
- ✅ Todas las acciones del menú contextual están sin acentos
- ✅ Solo "Eliminar" mantiene acento y color rojo
- ✅ No se dañó ninguna funcionalidad existente
- ✅ Los cambios son mínimos y específicos

### Archivos Verificados (Sin Cambios Necesarios)
- `src/pages/empresas.tsx` - Ya estaba correcto
- `src/pages/configuraciones/gestion-usuarios.tsx` - Ya estaba correcto
- `src/pages/investigaciones/ver/[id].tsx` - Ya estaba correcto
- `src/pages/reclutamiento.tsx` - Ya estaba correcto

---
**Estado**: ✅ COMPLETADO
**Fecha**: $(date)
**Cambios**: Mínimos y específicos
**Funcionalidad**: Preservada al 100%
