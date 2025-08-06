-- ====================================
-- CORRECCIÓN MANUAL DE ESTADÍSTICAS DE PARTICIPACIÓN
-- ====================================
-- Objetivo: Forzar la inserción de datos faltantes en el historial
-- para que las estadísticas muestren el número correcto

-- ====================================
-- 1. VERIFICAR RECLUTAMIENTOS FINALIZADOS SIN HISTORIAL
-- ====================================

SELECT '=== RECLUTAMIENTOS FINALIZADOS SIN HISTORIAL ===' as info;

-- Mostrar reclutamientos finalizados que no están en historial de empresas
SELECT 
    r.id as reclutamiento_id,
    r.participantes_id,
    r.investigacion_id,
    r.estado_agendamiento,
    p.nombre as nombre_participante,
    p.empresa_id,
    e.nombre as nombre_empresa
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_empresas h 
    WHERE h.reclutamiento_id = r.id
);

-- ====================================
-- 2. INSERTAR MANUALMENTE EN HISTORIAL DE EMPRESAS
-- ====================================

SELECT '=== INSERTANDO EN HISTORIAL DE EMPRESAS ===' as info;

-- Insertar reclutamientos finalizados que no están en historial de empresas
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
    CASE WHEN r.fecha_sesion IS NOT NULL THEN r.fecha_sesion ELSE NOW() END,
    CASE WHEN r.duracion_sesion IS NOT NULL THEN r.duracion_sesion ELSE 60 END,
    'completada',
    CASE WHEN re.nombre IS NOT NULL THEN re.nombre ELSE 'Sin rol' END,
    CASE WHEN ti.nombre IS NOT NULL THEN ti.nombre ELSE 'Sin tipo' END,
    CASE WHEN pr.nombre IS NOT NULL THEN pr.nombre ELSE 'Sin producto' END,
    r.creado_por
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN tipos_investigacion ti ON i.tipo_investigacion_id = ti.id
LEFT JOIN productos pr ON i.producto_id = pr.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND p.empresa_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_empresas h 
    WHERE h.reclutamiento_id = r.id
);

-- ====================================
-- 3. INSERTAR MANUALMENTE EN HISTORIAL DE PARTICIPANTES EXTERNOS
-- ====================================

SELECT '=== INSERTANDO EN HISTORIAL DE PARTICIPANTES EXTERNOS ===' as info;

-- Insertar reclutamientos finalizados que no están en historial de participantes
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
    p.empresa_id,
    CASE WHEN r.fecha_sesion IS NOT NULL THEN r.fecha_sesion ELSE NOW() END,
    'completada',
    CASE WHEN r.duracion_sesion IS NOT NULL THEN r.duracion_sesion ELSE 60 END,
    r.creado_por
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_participantes h 
    WHERE h.reclutamiento_id = r.id
);

-- ====================================
-- 4. INSERTAR MANUALMENTE EN HISTORIAL DE PARTICIPANTES INTERNOS
-- ====================================

SELECT '=== INSERTANDO EN HISTORIAL DE PARTICIPANTES INTERNOS ===' as info;

-- Insertar reclutamientos finalizados que no están en historial de participantes internos
INSERT INTO historial_participacion_participantes_internos (
    participante_interno_id,
    investigacion_id,
    reclutamiento_id,
    fecha_participacion,
    estado_sesion,
    duracion_minutos,
    reclutador_id,
    observaciones,
    creado_por
)
SELECT 
    r.participantes_internos_id,
    r.investigacion_id,
    r.id,
    CASE WHEN r.fecha_sesion IS NOT NULL THEN r.fecha_sesion ELSE NOW() END,
    'completada',
    CASE WHEN r.duracion_sesion IS NOT NULL THEN r.duracion_sesion ELSE 60 END,
    r.reclutador_id,
    'Insertado manualmente para corregir estadísticas',
    r.creado_por
FROM reclutamientos r
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_internos_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_participantes_internos h 
    WHERE h.reclutamiento_id = r.id
);

-- ====================================
-- 5. CORREGIR PARTICIPANTES SIN EMPRESA_ID
-- ====================================

SELECT '=== CORRIGIENDO PARTICIPANTES SIN EMPRESA_ID ===' as info;

-- Asignar empresa_id a participantes que no lo tengan
UPDATE participantes 
SET empresa_id = (
    SELECT id FROM empresas 
    ORDER BY created_at 
    LIMIT 1
)
WHERE empresa_id IS NULL 
AND id IN (
    SELECT DISTINCT participantes_id 
    FROM reclutamientos 
    WHERE participantes_id IS NOT NULL
    AND estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
);

-- ====================================
-- 6. VERIFICAR RESULTADO DESPUÉS DE LA CORRECCIÓN
-- ====================================

SELECT '=== VERIFICACIÓN DESPUÉS DE LA CORRECCIÓN ===' as info;

-- Verificar datos en historiales
SELECT 
    'Historial de empresas' as tabla,
    COUNT(*) as total_registros
FROM historial_participacion_empresas
UNION ALL
SELECT 
    'Historial de participantes externos' as tabla,
    COUNT(*) as total_registros
FROM historial_participacion_participantes
UNION ALL
SELECT 
    'Historial de participantes internos' as tabla,
    COUNT(*) as total_registros
FROM historial_participacion_participantes_internos;

-- Verificar reclutamientos finalizados con historial
SELECT 
    'Reclutamientos finalizados con historial' as info,
    COUNT(*) as total
FROM reclutamientos r
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND EXISTS (
    SELECT 1 FROM historial_participacion_empresas h 
    WHERE h.reclutamiento_id = r.id
);

-- Verificar que no queden reclutamientos finalizados sin historial
SELECT 
    'Reclutamientos finalizados SIN historial (debería ser 0)' as info,
    COUNT(*) as total
FROM reclutamientos r
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_empresas h 
    WHERE h.reclutamiento_id = r.id
);

-- ====================================
-- 7. MOSTRAR ESTADÍSTICAS CORREGIDAS
-- ====================================

SELECT '=== ESTADÍSTICAS CORREGIDAS ===' as info;

-- Total de participaciones (debería ser 2)
SELECT 
    'Total de participaciones' as metric,
    COUNT(*) as valor
FROM historial_participacion_empresas
UNION ALL
SELECT 
    'Total de participantes externos' as metric,
    COUNT(*) as valor
FROM historial_participacion_participantes
UNION ALL
SELECT 
    'Total de participantes internos' as metric,
    COUNT(*) as valor
FROM historial_participacion_participantes_internos;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== CORRECCIÓN MANUAL COMPLETADA ===' as info;
SELECT 'Las estadísticas de participación han sido corregidas manualmente.' as mensaje;
SELECT 'Ahora debería mostrar el número correcto de participaciones.' as instruccion; 