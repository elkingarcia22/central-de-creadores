-- ====================================
-- SOLUCIÓN SIN TRIGGERS: ESTADÍSTICAS MANUALES
-- ====================================
-- Problema: Los triggers siempre interfieren entre sí
-- - Arreglar participantes → rompe empresas
-- - Arreglar empresas → rompe participantes
-- Solución: Eliminar completamente los triggers
-- Objetivo: Manejar estadísticas de forma manual o con vistas

-- ====================================
-- 1. ELIMINAR COMPLETAMENTE TODOS LOS TRIGGERS
-- ====================================

SELECT '=== ELIMINANDO COMPLETAMENTE TODOS LOS TRIGGERS ===' as info;

-- Eliminar TODOS los triggers existentes
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
DROP TRIGGER IF EXISTS trigger_participantes_finalizado ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_finalizado ON reclutamientos;

-- Eliminar TODAS las funciones existentes
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
DROP FUNCTION IF EXISTS trigger_participantes_finalizado() CASCADE;
DROP FUNCTION IF EXISTS trigger_empresas_finalizado() CASCADE;

-- ====================================
-- 2. LIMPIAR HISTORIAL Y RECONSTRUIR MANUALMENTE
-- ====================================

SELECT '=== LIMPIANDO HISTORIAL Y RECONSTRUYENDO MANUALMENTE ===' as info;

-- Limpiar todo el historial
DELETE FROM historial_participacion_participantes;
DELETE FROM historial_participacion_empresas;

-- Insertar manualmente SOLO los finalizados actuales
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
-- 3. CREAR VISTAS PARA ESTADÍSTICAS EN TIEMPO REAL
-- ====================================

SELECT '=== CREANDO VISTAS PARA ESTADÍSTICAS EN TIEMPO REAL ===' as info;

-- Crear vista para estadísticas de participantes en tiempo real
CREATE OR REPLACE VIEW vista_estadisticas_participantes AS
SELECT 
    p.id as participante_id,
    p.nombre as participante,
    COUNT(r.id) as total_participaciones,
    COUNT(CASE WHEN r.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) THEN 1 END) as participaciones_finalizadas
FROM participantes p
LEFT JOIN reclutamientos r ON p.id = r.participantes_id
WHERE r.id IS NOT NULL
GROUP BY p.id, p.nombre;

-- Crear vista para estadísticas de empresas en tiempo real
CREATE OR REPLACE VIEW vista_estadisticas_empresas AS
SELECT 
    e.id as empresa_id,
    e.nombre as empresa,
    COUNT(r.id) as total_participaciones,
    COUNT(CASE WHEN r.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) THEN 1 END) as participaciones_finalizadas
FROM empresas e
LEFT JOIN participantes p ON e.id = p.empresa_id
LEFT JOIN reclutamientos r ON p.id = r.participantes_id
WHERE r.id IS NOT NULL
GROUP BY e.id, e.nombre;

-- ====================================
-- 4. CREAR FUNCIÓN PARA ACTUALIZAR MANUALMENTE
-- ====================================

SELECT '=== CREANDO FUNCIÓN PARA ACTUALIZAR MANUALMENTE ===' as info;

CREATE OR REPLACE FUNCTION actualizar_estadisticas_manual()
RETURNS void AS $$
BEGIN
    -- Limpiar historial
    DELETE FROM historial_participacion_participantes;
    DELETE FROM historial_participacion_empresas;
    
    -- Insertar participantes finalizados
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
    
    -- Insertar empresas finalizadas
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
    
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 5. VERIFICAR ESTADO FINAL
-- ====================================

SELECT '=== VERIFICANDO ESTADO FINAL ===' as info;

-- Verificar que no hay triggers
SELECT 
    'Triggers activos' as info,
    COUNT(*) as cantidad
FROM information_schema.triggers
WHERE event_object_table = 'reclutamientos';

-- Verificar estadísticas actuales
SELECT 
    'Estadísticas actuales' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- Verificar reclutamientos finalizados
SELECT 
    'Reclutamientos finalizados' as info,
    COUNT(*) as total_finalizados
FROM reclutamientos 
WHERE participantes_id IS NOT NULL
AND estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 6. INSTRUCCIONES DE USO
-- ====================================

SELECT '=== INSTRUCCIONES DE USO ===' as info;
SELECT '1. Las estadísticas ahora se calculan en tiempo real desde reclutamientos' as paso1;
SELECT '2. Para actualizar manualmente: SELECT actualizar_estadisticas_manual();' as paso2;
SELECT '3. Para ver estadísticas: SELECT * FROM vista_estadisticas_participantes;' as paso3;
SELECT '4. Para ver estadísticas empresas: SELECT * FROM vista_estadisticas_empresas;' as paso4;
SELECT '5. No hay automatización, pero no hay conflictos' as paso5;

-- ====================================
-- 7. MODIFICAR LAS APIs PARA USAR VISTAS
-- ====================================

SELECT '=== MODIFICAR LAS APIs PARA USAR VISTAS ===' as info;
SELECT 'Las APIs deben cambiar para usar las vistas en lugar del historial' as instruccion;
SELECT 'Esto eliminará la necesidad de sincronización' as beneficio;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== SOLUCIÓN SIN TRIGGERS IMPLEMENTADA ===' as info;
SELECT 'Todos los triggers han sido eliminados.' as mensaje;
SELECT 'Las estadísticas se calculan en tiempo real desde reclutamientos.' as explicacion;
SELECT 'No hay automatización, pero no hay conflictos.' as beneficio;
SELECT 'Para actualizar manualmente: SELECT actualizar_estadisticas_manual();' as instruccion_final; 