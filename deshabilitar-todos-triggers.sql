-- ====================================
-- DESHABILITAR TODOS LOS TRIGGERS
-- ====================================
-- Problema: Las estadísticas siguen contando incorrectamente
-- Solución: Deshabilitar completamente todos los triggers
-- Objetivo: Eliminar cualquier automatización que esté causando problemas

-- ====================================
-- 1. ELIMINAR TODOS LOS TRIGGERS
-- ====================================

SELECT '=== ELIMINANDO TODOS LOS TRIGGERS ===' as info;

-- Eliminar todos los triggers existentes
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_completo ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_automatico ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_automatico ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_final ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_final ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_solo_finalizadas ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_solo_finalizadas ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_limpio ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_limpio ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_corregida ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_participante_simple ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_simple ON reclutamientos;

-- ====================================
-- 2. ELIMINAR TODAS LAS FUNCIONES
-- ====================================

SELECT '=== ELIMINANDO TODAS LAS FUNCIONES ===' as info;

-- Eliminar todas las funciones existentes
DROP FUNCTION IF EXISTS sincronizar_historial_completo() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_automatico() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_automatico() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_final() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_final() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_solo_finalizadas() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_solo_finalizadas() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_limpio() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_limpio() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_corregida() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_participante_simple() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_simple() CASCADE;

-- ====================================
-- 3. LIMPIAR TODO EL HISTORIAL
-- ====================================

SELECT '=== LIMPIANDO TODO EL HISTORIAL ===' as info;

-- Eliminar TODO el historial
DELETE FROM historial_participacion_participantes;
DELETE FROM historial_participacion_empresas;

-- ====================================
-- 4. VERIFICAR QUE ESTÁ COMPLETAMENTE LIMPIO
-- ====================================

SELECT '=== VERIFICANDO QUE ESTÁ COMPLETAMENTE LIMPIO ===' as info;

-- Verificar que no hay triggers activos
SELECT 
    'Triggers activos en reclutamientos' as info,
    COUNT(*) as cantidad
FROM information_schema.triggers
WHERE event_object_table = 'reclutamientos';

-- Verificar que no hay funciones relacionadas
SELECT 
    'Funciones relacionadas con historial' as info,
    COUNT(*) as cantidad
FROM information_schema.routines
WHERE routine_name LIKE '%historial%'
OR routine_name LIKE '%participante%'
OR routine_name LIKE '%empresa%';

-- Verificar que el historial está vacío
SELECT 
    'Estado del historial' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- ====================================
-- 5. VERIFICAR RECLUTAMIENTOS FINALIZADOS
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
-- 6. INSERTAR MANUALMENTE SOLO LOS FINALIZADOS
-- ====================================

SELECT '=== INSERTANDO MANUALMENTE SOLO LOS FINALIZADOS ===' as info;

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
-- 7. VERIFICAR RESULTADO FINAL
-- ====================================

SELECT '=== VERIFICANDO RESULTADO FINAL ===' as info;

-- Verificar estadísticas finales
SELECT 
    'Estadísticas finales' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- Verificar correspondencia exacta
SELECT 
    'Correspondencia finalizados vs historial' as info,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as reclutamientos_finalizados,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as en_historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial_empresas;

-- ====================================
-- 8. INSTRUCCIONES PARA PRUEBA MANUAL
-- ====================================

SELECT '=== INSTRUCCIONES PARA PRUEBA MANUAL ===' as info;
SELECT '1. Ve a la aplicación y crea una nueva participación' as paso1;
SELECT '2. Cambia el estado de la participación a "Finalizado"' as paso2;
SELECT '3. Verifica que las estadísticas NO se actualicen automáticamente' as paso3;
SELECT '4. Si no se actualizan, los triggers están deshabilitados correctamente' as paso4;
SELECT '5. Ahora puedes insertar manualmente cuando sea necesario' as paso5;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DESHABILITACIÓN COMPLETADA ===' as info;
SELECT 'Todos los triggers han sido eliminados.' as mensaje;
SELECT 'El historial ha sido limpiado y reconstruido manualmente.' as explicacion;
SELECT 'Ahora las estadísticas solo se actualizarán manualmente.' as siguiente_paso; 