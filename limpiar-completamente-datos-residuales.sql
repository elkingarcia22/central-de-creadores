-- ====================================
-- LIMPIAR COMPLETAMENTE DATOS RESIDUALES
-- ====================================
-- Problema: Estadísticas muestran datos antiguos
-- Solución: Limpiar completamente todas las tablas de historial
-- Objetivo: Empezar desde cero con datos limpios

-- ====================================
-- 1. LIMPIAR TODAS LAS TABLAS DE HISTORIAL
-- ====================================

SELECT '=== LIMPIANDO TODAS LAS TABLAS DE HISTORIAL ===' as info;

-- Limpiar historial de participantes
DELETE FROM historial_participacion_participantes;
SELECT 'Historial de participantes limpiado' as resultado;

-- Limpiar historial de empresas
DELETE FROM historial_participacion_empresas;
SELECT 'Historial de empresas limpiado' as resultado;

-- Limpiar historial de participantes internos
DELETE FROM historial_participacion_participantes_internos;
SELECT 'Historial de participantes internos limpiado' as resultado;

-- ====================================
-- 2. VERIFICAR QUE ESTÁN VACÍAS
-- ====================================

SELECT '=== VERIFICANDO TABLAS VACÍAS ===' as info;

SELECT 
    'Conteo de registros en historiales' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes_internos) as historial_internos;

-- ====================================
-- 3. VERIFICAR RECLUTAMIENTOS ACTUALES
-- ====================================

SELECT '=== VERIFICANDO RECLUTAMIENTOS ACTUALES ===' as info;

-- Ver todos los reclutamientos
SELECT 
    'Todos los reclutamientos' as info,
    COUNT(*) as total_reclutamientos
FROM reclutamientos;

-- Ver reclutamientos con participantes
SELECT 
    'Reclutamientos con participantes' as info,
    COUNT(*) as total_con_participantes
FROM reclutamientos 
WHERE participantes_id IS NOT NULL;

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
-- 4. VERIFICAR ESTADÍSTICAS ACTUALES
-- ====================================

SELECT '=== VERIFICANDO ESTADÍSTICAS ACTUALES ===' as info;

-- Ver estadísticas de participantes (deberían estar en 0)
SELECT 
    'Estadísticas de participantes (deberían estar en 0)' as info,
    COUNT(*) as total_participantes_con_estadisticas
FROM vista_estadisticas_participantes
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0;

-- Ver estadísticas de empresas (deberían estar en 0)
SELECT 
    'Estadísticas de empresas (deberían estar en 0)' as info,
    COUNT(*) as total_empresas_con_estadisticas
FROM vista_estadisticas_empresas
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0;

-- ====================================
-- 5. VERIFICAR VISTAS
-- ====================================

SELECT '=== VERIFICANDO VISTAS ===' as info;

-- Ver contenido de vista de participantes
SELECT 
    'Vista de participantes (primeros 5)' as info,
    participante_id,
    participante,
    total_participaciones,
    participaciones_finalizadas
FROM vista_estadisticas_participantes
LIMIT 5;

-- Ver contenido de vista de empresas
SELECT 
    'Vista de empresas (primeros 5)' as info,
    empresa_id,
    empresa,
    total_participaciones,
    participaciones_finalizadas
FROM vista_estadisticas_empresas
LIMIT 5;

-- ====================================
-- 6. FORZAR ACTUALIZACIÓN DE VISTAS
-- ====================================

SELECT '=== FORZANDO ACTUALIZACIÓN DE VISTAS ===' as info;

-- Refrescar las vistas (si es necesario)
-- Nota: Las vistas se actualizan automáticamente, pero podemos verificar

-- ====================================
-- 7. VERIFICAR ESTADO FINAL
-- ====================================

SELECT '=== ESTADO FINAL ===' as info;

-- Verificar que todo esté limpio
SELECT 
    'Estado final de limpieza' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes_internos) as historial_internos,
    (SELECT COUNT(*) FROM vista_estadisticas_participantes WHERE total_participaciones > 0) as participantes_con_estadisticas,
    (SELECT COUNT(*) FROM vista_estadisticas_empresas WHERE total_participaciones > 0) as empresas_con_estadisticas;

-- ====================================
-- 8. INSTRUCCIONES PARA PRUEBA
-- ====================================

SELECT '=== INSTRUCCIONES PARA PRUEBA ===' as info;
SELECT '1. Todas las tablas de historial están vacías' as paso1;
SELECT '2. Las estadísticas deberían mostrar 0' as paso2;
SELECT '3. Prueba crear un nuevo reclutamiento' as paso3;
SELECT '4. Cambia el estado a Finalizado' as paso4;
SELECT '5. Verifica que las estadísticas se actualicen correctamente' as paso5;

-- ====================================
-- 9. COMANDOS DE VERIFICACIÓN
-- ====================================

SELECT '=== COMANDOS DE VERIFICACIÓN ===' as info;
SELECT 'Para ver historial: SELECT * FROM historial_participacion_participantes;' as comando1;
SELECT 'Para ver estadísticas: SELECT * FROM vista_estadisticas_participantes;' as comando2;
SELECT 'Para ver empresas: SELECT * FROM vista_estadisticas_empresas;' as comando3;
SELECT 'Para ver reclutamientos: SELECT * FROM reclutamientos;' as comando4;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== LIMPIEZA COMPLETA REALIZADA ===' as info;
SELECT '✅ Todas las tablas de historial están vacías' as mensaje;
SELECT '✅ Las estadísticas deberían mostrar 0' as explicacion;
SELECT '✅ Ahora puedes empezar desde cero' as instruccion;
SELECT '⚠️ Prueba crear un nuevo reclutamiento para verificar' as nota; 