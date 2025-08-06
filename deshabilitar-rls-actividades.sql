-- Script para deshabilitar RLS en log_actividades_investigacion
-- Ejecuta esto si el diagnóstico muestra que RLS está bloqueando las inserciones

-- 1. Deshabilitar RLS en la tabla log_actividades_investigacion
ALTER TABLE log_actividades_investigacion DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que RLS está deshabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'log_actividades_investigacion';

-- 3. Probar inserción manual después de deshabilitar RLS
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
    'Prueba después de deshabilitar RLS',
    '{"test": "after_rls_disabled"}',
    'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d',
    NOW()
);

-- 4. Verificar que se insertó
SELECT 
    id,
    investigacion_id,
    tipo_actividad,
    descripcion,
    fecha_creacion
FROM log_actividades_investigacion 
WHERE investigacion_id = '12c5ce70-d6e0-422d-919c-7cc9b4867a48'
ORDER BY fecha_creacion DESC
LIMIT 3;

-- 5. Probar actualizar una investigación para verificar que el trigger funciona
UPDATE investigaciones 
SET nombre = nombre || ' (test trigger)'
WHERE id = '12c5ce70-d6e0-422d-919c-7cc9b4867a48';

-- 6. Verificar que se registró la actividad
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