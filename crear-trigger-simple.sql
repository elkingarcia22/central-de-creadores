-- Trigger simple para participantes externos
CREATE OR REPLACE FUNCTION sincronizar_historial_externos()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo cuando se actualiza a Finalizado
    IF TG_OP = 'UPDATE' AND NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) AND OLD.estado_agendamiento != NEW.estado_agendamiento THEN
        
        -- Insertar en el historial si no existe
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
        ) ON CONFLICT (participante_id, fecha_participacion) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_sincronizar_externos ON reclutamientos;
CREATE TRIGGER trigger_sincronizar_externos
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    WHEN (NEW.participantes_id IS NOT NULL)
    EXECUTE FUNCTION sincronizar_historial_externos(); 