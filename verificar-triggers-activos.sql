-- Verificar triggers activos en investigaciones
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'investigaciones';

-- Verificar triggers activos en reclutamientos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos';

-- Verificar si el trigger específico existe
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_crear_reclutamiento_por_agendar'; 