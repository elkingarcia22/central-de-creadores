-- Diagnóstico completo de eliminación de investigaciones
-- Ejecutar esto para la investigación específica que no se puede eliminar

-- 1. Verificar si la investigación existe
SELECT 
    id,
    nombre,
    estado,
    libreto,
    creado_el
FROM investigaciones 
WHERE id = '917e6fe5-22e7-4e99-b7d9-dec453aad389';

-- 2. Verificar todas las dependencias
-- Log actividades
SELECT COUNT(*) as total_log_actividades
FROM log_actividades_investigacion 
WHERE investigacion_id = '917e6fe5-22e7-4e99-b7d9-dec453aad389';

-- Seguimientos
SELECT COUNT(*) as total_seguimientos
FROM seguimientos_investigacion 
WHERE investigacion_id = '917e6fe5-22e7-4e99-b7d9-dec453aad389';

-- Reclutamientos
SELECT COUNT(*) as total_reclutamientos
FROM reclutamientos 
WHERE investigacion_id = '917e6fe5-22e7-4e99-b7d9-dec453aad389';

-- 3. Verificar restricciones de clave foránea
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND (tc.table_name = 'investigaciones' OR ccu.table_name = 'investigaciones');

-- 4. Verificar si hay otros triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    pt.tgenabled as enabled
FROM information_schema.triggers t
JOIN pg_trigger pt ON t.trigger_name = pt.tgname
WHERE t.event_object_table = 'investigaciones'
ORDER BY trigger_name;

-- 5. Verificar RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'investigaciones';

-- 6. Intentar eliminar manualmente paso a paso
-- Primero eliminar log_actividades_investigacion
DELETE FROM log_actividades_investigacion 
WHERE investigacion_id = '917e6fe5-22e7-4e99-b7d9-dec453aad389';

-- Luego eliminar seguimientos_investigacion
DELETE FROM seguimientos_investigacion 
WHERE investigacion_id = '917e6fe5-22e7-4e99-b7d9-dec453aad389';

-- Luego eliminar reclutamientos
DELETE FROM reclutamientos 
WHERE investigacion_id = '917e6fe5-22e7-4e99-b7d9-dec453aad389';

-- Finalmente eliminar la investigación
DELETE FROM investigaciones 
WHERE id = '917e6fe5-22e7-4e99-b7d9-dec453aad389'; 