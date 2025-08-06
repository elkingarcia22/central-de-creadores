-- ====================================
-- CORRECCIÓN DE ESTADÍSTICAS - LIMPIEZA COMPLETA
-- ====================================
-- Problema: Las estadísticas están mostrando números incorrectos
-- Causa: El historial tiene duplicados o datos incorrectos
-- Solución: Limpiar completamente y reconstruir solo con finalizadas

-- ====================================
-- 1. LIMPIAR COMPLETAMENTE EL HISTORIAL
-- ====================================

SELECT '=== LIMPIANDO COMPLETAMENTE EL HISTORIAL ===' as info;

-- Eliminar todo el historial de empresas
DELETE FROM historial_participacion_empresas;

-- Eliminar todo el historial de participantes
DELETE FROM historial_participacion_participantes;

-- Verificar que está limpio
SELECT 
    'Historial después de limpieza' as info,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes;

-- ====================================
-- 2. VERIFICAR RECLUTAMIENTOS FINALIZADOS
-- ====================================

SELECT '=== VERIFICANDO RECLUTAMIENTOS FINALIZADOS ===' as info;

-- Verificar cuántos reclutamientos están finalizados
SELECT 
    'Reclutamientos finalizados' as info,
    COUNT(*) as total_finalizados
FROM reclutamientos 
WHERE participantes_id IS NOT NULL
AND estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- Mostrar los reclutamientos finalizados
SELECT 
    'Detalle de finalizados' as info,
    r.id,
    r.participantes_id,
    r.estado_agendamiento,
    p.nombre as participante,
    e.nombre as empresa
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE r.participantes_id IS NOT NULL
AND r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
ORDER BY r.created_at;

-- ====================================
-- 3. INSERTAR SOLO FINALIZADAS EN HISTORIAL DE EMPRESAS
-- ====================================

SELECT '=== INSERTANDO SOLO FINALIZADAS EN HISTORIAL DE EMPRESAS ===' as info;

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
    COALESCE(p.empresa_id, (SELECT id FROM empresas LIMIT 1)),
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
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN tipos_investigacion ti ON i.tipo_investigacion_id = ti.id
LEFT JOIN productos pr ON i.producto_id = pr.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL;

-- ====================================
-- 4. INSERTAR SOLO FINALIZADAS EN HISTORIAL DE PARTICIPANTES
-- ====================================

SELECT '=== INSERTANDO SOLO FINALIZADAS EN HISTORIAL DE PARTICIPANTES ===' as info;

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
-- 5. VERIFICAR RESULTADO
-- ====================================

SELECT '=== VERIFICANDO RESULTADO ===' as info;

-- Verificar historial después de inserción
SELECT 
    'Historial después de inserción' as info,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes;

-- Verificar que solo hay finalizadas en el historial
SELECT 
    'Verificación de finalizadas en historial' as info,
    COUNT(*) as total_finalizadas_en_historial
FROM historial_participacion_empresas h
JOIN reclutamientos r ON h.reclutamiento_id = r.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 6. VERIFICAR ESTADÍSTICAS POR EMPRESA
-- ====================================

SELECT '=== ESTADÍSTICAS POR EMPRESA ===' as info;

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

-- ====================================
-- 7. VERIFICAR ESTADÍSTICAS POR PARTICIPANTE
-- ====================================

SELECT '=== ESTADÍSTICAS POR PARTICIPANTE ===' as info;

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

-- ====================================
-- 8. VERIFICAR QUE NO HAY DUPLICADOS
-- ====================================

SELECT '=== VERIFICANDO DUPLICADOS ===' as info;

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

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== LIMPIEZA COMPLETA TERMINADA ===' as info;
SELECT 'El historial ha sido limpiado y reconstruido correctamente.' as mensaje;
SELECT 'Ahora las estadísticas deberían mostrar solo las participaciones finalizadas.' as instruccion; 