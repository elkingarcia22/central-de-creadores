-- Script para diagnosticar por qué los triggers no funcionan
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Verificar que los triggers existen y están activos
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN ('investigaciones', 'libretos_investigacion', 'seguimientos_investigacion')
ORDER BY event_object_table, trigger_name;

-- 2. Verificar que las funciones existen
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
    'trigger_log_cambios_investigacion',
    'trigger_creacion_libreto',
    'trigger_edicion_libreto',
    'trigger_creacion_seguimiento',
    'trigger_edicion_seguimiento'
);

-- 3. Verificar permisos RLS en la tabla log_actividades_investigacion
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'log_actividades_investigacion';

-- 4. Verificar políticas RLS en log_actividades_investigacion
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
WHERE tablename = 'log_actividades_investigacion';

-- 5. Probar inserción manual para verificar permisos
INSERT INTO log_actividades_investigacion (
    investigacion_id,
    tipo_actividad,
    descripcion,
    cambios,
    usuario_id,
    fecha_creacion
) VALUES (
    '12c5ce70-d6e0-422d-919c-7cc9b4867a48',
    'edicion',
    'Prueba manual - Trigger diagnostic',
    '{"test": "manual_insert"}',
    'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d',
    NOW()
);

-- 6. Verificar que se insertó correctamente
SELECT 
    id,
    investigacion_id,
    tipo_actividad,
    descripcion,
    fecha_creacion
FROM log_actividades_investigacion 
WHERE investigacion_id = '12c5ce70-d6e0-422d-919c-7cc9b4867a48'
ORDER BY fecha_creacion DESC
LIMIT 5;

-- 7. Verificar si hay RLS habilitado que esté bloqueando las inserciones
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('investigaciones', 'log_actividades_investigacion'); 