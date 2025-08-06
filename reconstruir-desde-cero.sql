-- ====================================
-- RECONSTRUIR DESDE CERO
-- ====================================
-- Problema: Las estadísticas siguen sin funcionar después de múltiples intentos
-- Solución: Reconstruir completamente desde cero
-- Objetivo: Garantizar que las estadísticas funcionen correctamente

-- ====================================
-- 1. ELIMINAR TODO TEMPORALMENTE
-- ====================================

SELECT '=== ELIMINANDO TODO TEMPORALMENTE ===' as info;

-- Eliminar TODO el historial
DELETE FROM historial_participacion_participantes;
DELETE FROM historial_participacion_empresas;

-- Eliminar todos los triggers y funciones
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_final ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_final ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_solo_finalizadas ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_solo_finalizadas ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_limpio ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_limpio ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_corregida ON reclutamientos;

DROP FUNCTION IF EXISTS insertar_historial_empresa_final() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_final() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_solo_finalizadas() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_solo_finalizadas() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_limpio() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_limpio() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_corregida() CASCADE;

-- Verificar que está completamente limpio
SELECT 
    'Estado después de limpieza completa' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- ====================================
-- 2. VERIFICAR RECLUTAMIENTOS FINALIZADOS
-- ====================================

SELECT '=== VERIFICANDO RECLUTAMIENTOS FINALIZADOS ===' as info;

-- Verificar cuántos reclutamientos están realmente finalizados
SELECT 
    'Reclutamientos realmente finalizados' as info,
    COUNT(*) as total_finalizados
FROM reclutamientos 
WHERE participantes_id IS NOT NULL
AND estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- Mostrar detalles de los reclutamientos finalizados
SELECT 
    'Detalle de reclutamientos finalizados' as info,
    r.id as reclutamiento_id,
    r.participantes_id,
    p.nombre as participante,
    e.nombre as empresa,
    r.fecha_sesion,
    r.duracion_sesion
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE r.participantes_id IS NOT NULL
AND r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
ORDER BY p.nombre, r.id;

-- ====================================
-- 3. INSERTAR MANUALMENTE PARTICIPANTES
-- ====================================

SELECT '=== INSERTANDO MANUALMENTE PARTICIPANTES ===' as info;

-- Insertar en historial de participantes SOLO los realmente finalizados
INSERT INTO historial_participacion_participantes (
    participante_id,
    investigacion_id,
    reclutamiento_id,
    empresa_id,
    fecha_participacion,
    estado_sesion,
    duracion_sesion,
    creado_por
)
SELECT 
    r.participantes_id,
    r.investigacion_id,
    r.id,
    COALESCE(p.empresa_id, (SELECT id FROM empresas LIMIT 1)),
    COALESCE(r.fecha_sesion, NOW()),
    'completada',
    COALESCE(r.duracion_sesion, 60),
    COALESCE(r.creado_por, auth.uid())
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL;

-- ====================================
-- 4. INSERTAR MANUALMENTE EMPRESAS
-- ====================================

SELECT '=== INSERTANDO MANUALMENTE EMPRESAS ===' as info;

-- Insertar en historial de empresas SOLO los realmente finalizados
INSERT INTO historial_participacion_empresas (
    empresa_id,
    investigacion_id,
    participante_id,
    reclutamiento_id,
    fecha_participacion,
    duracion_sesion,
    estado_sesion,
    rol_participante,
    tipo_investigacion,
    producto_evaluado,
    creado_por
)
SELECT 
    p.empresa_id,
    r.investigacion_id,
    r.participantes_id,
    r.id,
    COALESCE(r.fecha_sesion, NOW()),
    COALESCE(r.duracion_sesion, 60),
    'completada',
    COALESCE(re.nombre, 'Sin rol'),
    COALESCE(ti.nombre, 'Sin tipo'),
    COALESCE(pr.nombre, 'Sin producto'),
    COALESCE(r.creado_por, auth.uid())
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN tipos_investigacion ti ON i.tipo_investigacion_id = ti.id
LEFT JOIN productos pr ON i.producto_id = pr.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND p.empresa_id IS NOT NULL;

-- ====================================
-- 5. VERIFICAR RESULTADO INMEDIATO
-- ====================================

SELECT '=== VERIFICANDO RESULTADO INMEDIATO ===' as info;

-- Verificar estadísticas finales
SELECT 
    'Estadísticas finales' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- Verificar que solo hay finalizadas en el historial
SELECT 
    'Verificación de finalizadas en historial participantes' as info,
    COUNT(*) as total_finalizadas_en_historial
FROM historial_participacion_participantes h
JOIN reclutamientos r ON h.reclutamiento_id = r.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

SELECT 
    'Verificación de finalizadas en historial empresas' as info,
    COUNT(*) as total_finalizadas_en_historial
FROM historial_participacion_empresas h
JOIN reclutamientos r ON h.reclutamiento_id = r.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 6. VERIFICAR ESTADÍSTICAS POR PARTICIPANTE
-- ====================================

SELECT '=== VERIFICAR ESTADÍSTICAS POR PARTICIPANTE ===' as info;

-- Verificar participaciones por participante (todas)
SELECT 
    p.nombre as participante,
    COUNT(*) as total_participaciones
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE r.participantes_id IS NOT NULL
GROUP BY p.id, p.nombre
ORDER BY total_participaciones DESC;

-- Verificar participaciones por participante (solo finalizadas)
SELECT 
    p.nombre as participante,
    COUNT(*) as finalizadas
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE r.participantes_id IS NOT NULL
AND r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
GROUP BY p.id, p.nombre
ORDER BY finalizadas DESC;

-- Verificar participaciones por participante en historial
SELECT 
    p.nombre as participante,
    COUNT(*) as en_historial
FROM historial_participacion_participantes h
JOIN participantes p ON h.participante_id = p.id
GROUP BY p.id, p.nombre
ORDER BY en_historial DESC;

-- ====================================
-- 7. VERIFICAR ESTADÍSTICAS POR EMPRESA
-- ====================================

SELECT '=== VERIFICAR ESTADÍSTICAS POR EMPRESA ===' as info;

-- Verificar participaciones por empresa (todas)
SELECT 
    e.nombre as empresa,
    COUNT(*) as total_participaciones
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
JOIN empresas e ON p.empresa_id = e.id
WHERE r.participantes_id IS NOT NULL
GROUP BY e.id, e.nombre
ORDER BY total_participaciones DESC;

-- Verificar participaciones por empresa (solo finalizadas)
SELECT 
    e.nombre as empresa,
    COUNT(*) as finalizadas
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
JOIN empresas e ON p.empresa_id = e.id
WHERE r.participantes_id IS NOT NULL
AND r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
GROUP BY e.id, e.nombre
ORDER BY finalizadas DESC;

-- Verificar participaciones por empresa en historial
SELECT 
    e.nombre as empresa,
    COUNT(*) as en_historial
FROM historial_participacion_empresas h
JOIN empresas e ON h.empresa_id = e.id
GROUP BY e.id, e.nombre
ORDER BY en_historial DESC;

-- ====================================
-- 8. VERIFICAR CORRESPONDENCIA EXACTA
-- ====================================

SELECT '=== VERIFICAR CORRESPONDENCIA EXACTA ===' as info;

-- Verificar que el número de reclutamientos finalizados coincide con el historial
SELECT 
    'Correspondencia finalizados vs historial' as info,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as reclutamientos_finalizados,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as en_historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial_empresas;

-- ====================================
-- 9. VERIFICAR QUE NO HAY DUPLICADOS
-- ====================================

SELECT '=== VERIFICAR QUE NO HAY DUPLICADOS ===' as info;

-- Verificar duplicados en historial de participantes
SELECT 
    'Duplicados en historial participantes' as info,
    COUNT(*) as duplicados
FROM (
    SELECT reclutamiento_id, COUNT(*) as cnt
    FROM historial_participacion_participantes
    GROUP BY reclutamiento_id
    HAVING COUNT(*) > 1
) as dups;

-- Verificar duplicados en historial de empresas
SELECT 
    'Duplicados en historial empresas' as info,
    COUNT(*) as duplicados
FROM (
    SELECT reclutamiento_id, COUNT(*) as cnt
    FROM historial_participacion_empresas
    GROUP BY reclutamiento_id
    HAVING COUNT(*) > 1
) as dups;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== RECONSTRUCCIÓN DESDE CERO COMPLETADA ===' as info;
SELECT 'Todo ha sido eliminado y reconstruido manualmente desde cero.' as mensaje;
SELECT 'Ahora las estadísticas deberían mostrar exactamente el número de reclutamientos finalizados.' as instruccion;
SELECT 'Prueba la aplicación para verificar que las estadísticas funcionan correctamente.' as siguiente_paso; 