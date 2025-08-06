-- Verificar todos los triggers en la tabla investigaciones
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'investigaciones'
ORDER BY trigger_name;

-- Verificar si hay algún trigger que inserte en log_actividades_investigacion
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_timing,
    t.action_statement,
    p.proname as function_name
FROM information_schema.triggers t
JOIN pg_trigger pt ON t.trigger_name = pt.tgname
JOIN pg_proc p ON pt.tgfoid = p.oid
WHERE t.event_object_table = 'investigaciones'
ORDER BY t.trigger_name;

-- Verificar la función trigger_log_cambios_investigacion
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname = 'trigger_log_cambios_investigacion'; 