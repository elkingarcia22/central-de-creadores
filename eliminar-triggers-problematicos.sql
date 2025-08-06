-- Eliminar triggers problemáticos que pueden estar interfiriendo
-- con la asignación automática de estados

-- 1. Eliminar trigger de actualización de estado
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reclutamiento ON reclutamientos;

-- 2. Eliminar trigger de participantes friend family
DROP TRIGGER IF EXISTS trigger_participantes_friend_family_trigger ON reclutamientos;

-- 3. Eliminar trigger de participantes internos
DROP TRIGGER IF EXISTS trigger_participantes_internos ON reclutamientos;

-- 4. Eliminar trigger de participantes solo
DROP TRIGGER IF EXISTS trigger_participantes_solo ON reclutamientos;

-- Verificar que se eliminaron
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos';

-- Verificar el estado actual de los reclutamientos
SELECT 
    id,
    investigacion_id,
    estado_agendamiento,
    fecha_asignado,
    updated_at
FROM reclutamientos 
ORDER BY updated_at DESC; 