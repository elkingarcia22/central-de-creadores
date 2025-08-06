-- ====================================
-- FORZAR INSERCIÓN DE EMPRESAS
-- ====================================
-- Problema: Empresas muestran 0 en estadísticas
-- Solución: Forzar la inserción manual de empresas en el historial
-- Objetivo: Asegurar que las empresas se cuenten correctamente

-- ====================================
-- 1. LIMPIAR HISTORIAL DE EMPRESAS
-- ====================================

SELECT '=== LIMPIANDO HISTORIAL DE EMPRESAS ===' as info;

-- Limpiar historial de empresas
DELETE FROM historial_participacion_empresas;

-- ====================================
-- 2. VERIFICAR DATOS ANTES DE INSERTAR
-- ====================================

SELECT '=== VERIFICANDO DATOS ANTES DE INSERTAR ===' as info;

-- Verificar reclutamientos finalizados con empresa
SELECT 
    'Reclutamientos finalizados con empresa' as info,
    COUNT(*) as total
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND p.empresa_id IS NOT NULL;

-- Mostrar detalles de los datos a insertar
SELECT 
    'Datos a insertar en historial empresas' as info,
    p.empresa_id,
    e.nombre as empresa,
    r.investigacion_id,
    r.participantes_id,
    p.nombre as participante,
    r.id as reclutamiento_id
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
JOIN empresas e ON p.empresa_id = e.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND p.empresa_id IS NOT NULL
ORDER BY e.nombre, p.nombre;

-- ====================================
-- 3. INSERTAR EMPRESAS MANUALMENTE
-- ====================================

SELECT '=== INSERTANDO EMPRESAS MANUALMENTE ===' as info;

-- Insertar empresas en historial
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
-- 4. VERIFICAR INSERCIÓN
-- ====================================

SELECT '=== VERIFICANDO INSERCIÓN ===' as info;

-- Verificar registros insertados
SELECT 
    'Registros insertados en historial empresas' as info,
    COUNT(*) as total_insertados
FROM historial_participacion_empresas;

-- Mostrar registros insertados
SELECT 
    'Registros en historial empresas' as info,
    h.id as historial_id,
    h.empresa_id,
    e.nombre as empresa,
    h.reclutamiento_id,
    h.estado_sesion,
    h.fecha_participacion
FROM historial_participacion_empresas h
JOIN empresas e ON h.empresa_id = e.id
ORDER BY e.nombre, h.id;

-- ====================================
-- 5. VERIFICAR ESTADÍSTICAS
-- ====================================

SELECT '=== VERIFICANDO ESTADÍSTICAS ===' as info;

-- Verificar estadísticas de empresas
SELECT 
    'Estadísticas empresas' as info,
    COUNT(*) as total_empresas,
    SUM(participaciones_finalizadas) as total_participaciones_finalizadas
FROM vista_estadisticas_empresas;

-- Mostrar estadísticas por empresa
SELECT 
    'Estadísticas por empresa' as info,
    empresa_id,
    empresa,
    total_participaciones,
    participaciones_finalizadas
FROM vista_estadisticas_empresas
ORDER BY empresa;

-- ====================================
-- 6. COMPARAR CON RECLUTAMIENTOS
-- ====================================

SELECT '=== COMPARANDO CON RECLUTAMIENTOS ===' as info;

-- Comparar reclutamientos finalizados vs historial
SELECT 
    'Comparación finalizados vs historial' as info,
    (SELECT COUNT(*) FROM reclutamientos r JOIN participantes p ON r.participantes_id = p.id WHERE r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') AND p.empresa_id IS NOT NULL) as reclutamientos_finalizados_con_empresa,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial_empresas;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== INSERCIÓN FORZADA COMPLETADA ===' as info;
SELECT 'Las empresas han sido insertadas manualmente en el historial.' as mensaje;
SELECT 'Verifica las estadísticas en la aplicación.' as instruccion;
SELECT 'Si sigue mostrando 0, ejecuta el diagnóstico específico.' as instruccion_adicional; 