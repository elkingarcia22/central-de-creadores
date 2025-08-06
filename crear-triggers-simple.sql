-- ====================================
-- CREAR TRIGGERS SIMPLE
-- ====================================
-- Problema: Error de sintaxis en funciones
-- Solución: Script simple y limpio
-- Objetivo: Crear triggers funcionales

-- ====================================
-- 1. ELIMINAR TRIGGERS EXISTENTES
-- ====================================

DROP TRIGGER IF EXISTS trigger_participantes_externos_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_externos_update ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_update ON reclutamientos;

DROP FUNCTION IF EXISTS trigger_participantes_externos() CASCADE;
DROP FUNCTION IF EXISTS trigger_empresas() CASCADE;

-- ====================================
-- 2. CREAR FUNCIÓN SIMPLE PARA PARTICIPANTES
-- ====================================

CREATE OR REPLACE FUNCTION trigger_participantes_simple()
RETURNS TRIGGER AS $func$
BEGIN
    IF NEW.participantes_id IS NOT NULL 
    AND NEW.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != NEW.estado_agendamiento) THEN
        
        DELETE FROM historial_participacion_participantes WHERE reclutamiento_id = NEW.id;
        
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
-- 3. CREAR FUNCIÓN SIMPLE PARA EMPRESAS
-- ====================================

CREATE OR REPLACE FUNCTION trigger_empresas_simple()
RETURNS TRIGGER AS $func$
DECLARE
    empresa_participante_id UUID;
BEGIN
    IF NEW.participantes_id IS NOT NULL 
    AND NEW.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != NEW.estado_agendamiento) THEN
        
        SELECT empresa_id INTO empresa_participante_id 
        FROM participantes 
        WHERE id = NEW.participantes_id;
        
        IF empresa_participante_id IS NOT NULL THEN
            DELETE FROM historial_participacion_empresas WHERE reclutamiento_id = NEW.id;
            
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
-- 4. CREAR TRIGGERS
-- ====================================

CREATE TRIGGER trigger_participantes_insert
    AFTER INSERT ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_simple();

CREATE TRIGGER trigger_participantes_update
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_simple();

CREATE TRIGGER trigger_empresas_insert
    AFTER INSERT ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_empresas_simple();

CREATE TRIGGER trigger_empresas_update
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_empresas_simple();

-- ====================================
-- 5. VERIFICAR TRIGGERS
-- ====================================

SELECT 
    'Triggers creados' as info,
    trigger_name,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- ====================================
-- 6. VERIFICAR FUNCIONES
-- ====================================

SELECT 
    'Funciones creadas' as info,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('trigger_participantes_simple', 'trigger_empresas_simple')
ORDER BY routine_name;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== TRIGGERS CREADOS EXITOSAMENTE ===' as info;
SELECT '✅ Triggers para participantes y empresas activos' as mensaje;
SELECT '✅ Prueba crear un reclutamiento y cambiar a Finalizado' as instruccion; 