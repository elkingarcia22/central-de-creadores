-- Verificar exactamente dónde está el trigger trigger_log_actividades_investigacion
SELECT 
    trigger_name,
    event_object_table,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_log_actividades_investigacion'
ORDER BY event_object_table;

-- Verificar todos los triggers que contengan "log_actividades" en el nombre
SELECT 
    trigger_name,
    event_object_table,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%log_actividades%'
ORDER BY event_object_table, trigger_name;

-- Verificar todos los triggers en la tabla investigaciones
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'investigaciones'
ORDER BY trigger_name;

-- Verificar si existe la tabla log_actividades_investigacion
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'log_actividades_investigacion';

-- Verificar todas las tablas que contengan "log" en el nombre
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name LIKE '%log%'
ORDER BY table_name; 