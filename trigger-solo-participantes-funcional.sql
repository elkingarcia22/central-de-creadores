-- ====================================
-- TRIGGER SOLO PARA PARTICIPANTES
-- ====================================
-- Objetivo: Implementar solo la automatización de participantes
-- que anteriormente funcionó bien
-- Excluye: Empresas (para evitar conflictos)

-- ====================================
-- 1. CREAR FUNCIÓN PARA PARTICIPANTES
-- ====================================

CREATE OR REPLACE FUNCTION trigger_participantes_solo()
RETURNS TRIGGER AS $$
BEGIN
    -- Log para debugging
    RAISE LOG 'trigger_participantes_solo: Iniciando con NEW.estado_agendamiento = %', NEW.estado_agendamiento;
    
    -- Solo procesar si hay participante y el estado cambió a Finalizado
    IF NEW.participantes_id IS NOT NULL 
    AND NEW.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != NEW.estado_agendamiento) THEN
        
        RAISE LOG 'trigger_participantes_solo: Procesando participante %', NEW.participantes_id;
        
        -- Eliminar registro existente si existe
        DELETE FROM historial_participacion_participantes 
        WHERE reclutamiento_id = NEW.id;
        
        RAISE LOG 'trigger_participantes_solo: Registro eliminado del historial';
        
        -- Insertar nuevo registro en historial
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
        
        RAISE LOG 'trigger_participantes_solo: Registro insertado en historial';
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 2. CREAR TRIGGER PARA PARTICIPANTES
-- ====================================

-- Trigger para INSERT
CREATE TRIGGER trigger_participantes_solo_insert
    AFTER INSERT ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_solo();

-- Trigger para UPDATE
CREATE TRIGGER trigger_participantes_solo_update
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_solo();

-- ====================================
-- 3. VERIFICAR CREACIÓN
-- ====================================

SELECT '=== TRIGGER PARTICIPANTES CREADO ===' as info;

-- Verificar que el trigger se creó
SELECT 
    'Triggers activos para participantes' as info,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
AND trigger_name LIKE '%participantes%'
ORDER BY trigger_name;

-- Verificar que la función se creó
SELECT 
    'Función creada' as info,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'trigger_participantes_solo';

-- ====================================
-- 4. PROBAR CON DATOS EXISTENTES
-- ====================================

SELECT '=== PROBANDO CON DATOS EXISTENTES ===' as info;

-- Verificar reclutamientos finalizados sin historial
SELECT 
    'Reclutamientos finalizados sin historial' as info,
    r.id,
    r.participantes_id,
    p.nombre as nombre_participante
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN historial_participacion_participantes hpp ON r.id = hpp.reclutamiento_id
WHERE r.participantes_id IS NOT NULL
AND r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
AND hpp.reclutamiento_id IS NULL;

-- ====================================
-- 5. INSTRUCCIONES DE PRUEBA
-- ====================================

SELECT '=== INSTRUCCIONES DE PRUEBA ===' as info;
SELECT '1. El trigger solo maneja participantes (no empresas)' as paso1;
SELECT '2. Prueba crear un reclutamiento con participante' as paso2;
SELECT '3. Cambia el estado a Finalizado' as paso3;
SELECT '4. Verifica que se agregue al historial de participantes' as paso4;
SELECT '5. Las estadísticas de empresas se manejarán manualmente' as paso5;

-- ====================================
-- 6. COMANDOS DE VERIFICACIÓN
-- ====================================

SELECT '=== COMANDOS DE VERIFICACIÓN ===' as info;
SELECT 'Para ver historial participantes: SELECT * FROM historial_participacion_participantes;' as comando1;
SELECT 'Para ver estadísticas participantes: SELECT * FROM vista_estadisticas_participantes;' as comando2;
SELECT 'Para ver reclutamientos finalizados: SELECT * FROM reclutamientos WHERE estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = ''Finalizado'');' as comando3;
SELECT 'Para actualizar empresas manualmente: SELECT actualizar_estadisticas_manual();' as comando4;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== TRIGGER SOLO PARTICIPANTES IMPLEMENTADO ===' as info;
SELECT '✅ Trigger creado solo para participantes' as mensaje;
SELECT '✅ No interfiere con empresas' as explicacion;
SELECT '✅ Debería funcionar automáticamente para participantes' as funcionamiento;
SELECT '⚠️ Empresas se manejarán manualmente por ahora' as nota; 