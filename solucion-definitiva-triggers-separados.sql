-- ====================================
-- SOLUCIÓN DEFINITIVA: TRIGGERS SEPARADOS Y SIMPLES
-- ====================================
-- Problema: Los triggers interfieren entre sí
-- - Arreglar participantes → rompe empresas
-- - Arreglar empresas → rompe participantes
-- Solución: Triggers completamente separados y simples
-- Objetivo: Cada trigger maneja SOLO su responsabilidad específica

-- ====================================
-- 1. LIMPIAR TODO COMPLETAMENTE
-- ====================================

SELECT '=== LIMPIANDO TODO COMPLETAMENTE ===' as info;

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

-- Limpiar TODO el historial
DELETE FROM historial_participacion_participantes;
DELETE FROM historial_participacion_empresas;

-- ====================================
-- 2. VERIFICAR ESTADO LIMPIO
-- ====================================

SELECT '=== VERIFICANDO ESTADO LIMPIO ===' as info;

-- Verificar que no hay triggers
SELECT 
    'Triggers activos' as info,
    COUNT(*) as cantidad
FROM information_schema.triggers
WHERE event_object_table = 'reclutamientos';

-- Verificar que no hay funciones
SELECT 
    'Funciones relacionadas' as info,
    COUNT(*) as cantidad
FROM information_schema.routines
WHERE routine_name LIKE '%historial%'
OR routine_name LIKE '%participante%'
OR routine_name LIKE '%empresa%';

-- Verificar historial vacío
SELECT 
    'Estado del historial' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- ====================================
-- 3. INSERTAR MANUALMENTE LOS FINALIZADOS ACTUALES
-- ====================================

SELECT '=== INSERTANDO MANUALMENTE LOS FINALIZADOS ACTUALES ===' as info;

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

-- ====================================
-- 4. CREAR FUNCIÓN SOLO PARA PARTICIPANTES
-- ====================================

SELECT '=== CREANDO FUNCIÓN SOLO PARA PARTICIPANTES ===' as info;

CREATE OR REPLACE FUNCTION trigger_participantes_finalizado()
RETURNS TRIGGER AS $$
BEGIN
    -- SOLO insertar si el estado cambió a 'Finalizado'
    IF NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) 
    AND OLD.estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
    AND NEW.participantes_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM historial_participacion_participantes 
        WHERE reclutamiento_id = NEW.id
    ) THEN
        
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
            NEW.participantes_id,
            NEW.investigacion_id,
            NEW.id,
            COALESCE(p.empresa_id, (SELECT id FROM empresas LIMIT 1)),
            COALESCE(NEW.fecha_sesion, NOW()),
            'completada',
            COALESCE(NEW.duracion_sesion, 60),
            COALESCE(NEW.creado_por, auth.uid())
        FROM participantes p
        WHERE p.id = NEW.participantes_id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 5. CREAR FUNCIÓN SOLO PARA EMPRESAS
-- ====================================

SELECT '=== CREANDO FUNCIÓN SOLO PARA EMPRESAS ===' as info;

CREATE OR REPLACE FUNCTION trigger_empresas_finalizado()
RETURNS TRIGGER AS $$
DECLARE
    empresa_id_participante UUID;
BEGIN
    -- SOLO insertar si el estado cambió a 'Finalizado'
    IF NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) 
    AND OLD.estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
    AND NEW.participantes_id IS NOT NULL THEN
        
        -- Obtener empresa_id del participante
        SELECT empresa_id INTO empresa_id_participante 
        FROM participantes 
        WHERE id = NEW.participantes_id;
        
        -- Solo insertar si hay empresa y no existe ya en historial
        IF empresa_id_participante IS NOT NULL 
        AND NOT EXISTS (
            SELECT 1 FROM historial_participacion_empresas 
            WHERE reclutamiento_id = NEW.id
        ) THEN
            
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
                empresa_id_participante,
                NEW.investigacion_id,
                NEW.participantes_id,
                NEW.id,
                COALESCE(NEW.fecha_sesion, NOW()),
                COALESCE(NEW.duracion_sesion, 60),
                'completada',
                COALESCE(re.nombre, 'Sin rol'),
                COALESCE(ti.nombre, 'Sin tipo'),
                COALESCE(pr.nombre, 'Sin producto'),
                COALESCE(NEW.creado_por, auth.uid())
            FROM participantes p
            LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
            LEFT JOIN investigaciones i ON NEW.investigacion_id = i.id
            LEFT JOIN tipos_investigacion ti ON i.tipo_investigacion_id = ti.id
            LEFT JOIN productos pr ON i.producto_id = pr.id
            WHERE p.id = NEW.participantes_id;
            
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 6. CREAR TRIGGERS SEPARADOS
-- ====================================

SELECT '=== CREANDO TRIGGERS SEPARADOS ===' as info;

-- Trigger SOLO para participantes
CREATE TRIGGER trigger_participantes_finalizado
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_finalizado();

-- Trigger SOLO para empresas
CREATE TRIGGER trigger_empresas_finalizado
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_empresas_finalizado();

-- ====================================
-- 7. VERIFICAR CONFIGURACIÓN
-- ====================================

SELECT '=== VERIFICANDO CONFIGURACIÓN ===' as info;

-- Verificar triggers creados
SELECT 
    'Triggers creados' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- Verificar funciones creadas
SELECT 
    'Funciones creadas' as info,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name IN ('trigger_participantes_finalizado', 'trigger_empresas_finalizado')
ORDER BY routine_name;

-- ====================================
-- 8. VERIFICAR ESTADO ACTUAL
-- ====================================

SELECT '=== VERIFICANDO ESTADO ACTUAL ===' as info;

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
-- 9. INSTRUCCIONES DE PRUEBA
-- ====================================

SELECT '=== INSTRUCCIONES DE PRUEBA ===' as info;
SELECT '1. Ve a la aplicación y crea una nueva participación' as paso1;
SELECT '2. Cambia el estado a "Finalizado"' as paso2;
SELECT '3. Verifica que se actualicen AMBAS estadísticas (participantes Y empresas)' as paso3;
SELECT '4. Si funciona, el problema está resuelto' as paso4;
SELECT '5. Si no funciona, ejecuta el diagnóstico específico' as paso5;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== SOLUCIÓN DEFINITIVA IMPLEMENTADA ===' as info;
SELECT 'Triggers completamente separados creados.' as mensaje;
SELECT 'Cada trigger maneja SOLO su responsabilidad específica.' as explicacion;
SELECT 'No deberían interferir entre sí.' as beneficio; 