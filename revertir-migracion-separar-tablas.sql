-- ====================================
-- REVERTIR MIGRACIÓN - SEPARAR TABLAS
-- ====================================
-- Ejecutar en Supabase SQL Editor
-- Revertir la migración incorrecta y mantener tablas separadas

-- PASO 1: Verificar participantes internos que fueron migrados
SELECT '=== PARTICIPANTES INTERNOS MIGRADOS ===' as info;

SELECT 
    id,
    nombre,
    email,
    tipo,
    created_at
FROM participantes 
WHERE tipo = 'interno'
ORDER BY nombre;

-- PASO 2: Eliminar participantes internos de la tabla participantes
SELECT '=== ELIMINANDO PARTICIPANTES INTERNOS DE PARTICIPANTES ===' as info;

DELETE FROM participantes 
WHERE tipo = 'interno';

SELECT '✅ Participantes internos eliminados de participantes' as resultado;

-- PASO 3: Verificar que participantes_internos sigue existiendo
SELECT '=== VERIFICANDO PARTICIPANTES_INTERNOS ===' as info;

SELECT 
    id,
    nombre,
    email,
    departamento_id,
    activo
FROM participantes_internos 
ORDER BY nombre;

-- PASO 4: Verificar estado final de tablas
SELECT '=== ESTADO FINAL DE TABLAS ===' as info;

SELECT 
    'Participantes externos:' as tabla,
    COUNT(*) as total
FROM participantes
UNION ALL
SELECT 
    'Participantes internos:' as tabla,
    COUNT(*) as total
FROM participantes_internos;

-- PASO 5: Limpiar reclutamientos que usen IDs de participantes_internos
SELECT '=== LIMPIANDO RECLUTAMIENTOS CON IDs INVÁLIDOS ===' as info;

DELETE FROM reclutamientos 
WHERE participantes_id IS NOT NULL 
AND participantes_id NOT IN (SELECT id FROM participantes);

SELECT '✅ Reclutamientos con IDs inválidos eliminados' as resultado;

-- PASO 6: Estado final
SELECT '=== ESTADO FINAL ===' as info;

SELECT 
    'Total participantes externos:' as info,
    COUNT(*) as total
FROM participantes
UNION ALL
SELECT 
    'Total participantes internos:' as info,
    COUNT(*) as total
FROM participantes_internos
UNION ALL
SELECT 
    'Total reclutamientos válidos:' as info,
    COUNT(*) as total
FROM reclutamientos; 