-- ====================================
-- FORZAR CORRECCIÓN DE EMPRESAS
-- ====================================
-- Problema: Las estadísticas de empresas siguen sin funcionar
-- Solución: Forzar la corrección de manera más directa y agresiva
-- Objetivo: Garantizar que las estadísticas de empresas funcionen

-- ====================================
-- 1. LIMPIAR COMPLETAMENTE HISTORIAL DE EMPRESAS
-- ====================================

SELECT '=== LIMPIANDO COMPLETAMENTE HISTORIAL DE EMPRESAS ===' as info;

-- Eliminar TODO el historial de empresas
DELETE FROM historial_participacion_empresas;

-- Verificar que está completamente limpio
SELECT 
    'Historial empresas después de limpieza completa' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_empresas;

-- ====================================
-- 2. VERIFICAR RECLUTAMIENTOS FINALIZADOS POR EMPRESA
-- ====================================

SELECT '=== VERIFICANDO RECLUTAMIENTOS FINALIZADOS POR EMPRESA ===' as info;

-- Verificar cuántos reclutamientos están finalizados por empresa
SELECT 
    e.nombre as empresa,
    e.id as empresa_id,
    COUNT(r.id) as finalizados
FROM empresas e
LEFT JOIN participantes p ON e.id = p.empresa_id
LEFT JOIN reclutamientos r ON p.id = r.participantes_id
WHERE r.id IS NOT NULL
AND r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
GROUP BY e.id, e.nombre
ORDER BY finalizados DESC;

-- Mostrar detalles de los reclutamientos finalizados por empresa
SELECT 
    'Detalle de reclutamientos finalizados por empresa' as info,
    r.id as reclutamiento_id,
    r.participantes_id,
    p.nombre as participante,
    e.nombre as empresa,
    e.id as empresa_id,
    r.fecha_sesion,
    r.duracion_sesion
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
JOIN empresas e ON p.empresa_id = e.id
WHERE r.participantes_id IS NOT NULL
AND r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
ORDER BY e.nombre, p.nombre, r.id;

-- ====================================
-- 3. INSERTAR MANUALMENTE SOLO LOS FINALIZADOS
-- ====================================

SELECT '=== INSERTANDO MANUALMENTE SOLO LOS FINALIZADOS ===' as info;

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
-- 4. VERIFICAR RESULTADO INMEDIATO
-- ====================================

SELECT '=== VERIFICANDO RESULTADO INMEDIATO ===' as info;

-- Verificar historial después de inserción
SELECT 
    'Historial empresas después de inserción' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_empresas;

-- Verificar que solo hay finalizadas en el historial
SELECT 
    'Verificación de finalizadas en historial empresas' as info,
    COUNT(*) as total_finalizadas_en_historial
FROM historial_participacion_empresas h
JOIN reclutamientos r ON h.reclutamiento_id = r.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 5. VERIFICAR ESTADÍSTICAS POR EMPRESA
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
-- 6. VERIFICAR CORRESPONDENCIA EXACTA
-- ====================================

SELECT '=== VERIFICAR CORRESPONDENCIA EXACTA ===' as info;

-- Verificar que el número de reclutamientos finalizados coincide con el historial
SELECT 
    'Correspondencia finalizados vs historial empresas' as info,
    (SELECT COUNT(*) FROM reclutamientos r JOIN participantes p ON r.participantes_id = p.id WHERE r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as reclutamientos_finalizados,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial_empresas;

-- ====================================
-- 7. VERIFICAR QUE NO HAY DUPLICADOS
-- ====================================

SELECT '=== VERIFICAR QUE NO HAY DUPLICADOS ===' as info;

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

-- Verificar duplicados por empresa
SELECT 
    e.nombre as empresa,
    h.reclutamiento_id,
    COUNT(*) as duplicados
FROM historial_participacion_empresas h
JOIN empresas e ON h.empresa_id = e.id
GROUP BY e.id, e.nombre, h.reclutamiento_id
HAVING COUNT(*) > 1
ORDER BY e.nombre, h.reclutamiento_id;

-- ====================================
-- 8. VERIFICAR ESTADO FINAL COMPLETO
-- ====================================

SELECT '=== VERIFICAR ESTADO FINAL COMPLETO ===' as info;

-- Verificar estadísticas finales completas
SELECT 
    'Estadísticas finales completas' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- Verificar que ambos historiales coinciden con finalizados
SELECT 
    'Verificación final de correspondencia' as info,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as reclutamientos_finalizados,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as en_historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial_empresas;

-- ====================================
-- 9. VERIFICAR EMPRESAS ESPECÍFICAS
-- ====================================

SELECT '=== VERIFICAR EMPRESAS ESPECÍFICAS ===' as info;

-- Verificar cada empresa individualmente
SELECT 
    e.nombre as empresa,
    e.id as empresa_id,
    (SELECT COUNT(*) FROM reclutamientos r JOIN participantes p ON r.participantes_id = p.id WHERE p.empresa_id = e.id) as total_reclutamientos,
    (SELECT COUNT(*) FROM reclutamientos r JOIN participantes p ON r.participantes_id = p.id WHERE p.empresa_id = e.id AND r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as finalizados,
    (SELECT COUNT(*) FROM historial_participacion_empresas h WHERE h.empresa_id = e.id) as en_historial
FROM empresas e
WHERE e.id IN (
    SELECT DISTINCT p.empresa_id 
    FROM reclutamientos r
    JOIN participantes p ON r.participantes_id = p.id
    WHERE r.participantes_id IS NOT NULL
)
ORDER BY e.nombre;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== FORZAR CORRECCIÓN DE EMPRESAS COMPLETADA ===' as info;
SELECT 'El historial de empresas ha sido limpiado completamente y reconstruido manualmente.' as mensaje;
SELECT 'Ahora las estadísticas de empresas deberían mostrar exactamente el número de reclutamientos finalizados.' as instruccion;
SELECT 'Prueba la aplicación para verificar que las estadísticas de empresas funcionan correctamente.' as siguiente_paso; 