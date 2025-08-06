-- Verificar el estado actual de hora_sesion
SELECT 
    id,
    fecha_sesion,
    hora_sesion,
    CASE 
        WHEN fecha_sesion IS NOT NULL THEN 
            (EXTRACT(HOUR FROM fecha_sesion)::text || ':' || 
            LPAD(EXTRACT(MINUTE FROM fecha_sesion)::text, 2, '0') || ':' ||
            LPAD(EXTRACT(SECOND FROM fecha_sesion)::text, 2, '0'))::time
        ELSE NULL
    END as hora_calculada
FROM reclutamientos 
WHERE fecha_sesion IS NOT NULL 
LIMIT 10;

-- Actualizar hora_sesion para registros existentes
UPDATE reclutamientos 
SET hora_sesion = 
    (EXTRACT(HOUR FROM fecha_sesion)::text || ':' || 
    LPAD(EXTRACT(MINUTE FROM fecha_sesion)::text, 2, '0') || ':' ||
    LPAD(EXTRACT(SECOND FROM fecha_sesion)::text, 2, '0'))::time
WHERE fecha_sesion IS NOT NULL 
AND hora_sesion IS NULL;

-- Verificar el resultado
SELECT 
    id,
    fecha_sesion,
    hora_sesion
FROM reclutamientos 
WHERE fecha_sesion IS NOT NULL 
LIMIT 5; 