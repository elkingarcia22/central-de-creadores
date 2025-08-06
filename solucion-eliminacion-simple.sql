-- Solución simple para eliminar investigaciones sin problemas de triggers
CREATE OR REPLACE FUNCTION eliminar_investigacion_simple(inv_id UUID)
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

-- Comentario sobre la función
COMMENT ON FUNCTION eliminar_investigacion_simple(UUID) IS 'Elimina una investigación de forma simple sin tocar triggers';

-- Función alternativa que maneja el error específico de clave foránea
CREATE OR REPLACE FUNCTION eliminar_investigacion_manejo_error(inv_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    investigacion_existe BOOLEAN;
    error_count INTEGER := 0;
BEGIN
    -- Verificar si la investigación existe
    SELECT EXISTS(SELECT 1 FROM investigaciones WHERE id = inv_id) INTO investigacion_existe;
    
    IF NOT investigacion_existe THEN
        RAISE NOTICE 'La investigación % no existe', inv_id;
        RETURN FALSE;
    END IF;

    -- Intentar eliminar log_actividades_investigacion
    BEGIN
        DELETE FROM log_actividades_investigacion WHERE investigacion_id = inv_id;
        RAISE NOTICE 'Log actividades eliminadas para investigación %', inv_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Error eliminando log actividades: %', SQLERRM;
            error_count := error_count + 1;
    END;

    -- Intentar eliminar seguimientos_investigacion
    BEGIN
        DELETE FROM seguimientos_investigacion WHERE investigacion_id = inv_id;
        RAISE NOTICE 'Seguimientos eliminados para investigación %', inv_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Error eliminando seguimientos: %', SQLERRM;
            error_count := error_count + 1;
    END;

    -- Intentar eliminar reclutamientos
    BEGIN
        DELETE FROM reclutamientos WHERE investigacion_id = inv_id;
        RAISE NOTICE 'Reclutamientos eliminados para investigación %', inv_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Error eliminando reclutamientos: %', SQLERRM;
            error_count := error_count + 1;
    END;

    -- Intentar eliminar la investigación
    BEGIN
        DELETE FROM investigaciones WHERE id = inv_id;
        RAISE NOTICE 'Investigación % eliminada exitosamente', inv_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Error eliminando investigación: %', SQLERRM;
            error_count := error_count + 1;
    END;

    -- Retornar éxito si no hubo errores críticos
    IF error_count = 0 THEN
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'Se encontraron % errores durante la eliminación', error_count;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Comentario sobre la función
COMMENT ON FUNCTION eliminar_investigacion_manejo_error(UUID) IS 'Elimina una investigación manejando errores individualmente'; 