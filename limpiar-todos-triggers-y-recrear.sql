-- ====================================
-- LIMPIAR TODOS LOS TRIGGERS Y RECREAR
-- ====================================
-- Objetivo: Eliminar todos los triggers conflictivos
-- y recrear solo los necesarios

-- ====================================
-- 1. ELIMINAR TODOS LOS TRIGGERS EXISTENTES
-- ====================================

SELECT 
    '=== ELIMINANDO TRIGGERS ===' as info;

-- Eliminar todos los triggers de reclutamientos
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reclutamiento ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_update ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_update ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_solo_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_solo_update ON reclutamientos;

-- ====================================
-- 2. ELIMINAR TODAS LAS FUNCIONES
-- ====================================

SELECT 
    '=== ELIMINANDO FUNCIONES ===' as info;

DROP FUNCTION IF EXISTS trigger_actualizar_estado_reclutamiento() CASCADE;
DROP FUNCTION IF EXISTS trigger_empresas_simple() CASCADE;
DROP FUNCTION IF EXISTS trigger_participantes_simple() CASCADE;
DROP FUNCTION IF EXISTS trigger_participantes_solo() CASCADE;

-- ====================================
-- 3. LIMPIAR TABLAS DE HISTORIAL
-- ====================================

SELECT 
    '=== LIMPIANDO TABLAS DE HISTORIAL ===' as info;

DELETE FROM historial_participacion_participantes;
DELETE FROM historial_participacion_empresas;

-- ====================================
-- 4. VERIFICAR QUE ESTÁN LIMPIAS
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
-- 5. CREAR FUNCIÓN SIMPLE PARA PARTICIPANTES
-- ====================================

SELECT 
    '=== CREANDO FUNCIÓN PARTICIPANTES ===' as info;

CREATE OR REPLACE FUNCTION trigger_participantes_final()
RETURNS TRIGGER AS $func$
BEGIN
    -- Solo procesar si hay participante y el estado es Finalizado
    IF NEW.participantes_id IS NOT NULL 
    AND NEW.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != NEW.estado_agendamiento) THEN
        
        -- Eliminar registro existente si existe
        DELETE FROM historial_participacion_participantes WHERE reclutamiento_id = NEW.id;
        
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
        
    END IF;
    
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- ====================================
-- 6. CREAR FUNCIÓN SIMPLE PARA EMPRESAS
-- ====================================

SELECT 
    '=== CREANDO FUNCIÓN EMPRESAS ===' as info;

CREATE OR REPLACE FUNCTION trigger_empresas_final()
RETURNS TRIGGER AS $func$
DECLARE
    empresa_participante_id UUID;
BEGIN
    -- Solo procesar si hay participante y el estado es Finalizado
    IF NEW.participantes_id IS NOT NULL 
    AND NEW.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != NEW.estado_agendamiento) THEN
        
        -- Obtener empresa_id del participante
        SELECT empresa_id INTO empresa_participante_id 
        FROM participantes 
        WHERE id = NEW.participantes_id;
        
        IF empresa_participante_id IS NOT NULL THEN
            -- Eliminar registro existente si existe
            DELETE FROM historial_participacion_empresas WHERE reclutamiento_id = NEW.id;
            
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
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- ====================================
-- 7. CREAR TRIGGERS FINALES
-- ====================================

SELECT 
    '=== CREANDO TRIGGERS FINALES ===' as info;

-- Triggers para participantes
CREATE TRIGGER trigger_participantes_final_insert
    AFTER INSERT ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_final();

CREATE TRIGGER trigger_participantes_final_update
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_final();

-- Triggers para empresas
CREATE TRIGGER trigger_empresas_final_insert
    AFTER INSERT ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_empresas_final();

CREATE TRIGGER trigger_empresas_final_update
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_empresas_final();

-- ====================================
-- 8. VERIFICAR TRIGGERS CREADOS
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
-- 9. VERIFICAR FUNCIONES CREADAS
-- ====================================

SELECT 
    '=== VERIFICANDO FUNCIONES CREADAS ===' as info;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('trigger_participantes_final', 'trigger_empresas_final')
ORDER BY routine_name;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== LIMPIEZA Y RECREACIÓN COMPLETADA ===' as info;
SELECT '✅ Todos los triggers conflictivos eliminados' as mensaje;
SELECT '✅ Solo 4 triggers activos (2 para participantes, 2 para empresas)' as mensaje;
SELECT '✅ Tablas de historial limpias' as mensaje;
SELECT '✅ Prueba cambiar un reclutamiento a Finalizado' as instruccion; 