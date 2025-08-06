-- Automatizar actualización de estados de reclutamiento
-- Este trigger se ejecutará automáticamente cuando se actualice un reclutamiento

-- Función para actualizar el estado de reclutamiento automáticamente
CREATE OR REPLACE FUNCTION actualizar_estado_reclutamiento_automatico()
RETURNS TRIGGER AS $$
DECLARE
    tiene_participantes BOOLEAN;
    nuevo_estado_id UUID;
    fecha_sesion TIMESTAMP;
    duracion_minutos INTEGER;
    fecha_fin TIMESTAMP;
    ahora TIMESTAMP;
BEGIN
    -- Verificar si tiene participantes
    tiene_participantes := (
        NEW.participantes_id IS NOT NULL OR 
        NEW.participantes_internos_id IS NOT NULL OR 
        NEW.participantes_friend_family_id IS NOT NULL
    );
    
    -- Obtener fecha de sesión
    fecha_sesion := NEW.fecha_sesion;
    duracion_minutos := COALESCE(NEW.duracion_sesion, 60);
    
    -- Calcular fecha fin
    IF fecha_sesion IS NOT NULL THEN
        fecha_fin := fecha_sesion + INTERVAL '1 minute' * duracion_minutos;
    END IF;
    
    ahora := NOW();
    
    -- Determinar nuevo estado
    IF fecha_sesion IS NULL THEN
        -- Sin fecha de sesión
        IF tiene_participantes THEN
            nuevo_estado_id := (SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'En progreso');
        ELSE
            nuevo_estado_id := (SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente');
        END IF;
    ELSE
        -- Con fecha de sesión
        IF ahora < fecha_sesion THEN
            -- Sesión futura
            IF tiene_participantes THEN
                nuevo_estado_id := (SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'En progreso');
            ELSE
                nuevo_estado_id := (SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente');
            END IF;
        ELSIF ahora >= fecha_sesion AND ahora <= fecha_fin THEN
            -- Sesión en curso
            nuevo_estado_id := (SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'En progreso');
        ELSE
            -- Sesión pasada
            nuevo_estado_id := (SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'Agendada');
        END IF;
    END IF;
    
    -- Actualizar el estado en la investigación
    IF nuevo_estado_id IS NOT NULL THEN
        UPDATE investigaciones 
        SET estado_reclutamiento = nuevo_estado_id
        WHERE id = NEW.investigacion_id;
        
        RAISE NOTICE 'Estado de reclutamiento actualizado automáticamente: %', nuevo_estado_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger que se ejecute después de INSERT o UPDATE en reclutamientos
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reclutamiento ON reclutamientos;

CREATE TRIGGER trigger_actualizar_estado_reclutamiento
    AFTER INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estado_reclutamiento_automatico();

-- Comentario explicativo
COMMENT ON FUNCTION actualizar_estado_reclutamiento_automatico() IS 
'Función que actualiza automáticamente el estado de reclutamiento en investigaciones basado en:
- Presencia de participantes
- Fecha de sesión
- Duración de sesión
- Estado actual de la sesión (futura, en curso, pasada)'; 