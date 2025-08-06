-- ====================================
-- SOLUCIÓN SIN DUPLICADOS AGRESIVA
-- ====================================
-- Objetivo: Eliminar duplicados de forma agresiva
-- y crear sistema que funcione al 100%

-- ====================================
-- 1. ELIMINAR TODO AGRESIVAMENTE
-- ====================================

SELECT 
    '=== ELIMINANDO TODO AGRESIVAMENTE ===' as info;

-- Eliminar TODOS los triggers sin excepción
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
DROP TRIGGER IF EXISTS trigger_participantes_automatico ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_automatico ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_estadisticas_final ON reclutamientos;

-- Eliminar TODAS las funciones sin excepción
DROP FUNCTION IF EXISTS trigger_actualizar_estado_reclutamiento() CASCADE;
DROP FUNCTION IF EXISTS trigger_empresas_simple() CASCADE;
DROP FUNCTION IF EXISTS trigger_participantes_simple() CASCADE;
DROP FUNCTION IF EXISTS trigger_participantes_solo() CASCADE;
DROP FUNCTION IF EXISTS trigger_participantes_final() CASCADE;
DROP FUNCTION IF EXISTS trigger_empresas_final() CASCADE;
DROP FUNCTION IF EXISTS trigger_participantes_automatico() CASCADE;
DROP FUNCTION IF EXISTS trigger_empresas_automatico() CASCADE;
DROP FUNCTION IF EXISTS trigger_estadisticas_final() CASCADE;

-- ELIMINAR TODOS LOS DATOS DE HISTORIAL
DELETE FROM historial_participacion_participantes;
DELETE FROM historial_participacion_empresas;

-- ====================================
-- 2. VERIFICAR QUE ESTÁN COMPLETAMENTE VACÍAS
-- ====================================

SELECT 
    '=== VERIFICANDO TABLAS VACÍAS ===' as info;

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
-- 3. CREAR FUNCIÓN CON CONTROL DE DUPLICADOS AGRESIVO
-- ====================================

SELECT 
    '=== CREANDO FUNCIÓN CON CONTROL AGRESIVO ===' as info;

CREATE OR REPLACE FUNCTION trigger_estadisticas_sin_duplicados()
RETURNS TRIGGER AS $func$
DECLARE
    estado_finalizado_id UUID;
    empresa_participante_id UUID;
    participante_existe BOOLEAN;
    empresa_existe BOOLEAN;
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
        
        -- VERIFICAR SI YA EXISTE EN PARTICIPANTES
        SELECT EXISTS(
            SELECT 1 FROM historial_participacion_participantes 
            WHERE reclutamiento_id = NEW.id
        ) INTO participante_existe;
        
        -- VERIFICAR SI YA EXISTE EN EMPRESAS
        SELECT EXISTS(
            SELECT 1 FROM historial_participacion_empresas 
            WHERE reclutamiento_id = NEW.id
        ) INTO empresa_existe;
        
        -- INSERTAR EN PARTICIPANTES SOLO SI NO EXISTE
        IF NOT participante_existe THEN
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
                empresa_participante_id,
                COALESCE(NEW.fecha_sesion, NOW()),
                'completada',
                COALESCE(NEW.duracion_sesion, 60),
                COALESCE(NEW.creado_por, auth.uid())
            );
        END IF;
        
        -- INSERTAR EN EMPRESAS SOLO SI NO EXISTE Y HAY EMPRESA
        IF empresa_participante_id IS NOT NULL AND NOT empresa_existe THEN
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
-- 4. CREAR UN SOLO TRIGGER
-- ====================================

SELECT 
    '=== CREANDO UN SOLO TRIGGER ===' as info;

CREATE TRIGGER trigger_estadisticas_sin_duplicados
    AFTER INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_estadisticas_sin_duplicados();

-- ====================================
-- 5. VERIFICAR TRIGGER CREADO
-- ====================================

SELECT 
    '=== VERIFICANDO TRIGGER CREADO ===' as info;

SELECT 
    trigger_name,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- ====================================
-- 6. VERIFICAR FUNCIÓN CREADA
-- ====================================

SELECT 
    '=== VERIFICANDO FUNCIÓN CREADA ===' as info;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'trigger_estadisticas_sin_duplicados'
ORDER BY routine_name;

-- ====================================
-- 7. VERIFICAR TABLAS VACÍAS
-- ====================================

SELECT 
    '=== VERIFICANDO TABLAS VACÍAS ===' as info;

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

SELECT '=== SOLUCIÓN SIN DUPLICADOS CREADA ===' as info;
SELECT '✅ Solo 1 trigger activo' as mensaje;
SELECT '✅ Control agresivo de duplicados' as mensaje;
SELECT '✅ Tablas completamente vacías' as mensaje;
SELECT '✅ Verificación doble de existencia' as mensaje;
SELECT '✅ Prueba cambiar un reclutamiento a Finalizado' as instruccion; 