-- ====================================
-- REACTIVAR TRIGGER DE PARTICIPANTES
-- ====================================
-- Problema: Las tablas de historial están vacías y no se llenan automáticamente
-- Solución: Reactivar el trigger de participantes
-- Objetivo: Que las estadísticas se actualicen automáticamente

-- ====================================
-- 1. VERIFICAR TRIGGERS ACTUALES
-- ====================================

SELECT '=== VERIFICAR TRIGGERS ACTUALES ===' as info;

-- Verificar triggers activos en reclutamientos
SELECT 
    'Triggers activos en reclutamientos' as info,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- Verificar funciones relacionadas
SELECT 
    'Funciones relacionadas con triggers' as info,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (routine_name LIKE '%trigger%' OR routine_name LIKE '%participante%')
ORDER BY routine_name;

-- ====================================
-- 2. CREAR FUNCIÓN PARA PARTICIPANTES
-- ====================================

SELECT '=== CREANDO FUNCIÓN PARA PARTICIPANTES ===' as info;

-- Crear función para manejar participantes externos
CREATE OR REPLACE FUNCTION trigger_participantes_externos()
RETURNS TRIGGER AS $$
BEGIN
    -- Log para debugging
    RAISE LOG 'trigger_participantes_externos: Iniciando con NEW.estado_agendamiento = %', NEW.estado_agendamiento;
    
    -- Solo procesar si hay participante externo y el estado cambió a Finalizado
    IF NEW.participantes_id IS NOT NULL 
    AND NEW.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != NEW.estado_agendamiento) THEN
        
        RAISE LOG 'trigger_participantes_externos: Procesando participante %', NEW.participantes_id;
        
        -- Eliminar registro existente si existe
        DELETE FROM historial_participacion_participantes 
        WHERE reclutamiento_id = NEW.id;
        
        RAISE LOG 'trigger_participantes_externos: Registro eliminado del historial';
        
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
        
        RAISE LOG 'trigger_participantes_externos: Registro insertado en historial';
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT 'Función trigger_participantes_externos creada' as resultado;

-- ====================================
-- 3. CREAR FUNCIÓN PARA EMPRESAS
-- ====================================

SELECT '=== CREANDO FUNCIÓN PARA EMPRESAS ===' as info;

-- Crear función para manejar empresas
CREATE OR REPLACE FUNCTION trigger_empresas()
RETURNS TRIGGER AS $$
BEGIN
    -- Log para debugging
    RAISE LOG 'trigger_empresas: Iniciando con NEW.estado_agendamiento = %', NEW.estado_agendamiento;
    
    -- Solo procesar si hay participante y el estado cambió a Finalizado
    IF NEW.participantes_id IS NOT NULL 
    AND NEW.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != NEW.estado_agendamiento) THEN
        
        RAISE LOG 'trigger_empresas: Procesando empresa para participante %', NEW.participantes_id;
        
        -- Obtener empresa_id del participante
        DECLARE
            empresa_participante_id UUID;
        BEGIN
            SELECT empresa_id INTO empresa_participante_id 
            FROM participantes 
            WHERE id = NEW.participantes_id;
            
            IF empresa_participante_id IS NOT NULL THEN
                -- Eliminar registro existente si existe
                DELETE FROM historial_participacion_empresas 
                WHERE reclutamiento_id = NEW.id;
                
                RAISE LOG 'trigger_empresas: Registro eliminado del historial';
                
                -- Insertar nuevo registro en historial
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
                
                RAISE LOG 'trigger_empresas: Registro insertado en historial';
            END IF;
        END;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT 'Función trigger_empresas creada' as resultado;

-- ====================================
-- 4. CREAR TRIGGERS
-- ====================================

SELECT '=== CREANDO TRIGGERS ===' as info;

-- Trigger para participantes externos (INSERT)
CREATE TRIGGER trigger_participantes_externos_insert
    AFTER INSERT ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_externos();

-- Trigger para participantes externos (UPDATE)
CREATE TRIGGER trigger_participantes_externos_update
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_externos();

-- Trigger para empresas (INSERT)
CREATE TRIGGER trigger_empresas_insert
    AFTER INSERT ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_empresas();

-- Trigger para empresas (UPDATE)
CREATE TRIGGER trigger_empresas_update
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_empresas();

SELECT 'Triggers creados' as resultado;

-- ====================================
-- 5. VERIFICAR TRIGGERS CREADOS
-- ====================================

SELECT '=== VERIFICAR TRIGGERS CREADOS ===' as info;

-- Verificar que los triggers se crearon
SELECT 
    'Triggers activos después de crear' as info,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- ====================================
-- 6. PROBAR CON DATOS EXISTENTES
-- ====================================

SELECT '=== PROBAR CON DATOS EXISTENTES ===' as info;

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
-- 7. INSTRUCCIONES PARA PRUEBA
-- ====================================

SELECT '=== INSTRUCCIONES PARA PRUEBA ===' as info;
SELECT '1. Los triggers están activos para participantes y empresas' as paso1;
SELECT '2. Prueba crear un nuevo reclutamiento' as paso2;
SELECT '3. Cambia el estado a Finalizado' as paso3;
SELECT '4. Verifica que se agregue al historial automáticamente' as paso4;
SELECT '5. Las estadísticas deberían actualizarse automáticamente' as paso5;

-- ====================================
-- 8. COMANDOS DE VERIFICACIÓN
-- ====================================

SELECT '=== COMANDOS DE VERIFICACIÓN ===' as info;
SELECT 'Para ver historial participantes: SELECT * FROM historial_participacion_participantes;' as comando1;
SELECT 'Para ver historial empresas: SELECT * FROM historial_participacion_empresas;' as comando2;
SELECT 'Para ver estadísticas participantes: SELECT * FROM vista_estadisticas_participantes;' as comando3;
SELECT 'Para ver estadísticas empresas: SELECT * FROM vista_estadisticas_empresas;' as comando4;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== TRIGGERS REACTIVADOS ===' as info;
SELECT '✅ Triggers creados para participantes y empresas' as mensaje;
SELECT '✅ Las estadísticas se actualizarán automáticamente' as explicacion;
SELECT '✅ Prueba crear un nuevo reclutamiento' as instruccion;
SELECT '⚠️ Verifica que las estadísticas se actualicen correctamente' as nota; 