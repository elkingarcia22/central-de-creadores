# 📋 Instrucciones para Implementar el Módulo de Reclutamiento

## 🎯 Objetivo
Implementar un módulo de reclutamiento que muestre investigaciones "por agendar" con información de libretos, progreso de reclutamiento y estado de reclutamiento.

## 📁 Archivos Creados
1. `verificar-estructura-libretos-existente.sql` - Verificar estructura de libretos existente
2. `crear-estado-reclutamiento-solo.sql` - Crear solo tabla de estado de reclutamiento
3. `vista-reclutamiento-simple.sql` - Vista simple que funciona con libretos existente
4. `src/pages/reclutamiento.tsx` - Página actualizada
5. `src/pages/api/metricas-reclutamientos.ts` - API actualizado
6. `src/components/ui/ProgressBar.tsx` - Componente de barra de progreso

## 🚀 Pasos de Implementación

### Paso 1: Verificar Estructura de Libretos (Opcional)
Ejecuta `verificar-estructura-libretos-existente.sql` en el SQL Editor de Supabase para ver la estructura actual de la tabla libretos.

### Paso 2: Crear Estado de Reclutamiento
**Ejecuta `crear-estado-reclutamiento-solo.sql` en el SQL Editor de Supabase**

Este script creará:
- Tabla `estado_reclutamiento_cat` con estados de reclutamiento
- Columna `estado_reclutamiento` en la tabla `investigaciones`
- Estados predefinidos: Pendiente, En progreso, Completado, Cancelado

### Paso 3: Completar Estructura de Estado Reclutamiento
**Ejecuta `completar-estructura-estado-reclutamiento.sql` en el SQL Editor de Supabase**

Este script agregará todas las columnas faltantes:
- `descripcion` - Para descripciones de los estados
- `color` - Para colores de los estados
- `orden` - Para ordenar los estados
- `activo` - Para habilitar/deshabilitar estados
- `creado_en` - Para timestamps

**Opcional: Diagnóstico rápido**
Si quieres verificar qué columnas faltan antes, ejecuta `diagnostico-rapido-columnas-faltantes.sql`

### Paso 4: Crear Vista con libretos_investigacion
**Ejecuta `vista-reclutamiento-con-libretos-existente.sql` en el SQL Editor de Supabase**

La vista `vista_reclutamientos_completa` incluye:
- Información de investigaciones con estado de reclutamiento
- Datos de la tabla `libretos_investigacion` (número de participantes, sesión)
- Responsable e implementador desde `profiles`
- Estado de reclutamiento con colores (calculados o desde tabla)
- Progreso de reclutamiento calculado automáticamente

### Paso 5: Verificar Implementación
1. Ve a la página `/reclutamiento` en tu aplicación
2. Verifica que se muestren las investigaciones por agendar
3. Confirma que aparezca el progreso de reclutamiento
4. Prueba los filtros y búsqueda

## 📊 Características del Módulo

### Dashboard
- **Total investigaciones por agendar**
- **Progreso general** (ej: 15/32 participantes)
- **Promedio de completitud**
- **Investigaciones en progreso**

### Tabla Principal
- **Investigación**: Nombre, libreto, fecha
- **Progreso**: Barra de progreso visual (0/8, 75%)
- **Responsable**: Nombre y correo
- **Implementador**: Nombre y correo
- **Estado**: Estado de reclutamiento con colores
- **Riesgo**: Nivel de riesgo de la investigación
- **Acciones**: Ver detalles y gestionar reclutamiento

### Funcionalidades
- ✅ Búsqueda inteligente en múltiples campos
- ✅ Filtros avanzados por estado, responsable, riesgo
- ✅ Sistema de diseño completo y consistente
- ✅ Métricas actualizadas en tiempo real
- ✅ Barra de progreso visual
- ✅ Badges con colores semánticos

## 🔧 Estructura de Datos

### Tabla `libretos_investigacion` (YA EXISTE)
```sql
- id (UUID, PK)
- investigacion_id (UUID, FK)
- numero_participantes (INTEGER)
- nombre_sesion (TEXT)
- usuarios_participantes (UUID[])
- duracion_estimada (INTEGER)
- descripcion_general (TEXT)
- [otras columnas existentes]
```

### Tabla `estado_reclutamiento_cat` (NUEVA)
```sql
- id (UUID, PK)
- nombre (VARCHAR, UNIQUE)
- descripcion (TEXT)
- color (VARCHAR, default: '#6B7280')
- activo (BOOLEAN)
- orden (INTEGER)
- creado_en (TIMESTAMP)
```

### Estados Predefinidos
1. **Pendiente** (#F59E0B) - Reclutamiento pendiente de iniciar
2. **En progreso** (#3B82F6) - Reclutamiento en curso
3. **Completado** (#10B981) - Reclutamiento finalizado exitosamente
4. **Cancelado** (#EF4444) - Reclutamiento cancelado

## 🎨 Componentes UI Utilizados

- **Layout**: Estructura principal de la página
- **Typography**: Textos con diferentes variantes
- **Card**: Contenedores para métricas y contenido
- **Button**: Botones de acción
- **DataTable**: Tabla principal con funcionalidades avanzadas
- **Input**: Campo de búsqueda
- **Badge**: Estados con colores
- **ProgressBar**: Barra de progreso visual
- **FilterDrawer**: Filtros avanzados
- **ActionsMenu**: Menú de acciones por fila

## 🚨 Solución de Problemas

### Error: "relation does not exist"
Si encuentras errores de tablas inexistentes:
1. Verifica que la tabla `libretos_investigacion` existe
2. Ejecuta `crear-estado-reclutamiento-solo.sql`
3. Luego ejecuta `vista-reclutamiento-con-libretos-existente.sql`

### Error: "column does not exist"
Si hay errores de columnas:
1. Ejecuta `verificar-estructura-libretos-existente.sql` para ver la estructura de libretos
2. Ejecuta `verificar-estructura-estado-reclutamiento.sql` para ver la estructura de estado_reclutamiento_cat
3. Si faltan columnas en estado_reclutamiento_cat:
   - Ejecuta `completar-estructura-estado-reclutamiento.sql` para agregar todas las columnas faltantes
   - Luego ejecuta `vista-reclutamiento-con-libretos-existente.sql`

### Página no carga
Si la página no carga:
1. Verifica que la vista `vista_reclutamientos_completa` existe
2. Confirma que hay investigaciones con estado 'por_agendar'
3. Revisa los logs del servidor para errores específicos

## 📈 Próximos Pasos

Una vez implementado el módulo básico, puedes considerar:

1. **Gestión de participantes**: Agregar funcionalidad para asignar participantes
2. **Notificaciones**: Alertas cuando el reclutamiento esté completo
3. **Reportes**: Generar reportes de progreso de reclutamiento
4. **Integración**: Conectar con otros módulos del sistema

## ✅ Verificación Final

Para confirmar que todo funciona correctamente:

1. ✅ La tabla `libretos_investigacion` existe y tiene datos
2. ✅ La tabla `estado_reclutamiento_cat` se creó correctamente
3. ✅ La vista `vista_reclutamientos_completa` existe
4. ✅ La página `/reclutamiento` carga sin errores
5. ✅ Se muestran las investigaciones por agendar
6. ✅ El progreso de reclutamiento se visualiza correctamente
7. ✅ Los filtros y búsqueda funcionan
8. ✅ Las métricas del dashboard se actualizan

## 🔄 Scripts de Ejecución

### Orden de ejecución en Supabase:

1. `verificar-estructura-libretos-existente.sql` (opcional)
2. `crear-estado-reclutamiento-solo.sql`
3. `completar-estructura-estado-reclutamiento.sql`
4. `vista-reclutamiento-con-libretos-existente.sql`

¡El módulo de reclutamiento está listo para usar! 🎉 