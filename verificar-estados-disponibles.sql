-- ====================================
-- VERIFICAR ESTADOS DISPONIBLES
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estados disponibles en la tabla
SELECT '=== ESTADOS DISPONIBLES EN estado_reclutamiento_cat ===' as info;
SELECT id, nombre, color FROM estado_reclutamiento_cat ORDER BY nombre;

-- 2. Verificar la vista actual
SELECT '=== VISTA ACTUAL ===' as info;
SELECT 
    reclutamiento_id,
    investigacion_id,
    titulo_investigacion,
    estado_reclutamiento_nombre,
    estado_reclutamiento_color,
    progreso_reclutamiento,
    progreso_porcentaje
FROM vista_reclutamientos_completa 
ORDER BY creado_en DESC
LIMIT 5;

-- 3. Verificar si hay inconsistencias
SELECT '=== VERIFICAR INCONSISTENCIAS ===' as info;
SELECT 
    estado_reclutamiento_nombre,
    COUNT(*) as cantidad
FROM vista_reclutamientos_completa 
GROUP BY estado_reclutamiento_nombre
ORDER BY estado_reclutamiento_nombre;
