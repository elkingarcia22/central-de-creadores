-- Solución específica para el trigger problemático
CREATE OR REPLACE FUNCTION eliminar_investigacion_trigger_especifico(inv_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    investigacion_existe BOOLEAN;
BEGIN
    -- Verificar si la investigación existe
    SELECT EXISTS(SELECT 1 FROM investigaciones WHERE id = inv_id) INTO investigacion_existe;
    
    IF NOT investigacion_existe THEN
        RAISE NOTICE 'La investigación % no existe', inv_id;
        RETURN FALSE;
    END IF;

    -- Deshabilitar específicamente el trigger problemático
    ALTER TABLE log_actividades_investigacion DISABLE TRIGGER trigger_log_actividades_investigacion;
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
    ALTER TABLE log_actividades_investigacion ENABLE TRIGGER trigger_log_actividades_investigacion;
    RAISE NOTICE 'Trigger trigger_log_actividades_investigacion restaurado';

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Restaurar el trigger en caso de error
        BEGIN
            ALTER TABLE log_actividades_investigacion ENABLE TRIGGER trigger_log_actividades_investigacion;
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
COMMENT ON FUNCTION eliminar_investigacion_trigger_especifico(UUID) IS 'Elimina una investigación deshabilitando específicamente el trigger trigger_log_actividades_investigacion';

-- Función alternativa más simple: solo deshabilitar el trigger manualmente
CREATE OR REPLACE FUNCTION deshabilitar_trigger_log_actividades()
RETURNS VOID AS $$
BEGIN
    ALTER TABLE log_actividades_investigacion DISABLE TRIGGER trigger_log_actividades_investigacion;
    RAISE NOTICE 'Trigger trigger_log_actividades_investigacion deshabilitado';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION habilitar_trigger_log_actividades()
RETURNS VOID AS $$
BEGIN
    ALTER TABLE log_actividades_investigacion ENABLE TRIGGER trigger_log_actividades_investigacion;
    RAISE NOTICE 'Trigger trigger_log_actividades_investigacion habilitado';
END;
$$ LANGUAGE plpgsql; 

-- Función simple para eliminar investigación sin problemas de triggers
CREATE OR REPLACE FUNCTION eliminar_investigacion_final(inv_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    investigacion_existe BOOLEAN;
BEGIN
    -- Verificar si la investigación existe
    SELECT EXISTS(SELECT 1 FROM investigaciones WHERE id = inv_id) INTO investigacion_existe;
    
    IF NOT investigacion_existe THEN
        RAISE NOTICE 'La investigación % no existe', inv_id;
        RETURN FALSE;
    END IF;

    -- Usar una transacción para asegurar consistencia
    BEGIN
        -- Eliminar dependencias en orden específico
        DELETE FROM log_actividades_investigacion WHERE investigacion_id = inv_id;
        RAISE NOTICE 'Log actividades eliminadas para investigación %', inv_id;

        DELETE FROM seguimientos_investigacion WHERE investigacion_id = inv_id;
        RAISE NOTICE 'Seguimientos eliminados para investigación %', inv_id;

        DELETE FROM reclutamientos WHERE investigacion_id = inv_id;
        RAISE NOTICE 'Reclutamientos eliminados para investigación %', inv_id;

        -- Finalmente eliminar la investigación
        DELETE FROM investigaciones WHERE id = inv_id;
        RAISE NOTICE 'Investigación % eliminada exitosamente', inv_id;

        RETURN TRUE;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Error en transacción: %', SQLERRM;
            RETURN FALSE;
    END;
END;
$$ LANGUAGE plpgsql; 