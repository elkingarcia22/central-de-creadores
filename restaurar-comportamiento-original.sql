-- Restaurar el comportamiento original de creación de reclutamientos
-- Esto asegura que los nuevos reclutamientos NO tengan estado_agendamiento por defecto

-- Verificar reclutamientos sin estado
SELECT 
    id,
    investigacion_id,
    estado_agendamiento,
    fecha_asignado,
    updated_at
FROM reclutamientos 
WHERE estado_agendamiento IS NULL
ORDER BY updated_at DESC;

-- Mostrar todos los reclutamientos para comparar
SELECT 
    id,
    investigacion_id,
    estado_agendamiento,
    fecha_asignado,
    updated_at
FROM reclutamientos 
ORDER BY updated_at DESC
LIMIT 10; 