-- ====================================
-- LIMPIAR SOLO PARTICIPANTES EXTERNOS
-- ====================================
-- Problema: Solo historial_participacion_participantes tiene datos residuales
-- Solución: Limpiar específicamente esa tabla
-- Objetivo: Eliminar datos residuales de participantes externos

-- ====================================
-- 1. VERIFICAR ESTADO ACTUAL
-- ====================================

SELECT '=== ESTADO ACTUAL ===' as info;

-- Verificar datos actuales en historial de participantes
SELECT 
    'Datos actuales en historial participantes' as info,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN estado_sesion = 'completada' THEN 1 END) as completadas
FROM historial_participacion_participantes;

-- Verificar algunos registros para confirmar
SELECT 
    'Primeros 5 registros en historial participantes' as info,
    id,
    participante_id,
    estado_sesion,
    fecha_participacion
FROM historial_participacion_participantes
LIMIT 5;

-- ====================================
-- 2. LIMPIAR HISTORIAL DE PARTICIPANTES
-- ====================================

SELECT '=== LIMPIANDO HISTORIAL DE PARTICIPANTES ===' as info;

-- Limpiar historial de participantes externos
DELETE FROM historial_participacion_participantes;
SELECT 'Historial de participantes externos limpiado' as resultado;

-- Verificar que está vacío
SELECT 
    'Verificación después de limpiar' as info,
    COUNT(*) as total_registros
FROM historial_participacion_participantes;

-- ====================================
-- 3. VERIFICAR OTRAS TABLAS
-- ====================================

SELECT '=== VERIFICAR OTRAS TABLAS ===' as info;

-- Verificar que las otras tablas siguen limpias
SELECT 
    'Estado de todas las tablas de historial' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes_internos) as historial_internos;

-- ====================================
-- 4. VERIFICAR RECLUTAMIENTOS
-- ====================================

SELECT '=== VERIFICAR RECLUTAMIENTOS ===' as info;

-- Verificar que reclutamientos esté limpio
SELECT 
    'Reclutamientos actuales' as info,
    COUNT(*) as total_reclutamientos
FROM reclutamientos;

-- ====================================
-- 5. SIMULAR APIS DEL FRONTEND
-- ====================================

SELECT '=== SIMULAR APIS DEL FRONTEND ===' as info;

-- Simular API de participantes (debería mostrar 0)
SELECT 
    'Simulación API participantes (primeros 3)' as info,
    p.id as participante_id,
    p.nombre as participante,
    COUNT(CASE WHEN h.estado_sesion = 'completada' THEN 1 END) as total_participaciones_completadas
FROM participantes p
LEFT JOIN historial_participacion_participantes h ON p.id = h.participante_id
GROUP BY p.id, p.nombre
HAVING COUNT(CASE WHEN h.estado_sesion = 'completada' THEN 1 END) > 0
ORDER BY p.nombre
LIMIT 3;

-- Simular API de empresas (debería mostrar 0)
SELECT 
    'Simulación API empresas (primeros 3)' as info,
    e.id as empresa_id,
    e.nombre as empresa,
    COUNT(CASE WHEN h.estado_sesion = 'completada' THEN 1 END) as total_participaciones_completadas
FROM empresas e
LEFT JOIN historial_participacion_empresas h ON e.id = h.empresa_id
GROUP BY e.id, e.nombre
HAVING COUNT(CASE WHEN h.estado_sesion = 'completada' THEN 1 END) > 0
ORDER BY e.nombre
LIMIT 3;

-- ====================================
-- 6. VERIFICAR ESTADÍSTICAS
-- ====================================

SELECT '=== VERIFICAR ESTADÍSTICAS ===' as info;

-- Verificar estadísticas de participantes (deberían estar en 0)
SELECT 
    'Estadísticas participantes externos (deberían estar en 0)' as info,
    COUNT(*) as total_participantes_con_estadisticas
FROM vista_estadisticas_participantes
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0;

-- Verificar estadísticas de empresas (deberían estar en 0)
SELECT 
    'Estadísticas empresas (deberían estar en 0)' as info,
    COUNT(*) as total_empresas_con_estadisticas
FROM vista_estadisticas_empresas
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0;

-- Verificar estadísticas de participantes internos (deberían estar en 0)
SELECT 
    'Estadísticas participantes internos (deberían estar en 0)' as info,
    COUNT(*) as total_internos_con_estadisticas
FROM vista_estadisticas_participante_interno
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0;

-- ====================================
-- 7. ESTADO FINAL
-- ====================================

SELECT '=== ESTADO FINAL ===' as info;

-- Verificar que todo esté limpio
SELECT 
    'Estado final de limpieza' as info,
    (SELECT COUNT(*) FROM reclutamientos) as reclutamientos,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes_internos) as historial_internos,
    (SELECT COUNT(*) FROM vista_estadisticas_participantes WHERE total_participaciones > 0) as participantes_con_estadisticas,
    (SELECT COUNT(*) FROM vista_estadisticas_empresas WHERE total_participaciones > 0) as empresas_con_estadisticas,
    (SELECT COUNT(*) FROM vista_estadisticas_participante_interno WHERE total_participaciones > 0) as internos_con_estadisticas;

-- ====================================
-- 8. INSTRUCCIONES PARA PRUEBA
-- ====================================

SELECT '=== INSTRUCCIONES PARA PRUEBA ===' as info;
SELECT '1. Historial de participantes externos limpiado' as paso1;
SELECT '2. Todas las estadísticas deberían mostrar 0' as paso2;
SELECT '3. Refresca la página del frontend (Ctrl+F5)' as paso3;
SELECT '4. Verifica que las estadísticas estén en 0' as paso4;
SELECT '5. Prueba crear un nuevo reclutamiento' as paso5;
SELECT '6. Cambia el estado a Finalizado' as paso6;
SELECT '7. Verifica que las estadísticas se actualicen correctamente' as paso7;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== LIMPIEZA COMPLETADA ===' as info;
SELECT '✅ Historial de participantes externos limpiado' as mensaje1;
SELECT '✅ Todas las estadísticas deberían estar en 0' as mensaje2;
SELECT '✅ Sistema listo para empezar desde cero' as mensaje3;
SELECT '⚠️ Refresca la página del frontend para ver los cambios' as nota; 