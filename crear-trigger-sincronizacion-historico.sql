-- Trigger para sincronizar automáticamente el historial de participantes externos
CREATE OR REPLACE FUNCTION sincronizar_historial_participantes_externos()
RETURNS TRIGGER AS $$
BEGIN
    -- Si es una inserción y el estado es 'Finalizado'
    IF TG_OP = 'INSERT' AND NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) THEN
        -- Verificar si ya existe en el historial
        IF NOT EXISTS (
            SELECT 1 FROM historial_participacion_participantes 
            WHERE participante_id = NEW.participantes_id 
            AND fecha_participacion = NEW.fecha_sesion
        ) THEN
            -- Insertar en el historial
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
                NEW.fecha_sesion,
                'completada',
                NEW.duracion_sesion,
                NEW.creado_por
            );
        END IF;
    END IF;

    -- Si es una actualización y el estado cambió a 'Finalizado'
    IF TG_OP = 'UPDATE' AND NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) AND OLD.estado_agendamiento != NEW.estado_agendamiento THEN
        -- Verificar si ya existe en el historial
        IF NOT EXISTS (
            SELECT 1 FROM historial_participacion_participantes 
            WHERE participante_id = NEW.participantes_id 
            AND fecha_participacion = NEW.fecha_sesion
        ) THEN
            -- Insertar en el historial
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
                NEW.fecha_sesion,
                'completada',
                NEW.duracion_sesion,
                NEW.creado_por
            );
        END IF;
    END IF;

    -- Si es una eliminación, eliminar del historial
    IF TG_OP = 'DELETE' THEN
        DELETE FROM historial_participacion_participantes 
        WHERE reclutamiento_id = OLD.id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger para participantes externos
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_externos ON reclutamientos;
CREATE TRIGGER trigger_sincronizar_historial_participantes_externos
    AFTER INSERT OR UPDATE OR DELETE ON reclutamientos
    FOR EACH ROW
    WHEN (OLD.participantes_id IS NOT NULL OR NEW.participantes_id IS NOT NULL)
    EXECUTE FUNCTION sincronizar_historial_participantes_externos();

-- Trigger para sincronizar automáticamente el historial de participantes internos
CREATE OR REPLACE FUNCTION sincronizar_historial_participantes_internos()
RETURNS TRIGGER AS $$
BEGIN
    -- Si es una inserción y el estado es 'Finalizado'
    IF TG_OP = 'INSERT' AND NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) THEN
        -- Verificar si ya existe en el historial
        IF NOT EXISTS (
            SELECT 1 FROM historial_participacion_participantes_internos 
            WHERE participante_interno_id = NEW.participantes_internos_id 
            AND fecha_participacion = NEW.fecha_sesion
        ) THEN
            -- Insertar en el historial
            INSERT INTO historial_participacion_participantes_internos (
                participante_interno_id,
                investigacion_id,
                reclutamiento_id,
                fecha_participacion,
                estado_sesion,
                duracion_minutos,
                reclutador_id,
                observaciones,
                creado_por
            ) VALUES (
                NEW.participantes_internos_id,
                NEW.investigacion_id,
                NEW.id,
                NEW.fecha_sesion,
                'completada',
                NEW.duracion_sesion,
                NEW.reclutador_id,
                'Sincronizado automáticamente',
                NEW.creado_por
            );
        END IF;
    END IF;

    -- Si es una actualización y el estado cambió a 'Finalizado'
    IF TG_OP = 'UPDATE' AND NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) AND OLD.estado_agendamiento != NEW.estado_agendamiento THEN
        -- Verificar si ya existe en el historial
        IF NOT EXISTS (
            SELECT 1 FROM historial_participacion_participantes_internos 
            WHERE participante_interno_id = NEW.participantes_internos_id 
            AND fecha_participacion = NEW.fecha_sesion
        ) THEN
            -- Insertar en el historial
            INSERT INTO historial_participacion_participantes_internos (
                participante_interno_id,
                investigacion_id,
                reclutamiento_id,
                fecha_participacion,
                estado_sesion,
                duracion_minutos,
                reclutador_id,
                observaciones,
                creado_por
            ) VALUES (
                NEW.participantes_internos_id,
                NEW.investigacion_id,
                NEW.id,
                NEW.fecha_sesion,
                'completada',
                NEW.duracion_sesion,
                NEW.reclutador_id,
                'Sincronizado automáticamente',
                NEW.creado_por
            );
        END IF;
    END IF;

    -- Si es una eliminación, eliminar del historial
    IF TG_OP = 'DELETE' THEN
        DELETE FROM historial_participacion_participantes_internos 
        WHERE reclutamiento_id = OLD.id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger para participantes internos
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_internos ON reclutamientos;
CREATE TRIGGER trigger_sincronizar_historial_participantes_internos
    AFTER INSERT OR UPDATE OR DELETE ON reclutamientos
    FOR EACH ROW
    WHEN (OLD.participantes_internos_id IS NOT NULL OR NEW.participantes_internos_id IS NOT NULL)
    EXECUTE FUNCTION sincronizar_historial_participantes_internos(); 