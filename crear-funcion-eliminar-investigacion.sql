-- Función para eliminar una investigación de forma segura
CREATE OR REPLACE FUNCTION eliminar_investigacion_segura(inv_id UUID)
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

    -- Deshabilitar triggers temporalmente para evitar conflictos
    SET session_replication_role = replica;

    -- 1. Eliminar log_actividades_investigacion
    DELETE FROM log_actividades_investigacion WHERE investigacion_id = inv_id;
    RAISE NOTICE 'Log actividades eliminadas para investigación %', inv_id;

    -- 2. Eliminar seguimientos_investigacion
    DELETE FROM seguimientos_investigacion WHERE investigacion_id = inv_id;
    RAISE NOTICE 'Seguimientos eliminados para investigación %', inv_id;

    -- 3. Eliminar reclutamientos
    DELETE FROM reclutamientos WHERE investigacion_id = inv_id;
    RAISE NOTICE 'Reclutamientos eliminados para investigación %', inv_id;

    -- 4. Finalmente eliminar la investigación
    DELETE FROM investigaciones WHERE id = inv_id;
    RAISE NOTICE 'Investigación % eliminada exitosamente', inv_id;

    -- Restaurar triggers
    SET session_replication_role = DEFAULT;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Restaurar triggers en caso de error
        SET session_replication_role = DEFAULT;
        RAISE NOTICE 'Error eliminando investigación %: %', inv_id, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Comentario sobre la función
COMMENT ON FUNCTION eliminar_investigacion_segura(UUID) IS 'Elimina una investigación y todas sus dependencias de forma segura'; 