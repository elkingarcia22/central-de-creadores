-- Revertir la función de asignación automática de estados
-- Eliminar la función si existe
DROP FUNCTION IF EXISTS asignar_estado_agendamiento_automatico();

-- Eliminar el trigger si existe
DROP TRIGGER IF EXISTS trigger_asignar_estado_agendamiento ON reclutamientos;

-- Verificar que no queden referencias
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos'; 