-- Corregir el trigger problemático
CREATE OR REPLACE FUNCTION trigger_log_cambios_investigacion()
RETURNS TRIGGER AS $$
DECLARE
    descripcion_actividad TEXT;
    tipo_actividad_valor enum_tipo_actividad;
    cambios_json JSONB;
    investigacion_id_valor UUID;
BEGIN
    -- Determinar el tipo de actividad y descripción
    IF TG_OP = 'INSERT' THEN
        tipo_actividad_valor := 'creacion';
        descripcion_actividad := 'Investigación creada';
        cambios_json := to_jsonb(NEW);
        investigacion_id_valor := NEW.id;
    ELSIF TG_OP = 'UPDATE' THEN
        tipo_actividad_valor := 'edicion';
        descripcion_actividad := 'Investigación actualizada';
        cambios_json := jsonb_build_object(
            'valores_anteriores', to_jsonb(OLD),
            'valores_nuevos', to_jsonb(NEW)
        );
        investigacion_id_valor := NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        tipo_actividad_valor := 'eliminacion';
        descripcion_actividad := 'Investigación eliminada';
        cambios_json := to_jsonb(OLD);
        investigacion_id_valor := OLD.id;
    END IF;

    -- Solo insertar si tenemos un investigacion_id válido
    IF investigacion_id_valor IS NOT NULL THEN
        -- Verificar que la investigación aún existe (para evitar errores de FK)
        IF TG_OP = 'DELETE' THEN
            -- Para eliminaciones, no insertar en log ya que la investigación se está eliminando
            RETURN OLD;
        ELSE
            -- Para INSERT y UPDATE, insertar normalmente
            INSERT INTO log_actividades_investigacion (
                investigacion_id,
                tipo_actividad,
                descripcion,
                cambios,
                usuario_id,
                fecha_creacion
            ) VALUES (
                investigacion_id_valor,
                tipo_actividad_valor,
                descripcion_actividad,
                cambios_json,
                COALESCE(NEW.creado_por, OLD.creado_por),
                NOW()
            );
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, solo logear y continuar
        RAISE NOTICE 'Error en trigger_log_cambios_investigacion: %', SQLERRM;
        RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Comentario sobre la función corregida
COMMENT ON FUNCTION trigger_log_cambios_investigacion() IS 'Trigger corregido para manejar eliminaciones sin errores de FK';

-- Verificar que el trigger se actualizó
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_log_actividades_investigacion'
ORDER BY event_manipulation; 