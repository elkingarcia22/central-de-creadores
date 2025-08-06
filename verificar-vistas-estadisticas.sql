-- ====================================
-- VERIFICAR VISTAS DE ESTADÍSTICAS
-- ====================================
-- Objetivo: Verificar qué consultan las vistas
-- y si están causando duplicación

-- ====================================
-- 1. VERIFICAR VISTA ESTADÍSTICAS EMPRESAS
-- ====================================

SELECT 
    '=== VISTA ESTADÍSTICAS EMPRESAS ===' as info;

-- Verificar datos en la vista
SELECT 
    *
FROM vista_estadisticas_empresas
WHERE empresa_id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042');

-- ====================================
-- 2. VERIFICAR VISTA ESTADÍSTICAS PARTICIPANTES
-- ====================================

SELECT 
    '=== VISTA ESTADÍSTICAS PARTICIPANTES ===' as info;

-- Verificar datos en la vista
SELECT 
    *
FROM vista_estadisticas_participantes
WHERE participante_id = '9155b800-f786-46d7-9294-bb385434d042';

-- ====================================
-- 3. VERIFICAR ESTRUCTURA DE LAS VISTAS
-- ====================================

SELECT 
    '=== ESTRUCTURA VISTA EMPRESAS ===' as info;

-- Verificar estructura de la vista de empresas
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'vista_estadisticas_empresas'
ORDER BY ordinal_position;

SELECT 
    '=== ESTRUCTURA VISTA PARTICIPANTES ===' as info;

-- Verificar estructura de la vista de participantes
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'vista_estadisticas_participantes'
ORDER BY ordinal_position;

-- ====================================
-- 4. VERIFICAR DEFINICIÓN DE LAS VISTAS
-- ====================================

SELECT 
    '=== DEFINICIÓN VISTA EMPRESAS ===' as info;

-- Verificar definición de la vista de empresas
SELECT 
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name = 'vista_estadisticas_empresas';

SELECT 
    '=== DEFINICIÓN VISTA PARTICIPANTES ===' as info;

-- Verificar definición de la vista de participantes
SELECT 
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name = 'vista_estadisticas_participantes';

-- ====================================
-- 5. COMPARAR DATOS
-- ====================================

SELECT 
    '=== COMPARACIÓN DE DATOS ===' as info;

-- Comparar datos de la vista vs historial
SELECT 
    'Desde vista empresas' as fuente,
    COUNT(*) as total_participaciones,
    COUNT(CASE WHEN participaciones_finalizadas > 0 THEN 1 END) as empresas_con_finalizadas
FROM vista_estadisticas_empresas
WHERE empresa_id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042')
UNION ALL
SELECT 
    'Desde historial empresas' as fuente,
    COUNT(*) as total_participaciones,
    COUNT(CASE WHEN estado_sesion = 'completada' THEN 1 END) as empresas_con_finalizadas
FROM historial_participacion_empresas
WHERE empresa_id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042');

-- ====================================
-- 6. VERIFICAR SI LAS VISTAS USAN RECLUTAMIENTOS
-- ====================================

SELECT 
    '=== VERIFICAR FUENTE DE DATOS ===' as info;

SELECT 
    'Si las vistas usan reclutamientos en lugar de historial' as problema_1,
    'Entonces mostrarán datos duplicados' as problema_2,
    'Necesitamos actualizar las vistas para usar historial' as solucion;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO DE VISTAS COMPLETADO ===' as info;
SELECT '✅ Revisa las definiciones de las vistas' as mensaje;
SELECT '✅ Si usan reclutamientos, necesitamos actualizarlas' as mensaje; 