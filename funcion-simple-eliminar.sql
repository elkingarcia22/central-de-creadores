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

-- Comentario sobre la función
COMMENT ON FUNCTION eliminar_investigacion_final(UUID) IS 'Elimina una investigación de forma simple sin tocar triggers'; 