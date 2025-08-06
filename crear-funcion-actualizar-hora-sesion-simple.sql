-- Crear función simple para actualizar hora_sesion
CREATE OR REPLACE FUNCTION actualizar_hora_sesion_simple(reclutamiento_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE reclutamientos 
    SET hora_sesion = to_char(fecha_sesion, 'HH24:MI:SS')::time
    WHERE id = reclutamiento_id
    AND fecha_sesion IS NOT NULL 
    AND hora_sesion IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Verificar que la función se creó correctamente
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'actualizar_hora_sesion_simple'; 