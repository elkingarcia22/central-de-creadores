-- ====================================
-- CREAR VISTAS CORRECTAS SEGÚN ESTRUCTURA REAL
-- ====================================
-- Problema: Las vistas usaban columnas que no existen
-- Solución: Crear vistas según la estructura real de las tablas
-- Objetivo: Vistas que funcionen con la estructura correcta

-- ====================================
-- 1. LIMPIAR RECLUTAMIENTOS
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
-- 2. LIMPIAR HISTORIALES
-- ====================================

SELECT '=== LIMPIANDO HISTORIALES ===' as info;

-- Limpiar historiales
DELETE FROM historial_participacion_participantes;
DELETE FROM historial_participacion_empresas;
DELETE FROM historial_participacion_participantes_internos;

SELECT 'Historiales limpiados' as resultado;

-- Verificar que están vacíos
SELECT 
    'Verificación historiales' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes_internos) as historial_internos;

-- ====================================
-- 3. ELIMINAR VISTAS EXISTENTES
-- ====================================

SELECT '=== ELIMINANDO VISTAS EXISTENTES ===' as info;

DROP VIEW IF EXISTS vista_estadisticas_participantes;
DROP VIEW IF EXISTS vista_estadisticas_empresas;
DROP VIEW IF EXISTS vista_estadisticas_participante_interno;

SELECT 'Vistas eliminadas' as resultado;

-- ====================================
-- 4. CREAR VISTA PARA PARTICIPANTES EXTERNOS
-- ====================================

SELECT '=== CREANDO VISTA PARTICIPANTES EXTERNOS ===' as info;

-- Vista para participantes externos (usando historial_participacion_participantes)
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

SELECT 'Vista participantes externos creada' as resultado;

-- ====================================
-- 5. CREAR VISTA PARA PARTICIPANTES INTERNOS
-- ====================================

SELECT '=== CREANDO VISTA PARTICIPANTES INTERNOS ===' as info;

-- Vista para participantes internos (usando historial_participacion_participantes_internos)
CREATE OR REPLACE VIEW vista_estadisticas_participante_interno AS
SELECT 
    pi.id as participante_interno_id,
    pi.nombre as participante_interno,
    COALESCE(COUNT(hpi.investigacion_id), 0) as total_participaciones,
    COALESCE(COUNT(CASE WHEN hpi.estado_sesion = 'completada' THEN 1 END), 0) as participaciones_finalizadas
FROM participantes_internos pi
LEFT JOIN historial_participacion_participantes_internos hpi ON pi.id = hpi.participante_interno_id
GROUP BY pi.id, pi.nombre
HAVING COUNT(hpi.investigacion_id) > 0 OR COUNT(CASE WHEN hpi.estado_sesion = 'completada' THEN 1 END) > 0
ORDER BY pi.nombre;

SELECT 'Vista participantes internos creada' as resultado;

-- ====================================
-- 6. CREAR VISTA PARA EMPRESAS
-- ====================================

SELECT '=== CREANDO VISTA EMPRESAS ===' as info;

-- Vista para empresas (usando historial_participacion_empresas)
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

SELECT 'Vista empresas creada' as resultado;

-- ====================================
-- 7. VERIFICAR VISTAS CREADAS
-- ====================================

SELECT '=== VERIFICANDO VISTAS CREADAS ===' as info;

-- Verificar que las vistas se crearon
SELECT 
    'Vistas creadas' as info,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name IN (
    'vista_estadisticas_participantes',
    'vista_estadisticas_empresas',
    'vista_estadisticas_participante_interno'
)
ORDER BY table_name;

-- ====================================
-- 8. VERIFICAR ESTADÍSTICAS LIMPIAS
-- ====================================

SELECT '=== VERIFICANDO ESTADÍSTICAS LIMPIAS ===' as info;

-- Ver estadísticas de participantes externos (deberían estar en 0)
SELECT 
    'Estadísticas participantes externos (deberían estar en 0)' as info,
    COUNT(*) as total_participantes_con_estadisticas
FROM vista_estadisticas_participantes
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0;

-- Ver estadísticas de participantes internos (deberían estar en 0)
SELECT 
    'Estadísticas participantes internos (deberían estar en 0)' as info,
    COUNT(*) as total_internos_con_estadisticas
FROM vista_estadisticas_participante_interno
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0;

-- Ver estadísticas de empresas (deberían estar en 0)
SELECT 
    'Estadísticas empresas (deberían estar en 0)' as info,
    COUNT(*) as total_empresas_con_estadisticas
FROM vista_estadisticas_empresas
WHERE total_participaciones > 0 OR participaciones_finalizadas > 0;

-- ====================================
-- 9. VERIFICAR ESTADO FINAL
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
    (SELECT COUNT(*) FROM vista_estadisticas_participante_interno WHERE total_participaciones > 0) as internos_con_estadisticas,
    (SELECT COUNT(*) FROM vista_estadisticas_empresas WHERE total_participaciones > 0) as empresas_con_estadisticas;

-- ====================================
-- 10. INSTRUCCIONES PARA PRUEBA
-- ====================================

SELECT '=== INSTRUCCIONES PARA PRUEBA ===' as info;
SELECT '1. Todas las tablas están limpias' as paso1;
SELECT '2. Las vistas están creadas con la estructura correcta' as paso2;
SELECT '3. Las estadísticas deberían mostrar 0' as paso3;
SELECT '4. Prueba crear un nuevo reclutamiento' as paso4;
SELECT '5. Cambia el estado a Finalizado' as paso5;
SELECT '6. Verifica que las estadísticas se actualicen correctamente' as paso6;

-- ====================================
-- 11. COMANDOS DE VERIFICACIÓN
-- ====================================

SELECT '=== COMANDOS DE VERIFICACIÓN ===' as info;
SELECT 'Para ver reclutamientos: SELECT * FROM reclutamientos;' as comando1;
SELECT 'Para ver historial externos: SELECT * FROM historial_participacion_participantes;' as comando2;
SELECT 'Para ver historial internos: SELECT * FROM historial_participacion_participantes_internos;' as comando3;
SELECT 'Para ver estadísticas externos: SELECT * FROM vista_estadisticas_participantes;' as comando4;
SELECT 'Para ver estadísticas internos: SELECT * FROM vista_estadisticas_participante_interno;' as comando5;
SELECT 'Para ver estadísticas empresas: SELECT * FROM vista_estadisticas_empresas;' as comando6;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== VISTAS CREADAS CORRECTAMENTE ===' as info;
SELECT '✅ Reclutamientos limpiados' as mensaje1;
SELECT '✅ Historiales limpiados' as mensaje2;
SELECT '✅ Vistas creadas con estructura correcta' as mensaje3;
SELECT '✅ Estadísticas deberían estar en 0' as mensaje4;
SELECT '✅ Sistema listo para empezar desde cero' as mensaje5;
SELECT '⚠️ Prueba crear un nuevo reclutamiento para verificar' as nota; 