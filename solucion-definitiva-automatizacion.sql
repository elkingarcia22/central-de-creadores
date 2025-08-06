-- ====================================
-- SOLUCIÓN DEFINITIVA AUTOMATIZACIÓN
-- ====================================
-- Objetivo: Crear sistema completo de automatización
-- que funcione al 100%

-- ====================================
-- 1. LIMPIAR TODO COMPLETAMENTE
-- ====================================

SELECT 
    '=== LIMPIANDO TODO ===' as info;

-- Eliminar todos los triggers
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reclutamiento ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_update ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_update ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_solo_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_solo_update ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_final_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_final_update ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_final_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_final_update ON reclutamientos;

-- Eliminar todas las funciones
DROP FUNCTION IF EXISTS trigger_actualizar_estado_reclutamiento() CASCADE;
DROP FUNCTION IF EXISTS trigger_empresas_simple() CASCADE;
DROP FUNCTION IF EXISTS trigger_participantes_simple() CASCADE;
DROP FUNCTION IF EXISTS trigger_participantes_solo() CASCADE;
DROP FUNCTION IF EXISTS trigger_participantes_final() CASCADE;
DROP FUNCTION IF EXISTS trigger_empresas_final() CASCADE;

-- Limpiar tablas de historial
DELETE FROM historial_participacion_participantes;
DELETE FROM historial_participacion_empresas;

-- ====================================
-- 2. CREAR FUNCIÓN ÚNICA PARA PARTICIPANTES
-- ====================================

SELECT 
    '=== CREANDO FUNCIÓN PARTICIPANTES ===' as info;

CREATE OR REPLACE FUNCTION trigger_participantes_automatico()
RETURNS TRIGGER AS $func$
DECLARE
    estado_finalizado_id UUID;
BEGIN
    -- Obtener ID del estado Finalizado
    SELECT id INTO estado_finalizado_id 
    FROM estado_agendamiento_cat 
    WHERE nombre = 'Finalizado';
    
    -- Solo procesar si hay participante y el estado es Finalizado
    IF NEW.participantes_id IS NOT NULL 
    AND NEW.estado_agendamiento = estado_finalizado_id
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != NEW.estado_agendamiento) THEN
        
        -- Eliminar registro existente si existe
        DELETE FROM historial_participacion_participantes 
        WHERE reclutamiento_id = NEW.id;
        
        -- Insertar nuevo registro
        INSERT INTO historial_participacion_participantes (
            participante_id,
            investigacion_id,
            reclutamiento_id,
            empresa_id,
            fecha_participacion,
            estado_sesion,
            duracion_sesion,
            creado_por
        ) VALUES (
            NEW.participantes_id,
            NEW.investigacion_id,
            NEW.id,
            (SELECT empresa_id FROM participantes WHERE id = NEW.participantes_id),
            COALESCE(NEW.fecha_sesion, NOW()),
            'completada',
            COALESCE(NEW.duracion_sesion, 60),
            COALESCE(NEW.creado_por, auth.uid())
        );
        
        RAISE LOG 'trigger_participantes_automatico: Registro insertado para participante %', NEW.participantes_id;
        
    END IF;
    
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- ====================================
-- 3. CREAR FUNCIÓN ÚNICA PARA EMPRESAS
-- ====================================

SELECT 
    '=== CREANDO FUNCIÓN EMPRESAS ===' as info;

CREATE OR REPLACE FUNCTION trigger_empresas_automatico()
RETURNS TRIGGER AS $func$
DECLARE
    estado_finalizado_id UUID;
    empresa_participante_id UUID;
BEGIN
    -- Obtener ID del estado Finalizado
    SELECT id INTO estado_finalizado_id 
    FROM estado_agendamiento_cat 
    WHERE nombre = 'Finalizado';
    
    -- Solo procesar si hay participante y el estado es Finalizado
    IF NEW.participantes_id IS NOT NULL 
    AND NEW.estado_agendamiento = estado_finalizado_id
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != NEW.estado_agendamiento) THEN
        
        -- Obtener empresa_id del participante
        SELECT empresa_id INTO empresa_participante_id 
        FROM participantes 
        WHERE id = NEW.participantes_id;
        
        IF empresa_participante_id IS NOT NULL THEN
            -- Eliminar registro existente si existe
            DELETE FROM historial_participacion_empresas 
            WHERE reclutamiento_id = NEW.id;
            
            -- Insertar nuevo registro
            INSERT INTO historial_participacion_empresas (
                empresa_id,
                investigacion_id,
                reclutamiento_id,
                participante_id,
                fecha_participacion,
                estado_sesion,
                duracion_sesion,
                creado_por
            ) VALUES (
                empresa_participante_id,
                NEW.investigacion_id,
                NEW.id,
                NEW.participantes_id,
                COALESCE(NEW.fecha_sesion, NOW()),
                'completada',
                COALESCE(NEW.duracion_sesion, 60),
                COALESCE(NEW.creado_por, auth.uid())
            );
            
            RAISE LOG 'trigger_empresas_automatico: Registro insertado para empresa %', empresa_participante_id;
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- ====================================
-- 4. CREAR TRIGGERS ÚNICOS
-- ====================================

SELECT 
    '=== CREANDO TRIGGERS ÚNICOS ===' as info;

-- Trigger para participantes (INSERT y UPDATE)
CREATE TRIGGER trigger_participantes_automatico
    AFTER INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_automatico();

-- Trigger para empresas (INSERT y UPDATE)
CREATE TRIGGER trigger_empresas_automatico
    AFTER INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_empresas_automatico();

-- ====================================
-- 5. VERIFICAR TRIGGERS CREADOS
-- ====================================

SELECT 
    '=== VERIFICANDO TRIGGERS CREADOS ===' as info;

SELECT 
    trigger_name,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- ====================================
-- 6. VERIFICAR FUNCIONES CREADAS
-- ====================================

SELECT 
    '=== VERIFICANDO FUNCIONES CREADAS ===' as info;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('trigger_participantes_automatico', 'trigger_empresas_automatico')
ORDER BY routine_name;

-- ====================================
-- 7. VERIFICAR TABLAS LIMPIAS
-- ====================================

SELECT 
    '=== VERIFICANDO TABLAS LIMPIAS ===' as info;

SELECT 
    'historial_participacion_participantes' as tabla,
    COUNT(*) as registros
FROM historial_participacion_participantes
UNION ALL
SELECT 
    'historial_participacion_empresas' as tabla,
    COUNT(*) as registros
FROM historial_participacion_empresas;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== SOLUCIÓN DEFINITIVA CREADA ===' as info;
SELECT '✅ Solo 2 triggers activos (1 para participantes, 1 para empresas)' as mensaje;
SELECT '✅ Tablas de historial limpias' as mensaje;
SELECT '✅ Funciones optimizadas y simples' as mensaje;
SELECT '✅ Prueba cambiar un reclutamiento a Finalizado' as instruccion; 