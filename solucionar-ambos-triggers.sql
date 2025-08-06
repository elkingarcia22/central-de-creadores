-- ====================================
-- SOLUCIONAR AMBOS TRIGGERS
-- ====================================
-- Problema: Al arreglar empresas se dañaron participantes
-- Solución: Recrear ambos triggers de manera controlada
-- Objetivo: Asegurar que ambos funcionen correctamente sin conflictos

-- ====================================
-- 1. LIMPIAR TODO PRIMERO
-- ====================================

SELECT '=== LIMPIANDO TODO PRIMERO ===' as info;

-- Eliminar todos los triggers existentes
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_automatico ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_automatico ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_final ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_final ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_solo_finalizadas ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_solo_finalizadas ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_limpio ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_limpio ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_corregida ON reclutamientos;

-- Eliminar todas las funciones existentes
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_automatico() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_automatico() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_final() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_final() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_solo_finalizadas() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_solo_finalizadas() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_limpio() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_limpio() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_corregida() CASCADE;

-- Verificar que está limpio
SELECT 
    'Estado después de limpieza' as info,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE event_object_table = 'reclutamientos') as triggers_activos,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name LIKE '%historial%') as funciones_activas;

-- ====================================
-- 2. VERIFICAR ESTADO ACTUAL DE DATOS
-- ====================================

SELECT '=== VERIFICANDO ESTADO ACTUAL DE DATOS ===' as info;

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
-- 3. CREAR FUNCIÓN ÚNICA PARA AMBOS
-- ====================================

SELECT '=== CREANDO FUNCIÓN ÚNICA PARA AMBOS ===' as info;

CREATE OR REPLACE FUNCTION sincronizar_historial_completo()
RETURNS TRIGGER AS $$
DECLARE
    empresa_id_participante UUID;
BEGIN
    -- Solo procesar si el reclutamiento está finalizado
    IF NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) AND NEW.participantes_id IS NOT NULL THEN
        
        -- ====================================
        -- PARTE 1: INSERTAR EN HISTORIAL DE PARTICIPANTES
        -- ====================================
        
        -- Verificar que no existe ya en historial de participantes
        IF NOT EXISTS (
            SELECT 1 FROM historial_participacion_participantes 
            WHERE reclutamiento_id = NEW.id
        ) THEN
            -- Insertar en historial de participantes
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
        
        -- ====================================
        -- PARTE 2: INSERTAR EN HISTORIAL DE EMPRESAS
        -- ====================================
        
        -- Obtener empresa del participante
        SELECT empresa_id INTO empresa_id_participante
        FROM participantes
        WHERE id = NEW.participantes_id;
        
        -- Solo insertar en historial de empresas si el participante tiene empresa
        IF empresa_id_participante IS NOT NULL THEN
            -- Verificar que no existe ya en historial de empresas
            IF NOT EXISTS (
                SELECT 1 FROM historial_participacion_empresas 
                WHERE reclutamiento_id = NEW.id
            ) THEN
                -- Insertar en historial de empresas
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
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 4. CREAR TRIGGER ÚNICO
-- ====================================

SELECT '=== CREANDO TRIGGER ÚNICO ===' as info;

-- Crear un solo trigger que maneje ambos casos
CREATE TRIGGER trigger_sincronizar_historial_completo
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION sincronizar_historial_completo();

-- ====================================
-- 5. VERIFICAR QUE SE CREÓ CORRECTAMENTE
-- ====================================

SELECT '=== VERIFICANDO QUE SE CREÓ CORRECTAMENTE ===' as info;

-- Verificar que el trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'reclutamientos'
AND trigger_name = 'trigger_sincronizar_historial_completo';

-- Verificar que la función existe
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'sincronizar_historial_completo';

-- ====================================
-- 6. PROBAR CON UN RECLUTAMIENTO EXISTENTE
-- ====================================

SELECT '=== PROBANDO CON RECLUTAMIENTO EXISTENTE ===' as info;

-- Verificar estado antes de la prueba
SELECT 
    'Estado antes de prueba' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- Simular finalización de un reclutamiento para probar el trigger
UPDATE reclutamientos 
SET 
    estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'),
    fecha_sesion = NOW(),
    duracion_sesion = 60
WHERE id = (
    SELECT r.id
    FROM reclutamientos r
    WHERE r.participantes_id IS NOT NULL
    AND r.estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
    LIMIT 1
);

-- Verificar estado después de la prueba
SELECT 
    'Estado después de prueba' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- ====================================
-- 7. VERIFICAR CORRESPONDENCIA EXACTA
-- ====================================

SELECT '=== VERIFICANDO CORRESPONDENCIA EXACTA ===' as info;

-- Verificar que el número de reclutamientos finalizados coincide con el historial
SELECT 
    'Correspondencia finalizados vs historial' as info,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as reclutamientos_finalizados,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as en_historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial_empresas;

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
-- 8. VERIFICAR QUE NO HAY DUPLICADOS
-- ====================================

SELECT '=== VERIFICANDO QUE NO HAY DUPLICADOS ===' as info;

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
-- 9. INSTRUCCIONES PARA PRUEBA MANUAL
-- ====================================

SELECT '=== INSTRUCCIONES PARA PRUEBA MANUAL ===' as info;
SELECT '1. Ve a la aplicación y crea una nueva participación' as paso1;
SELECT '2. Cambia el estado de la participación a "Finalizado"' as paso2;
SELECT '3. Verifica que las estadísticas de participantes se actualicen' as paso3;
SELECT '4. Verifica que las estadísticas de empresas se actualicen' as paso4;
SELECT '5. Si ambos funcionan, el problema está solucionado' as paso5;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== SOLUCIÓN COMPLETADA ===' as info;
SELECT 'Se ha creado un trigger único que maneja ambos casos (participantes y empresas).' as mensaje;
SELECT 'Esto evita conflictos entre triggers separados.' as explicacion;
SELECT 'Prueba creando y finalizando una nueva participación para verificar que ambos funcionan.' as siguiente_paso; 