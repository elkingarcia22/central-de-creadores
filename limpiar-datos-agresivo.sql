-- ====================================
-- LIMPIAR DATOS AGRESIVO
-- ====================================
-- Problema: Script anterior no limpia en Supabase
-- Solución: Script más agresivo con verificación de permisos
-- Objetivo: Forzar limpieza completa

-- ====================================
-- 1. VERIFICAR PERMISOS Y CONEXIÓN
-- ====================================

SELECT '=== VERIFICANDO PERMISOS ===' as info;

-- Verificar que estamos conectados como el usuario correcto
SELECT current_user as usuario_actual;

-- Verificar permisos en las tablas
SELECT 
    'Permisos en tablas de historial' as info,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name IN (
    'historial_participacion_participantes',
    'historial_participacion_empresas',
    'historial_participacion_participantes_internos'
)
AND grantee = current_user;

-- ====================================
-- 2. VERIFICAR ESTADO ACTUAL
-- ====================================

SELECT '=== ESTADO ACTUAL ANTES DE LIMPIAR ===' as info;

-- Ver registros actuales
SELECT 
    'Registros actuales' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes_internos) as historial_internos;

-- Ver algunos registros para confirmar que existen
SELECT 
    'Primeros 3 registros de historial participantes' as info,
    id,
    participante_id,
    reclutamiento_id
FROM historial_participacion_participantes
LIMIT 3;

-- ====================================
-- 3. LIMPIEZA AGRESIVA
-- ====================================

SELECT '=== INICIANDO LIMPIEZA AGRESIVA ===' as info;

-- Intentar limpiar con diferentes métodos
BEGIN;

-- Método 1: DELETE directo
DELETE FROM historial_participacion_participantes;
SELECT 'DELETE participantes ejecutado' as resultado;

DELETE FROM historial_participacion_empresas;
SELECT 'DELETE empresas ejecutado' as resultado;

DELETE FROM historial_participacion_participantes_internos;
SELECT 'DELETE internos ejecutado' as resultado;

-- Método 2: TRUNCATE (más agresivo)
TRUNCATE TABLE historial_participacion_participantes RESTART IDENTITY CASCADE;
SELECT 'TRUNCATE participantes ejecutado' as resultado;

TRUNCATE TABLE historial_participacion_empresas RESTART IDENTITY CASCADE;
SELECT 'TRUNCATE empresas ejecutado' as resultado;

TRUNCATE TABLE historial_participacion_participantes_internos RESTART IDENTITY CASCADE;
SELECT 'TRUNCATE internos ejecutado' as resultado;

COMMIT;

-- ====================================
-- 4. VERIFICAR LIMPIEZA
-- ====================================

SELECT '=== VERIFICANDO LIMPIEZA ===' as info;

-- Verificar que están vacías
SELECT 
    'Registros después de limpiar' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes_internos) as historial_internos;

-- Verificar que no hay registros
SELECT 
    'Verificación de registros' as info,
    CASE 
        WHEN (SELECT COUNT(*) FROM historial_participacion_participantes) = 0 THEN '✅ Participantes vacío'
        ELSE '❌ Participantes NO vacío'
    END as estado_participantes,
    CASE 
        WHEN (SELECT COUNT(*) FROM historial_participacion_empresas) = 0 THEN '✅ Empresas vacío'
        ELSE '❌ Empresas NO vacío'
    END as estado_empresas,
    CASE 
        WHEN (SELECT COUNT(*) FROM historial_participacion_participantes_internos) = 0 THEN '✅ Internos vacío'
        ELSE '❌ Internos NO vacío'
    END as estado_internos;

-- ====================================
-- 5. VERIFICAR ESTADÍSTICAS
-- ====================================

SELECT '=== VERIFICANDO ESTADÍSTICAS ===' as info;

-- Ver estadísticas de participantes
SELECT 
    'Estadísticas participantes' as info,
    participante_id,
    participante,
    total_participaciones,
    participaciones_finalizadas
FROM vista_estadisticas_participantes
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0
LIMIT 5;

-- Ver estadísticas de empresas
SELECT 
    'Estadísticas empresas' as info,
    empresa_id,
    empresa,
    total_participaciones,
    participaciones_finalizadas
FROM vista_estadisticas_empresas
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0
LIMIT 5;

-- ====================================
-- 6. FORZAR ACTUALIZACIÓN DE VISTAS
-- ====================================

SELECT '=== FORZANDO ACTUALIZACIÓN DE VISTAS ===' as info;

-- Intentar refrescar las vistas
-- Nota: En PostgreSQL, las vistas se actualizan automáticamente
-- pero podemos verificar la definición

SELECT 
    'Definición de vista participantes' as info,
    view_definition
FROM information_schema.views
WHERE table_name = 'vista_estadisticas_participantes';

-- ====================================
-- 7. VERIFICAR RECLUTAMIENTOS
-- ====================================

SELECT '=== VERIFICANDO RECLUTAMIENTOS ===' as info;

-- Ver reclutamientos actuales
SELECT 
    'Reclutamientos actuales' as info,
    COUNT(*) as total_reclutamientos
FROM reclutamientos;

-- Ver reclutamientos finalizados
SELECT 
    'Reclutamientos finalizados' as info,
    COUNT(*) as total_finalizados
FROM reclutamientos 
WHERE participantes_id IS NOT NULL
AND estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 8. DIAGNÓSTICO SI NO FUNCIONA
-- ====================================

SELECT '=== DIAGNÓSTICO SI NO FUNCIONA ===' as info;

-- Si las estadísticas siguen mostrando datos, verificar de dónde vienen
SELECT 
    'Diagnóstico: Fuente de estadísticas' as info,
    'Las estadísticas pueden venir de:' as explicacion,
    '1. Cache de vistas' as opcion1,
    '2. Datos en otras tablas' as opcion2,
    '3. Definición incorrecta de vistas' as opcion3;

-- Verificar si hay datos en otras tablas relacionadas
SELECT 
    'Verificando otras tablas' as info,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL) as reclutamientos_con_participantes,
    (SELECT COUNT(*) FROM participantes) as total_participantes,
    (SELECT COUNT(*) FROM empresas) as total_empresas;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== LIMPIEZA AGRESIVA COMPLETADA ===' as info;
SELECT '✅ Script ejecutado con métodos agresivos' as mensaje;
SELECT '✅ Verifica los resultados arriba' as verificacion;
SELECT '⚠️ Si no funciona, puede ser un problema de permisos o cache' as nota; 