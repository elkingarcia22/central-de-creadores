-- Solución para eliminar investigaciones deshabilitando triggers de la tabla investigaciones
CREATE OR REPLACE FUNCTION eliminar_investigacion_deshabilitar_triggers(inv_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    investigacion_existe BOOLEAN;
    trigger_names TEXT[];
    trigger_name TEXT;
BEGIN
    -- Verificar si la investigación existe
    SELECT EXISTS(SELECT 1 FROM investigaciones WHERE id = inv_id) INTO investigacion_existe;
    
    IF NOT investigacion_existe THEN
        RAISE NOTICE 'La investigación % no existe', inv_id;
        RETURN FALSE;
    END IF;

    -- Obtener todos los triggers de la tabla investigaciones
    SELECT array_agg(trigger_name) INTO trigger_names
    FROM information_schema.triggers 
    WHERE event_object_table = 'investigaciones';

    -- Deshabilitar todos los triggers de investigaciones
    IF trigger_names IS NOT NULL THEN
        FOREACH trigger_name IN ARRAY trigger_names
        LOOP
            EXECUTE format('ALTER TABLE investigaciones DISABLE TRIGGER %I', trigger_name);
            RAISE NOTICE 'Trigger % deshabilitado en tabla investigaciones', trigger_name;
        END LOOP;
    END IF;

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

    -- Restaurar triggers de investigaciones
    IF trigger_names IS NOT NULL THEN
        FOREACH trigger_name IN ARRAY trigger_names
        LOOP
            EXECUTE format('ALTER TABLE investigaciones ENABLE TRIGGER %I', trigger_name);
            RAISE NOTICE 'Trigger % restaurado en tabla investigaciones', trigger_name;
        END LOOP;
    END IF;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Restaurar triggers en caso de error
        BEGIN
            IF trigger_names IS NOT NULL THEN
                FOREACH trigger_name IN ARRAY trigger_names
                LOOP
                    EXECUTE format('ALTER TABLE investigaciones ENABLE TRIGGER %I', trigger_name);
                END LOOP;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                NULL; -- Ignorar errores al restaurar triggers
        END;
        
        RAISE NOTICE 'Error eliminando investigación %: %', inv_id, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Comentario sobre la función
COMMENT ON FUNCTION eliminar_investigacion_deshabilitar_triggers(UUID) IS 'Elimina una investigación deshabilitando temporalmente los triggers de la tabla investigaciones';

-- Función para deshabilitar manualmente todos los triggers de investigaciones
CREATE OR REPLACE FUNCTION deshabilitar_triggers_investigaciones()
RETURNS VOID AS $$
DECLARE
    trigger_names TEXT[];
    trigger_name TEXT;
BEGIN
    SELECT array_agg(trigger_name) INTO trigger_names
    FROM information_schema.triggers 
    WHERE event_object_table = 'investigaciones';

    IF trigger_names IS NOT NULL THEN
        FOREACH trigger_name IN ARRAY trigger_names
        LOOP
            EXECUTE format('ALTER TABLE investigaciones DISABLE TRIGGER %I', trigger_name);
            RAISE NOTICE 'Trigger % deshabilitado', trigger_name;
        END LOOP;
    ELSE
        RAISE NOTICE 'No se encontraron triggers en la tabla investigaciones';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para habilitar manualmente todos los triggers de investigaciones
CREATE OR REPLACE FUNCTION habilitar_triggers_investigaciones()
RETURNS VOID AS $$
DECLARE
    trigger_names TEXT[];
    trigger_name TEXT;
BEGIN
    SELECT array_agg(trigger_name) INTO trigger_names
    FROM information_schema.triggers 
    WHERE event_object_table = 'investigaciones';

    IF trigger_names IS NOT NULL THEN
        FOREACH trigger_name IN ARRAY trigger_names
        LOOP
            EXECUTE format('ALTER TABLE investigaciones ENABLE TRIGGER %I', trigger_name);
            RAISE NOTICE 'Trigger % habilitado', trigger_name;
        END LOOP;
    ELSE
        RAISE NOTICE 'No se encontraron triggers en la tabla investigaciones';
    END IF;
END;
$$ LANGUAGE plpgsql; 