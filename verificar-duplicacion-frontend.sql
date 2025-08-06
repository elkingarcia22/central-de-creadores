-- ====================================
-- VERIFICAR DUPLICACIÓN EN FRONTEND
-- ====================================
-- Objetivo: Identificar por qué el frontend muestra duplicados
-- cuando la base de datos tiene datos correctos

-- ====================================
-- 1. VERIFICAR DATOS EXACTOS EN HISTORIAL
-- ====================================

SELECT 
    '=== DATOS EXACTOS EN HISTORIAL ===' as info;

-- Verificar historial de empresas
SELECT 
    'historial_participacion_empresas' as tabla,
    COUNT(*) as total_registros,
    COUNT(DISTINCT empresa_id) as empresas_unicas,
    COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos
FROM historial_participacion_empresas;

-- Verificar historial de participantes
SELECT 
    'historial_participacion_participantes' as tabla,
    COUNT(*) as total_registros,
    COUNT(DISTINCT participante_id) as participantes_unicos,
    COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos
FROM historial_participacion_participantes;

-- ====================================
-- 2. VERIFICAR DATOS ESPECÍFICOS DE LA EMPRESA
-- ====================================

SELECT 
    '=== DATOS ESPECÍFICOS DE LA EMPRESA ===' as info;

SELECT 
    e.id,
    e.nombre as empresa,
    COUNT(he.*) as total_en_historial,
    COUNT(DISTINCT he.reclutamiento_id) as reclutamientos_unicos
FROM empresas e
LEFT JOIN historial_participacion_empresas he ON e.id = he.empresa_id
WHERE e.id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042')
GROUP BY e.id, e.nombre;

-- ====================================
-- 3. VERIFICAR DATOS ESPECÍFICOS DEL PARTICIPANTE
-- ====================================

SELECT 
    '=== DATOS ESPECÍFICOS DEL PARTICIPANTE ===' as info;

SELECT 
    p.id,
    p.nombre as participante,
    COUNT(hp.*) as total_en_historial,
    COUNT(DISTINCT hp.reclutamiento_id) as reclutamientos_unicos
FROM participantes p
LEFT JOIN historial_participacion_participantes hp ON p.id = hp.participante_id
WHERE p.id = '9155b800-f786-46d7-9294-bb385434d042'
GROUP BY p.id, p.nombre;

-- ====================================
-- 4. VERIFICAR RECLUTAMIENTOS FINALIZADOS
-- ====================================

SELECT 
    '=== RECLUTAMIENTOS FINALIZADOS ===' as info;

SELECT 
    COUNT(*) as total_reclutamientos,
    COUNT(CASE WHEN participantes_id IS NOT NULL THEN 1 END) as con_participante,
    COUNT(CASE WHEN estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN 1 END) as finalizados
FROM reclutamientos;

-- ====================================
-- 5. VERIFICAR ESTADÍSTICAS DESDE RECLUTAMIENTOS
-- ====================================

SELECT 
    '=== ESTADÍSTICAS DESDE RECLUTAMIENTOS ===' as info;

SELECT 
    e.id,
    e.nombre as empresa,
    COUNT(r.*) as total_participaciones,
    COUNT(CASE WHEN eac.nombre = 'Finalizado' THEN 1 END) as participaciones_finalizadas
FROM empresas e
LEFT JOIN participantes p ON e.id = p.empresa_id
LEFT JOIN reclutamientos r ON p.id = r.participantes_id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE e.id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042')
GROUP BY e.id, e.nombre;

-- ====================================
-- 6. VERIFICAR ESTADÍSTICAS DESDE HISTORIAL
-- ====================================

SELECT 
    '=== ESTADÍSTICAS DESDE HISTORIAL ===' as info;

SELECT 
    e.id,
    e.nombre as empresa,
    COUNT(he.*) as total_participaciones,
    COUNT(CASE WHEN he.estado_sesion = 'completada' THEN 1 END) as participaciones_finalizadas
FROM empresas e
LEFT JOIN historial_participacion_empresas he ON e.id = he.empresa_id
WHERE e.id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042')
GROUP BY e.id, e.nombre;

-- ====================================
-- 7. VERIFICAR VISTAS DE ESTADÍSTICAS
-- ====================================

SELECT 
    '=== VISTAS DE ESTADÍSTICAS ===' as info;

-- Verificar si existen vistas
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%estadisticas%'
ORDER BY table_name;

-- ====================================
-- 8. DIAGNÓSTICO DEL PROBLEMA
-- ====================================

SELECT 
    '=== DIAGNÓSTICO ===' as info;

SELECT 
    'Si las estadísticas desde reclutamientos muestran números altos' as observacion_1,
    'Y las estadísticas desde historial muestran números bajos' as observacion_2,
    'Entonces el frontend está consultando la fuente incorrecta' as conclusion_1,
    'O hay cache en el frontend' as conclusion_2;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== VERIFICACIÓN COMPLETADA ===' as info;
SELECT '✅ Compara las estadísticas desde reclutamientos vs historial' as mensaje;
SELECT '✅ Si son diferentes, el frontend usa la fuente incorrecta' as mensaje; 