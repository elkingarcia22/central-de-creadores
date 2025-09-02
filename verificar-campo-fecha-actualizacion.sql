-- ====================================
-- VERIFICAR CAMPO fecha_actualizacion
-- ====================================

-- 1. Verificar si el campo fecha_actualizacion existe
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'dolores_participantes' 
AND column_name = 'fecha_actualizacion';

-- 2. Verificar si el campo updated_at existe (por si acaso)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'dolores_participantes' 
AND column_name = 'updated_at';

-- 3. Verificar todos los campos de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'dolores_participantes'
ORDER BY ordinal_position;

-- 4. Verificar el trigger específico
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'dolores_participantes'
AND trigger_name LIKE '%fecha_actualizacion%';

-- 5. Verificar si la función existe
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'update_fecha_actualizacion_column';

-- 6. Probar una actualización manual para ver el error exacto
-- UPDATE dolores_participantes 
-- SET titulo = titulo 
-- WHERE id = '0800e5a1-34cb-4c92-b401-44102a2d7726';
