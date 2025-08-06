-- Crear función para actualizar hora_sesion
CREATE OR REPLACE FUNCTION actualizar_hora_sesion_reclutamientos()
RETURNS TABLE(
    id uuid,
    fecha_sesion timestamp with time zone,
    hora_sesion_anterior time,
    hora_sesion_nueva time,
    registros_actualizados bigint
) AS $$
DECLARE
    registros_actualizados bigint;
BEGIN
    -- Actualizar hora_sesion para registros existentes
    UPDATE reclutamientos 
    SET hora_sesion = 
        EXTRACT(HOUR FROM fecha_sesion)::text || ':' || 
        LPAD(EXTRACT(MINUTE FROM fecha_sesion)::text, 2, '0') || ':' ||
        LPAD(EXTRACT(SECOND FROM fecha_sesion)::text, 2, '0')::time
    WHERE fecha_sesion IS NOT NULL 
    AND hora_sesion IS NULL;
    
    GET DIAGNOSTICS registros_actualizados = ROW_COUNT;
    
    -- Retornar información de los registros actualizados
    RETURN QUERY
    SELECT 
        r.id,
        r.fecha_sesion,
        r.hora_sesion as hora_sesion_anterior,
        r.hora_sesion as hora_sesion_nueva,
        registros_actualizados
    FROM reclutamientos r
    WHERE r.fecha_sesion IS NOT NULL 
    AND r.hora_sesion IS NOT NULL
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Verificar que la función se creó correctamente
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'actualizar_hora_sesion_reclutamientos'; 