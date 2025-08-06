-- Solución específica para el trigger trigger_log_cambios_investigacion
CREATE OR REPLACE FUNCTION eliminar_investigacion_sin_log(inv_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    investigacion_existe BOOLEAN;
    trigger_name TEXT := 'trigger_log_actividades_investigacion';
BEGIN
    -- Verificar si la investigación existe
    SELECT EXISTS(SELECT 1 FROM investigaciones WHERE id = inv_id) INTO investigacion_existe;
    
    IF NOT investigacion_existe THEN
        RAISE NOTICE 'La investigación % no existe', inv_id;
        RETURN FALSE;
    END IF;

    -- Deshabilitar específicamente el trigger problemático
    ALTER TABLE investigaciones DISABLE TRIGGER trigger_log_actividades_investigacion;
    RAISE NOTICE 'Trigger trigger_log_actividades_investigacion deshabilitado';

    -- Eliminar dependencias en orden
    DELETE FROM log_actividades_investigacion WHERE investigacion_id = inv_id;
    RAISE NOTICE 'Log actividades eliminadas para investigación %', inv_id;

    DELETE FROM seguimientos_investigacion WHERE investigacion_id = inv_id;
    RAISE NOTICE 'Seguimientos eliminados para investigación %', inv_id;

    DELETE FROM reclutamientos WHERE investigacion_id = inv_id;
    RAISE NOTICE 'Reclutamientos eliminados para investigación %', inv_id;

    -- Eliminar la investigación
    DELETE FROM investigaciones WHERE id = inv_id;
    RAISE NOTICE 'Investigación % eliminada exitosamente', inv_id;

    -- Restaurar el trigger
    ALTER TABLE investigaciones ENABLE TRIGGER trigger_log_actividades_investigacion;
    RAISE NOTICE 'Trigger trigger_log_actividades_investigacion restaurado';

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Restaurar el trigger en caso de error
        BEGIN
            ALTER TABLE investigaciones ENABLE TRIGGER trigger_log_actividades_investigacion;
            RAISE NOTICE 'Trigger restaurado después de error';
        EXCEPTION
            WHEN OTHERS THEN
                NULL; -- Ignorar errores al restaurar
        END;
        
        RAISE NOTICE 'Error eliminando investigación %: %', inv_id, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Comentario sobre la función
COMMENT ON FUNCTION eliminar_investigacion_sin_log(UUID) IS 'Elimina una investigación deshabilitando temporalmente el trigger trigger_log_actividades_investigacion';

-- Función para deshabilitar manualmente el trigger
CREATE OR REPLACE FUNCTION deshabilitar_trigger_log_actividades()
RETURNS VOID AS $$
BEGIN
    ALTER TABLE investigaciones DISABLE TRIGGER trigger_log_actividades_investigacion;
    RAISE NOTICE 'Trigger trigger_log_actividades_investigacion deshabilitado';
END;
$$ LANGUAGE plpgsql;

-- Función para habilitar manualmente el trigger
CREATE OR REPLACE FUNCTION habilitar_trigger_log_actividades()
RETURNS VOID AS $$
BEGIN
    ALTER TABLE investigaciones ENABLE TRIGGER trigger_log_actividades_investigacion;
    RAISE NOTICE 'Trigger trigger_log_actividades_investigacion habilitado';
END;
$$ LANGUAGE plpgsql;

-- Función para verificar el estado del trigger
CREATE OR REPLACE FUNCTION verificar_estado_trigger()
RETURNS TABLE(trigger_name TEXT, enabled BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.trigger_name::TEXT,
        pt.tgenabled = 't' as enabled
    FROM information_schema.triggers t
    JOIN pg_trigger pt ON t.trigger_name = pt.tgname
    WHERE t.event_object_table = 'investigaciones'
    AND t.trigger_name = 'trigger_log_actividades_investigacion';
END;
$$ LANGUAGE plpgsql; 