-- ====================================
-- DIAGNÓSTICO DE VISTAS DE ESTADÍSTICAS
-- ====================================
-- Problema: Las vistas no se limpian automáticamente
-- Objetivo: Verificar de dónde obtienen los datos las vistas

-- ====================================
-- 1. VERIFICAR DEFINICIÓN DE VISTAS
-- ====================================

SELECT '=== DEFINICIÓN DE VISTAS ===' as info;

-- Ver definición de vista de participantes
SELECT 
    'Definición vista participantes' as info,
    view_definition
FROM information_schema.views
WHERE table_name = 'vista_estadisticas_participantes';

-- Ver definición de vista de empresas
SELECT 
    'Definición vista empresas' as info,
    view_definition
FROM information_schema.views
WHERE table_name = 'vista_estadisticas_empresas';

-- ====================================
-- 2. VERIFICAR DATOS EN TABLAS BASE
-- ====================================

SELECT '=== DATOS EN TABLAS BASE ===' as info;

-- Ver datos en historial_participacion_participantes
SELECT 
    'Datos en historial_participacion_participantes' as info,
    COUNT(*) as total_registros
FROM historial_participacion_participantes;

-- Ver datos en historial_participacion_empresas
SELECT 
    'Datos en historial_participacion_empresas' as info,
    COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- Ver datos en reclutamientos
SELECT 
    'Datos en reclutamientos' as info,
    COUNT(*) as total_reclutamientos,
    COUNT(CASE WHEN participantes_id IS NOT NULL THEN 1 END) as con_participantes,
    COUNT(CASE WHEN estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN 1 END) as finalizados
FROM reclutamientos;

-- ====================================
-- 3. VERIFICAR ESTADO_AGENDAMIENTO_CAT
-- ====================================

SELECT '=== ESTADO_AGENDAMIENTO_CAT ===' as info;

-- Ver estados disponibles
SELECT 
    'Estados disponibles' as info,
    id,
    nombre
FROM estado_agendamiento_cat;

-- ====================================
-- 4. SIMULAR CÁLCULO DE VISTAS
-- ====================================

SELECT '=== SIMULANDO CÁLCULO DE VISTAS ===' as info;

-- Simular vista de participantes
SELECT 
    'Simulación vista participantes' as info,
    p.id as participante_id,
    p.nombre as participante,
    COUNT(r.id) as total_participaciones,
    COUNT(CASE WHEN r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN 1 END) as participaciones_finalizadas
FROM participantes p
LEFT JOIN reclutamientos r ON p.id = r.participantes_id
GROUP BY p.id, p.nombre
HAVING COUNT(r.id) > 0 OR COUNT(CASE WHEN r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN 1 END) > 0
LIMIT 5;

-- Simular vista de empresas
SELECT 
    'Simulación vista empresas' as info,
    e.id as empresa_id,
    e.nombre as empresa,
    COUNT(r.id) as total_participaciones,
    COUNT(CASE WHEN r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN 1 END) as participaciones_finalizadas
FROM empresas e
LEFT JOIN participantes p ON e.id = p.empresa_id
LEFT JOIN reclutamientos r ON p.id = r.participantes_id
GROUP BY e.id, e.nombre
HAVING COUNT(r.id) > 0 OR COUNT(CASE WHEN r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN 1 END) > 0
LIMIT 5;

-- ====================================
-- 5. VERIFICAR DATOS REALES EN VISTAS
-- ====================================

SELECT '=== DATOS REALES EN VISTAS ===' as info;

-- Ver datos reales en vista de participantes
SELECT 
    'Datos reales vista participantes' as info,
    participante_id,
    participante,
    total_participaciones,
    participaciones_finalizadas
FROM vista_estadisticas_participantes
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0
LIMIT 5;

-- Ver datos reales en vista de empresas
SELECT 
    'Datos reales vista empresas' as info,
    empresa_id,
    empresa,
    total_participaciones,
    participaciones_finalizadas
FROM vista_estadisticas_empresas
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0
LIMIT 5;

-- ====================================
-- 6. COMPARAR SIMULACIÓN VS VISTA REAL
-- ====================================

SELECT '=== COMPARACIÓN SIMULACIÓN VS VISTA ===' as info;

-- Comparar conteos
SELECT 
    'Comparación de conteos' as info,
    (SELECT COUNT(*) FROM vista_estadisticas_participantes WHERE total_participaciones > 0) as vista_participantes,
    (SELECT COUNT(*) FROM vista_estadisticas_empresas WHERE total_participaciones > 0) as vista_empresas,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL) as reclutamientos_con_participantes,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as reclutamientos_finalizados;

-- ====================================
-- 7. DIAGNÓSTICO DEL PROBLEMA
-- ====================================

SELECT '=== DIAGNÓSTICO DEL PROBLEMA ===' as info;

-- Verificar si las vistas usan historial o reclutamientos directamente
SELECT 
    'Análisis del problema' as info,
    CASE 
        WHEN (SELECT COUNT(*) FROM historial_participacion_participantes) = 0 
        AND (SELECT COUNT(*) FROM vista_estadisticas_participantes WHERE total_participaciones > 0) > 0
        THEN '❌ Las vistas NO usan historial (usan reclutamientos directamente)'
        ELSE '✅ Las vistas usan historial correctamente'
    END as diagnostico_participantes,
    CASE 
        WHEN (SELECT COUNT(*) FROM historial_participacion_empresas) = 0 
        AND (SELECT COUNT(*) FROM vista_estadisticas_empresas WHERE total_participaciones > 0) > 0
        THEN '❌ Las vistas NO usan historial (usan reclutamientos directamente)'
        ELSE '✅ Las vistas usan historial correctamente'
    END as diagnostico_empresas;

-- ====================================
-- 8. SOLUCIÓN PROPUESTA
-- ====================================

SELECT '=== SOLUCIÓN PROPUESTA ===' as info;

SELECT 
    'Si las vistas usan reclutamientos directamente:' as problema,
    '1. Necesitamos recrear las vistas para que usen historial' as solucion1,
    '2. O limpiar los reclutamientos también' as solucion2,
    '3. O crear nuevas vistas que usen historial' as solucion3;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO COMPLETADO ===' as info;
SELECT '✅ Revisa los resultados arriba para entender el problema' as mensaje;
SELECT '⚠️ Las vistas probablemente usan reclutamientos, no historial' as explicacion;
SELECT '🔧 Necesitaremos recrear las vistas o limpiar reclutamientos' as solucion; 