-- ====================================
-- LIMPIAR RECLUTAMIENTOS Y RECREAR VISTAS
-- ====================================
-- Problema: Las vistas usan reclutamientos directamente
-- Solución: Limpiar reclutamientos y recrear vistas para usar historial
-- Objetivo: Estadísticas limpias que usen historial

-- ====================================
-- 1. VERIFICAR ESTADO ACTUAL
-- ====================================

SELECT '=== ESTADO ACTUAL ===' as info;

-- Ver reclutamientos actuales
SELECT 
    'Reclutamientos actuales' as info,
    COUNT(*) as total_reclutamientos,
    COUNT(CASE WHEN participantes_id IS NOT NULL THEN 1 END) as con_participantes,
    COUNT(CASE WHEN estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN 1 END) as finalizados
FROM reclutamientos;

-- Ver historial actual
SELECT 
    'Historial actual' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- ====================================
-- 2. LIMPIAR RECLUTAMIENTOS
-- ====================================

SELECT '=== LIMPIANDO RECLUTAMIENTOS ===' as info;

-- Limpiar todos los reclutamientos
DELETE FROM reclutamientos;
SELECT 'Reclutamientos limpiados' as resultado;

-- Verificar que están vacíos
SELECT 
    'Verificación reclutamientos' as info,
    COUNT(*) as total_reclutamientos
FROM reclutamientos;

-- ====================================
-- 3. RECREAR VISTAS PARA USAR HISTORIAL
-- ====================================

SELECT '=== RECREANDO VISTAS ===' as info;

-- Eliminar vistas existentes
DROP VIEW IF EXISTS vista_estadisticas_participantes;
DROP VIEW IF EXISTS vista_estadisticas_empresas;
DROP VIEW IF EXISTS vista_estadisticas_participante_interno;

-- Crear nueva vista de participantes que use historial
CREATE OR REPLACE VIEW vista_estadisticas_participantes AS
SELECT 
    p.id as participante_id,
    p.nombre as participante,
    COALESCE(COUNT(hpp.reclutamiento_id), 0) as total_participaciones,
    COALESCE(COUNT(CASE WHEN hpp.estado_sesion = 'completada' THEN 1 END), 0) as participaciones_finalizadas
FROM participantes p
LEFT JOIN historial_participacion_participantes hpp ON p.id = hpp.participante_id
GROUP BY p.id, p.nombre
HAVING COUNT(hpp.reclutamiento_id) > 0 OR COUNT(CASE WHEN hpp.estado_sesion = 'completada' THEN 1 END) > 0
ORDER BY p.nombre;

SELECT 'Vista participantes recreada para usar historial' as resultado;

-- Crear nueva vista de empresas que use historial
CREATE OR REPLACE VIEW vista_estadisticas_empresas AS
SELECT 
    e.id as empresa_id,
    e.nombre as empresa,
    COALESCE(COUNT(DISTINCT hpe.reclutamiento_id), 0) as total_participaciones,
    COALESCE(COUNT(DISTINCT CASE WHEN hpe.estado_sesion = 'completada' THEN hpe.reclutamiento_id END), 0) as participaciones_finalizadas
FROM empresas e
LEFT JOIN historial_participacion_empresas hpe ON e.id = hpe.empresa_id
GROUP BY e.id, e.nombre
HAVING COUNT(DISTINCT hpe.reclutamiento_id) > 0 OR COUNT(DISTINCT CASE WHEN hpe.estado_sesion = 'completada' THEN hpe.reclutamiento_id END) > 0
ORDER BY e.nombre;

SELECT 'Vista empresas recreada para usar historial' as resultado;

-- Crear nueva vista de participantes internos que use historial
CREATE OR REPLACE VIEW vista_estadisticas_participante_interno AS
SELECT 
    pi.id as participante_interno_id,
    pi.nombre as participante_interno,
    COALESCE(COUNT(hpi.reclutamiento_id), 0) as total_participaciones,
    COALESCE(COUNT(CASE WHEN hpi.estado_sesion = 'completada' THEN 1 END), 0) as participaciones_finalizadas
FROM participantes_internos pi
LEFT JOIN historial_participacion_participantes_internos hpi ON pi.id = hpi.participante_interno_id
GROUP BY pi.id, pi.nombre
HAVING COUNT(hpi.reclutamiento_id) > 0 OR COUNT(CASE WHEN hpi.estado_sesion = 'completada' THEN 1 END) > 0
ORDER BY pi.nombre;

SELECT 'Vista participantes internos recreada para usar historial' as resultado;

-- ====================================
-- 4. VERIFICAR VISTAS RECREADAS
-- ====================================

SELECT '=== VERIFICANDO VISTAS RECREADAS ===' as info;

-- Verificar definición de vista de participantes
SELECT 
    'Definición vista participantes' as info,
    view_definition
FROM information_schema.views
WHERE table_name = 'vista_estadisticas_participantes';

-- Verificar definición de vista de empresas
SELECT 
    'Definición vista empresas' as info,
    view_definition
FROM information_schema.views
WHERE table_name = 'vista_estadisticas_empresas';

-- ====================================
-- 5. VERIFICAR ESTADÍSTICAS LIMPIAS
-- ====================================

SELECT '=== VERIFICANDO ESTADÍSTICAS LIMPIAS ===' as info;

-- Ver estadísticas de participantes (deberían estar en 0)
SELECT 
    'Estadísticas participantes (deberían estar en 0)' as info,
    COUNT(*) as total_participantes_con_estadisticas
FROM vista_estadisticas_participantes
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0;

-- Ver estadísticas de empresas (deberían estar en 0)
SELECT 
    'Estadísticas empresas (deberían estar en 0)' as info,
    COUNT(*) as total_empresas_con_estadisticas
FROM vista_estadisticas_empresas
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0;

-- Ver estadísticas de participantes internos (deberían estar en 0)
SELECT 
    'Estadísticas participantes internos (deberían estar en 0)' as info,
    COUNT(*) as total_internos_con_estadisticas
FROM vista_estadisticas_participante_interno
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0;

-- ====================================
-- 6. VERIFICAR ESTADO FINAL
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
-- 7. INSTRUCCIONES PARA PRUEBA
-- ====================================

SELECT '=== INSTRUCCIONES PARA PRUEBA ===' as info;
SELECT '1. Todas las tablas están limpias' as paso1;
SELECT '2. Las vistas ahora usan historial' as paso2;
SELECT '3. Las estadísticas deberían mostrar 0' as paso3;
SELECT '4. Prueba crear un nuevo reclutamiento' as paso4;
SELECT '5. Cambia el estado a Finalizado' as paso5;
SELECT '6. Verifica que las estadísticas se actualicen correctamente' as paso6;

-- ====================================
-- 8. COMANDOS DE VERIFICACIÓN
-- ====================================

SELECT '=== COMANDOS DE VERIFICACIÓN ===' as info;
SELECT 'Para ver reclutamientos: SELECT * FROM reclutamientos;' as comando1;
SELECT 'Para ver historial: SELECT * FROM historial_participacion_participantes;' as comando2;
SELECT 'Para ver estadísticas: SELECT * FROM vista_estadisticas_participantes;' as comando3;
SELECT 'Para ver empresas: SELECT * FROM vista_estadisticas_empresas;' as comando4;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== LIMPIEZA Y RECREACIÓN COMPLETADA ===' as info;
SELECT '✅ Reclutamientos limpiados' as mensaje1;
SELECT '✅ Vistas recreadas para usar historial' as mensaje2;
SELECT '✅ Estadísticas deberían estar en 0' as mensaje3;
SELECT '✅ Ahora puedes empezar desde cero con datos limpios' as mensaje4;
SELECT '⚠️ Prueba crear un nuevo reclutamiento para verificar' as nota; 