-- Asignar estados por defecto a reclutamientos sin estado

-- 1. Obtener IDs de estados
DO $$
DECLARE
    estado_pendiente_id UUID;
    estado_en_progreso_id UUID;
    estado_agendada_id UUID;
BEGIN
    -- Obtener IDs de estados
    SELECT id INTO estado_pendiente_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente';
    SELECT id INTO estado_en_progreso_id FROM estado_agendamiento_cat WHERE nombre = 'En progreso';
    SELECT id INTO estado_agendada_id FROM estado_agendamiento_cat WHERE nombre = 'Agendada';
    
    -- Asignar estados por defecto según las condiciones
    UPDATE reclutamientos 
    SET estado_agendamiento = CASE
        WHEN fecha_sesion IS NULL THEN estado_pendiente_id
        WHEN fecha_sesion IS NOT NULL AND fecha_sesion > NOW() THEN estado_en_progreso_id
        WHEN fecha_sesion IS NOT NULL AND fecha_sesion <= NOW() THEN estado_agendada_id
        ELSE estado_pendiente_id
    END
    WHERE estado_agendamiento IS NULL;
    
    RAISE NOTICE 'Estados asignados por defecto';
END $$;

-- 2. Verificar resultado
SELECT 
    COUNT(*) as total_reclutamientos,
    COUNT(estado_agendamiento) as con_estado,
    COUNT(*) - COUNT(estado_agendamiento) as sin_estado
FROM reclutamientos;

-- 3. Ver algunos ejemplos
SELECT 
    id,
    investigacion_id,
    estado_agendamiento,
    fecha_sesion,
    participantes_id,
    participantes_internos_id,
    participantes_friend_family_id
FROM reclutamientos
LIMIT 5; 