-- ====================================
-- DIAGNÓSTICO FINAL MÓDULO RECLUTAMIENTO
-- ====================================

-- 1. VERIFICAR TABLAS NECESARIAS
SELECT '=== VERIFICAR TABLAS NECESARIAS ===' as info;

SELECT 
    table_name,
    CASE 
        WHEN table_name = 'investigaciones' THEN '✅ REQUERIDA'
        WHEN table_name = 'libretos_investigacion' THEN '✅ REQUERIDA'
        WHEN table_name = 'estado_reclutamiento_cat' THEN '✅ REQUERIDA'
        WHEN table_name = 'profiles' THEN '✅ REQUERIDA'
        ELSE 'ℹ️ OPCIONAL'
    END as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('investigaciones', 'libretos_investigacion', 'estado_reclutamiento_cat', 'profiles')
ORDER BY table_name;

-- 2. VERIFICAR VISTA
SELECT '=== VERIFICAR VISTA ===' as info;

SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_name = 'vista_reclutamientos_completa' THEN '✅ VISTA CREADA'
        ELSE '❌ VISTA NO EXISTE'
    END as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'vista_reclutamientos_completa';

-- 3. VERIFICAR ESTRUCTURA DE LA VISTA
SELECT '=== ESTRUCTURA DE LA VISTA ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'vista_reclutamientos_completa' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. VERIFICAR DATOS EN INVESTIGACIONES
SELECT '=== DATOS EN INVESTIGACIONES ===' as info;

SELECT 
    COUNT(*) as total_investigaciones,
    COUNT(CASE WHEN estado_reclutamiento IS NOT NULL THEN 1 END) as con_estado_reclutamiento,
    COUNT(CASE WHEN estado_reclutamiento IS NULL THEN 1 END) as sin_estado_reclutamiento
FROM investigaciones;

-- 5. VERIFICAR DATOS EN LIBRETOS_INVESTIGACION
SELECT '=== DATOS EN LIBRETOS_INVESTIGACION ===' as info;

SELECT 
    COUNT(*) as total_libretos,
    COUNT(CASE WHEN numero_participantes IS NOT NULL THEN 1 END) as con_participantes,
    COUNT(CASE WHEN numero_participantes IS NULL THEN 1 END) as sin_participantes
FROM libretos_investigacion;

-- 6. VERIFICAR ESTADOS DE RECLUTAMIENTO
SELECT '=== ESTADOS DE RECLUTAMIENTO ===' as info;

SELECT 
    nombre,
    color,
    activo,
    orden
FROM estado_reclutamiento_cat
ORDER BY orden;

-- 7. VERIFICAR DATOS EN LA VISTA
SELECT '=== DATOS EN LA VISTA ===' as info;

SELECT 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN estado_reclutamiento_nombre IS NOT NULL THEN 1 END) as con_estado,
    COUNT(CASE WHEN numero_participantes > 0 THEN 1 END) as con_participantes,
    COUNT(CASE WHEN progreso_reclutamiento > 0 THEN 1 END) as con_progreso
FROM vista_reclutamientos_completa;

-- 8. MOSTRAR EJEMPLOS DE DATOS
SELECT '=== EJEMPLOS DE DATOS ===' as info;

SELECT 
    id,
    investigacion_nombre,
    estado_reclutamiento_nombre,
    numero_participantes,
    participantes_actuales,
    progreso_reclutamiento,
    responsable_nombre,
    implementador_nombre
FROM vista_reclutamientos_completa
LIMIT 5;

-- 9. VERIFICAR RELACIONES
SELECT '=== VERIFICAR RELACIONES ===' as info;

-- Verificar que las investigaciones tienen libretos
SELECT 
    COUNT(*) as investigaciones_con_libretos
FROM investigaciones i
INNER JOIN libretos_investigacion li ON i.id = li.investigacion_id;

-- Verificar que las investigaciones tienen responsables
SELECT 
    COUNT(*) as investigaciones_con_responsable
FROM investigaciones i
INNER JOIN profiles p ON i.responsable_id = p.id;

-- 10. RESUMEN FINAL
SELECT '=== RESUMEN FINAL ===' as info;

SELECT 
    'Módulo de Reclutamiento' as modulo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vista_reclutamientos_completa') 
        THEN '✅ FUNCIONANDO'
        ELSE '❌ CON ERRORES'
    END as estado,
    'Verificar logs para detalles' as observaciones; 